"""
Sweep OpenStreetMap (via the public Overpass API) for PG/hostel/co-living
candidates, city by city -- no API key, no billing. This is the default
sourcing step until a GOOGLE_MAPS_API_KEY exists; google_places.py stays
available as a higher-yield option once that's set up (see README).

One bounding box, one request per city (not one per locality) -- Overpass's
own usage policy asks for a small number of large, well-formed queries rather
than many small ones, so that's the shape this takes: the bounding box comes
from the min/max lat/lng of every row in this city's sheet of
../data/India_10_Cities_Pincode_Reference_v2.xlsx (pincode_lookup.py), padded
a little so PGs just outside a post-office point aren't missed. Every element
Overpass returns is stored as-is in the `osm_raw` collection; results that
pass leads_schema.is_relevant_osm() are normalized into the same `leads`
collection google_places.py writes to (source="osm").

    python osm_places.py --city Vadodara --dry-run   # shows bbox + query, no network call
    python osm_places.py --city Vadodara

Coverage caveat: OSM's PG/hostel data in Indian cities comes from volunteer
mapping, so expect meaningfully fewer results than Google Places would give
for the same city -- this trades lead volume for zero cost and zero key setup.
"""
import argparse
import json
import os
import time

import requests

from db import get_leads_collection, get_osm_raw_collection
from leads_schema import is_relevant_osm, now_utc, to_lead_doc_osm
from pincode_lookup import load_city_rows, nearest_city, nearest_row

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
# Identifies this tool honestly, per Overpass's own etiquette guidelines --
# https://wiki.openstreetmap.org/wiki/Overpass_API#Introduction -- the
# opposite of hiding what's making the request.
USER_AGENT = "pg-near-me-co-in-data-pipeline/1.0 (PG/hostel lead sourcing; contact via repo)"

BBOX_PADDING_DEG = 0.03  # ~3km, so a PG just outside the outermost post office point isn't missed
QUERY_TIMEOUT_S = 60
REQUEST_TIMEOUT_S = 90
MAX_RETRIES = 3

CHECKPOINT_DIR = ".checkpoints"


def _bbox_for_city(city_rows, padding=BBOX_PADDING_DEG):
    """
    Min/max lat/lng across city_rows, padded. Relies on pincode_lookup.load_city_rows()
    to have already dropped rows whose lat/lng doesn't actually belong to this
    city -- see that function's docstring; without that filter a single bad
    row can turn a ~30km-wide city box into one spanning half of India.
    """
    lats = [r["lat"] for r in city_rows]
    lngs = [r["lng"] for r in city_rows]
    return (min(lats) - padding, min(lngs) - padding, max(lats) + padding, max(lngs) + padding)


def _build_query(bbox):
    south, west, north, east = bbox
    box = f"{south},{west},{north},{east}"
    # amenity=hostel / tourism=hostel / tourism=guest_house are cheap, indexed
    # tag lookups -- the closest OSM tags to a PG. The name-regex clause catches
    # PG-style places mappers didn't tag precisely, but it's an unindexed scan
    # over every matching element's name in the whole bbox, and it's expensive:
    # for a big, densely-mapped metro (Pune) the `way[name~...]` variant alone
    # measured timing out Overpass's own internal budget at 75-85s on retry,
    # every time -- not transient load, a real query-cost ceiling. Ways in a
    # dense city (building outlines, roads) vastly outnumber named nodes, so
    # only the node variant runs; \bPG\b (word boundary) avoids matching
    # "parking"/"upgrade" in what it does scan. leads_schema.is_relevant_osm()
    # is still applied after, as a second filter, same as the node case.
    return f"""
[out:json][timeout:{QUERY_TIMEOUT_S}];
(
  node["amenity"="hostel"]({box});
  way["amenity"="hostel"]({box});
  node["tourism"="hostel"]({box});
  way["tourism"="hostel"]({box});
  node["tourism"="guest_house"]({box});
  way["tourism"="guest_house"]({box});
  node["name"~"paying guest|\\\\bPG\\\\b|co-?living",i]({box});
);
out center;
""".strip()


def _load_checkpoint(city):
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    path = os.path.join(CHECKPOINT_DIR, f"osm_sweep.{city}.json")
    if os.path.exists(path):
        with open(path) as f:
            return path, json.load(f)
    return path, {"city": city, "last_swept_at": None}


def _save_checkpoint(path, state):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, path)


class OverpassSoftFailure(Exception):
    """Overpass answered 200 OK but with a `remark` instead of real results --
    almost always its own internal query timeout, not "there's nothing here".
    Distinct from a network/HTTP error so run() can tell the two apart and
    avoid marking a city "swept" off a response that isn't actually data."""


def _run_query(session, query):
    """
    The public Overpass instance is a shared, free resource -- a 429/502/503/504
    means "back off", not "fail fast", so retries here are patient (10s/30s/60s)
    rather than the few-second backoff elsewhere in this pipeline (that's fine
    for our own MongoDB or a paid, quota-based API; it's rude here).
    """
    last_exc = None
    for attempt in range(MAX_RETRIES):
        try:
            resp = session.post(OVERPASS_URL, data={"data": query}, timeout=REQUEST_TIMEOUT_S,
                                 headers={"User-Agent": USER_AGENT})
            if resp.status_code in (429, 502, 503, 504):
                wait = 10 * (3 ** attempt)  # 10s, 30s, 90s
                print(f"Overpass returned {resp.status_code} (busy/overloaded), waiting {wait}s before retry "
                      f"({attempt + 1}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            if data.get("remark") and not data.get("elements"):
                # Overpass's own [timeout:60] tripped internally -- it still answers
                # 200 with valid JSON, just no data. Silently treating this as "zero
                # PGs in this city" would be wrong and would falsely mark the city
                # swept for --resweep-days. Retry instead of accepting it as real.
                last_exc = OverpassSoftFailure(data["remark"])
                wait = 10 * (3 ** attempt)
                print(f"Overpass internal timeout: {data['remark']!r}, waiting {wait}s before retry "
                      f"({attempt + 1}/{MAX_RETRIES})...")
                time.sleep(wait)
                continue
            return data
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(10 * (attempt + 1))
    raise SystemExit(f"Overpass request failed after {MAX_RETRIES} attempts: {last_exc!r}. "
                      f"Not marking this city as swept -- re-run the same command later.")


def run(city, resweep_days=7, dry_run=False):
    city_rows = load_city_rows(city)
    bbox = _bbox_for_city(city_rows)
    query = _build_query(bbox)
    ckpt_path, state = _load_checkpoint(city)

    if dry_run:
        print(f"{city}: bounding box {bbox} from {len(city_rows)} pincode-reference rows.")
        print("Overpass query that would run:")
        print(query)
        if state["last_swept_at"]:
            age_days = (now_utc().timestamp() - state["last_swept_at"]) / 86400
            print(f"Last swept {age_days:.1f} days ago (--resweep-days {resweep_days}) -- "
                  + ("would run again." if age_days >= resweep_days else "would skip, still fresh."))
        return {"bbox": bbox}

    if state["last_swept_at"]:
        age_days = (now_utc().timestamp() - state["last_swept_at"]) / 86400
        if age_days < resweep_days:
            print(f"{city} was swept {age_days:.1f} days ago, within --resweep-days {resweep_days}. "
                  f"Nothing to do (pass a smaller --resweep-days to force a re-sweep).")
            return {"skipped": True}

    session = requests.Session()
    data = _run_query(session, query)
    elements = data.get("elements", [])

    raw_coll = get_osm_raw_collection()
    leads_coll = get_leads_collection()

    # Neighboring pilot cities' search areas overlap (Ahmedabad<->Gandhinagar
    # 22km apart, Gurugram<->Noida 36km) -- an element found while sweeping
    # `city` might actually sit closer to a different pilot city. Label and
    # locality/pincode-match it against whichever city it's really closest to,
    # not the city this sweep happened to target, or a later overlapping
    # sweep would silently relabel (steal) it. city_rows_cache avoids
    # re-reading the reference file for every element that needs another
    # city's rows.
    city_rows_cache = {city: city_rows}

    def _rows_for(c):
        if c not in city_rows_cache:
            city_rows_cache[c] = load_city_rows(c)
        return city_rows_cache[c]

    raw_upserts, leads_upserts, skipped_irrelevant = 0, 0, 0
    for el in elements:
        osm_id = f"osm_{el.get('type')}_{el.get('id')}"
        now = now_utc()

        lat, lng = el.get("lat"), el.get("lon")
        if lat is None:
            center = el.get("center") or {}
            lat, lng = center.get("lat"), center.get("lon")
        true_city = nearest_city(lat, lng) or city

        raw_coll.update_one(
            {"osm_id": osm_id},
            {"$set": {**el, "osm_id": osm_id, "city": true_city, "swept_at": now},
             "$setOnInsert": {"first_seen_at": now}},
            upsert=True,
        )
        raw_upserts += 1

        if not is_relevant_osm(el):
            skipped_irrelevant += 1
            continue

        nearest = nearest_row(lat, lng, _rows_for(true_city))
        lead = to_lead_doc_osm(
            el, city_hint=true_city,
            locality=nearest["locality"] if nearest else None,
            pincode=nearest["pincode"] if nearest else None,
            query_used="overpass_bbox_sweep",
        )
        leads_coll.update_one(
            {"place_id": lead["place_id"]},
            {"$set": {**lead, "last_seen_at": now},
             "$setOnInsert": {"first_seen_at": now}},
            upsert=True,
        )
        leads_upserts += 1

    state["last_swept_at"] = now_utc().timestamp()
    _save_checkpoint(ckpt_path, state)

    print(f"DONE. elements={len(elements)} raw_upserted={raw_upserts} "
          f"leads_upserted={leads_upserts} skipped_irrelevant={skipped_irrelevant}")
    return {
        "elements": len(elements), "raw_upserted": raw_upserts,
        "leads_upserted": leads_upserts, "skipped_irrelevant": skipped_irrelevant,
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", required=True, help="must match a sheet name in the pincode reference file")
    ap.add_argument("--resweep-days", type=int, default=7,
                     help="skip this city if it was swept more recently than this (OSM data changes "
                          "slowly and re-sweeping is free, but there's no reason to hammer the public "
                          "Overpass instance daily for a city that hasn't moved)")
    ap.add_argument("--dry-run", action="store_true", help="print the bbox + query, make zero network calls")
    args = ap.parse_args()
    run(args.city, args.resweep_days, args.dry_run)

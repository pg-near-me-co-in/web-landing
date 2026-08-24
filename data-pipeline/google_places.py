"""
Sweep Google Places for PG/hostel/paying-guest candidates, city by city, using
India_10_Cities_Pincode_Reference_v2.xlsx (pincode_lookup.py) as the list of
localities to search and the raw material to backfill a clean locality/pincode
onto each result.

Every raw API response is stored as-is in the `places_raw` collection (the
audit trail / cache -- nothing is thrown away before it's stored). Results
that pass leads_schema.is_relevant() are normalized and upserted into the
`leads` collection -- a call list for a field agent, NOT the validated
`listings` collection. See README.md: "How a lead becomes a real listing".

    export GOOGLE_MAPS_API_KEY="your-key-here"

    python google_places.py --city Vadodara --dry-run     # no network calls, just the plan
    python google_places.py --city Vadodara --max-calls 200
    python google_places.py --city Vadodara --max-calls 200 --with-phone

Google bills Places per call, so:
  --dry-run counts what a real run would spend before you spend it.
  --max-calls is a hard stop on total HTTP calls (search + details combined).
  Localities swept in the last --resweep-days (default 30) are skipped, so a
  re-run doesn't re-pay for ground already covered.
"""
import argparse
import hashlib
import json
import os
import time

import requests

from db import get_leads_collection, get_places_raw_collection
from leads_schema import is_relevant, now_utc, to_lead_doc
from pincode_lookup import load_city_rows, nearest_city, nearest_row

TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
SEARCH_RADIUS_M = 2000

QUERY_TEMPLATES = [
    "PG near {locality}, {city}",
    "hostel near {locality}, {city}",
    "paying guest accommodation near {locality}, {city}",
]

CHECKPOINT_DIR = ".checkpoints"
RETRYABLE_STATUSES = {"OVER_QUERY_LIMIT", "UNKNOWN_ERROR"}
MAX_RETRIES = 5


def _locality_key(row):
    return hashlib.sha1(f"{row['pincode']}|{row['locality']}".encode("utf-8")).hexdigest()[:16]


def _load_checkpoint(city):
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    path = os.path.join(CHECKPOINT_DIR, f"places_sweep.{city}.json")
    if os.path.exists(path):
        with open(path) as f:
            return path, json.load(f)
    return path, {"city": city, "swept": {}}


def _save_checkpoint(path, state):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, path)


def _pending_rows(city_rows, state, resweep_days):
    cutoff = now_utc().timestamp() - resweep_days * 86400
    pending = []
    for row in city_rows:
        key = _locality_key(row)
        swept_at = state["swept"].get(key)
        if swept_at is None or swept_at < cutoff:
            pending.append(row)
    return pending


def _get_with_backoff(session, url, params):
    """One HTTP GET, retrying on Places' own rate-limit/transient statuses (not on 4xx that mean a bad request)."""
    for attempt in range(MAX_RETRIES):
        resp = session.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status")
        if status not in RETRYABLE_STATUSES:
            return data
        time.sleep(2 ** attempt)
    return data  # give up after MAX_RETRIES, return whatever the last attempt had


def _text_search(session, api_key, query, lat, lng):
    params = {"query": query, "location": f"{lat},{lng}", "radius": SEARCH_RADIUS_M, "key": api_key}
    return _get_with_backoff(session, TEXT_SEARCH_URL, params)


def _place_details(session, api_key, place_id):
    params = {"place_id": place_id, "fields": "international_phone_number,formatted_phone_number", "key": api_key}
    return _get_with_backoff(session, DETAILS_URL, params)


def run(city, max_calls=300, with_phone=False, resweep_days=30, dry_run=False, api_key=None):
    city_rows = load_city_rows(city)
    ckpt_path, state = _load_checkpoint(city)
    pending = _pending_rows(city_rows, state, resweep_days)

    planned_search_calls = min(len(pending) * len(QUERY_TEMPLATES), max_calls)
    if dry_run:
        print(f"{city}: {len(city_rows)} localities in the pincode reference, "
              f"{len(pending)} not swept in the last {resweep_days} days.")
        print(f"Would make up to {planned_search_calls} Text Search calls this run "
              f"({len(QUERY_TEMPLATES)} query variants/locality, capped by --max-calls {max_calls})"
              + (", plus one Place Details call per unique place found (--with-phone)." if with_phone else "."))
        print("Check current Places pricing before running for real: "
              "https://mapsplatform.google.com/pricing/")
        return {"planned_calls": planned_search_calls}

    if not api_key:
        raise SystemExit("GOOGLE_MAPS_API_KEY not set. export it first, or pass --dry-run to plan without spending.")

    raw_coll = get_places_raw_collection()
    leads_coll = get_leads_collection()
    session = requests.Session()

    calls_made = 0
    places_seen = {}  # place_id -> raw place dict, deduped within this run
    query_used_by_place = {}

    for row in pending:
        if calls_made >= max_calls:
            print(f"hit --max-calls {max_calls}, stopping sweep with localities left unswept.")
            break
        locality_new_places = 0
        for template in QUERY_TEMPLATES:
            if calls_made >= max_calls:
                break
            query = template.format(locality=row["locality"], city=city)
            data = _text_search(session, api_key, query, row["lat"], row["lng"])
            calls_made += 1
            for place in data.get("results", []):
                place_id = place.get("place_id")
                if not place_id:
                    continue
                if place_id not in places_seen:
                    locality_new_places += 1
                places_seen[place_id] = place
                query_used_by_place.setdefault(place_id, query)

        key = _locality_key(row)
        state["swept"][key] = now_utc().timestamp()
        _save_checkpoint(ckpt_path, state)
        print(f"{row['locality']} ({row['pincode']}): {locality_new_places} new place(s) seen, "
              f"{calls_made}/{max_calls} calls used so far")

    if with_phone:
        place_ids = list(places_seen)
        for i, place_id in enumerate(place_ids):
            if calls_made >= max_calls:
                print(f"hit --max-calls {max_calls} during Place Details lookups, "
                      f"{len(place_ids) - i} place(s) left without phone.")
                break
            details = _place_details(session, api_key, place_id)
            result = details.get("result", {})
            places_seen[place_id].update({
                "international_phone_number": result.get("international_phone_number"),
                "formatted_phone_number": result.get("formatted_phone_number"),
            })
            calls_made += 1

    # Same reasoning as osm_places.py: neighboring pilot cities' search areas
    # can overlap, so label each place by whichever city it's actually
    # closest to, not the city this sweep targeted.
    city_rows_cache = {city: city_rows}

    def _rows_for(c):
        if c not in city_rows_cache:
            city_rows_cache[c] = load_city_rows(c)
        return city_rows_cache[c]

    raw_upserts, leads_upserts, skipped_irrelevant = 0, 0, 0
    for place_id, place in places_seen.items():
        now = now_utc()
        loc = (place.get("geometry") or {}).get("location") or {}
        true_city = nearest_city(loc.get("lat"), loc.get("lng")) or city

        raw_coll.update_one(
            {"place_id": place_id},
            {"$set": {**place, "place_id": place_id, "city": true_city, "swept_at": now},
             "$setOnInsert": {"first_seen_at": now}},
            upsert=True,
        )
        raw_upserts += 1

        if not is_relevant(place):
            skipped_irrelevant += 1
            continue

        nearest = nearest_row(loc.get("lat"), loc.get("lng"), _rows_for(true_city))
        lead = to_lead_doc(
            place, city_hint=true_city,
            locality=nearest["locality"] if nearest else None,
            pincode=nearest["pincode"] if nearest else None,
            query_used=query_used_by_place.get(place_id),
        )
        leads_coll.update_one(
            {"place_id": place_id},
            {"$set": {**lead, "last_seen_at": now},
             "$setOnInsert": {"first_seen_at": now}},
            upsert=True,
        )
        leads_upserts += 1

    print(f"DONE. calls_made={calls_made} places_seen={len(places_seen)} "
          f"raw_upserted={raw_upserts} leads_upserted={leads_upserts} "
          f"skipped_irrelevant={skipped_irrelevant}")
    return {
        "calls_made": calls_made, "places_seen": len(places_seen),
        "raw_upserted": raw_upserts, "leads_upserted": leads_upserts,
        "skipped_irrelevant": skipped_irrelevant,
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", required=True, help="must match a sheet name in the pincode reference file")
    ap.add_argument("--max-calls", type=int, default=300)
    ap.add_argument("--with-phone", action="store_true",
                     help="spend one extra Place Details call per unique place to fetch its phone number")
    ap.add_argument("--resweep-days", type=int, default=30,
                     help="skip localities already swept within this many days")
    ap.add_argument("--dry-run", action="store_true", help="print the plan, make zero API calls")
    args = ap.parse_args()
    run(args.city, args.max_calls, args.with_phone, args.resweep_days, args.dry_run,
        api_key=os.environ.get("GOOGLE_MAPS_API_KEY"))

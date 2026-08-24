"""
Field shape and relevance filter for PG/Flat candidates sourced automatically
(Google Places, OpenStreetMap) rather than typed in by a human.

Kept separate from schema.py (which governs *confirmed* listings) because a
lead is a genuinely different document -- nothing here is required to have a
price, gender policy, or real availability. A lead only becomes a row in
schema.py's world once a human calls/visits and fills the real intake sheet
(see README: "How a lead becomes a real listing").

Dedup for leads doesn't need a computed key like schema.dedup_key -- every
source already has a stable, globally unique id for the place (Google's
place_id, or "osm_<type>_<id>" here), so db.get_leads_collection()'s unique
index is just on the `place_id` field directly -- it doubles as a generic
external-id regardless of which source wrote it.
"""
from datetime import datetime, timezone

# Cheap keyword filter, not a classifier: a Places text search for "PG near X",
# or an OSM name-regex match, both still surface hotels, colleges, and other
# unrelated points of interest. False positives just mean an extra row a human
# skips in five seconds; false negatives are the real risk -- widen this list
# if a known PG keeps getting dropped.
RELEVANCE_KEYWORDS = (
    "pg", "paying guest", "hostel", "boys hostel", "girls hostel",
    "co-living", "co living", "coliving", "ladies hostel", "gents hostel",
)

# Bare "pg" is ambiguous in India -- "PG College", "PG Diploma", "PG Coaching"
# all contain it as a standalone word. Only trust a bare "pg" match (nothing
# else in RELEVANCE_KEYWORDS also hit) when none of these show up alongside it.
EDU_FALSE_POSITIVE_WORDS = ("college", "university", "institute", "diploma", "coaching", "academy", "course")

STATUS_LEAD_NEW = "lead_new"
STATUS_LEAD_CONTACTED = "lead_contacted"
STATUS_LEAD_CONVERTED = "lead_converted"
STATUS_LEAD_REJECTED = "lead_rejected"


def now_utc():
    return datetime.now(timezone.utc)


def is_relevant(place):
    """True if a result's name/types read as an actual PG/hostel/co-living."""
    haystack = " ".join([
        str(place.get("name", "")),
        " ".join(place.get("types", []) or []),
    ]).lower()
    if "hotel" in haystack and "hostel" not in haystack:
        return False
    matched = [kw for kw in RELEVANCE_KEYWORDS if kw in haystack]
    if not matched:
        return False
    if matched == ["pg"] and any(w in haystack for w in EDU_FALSE_POSITIVE_WORDS):
        return False
    return True


def to_lead_doc(place, city_hint, locality=None, pincode=None, query_used=None):
    """Turn one raw Google Places API result into the `leads` collection document shape."""
    loc = (place.get("geometry") or {}).get("location") or {}
    place_id = place.get("place_id")
    return {
        "place_id": place_id,
        "name": str(place.get("name", "")).strip(),
        "formatted_address": str(place.get("formatted_address", "")).strip(),
        "lat": loc.get("lat"),
        "lng": loc.get("lng"),
        "city": city_hint,
        "locality": locality,
        "pincode": pincode,
        "phone": place.get("international_phone_number") or place.get("formatted_phone_number") or None,
        "rating": place.get("rating"),
        "maps_url": f"https://www.google.com/maps/place/?q=place_id:{place_id}" if place_id else None,
        "source": "google_places",
        "query_used": query_used,
        "status": STATUS_LEAD_NEW,
        "raw_types": place.get("types", []) or [],
    }


def _osm_lat_lng(element):
    if "lat" in element and "lon" in element:
        return element["lat"], element["lon"]
    center = element.get("center") or {}
    return center.get("lat"), center.get("lon")


def _osm_address(tags):
    parts = [
        tags.get("addr:housenumber"), tags.get("addr:street"),
        tags.get("addr:suburb") or tags.get("addr:place"),
        tags.get("addr:city"), tags.get("addr:postcode"),
    ]
    return ", ".join(p for p in parts if p)


def is_relevant_osm(element):
    """Same relevance filter as is_relevant(), adapted for a raw OSM/Overpass element's tag shape."""
    tags = element.get("tags", {}) or {}
    place_like = {
        "name": tags.get("name") or tags.get("name:en") or "",
        "types": [t for t in (tags.get("amenity"), tags.get("tourism")) if t],
    }
    return is_relevant(place_like)


def to_lead_doc_osm(element, city_hint, locality=None, pincode=None, query_used=None):
    """Turn one raw OSM/Overpass element into the same `leads` collection document shape as to_lead_doc()."""
    tags = element.get("tags", {}) or {}
    lat, lng = _osm_lat_lng(element)
    osm_id = f"osm_{element.get('type')}_{element.get('id')}"
    return {
        "place_id": osm_id,
        "name": str(tags.get("name") or tags.get("name:en") or "").strip(),
        "formatted_address": _osm_address(tags),
        "lat": lat,
        "lng": lng,
        "city": city_hint,
        "locality": locality,
        "pincode": pincode or tags.get("addr:postcode"),
        "phone": tags.get("phone") or tags.get("contact:phone") or None,
        "rating": None,
        "maps_url": f"https://www.openstreetmap.org/{element.get('type')}/{element.get('id')}",
        "source": "osm",
        "query_used": query_used,
        "status": STATUS_LEAD_NEW,
        "raw_types": [t for t in (tags.get("amenity"), tags.get("tourism")) if t],
    }

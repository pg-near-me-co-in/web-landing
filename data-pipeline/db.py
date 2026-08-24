"""
MongoDB connection helper.

Set MONGODB_URI in the environment before running any script, e.g.:

    export MONGODB_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"

For local dev against a MongoDB running on your own machine, the default
below (mongodb://localhost:27017) just works if you leave MONGODB_URI unset.

Every script in this pipeline gets its collection through get_listings_collection()
so the unique dedup index is guaranteed to exist no matter which script runs first.

Two more collections back the Google Places sourcing step (see google_places.py):
get_places_raw_collection() is the untouched API response cache/audit trail,
get_leads_collection() is the normalized candidate list a field agent works
from. Neither is the validated `listings` collection above -- a lead only
lands there once a human confirms it through the normal intake flow.
"""
import os

import pymongo

DEFAULT_URI = "mongodb://localhost:27017"
DB_NAME = os.environ.get("MONGODB_DB", "pg_rental")
COLLECTION_NAME = "listings"


def get_client():
    uri = os.environ.get("MONGODB_URI", DEFAULT_URI)
    return pymongo.MongoClient(uri)


def get_listings_collection(client=None):
    client = client or get_client()
    db = client[DB_NAME]
    coll = db[COLLECTION_NAME]
    # Unique index on dedup_key is what actually prevents duplicates —
    # even if two ingest runs overlap or a checkpoint is lost, Mongo itself
    # will refuse a second document with the same dedup_key.
    coll.create_index("dedup_key", unique=True)
    coll.create_index("address.city")
    coll.create_index("address.pincode")
    coll.create_index([("address.lat", pymongo.ASCENDING), ("address.lng", pymongo.ASCENDING)])
    coll.create_index("status")
    coll.create_index("updated_at")
    return coll


def get_places_raw_collection(client=None):
    client = client or get_client()
    db = client[DB_NAME]
    coll = db["places_raw"]
    coll.create_index("place_id", unique=True)
    coll.create_index("city")
    coll.create_index("swept_at")
    return coll


def get_osm_raw_collection(client=None):
    client = client or get_client()
    db = client[DB_NAME]
    coll = db["osm_raw"]
    coll.create_index("osm_id", unique=True)
    coll.create_index("city")
    coll.create_index("swept_at")
    return coll


def get_leads_collection(client=None):
    client = client or get_client()
    db = client[DB_NAME]
    coll = db["leads"]
    coll.create_index("place_id", unique=True)
    coll.create_index("city")
    coll.create_index("status")
    return coll

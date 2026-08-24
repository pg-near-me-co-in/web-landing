"""
Patch one listing by hand — for a support agent fixing a typo, or a phone call
that confirms a price change on the spot.

    python update_single_listing.py --key <dedup_key> --set price_monthly=13000 availability_status=Occupied
    python update_single_listing.py --id 65f1... --set availability_status=Available --verify

--verify also stamps last_verified_at=now and verified=true — use it whenever
the update came from actually confirming the listing with the owner (a call,
a WhatsApp reply, a field-agent revisit), not from an unconfirmed edit.

Nested address fields use dot notation: --set address.locality="Koramangala"
"""
import argparse
from datetime import datetime

from bson import ObjectId

from db import get_listings_collection
from schema import now_utc, coerce_value


def parse_kv(pairs):
    out = {}
    for p in pairs:
        if "=" not in p:
            raise SystemExit(f"--set expects field=value, got: {p}")
        k, v = p.split("=", 1)
        out[k.strip()] = coerce_value(v)
    return out


def main():
    ap = argparse.ArgumentParser()
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--key", help="dedup_key of the listing")
    group.add_argument("--id", help="MongoDB _id of the listing")
    ap.add_argument("--set", nargs="+", required=True, metavar="field=value")
    ap.add_argument("--verify", action="store_true",
                     help="also mark verified=true and stamp last_verified_at=now")
    args = ap.parse_args()

    updates = parse_kv(args.set)
    updates["updated_at"] = now_utc()
    if args.verify:
        updates["verified"] = True
        updates["last_verified_at"] = now_utc()

    coll = get_listings_collection()
    query = {"dedup_key": args.key} if args.key else {"_id": ObjectId(args.id)}
    result = coll.update_one(query, {"$set": updates})

    if result.matched_count == 0:
        raise SystemExit(f"No listing matched {query}. Nothing changed.")
    print(f"Updated {result.modified_count} field-set(s) on 1 listing: {updates}")


if __name__ == "__main__":
    main()

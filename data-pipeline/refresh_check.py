"""
Freshness sweep — run this daily/weekly (cron, or a scheduled task).

Any 'active' listing that has never been verified, or was last verified more
than --stale-days ago, gets flipped to status='needs_review' and dropped into
a CSV so your team (or a WhatsApp "still available?" bot) knows exactly who
to re-check. This is what keeps the site from filling up with dead listings.

    python refresh_check.py                  # 30-day threshold, default
    python refresh_check.py --stale-days 14
    python refresh_check.py --dry-run         # just report, don't change status
"""
import argparse
import csv
from datetime import timedelta

from db import get_listings_collection
from schema import now_utc, STATUS_ACTIVE, STATUS_NEEDS_REVIEW


def run(stale_days=30, dry_run=False, out_path="listings_to_recheck.csv"):
    coll = get_listings_collection()
    cutoff = now_utc() - timedelta(days=stale_days)

    query = {
        "status": STATUS_ACTIVE,
        "$or": [
            {"last_verified_at": None},
            {"last_verified_at": {"$lt": cutoff}},
        ],
    }
    stale = list(coll.find(query))

    if not dry_run and stale:
        coll.update_many(
            {"_id": {"$in": [d["_id"] for d in stale]}},
            {"$set": {"status": STATUS_NEEDS_REVIEW, "updated_at": now_utc()}},
        )

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["dedup_key", "title", "city", "locality", "contact_number",
                    "whatsapp_number", "last_verified_at", "price_monthly"])
        for d in stale:
            w.writerow([
                d.get("dedup_key"), d.get("title"),
                d.get("address", {}).get("city"), d.get("address", {}).get("locality"),
                d.get("contact_number"), d.get("whatsapp_number"),
                d.get("last_verified_at"), d.get("price_monthly"),
            ])

    action = "would flag" if dry_run else "flagged"
    print(f"{action} {len(stale)} listings as needs_review (stale >{stale_days} days). "
          f"List written to {out_path}.")
    return stale


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--stale-days", type=int, default=30)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--out", default="listings_to_recheck.csv")
    args = ap.parse_args()
    run(args.stale_days, args.dry_run, args.out)

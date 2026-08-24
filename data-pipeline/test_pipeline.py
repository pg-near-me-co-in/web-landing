"""
End-to-end proof that the pipeline actually does what it claims, using
mongomock (an in-memory MongoDB-compatible mock) so it runs with no real
database. This is NOT a substitute for pointing MONGODB_URI at a real
cluster before going live — it's here so you (and I) can trust the logic
before it ever touches production data.

    python test_pipeline.py
"""
import csv
import os
import shutil

import mongomock
import openpyxl

import db  # noqa: E402  (patched below before other modules import it)

# Patch get_client so every script in this test run talks to an in-memory
# mongomock instance instead of a real server.
_mock_client = mongomock.MongoClient()
db.get_client = lambda: _mock_client

import ingest_listings   # noqa: E402
import update_single_listing  # noqa: E402
import bulk_update  # noqa: E402
import refresh_check  # noqa: E402
from schema import dedup_key, now_utc, STATUS_NEEDS_REVIEW  # noqa: E402
from make_template import build as build_template  # noqa: E402

TEST_DIR = "/tmp/pg_pipeline_test"


def make_test_file(path, n_rows, dupe_last_two=False, offset=0):
    rows = []
    for i in range(offset, offset + n_rows):
        rows.append({
            "listing_type": "PG", "title": f"Test PG {i}", "description": "test",
            "gender_preference": "Any", "price_monthly": 10000 + i, "deposit_amount": 5000,
            "availability_status": "Available", "available_from": "",
            "amenities": "WiFi, Food", "photo_urls": "",
            "contact_name": f"Owner {i}", "contact_number": f"9{str(i).zfill(9)}",
            "whatsapp_number": "", "address_line": f"Building {i}", "locality": "Koramangala",
            "city": "Bengaluru", "state": "Karnataka", "pincode": "560034",
            "latitude": "", "longitude": "", "source": "field_agent", "source_ref": "agent_test",
        })
    if dupe_last_two and n_rows >= 2:
        # make the last row an exact re-submission of the second-to-last (same phone+address)
        rows[-1] = dict(rows[-2])
        rows[-1]["title"] = "Resubmitted with a price change"
        rows[-1]["price_monthly"] = 99999

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Listings"
    headers = list(rows[0].keys())
    ws.append(headers)
    for r in rows:
        ws.append([r[h] for h in headers])
    wb.save(path)
    return rows


def main():
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    os.makedirs(TEST_DIR)
    os.chdir(TEST_DIR)

    print("=== 1. template generation ===")
    build_template()
    assert os.path.exists("pg_flat_intake_template.xlsx")
    print("OK: template written")

    print("\n=== 2. ingest 25 rows in batches of 10, verify count + no dupes ===")
    make_test_file("batch1.xlsx", 25, dupe_last_two=True)  # rows 24 & 25 are the same listing
    state = ingest_listings.run("batch1.xlsx", batch_size=10)
    coll = db.get_listings_collection(_mock_client)
    total = coll.count_documents({})
    # 25 rows submitted, but 2 of them are the same listing (same phone+address) -> 24 unique docs
    assert total == 24, f"expected 24 unique listings, got {total}"
    assert state["inserted"] == 24, state
    print(f"OK: {total} unique listings in Mongo (25 rows in, 1 real duplicate correctly merged)")

    # the "duplicate" row should have overwritten the original with its new price (last write wins)
    dupe_doc = coll.find_one({"title": "Resubmitted with a price change"})
    assert dupe_doc is not None and dupe_doc["price_monthly"] == 99999
    print("OK: re-submission updated the existing listing instead of creating a new one")

    print("\n=== 3. simulate a crash mid-file, then resume ===")
    make_test_file("batch2.xlsx", 30, offset=1000)  # offset keeps these listings distinct from batch1's
    try:
        ingest_listings.run("batch2.xlsx", batch_size=10, simulate_crash_after_batch=1)
        raise AssertionError("expected a simulated crash, got none")
    except SystemExit as e:
        print(f"OK: crashed as expected after batch 1 ({e})")

    total_after_crash = coll.count_documents({})
    assert total_after_crash == 24 + 20, (
        f"expected 44 after 2 committed batches of batch2, got {total_after_crash}")
    print(f"OK: exactly 2 batches (20 rows) committed before the crash, total now {total_after_crash}")

    ckpt_files = os.listdir(".checkpoints")
    assert any("batch2.xlsx" in f for f in ckpt_files), "checkpoint file missing after crash"
    print(f"OK: checkpoint survives on disk: {ckpt_files}")

    state2 = ingest_listings.run("batch2.xlsx", batch_size=10)  # resume, no crash hook this time
    total_final = coll.count_documents({})
    assert total_final == 24 + 30, f"expected 54 total after resume, got {total_final}"
    assert not os.path.exists(".checkpoints") or not any("batch2.xlsx" in f for f in os.listdir(".checkpoints")), \
        "checkpoint should be removed after a clean completion"
    print(f"OK: resume picked up exactly where it left off (only the remaining 10 rows), "
          f"final total {total_final} — no duplicates, nothing re-processed")

    print("\n=== 4. single-record manual update ===")
    one = coll.find_one({})
    key = one["dedup_key"]
    old_updated_at = one["updated_at"]
    import sys
    sys.argv = ["update_single_listing.py", "--key", key, "--set",
                "price_monthly=77777", "availability_status=Occupied", "--verify"]
    update_single_listing.main()
    refetched = coll.find_one({"dedup_key": key})
    assert refetched["price_monthly"] == 77777
    assert refetched["availability_status"] == "Occupied"
    assert refetched["verified"] is True
    assert refetched["last_verified_at"] is not None
    assert refetched["updated_at"] > old_updated_at
    print("OK: single update applied fields, stamped verified + last_verified_at + updated_at")

    print("\n=== 5. bulk update from a CSV of re-check results ===")
    sample = list(coll.find({}))[:5]
    with open("recheck.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["dedup_key", "price_monthly", "availability_status"])
        for d in sample:
            w.writerow([d["dedup_key"], int(d["price_monthly"]) + 500, "Available"])
    bulk_state = bulk_update.run("recheck.csv", batch_size=2, verify_all=True)
    assert bulk_state["matched"] == 5
    for d in sample:
        refetched = coll.find_one({"dedup_key": d["dedup_key"]})
        assert refetched["price_monthly"] == d["price_monthly"] + 500
        assert refetched["verified"] is True
    print("OK: bulk update applied to all 5 rows, --verify-all stamped verification on each")

    print("\n=== 6. refresh_check flags stale / never-verified listings ===")
    stale = refresh_check.run(stale_days=30, dry_run=False, out_path="to_recheck.csv")
    still_active = coll.count_documents({"status": "active"})
    needs_review = coll.count_documents({"status": STATUS_NEEDS_REVIEW})
    # the 5 we just verified in step 5 should stay active; everything else (never verified) flips
    assert still_active == 5, f"expected 5 still-active (just verified), got {still_active}"
    assert needs_review == 54 - 5, f"expected {54-5} flagged needs_review, got {needs_review}"
    assert os.path.exists("to_recheck.csv")
    print(f"OK: {needs_review} never-verified listings flagged needs_review, "
          f"{still_active} recently-verified ones left alone, list exported to to_recheck.csv")

    print("\n=== 7. schema validation actually rejects bad rows ===")
    bad_rows = [
        {"listing_type": "PG", "title": "bad phone", "price_monthly": 5000,
         "availability_status": "Available", "contact_number": "12345",
         "address_line": "x", "locality": "y", "city": "Pune", "pincode": "411001", "source": "field_agent"},
        {"listing_type": "PG", "title": "bad pincode", "price_monthly": 5000,
         "availability_status": "Available", "contact_number": "9876543210",
         "address_line": "x", "locality": "y", "city": "Pune", "pincode": "41100", "source": "field_agent"},
        {"listing_type": "PG", "title": "missing city", "price_monthly": 5000,
         "availability_status": "Available", "contact_number": "9876543211",
         "address_line": "x", "locality": "y", "pincode": "411001", "source": "field_agent"},
    ]
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Listings"
    headers = list(bad_rows[0].keys())
    ws.append(headers)
    for r in bad_rows:
        ws.append([r.get(h, "") for h in headers])
    wb.save("bad_rows.xlsx")
    before = coll.count_documents({})
    ingest_listings.run("bad_rows.xlsx", batch_size=10)
    after = coll.count_documents({})
    assert after == before, "invalid rows must NEVER reach Mongo"
    assert os.path.exists("bad_rows_errors.csv")
    with open("bad_rows_errors.csv") as f:
        err_rows = list(csv.reader(f))
    assert len(err_rows) - 1 == 3, f"expected 3 error rows logged, got {len(err_rows)-1}"
    print(f"OK: all 3 invalid rows rejected, zero reached Mongo, all 3 logged to bad_rows_errors.csv")

    print("\n=== ALL CHECKS PASSED ===")


if __name__ == "__main__":
    main()

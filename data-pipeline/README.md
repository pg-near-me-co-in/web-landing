# PG/Flat listings pipeline

Six files. Every field/rule lives in `schema.py` — everything else imports from it,
so there's exactly one place to change if you add a column later.

| File | Purpose |
|---|---|
| `schema.py` | Field list, validation rules, dedup logic — the single source of truth |
| `db.py` | MongoDB connection + indexes |
| `make_template.py` | Generates `pg_flat_intake_template.xlsx` — the fill-in sheet |
| `ingest_listings.py` | Loads a filled-in sheet into MongoDB — batched, resumable, deduped |
| `update_single_listing.py` | Patch one listing by hand |
| `bulk_update.py` | Apply many updates at once from a spreadsheet |
| `refresh_check.py` | Flags stale listings, exports a re-check list — run this on a schedule |
| `test_pipeline.py` | Proves the above with an in-memory Mongo — no real DB needed to run it |

## 1. Set up MongoDB (free tier is enough to start)

1. Go to mongodb.com/cloud/atlas/register, create a free account.
2. Create a free "M0" cluster (512MB — plenty for tens of thousands of listings with photos stored elsewhere, e.g. S3/Cloudinary, not inline).
3. Database Access → add a user with a password. Network Access → allow your server's IP (or 0.0.0.0/0 while developing, tighten it before launch).
4. Copy the connection string, then:

   ```bash
   export MONGODB_URI="mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
   ```

   Leave it unset and everything defaults to `mongodb://localhost:27017` for local dev.

## 2. Install and test

```bash
pip install -r requirements.txt
python test_pipeline.py     # runs entirely in-memory, touches no real database
```

You should see `=== ALL CHECKS PASSED ===` at the end. If MongoDB is genuinely
reachable via MONGODB_URI, you can also smoke-test against it for real —
everything below talks to whatever MONGODB_URI points at.

## 3. Day-to-day use

```bash
# generate the intake sheet once, hand copies to field agents / use for self-listing exports
python make_template.py

# ingest a filled-in batch (safe to re-run after a crash — it resumes)
python ingest_listings.py pune_batch1.xlsx

# fix one listing by hand
python update_single_listing.py --key <dedup_key> --set price_monthly=13500 --verify

# apply a spreadsheet of updates (e.g. a field agent's re-check results)
python bulk_update.py recheck_results.xlsx --verify-all

# run weekly (cron / a scheduled task) to keep the site honest
python refresh_check.py --stale-days 30
```

## How duplicates are actually prevented

Two independent layers, not one:

1. **`dedup_key`** (in `schema.py`) is computed from `phone + pincode + locality + address_line`. Same owner phone in the same area = same listing, even if submitted twice from different forms.
2. **A unique index on `dedup_key`** exists in MongoDB itself (set up automatically by `db.py`). Even if the checkpoint file were lost, or two ingest runs overlapped, Mongo refuses a second document with the same key — it updates the existing one instead (`update_one(..., upsert=True)`).

The checkpoint file (`.checkpoints/`) exists purely for speed on a resume — so a
10,000-row file that crashed at row 8,000 picks back up near row 8,000 instead
of re-validating and re-upserting the first 8,000 rows for nothing. Correctness
doesn't depend on the checkpoint being right; the unique index guarantees that
part either way.

## What this does NOT do

- It does not scrape or geocode anything by itself yet. `latitude`/`longitude`
  are left blank in the intake sheet on purpose — wire in Google's Geocoding
  API or OSM Nominatim inside `to_mongo_doc()`'s caller (or as a pass over
  `ingest_listings.py` after each batch) once you've picked one; both need a
  real internet connection this sandbox doesn't have, so that part has to be
  wired up and tested on your own machine/server, not here.
- It does not touch 99acres/MagicBricks/NoBroker/Housing.com — see the earlier
  conversation for why. Its input is your own intake sheet, fed by owner
  self-listing or field agents.

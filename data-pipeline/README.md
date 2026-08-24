# PG/Flat listings pipeline

Every field/rule for a *confirmed* listing lives in `schema.py` — everything
else imports from it, so there's exactly one place to change if you add a
column later. Candidate leads (see below) have their own, deliberately looser
shape in `leads_schema.py`.

| File | Purpose |
|---|---|
| `schema.py` | Field list, validation rules, dedup logic for confirmed listings — the single source of truth |
| `db.py` | MongoDB connection + indexes (listings, places_raw, leads) |
| `make_template.py` | Generates `pg_flat_intake_template.xlsx` — the fill-in sheet |
| `ingest_listings.py` | Loads a filled-in sheet into MongoDB — batched, resumable, deduped |
| `update_single_listing.py` | Patch one listing by hand |
| `bulk_update.py` | Apply many updates at once from a spreadsheet |
| `refresh_check.py` | Flags stale listings, exports a re-check list — run this on a schedule |
| `pincode_lookup.py` | Reads `../data/India_10_Cities_Pincode_Reference_v2.xlsx`, nearest-point lookup, drops known-bad rows |
| `leads_schema.py` | Field shape + relevance filter for automatically-sourced candidates (Google Places, OSM) |
| `osm_places.py` | Sweeps OpenStreetMap for PG/hostel candidates, city by city — no key, no cost. **Default.** |
| `google_places.py` | Sweeps Google Places for PG/hostel candidates, city by city — higher yield, needs a paid API key |
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

## 4. Sourcing candidate leads

Both sourcing scripts read `../data/India_10_Cities_Pincode_Reference_v2.xlsx`
(via `pincode_lookup.py`) for the list of localities/coordinates to search,
write raw results to their own untouched-audit-trail collection, and upsert
anything that looks like an actual PG/hostel into the shared `leads`
collection. Neither is the only automated sourcing step available forever —
see "What this does NOT do" below for why the obvious alternatives (99acres,
Housing.com, etc.) aren't wired up, and what would extend this pattern to a
real data-partner API if one shows up later.

**`osm_places.py` — default, no key, $0.** Sweeps OpenStreetMap via the public
Overpass API, one bounding-box query per city:

```bash
python osm_places.py --city Vadodara --dry-run   # shows the bbox + query, zero network calls
python osm_places.py --city Vadodara
```

Coverage trade-off: OSM's PG/hostel data in Indian cities comes from
volunteer mapping, so this finds meaningfully fewer candidates per city than
Google Places would — first Vadodara run turned up 10 leads. It also tags
some things "hostel" that aren't rental PGs (a temple guest house, a college
or railway staff hostel showed up in testing) — `leads_schema.is_relevant_osm`
filters the obvious noise (hotels, "PG College"-type name collisions), but a
human still skims the list before calling.

**`google_places.py` — higher yield, needs a paid API key.** Same pattern,
Google's Places Text Search instead, phone numbers on request:

```bash
# get a key: console.cloud.google.com -> enable "Places API" -> Credentials -> API key,
# with billing enabled on the project (Places is billed per call, though a
# single city easily fits inside Google's free monthly call allowance)
export GOOGLE_MAPS_API_KEY="your-key-here"

python google_places.py --city Vadodara --dry-run       # locality count + call estimate, spends nothing
python google_places.py --city Vadodara --max-calls 200
python google_places.py --city Vadodara --max-calls 200 --with-phone  # extra Place Details call per place
```

**A lead is not a listing**, from either source. Neither gives rent price,
deposit, gender policy, or real availability — those only come from a human.
The intended flow: a field agent works `leads` by city (`status: "lead_new"`),
calls or visits, and if it's real, fills a row in the normal intake template
with `source=field_agent` and `source_ref=<the lead's place_id>` — then
`ingest_listings.py`, completely unchanged, puts it in `listings` exactly as
it does today.

Roll out city by city — the pincode reference file's sheet names are the
valid `--city` values (Pune, Mumbai, Bengaluru, Gurugram, Noida, Hyderabad,
Ahmedabad, Gandhinagar, Vadodara, Kota). Start with one, check the `leads` it
produces look right, then move to the next.

### The pincode reference file has bad rows — handled, but know about it

Checked all 10 sheets against each city's real-world center: a meaningful
fraction of rows have a lat/lng that doesn't belong to their stated city —
Mumbai is clean (1% off), but **Vadodara is the worst at 69% off** (most of
its bad rows cluster near Goa instead of Vadodara), Kota 34%, Pune 32%,
Ahmedabad 19%, Gandhinagar 13%, Noida 10%. Looks like a join/lookup bug from
whenever this file was generated off the raw data.gov.in export — not
something fixed here.

`pincode_lookup.load_city_rows()` drops any row more than 60km from a known
city-center anchor before anything else uses it, and prints a one-line count
when it does. Both sourcing scripts inherit this fix automatically. If you
ever regenerate the reference file, it'd be worth finding and fixing the
actual join bug rather than relying on this filter forever.

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

- It does not geocode intake-sheet addresses. `latitude`/`longitude` are left
  blank in the intake sheet on purpose — wire in Google's Geocoding API or OSM
  Nominatim inside `to_mongo_doc()`'s caller (or as a pass over
  `ingest_listings.py` after each batch) once you've picked one; that needs a
  real internet connection this sandbox doesn't have, so it has to be wired up
  and tested on your own machine/server, not here. (`google_places.py`
  separately backfills locality/pincode on *lead* records from the pincode
  reference file — that's nearest-point lookup, not geocoding an address.)
- It does not scrape 99acres, Housing.com, MagicBricks, NoBroker, OLX, or
  Facebook Marketplace. Checked before building `google_places.py`, in order:
  - **99acres** — `robots.txt` itself returns an Akamai "Access Denied" edge
    block. Active bot-wall before you even reach content.
  - **Housing.com** — `robots.txt` is replaced by a bot-management "Security
    Alert" challenge page. Same signal.
  - **MagicBricks** — `robots.txt` name-blocks known scraper/monitor bots
    (Wotbox, oBot, SEOkicks-Robot, IstellaBot, FreeWebMonitoring...) — declared
    anti-scraping intent.
  - **OLX** — `robots.txt` disallows `/post/*` for all agents and sets
    `Content-Signal: ai-train=no` — explicit no on automated harvesting.
  - **Facebook Marketplace** — `robots.txt` states outright that automated
    collection is prohibited without express written permission.
  - **NoBroker** — `robots.txt` alone is permissive (only blocks admin/API
    paths), but that's not the same as permission; wasn't pursued further.

  Getting listing data out of any of these means impersonating a browser to
  defeat detection the site put there on purpose — not something this
  pipeline does. If a data-partner API or written permission from one of them
  ever exists, the `places_raw` → normalize → separate-collection pattern
  `google_places.py` uses extends to it directly.
- Its input is your own intake sheet (self-listing or field agents) plus,
  now, the `leads` a field agent works from `google_places.py` sweeps — see
  "Sourcing candidate leads" above.

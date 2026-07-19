# PG Near Me — Data Pipeline & Scraper Architecture

Phase 3 feature (see [ROADMAP.md](ROADMAP.md)). Owner self-submission is and remains the **primary source of truth** ([PRD.md](PRD.md)); this pipeline exists only to **seed and fill gaps** in cities/areas that don't yet have owner submissions, and to help flag stale listings for re-verification.

**Legal gate, stated up front**: no specific third-party site is named or scraped by this design. Every source must have `legal_review_status = 'approved'` in the `scrape_sources` table before any job runs against it. That review (ToS check, robots.txt compliance, rate-limiting/attribution requirements) is an offline legal task, not something this document or an implementation decides unilaterally. See [open question #5](GLOSSARY_AND_OPEN_QUESTIONS.md).

## Pipeline stages

```
scrape_sources ──▶ scrape_jobs ──▶ ingested_raw_listings ──▶ (admin review) ──▶ pg_listings
   (config)          (runs)          (staging/review queue)                      (source='scrape')
```

1. **`scrape_sources`** — a generic, source-agnostic config record: name, base_url, type (`html_scrape` / `api` / `manual_csv_import`), `legal_review_status`. Nothing runs while `not_reviewed` or `rejected`.
2. **`scrape_jobs`** — a single run against a source: queued → running → completed/failed, with `records_ingested` and an `error_log`. Triggered by cron (Vercel Cron / Supabase scheduled function) or manually from the admin panel.
3. **Normalization** — raw scraped payload is mapped into the `pg_listings` shape (city/area resolution, price parsing, amenity tagging) and stored alongside the untouched `raw_payload` for audit/debugging.
4. **Deduplication** — before landing in the review queue, attempt to match against existing `pg_listings` (by name + geo-proximity + phone number fuzzy match). Store `dedup_match_listing_id` and a `dedup_confidence` score when a likely match is found.
5. **`ingested_raw_listings`** (the review queue) — every ingested row sits here as `review_status='pending'` until an admin acts on it:
   - **Approve as new** → creates a `pg_listings` row with `source='scrape'`, `status='pending_review'` (still goes through the normal publish gate, doesn't skip straight to live)
   - **Approve as merge** → updates the matched existing listing with any new/better data (e.g. filling a missing price or image) rather than creating a duplicate
   - **Reject** → discarded, stays in the queue for audit history

Scraped rows never auto-publish — they enter exactly like an owner submission does, at `pending_review`, and go through the same admin approval path documented in [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md#scrape-review-queue).

## Seasonal re-verification

Independent of scraping, listings need periodic accuracy checks (prices, availability change season to season). A scheduled job flags any `pg_listings` row whose `verified_at` is older than a staleness threshold (e.g. 3–6 months, tune later) into the admin's "staleness dashboard" (see [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md)). Admin can either confirm it's still accurate (bump `verified_at`) or reach out to the owner for re-confirmation. This applies equally to owner-submitted and scrape-seeded listings.

## Implemented: OpenStreetMap bootstrap (2026-07-17)

The first (and so far only) approved source is **OpenStreetMap via the Overpass API** (`scripts/scrape-osm.js`): ODbL-licensed open data, so the legal gate was cleared with the conditions that (a) the site displays "© OpenStreetMap contributors" attribution (footer) and (b) ODbL share-alike is understood to apply to the derived listing database. It ingests `tourism=hostel` and PG-named places for the launched cities, inferring `pg_type` from explicit OSM gender tags or unambiguous name keywords ("Ladies PG" → female), leaving it null otherwise; price/food/rules stay null pending verification.

**Deviation from the rule above, at founder direction**: this bootstrap batch was published directly (`status='published'`, `review_status='approved_new'`) rather than parked at `pending_review`, because no admin UI exists yet and the founder wanted real data live. Descriptions state that details are pending verification. Future sources — and future OSM re-runs once the admin panel exists — should revert to the normal `pending_review` path.

## What this document deliberately does not do

- Name specific scrape targets — that's a legal/business decision made per-source, tracked via `scrape_sources.legal_review_status`, not hardcoded into the architecture.
- Specify a scraping library/framework — pick that at Phase 3 implementation time based on whichever approved sources actually need scraping (static HTML vs. JS-rendered vs. API-based sources need different tooling).

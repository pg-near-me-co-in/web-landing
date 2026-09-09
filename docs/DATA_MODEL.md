# PG Near Me — Data Model

## Phase A: JSON files (current)

Source of truth is `data/*.json`, read through `lib/data/cities.ts` and `lib/data/listings.ts` — those two files are the *only* place that knows the data lives in JSON. Every page imports from them, never from `data/*.json` directly, so Phase B can swap the JSON reads for real DB queries behind the exact same function signatures (`getAllCities`, `getLaunchedCities`, `getCityBySlug`, `getListingsForCity`, `getListingBySlug`, `getAllListings`) without touching a single page component.

- `data/cities.json` — `id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url` (matches `City` in `lib/types.ts`)
- `data/listings.json` — full listing shape (`Listing` in `lib/types.ts`): identity/location, `pg_gender`, `sharing_types`, price range, `food_type` (`veg_only`/`non_veg_allowed`/`no_food`/`jain_only`), `house_rules` (`strict`/`liberal`), `road_access` (boolean), contact info, `amenities` (plain display-name strings, e.g. `"WiFi"`), `images`, `trust_score` (0–5 scale)
- The amenity pick-list (`AMENITIES_ALL`, 11 items) lives as a constant in `lib/format.ts` rather than a separate JSON file — listings store the amenity names directly, no separate catalog lookup needed at render time.

**Adding new listings/cities today**: edit the relevant JSON file directly (or write a small Node script, same idea as the old `seed-*.js` scripts) and redeploy — there's no admin UI yet because there's no database to persist writes to in production.

Filter/sort/search logic lives in `lib/data/listings.ts`'s `matchesFilters()` — a pure, unit-tested function (`__tests__/listings.test.ts`) kept separate from the data source so it doesn't change when Phase B moves to SQL `WHERE` clauses.

## Phase B: Postgres/Supabase (planned, not yet provisioned)

Schema carried forward from the project's earlier Next.js build (recoverable via `git show 5e8246e:supabase/migrations/`), reusing the same enums/columns Phase A's `Listing`/`City` types already mirror:

- `cities` (id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url)
- `areas` (id, city_id, name, slug, lat, lng, is_active)
- `owners` (id, name, phone, email, whatsapp_number, status)
- `pg_listings` (core table — same fields as `Listing`, plus `owner_id`, `area_id`, `status`, `source`, `verified_at`, `published_at`)
- `listing_images` (listing_id, storage_path, alt_text — non-empty `alt_text` enforced), `amenities` + `listing_amenities` (M2M)
- `reviews` (listing_id, reviewer_name, rating, review_text, status)
- `leads` — the contact-reveal / owner-submission capture target
- `admin_users`, `page_seo_meta`, `site_settings`, `scrape_sources`/`scrape_jobs`/`ingested_raw_listings`, `admin_audit_log` — Phase B/C only

RLS from day one: public reads limited to `status='published'`/`is_launched`/`is_active`; all writes via server actions or the service role.

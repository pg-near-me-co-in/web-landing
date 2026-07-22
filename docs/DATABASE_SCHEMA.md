# PG Near Me — Database Schema (Supabase / Postgres)

Live schema, migrated via the Supabase CLI as version-controlled SQL in [`supabase/migrations/`](../supabase/migrations/) (`0001_init.sql` through `0004_city_directory_content.sql` — see per-table migration notes below).

**Conventions**: UUID primary keys (`gen_random_uuid()`), `created_at`/`updated_at timestamptz` on every table, Row Level Security (RLS) enabled from day one — public/anon role gets read-only access to `status='published'` rows only; all writes go through the admin/service role or a validated server action.

## Tables

### `cities`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. "Bangalore" |
| slug | text unique | powers `/pg/[city]` |
| state | text | |
| lat, lng | numeric | map centering |
| is_launched | boolean | gates public visibility — Phase 0 research feeds this |
| listing_count_cache | int | denormalized, refreshed via trigger/cron, powers homepage city cards |
| tagline | text nullable | short marketing line for city cards (migration `0004`), admin-editable via `/admin/cities` |
| hero_image_url | text nullable | optional hero photo URL (migration `0004`) — same "URL, not necessarily an uploaded binary" convention as `listing_images.storage_path`; null falls back to a deterministic gradient tile (`src/lib/placeholder-images.ts`) |
| created_at, updated_at | timestamptz | |

Migrations: `0001_init.sql` (this shape, minus `tagline`/`hero_image_url`), `0002_real_data.sql` (nullable `pg_listings.pg_type` + `listing-images` Storage bucket), `0003_trust_score_ai.sql` (`ai_review_summary` + `compute_trust_score()`), `0004_city_directory_content.sql` (`tagline`/`hero_image_url` above).

### `areas` (localities within a city)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| city_id | uuid FK → cities | |
| name | text | e.g. "Koramangala" |
| slug | text | unique per city |
| lat, lng | numeric | |
| is_active | boolean | |
| created_at, updated_at | timestamptz | |

### `owners`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| phone | text | primary contact |
| email | text nullable | |
| whatsapp_number | text nullable | |
| status | text enum: `pending` \| `active` \| `blocked` | |
| notes | text | admin-internal |
| created_at, updated_at | timestamptz | |

Phase 1 has no owner login — this is a lightweight contact record captured at submission time, not an auth-backed account. Real owner accounts (Supabase Auth) are a later-phase addition; see [open question #9](GLOSSARY_AND_OPEN_QUESTIONS.md).

### `pg_listings` (core table)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid FK → owners, nullable | null for scraped/seeded entries until claimed |
| city_id | uuid FK → cities | |
| area_id | uuid FK → areas | |
| name | text | PG name |
| slug | text unique | powers `/pg/[city]/[area]/[listing-slug]` |
| description | text | |
| address_line | text | |
| lat, lng | numeric | map pin + road-access heuristics |
| pg_type | text enum: `male` \| `female` \| `unisex` | notebook's M/F/U |
| sharing_types | text[] | Single / Double / Triple / 5-bed etc. (array is simplest for MVP; move to a join table if filter performance demands it) |
| price_min, price_max | numeric | "approx" range |
| price_currency | text default `'INR'` | |
| religion_preference | text nullable | sensitive field — see [open question #4](GLOSSARY_AND_OPEN_QUESTIONS.md) before shipping as a public filter |
| food_preference | text enum: `veg` \| `non_veg` \| `both` \| `not_provided` | |
| road_access | text enum: `with_road` \| `without_road` | |
| house_rules_strictness | text enum: `strict` \| `moderate` \| `liberal` | |
| curfew_time | time nullable | optional structured detail supporting strictness |
| contact_phone | text | shown behind the contact-reveal lead-capture interaction |
| contact_whatsapp | text nullable | |
| status | text enum: `draft` \| `pending_review` \| `published` \| `rejected` \| `archived` | owner submissions and scraped rows both start `pending_review` |
| source | text enum: `owner_submission` \| `scrape` \| `admin_manual` | traceability |
| rating_avg | numeric(2,1) | denormalized from `reviews` |
| rating_count | int | denormalized |
| trust_score | numeric | see formula note below |
| verified_at | timestamptz nullable | drives seasonal re-verification |
| published_at | timestamptz nullable | |
| created_at, updated_at | timestamptz | |

**Design decision**: owner submissions reuse this table with `status='pending_review'` rather than a separate staging table — one moderation queue in the admin panel, not two.

**Trust/data-rating score** (flagged ⭐ in the notebook): model as a computed value combining review rating average, review recency/volume, listing field-completeness %, verification recency, and (later) scrape-vs-owner-submission provenance weighting. Ship a simple weighted-average version in Phase 2; exact formula is [open question #8](GLOSSARY_AND_OPEN_QUESTIONS.md).

### `listing_images`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK → pg_listings | |
| storage_path | text | Supabase Storage object path, **or** a full external `http(s)://` URL — `src/lib/images.ts`'s `resolveImageUrl()` passes external URLs through untouched. Used by `scripts/scrape-osm.js` to store resolved `upload.wikimedia.org` asset URLs (see [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md#image-ingestion-2026-07)) without a Storage upload step. |
| alt_text | text | **enforce non-empty** — free SEO/accessibility value |
| sort_order | int | |
| is_cover | boolean | |
| created_at | timestamptz | |

### `amenities` + `listing_amenities`
`amenities`: id, name (AC, WiFi, Laundry, Power Backup, Food Included, Housekeeping, …), slug, icon_key, category nullable (comfort/safety/food), is_active.

`listing_amenities`: listing_id FK, amenity_id FK — standard many-to-many join.

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK → pg_listings | |
| reviewer_name | text | free-text, no login |
| reviewer_phone_hash | text nullable | store a hash, not raw, for spam control |
| rating | int check 1-5 | |
| review_text | text | |
| status | text enum: `pending` \| `approved` \| `rejected` | moderated before publish, even in Phase 1 |
| source | text enum: `user_submitted` \| `imported` | |
| created_at, updated_at | timestamptz | |

### `leads` (the notebook's "IP" — interested party — capture)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK → pg_listings | |
| name | text nullable | |
| phone | text | required — the core capture |
| email | text nullable | |
| intent | text enum: `contact_reveal` \| `enquiry_form` \| `callback_request` | maps to the "lock/get" action — see [open question #2](GLOSSARY_AND_OPEN_QUESTIONS.md) |
| message | text nullable | |
| utm_source, utm_medium, utm_campaign | text nullable | joins to GA4 conversion tracking |
| created_at | timestamptz | |

### `admin_users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK, FK → `auth.users` | Supabase Auth backs admin login only — no public user auth in Phase 1/2 |
| full_name | text | |
| role | text enum: `super_admin` \| `editor` \| `moderator` \| `analyst` | analyst = read-only analytics; moderator = review/listing approval only |
| is_active | boolean | |
| created_at | timestamptz | |

RLS on all writable public tables checks `auth.uid()` exists in `admin_users` with the appropriate role.

### `page_seo_meta` (dynamic per-route SEO — Phase 3)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| route_pattern | text | e.g. `/`, `/pg/[city]`, `/pg/[city]/[area]/[listing]` |
| entity_type | text enum: `static_page` \| `city` \| `area` \| `listing` | |
| entity_id | uuid nullable | FK to the specific city/area/listing |
| meta_title, meta_description | text | |
| og_title, og_description, og_image_url | text | |
| canonical_url | text nullable | |
| custom_json_ld | jsonb nullable | admin-entered structured-data override |
| ai_generated | boolean default false | flags rows populated by the Phase 4 AI SEO copilot |
| updated_by | uuid FK → admin_users | |
| updated_at | timestamptz | |

Prefer generating JSON-LD programmatically from the entity's own columns (name, price, images, rating) — `page_seo_meta` holds overridable/editorial fields, not re-derived facts.

### `site_settings` (theme/fonts/global config — Phase 3)
Key-value/jsonb table, more extensible than fixed columns:
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| key | text unique | e.g. `theme.primary_color`, `theme.font_heading`, `theme.font_body`, `site.logo_url`, `site.footer_text`, `analytics.ga4_id`, `analytics.clarity_id` |
| value | jsonb | |
| updated_by | uuid FK → admin_users | |
| updated_at | timestamptz | |

### `scrape_sources`, `scrape_jobs`, `ingested_raw_listings` (Phase 3)

`scrape_sources`: id, name, base_url nullable, type enum(`html_scrape`/`api`/`manual_csv_import`), is_active, **`legal_review_status` enum(`not_reviewed`/`approved`/`rejected`) — hard gate, disabled until legal/ToS review clears it**, notes, timestamps.

`scrape_jobs`: id, scrape_source_id FK, status enum(`queued`/`running`/`completed`/`failed`), started_at/finished_at, records_ingested, error_log nullable, triggered_by enum(`cron`/`manual`).

`ingested_raw_listings` (the review queue): id, scrape_job_id FK, raw_payload jsonb (unmodified, for audit), normalized_payload jsonb (mapped to `pg_listings` shape), dedup_match_listing_id FK nullable, dedup_confidence numeric nullable, review_status enum(`pending`/`approved_new`/`approved_merged`/`rejected`), reviewed_by FK nullable, reviewed_at nullable, created_at.

Approving a row here creates/updates the corresponding `pg_listings` row (`source='scrape'`). Full pipeline design: [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md).

### `admin_audit_log`
Shipped in `0001_init.sql` (id, actor FK `admin_users`, action, entity_type, entity_id, before jsonb, after jsonb, created_at) but sat unwritten-to until the 2026-07 admin CRUD pass — `src/lib/audit.ts`'s `logAdminAction()` now writes a row on every Listings/Cities/Areas/Amenities/Owners create/update/soft-delete. `actor` stays `null` on every row today: there's no real per-account admin identity (`admin_users` requires a Supabase Auth `auth.users` row, and admin login is still the shared `ADMIN_ACCESS_CODE` cookie, not per-account auth) — resolve once that migration happens. Pre-existing actions (submissions/reviews/theme/SEO) don't call it yet.

## Indexes

- `pg_listings`: `(city_id, area_id, status)`, `(pg_type)`, `(price_min, price_max)`, GIN index on `sharing_types` (array), unique index on `slug`.
- `reviews`: `(listing_id, status)`.
- `leads`: `(listing_id, created_at)`.
- Full-text search: add a generated `tsvector` column on `pg_listings` (name + description + area name) for Phase 2 search — `ILIKE`/`pg_trgm` is fine for MVP simplicity, upgrade later.

# PG Near Me

PG / hostel / flatmate-sharing listing and discovery platform for India.

Domain: **pgnearme.co.in**

## Status

**Phase 1 + Phase 2 core implemented, with real listing data + PWA + analytics.** Next.js 16 (App Router) + Tailwind v4 + Supabase (Postgres/Storage).

**UI v2 (2026-07): full rebuild on the reference theme** in [`ref/pg-near-me-site/`](ref/pg-near-me-site/) — Space Grotesk/Inter/JetBrains Mono, ref component system (cards, chips, mono badges, dark footer, stepper owner form, ref gallery with full multi-image support), only the brand logo icon carried over. Generated OG image (`scripts/make-og-image.js` → `public/brand/og-image.png`) + `summary_large_image` twitter card, Vercel Speed Insights, and hardened URL-only admin (`noindex` meta + `X-Robots-Tag` + robots.txt disallow; no public links). **No DB schema change was needed** — multi-image was already modelled (`listing_images`), and the runtime theme editor keys are unchanged (derived shades now come from `color-mix`). See [DESIGN_SYSTEM.md → Reference theme](docs/DESIGN_SYSTEM.md#reference-theme-implemented-2026-07--current-source-of-truth).

Phase 2 additions: public review submission (lands as `pending`, moderated), advanced city-page filters (budget / sharing / food / text search / sort), GA4 custom events (`contact_reveal`, `callback_request`, `owner_submission`, `review_submit`), and an **admin panel** at `/admin` (noindex) — dashboard stats, owner-submission approval queue, review moderation, lead inbox with CSV export — gated by `ADMIN_ACCESS_CODE` until Supabase Auth admin accounts are provisioned.

Phase 3/4 additions: **trust score v1** (0–100, DB trigger — migration `0003`; shown on detail pages), **runtime theme editor** (`/admin/theme` → `site_settings`, applies without redeploy), **SEO editor** (`/admin/seo` → `page_seo_meta` overrides wired into `generateMetadata`), **staleness dashboard** (`/admin/staleness`, mark-verified), city-page **FAQ blocks + FAQPage schema** from live stats, **`/llms.txt`** (GEO), and key-gated **AI features** (`ANTHROPIC_API_KEY`; `claude-opus-4-8`): admin description assist and review summaries — suggest-only, admin-triggered, per [AI_FEATURES_SPEC.md](docs/AI_FEATURES_SPEC.md).

- Schema live on Supabase — [`supabase/migrations/`](supabase/migrations/) (all tables from [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md), RLS, triggers; `0002` adds the public `listing-images` Storage bucket + nullable `pg_type`)
- Base data: top 5 states × top 5 cities (25 cities), areas for 6 launched metros, 16 amenities — re-runnable via [`supabase/seed/seed-base.js`](supabase/seed/seed-base.js) (`DB_PASSWORD` env var)
- **Real listings** ingested from OpenStreetMap (Overpass API, ODbL — attribution in footer) through the documented `scrape_sources → scrape_jobs → ingested_raw_listings` pipeline: [`scripts/scrape-osm.js`](scripts/scrape-osm.js). Commercial sources (NoBroker etc.) remain gated on legal/ToS review per [DATA_PIPELINE_SCRAPER.md](docs/DATA_PIPELINE_SCRAPER.md)
- Routes: `/` (hero, search, map, explore citywise, story), `/pg/[city]` (+ `?type=` filter), `/pg/[city]/[area]/[slug]` (detail + contact-reveal lead capture), `/add-your-pg` (owner submission with photo upload to Supabase Storage → `pending_review`), `sitemap.xml`, `robots.txt`, `manifest`, JSON-LD
- PWA: manifest + icons (from brand asset), service worker ([`public/sw.js`](public/sw.js)) per [PWA_SPEC.md](docs/PWA_SPEC.md), custom install banner, `/offline` fallback
- Analytics: GA4 + Microsoft Clarity via env IDs (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID`)
- Run locally: copy `.env.example` → `.env.local` (transaction-pooler `DATABASE_URL` + Supabase URL/publishable key + `ADMIN_ACCESS_CODE`), then `npm install && npm run dev`

## Start here

- [docs/PRD.md](docs/PRD.md) — what this product is, who it's for, MVP vs. full vision
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased build sequence (Phase 0 through Phase 4)
- [docs/GLOSSARY_AND_OPEN_QUESTIONS.md](docs/GLOSSARY_AND_OPEN_QUESTIONS.md) — open decisions that need founder sign-off before the relevant phase starts

## Full doc set

| Doc | Covers |
|---|---|
| [PRD.md](docs/PRD.md) | Product requirements |
| [ROADMAP.md](docs/ROADMAP.md) | Phase 0–4 build sequence |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Supabase/Postgres schema |
| [SEO_AEO_GEO_STRATEGY.md](docs/SEO_AEO_GEO_STRATEGY.md) | Search, answer-engine, and generative-engine optimization |
| [ADMIN_PANEL_SPEC.md](docs/ADMIN_PANEL_SPEC.md) | Admin panel modules |
| [DATA_PIPELINE_SCRAPER.md](docs/DATA_PIPELINE_SCRAPER.md) | Data ingestion/scraper architecture |
| [ANALYTICS_TRACKING_PLAN.md](docs/ANALYTICS_TRACKING_PLAN.md) | GA4/Clarity/Vercel Analytics event taxonomy |
| [PWA_SPEC.md](docs/PWA_SPEC.md) | Progressive Web App requirements |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | UI/UX conventions, homepage layout |
| [AI_FEATURES_SPEC.md](docs/AI_FEATURES_SPEC.md) | Phase 4 AI features |
| [GLOSSARY_AND_OPEN_QUESTIONS.md](docs/GLOSSARY_AND_OPEN_QUESTIONS.md) | Terminology + unresolved decisions |

## Planned stack

Next.js (App Router) + Supabase (Postgres/Auth/Storage) + Tailwind CSS, deployed on Vercel. See [PRD.md](docs/PRD.md) and [ROADMAP.md](docs/ROADMAP.md) for details — Phase 0 scaffolds the actual project.

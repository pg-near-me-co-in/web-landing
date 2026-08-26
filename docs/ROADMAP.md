# PG Near Me — Roadmap

## Phase A — JSON-driven public site (current)

**Goal**: Ship a fully SEO-correct, fast, responsive public directory without depending on a provisioned database.

Shipped:
- Homepage, `/cities` directory, `/about`, `/for-owners`, `/add-your-pg`, `/privacy-policy`, `/terms`
- `/pg/[city]` (search/filter/sort) and `/pg/[city]/[slug]` (listing detail) — data from `data/*.json` via `lib/data/*`
- Contact-reveal lead-capture UX (no DB write yet — Phase B swaps this for a real insert behind the same UI)
- Owner submission via a pre-filled `mailto:` draft (same reasoning)
- Core SEO: Metadata API, JSON-LD (WebSite/Organization/FAQPage/CollectionPage/LodgingBusiness/BreadcrumbList), dynamic `sitemap.ts`/`robots.ts`, `llms.txt` for GEO
- Analytics: GA4 + Microsoft Clarity, env-var gated
- Vitest unit tests (format/seo/filter logic) + Playwright e2e (smoke/SEO/a11y)

Exit criteria: builds clean, all tests green, Lighthouse Performance/SEO/Best-Practices/Accessibility all high — see [PWA_SPEC.md](PWA_SPEC.md) and the repo README for how to check.

## Phase B — Real database + admin

**Goal**: Replace the JSON data layer with the Postgres/Supabase schema in [DATA_MODEL.md](DATA_MODEL.md), without changing the public URL structure or component API.

Key features:
- Provision a Supabase project, apply the schema as versioned migrations
- Swap `lib/data/*` internals from JSON reads to DB queries — same function signatures, so pages don't change
- Real lead capture (`leads` table) behind `ContactReveal`; real owner-submission insert (`pg_listings`, `status='pending_review'`) behind `OwnerForm`
- Admin panel: Listings/Cities/Areas/Amenities/Owners CRUD, submission approval queue, review moderation
- Review submission UI (Phase A ships reviews as display-only seed data)
- `/pg/[city]/[area]` reintroduced once real per-area listing density justifies it (Phase A intentionally skips this — see [SEO_AEO_GEO_STRATEGY.md](SEO_AEO_GEO_STRATEGY.md))

## Phase C — Data pipeline & AI

**Goal**: Scale data coverage and differentiate with AI, once Phase B's data foundation exists.

- Source-agnostic scraper/ingestion pipeline (see [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md)) — no source goes live without legal/ToS clearance
- AI features (see [AI_FEATURES_SPEC.md](AI_FEATURES_SPEC.md)) — all human-in-the-loop, no auto-publish
- CMS-grade admin theming (`site_settings`-driven brand colors/fonts without a redeploy)

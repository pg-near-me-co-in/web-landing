# PG Near Me — Roadmap

Sequencing reference for all future work. Read alongside [PRD.md](PRD.md). Each phase has a Goal, Key Features, and Exit Criteria — don't start a phase until the previous one's exit criteria are met.

## Phase 0 — Setup & Research

**Goal**: De-risk direction before writing product code.

Key features / tasks:
- Scaffold a Next.js (App Router) project — decide whether it lives in the existing `web-landing/` folder or that folder is repurposed ([open question #10](GLOSSARY_AND_OPEN_QUESTIONS.md)); add Tailwind CSS
- Create the Supabase project; adopt Supabase CLI with version-controlled SQL migrations (not dashboard-only edits) from day one
- Link a Vercel project (free tier), set up env var strategy (`.env.local` + Vercel env groups)
- **Competitive research**: NoBroker, Zolo, Stanza Living, OYO Life, Colive, 99acres/MagicBricks PG sections, Sulekha — capture their listing data fields, filter sets, and SEO page structure. Feeds back into [PRD.md](PRD.md) and [SEO_AEO_GEO_STRATEGY.md](SEO_AEO_GEO_STRATEGY.md).
- **Top cities to launch** research: shortlist candidate cities using a scoring rubric (student population, migrant-worker density, existing PG supply density, search volume signals). Output seeds the `cities` table for Phase 1.
- Brand basics: favicon, logo placeholder, initial color/font direction (enough to unblock Phase 1 UI, not final).

Exit criteria: repo scaffolded and deployed (even as a blank page) on Vercel under pgnearme.co.in; Supabase project live with CLI migrations working; city shortlist and competitive research written up; both feed into Phase 1 scope.

## Phase 1 — MVP

**Goal**: Ship the minimal public listing product described in the founder's notebook. No login. No admin UI — any moderation needed can be done manually via the Supabase dashboard/SQL.

Key features:
- **Homepage**: sticky header (logo + "Add your PG" CTA), hero with headline/subline + search bar with icon filter shortcuts (placeholder meaning until [open question #1](GLOSSARY_AND_OPEN_QUESTIONS.md) is resolved), map section (static/embedded is fine), "Explore citywise" section with per-launched-city cards, story/about section before the footer, minimal footer.
- **City listing page** (`/pg/[city]`): grid of PG cards (image, name, location, price, PG-type badge, rating) restricted to `status='published'`; PG-type toggle filter (the one filter explicitly called out in the notebook, e.g. "Girls only").
- **PG detail page** (`/pg/[city]/[area]/[listing-slug]`): full field set per [PRD.md §3](PRD.md#3-canonical-data-model-from-the-founders-notebook) — image gallery, location+map icon, contact icon, reviews (admin-seeded, display-only — see [open question #6](GLOSSARY_AND_OPEN_QUESTIONS.md)), PG type, price, sharing type, religion preference, veg/non-veg, road access, strictness, amenities.
- **Contact-reveal lead capture**: tapping the phone/contact icon opens a small name+phone form, inserts a row into `leads`, then reveals the number. This is the notebook's "IP" (interested-party) capture mechanism.
- **Owner self-submission form**: public form that creates a `pg_listings` row (`status='pending_review'`, `source='owner_submission'`) plus an `owners` contact record; image upload to Supabase Storage.
- **Core SEO**: Next.js Metadata API per page, basic JSON-LD, `sitemap.xml` + `robots.txt` generated from published listings/cities.
- Mobile-first responsive layout. No PWA yet.
- **Analytics**: GA4 pageviews only (event taxonomy comes in Phase 2).

Exit criteria: at least one city fully seeded and browsable end-to-end (list → detail → lead capture); owner submission flow tested; Lighthouse mobile score reasonable; GA4 receiving pageviews.

## Phase 2 — Search, Reviews, Leads, Admin v1

**Goal**: Turn the static directory into an interactive, self-service-moderated product.

Key features:
- Advanced search & filtering: city/area, price range, sharing type, gender, food preference, amenities — server-side filtered against `pg_listings` (+ full-text search).
- Review submission UI (goes to `pending` status) + moderation queue.
- GA4 custom event tracking (full taxonomy — see [ANALYTICS_TRACKING_PLAN.md](ANALYTICS_TRACKING_PLAN.md)).
- City/area expansion beyond the Phase 1 launch city, using the Phase 0 shortlist; area-level pages (`/pg/[city]/[area]`).
- **Admin panel v1** (first real admin UI, behind Supabase Auth + roles): listings CRUD + owner-submission approval queue, review moderation, lead inbox (list/export), city/area management. Full module list: [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md).
- Trust/data-rating score v1 (simple weighted formula — see [open question #8](GLOSSARY_AND_OPEN_QUESTIONS.md)), surfaced as a badge.

Exit criteria: admin can approve/reject a submission end-to-end without touching the database directly; search/filter live on at least 2 cities; leads visible in the admin inbox.

## Phase 3 — Data Pipeline, CMS-grade Admin, AEO/GEO, PWA

**Goal**: Scale data coverage and content control; invest in discoverability infrastructure.

Key features:
- Source-agnostic scraper/ingestion pipeline to seed & fill data gaps in cities/areas with no owner submissions — full design in [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md). No source goes live without explicit legal/ToS clearance.
- Seasonal re-verification job: scheduled function flags listings past a staleness threshold for admin/owner re-confirmation.
- Admin CMS expansion: SEO field editor per page, theme/font settings editor — live-editable branding without redeploys.
- Full AEO/GEO structured-data pass: FAQPage schema, `llms.txt`, richer JSON-LD, citable factual summary blocks. Detail: [SEO_AEO_GEO_STRATEGY.md](SEO_AEO_GEO_STRATEGY.md).
- PWA: manifest, service worker, offline shell, install prompt. Detail: [PWA_SPEC.md](PWA_SPEC.md).
- Analytics maturity: Microsoft Clarity + Vercel Analytics added.

Exit criteria: at least one scrape source ingesting into the review queue with legal sign-off; admin can edit SEO/theme without a deploy; app installable as a PWA; FAQ/structured data live on listing and city pages.

## Phase 4 — AI Features

**Goal**: Differentiate via AI, layered on a now-mature data and admin foundation. Full spec: [AI_FEATURES_SPEC.md](AI_FEATURES_SPEC.md).

Key features:
- AI search/chat assistant over the existing filtered-search backend (not an open-ended LLM chat).
- AI-assisted owner listing-description generation in the submission form.
- AI-suggested tags/categorization to assist the admin review queue (never auto-publishes).
- AI-based review summarization on detail pages.
- AI SEO copilot in admin: keyword/content suggestions per page, human approves before anything writes to `page_seo_meta`.
- "What's trending near you" suggestions — sequenced last since it needs sufficient traffic/lead volume to be meaningful.

Exit criteria: each AI feature has a human-in-the-loop approval step; no AI output publishes without review.

## Phase 5 — Bento UI overhaul (2026-07)

Full public-UI re-skin on Sora/Manrope + softer 20px radius, shadcn/ui + Radix component architecture (ported from a Lovable reference app), 3 new always-on pages (About/Cities/For Owners) plus Privacy/Terms, admin panel sidebar + full CRUD for Listings/Cities/Areas/Amenities/Owners, additive `cities.tagline`/`hero_image_url` columns, licensed (Wikimedia) image ingestion, Vitest + Playwright test infrastructure (previously nonexistent). See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#bento-theme-implemented-2026-07--current-source-of-truth) and [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md).

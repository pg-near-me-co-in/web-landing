# PG Near Me — Product Requirements Document

Domain: **pgnearme.co.in**

This is the anchor document for the product. Read this and [ROADMAP.md](ROADMAP.md) first — everything else in `docs/` is a deep-dive referenced from these two.

Status: draft, based on founder's handwritten notes (16/7/26) + follow-up requirements. Open items are tracked in [GLOSSARY_AND_OPEN_QUESTIONS.md](GLOSSARY_AND_OPEN_QUESTIONS.md).

## 1. Problem

Finding a PG (Paying Guest accommodation), hostel, or shared flat in an Indian city is fragmented: listings are scattered across broker WhatsApp groups, Facebook/Instagram pages, generic classifieds (OLX, 99acres/MagicBricks PG sections), and a handful of managed-living brands (Zolo, Stanza Living, OYO Life, Colive) that only cover their own inventory. There's no single, trustworthy, filterable directory focused specifically on PG/hostel/shared-flat listings across Indian cities.

**PG Near Me** is a vertical-specific listing & discovery platform for PG/hostel/flatmate-sharing accommodation, starting India-wide and prioritized city by city.

## 2. Users

| User | Need |
|---|---|
| **PG seeker** | Find a PG/hostel near a location, filtered by gender policy, price, sharing type, food, amenities; see trustworthy reviews; contact the owner directly |
| **PG owner** | List their property for free, reach seekers without going through a broker, manage/update their listing |
| **Admin/moderator** | Keep listing data accurate and safe (approve submissions, moderate reviews, manage cities, control SEO/content) |

## 3. Canonical data model (from the founder's notebook)

Every PG listing carries these fields — this is the field list all later docs (schema, UI) must satisfy:

- PG Name
- Images (gallery)
- Location (map pin/icon)
- Contact (phone icon → lead capture)
- Reviews (star rating + written text)
- PG type: **M**ale / **F**emale / **U**nisex
- Price (approximate, shown as a range)
- Sharing type: Single / Double / up to 5-bed
- Religion preference (see [open question #4](GLOSSARY_AND_OPEN_QUESTIONS.md))
- Veg / Non-veg (food policy)
- With-road / without-road access
- House rules: Strict / Liberal
- Amenities: AC / Non-AC / etc.
- A **trust / data-rating score** derived from reviews (flagged ⭐ as important in the notebook — see [open question #8](GLOSSARY_AND_OPEN_QUESTIONS.md))

Full column-level schema: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## 4. Scope: MVP vs. full vision

The founder's notebook is explicit: **"In 1st Phase there should be only listing page for PG finders."** The follow-up notes ask for a much larger set of capabilities (AI, scraper, admin CMS, PWA, SEO/AEO/GEO, analytics, dynamic theming). Both are valid — they're sequenced, not conflicting. Full breakdown: [ROADMAP.md](ROADMAP.md).

- **Phase 1 (MVP)** — public listing + detail pages, no login, owner self-submission form, core SEO, mobile-first responsive. This is the notebook's scope.
- **Phase 2** — advanced search/filtering, review submission + moderation, lead tracking, admin panel v1.
- **Phase 3** — scraper/data pipeline, CMS-grade admin (SEO fields, theme/fonts editable), AEO/GEO, PWA, fuller analytics.
- **Phase 4** — AI features layered on top of a mature data + admin foundation.

**Always-on marketing/IA surfaces** (added 2026-07, not phase-gated — no new data model): `/about` (positioning/what-we-are-not), `/cities` (full live + rolling-out city directory), `/for-owners` (owner-acquisition landing), `/privacy-policy`, `/terms`. The legal pages exist because the product genuinely collects personal data (contact-reveal name+phone, owner-submission contact details + photos, review submitter name, GA4/Clarity analytics) — see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for the underlying tables.

## 5. Success metrics (indicative, refine per phase)

| Phase | Primary metric |
|---|---|
| Phase 1 | Number of published listings; number of owner submissions/week |
| Phase 2 | Leads captured (contact-reveal + enquiry) per week; search/filter usage rate |
| Phase 3 | City coverage (# launched cities/areas); % listings re-verified within staleness window; organic search impressions |
| Phase 4 | AI-assisted actions taken (descriptions generated, chat sessions) and their effect on lead conversion |

## 6. Non-goals (for now)

- User accounts / login for seekers (explicitly deferred per notebook — "No user login as of now")
- Owner authentication/dashboard (owners submit via form; admin mediates — see [open question #9](GLOSSARY_AND_OPEN_QUESTIONS.md))
- Payments/booking — this is a discovery & lead-gen product, not a transactional booking platform
- Scraping any specific third-party site until it clears legal/ToS review (see [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md))

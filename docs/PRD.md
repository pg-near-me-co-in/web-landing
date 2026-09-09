# PG Near Me — Product Requirements Document

Domain: **pgnearme.co.in**

Read this and [ROADMAP.md](ROADMAP.md) first — everything else in `docs/` is a deep-dive referenced from these two.

## 1. Problem

Finding a PG (Paying Guest accommodation), hostel, or shared flat in an Indian city is fragmented: listings are scattered across broker WhatsApp groups, Facebook/Instagram pages, generic classifieds (OLX, 99acres/MagicBricks PG sections), and a handful of managed-living brands (Zolo, Stanza Living, OYO Life, Colive) that only cover their own inventory. There's no single, trustworthy, filterable directory focused specifically on PG/hostel/shared-flat listings across Indian cities.

**PG Near Me** is a vertical-specific listing & discovery platform for PG/hostel/flatmate-sharing accommodation, starting India-wide and prioritized city by city.

## 2. Users

| User | Need |
|---|---|
| **PG seeker** | Find a PG/hostel near a location, filtered by gender policy, price, sharing type, food; contact the owner directly |
| **PG owner** | List their property for free, reach seekers without going through a broker |
| **Admin/moderator** | Keep listing data accurate and safe (Phase B, once there's a database to moderate) |

## 3. Canonical data model

Every PG listing carries these fields — see [DATA_MODEL.md](DATA_MODEL.md) for the exact JSON shape (`lib/types.ts`):

- PG Name, images (gallery), location (lat/lng + address)
- Contact (phone/WhatsApp → contact-reveal lead capture)
- Reviews (star rating + written text)
- PG type: Male / Female / Unisex
- Price (shown as a range), sharing type (Single..5-bed)
- Veg / Non-veg / Both / Not provided (food policy)
- Road access, house rules strictness
- Amenities
- A trust score

## 4. Scope: current phase vs. full vision

- **Phase A (current)** — public listing + detail pages, JSON-file data (no database yet), search/filter/sort, owner submission via `mailto:`, core SEO/AEO/GEO, GA4 + Microsoft Clarity analytics, mobile-first responsive.
- **Phase B** — swap the JSON data layer for a real Postgres/Supabase database (schema already designed, see [DATA_MODEL.md](DATA_MODEL.md)), real lead capture, admin CRUD panel, review submission + moderation.
- **Phase C** — scraper/ingestion pipeline, AI-assisted features (all human-in-the-loop), CMS-grade admin theming.

## 5. Non-goals (for now)

- User accounts / login for seekers
- Owner authentication/dashboard — owners submit via form, team verifies manually
- Payments/booking — this is a discovery & lead-gen product, not a transactional platform
- Scraping any third-party site until it clears legal/ToS review

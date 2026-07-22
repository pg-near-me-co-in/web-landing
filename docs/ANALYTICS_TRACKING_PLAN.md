# PG Near Me — Analytics & Tracking Plan

## Tools

| Tool | Purpose | Phase | Cost |
|---|---|---|---|
| Google Analytics 4 (GA4) | Primary traffic/funnel analytics | 1 (pageviews only) → 2 (full events) | Free |
| Microsoft Clarity | Session recordings, heatmaps | 3 | Free |
| Vercel Analytics | Core Web Vitals / real-user monitoring | 3 | Free tier (near-zero setup cost since hosting is already Vercel) |

Note: Plausible's free tier is trial-only, not perpetual — excluded from the "free tools" list for that reason.

## Event taxonomy (GA4 custom events, snake_case)

| Event | Fired when | Key params |
|---|---|---|
| `listing_view` | PG detail page loads | `listing_id`, `city`, `pg_type`, `price_bucket` |
| `city_page_view` | City listing page loads | `city` |
| `search_performed` | User submits/changes search filters | `city`, `filters_applied` |
| `filter_used` | Individual filter toggle (e.g. Girls-only) | `filter_type`, `filter_value` |
| `contact_reveal_click` | User taps the phone/contact icon (pre-form) | `listing_id` |
| `lead_submitted` | Lead form successfully inserts into `leads` | `listing_id`, `intent` (matches the schema's `leads.intent` enum) |
| `add_pg_cta_click` | "Add your PG" button clicked | `location` (header/hero) |
| `owner_submission_completed` | Owner form successfully submitted | `city` |
| `review_submitted` | User submits a review | `listing_id`, `rating` |
| `map_interaction` | User interacts with the map section | `context` (homepage/detail) |

Phase 1 ships pageviews only (`listing_view`, `city_page_view` as basic page_view events); the full custom-event taxonomy above is a Phase 2 build-out — see [ROADMAP.md](ROADMAP.md).

**2026-07 UI overhaul**: the 5 new routes (`/about`, `/cities`, `/for-owners`, `/privacy-policy`, `/terms`) are covered by GA4's existing global `page_view` tracking (`src/components/analytics.tsx`) automatically — no new custom events were needed for them.

## Privacy

- Phone numbers are captured via the lead form (`leads.phone` — see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#leads-the-notebooks-ip--interested-party--capture)). Never pass raw phone numbers (or any other PII) into GA4 event params — only IDs (`listing_id`, etc.).
- ~~Add a basic privacy policy / consent notice near the lead-capture form given phone numbers are collected.~~ **Done (2026-07)**: `/privacy-policy` documents exactly what's collected (contact-reveal, owner submission, reviews, GA4/Clarity) and why; linked from the footer on every page.
- If/when EU or otherwise privacy-regulation-sensitive traffic becomes relevant, revisit consent-mode requirements for GA4 — out of scope for initial India-only launch but worth a placeholder note.

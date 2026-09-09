# PG Near Me — Analytics & Tracking Plan

## Tools

| Tool | Purpose | Cost |
|---|---|---|
| Google Analytics 4 (GA4) | Traffic, funnels, custom events | Free |
| Microsoft Clarity | Session recordings, heatmaps, rage-click/drop-off detection | Free |

Both are loaded by `components/analytics.tsx`, gated on `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_CLARITY_ID` env vars — unset means no script loads (no console errors, nothing sent).

**Naming note**: "Firebase" for a plain website means this same GA4 property — Firebase Analytics is the mobile-app SDK sibling of GA4, not a separate tool needed here. "Microsoft Clarity" is the correct name for the heatmap/session-recording tool (sometimes referred to loosely as "Azure Clarity" since it's a Microsoft product).

## Setup (do this once you have the site live)

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com), get the Measurement ID (`G-XXXXXXX`), set it as `NEXT_PUBLIC_GA_ID` in your deployment env.
2. Create a project at [clarity.microsoft.com](https://clarity.microsoft.com), get the Project ID, set it as `NEXT_PUBLIC_CLARITY_ID`.
3. Both start recording immediately on deploy — no code change needed.

## Event taxonomy (GA4 custom events, snake_case)

| Event | Fired when | Key params | Wired in |
|---|---|---|---|
| `search_performed` | Hero search card submits | `city`, `filters_applied` | `components/search-card.tsx` |
| `contact_reveal_click` | Seeker taps "Show contact number" | `listing_id` | `components/contact-reveal.tsx` |
| `contact_reveal` | Seeker successfully reveals a number | `listing_id` | `components/contact-reveal.tsx` |
| `click_whatsapp` | Seeker taps the WhatsApp deep link | `listing_id` | `components/contact-reveal.tsx` |
| `owner_submission_completed` | Owner form hands off to `mailto:` | `city` | `components/owner-form.tsx` |

GA4's automatic `page_view` event already covers `listing_view`/`city_page_view` — no separate custom event is needed for plain navigation.

## Privacy

Never pass raw phone numbers or other PII into GA4 event params — only IDs (`listing_id`, city slug). `/privacy-policy` documents exactly what's collected and why.

## Phase B additions

Once there's a real `leads` table, `lead_submitted` (params: `listing_id`, `intent`) and `review_submitted` (params: `listing_id`, `rating`) get added — see [ROADMAP.md](ROADMAP.md).

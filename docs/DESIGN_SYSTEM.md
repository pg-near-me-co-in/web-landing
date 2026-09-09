# PG Near Me — Design System

## Bento theme (current)

Fonts: **Sora** 500–800 for display/headings, **Manrope** 400–700 for body, **JetBrains Mono** 500–600 for eyebrows/badges/prices — all self-hosted via `next/font/google` (`app/layout.tsx`).

Colors (CSS custom properties in `app/globals.css`, mapped into Tailwind v4's `@theme inline`):

| Token | Hex |
|---|---|
| Primary | `#534AB7` |
| Purple | `#7F77DD` |
| Accent | `#AFA9EC` |
| Teal | `#1D9E75` |
| Highlight | `#5DCAA5` |

Plus a full grey 5–950 scale and WCAG-AA-checked state-color pairs (`warn`/`success`/`alert`, each with a background + accessible foreground). Radius base `1.25rem` (20px), derived `--radius-sm..3xl` scale via `calc()`. Custom utilities: `.container-page`, `.chip`, `.bento-card`, `.glow-primary`, `.eyebrow`, `.surface-card`.

## UI/flow parity with the Lovable reference export

The public UI and page flows are matched to the Lovable-generated TanStack reference app (mined for structure, not copied as code — see [ROADMAP.md](ROADMAP.md)), not the earlier Next.js app's layout. Concretely: a map-first homepage (not a hero search-card widget), a single unified filter sidebar per city (gender/budget/food/sharing/house-rules/amenities/verified, no sort dropdown), instant one-click contact reveal (no name+phone gate — a deliberate reversal of the original PRD's lead-capture requirement, confirmed with the founder), a photo-gallery listing detail with a thumbnail switcher, and a fully sectioned owner-submission form. Field names/enums (`pg_gender`, `food_type`, `house_rules`, `trust_score` on a 0–5 scale, `amenities` as plain display-name strings) mirror the reference's data shape for the same reason.

## Component library

Minimal shadcn/Radix footprint — only `Sheet` (mobile nav drawer, `components/ui/sheet.tsx`) is used. Everything else (buttons, filters, badges, form fields) is plain Tailwind-styled markup.

Composed components (`components/*.tsx`): `header` + `mobile-nav`, `footer`, `home-map` (client-only Leaflet map, lazy-loaded via `home-map-loader`), `city-filters`, `listing-card`, `listing-gallery`, `contact-reveal`, `owner-form`, `back-button`, `analytics`.

## Responsive approach

Mobile-first Tailwind breakpoints — PG seekers are predominantly mobile users. Listing grids: 1 column on mobile, 2–3 from `sm`/`lg` up.

## Logo

`app/icon.png` — a single square mark, used as-is for the favicon (via Next's built-in `app/icon.*` convention), inlined directly in the header/footer markup, and the PWA manifest icon. No multi-size icon-generation pipeline in Phase A (see [PWA_SPEC.md](PWA_SPEC.md)).

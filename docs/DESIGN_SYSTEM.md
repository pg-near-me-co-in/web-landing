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

## Component library

Minimal shadcn/Radix footprint — only what's actually used: `ToggleGroup` (PG-type selector in the search card) and `Sheet` (mobile nav drawer), both in `components/ui/`. Everything else (buttons, badges, form fields) is plain Tailwind-styled markup — no point pulling in a dozen unused primitives for a Phase A site with three interactive widgets.

Composed components (`components/*.tsx`): `logo`, `header` + `mobile-nav`, `footer`, `search-card`, `listing-card`, `badges` (PgTypeBadge/VerifiedBadge/RatingStars), `contact-reveal`, `owner-form`, `analytics`.

## Responsive approach

Mobile-first Tailwind breakpoints — PG seekers are predominantly mobile users. Listing grids: 1 column on mobile, 2–3 from `sm`/`lg` up.

## Logo

`app/icon.png` — a single square mark, used as-is for the favicon (via Next's built-in `app/icon.*` convention), the header/footer logo (`components/logo.tsx`), and the PWA manifest icon. No multi-size icon-generation pipeline in Phase A (see [PWA_SPEC.md](PWA_SPEC.md)).

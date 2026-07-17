# PG Near Me — Design System

UI/UX conventions. Tech: Tailwind CSS on Next.js (see [PRD.md](PRD.md) for stack decision). Treat this as a living doc — fill in actual color/font tokens once Phase 0 branding is settled.

## Responsive approach

Mobile-first Tailwind breakpoints (default → `sm` → `md` → `lg` → `xl`) — PG seekers are predominantly mobile users searching on the go. Listing grids: 1 column on mobile, 2–3 columns from `md` up.

## Homepage layout (from the founder's notebook wireframe — Phase 1 basis)

Direct translation of the sketch dated 16/7/26:

1. **Header** — logo (left), "Add your PG" button (top right), sticky on scroll. ("Sticky to device height on scroll" is noted in the sketch — interpreted as a standard `position: sticky` header bar; exact behavior is [open question #7](GLOSSARY_AND_OPEN_QUESTIONS.md), simple sticky vs. shrink-on-scroll.)
2. **Hero section** — headline + subline, search bar with icon filter shortcuts (icons labeled M, V, A, B, H, D in the sketch — meaning unconfirmed, see [open question #1](GLOSSARY_AND_OPEN_QUESTIONS.md)).
3. **Map section** — below hero. Phase 1: static/embedded map image or simple map embed showing pins for published listings in the default/selected city. Full interactive pan/zoom/cluster map is a Phase 2/3 enhancement.
4. **"Explore citywise" section** — card grid, one card per launched city (image + name + listing count), linking to `/pg/[city]`. Sketch shows Bangalore and Mumbai as the first two example cards.
5. **Story/about section** — short "our story" / "why free" narrative block, positioned before the footer per the sketch.
6. **Footer** — minimal: logo, a few links (About, Contact, Add your PG, Terms/Privacy), social icons if available.

## Listing grid & cards

PG Card (used on city listing pages): cover image, PG name, location, price (approx range), PG-type badge (M/F/U), star rating. Links through to the detail page. Full field set on the detail page itself: [PRD.md §3](PRD.md#3-canonical-data-model-from-the-founders-notebook).

## Component library

Recommend Tailwind + a headless/unstyled primitives library (e.g. shadcn/ui or Radix) rather than a heavy pre-styled UI kit — keeps the brand distinct and gives full control over the theme tokens that eventually live in `site_settings` (Phase 3 dynamic theming, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#site_settings-themefontsglobal-config--phase-3)). Exact library choice can be finalized at Phase 0 scaffolding time.

## Theming (Phase 3)

Once `site_settings` is live, brand color and heading/body fonts become admin-editable without a redeploy (see [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md#theme--font-settings)). Build the Tailwind theme with CSS custom properties from the start (even in Phase 1) so wiring them to `site_settings` later doesn't require restyling every component.

# PG Near Me — Design System

UI/UX conventions. Tech: Tailwind CSS on Next.js (see [PRD.md](PRD.md) for stack decision).

Brand source of truth: [Figma — PG Near Me](https://www.figma.com/design/uQEpBnI0qbFeYN1NF2vHtj/PG-Near-Me) ("Logo & Stuff" page). Exported assets live in [`docs/assets/brand/`](assets/brand/). This file is a brand-exploration doc (logo lockups + color palette) — it does not yet contain UI screens, so the homepage/component sections below are still driven by the founder's notebook wireframe, not Figma frames.

## Logo

Primary mark: a simple roofline (house/home) icon above the wordmark "PG NEAR ME", set in **Cherry Bomb** (Google Font, rounded/bubbly display face). This is the standalone lockup in the Figma file (node `2:496`) — exported as [`docs/assets/brand/pg-near-me-logo.svg`](assets/brand/pg-near-me-logo.svg), black on transparent, safe to recolor per context.

The file also explores this same lockup as a rounded-square app-icon tile in three background treatments — useful directly as favicon/PWA/social-avatar source art:

| Asset | Background | File |
|---|---|---|
| App icon — brand | Purple gradient (Primary → Purple) | [`app-icon-purple.png`](assets/brand/app-icon-purple.png) |
| App icon — dark | Black | [`app-icon-black.png`](assets/brand/app-icon-black.png) |
| App icon — light | White | [`app-icon-white.png`](assets/brand/app-icon-white.png) |

Note: the Figma file also contains a second, unused type treatment (a bolder slab-serif "PG") shown in the same three background tiles — the standalone/primary lockup outside that comparison grid uses Cherry Bomb, which is why Cherry Bomb is treated here as the chosen wordmark. Worth a quick confirmation with the founder that this reading is correct. Exported for reference/comparison, not for use, as [`app-icon-purple-alt-serif.png`](assets/brand/app-icon-purple-alt-serif.png), [`app-icon-black-alt-serif.png`](assets/brand/app-icon-black-alt-serif.png), and [`app-icon-white-alt-serif.png`](assets/brand/app-icon-white-alt-serif.png) — see [open question #11](GLOSSARY_AND_OPEN_QUESTIONS.md).

**Open item**: every exported lockup pairs the roof icon with the full "NEAR ME" wordmark — there's no icon-only mark. At favicon size (16–32px) the wordmark won't be legible, so an icon-only variant (roof + "PG" only, or roof alone) is needed before Phase 3 PWA icons ship. Track this alongside [GLOSSARY_AND_OPEN_QUESTIONS.md](GLOSSARY_AND_OPEN_QUESTIONS.md).

## Color palette

Pulled directly from the Figma palette page (node `2:296`) — use these as the Tailwind theme tokens / CSS custom properties from Phase 1 onward (see [Theming](#theming-phase-3) below).

**Primary**
| Token | Hex |
|---|---|
| Primary | `#534AB7` |
| Purple | `#7F77DD` |
| Accent | `#AFA9EC` |
| Teal | `#1D9E75` |
| Highlight | `#5DCAA5` |

**Grey scale**
| Step | Hex | | Step | Hex |
|---|---|---|---|---|
| White | `#FFFFFF` | | 500 | `#616C78` |
| 5 | `#FAFBFC` | | 600 | `#4C555F` |
| 10 | `#F4F6F8` | | 700 | `#383F47` |
| 50 | `#E8ECF0` | | 800 | `#262B30` |
| 100 | `#D6DCE2` | | 900 | `#16191C` |
| 200 | `#B8C1CA` | | 950 | `#0C0E10` |
| 300 | `#98A3AF` | | 990 | `#050607` |
| 400 | `#7C8894` | | Black | `#000000` |

**State colors** (each has a pale background pairing + a saturated foreground pairing — standard badge/alert pattern)
| State | Background | Foreground |
|---|---|---|
| Warning / highlight | `#FDEAB8` | `#EFA820` |
| Success / remedy | `#E8F4F0` | `#1FAA72` |
| Alert / malefic | `#FCE8E8` | `#D94F4F` |

These are plain color swatches in Figma, not formal Figma Variables — there's no variable-name mapping to inherit, so the token names above (Primary, Purple, Accent, Teal, Highlight, plus the grey-scale steps) are what the Figma file itself labels them.

## Typography

Logo/display face: **Cherry Bomb** (used for the "PG NEAR ME" wordmark only — it's a heavy display face, not meant for body copy). The Figma file doesn't specify a body/UI font — pick a complementary readable sans (system font stack or a Google Font like Inter/Manrope) for body text and form UI at Phase 0 scaffolding time; track as an open item.

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

Once `site_settings` is live, brand color and heading/body fonts become admin-editable without a redeploy (see [ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md#theme--font-settings)) — seed it with the Figma palette above (`theme.primary_color = #534AB7`, etc.). Build the Tailwind theme with CSS custom properties from the start (even in Phase 1), sourced from the palette in this doc, so wiring them to `site_settings` later doesn't require restyling every component.

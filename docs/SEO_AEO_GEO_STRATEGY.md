# PG Near Me — SEO, AEO & GEO Strategy

Three layers: classic **SEO** (Google/Bing), **AEO** — Answer Engine Optimization (featured snippets, AI Overviews), **GEO** — Generative Engine Optimization (being well-cited by LLM search like ChatGPT/Perplexity).

## 1. URL structure

```
pgnearme.co.in/pg/[city]
pgnearme.co.in/pg/[city]/[listing-slug]
pgnearme.co.in/cities
pgnearme.co.in/about
pgnearme.co.in/for-owners
pgnearme.co.in/add-your-pg
pgnearme.co.in/privacy-policy
pgnearme.co.in/terms
```

**Deliberate deviation from a city/area/listing hierarchy**: an earlier design locked in `/pg/[city]/[area]/[listing-slug]`. With Phase A's seed data (a handful of listings per city), a standalone `/area/` index page would mostly render thin/near-empty content — a real ranking risk that works against the whole point of this strategy. The locality is still captured on every listing (`locality`) and shown on cards/detail pages; the `/pg/[city]/[area]` route gets reintroduced in Phase B once real per-area listing density justifies a non-thin page (see [ROADMAP.md](ROADMAP.md)).

## 2. Foundational SEO

- Next.js App Router **Metadata API** (`generateMetadata`) per route, funneled through `lib/seo.ts`'s `resolveSeo()` (override → computed default fallback, unit-tested in `__tests__/seo.test.ts`).
- Static generation: `/pg/[city]/[slug]` uses `generateStaticParams` over every listing; `/pg/[city]` reads `searchParams` so Next.js serves it dynamically (correct — filtered results can't be a single static page).
- `app/sitemap.ts` / `app/robots.ts` are dynamic, generated from `data/*.json` via `lib/data/*` — a new city or listing is automatically in the sitemap without a manual edit.
- Non-empty `alt_text` enforced on every listing image at the data level (`ListingImage` type).

## 3. Structured data (JSON-LD)

| Page | Schema types |
|---|---|
| Listing detail | `LodgingBusiness` + `AggregateRating` + `Review` |
| City page | `CollectionPage` + `ItemList` + `BreadcrumbList` + `FAQPage` |
| Homepage | `WebSite` + `Organization` + `FAQPage` |
| For-owners | `FAQPage` |

## 4. AEO

- Every listing/city page carries a short, extractable factual summary paragraph near the top (plain language, no marketing fluff) — see the "Overview" section on listing pages and the intro paragraph on city pages.
- `FAQPage` schema on the homepage, city pages, and `/for-owners` — the single highest-leverage AEO tactic for a Q&A-shaped product.

## 5. GEO

- `public/llms.txt` at the domain root — site purpose, key page categories, canonical URL patterns, and how search/filtering works.
- Everything is SSG/SSR (no client-only rendering of primary content) — GA4/Clarity scripts are the only client-only pieces, and they carry no page content.
- Consistent facts (price, area, gender policy) rendered identically in the visible HTML and JSON-LD for every page.

## 6. Performance (Lighthouse)

Self-hosted `next/font` (Sora/Manrope/JetBrains Mono, no external font `<link>`), `next/image` for every photo, minimal client JS (only `SearchCard`, `ContactReveal`, `OwnerForm`, `MobileNav` are Client Components — everything else is a Server Component), semantic HTML + `@axe-core/playwright` a11y checks in `e2e/a11y.spec.ts`.

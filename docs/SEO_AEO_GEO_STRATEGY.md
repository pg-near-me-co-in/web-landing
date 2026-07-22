# PG Near Me — SEO, AEO & GEO Strategy

Discoverability strategy across three layers: classic **SEO** (Google/Bing search), **AEO** — Answer Engine Optimization (voice assistants, featured snippets, Google AI Overviews), and **GEO** — Generative Engine Optimization (being well-cited/summarized by LLM-based search like ChatGPT/Perplexity). Core SEO ships in Phase 1; AEO/GEO structured data is a Phase 3 investment (see [ROADMAP.md](ROADMAP.md)).

## 1. URL structure (lock this in early — expensive to change later)

```
pgnearme.co.in/pg/[city]
pgnearme.co.in/pg/[city]/[area]
pgnearme.co.in/pg/[city]/[area]/[listing-slug]
pgnearme.co.in/cities
pgnearme.co.in/about
pgnearme.co.in/for-owners
pgnearme.co.in/privacy-policy
pgnearme.co.in/terms
```

e.g. `pgnearme.co.in/pg/bangalore/koramangala/sunrise-pg-for-women`

City and area pages are the core **programmatic SEO** surface — they scale with data (new city/area = new indexable page) without manual content authoring.

## 2. Foundational SEO (Next.js specifics)

- Use the Next.js App Router **Metadata API** (`generateMetadata`) per route. Fallback precedence: `page_seo_meta` override (Phase 3) → computed entity default (listing name + city + price) → hardcoded site default.
- **Static generation / ISR**: use `generateStaticParams` + revalidation for listing/city/area pages so they're crawlable and fast without full SSR on every request — important for a directory site living or dying by organic search.
- **Sitemap**: generate dynamically (`app/sitemap.ts`) from published `pg_listings` + active `cities`/`areas`. Chunk into a sitemap index if the URL count exceeds ~50k (unlikely soon, but document the pattern now).
- **robots.txt**: allow all public routes; disallow `/admin` and any lead-capture form POST endpoints; reference the sitemap.
- Enforce non-empty `alt_text` on every `listing_images` row at submission/scrape-normalization time — free SEO value, easy to miss.

## 3. Structured data (schema.org JSON-LD)

| Page | Schema types |
|---|---|
| Listing detail | `LodgingBusiness` (fits PG/hostel better than generic `LocalBusiness`) + `AggregateRating` + nested `Review` items + `Offer` (price range) |
| City/area page | `CollectionPage` + `ItemList` of listings + `BreadcrumbList` |
| Homepage | `WebSite` + `SearchAction` (sitelinks searchbox) + `Organization` |
| Any page with an FAQ block | `FAQPage` — deliberately add short FAQ blocks ("Is food included?", "Is this PG girls-only?") to listing/city pages; doubles as AEO fodder |

## 4. AEO — being citable by answer engines

- Every listing/city page carries a short, extractable **factual summary block** near the top (2–3 plain-language sentences, no marketing fluff): *"Sunrise PG in Koramangala, Bangalore offers single and double sharing for women, priced ₹8,000–₹12,000/month, with food included and AC rooms."* Both human-readable and machine-extractable.
- `FAQPage` schema (above) is the single highest-leverage AEO tactic for a Q&A-shaped product like PG search — extended in 2026-07 to `/cities` and `/for-owners` (own FAQ blocks + JSON-LD), matching the pattern already used on the homepage and city pages.
- Keep factual data in structured HTML (definition lists / tables), not only images — parseable by answer engines.

## 5. GEO — being well-cited by LLM search

- Publish an `llms.txt` at the domain root summarizing site purpose, key page categories, and links to canonical city/listing index pages — an emerging convention LLM crawlers reportedly use to understand site structure. Expanded 2026-07 with a "How search and filtering works" plain-language paragraph and links to `/about`/`/cities`/`/for-owners`.
- Favor clear, self-contained paragraphs over JS-only rendered content — ISR/SSG (§2) ensures crawlable HTML, not client-only rendering.
- Maintain consistent facts (name, area, price) across a page — LLM summarizers tend to prefer pages with unambiguous, non-conflicting facts.
- Long-tail, question-shaped content ("Is there a girls-only PG near Koramangala under ₹10,000?") maps well to both AEO FAQ schema and natural LLM query phrasing — a strong candidate for the Phase 4 AI SEO copilot to generate at scale, though hand-written FAQ blocks in Phase 3 already help.

## 6. Implementation notes

- The `generateMetadata` fallback precedence order is now a single documented function — `src/lib/seo.ts`'s `resolveSeo()` — used by both `pg/[city]/page.tsx` and `pg/[city]/[area]/[slug]/page.tsx`'s `generateMetadata`, rather than duplicated inline `??` chains. Unit-tested in `src/lib/__tests__/seo.test.ts`.
- Canonical URLs: an area page and its parent city page can list overlapping PGs — use canonical tags carefully to avoid the two pages competing with each other in search results. The root layout now also sets a homepage canonical (`alternates.canonical: "/"`) — safe only because every other route either sets its own canonical or is `noindex`, verified before adding it.
- Image `alt_text` is enforced at the data layer (see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#listing_images)), not just recommended in the UI.
- **Accessibility/Lighthouse-100 pass (2026-07)**: `e2e/a11y.spec.ts` (axe-core) and `e2e/seo.spec.ts` run against every public page plus a live city/listing page pulled from the real sitemap. This found and fixed real pre-existing contrast bugs (footer text at 40% opacity, several `--state-*-fg`/`--state-*-bg` pairs sitewide, `grey-400` on white) and missing `<select>` accessible names on the city filter form — see `src/app/globals.css`'s state-color comments for the corrected values.

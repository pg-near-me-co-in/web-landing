# PG Near Me

Free directory of PGs, hostels and shared flats across India — Next.js 16 (App Router), React 19, Tailwind v4.

Start here: [docs/PRD.md](docs/PRD.md) and [docs/ROADMAP.md](docs/ROADMAP.md). This is **Phase A**: a JSON-file-driven public site (see [docs/DATA_MODEL.md](docs/DATA_MODEL.md)) — no database is provisioned yet, by design.

## Development

```sh
npm install
npm run dev
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build + serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (`__tests__/`) |
| `npm run test:e2e` | Playwright e2e — builds + serves the app, then runs `e2e/` |

## Adding a new city or listing

Edit `data/cities.json` / `data/listings.json` directly (shapes documented in `lib/types.ts` and [docs/DATA_MODEL.md](docs/DATA_MODEL.md)), then redeploy. There's no admin UI in Phase A because there's no database yet to persist writes to.

## Analytics

GA4 + Microsoft Clarity, both free and both off by default. See `.env.example` and [docs/ANALYTICS_TRACKING_PLAN.md](docs/ANALYTICS_TRACKING_PLAN.md).

## Docs index

- [PRD.md](docs/PRD.md) — product scope and non-goals
- [ROADMAP.md](docs/ROADMAP.md) — Phase A/B/C plan
- [DATA_MODEL.md](docs/DATA_MODEL.md) — current JSON shape + planned Postgres schema
- [SEO_AEO_GEO_STRATEGY.md](docs/SEO_AEO_GEO_STRATEGY.md)
- [ANALYTICS_TRACKING_PLAN.md](docs/ANALYTICS_TRACKING_PLAN.md)
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
- [PWA_SPEC.md](docs/PWA_SPEC.md)
- [GLOSSARY.md](docs/GLOSSARY.md)

# PG Near Me

PG / hostel / flatmate-sharing listing and discovery platform for India.

Domain: **pgnearme.co.in**

## Status

Pre-implementation. No application code exists yet — this repo currently holds only the planning documentation in [`docs/`](docs/) plus an empty `web-landing/` folder.

## Start here

- [docs/PRD.md](docs/PRD.md) — what this product is, who it's for, MVP vs. full vision
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased build sequence (Phase 0 through Phase 4)
- [docs/GLOSSARY_AND_OPEN_QUESTIONS.md](docs/GLOSSARY_AND_OPEN_QUESTIONS.md) — open decisions that need founder sign-off before the relevant phase starts

## Full doc set

| Doc | Covers |
|---|---|
| [PRD.md](docs/PRD.md) | Product requirements |
| [ROADMAP.md](docs/ROADMAP.md) | Phase 0–4 build sequence |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Supabase/Postgres schema |
| [SEO_AEO_GEO_STRATEGY.md](docs/SEO_AEO_GEO_STRATEGY.md) | Search, answer-engine, and generative-engine optimization |
| [ADMIN_PANEL_SPEC.md](docs/ADMIN_PANEL_SPEC.md) | Admin panel modules |
| [DATA_PIPELINE_SCRAPER.md](docs/DATA_PIPELINE_SCRAPER.md) | Data ingestion/scraper architecture |
| [ANALYTICS_TRACKING_PLAN.md](docs/ANALYTICS_TRACKING_PLAN.md) | GA4/Clarity/Vercel Analytics event taxonomy |
| [PWA_SPEC.md](docs/PWA_SPEC.md) | Progressive Web App requirements |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | UI/UX conventions, homepage layout |
| [AI_FEATURES_SPEC.md](docs/AI_FEATURES_SPEC.md) | Phase 4 AI features |
| [GLOSSARY_AND_OPEN_QUESTIONS.md](docs/GLOSSARY_AND_OPEN_QUESTIONS.md) | Terminology + unresolved decisions |

## Planned stack

Next.js (App Router) + Supabase (Postgres/Auth/Storage) + Tailwind CSS, deployed on Vercel. See [PRD.md](docs/PRD.md) and [ROADMAP.md](docs/ROADMAP.md) for details — Phase 0 scaffolds the actual project.

# PG Near Me — AI Features Spec

**Phase 4 only** (see [ROADMAP.md](ROADMAP.md)). This is forward-looking design, not a committed build — sequenced last because it depends on a mature data set, a working admin moderation loop, and (for the trending-suggestions feature) real traffic/lead volume. Status: draft, pending founder review.

Cross-cutting rule for every feature below: **AI suggests, a human approves.** Nothing an AI generates publishes or reaches a public page without an explicit admin/owner approval step — this applies especially to SEO content and listing descriptions, where bad AI output could misrepresent a real property.

## Features

1. **AI search/chat assistant** — conversational "find me a PG" experience layered over the existing filtered-search backend (built in Phase 2). This is RAG-lite over `pg_listings` data, not an open-ended LLM chat — it translates natural language into the same structured filters the UI search already supports, then returns results from the real database.

2. **AI-assisted owner listing-description generation** — the owner submission form (Phase 1) gains a "generate description" helper that drafts listing copy from the structured fields the owner already entered (PG type, price, amenities, sharing type). Owner reviews/edits before submitting.

3. **AI-suggested tags/categorization** — assists the admin scrape review queue ([DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md)) by pre-tagging ingested raw listings with likely amenities/category, speeding up admin triage. Suggestion only — admin confirms before it writes to `pg_listings`.

4. **AI-based review summarization** — a short synthesized summary shown above raw reviews on detail pages once a listing has enough reviews to make raw browsing tedious. Summary is regenerated periodically, not on every page load.

5. **AI SEO copilot** — in the admin's SEO field editor ([ADMIN_PANEL_SPEC.md](ADMIN_PANEL_SPEC.md#seo-field-editor)), suggests titles/descriptions/FAQ content per page. Writes to `page_seo_meta.ai_generated = true` only after admin approval — see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#page_seo_meta-dynamic-per-route-seo--phase-3). Long-tail, question-shaped FAQ content is a good target here, feeding directly into the AEO/GEO strategy ([SEO_AEO_GEO_STRATEGY.md](SEO_AEO_GEO_STRATEGY.md#5-geo--being-well-cited-by-llm-search)).

6. **"What's trending near you" suggestions** — surfaces popular/high-lead-volume listings near a user's searched area. Sequenced last deliberately: needs enough traffic and `leads` data to be a meaningful signal rather than noise.

## Non-goals for Phase 4

- No fully autonomous content publishing — every item above keeps a human-in-the-loop step.
- No AI-generated reviews or fabricated listing data — AI only works with data that real owners/scrapers/users already provided.

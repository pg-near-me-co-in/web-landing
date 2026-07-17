# PG Near Me — Glossary & Open Questions

**Read this one directly, founder.** Everything else in `docs/` makes a reasonable assumption where the notes were ambiguous — this doc lists every one of those assumptions so they can be confirmed or corrected before the phase that depends on them starts.

## Glossary

- **PG** — Paying Guest accommodation (India-specific term for a room/bed rented in a shared house, typically with meals, common in student/working-professional housing).
- **IP** — "Interested party": the notebook's term for a seeker who has expressed interest by giving their mobile number, i.e. a lead. Modeled as the `leads` table ([DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#leads-the-notebooks-ip--interested-party--capture)).
- **Trust / data-rating score** — a computed quality score per listing, distinct from the raw star rating, meant to reflect overall listing trustworthiness (review quality + recency, verification status, data completeness). Modeled as `pg_listings.trust_score`.
- **Strict / Liberal** — house-rules strictness for a PG (curfew, guest policy, etc.), modeled as `house_rules_strictness`.
- **AEO** — Answer Engine Optimization: optimizing for voice assistants, featured snippets, and AI Overviews to directly answer a query.
- **GEO** — Generative Engine Optimization: optimizing to be well-cited/summarized by LLM-based search tools (ChatGPT, Perplexity, etc.).

## Open questions (need founder sign-off before the relevant phase starts)

1. **Icon filter shortcuts (M, V, A, B, H, D)** on the homepage search bar in the notebook sketch — exact meaning unconfirmed. Best-guess mapping proposed for confirmation: M = Men's PG, V = Villa/Flat share, A = Apartment, B = Boys hostel (may overlap with M — needs disambiguation), H = Hostel, D = Dormitory. Needed before Phase 1 filter logic is built.

2. **"Lock/get" tracking terminology** — modeled generically in the schema as `leads.intent` (`contact_reveal` / `enquiry_form` / `callback_request`). Needs confirmation of what specific user action this refers to — e.g. is "lock" literally an unlock-to-reveal-phone-number gate, or just an internal analytics label for the reveal click?

3. **Top cities to launch** — Phase 0 research task is scoped in [ROADMAP.md](ROADMAP.md) but not yet done. Needed before `cities` table seed data / Phase 1 launch scope is finalized.

4. **Religion-preference field** — the notebook lists this as a listing attribute. Flagged for a sensitivity/compliance framing review (housing-discrimination-adjacent in some contexts) before it ships as a public-facing filter. Recommend confirming intended UX framing (e.g. "no restriction" as the prominent default, informational rather than a hard filter) with the founder before Phase 1 ships it.

5. **Scrape source legality** — explicitly deferred per the founder's own instruction to "check" rather than build blindly. No specific target site should be named or implemented until a legal/ToS review clears it — see [DATA_PIPELINE_SCRAPER.md](DATA_PIPELINE_SCRAPER.md). Gated in schema by `scrape_sources.legal_review_status`.

6. **Reviews in Phase 1** — the notebook lists reviews as a detail-page field but doesn't specify whether seekers can submit reviews without login in Phase 1, or whether Phase 1 only *displays* admin-seeded reviews. Current plan assumes: display-only in Phase 1 (admin-seeded), review *submission* UI arrives in Phase 2. Confirm this is right.

7. **"Sticky to device height on scroll"** header behavior — the exact interaction intended (simple sticky header vs. something more elaborate like shrink-on-scroll) needs a quick confirmation, or a reference example site from the founder.

8. **Trust/data-rating score formula** — flagged with a star (⭐) in the notebook as important, but no formula specified. Plan is to ship a placeholder weighted-average formula in Phase 2 (review rating + recency/volume + field completeness + verification recency) and refine with founder input.

9. **Owner authentication timeline** — confirmed no login in Phase 1. Schema anticipates owners eventually claiming/managing their own listings via a real account (Phase 2+), but this isn't committed to a specific phase yet. Confirm whether owner accounts (Supabase Auth) are actually in scope, and for which phase, or whether the product stays admin-mediated (owners submit via form, admin publishes) indefinitely.

10. ~~**Repo structure**~~ — resolved: the repo now lives in `web-landing/` (docs + git root), so the Next.js app scaffolds directly there in Phase 0.

11. **Logo type-treatment confirmation** — the brand Figma file ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#logo)) contains two wordmark styles (a rounded "Cherry Bomb" treatment and a bolder slab-serif alternative) shown side by side. The standalone lockup outside that comparison grid uses Cherry Bomb, which is why it's documented as the chosen primary logo — but this is an inference, not an explicit label in the file. Confirm Cherry Bomb is final before it's wired into the codebase.

12. **Icon-only favicon/app-icon mark** — every exported logo lockup pairs the roof icon with the full "NEAR ME" wordmark; there's no icon-only mark for small sizes (16–32px favicon, app-icon glyph). Needed before Phase 3 PWA icons ([PWA_SPEC.md](PWA_SPEC.md)) ship — either the founder provides one or it gets derived (roof + "PG" only) and sent back for approval.

13. **Body/UI font pairing** — the Figma file only specifies Cherry Bomb for the logo wordmark (a heavy display face, not meant for body copy). A body/UI font still needs picking at Phase 0 scaffolding time — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#typography).

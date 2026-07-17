# PG Near Me — Admin Panel Spec

Modules, mapped to the roadmap phase that introduces them. See [ROADMAP.md](ROADMAP.md) for phase context and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for the underlying tables.

Phase 1 has **no admin UI** — any moderation needed is done manually via the Supabase dashboard/SQL. The admin panel itself starts in Phase 2.

| Module | Description | Phase |
|---|---|---|
| Auth & roles | Supabase Auth login; role-gated routes (`super_admin`, `editor`, `moderator`, `analyst`) | 2 |
| Listings management | CRUD on `pg_listings`, bulk status changes, image management, amenity tagging | 2 |
| Owner submission approval queue | List of `status='pending_review', source='owner_submission'` rows with approve / reject / edit-before-publish actions | 2 |
| Review moderation | Approve/reject `reviews`, spam flagging | 2 |
| Lead inbox | Searchable/exportable `leads` list, filter by city/listing/date, CSV export | 2 |
| City & area management | Add/edit cities & areas, toggle `is_launched`/`is_active`, reorder homepage "Explore citywise" cards | 2 |
| SEO field editor | Per-route/per-entity editor for `page_seo_meta` (title, description, OG image, custom JSON-LD) with live preview | 3 |
| Theme & font settings | Editable `site_settings` for brand color, heading/body fonts, logo — live preview against a sample page | 3 |
| Scrape review queue | Review `ingested_raw_listings`: approve as new / merge into existing (dedup confidence shown) / reject | 3 |
| Scrape source management | CRUD on `scrape_sources`, `legal_review_status` gate, manual job trigger, job history/logs | 3 |
| Data verification / staleness dashboard | Listings past the re-verification threshold; one-click "mark verified" or "flag for owner re-confirmation" | 3 |
| Analytics overview | Embedded/linked GA4 + Clarity summaries, or a lightweight internal dashboard over `leads`/pageview data | 3 |
| AI SEO copilot | Suggested titles/descriptions/FAQ content per page; human approves before it writes to `page_seo_meta` — never auto-publish AI content | 4 |
| AI content assist in listing edit | "Improve description" / "Suggest tags" actions inline in listings management | 4 |

## Cross-cutting requirements

- Every write action should be attributable: `updated_by`/`reviewed_by` columns already exist on the relevant tables; add a dedicated `admin_audit_log` table in Phase 2 (actor, entity type/id, before/after diff) given how moderation-heavy this product is — see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#admin_audit_log-consider-adding-in-phase-2).
- All AI-assisted admin actions (Phase 4) are suggest-only — nothing an AI generates publishes without an explicit human approval click.
- Role permissions: `analyst` is read-only (analytics only), `moderator` can approve/reject listings and reviews but not touch SEO/theme/scrape-source config, `editor` gets content + SEO/theme access, `super_admin` gets everything including scrape source and role management.

# PG Near Me — Admin Panel Spec

Modules, mapped to the roadmap phase that introduces them. See [ROADMAP.md](ROADMAP.md) for phase context and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for the underlying tables.

Phase 1 has **no admin UI** — any moderation needed is done manually via the Supabase dashboard/SQL. The admin panel itself starts in Phase 2.

| Module | Description | Phase |
|---|---|---|
| Auth & roles | Supabase Auth login; role-gated routes (`super_admin`, `editor`, `moderator`, `analyst`) — **not yet implemented**, still gated by the shared `ADMIN_ACCESS_CODE` cookie (see Cross-cutting requirements below) | 2 |
| Listings management | **Implemented 2026-07** — `/admin/listings` list (search/status/city/type filters, pagination) + `/admin/listings/[id]` (full field edit incl. amenities, soft-delete via `status='archived'`) + `/admin/listings/new`. Image management (add/remove/reorder/set-cover) is **not** in this pass — a known gap, listing photos are still only manageable via the owner-submission upload flow | 2 |
| Owner submission approval queue | List of `status='pending_review', source='owner_submission'` rows with approve / reject / edit-before-publish actions | 2 |
| Review moderation | Approve/reject `reviews`, spam flagging | 2 |
| Lead inbox | Searchable/exportable `leads` list, filter by city/listing/date, CSV export | 2 |
| City & area management | **Implemented 2026-07** — `/admin/cities` (+ `[id]`, `new`) covers name/state/tagline/hero_image_url/`is_launched`; `/admin/areas` (+ `[id]`, `new`) covers name/city/`is_active`. Both use soft-delete (`is_launched`/`is_active` toggle), never hard-delete — see Cross-cutting requirements | 2 |
| Amenities management | **Implemented 2026-07**, not originally in this table — `/admin/amenities` (+ `[id]`, `new`); hard-delete only when unreferenced by any listing, otherwise soft-delete via `is_active` | 2 |
| Owners management | **Implemented 2026-07**, not originally in this table — `/admin/owners` (+ `[id]`); no standalone "new owner" form since owner records are created implicitly by listing submission/creation | 2 |
| SEO field editor | Per-route/per-entity editor for `page_seo_meta` (title, description, OG image, custom JSON-LD) with live preview | 3 |
| Theme & font settings | Editable `site_settings` for brand color, heading/body fonts, logo — live preview against a sample page | 3 |
| Scrape review queue | Review `ingested_raw_listings`: approve as new / merge into existing (dedup confidence shown) / reject | 3 |
| Scrape source management | CRUD on `scrape_sources`, `legal_review_status` gate, manual job trigger, job history/logs | 3 |
| Data verification / staleness dashboard | Listings past the re-verification threshold; one-click "mark verified" or "flag for owner re-confirmation" | 3 |
| Analytics overview | Embedded/linked GA4 + Clarity summaries, or a lightweight internal dashboard over `leads`/pageview data | 3 |
| AI SEO copilot | Suggested titles/descriptions/FAQ content per page; human approves before it writes to `page_seo_meta` — never auto-publish AI content | 4 |
| AI content assist in listing edit | "Improve description" / "Suggest tags" actions inline in listings management | 4 |

## Cross-cutting requirements

- Every write action should be attributable: `updated_by`/`reviewed_by` columns already exist on the relevant tables; `admin_audit_log` (in schema since `0001_init.sql`) is **now actually written to** (implemented 2026-07, via `src/lib/audit.ts`'s `logAdminAction()`) by every Phase 7b CRUD action (listings/cities/areas/amenities/owners create/update/soft-delete) — verified end-to-end. `actor` stays `null` on every row: there is no real per-account admin identity to attribute to yet, only the shared access-code gate below. Older actions (submissions/reviews/theme/SEO approve-reject) predate this and don't yet call it — a good next-pass candidate, not done in this pass.
- All AI-assisted admin actions (Phase 4) are suggest-only — nothing an AI generates publishes without an explicit human approval click.
- Role permissions: `analyst` is read-only (analytics only), `moderator` can approve/reject listings and reviews but not touch SEO/theme/scrape-source config, `editor` gets content + SEO/theme access, `super_admin` gets everything including scrape source and role management. **Still not implemented** — admin access today is a single shared `ADMIN_ACCESS_CODE` (HMAC-signed cookie, `src/lib/admin-auth.ts`), not per-account Supabase Auth, so there is no real role distinction yet. Scrape-source management and admin user/role management were explicitly scoped **out** of the 2026-07 CRUD pass for this reason — building them out meaningfully requires the Auth migration first.
- **Delete semantics** (2026-07 CRUD pass): "delete" is soft-delete via existing enum/boolean fields wherever one exists — `pg_listings.status='archived'`, `cities.is_launched=false`, `areas.is_active=false`. Real hard-delete is offered only for `amenities`, and only when zero `listing_amenities` rows reference it (checked server-side before allowing it) — a deliberate choice to avoid FK/trigger surprises (`listing_count_cache`, `rating_avg` triggers, `listing_images`/`reviews`/`leads` referencing a listing).

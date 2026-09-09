# PG Near Me — PWA Spec

## Phase A (current): installability metadata only

`app/manifest.ts` (Next's native `MetadataRoute.Manifest`, served at `/manifest.webmanifest`) declares name, theme/background color (brand primary `#534AB7` / `#F4F6F8`), `display: standalone`, and icons. `app/icon.png` gives Next.js's built-in favicon/apple-touch-icon handling for free — no custom icon-generation script needed for this phase.

**Deliberately not built yet**: a service worker, offline shell, and install-prompt banner. Those add real complexity (cache invalidation, "don't nag" dismissal logic) that isn't worth it before there's a database and real users to observe drop-off from. Revisit once Phase B analytics (Microsoft Clarity) shows enough mobile session volume to justify it.

## Phase B/C: full PWA

- **Service worker**: cache-first for static assets, network-first-with-fallback for listing/city pages, never-cache for lead/owner-submission requests.
- **Install prompt**: custom "Add to Home Screen" banner — show once, respect dismissal, re-offer after ~14 days.
- Icon set regenerated from a single source mark at multiple sizes/purposes (`any` + `maskable`, properly safe-zone-padded).

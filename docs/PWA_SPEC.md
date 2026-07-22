# PG Near Me — PWA Spec

Phase 3 feature (see [ROADMAP.md](ROADMAP.md)). Goal: installable, app-like experience for PG seekers who are predominantly on mobile.

## Manifest

`manifest.json`: app name ("PG Near Me"), short_name, `theme_color`/`background_color` = Primary `#534AB7` (from [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#color-palette), overridable later via `site_settings` — see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#site_settings-themefontsglobal-config--phase-3)), `display: standalone`, start_url.

Icons: source art is the icon-only roofline mark derived by [`scripts/make-app-icons.js`](../scripts/make-app-icons.js) from `docs/assets/brand/pg-near-me-logo.svg` (open question #12, resolved — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md#logo)). Generates `icon-{192,512}.png` (purpose `any`) and correctly safe-zone-padded `maskable-{192,512}.png` — the previous maskable files were unpadded copies of the flat icon, a real bug this fixes.

## Service worker

- **Cache-first** for static assets (JS/CSS bundles, icons, fonts).
- **Network-first with cache fallback** for listing/city pages — so recently viewed pages remain accessible offline-ish, while still preferring fresh data when online.
- **Never cache** the lead-submission or owner-submission POST endpoints — these must always hit the network; a cached "success" response would be actively misleading.

## Install prompt

Custom "Add to Home Screen" banner, respecting platform install criteria (HTTPS — already required for pgnearme.co.in, valid manifest, registered service worker). Don't nag: show once, respect dismissal, re-offer only after a reasonable interval or a return visit.

## Implementation note

Next.js doesn't ship PWA support out of the box — implemented by hand: `src/app/manifest.ts` (Next's native `MetadataRoute.Manifest`, served at `/manifest.webmanifest`), `public/sw.js` (plain service worker, no Workbox/next-pwa), `src/components/pwa.tsx` (registration + install banner).

## Re-verified 2026-07 (bento re-skin)

Confirmed the Phase 1 icon regeneration and Phase 2 token swap didn't regress installability: `manifest.ts` icon paths unchanged (Phase 1 regenerated their *content* in place — now icon-only and properly safe-zone-padded for maskable), `theme_color`/`background_color` unchanged (same brand palette). `public/sw.js`'s cache names bumped to `v3` so existing installs drop pre-refresh cached CSS/fonts/icons rather than serving them indefinitely. Covered by `e2e/pwa.spec.ts` (manifest validity, both icon purposes present, every manifest icon actually resolves, SW file served, offline fallback renders).

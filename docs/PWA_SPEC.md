# PG Near Me — PWA Spec

Phase 3 feature (see [ROADMAP.md](ROADMAP.md)). Goal: installable, app-like experience for PG seekers who are predominantly on mobile.

## Manifest

`manifest.json`: app name ("PG Near Me"), short_name, icons (multiple sizes — 192px, 512px minimum, maskable variant recommended), `display: standalone`, theme color pulled from `site_settings` if feasible at implementation time (see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md#site_settings-themefontsglobal-config--phase-3)), start_url.

## Service worker

- **Cache-first** for static assets (JS/CSS bundles, icons, fonts).
- **Network-first with cache fallback** for listing/city pages — so recently viewed pages remain accessible offline-ish, while still preferring fresh data when online.
- **Never cache** the lead-submission or owner-submission POST endpoints — these must always hit the network; a cached "success" response would be actively misleading.

## Install prompt

Custom "Add to Home Screen" banner, respecting platform install criteria (HTTPS — already required for pgnearme.co.in, valid manifest, registered service worker). Don't nag: show once, respect dismissal, re-offer only after a reasonable interval or a return visit.

## Implementation note

Next.js doesn't ship PWA support out of the box. Rather than lock a specific plugin/library choice now, evaluate a maintained App Router–compatible PWA solution at Phase 3 implementation time — the ecosystem shifts and today's pick may be stale by then.

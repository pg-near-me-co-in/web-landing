/* PG Near Me service worker — strategies per docs/PWA_SPEC.md:
 * - cache-first for static assets (hashed JS/CSS, icons, fonts)
 * - network-first with cache fallback for pages (listing/city HTML)
 * - never touch non-GET requests (lead/owner submissions must hit the network)
 */
// v3 (2026-07 bento re-skin): bumped so existing installs drop stale
// cached CSS/fonts/icons from before the token/logo refresh instead of
// serving them indefinitely.
const STATIC_CACHE = "pgnm-static-v3";
const PAGE_CACHE = "pgnm-pages-v3";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // POSTs always hit the network
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // cache-first: immutable build assets + icons + fonts
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/image")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // network-first: page navigations, fallback to cache then offline shell
  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          const hit = await cache.match(request);
          return hit ?? cache.match(OFFLINE_URL);
        }
      })
    );
  }
});

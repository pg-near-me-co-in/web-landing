// PWA install-prompt helper. This project ships a manifest for
// installability + home-screen support. No app-shell service worker is
// registered — offline is not in scope for now.
//
// This module also unregisters any legacy /sw.js that may exist from prior
// experiments, so returning users don't get stuck on stale caches.

export function initPwa() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Kill switch: unregister any existing app service worker (safe in preview).
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      const url = reg.active?.scriptURL ?? "";
      if (url.endsWith("/sw.js") || url.endsWith("/service-worker.js")) {
        reg.unregister().catch(() => {});
      }
    }
  }).catch(() => {});
}

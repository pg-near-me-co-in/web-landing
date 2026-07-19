"use client";

// GA4 custom-event helper (taxonomy per docs/ANALYTICS_TRACKING_PLAN.md).
// No-ops when gtag isn't loaded (dev, blockers).
type GtagParams = Record<string, string | number | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagParams) => void;
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

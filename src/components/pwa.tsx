"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pgnm-install-dismissed-at";
const REOFFER_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker and renders a polite install banner
 *  (show once, respect dismissal, re-offer after 14 days — per PWA_SPEC). */
export function Pwa() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      const daysSince = (Date.now() - dismissedAt) / 86400000;
      if (dismissedAt && daysSince < REOFFER_DAYS) return;
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!installEvt) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[420px] items-center justify-between gap-3 rounded-2xl bg-grey-900 p-3.5 pl-4 text-white shadow-elevated">
      <p className="min-w-0 flex-1 text-[13px] leading-snug">
        Install PG Near Me for one-tap access to your searches and listings.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={async () => {
            await installEvt.prompt();
            setInstallEvt(null);
          }}
          className="rounded-md bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark"
        >
          Install
        </button>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
            setInstallEvt(null);
          }}
          aria-label="Dismiss install prompt"
          className="p-1 text-lg text-white/50 transition hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-grey-50 bg-white p-3 pl-4 shadow-xl">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-grey-900">Add PG Near Me to your home screen</p>
        <p className="text-xs text-grey-400">Faster searches, works offline</p>
      </div>
      <button
        onClick={async () => {
          await installEvt.prompt();
          setInstallEvt(null);
        }}
        className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white"
      >
        Install
      </button>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
          setInstallEvt(null);
        }}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-full p-2 text-grey-400 hover:text-grey-600"
      >
        ✕
      </button>
    </div>
  );
}

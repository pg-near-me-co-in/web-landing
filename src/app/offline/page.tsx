import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="eyebrow mb-4">OFFLINE</span>
      <p className="font-display text-3xl font-bold text-grey-900">
        You&apos;re offline
      </p>
      <p className="mt-3 max-w-sm text-grey-500">
        Recently viewed PGs stay available offline. Reconnect to browse fresh
        listings.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        Try again
      </Link>
    </main>
  );
}

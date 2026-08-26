"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="eyebrow mb-4">SOMETHING WENT WRONG</span>
      <h1 className="font-display text-3xl font-bold text-grey-900">This page hit a snag</h1>
      <p className="mt-3 max-w-md text-grey-500">
        That&apos;s on us, not you. Try again, or head back home — everything else on the site is unaffected.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Try again
        </button>
        <Link href="/" className="rounded-md border border-grey-100 px-5 py-2.5 text-sm font-semibold text-grey-800 transition hover:border-primary/50">
          Back to home
        </Link>
      </div>
    </main>
  );
}

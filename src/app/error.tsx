"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="eyebrow mb-4">SOMETHING WENT WRONG</span>
      <h1 className="font-display text-3xl font-bold text-grey-900">
        That didn&apos;t work.
      </h1>
      <p className="mt-3 max-w-sm text-grey-500">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-grey-100 bg-white px-6 py-3 text-sm font-semibold text-grey-800 transition hover:border-primary hover:text-primary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

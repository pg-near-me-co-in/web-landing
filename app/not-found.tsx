import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="eyebrow mb-4">404</span>
      <h1 className="font-display text-3xl font-bold text-grey-900">Page not found</h1>
      <p className="mt-3 max-w-md text-grey-500">
        This page doesn&apos;t exist, or the listing may no longer be published.
      </p>
      <Link href="/" className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
        Back to home
      </Link>
    </main>
  );
}

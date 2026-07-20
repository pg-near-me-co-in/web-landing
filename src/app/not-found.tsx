import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="eyebrow mb-4">404</span>
      <h1 className="font-display text-3xl font-bold text-grey-900">
        This page moved out.
      </h1>
      <p className="mt-3 max-w-sm text-grey-500">
        The page you&apos;re looking for doesn&apos;t exist — but your next
        room might.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-[10px] bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Back to home
        </Link>
        <Link
          href="/#cities"
          className="rounded-[10px] border border-grey-100 bg-white px-6 py-3 text-sm font-semibold text-grey-800 transition hover:border-primary hover:text-primary"
        >
          Browse cities
        </Link>
      </div>
    </main>
  );
}

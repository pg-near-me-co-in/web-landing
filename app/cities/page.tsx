import type { Metadata } from "next";
import Link from "next/link";
import { getCitiesByState } from "@/lib/data/cities";

export const metadata: Metadata = {
  title: "All cities — PGs, hostels & shared flats across India",
  description: "Browse every city PG Near Me covers or is rolling out next, grouped by state.",
  alternates: { canonical: "/cities" },
};

export default function CitiesPage() {
  const byState = getCitiesByState();

  return (
    <main className="w-full flex-1">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">ALL CITIES</span>
        <h1 className="font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-[1.08] text-grey-900">
          Wherever you&apos;re headed, we&apos;re building toward it.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-grey-500">
          Live cities are fully browsable today. The rest are on our rollout list — check back, or list your PG
          there now so it&apos;s ready the day we launch.
        </p>

        <div className="mt-10 space-y-10">
          {Object.entries(byState).map(([state, cities]) => (
            <section key={state}>
              <h2 className="font-display text-lg font-bold text-grey-900">{state}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {cities.map((c) =>
                  c.is_launched ? (
                    <Link
                      key={c.slug}
                      href={`/pg/${c.slug}`}
                      className="surface-card flex items-center justify-between gap-2 p-4 transition hover:border-primary/50"
                    >
                      <span className="text-sm font-semibold text-grey-800">{c.name}</span>
                      <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold text-success-fg">LIVE</span>
                    </Link>
                  ) : (
                    <div key={c.slug} className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-grey-100 bg-white p-4">
                      <span className="text-sm font-semibold text-grey-500">{c.name}</span>
                      <span className="text-[10px] font-semibold text-grey-500">SOON</span>
                    </div>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

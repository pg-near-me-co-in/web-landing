import Link from "next/link";
import { getCitiesByState, getFeaturedListings } from "@/lib/queries";
import { SearchBar } from "@/components/search-bar";
import { ListingCard } from "@/components/listing-card";
import { PG_TYPE_LABEL } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const revalidate = 3600;

const QUICK_TYPES: PgType[] = ["female", "male", "unisex"];

export default async function HomePage() {
  const [byState, featured] = await Promise.all([
    getCitiesByState(),
    getFeaturedListings(6),
  ]);
  const allCities = Object.values(byState).flat();
  const launched = allCities.filter((c) => c.is_launched);
  const defaultCity = launched[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "PG Near Me", url: "https://pgnearme.co.in" },
      { "@type": "Organization", name: "PG Near Me", url: "https://pgnearme.co.in" },
    ],
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/20 via-grey-5 to-grey-5 px-4 pb-16 pt-14 text-center sm:pt-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl space-y-6">
          <h1 className="font-display text-4xl leading-tight text-grey-900 sm:text-5xl">
            Find your next <span className="text-primary">PG</span>, minus the
            brokers
          </h1>
          <p className="mx-auto max-w-xl text-base text-grey-500 sm:text-lg">
            Hostels, PGs and shared flats across India — filtered by budget,
            sharing type and house rules. Free for seekers, free for owners.
          </p>
          <SearchBar
            cities={allCities.map(({ name, slug, state, is_launched }) => ({
              name,
              slug,
              state,
              is_launched,
            }))}
          />
          {defaultCity && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {QUICK_TYPES.map((t) => (
                <Link
                  key={t}
                  href={`/pg/${defaultCity.slug}?type=${t}`}
                  className="rounded-full border border-grey-100 bg-white px-4 py-1.5 text-sm font-semibold text-grey-600 transition hover:border-primary hover:text-primary"
                >
                  {PG_TYPE_LABEL[t]} PGs
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map section (static embed for Phase 1) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-grey-50 shadow-sm">
          <iframe
            title="PG Near Me — launched cities across India"
            src="https://www.openstreetmap.org/export/embed.html?bbox=66.0,6.5,98.0,36.0&layer=mapnik"
            className="h-64 w-full sm:h-80"
            loading="lazy"
          />
          <div className="flex flex-wrap items-center gap-2 bg-white px-5 py-4">
            <span className="text-sm font-semibold text-grey-600">
              Live in {launched.length} cities:
            </span>
            {launched.map((c) => (
              <Link
                key={c.slug}
                href={`/pg/${c.slug}`}
                className="rounded-full bg-grey-10 px-3 py-1 text-xs font-bold text-grey-600 transition hover:bg-primary hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl text-grey-900 sm:text-3xl">
              Featured stays
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Explore citywise */}
      <section id="explore-cities" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl text-grey-900 sm:text-3xl">
            Explore citywise
          </h2>
          <p className="mt-1 text-grey-500">
            Top cities across {Object.keys(byState).length} states — live cities
            link straight to their listings.
          </p>
          <div className="mt-8 space-y-8">
            {Object.entries(byState).map(([state, cities]) => {
              const live = cities.filter((c) => c.is_launched);
              const soon = cities.filter((c) => !c.is_launched);
              return (
                <div key={state}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-grey-400">
                    {state}
                  </h3>
                  {live.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {live.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/pg/${c.slug}`}
                          className="group rounded-2xl bg-gradient-to-br from-primary to-purple p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <p className="font-bold">{c.name}</p>
                          <p className="mt-1 text-xs text-white/75">
                            {c.listing_count_cache} PG
                            {c.listing_count_cache === 1 ? "" : "s"} listed
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                  {soon.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-grey-300">Coming soon:</span>
                      {soon.map((c) => (
                        <span
                          key={c.slug}
                          className="rounded-full border border-dashed border-grey-100 px-3 py-1 text-xs font-semibold text-grey-400"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story / about */}
      <section id="our-story" className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl text-grey-900 sm:text-3xl">
          Why PG Near Me is free
        </h2>
        <p className="mt-4 leading-relaxed text-grey-500">
          Finding a PG in a new city usually means broker fees, WhatsApp-group
          chaos and stale listings. We&apos;re building one trustworthy,
          filterable directory for PGs, hostels and shared flats — where owners
          list for free and seekers contact them directly. No commissions, no
          middlemen, just verified information and honest reviews.
        </p>
        <Link
          href="/add-your-pg"
          className="mt-6 inline-block rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-highlight"
        >
          Own a PG? List it free →
        </Link>
      </section>
    </main>
  );
}

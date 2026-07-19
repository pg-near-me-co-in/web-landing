import Link from "next/link";
import { getCitiesByState, getFeaturedListings } from "@/lib/queries";
import { SearchBar } from "@/components/search-bar";
import { ListingCard } from "@/components/listing-card";
import { PG_TYPE_LABEL } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const revalidate = 3600;

const QUICK_TYPES: PgType[] = ["female", "male", "unisex"];

const BENEFITS = [
  {
    icon: "₹0",
    title: "Zero brokerage",
    text: "No commissions, no hidden fees. Seekers browse free, owners list free — always.",
  },
  {
    icon: "✓",
    title: "Verified listings",
    text: "Every listing is checked by our team before it goes live, and re-checked for staleness.",
  },
  {
    icon: "☎",
    title: "Direct owner contact",
    text: "Get the owner's number and WhatsApp directly — no middlemen relaying messages.",
  },
  {
    icon: "★",
    title: "Honest reviews",
    text: "Ratings and reviews from real residents, summarised so you can decide faster.",
  },
];

const STEPS = [
  {
    title: "Search your city",
    text: "Pick your city and area — we cover PGs, hostels and shared flats across India.",
  },
  {
    title: "Filter & compare",
    text: "Narrow by budget, sharing type, food and house rules. Compare prices side by side.",
  },
  {
    title: "Contact the owner",
    text: "Reveal the owner's number and call or WhatsApp them directly. Done — no broker in between.",
  },
];

const FAQS = [
  {
    q: "Is PG Near Me really free?",
    a: "Yes. PG Near Me is a free directory — seekers browse and contact owners for free, and owners list for free. We charge no brokerage or commission to either side.",
  },
  {
    q: "How do I contact a PG owner?",
    a: "Open any listing and tap “Show contact number”. After sharing your name and phone number, the owner's verified phone and WhatsApp are revealed so you can talk to them directly.",
  },
  {
    q: "Are the listings verified?",
    a: "Listings are reviewed by our team before publishing, and we periodically re-verify prices and availability with owners. Each listing shows when it was last verified.",
  },
  {
    q: "How do I list my PG or hostel?",
    a: "Use the “List your PG — free” button, fill in your property details, and our team will verify and publish it. It takes a few minutes and costs nothing.",
  },
];

export default async function HomePage() {
  const [byState, featured] = await Promise.all([
    getCitiesByState(),
    getFeaturedListings(6),
  ]);
  const allCities = Object.values(byState).flat();
  const launched = allCities.filter((c) => c.is_launched);
  const totalListings = launched.reduce(
    (n, c) => n + (c.listing_count_cache ?? 0),
    0
  );
  const defaultCity = launched[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "PG Near Me", url: "https://pgnearme.co.in" },
      { "@type": "Organization", name: "PG Near Me", url: "https://pgnearme.co.in" },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const stats = [
    { value: `${launched.length}`, label: "cities live" },
    { value: `${totalListings}+`, label: "PGs & hostels listed" },
    { value: "₹0", label: "brokerage, ever" },
    { value: "100%", label: "free for owners" },
  ];

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/20 via-grey-5 to-grey-5 px-4 pb-12 pt-14 text-center sm:pt-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl space-y-6">
          <p className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-success-bg px-3 py-1 text-xs font-bold text-success-fg">
            Verified listings · Zero brokerage · Direct owner contact
          </p>
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
              <Link
                href={`/pg/${defaultCity.slug}`}
                className="rounded-full border border-grey-100 bg-white px-4 py-1.5 text-sm font-semibold text-grey-600 transition hover:border-primary hover:text-primary"
              >
                All in {defaultCity.name}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust stats strip */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-grey-50 bg-grey-50 shadow-sm sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-5 text-center">
              <p className="font-display text-2xl text-primary sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-grey-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl text-grey-900 sm:text-3xl">
                Featured stays
              </h2>
              <p className="mt-1 text-grey-500">
                Hand-picked, recently verified places to start with.
              </p>
            </div>
            {defaultCity && (
              <Link
                href={`/pg/${defaultCity.slug}`}
                className="hidden shrink-0 text-sm font-bold text-primary hover:underline sm:block"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Why PG Near Me */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl text-grey-900 sm:text-3xl">
            Why seekers choose PG Near Me
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-grey-50 bg-grey-5 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-lg text-primary">
                  {b.icon}
                </span>
                <h3 className="mt-3 font-bold text-grey-900">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-grey-500">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-2xl text-grey-900 sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-center text-grey-500">
          From search to move-in, in three steps — with no broker in between.
        </p>
        <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-grey-50 bg-white p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple font-display text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-bold text-grey-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-grey-500">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Explore citywise */}
      <section id="explore-cities" className="scroll-mt-20 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-2xl text-grey-900 sm:text-3xl">
            Explore citywise
          </h2>
          <p className="mt-1 text-grey-500">
            Top cities across {Object.keys(byState).length} states — live cities
            link straight to their listings.
          </p>

          <div className="mt-6 overflow-hidden rounded-3xl border border-grey-50 shadow-sm">
            <iframe
              title="PG Near Me — launched cities across India"
              src="https://www.openstreetmap.org/export/embed.html?bbox=66.0,6.5,98.0,36.0&layer=mapnik"
              className="h-64 w-full sm:h-80"
              loading="lazy"
            />
            <div className="flex flex-wrap items-center gap-2 bg-grey-5 px-5 py-4">
              <span className="text-sm font-semibold text-grey-600">
                Live in {launched.length} cities:
              </span>
              {launched.map((c) => (
                <Link
                  key={c.slug}
                  href={`/pg/${c.slug}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-grey-600 shadow-sm transition hover:bg-primary hover:text-white"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

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
                          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-white/0 transition group-hover:text-white/90">
                            Explore →
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
      <section id="our-story" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 text-center sm:px-6">
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
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl text-grey-900 sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-grey-50 bg-grey-5 p-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-grey-800 transition group-open:text-primary">
                  {f.q}
                  <span className="text-grey-300 transition group-open:rotate-45 group-open:text-primary">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-grey-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-purple p-8 text-white">
            <h2 className="font-display text-2xl">Looking for a PG?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Search {totalListings}+ verified PGs and hostels across{" "}
              {launched.length} cities — free, no brokers.
            </p>
            <Link
              href={defaultCity ? `/pg/${defaultCity.slug}` : "/#explore-cities"}
              className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-grey-10"
            >
              Start searching →
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-teal to-highlight p-8 text-white">
            <h2 className="font-display text-2xl">Own a PG or hostel?</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              List it free and get direct enquiries from seekers — no
              commission, ever.
            </p>
            <Link
              href="/add-your-pg"
              className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-teal transition hover:bg-grey-10"
            >
              List your PG free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getCitiesByState } from "@/lib/queries";
import type { City } from "@/lib/types";
import { CITY_CARD_BG, cityHeroTreatment } from "@/lib/placeholder-images";

export async function generateMetadata(): Promise<Metadata> {
  const byState = await getCitiesByState();
  const all = Object.values(byState).flat();
  const liveCount = all.filter((c) => c.is_launched).length;
  return {
    title: "PGs & shared rooms by city — browse all launched cities",
    description: `Browse verified PGs, hostels and shared flats city by city — ${liveCount} of ${all.length} cities live now, more rolling out. Zero brokerage, direct owner contact.`,
    openGraph: {
      title: "Find a PG in your city — PG Near Me",
      description: "City-by-city directory of verified PGs and shared rooms across India.",
    },
    alternates: { canonical: "/cities" },
  };
}

function CityCard({ city }: { city: City }) {
  return (
    <Link
      href={`/pg/${city.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-grey-50 bg-white shadow-card transition hover:border-primary/40"
    >
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${
          city.hero_image_url ? "" : CITY_CARD_BG[cityHeroTreatment(city.slug)]
        }`}
      >
        {city.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-provided external URL, host not known ahead of time
          <img
            src={city.hero_image_url}
            alt={`${city.name}, ${city.state} — PGs and shared rooms`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-grey-800 backdrop-blur">
          {city.state}
        </div>
        {city.is_launched ? (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Live
          </div>
        ) : (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-grey-500 backdrop-blur">
            Soon
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-grey-900">{city.name}</h3>
        {city.tagline && (
          <p className="mt-1 text-[13px] leading-relaxed text-grey-500">{city.tagline}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-grey-600">
            {city.listing_count_cache} listing{city.listing_count_cache === 1 ? "" : "s"}
          </span>
          <span className="text-sm font-bold text-primary">
            {city.is_launched ? "Browse rooms →" : "Peek early →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function CitiesPage() {
  const byState = await getCitiesByState();
  const all = Object.values(byState).flat();
  const live = all.filter((c) => c.is_launched);
  const soon = all.filter((c) => !c.is_launched);

  const faqs: { q: string; a: string }[] = [
    {
      q: "How many cities does PG Near Me cover?",
      a: `PG Near Me lists PGs, hostels and shared flats in ${all.length} Indian cities, with ${live.length} currently live for browsing and contacting owners; the rest are rolling out as we onboard verified listings.`,
    },
    {
      q: "Is PG Near Me free to use?",
      a: "Yes, in every city. Seekers browse and contact owners for free, and owners list for free — PG Near Me is a directory, not a broker, and never charges commission.",
    },
    {
      q: "My city isn't listed yet — what happens?",
      a: 'We\'re onboarding city by city. Owners in any city can still list for free via "Add your PG" — real supply is what determines when a city goes live for public search.',
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="w-full flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="border-b border-grey-50 bg-grey-5">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <span className="eyebrow mb-4">
            {all.length} CITIES · {live.length} LIVE · MORE ROLLING OUT
          </span>
          <h1 className="max-w-2xl font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-[1.08] text-grey-900">
            Pick your city. Pick your room.
          </h1>
          <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-grey-500">
            Every city gets its own verified directory — no brokers, no bait
            photos, no ghost listings. Tap a city to see what&apos;s live and
            who&apos;s moving in.
          </p>
        </div>
      </section>

      {live.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <span className="eyebrow mb-4">LIVE NOW</span>
          <h2 className="font-display text-[clamp(22px,3vw,30px)] font-bold text-grey-900">
            Ready to move into.
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <CityCard key={c.slug} city={c} />
            ))}
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <span className="eyebrow mb-4">ROLLING OUT</span>
          <h2 className="font-display text-[clamp(22px,3vw,30px)] font-bold text-grey-900">
            Coming to your city soon.
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((c) => (
              <CityCard key={c.slug} city={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="font-display text-xl font-bold text-grey-900">FAQs</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="surface-card group p-4.5">
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
      </section>
    </main>
  );
}

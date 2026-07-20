import Link from "next/link";
import { getCitiesByState, getFeaturedListings } from "@/lib/queries";
import { SearchCard } from "@/components/search-card";
import { ListingCard } from "@/components/listing-card";

export const revalidate = 3600;

const STEPS = [
  {
    idx: "01 / SEARCH",
    title: "Tell us where and what",
    text: "Pick a city, area, or landmark. Filter by budget, gender preference, and sharing type.",
  },
  {
    idx: "02 / COMPARE",
    title: "See verified options",
    text: "Every listing is checked for photos, amenities, and accurate pricing before it goes live.",
  },
  {
    idx: "03 / CONNECT",
    title: "Talk to the owner directly",
    text: "Reveal the owner's number and call or WhatsApp them straight from the listing. No broker fee, ever.",
  },
];

const TYPES = [
  {
    icon: "♀",
    title: "PG for women",
    text: "Verified, secure PGs with women-only floors and strict entry rules where available.",
    query: "?type=female",
  },
  {
    icon: "♂",
    title: "PG for men",
    text: "Single, double & triple sharing with food and housekeeping included.",
    query: "?type=male",
  },
  {
    icon: "⌂",
    title: "Co-living spaces",
    text: "Mixed co-living PGs and hostels for professionals and students.",
    query: "?type=unisex",
  },
  {
    icon: "⇄",
    title: "Shared rooms",
    text: "Split rent in double, triple or 4-bed sharing — fully furnished.",
    query: "?sharing=Double",
  },
];

const WHY = [
  {
    n: "01",
    title: "Verified listings only",
    text: "Every property is checked for accurate photos, pricing and amenities — and re-checked for staleness.",
  },
  {
    n: "02",
    title: "Zero brokerage",
    text: "Talk to owners directly. No hidden commission, ever — free for seekers and owners.",
  },
  {
    n: "03",
    title: "Pan-India, always growing",
    text: "The same simple search, wherever you're headed next — with honest reviews from real residents.",
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
    a: "Use the “List your property” button, fill in your property details, and our team will verify and publish it. It takes a few minutes and costs nothing.",
  },
];

/* ref .city-card background rotation (c1..c8) */
const CITY_CARD_BG = [
  "bg-primary-tint",
  "bg-success-bg",
  "bg-warn-bg",
  "bg-[#EFE9FB]",
  "bg-grey-50",
  "bg-[#E6F6EF]",
  "bg-[#FDF1DC]",
  "bg-[#F1EFFB]",
];

export default async function HomePage() {
  const [byState, featured] = await Promise.all([
    getCitiesByState(),
    getFeaturedListings(6),
  ]);
  const allCities = Object.values(byState).flat();
  const launched = allCities.filter((c) => c.is_launched);
  const comingSoon = allCities.filter((c) => !c.is_launched);
  const totalListings = launched.reduce(
    (n, c) => n + (c.listing_count_cache ?? 0),
    0
  );
  const defaultCity = launched[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "PG Near Me", url: "https://pgnearme.co.in" },
      { "@type": "Organization", name: "PG Near Me", url: "https://pgnearme.co.in", logo: "https://pgnearme.co.in/brand/logo-icon.png" },
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

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero (ref .hero-grid): copy left, search card right */}
      <section id="search" className="scroll-mt-20 px-4 pb-5 pt-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow mb-4">
              ● LIVE IN {launched.length} INDIAN {launched.length === 1 ? "CITY" : "CITIES"}
            </span>
            <h1 className="max-w-[600px] font-display text-[clamp(32px,5vw,54px)] font-bold leading-[1.05] text-grey-900">
              Your next room is <span className="text-primary">closer</span>{" "}
              than you think.
            </h1>
            <p className="mt-4 max-w-[460px] text-[16.5px] leading-relaxed text-grey-500">
              PGs, hostels, and shared rooms — verified, zero brokerage,
              anywhere in India.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={defaultCity ? `/pg/${defaultCity.slug}` : "#cities"}
                className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-primary-dark hover:shadow-[var(--shadow-lift)]"
              >
                Browse listings
              </Link>
              <Link
                href="#how"
                className="rounded-[10px] border border-grey-100 bg-white px-5 py-2.5 text-sm font-semibold text-grey-800 transition hover:border-primary hover:text-primary"
              >
                How it works
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-7">
              {[
                [`${launched.length}`, "Cities covered"],
                [`${totalListings}+`, "Verified listings"],
                ["₹0", "Brokerage, always"],
              ].map(([num, lbl]) => (
                <div key={lbl}>
                  <div className="font-display text-[22px] font-bold text-grey-900">
                    {num}
                  </div>
                  <div className="mt-0.5 text-xs text-grey-500">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <SearchCard
            cities={allCities.map(({ name, slug, state, is_launched }) => ({
              name,
              slug,
              state,
              is_launched,
            }))}
          />
        </div>
      </section>

      {/* How it works (ref .steps) */}
      <section id="how" className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <span className="eyebrow mb-4">HOW IT WORKS</span>
            <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
              Three steps between you and move-in day.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.idx} className="surface-card px-5.5 py-6.5">
                <span className="mb-3.5 block font-mono text-[12.5px] font-semibold text-primary">
                  {s.idx}
                </span>
                <h3 className="font-display text-[17px] font-semibold text-grey-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-grey-500">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities (ref .cities-grid, real data) */}
      <section id="cities" className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <span className="eyebrow mb-4">PAN-INDIA COVERAGE</span>
            <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
              Wherever the move is, we&apos;re already there.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {launched.map((c, i) => (
              <Link
                key={c.slug}
                href={`/pg/${c.slug}`}
                className={`flex min-h-[118px] flex-col justify-between rounded-[14px] p-5 transition duration-200 hover:-translate-y-[3px] ${CITY_CARD_BG[i % CITY_CARD_BG.length]}`}
              >
                <div>
                  <h3 className="font-display text-[15.5px] font-semibold text-grey-900">
                    {c.name}
                  </h3>
                  <div className="mt-1 font-mono text-[11.5px] text-grey-500">
                    {c.listing_count_cache} listing
                    {c.listing_count_cache === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="self-end text-[17px] text-primary" aria-hidden>
                  →
                </div>
              </Link>
            ))}
          </div>
          {/* {comingSoon.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-grey-400">Coming soon:</span>
              {comingSoon.map((c) => (
                <span
                  key={c.slug}
                  className="rounded-full border border-dashed border-grey-100 bg-white px-3 py-1 text-xs font-semibold text-grey-400"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )} */}
        </div>
      </section>

      {/* Featured listings (live data, ref listing-card styling) */}
      {featured.length > 0 && (
        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow mb-4">FRESHLY VERIFIED</span>
                <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
                  Featured stays to start with.
                </h2>
              </div>
              {defaultCity && (
                <Link
                  href={`/pg/${defaultCity.slug}`}
                  className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
                >
                  View all →
                </Link>
              )}
            </div>
            <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Property types (ref .types-grid) */}
      <section id="types" className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <span className="eyebrow mb-4">PROPERTY TYPES</span>
            <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
              Every kind of stay, one search away.
            </h2>
          </div>
          <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((t) => (
              <Link
                key={t.title}
                href={defaultCity ? `/pg/${defaultCity.slug}${t.query}` : "#cities"}
                className="surface-card p-5 transition duration-200 hover:border-accent hover:shadow-[var(--shadow-lift)]"
              >
                <div
                  className="mb-3.5 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-primary text-lg text-white"
                  aria-hidden
                >
                  {t.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-grey-900">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-grey-500">
                  {t.text}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why (ref dark .why-wrap) */}
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl rounded-3xl bg-grey-900 px-6 py-9 text-grey-5/90 sm:px-11 sm:py-13">
          <span className="eyebrow mb-4 !bg-accent/15 !text-accent">
            WHY PG NEAR ME
          </span>
          <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-white">
            Built for people who move, a lot.
          </h2>
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-relaxed text-grey-5/55">
            Students relocating for college, professionals starting new jobs —
            one platform, no matter the city.
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[14px] bg-white/10 md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.n} className="bg-grey-900 px-6 py-6.5">
                <span className="mb-3 block font-mono text-xs text-highlight">
                  {w.n}
                </span>
                <h3 className="font-display text-base font-semibold text-white">
                  {w.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-grey-5/55">
                  {w.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (AEO — matches FAQPage JSON-LD above) */}
      <section id="faq" className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <span className="eyebrow mb-4">FAQ</span>
            <h2 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
              Frequently asked questions.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="surface-card group p-4.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-grey-800 transition group-open:text-primary">
                  {f.q}
                  <span className="text-grey-300 transition group-open:rotate-45 group-open:text-primary">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-grey-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner (ref .cta-banner) */}
      <section className="px-4 pb-14 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-7 rounded-3xl bg-gradient-to-br from-primary to-purple px-7 py-10 sm:px-10">
          <div>
            <h2 className="max-w-[440px] font-display text-[clamp(20px,3vw,30px)] font-bold text-white">
              Own a PG or a room sitting empty?
            </h2>
            <p className="mt-2 max-w-[400px] text-sm leading-relaxed text-white/75">
              List it in under five minutes and start getting genuine
              inquiries — no brokerage taken.
            </p>
          </div>
          <Link
            href="/add-your-pg"
            className="rounded-[10px] bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-px"
          >
            List your property
          </Link>
        </div>
      </section>
    </main>
  );
}

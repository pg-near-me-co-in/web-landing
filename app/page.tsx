import Link from "next/link";
import { ArrowRight, ShieldCheck, Filter, Zap, Sparkles } from "lucide-react";
import { getAllCities } from "@/lib/data/cities";
import { getAllListings } from "@/lib/data/listings";
import { HomeMapLoader } from "@/components/home-map-loader";
import { HERO, WHY_US, OWNER_CTA, SITE } from "@/lib/content";

export default function HomePage() {
  const listings = getAllListings();
  const cityCount = new Set(listings.map((l) => l.city_slug)).size;
  const featuredCities = getAllCities().slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `https://${SITE.domain}`,
    description: "Vertical-specific directory for PG, hostel and shared-flat accommodation in India.",
  };

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Map hero — centered */}
      <section className="border-b border-grey-50 bg-white">
        <div className="container-page flex flex-col items-center pb-10 pt-16 text-center md:pt-20">
          <div className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            LIVE IN {cityCount} {cityCount === 1 ? "CITY" : "CITIES"} · MORE ROLLING OUT
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight md:text-6xl">
            {HERO.title}
            <span className="text-primary">{HERO.titleHighlight}</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-grey-500 md:text-lg">{HERO.subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/pg/vadodara" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark">
              {HERO.ctaPrimary} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/add-your-pg" className="inline-flex h-12 items-center gap-2 rounded-full border border-grey-100 bg-white px-6 text-sm font-semibold text-grey-900 transition hover:border-primary/50 hover:text-primary">
              {HERO.ctaSecondary}
            </Link>
          </div>
        </div>

        <HomeMapLoader listings={listings} />

      </section>

      {/* Featured cities */}
      <section className="container-page py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Featured cities</div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Search by your city, not a random pin.</h2>
            <p className="text-sm text-grey-500">
              Vadodara is live today. Bengaluru, Pune, Mumbai, Delhi NCR &amp; more are rolling out — tap in to get a head-start.
            </p>
          </div>
          <Link href="/cities" className="hidden text-sm font-bold text-primary transition-colors hover:text-primary-dark md:inline-flex md:items-center md:gap-2">
            Explore more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCities.map((c) => (
            <Link key={c.slug} href={`/pg/${c.slug}`} className="group relative overflow-hidden rounded-2xl border border-grey-50 bg-white transition hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Unsplash city photos, next/image adds no value here */}
                <img src={c.image} alt={`PGs and shared rooms in ${c.name}, ${c.state}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                {c.is_launched ? (
                  <div className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Live</div>
                ) : (
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-grey-500 backdrop-blur">Soon</div>
                )}
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <div className="font-display text-xl font-bold leading-tight">{c.name}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/85">
                    <span>{c.count}</span>
                    <span className="inline-flex items-center gap-1 font-semibold transition group-hover:gap-1.5">
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center md:hidden">
          <Link href="/cities" className="inline-flex h-11 items-center gap-2 rounded-full border border-grey-100 bg-white px-5 text-sm font-semibold text-grey-900 transition hover:border-primary/50 hover:text-primary">
            Explore more cities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="container-page py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Why {SITE.name}</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Built for the way you actually search.</h2>
          <p className="mt-3 text-sm text-grey-500">No brokers, no bait-and-switch photos, no &quot;call for price&quot; games. Just the stuff that helps you decide.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureTile icon={<Filter className="h-5 w-5" />} title={WHY_US[0].title} body={WHY_US[0].body} />
          <FeatureTile icon={<ShieldCheck className="h-5 w-5" />} title={WHY_US[1].title} body={WHY_US[1].body} />
          <FeatureTile icon={<Zap className="h-5 w-5" />} title={WHY_US[2].title} body={WHY_US[2].body} />
        </div>
      </section>

      {/* For owners CTA */}
      <section className="container-page py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-grey-50 bg-primary p-10 text-white md:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> For owners
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">{OWNER_CTA.title}</h2>
              <p className="mt-4 max-w-xl text-white/80">{OWNER_CTA.body}</p>
            </div>
            <div className="md:justify-self-end">
              <Link href="/add-your-pg" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-grey-900 transition hover:bg-white/90">
                List your PG <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-grey-50 bg-white p-6 transition hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">{icon}</div>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-grey-500">{body}</p>
    </div>
  );
}

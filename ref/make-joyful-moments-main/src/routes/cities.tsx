import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { CITIES } from "@/lib/cities-data";

export const Route = createFileRoute("/cities")({
  head: () => ({
    meta: [
      { title: "PGs & shared rooms by city — Vadodara, Bengaluru, Pune & more | PG Near Me" },
      {
        name: "description",
        content:
          "Browse verified PGs, hostels and shared flats city by city — Vadodara live now, Bengaluru, Pune, Mumbai, Delhi NCR, Hyderabad, Ahmedabad and Chennai rolling out. Zero brokerage, direct owner contact.",
      },
      { property: "og:title", content: "Find a PG in your city — PG Near Me" },
      { property: "og:description", content: "City-by-city directory of verified PGs and shared rooms across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CitiesPage,
});

function CitiesPage() {
  const live = CITIES.filter((c) => c.live);
  const soon = CITIES.filter((c) => !c.live);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="border-b border-border/70 bg-surface">
        <div className="container-page py-14 md:py-20">
          <div className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {CITIES.length} CITIES · 1 LIVE · MORE ROLLING OUT
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Pick your city. Pick your room.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
            Every city gets its own verified directory — no brokers, no bait photos, no ghost listings. Tap a city to see what's live and who's moving in.
          </p>
        </div>
      </section>

      {live.length > 0 && (
        <section className="container-page py-14">
          <SectionHeader
            kicker="Live now"
            title="Ready to move into"
            body="These cities are fully seeded with verified rooms. Filters, direct owner contact and honest pricing — all live."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => <CityCard key={c.slug} c={c} />)}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <SectionHeader
          kicker="Rolling out"
          title="Coming to your city soon"
          body="We're onboarding owners city by city. Tap in to get on the waitlist and be first when it opens."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {soon.map((c) => <CityCard key={c.slug} c={c} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeader({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{kicker}</div>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground md:text-base">{body}</p>
    </div>
  );
}

function CityCard({ c }: { c: import("@/lib/cities-data").CityCard }) {
  return (
    <Link
      to="/listings"
      search={{ city: c.slug }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card transition hover:border-primary/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={c.image}
          alt={`${c.name}, ${c.state} — PGs and shared rooms`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
          <MapPin className="h-3 w-3" /> {c.state}
        </div>
        {c.live ? (
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            <Sparkles className="h-3 w-3" /> Live
          </div>
        ) : (
          <div className="absolute right-4 top-4 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur">
            Soon
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="font-display text-2xl font-bold leading-tight">{c.name}</div>
          <div className="mt-0.5 text-xs text-white/80">{c.tagline}</div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold text-foreground">{c.count}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition group-hover:gap-2.5">
          {c.live ? "Browse rooms" : "Peek early"} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

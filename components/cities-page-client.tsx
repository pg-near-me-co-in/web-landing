"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { CITIES } from "@/lib/data/cities";
import { CITIES_COPY } from "@/lib/content";
import type { City, Listing } from "@/lib/types";
import { HomeMapLoader } from "@/components/home-map-loader";

export function CitiesPageClient({ listings }: { listings: Listing[] }) {
  const [highlight, setHighlight] = useState<string | null>(null);
  const [focusedCity, setFocusedCity] = useState<string | null>(null);

  const live = CITIES.filter((c) => c.is_launched);
  const soon = CITIES.filter((c) => !c.is_launched);
  const liveCount = live.length;

  const onCityFocus = (slug: string | null) => {
    setFocusedCity(slug);
    if (!slug) {
      setHighlight(null);
      return;
    }
    setHighlight(slug);
    // Map → cards: only scroll if the card isn't already on screen.
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`city-card-${slug}`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visible = rect.top >= 80 && rect.bottom <= window.innerHeight - 40;
      if (!visible) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setHighlight((h) => (h === slug ? null : h)), 2600);
  };

  const showCityOnMap = (slug: string) => {
    setFocusedCity(slug);
    setHighlight(slug);
    // Cards → map: bring the shared map into view.
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[role="application"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setHighlight((h) => (h === slug ? null : h)), 2600);
  };

  return (
    <main className="flex-1">
      <section className="border-b border-grey-50 bg-white">
        <div className="container-page py-14 md:py-20">
          <div className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {CITIES.length} CITIES · {liveCount} LIVE · MORE ROLLING OUT
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{CITIES_COPY.title}</h1>
          <p className="mt-4 max-w-xl text-grey-500 md:text-lg">{CITIES_COPY.subtitle}</p>
        </div>
      </section>

      <section className="border-b border-grey-50">
        <HomeMapLoader listings={listings} onCityFocus={onCityFocus} focusedCity={focusedCity} />
      </section>

      {live.length > 0 && (
        <section className="container-page py-16 md:py-20">
          <SectionHeader kicker="Live now" title="Ready to move into" body="These cities are fully seeded with verified rooms. Filters, direct owner contact and honest pricing — all live." />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <CityCard
                key={c.slug}
                c={c}
                highlighted={highlight === c.slug || focusedCity === c.slug}
                onShowOnMap={() => showCityOnMap(c.slug)}
              />
            ))}
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section className="container-page py-16 md:py-20">
          <SectionHeader kicker="Rolling out" title="Coming to your city soon" body="We're onboarding owners city by city. Tap in to get on the waitlist and be first when it opens." />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((c) => (
              <CityCard
                key={c.slug}
                c={c}
                highlighted={highlight === c.slug || focusedCity === c.slug}
                onShowOnMap={() => showCityOnMap(c.slug)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SectionHeader({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{kicker}</div>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-grey-500 md:text-base">{body}</p>
    </div>
  );
}

function CityCard({ c, highlighted, onShowOnMap }: { c: City; highlighted?: boolean; onShowOnMap: () => void }) {
  return (
    <div
      id={`city-card-${c.slug}`}
      className={`group relative overflow-hidden rounded-3xl border bg-white transition ${
        highlighted ? "border-primary ring-2 ring-primary/30" : "border-grey-50 hover:border-primary/40"
      }`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- city icons / photos */}
        <img src={c.image} alt={`${c.name}, ${c.state} — PGs and shared rooms`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={onShowOnMap}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-grey-900 backdrop-blur transition hover:bg-white"
        >
          <MapPin className="h-3 w-3" /> {highlighted ? "Selected" : "Show on map"}
        </button>
        {c.is_launched ? (
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3" /> Live
          </div>
        ) : (
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-grey-500 backdrop-blur">Soon</div>
        )}
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="font-display text-2xl font-bold leading-tight">{c.name}</div>
          <div className="mt-0.5 text-xs text-white/80">{c.tagline}</div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold text-grey-900">{c.count}</span>
        <Link href={`/pg/${c.slug}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition hover:gap-2.5">
          {c.is_launched ? "Browse rooms" : "Peek early"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

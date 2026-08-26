"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { CITIES } from "@/lib/data/cities";
import { CITIES_COPY } from "@/lib/content";
import type { City } from "@/lib/types";

export function CitiesPageClient() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const matches = (c: City) => !term || `${c.name} ${c.state}`.toLowerCase().includes(term);

  const live = CITIES.filter((c) => c.is_launched && matches(c));
  const soon = CITIES.filter((c) => !c.is_launched && matches(c));
  const noMatches = live.length === 0 && soon.length === 0;

  return (
    <main className="flex-1">
      <section className="border-b border-grey-50 bg-white">
        <div className="container-page py-14 md:py-20">
          <div className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {CITIES.length} CITIES · 1 LIVE · MORE ROLLING OUT
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">{CITIES_COPY.title}</h1>
          <p className="mt-4 max-w-xl text-grey-500 md:text-lg">{CITIES_COPY.subtitle}</p>
          <label className="mt-7 flex max-w-md items-center gap-2 rounded-xl border border-grey-100 bg-white px-3.5 focus-within:border-primary/60">
            <Search className="h-4 w-4 shrink-0 text-grey-500" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your city — e.g. Pune, Vadodara, Delhi…"
              aria-label="Search cities"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-grey-500"
            />
          </label>
        </div>
      </section>

      {noMatches ? (
        <section className="container-page py-16 md:py-20">
          <div className="rounded-2xl border border-dashed border-grey-100 bg-white p-12 text-center">
            <div className="font-display text-lg font-semibold">No cities match &quot;{q.trim()}&quot;</div>
            <p className="mt-2 text-sm text-grey-500">
              We&apos;re rolling out city by city — try a nearby metro, or{" "}
              <Link href="/pg/vadodara" className="text-primary underline">
                browse live PGs in Vadodara
              </Link>{" "}
              meanwhile.
            </p>
          </div>
        </section>
      ) : (
        <>
          {live.length > 0 && (
            <section className="container-page py-16 md:py-20">
              <SectionHeader kicker="Live now" title="Ready to move into" body="These cities are fully seeded with verified rooms. Filters, direct owner contact and honest pricing — all live." />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((c) => (
                  <CityCard key={c.slug} c={c} />
                ))}
              </div>
            </section>
          )}

          {soon.length > 0 && (
            <section className="container-page py-16 md:py-20">
              <SectionHeader kicker="Rolling out" title="Coming to your city soon" body="We're onboarding owners city by city. Tap in to get on the waitlist and be first when it opens." />
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {soon.map((c) => (
                  <CityCard key={c.slug} c={c} />
                ))}
              </div>
            </section>
          )}
        </>
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

function CityCard({ c }: { c: City }) {
  return (
    <Link href={`/pg/${c.slug}`} className="group relative overflow-hidden rounded-3xl border border-grey-50 bg-white transition hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Unsplash city photos */}
        <img src={c.image} alt={`${c.name}, ${c.state} — PGs and shared rooms`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-grey-900 backdrop-blur">
          <MapPin className="h-3 w-3" /> {c.state}
        </div>
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
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition group-hover:gap-2.5">
          {c.is_launched ? "Browse rooms" : "Peek early"} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

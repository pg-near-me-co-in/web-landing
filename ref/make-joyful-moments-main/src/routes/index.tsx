import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Search, ShieldCheck, Filter, Zap, Sparkles, MapPin } from "lucide-react";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ListingCard } from "@/components/listing-card";
import { listingsQuery } from "@/lib/queries";
import { CITIES } from "@/lib/cities-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PG Near Me — Verified PGs, hostels & shared rooms in India, zero brokerage" },
      { name: "description", content: "Find your next PG, hostel or shared room in Vadodara and across India. Verified listings, zero brokerage, direct owner contact — built for students, first-jobbers and movers." },
      { property: "og:title", content: "PG Near Me — Verified PGs & shared rooms across India" },
      { property: "og:description", content: "Verified PGs, hostels and shared rooms. Zero brokerage. Talk to owners directly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(listingsQuery({ city: "vadodara" })),
  component: HomePage,
});

const GENDER_TABS = [
  { id: "any", label: "Anyone" },
  { id: "female", label: "Girls" },
  { id: "male", label: "Boys" },
  { id: "unisex", label: "Co-living" },
] as const;

const BUDGETS = [
  { id: "any", label: "Any budget" },
  { id: "6000", label: "Under ₹6,000" },
  { id: "10000", label: "Under ₹10,000" },
  { id: "15000", label: "Under ₹15,000" },
  { id: "25000", label: "Under ₹25,000" },
];

const QUICK_CITIES = ["Bengaluru", "Pune", "Hyderabad", "Mumbai", "Delhi"];

function HomePage() {
  const { data: listings } = useSuspenseQuery(listingsQuery({ city: "vadodara" }));
  const featured = listings.slice(0, 6);
  const localities = new Set(listings.map((l) => l.locality)).size;
  const minPrice = listings.length ? Math.min(...listings.map((l) => l.price_min)) : 0;

  const navigate = useNavigate();
  const [gender, setGender] = useState<(typeof GENDER_TABS)[number]["id"]>("any");
  const [city, setCity] = useState("Vadodara");
  const [budget, setBudget] = useState("any");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/listings",
      search: {
        city: "vadodara",
        ...(gender !== "any" ? { gender } : {}),
        ...(budget !== "any" ? { maxPrice: Number(budget) } : {}),
      },
    });
  };

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:items-center md:py-20">
          {/* Left content */}
          <div>
            <div className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              LIVE IN 1 CITY · 20+ CITIES ROLLING OUT
            </div>
            <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight md:text-6xl">
              Your next room is{" "}
              <span className="text-primary">closer</span> than
              <br className="hidden md:block" /> you think.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              PGs, hostels and shared rooms — verified, zero brokerage, and honest about
              the stuff that actually matters. Skip the WhatsApp forwards.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/listings"
                search={{ city: "vadodara" }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Browse listings <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-12 items-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
              >
                How it works
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              <Stat value="22" label="Cities rolling out" />
              <Stat value={`${listings.length}+`} label="Verified listings" />
              <Stat value="₹0" label="Brokerage, always" />
            </div>
          </div>

          {/* Right search form */}
          <form
            onSubmit={onSearch}
            className="rounded-3xl border border-border bg-card p-5 md:p-6"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>Find a place</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {GENDER_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setGender(t.id)}
                  className={`h-11 rounded-xl border text-xs font-semibold transition md:text-sm ${
                    gender === t.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold text-foreground">City</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary/60">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  list="city-suggestions"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Vadodara, Bengaluru, Pune…"
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <datalist id="city-suggestions">
                <option value="Vadodara" />
                {QUICK_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-semibold text-foreground">Budget (per month)</span>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
              >
                {BUDGETS.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Search className="h-4 w-4" /> Search listings
            </button>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {c}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Handpicked in Vadodara</div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Rooms you can actually move into.</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Real photos, honest prices, verified in the last 30 days. Starting from ₹{minPrice.toLocaleString("en-IN")}/mo across {localities} localities.
            </p>
          </div>
          <Link
            to="/listings"
            search={{ city: "vadodara" }}
            className="hidden text-sm font-bold text-primary transition-colors hover:text-primary-glow md:inline-flex md:items-center md:gap-2"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* Featured cities */}
      <section className="container-page pb-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Featured cities</div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Search by your city, not a random pin.</h2>
            <p className="text-sm text-muted-foreground">
              Vadodara is live today. Bengaluru, Pune, Mumbai, Delhi NCR & more are rolling out — tap in to get a head-start.
            </p>
          </div>
          <Link
            to="/cities"
            className="hidden text-sm font-bold text-primary transition-colors hover:text-primary-glow md:inline-flex md:items-center md:gap-2"
          >
            Explore more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              to="/listings"
              search={{ city: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={c.image}
                  alt={`PGs in ${c.name}, ${c.state}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                {c.live ? (
                  <div className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Live
                  </div>
                ) : (
                  <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur">
                    Soon
                  </div>
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
          <Link
            to="/cities"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
          >
            Explore more cities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Why */}
      <section className="container-page pb-20">
        <div className="mb-10 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Why PG Near Me</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Built for the way you actually search.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            No brokers, no bait-and-switch photos, no "call for price" games. Just the stuff that helps you decide.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureTile
            icon={<Filter className="h-5 w-5" />}
            title="Filters that mean something"
            body="Gender policy, food, sharing, house rules, road access — structured fields, not vague free-text."
          />
          <FeatureTile
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Trust you can see"
            body="Every listing shows a completeness and freshness score. Stale ones decay, verified ones rise."
          />
          <FeatureTile
            icon={<Zap className="h-5 w-5" />}
            title="Owner in two taps"
            body="Reveal the number, call or WhatsApp the owner directly. No middlemen. No commission."
          />
        </div>
      </section>

      {/* For owners */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground p-10 md:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" /> For owners
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Skip the broker. Fill your rooms directly.
              </h2>
              <p className="mt-4 max-w-xl text-primary-foreground/80">
                One short form. No dashboard, no monthly fee, no commission. Approved listings go live across search and city pages within 24 hours.
              </p>
            </div>
            <div className="md:justify-self-end">
              <Link
                to="/submit"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-background/90"
              >
                List your PG — free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold tabular-nums md:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCityBySlug,
  getCityStats,
  getLaunchedCities,
  getListingsForCity,
  getSeoOverride,
} from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";
import { PG_TYPE_LABEL } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const revalidate = 3600;

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{
    type?: string;
    price?: string;
    sharing?: string;
    food?: string;
    q?: string;
    sort?: string;
  }>;
}

export async function generateStaticParams() {
  const cities = await getLaunchedCities();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  // fallback precedence: page_seo_meta override -> computed entity default
  const seo = await getSeoOverride("city", city.id);
  const title =
    seo?.meta_title ?? `PGs & Hostels in ${city.name} — Prices, Photos & Reviews`;
  const description =
    seo?.meta_description ??
    `Browse ${city.listing_count_cache}+ verified PGs, hostels and shared flats in ${city.name}, ${city.state}. Compare prices, sharing types and amenities — contact owners directly for free.`;
  return {
    title,
    description,
    alternates: { canonical: `/pg/${city.slug}` },
    openGraph: {
      title: seo?.og_title ?? title,
      description: seo?.og_description ?? description,
    },
  };
}

const FILTERS: { value: PgType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "female", label: `${PG_TYPE_LABEL.female} only` },
  { value: "male", label: `${PG_TYPE_LABEL.male} only` },
  { value: "unisex", label: PG_TYPE_LABEL.unisex },
];

export default async function CityPage({ params, searchParams }: Props) {
  const [{ city: citySlug }, sp] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(citySlug);
  if (!city || !city.is_launched) notFound();

  const pgType = (["male", "female", "unisex"] as const).includes(
    sp.type as PgType
  )
    ? (sp.type as PgType)
    : undefined;
  const filters = {
    pgType,
    priceMax: Number(sp.price) > 0 ? Number(sp.price) : undefined,
    sharing: sp.sharing || undefined,
    food: ["veg", "non_veg"].includes(sp.food ?? "") ? sp.food : undefined,
    q: (sp.q ?? "").trim() || undefined,
    sort: (["rating", "price_asc", "price_desc"] as const).includes(
      sp.sort as "rating"
    )
      ? (sp.sort as "rating" | "price_asc" | "price_desc")
      : undefined,
  };
  const [listings, stats] = await Promise.all([
    getListingsForCity(citySlug, filters),
    getCityStats(city.id),
  ]);

  // FAQ block: real aggregate facts, doubles as AEO fodder (FAQPage schema)
  const fmtInr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
  const faqs: { q: string; a: string }[] = [
    {
      q: `How many PGs are listed in ${city.name}?`,
      a: `PG Near Me currently lists ${stats.total} PGs and hostels in ${city.name}, ${city.state}, including ${stats.female_count} for women and ${stats.male_count} for men. All are free to browse and contact.`,
    },
    ...(stats.min_price
      ? [
          {
            q: `What do PGs in ${city.name} cost per month?`,
            a: `Listed PGs in ${city.name} with published pricing range from about ${fmtInr(stats.min_price)} to ${fmtInr(stats.max_price)} per month, depending on sharing type and amenities. Many listings are still being price-verified with owners.`,
          },
        ]
      : []),
    {
      q: `Are there girls-only PGs in ${city.name}?`,
      a:
        stats.female_count > 0
          ? `Yes — ${stats.female_count} women-only PGs/hostels are listed in ${city.name}. Use the "Girls only" filter to see them.`
          : `Women-only listings for ${city.name} are being added — check back soon or list your PG for free.`,
    },
    {
      q: `Does PG Near Me charge brokerage in ${city.name}?`,
      a: `No. PG Near Me is a free directory — seekers contact owners directly and owners list for free. There is no brokerage or commission.`,
    },
  ];

  // keeps non-type filters when switching the PG-type chips
  const chipQuery = (typeValue: string) => {
    const qs = new URLSearchParams();
    if (typeValue) qs.set("type", typeValue);
    if (sp.price) qs.set("price", sp.price);
    if (sp.sharing) qs.set("sharing", sp.sharing);
    if (sp.food) qs.set("food", sp.food);
    if (sp.q) qs.set("q", sp.q);
    if (sp.sort) qs.set("sort", sp.sort);
    const s = qs.toString();
    return s ? `?${s}` : "";
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `PGs in ${city.name}`,
    url: `https://pgnearme.co.in/pg/${city.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://pgnearme.co.in" },
        { "@type": "ListItem", position: 2, name: city.name },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 20).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: l.name,
        url: `https://pgnearme.co.in/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`,
      })),
    },
  };

  return (
    <main className="w-full flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* City hero band with aggregate stats */}
      <div className="bg-gradient-to-b from-accent/15 to-grey-5">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
          <nav className="text-sm text-grey-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>{" "}
            / <span className="text-grey-600">{city.name}</span>
          </nav>

          <h1 className="mt-3 font-display text-3xl text-grey-900 sm:text-4xl">
            PGs in {city.name}
          </h1>
          {/* AEO factual summary block */}
          <p className="mt-2 max-w-2xl text-grey-500">
            {listings.length} published PG{listings.length === 1 ? "" : "s"} in{" "}
            {city.name}, {city.state}
            {pgType ? ` for ${PG_TYPE_LABEL[pgType].toLowerCase()}` : ""}. All
            listings are free to contact — no broker fees.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-1.5 text-grey-600 shadow-sm">
              {stats.total} listed
            </span>
            {stats.min_price && (
              <span className="rounded-full bg-white px-3 py-1.5 text-grey-600 shadow-sm">
                {fmtInr(stats.min_price)} – {fmtInr(stats.max_price)}/mo
              </span>
            )}
            {stats.female_count > 0 && (
              <span className="rounded-full bg-white px-3 py-1.5 text-grey-600 shadow-sm">
                {stats.female_count} for women
              </span>
            )}
            {stats.male_count > 0 && (
              <span className="rounded-full bg-white px-3 py-1.5 text-grey-600 shadow-sm">
                {stats.male_count} for men
              </span>
            )}
            <span className="rounded-full bg-success-bg px-3 py-1.5 text-success-fg shadow-sm">
              ₹0 brokerage
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      {/* PG-type toggle chips (the notebook's filter) */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (pgType ?? "") === f.value;
          return (
            <Link
              key={f.label}
              href={`/pg/${citySlug}${chipQuery(f.value)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-primary text-white"
                  : "border border-grey-100 bg-white text-grey-600 hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Advanced filters (Phase 2) — plain GET form, no JS required */}
      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-grey-50 bg-white p-4 shadow-sm"
      >
        {pgType && <input type="hidden" name="type" value={pgType} />}
        <label className="flex flex-col gap-1 text-xs font-semibold text-grey-500">
          Search
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="PG or area name"
            className="w-40 rounded-xl border border-grey-100 px-3 py-2 text-sm font-normal outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-grey-500">
          Budget up to
          <select
            name="price"
            defaultValue={sp.price ?? ""}
            className="rounded-xl border border-grey-100 px-3 py-2 text-sm font-normal outline-none focus:border-primary"
          >
            <option value="">Any</option>
            <option value="5000">₹5,000</option>
            <option value="8000">₹8,000</option>
            <option value="10000">₹10,000</option>
            <option value="15000">₹15,000</option>
            <option value="20000">₹20,000</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-grey-500">
          Sharing
          <select
            name="sharing"
            defaultValue={sp.sharing ?? ""}
            className="rounded-xl border border-grey-100 px-3 py-2 text-sm font-normal outline-none focus:border-primary"
          >
            <option value="">Any</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-grey-500">
          Food
          <select
            name="food"
            defaultValue={sp.food ?? ""}
            className="rounded-xl border border-grey-100 px-3 py-2 text-sm font-normal outline-none focus:border-primary"
          >
            <option value="">Any</option>
            <option value="veg">Veg only</option>
            <option value="non_veg">Non-veg ok</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-grey-500">
          Sort by
          <select
            name="sort"
            defaultValue={sp.sort ?? ""}
            className="rounded-xl border border-grey-100 px-3 py-2 text-sm font-normal outline-none focus:border-primary"
          >
            <option value="">Best match</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple"
        >
          Apply
        </button>
        {(sp.price || sp.sharing || sp.food || sp.q || sp.sort) && (
          <Link
            href={`/pg/${citySlug}${pgType ? `?type=${pgType}` : ""}`}
            className="text-sm font-semibold text-grey-400 hover:text-grey-600"
          >
            Clear
          </Link>
        )}
      </form>

      {listings.length > 0 ? (
        <>
          <p className="mt-8 text-sm font-semibold text-grey-500">
            Showing {listings.length} PG{listings.length === 1 ? "" : "s"}
            {pgType ? ` · ${PG_TYPE_LABEL[pgType]} only` : ""}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-grey-100 bg-white p-12 text-center">
          <p className="font-display text-xl text-grey-700">
            No {pgType ? `${PG_TYPE_LABEL[pgType].toLowerCase()} ` : ""}PGs
            published in {city.name} yet
          </p>
          <p className="mt-2 text-sm text-grey-500">
            Try clearing filters, or check back soon — new listings are added
            regularly.
          </p>
          <Link
            href="/add-your-pg"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple"
          >
            Own a PG here? List it free →
          </Link>
        </div>
      )}

      {/* FAQ (AEO) — matches the FAQPage JSON-LD above */}
      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl text-grey-900">
          PGs in {city.name} — FAQs
        </h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-grey-50 bg-white p-4 shadow-sm"
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
      </section>
      </div>
    </main>
  );
}

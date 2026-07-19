import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCityBySlug, getLaunchedCities, getListingsForCity } from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";
import { PG_TYPE_LABEL } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const revalidate = 3600;

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateStaticParams() {
  const cities = await getLaunchedCities();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `PGs & Hostels in ${city.name} — Prices, Photos & Reviews`,
    description: `Browse ${city.listing_count_cache}+ verified PGs, hostels and shared flats in ${city.name}, ${city.state}. Compare prices, sharing types and amenities — contact owners directly for free.`,
    alternates: { canonical: `/pg/${city.slug}` },
  };
}

const FILTERS: { value: PgType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "female", label: `${PG_TYPE_LABEL.female} only` },
  { value: "male", label: `${PG_TYPE_LABEL.male} only` },
  { value: "unisex", label: PG_TYPE_LABEL.unisex },
];

export default async function CityPage({ params, searchParams }: Props) {
  const [{ city: citySlug }, { type }] = await Promise.all([params, searchParams]);
  const city = await getCityBySlug(citySlug);
  if (!city || !city.is_launched) notFound();

  const pgType = (["male", "female", "unisex"] as const).includes(
    type as PgType
  )
    ? (type as PgType)
    : undefined;
  const listings = await getListingsForCity(citySlug, pgType);

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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* PG-type toggle filter (the one filter called out in the notebook) */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (pgType ?? "") === f.value;
          return (
            <Link
              key={f.label}
              href={f.value ? `/pg/${citySlug}?type=${f.value}` : `/pg/${citySlug}`}
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

      {listings.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-grey-100 p-12 text-center">
          <p className="font-semibold text-grey-600">
            No {pgType ? `${PG_TYPE_LABEL[pgType].toLowerCase()} ` : ""}PGs
            published in {city.name} yet.
          </p>
          <Link
            href="/add-your-pg"
            className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
          >
            Own a PG here? List it free →
          </Link>
        </div>
      )}
    </main>
  );
}

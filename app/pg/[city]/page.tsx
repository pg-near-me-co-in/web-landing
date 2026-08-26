import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCityBySlug, getLaunchedCities } from "@/lib/data/cities";
import { getListingsForCity } from "@/lib/data/listings";
import { ListingCard } from "@/components/listing-card";
import { CityFilters } from "@/components/city-filters";
import type { FoodType, HouseRules, PgType } from "@/lib/types";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{
    gender?: string;
    food?: string;
    sharing?: string;
    rules?: string;
    amenities?: string;
    verified?: string;
    maxPrice?: string;
    q?: string;
  }>;
}

export function generateStaticParams() {
  return getLaunchedCities().map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `Browse verified PGs in ${city.name} — filter by gender, budget & food`,
    description: `Search verified PGs, hostels and shared flats in ${city.name}, ${city.state}. Filter by gender, monthly budget, food preference, house rules and sharing type. Contact owners directly, zero brokerage.`,
    alternates: { canonical: `/pg/${city.slug}` },
    openGraph: {
      title: `Browse verified PGs in ${city.name}`,
      description: `Filter verified PGs in ${city.name} by budget, gender, food and house rules. Zero brokerage.`,
    },
  };
}

const GENDER_VALUES: PgType[] = ["male", "female", "unisex"];
const FOOD_VALUES: FoodType[] = ["veg_only", "non_veg_allowed", "no_food", "jain_only"];
const RULES_VALUES: HouseRules[] = ["strict", "liberal"];

export default async function CityPage({ params, searchParams }: Props) {
  const [{ city: citySlug }, sp] = await Promise.all([params, searchParams]);
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const filters = {
    gender: GENDER_VALUES.includes(sp.gender as PgType) ? (sp.gender as PgType) : undefined,
    maxPrice: Number(sp.maxPrice) > 0 ? Number(sp.maxPrice) : undefined,
    sharing: sp.sharing || undefined,
    food: FOOD_VALUES.includes(sp.food as FoodType) ? (sp.food as FoodType) : undefined,
    rules: RULES_VALUES.includes(sp.rules as HouseRules) ? (sp.rules as HouseRules) : undefined,
    amenities: sp.amenities ? sp.amenities.split(",").filter(Boolean) : undefined,
    verified: sp.verified === "true",
    q: sp.q?.trim() || undefined,
  };
  const listings = getListingsForCity(citySlug, filters);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `PGs in ${city.name}`,
    url: `https://pgnearme.co.in/pg/${city.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 20).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: l.name,
        url: `https://pgnearme.co.in/pg/${l.city_slug}/${l.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-grey-50 bg-grey-10">
        <div className="container-page py-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">{city.name}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            PGs, hostels &amp; shared flats in {city.name}
          </h1>
          <p className="mt-2 max-w-2xl text-grey-500">
            {listings.length} verified {listings.length === 1 ? "listing" : "listings"} — filter below to match your non-negotiables.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <CityFilters
          search={{
            city: citySlug,
            gender: sp.gender,
            food: sp.food,
            sharing: sp.sharing,
            rules: sp.rules,
            amenities: sp.amenities,
            verified: sp.verified,
            maxPrice: sp.maxPrice,
            q: sp.q,
          }}
        />

        <div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-grey-100 bg-white p-12 text-center">
              <div className="font-display text-lg font-semibold">No matches</div>
              <p className="mt-2 text-sm text-grey-500">
                Try widening your budget or removing a filter. Or{" "}
                <Link href="/add-your-pg" className="text-primary underline">
                  list a PG you know
                </Link>{" "}
                to help another seeker find it.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import listingsJson from "@/data/listings.json";
import type { Listing, PgType } from "@/lib/types";
import { getCityBySlug } from "./cities";

const LISTINGS = listingsJson as Listing[];

export interface ListingFilters {
  pgType?: PgType;
  priceMax?: number;
  sharing?: string;
  food?: "veg" | "non_veg";
  q?: string;
  sort?: "rating" | "price_asc" | "price_desc";
}

/**
 * Pure, DB-free filter predicate — same shape as the old app's
 * `buildListingFilterSql` (docs/DATABASE_SCHEMA.md), just applied in-memory
 * against the JSON array instead of building a SQL WHERE clause. Kept as a
 * standalone, unit-testable function so a future DB-backed implementation
 * can reuse the exact same filter semantics. See lib/data/listings.test.ts.
 */
export function matchesFilters(listing: Listing, filters: ListingFilters): boolean {
  if (filters.pgType && listing.pg_type !== filters.pgType) return false;
  if (filters.priceMax && (listing.price_min ?? Infinity) > filters.priceMax) return false;
  if (filters.sharing && !listing.sharing_types.includes(filters.sharing)) return false;
  if (filters.food === "veg" && listing.food_preference !== "veg") return false;
  if (filters.food === "non_veg" && !["non_veg", "both"].includes(listing.food_preference)) return false;
  if (filters.q) {
    const t = filters.q.trim().toLowerCase();
    if (t && !`${listing.name} ${listing.area_name ?? ""}`.toLowerCase().includes(t)) return false;
  }
  return true;
}

function sortListings(listings: Listing[], sort?: ListingFilters["sort"]): Listing[] {
  const copy = [...listings];
  if (sort === "price_asc") return copy.sort((a, b) => (a.price_min ?? Infinity) - (b.price_min ?? Infinity));
  if (sort === "price_desc") return copy.sort((a, b) => (b.price_min ?? -1) - (a.price_min ?? -1));
  return copy.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0) || b.images.length - a.images.length);
}

export function getListingsForCity(citySlug: string, filters: ListingFilters = {}): Listing[] {
  const matched = LISTINGS.filter((l) => l.city_slug === citySlug && matchesFilters(l, filters));
  return sortListings(matched, filters.sort);
}

export function getFeaturedListings(limit = 6): Listing[] {
  const byCity = new Map<string, Listing>();
  for (const l of [...LISTINGS].sort(
    (a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0) || b.images.length - a.images.length
  )) {
    if (!byCity.has(l.city_slug)) byCity.set(l.city_slug, l);
  }
  return Array.from(byCity.values())
    .sort((a, b) => (getCityBySlug(b.city_slug)?.listing_count_cache ?? 0) - (getCityBySlug(a.city_slug)?.listing_count_cache ?? 0))
    .slice(0, limit);
}

export function getListingBySlug(slug: string): Listing | null {
  return LISTINGS.find((l) => l.slug === slug) ?? null;
}

export function getAllListings(): Listing[] {
  return LISTINGS;
}

export function getCityStats(citySlug: string) {
  const listings = LISTINGS.filter((l) => l.city_slug === citySlug);
  const prices = listings.map((l) => l.price_min).filter((n): n is number => n != null);
  return {
    total: listings.length,
    female_count: listings.filter((l) => l.pg_type === "female").length,
    male_count: listings.filter((l) => l.pg_type === "male").length,
    min_price: prices.length ? Math.min(...prices) : null,
    max_price: prices.length ? Math.max(...prices) : null,
  };
}

import listingsJson from "@/data/listings.json";
import type { FoodType, HouseRules, Listing, PgType, Review } from "@/lib/types";

function normalizeListing(raw: Listing): Listing {
  return {
    ...raw,
    verified_for_women: Boolean(raw.verified_for_women),
    female_warden_onsite: Boolean(raw.female_warden_onsite),
    curfew_time: raw.curfew_time ?? null,
    cctv_coverage: raw.cctv_coverage ?? null,
    entry_system: raw.entry_system ?? null,
    nearest_police_station_distance: raw.nearest_police_station_distance ?? null,
    emergency_contact_number: raw.emergency_contact_number ?? null,
    photo_verified_date: raw.photo_verified_date ?? null,
    reviews: (raw.reviews as Review[] | undefined) ?? [],
  };
}

const LISTINGS = (listingsJson as Listing[]).map(normalizeListing);

export interface ListingFilters {
  gender?: PgType;
  maxPrice?: number;
  sharing?: string;
  food?: FoodType;
  rules?: HouseRules;
  amenities?: string[];
  verified?: boolean;
  q?: string;
}

/**
 * Pure, DB-free filter predicate mirroring ref's `/listings` query shape
 * (city/gender/food/sharing/rules/amenities/verified/q) — kept standalone
 * and unit-tested (__tests__/listings.test.ts) so a future DB-backed
 * implementation can reuse the exact same semantics.
 */
export function matchesFilters(listing: Listing, filters: ListingFilters): boolean {
  if (filters.gender && listing.pg_gender !== filters.gender) return false;
  if (filters.maxPrice && listing.price_min != null && listing.price_min > filters.maxPrice) return false;
  if (filters.sharing && !listing.sharing_types.includes(filters.sharing)) return false;
  if (filters.food && listing.food_type !== filters.food) return false;
  if (filters.rules && listing.house_rules !== filters.rules) return false;
  if (filters.verified && !listing.verified_at) return false;
  if (filters.amenities?.length && !filters.amenities.every((a) => listing.amenities.includes(a))) return false;
  if (filters.q) {
    const t = filters.q.trim().toLowerCase();
    if (t && !`${listing.name} ${listing.locality}`.toLowerCase().includes(t)) return false;
  }
  return true;
}

export function getListingsForCity(citySlug: string, filters: ListingFilters = {}): Listing[] {
  return LISTINGS.filter((l) => l.city_slug === citySlug && matchesFilters(l, filters)).sort(
    (a, b) => b.trust_score - a.trust_score
  );
}

export function getAllListings(): Listing[] {
  return LISTINGS;
}

export function getListingBySlug(slug: string): Listing | null {
  return LISTINGS.find((l) => l.slug === slug) ?? null;
}

import { describe, expect, it } from "vitest";
import { getListingsForCity, matchesFilters } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";

const base: Listing = {
  id: "t1",
  name: "Test PG",
  slug: "test-pg",
  city_slug: "vadodara",
  area_name: "Alkapuri",
  address_line: null,
  lat: null,
  lng: null,
  description: "",
  pg_type: "female",
  sharing_types: ["Single", "Double"],
  price_min: 7000,
  price_max: 9000,
  food_preference: "veg",
  house_rules_strictness: "strict",
  road_access: "with_road",
  contact_phone: "+91 90000 00000",
  contact_whatsapp: null,
  amenities: [],
  images: [],
  trust_score: 80,
  rating_avg: 4.5,
  rating_count: 10,
  reviews: [],
  verified_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("matchesFilters", () => {
  it("matches with no filters", () => {
    expect(matchesFilters(base, {})).toBe(true);
  });

  it("filters by pgType", () => {
    expect(matchesFilters(base, { pgType: "male" })).toBe(false);
    expect(matchesFilters(base, { pgType: "female" })).toBe(true);
  });

  it("filters by priceMax against price_min", () => {
    expect(matchesFilters(base, { priceMax: 5000 })).toBe(false);
    expect(matchesFilters(base, { priceMax: 8000 })).toBe(true);
  });

  it("filters by sharing type", () => {
    expect(matchesFilters(base, { sharing: "Triple" })).toBe(false);
    expect(matchesFilters(base, { sharing: "Double" })).toBe(true);
  });

  it("treats 'non_veg' filter as matching 'both'", () => {
    const both = { ...base, food_preference: "both" as const };
    expect(matchesFilters(both, { food: "non_veg" })).toBe(true);
    expect(matchesFilters(base, { food: "non_veg" })).toBe(false);
  });

  it("matches free-text query against name or area", () => {
    expect(matchesFilters(base, { q: "alkapuri" })).toBe(true);
    expect(matchesFilters(base, { q: "koramangala" })).toBe(false);
  });
});

describe("getListingsForCity", () => {
  it("only returns listings for the requested city", () => {
    const results = getListingsForCity("vadodara");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((l) => l.city_slug === "vadodara")).toBe(true);
  });

  it("returns nothing for an unknown city", () => {
    expect(getListingsForCity("nowhere")).toEqual([]);
  });

  it("sorts ascending by price when requested", () => {
    const results = getListingsForCity("vadodara", { sort: "price_asc" });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].price_min ?? Infinity).toBeLessThanOrEqual(results[i].price_min ?? Infinity);
    }
  });
});

import { describe, expect, it } from "vitest";
import { getListingsForCity, matchesFilters } from "@/lib/data/listings";
import type { Listing } from "@/lib/types";

const base: Listing = {
  id: "t1",
  name: "Test PG",
  slug: "test-pg",
  city_slug: "vadodara",
  locality: "Alkapuri",
  address: "Near Alkapuri Circle, Vadodara",
  lat: null,
  lng: null,
  description: "",
  pg_gender: "female",
  sharing_types: ["Single", "Double"],
  price_min: 7000,
  price_max: 9000,
  food_type: "veg_only",
  house_rules: "strict",
  road_access: true,
  contact_phone: "+91 90000 00000",
  contact_whatsapp: null,
  amenities: [],
  images: [],
  trust_score: 4.5,
  verified_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("matchesFilters", () => {
  it("matches with no filters", () => {
    expect(matchesFilters(base, {})).toBe(true);
  });

  it("filters by gender", () => {
    expect(matchesFilters(base, { gender: "male" })).toBe(false);
    expect(matchesFilters(base, { gender: "female" })).toBe(true);
  });

  it("filters by maxPrice against price_min", () => {
    expect(matchesFilters(base, { maxPrice: 5000 })).toBe(false);
    expect(matchesFilters(base, { maxPrice: 8000 })).toBe(true);
  });

  it("filters by sharing type", () => {
    expect(matchesFilters(base, { sharing: "Triple" })).toBe(false);
    expect(matchesFilters(base, { sharing: "Double" })).toBe(true);
  });

  it("filters by exact food type", () => {
    expect(matchesFilters(base, { food: "non_veg_allowed" })).toBe(false);
    expect(matchesFilters(base, { food: "veg_only" })).toBe(true);
  });

  it("filters by house rules", () => {
    expect(matchesFilters(base, { rules: "liberal" })).toBe(false);
    expect(matchesFilters(base, { rules: "strict" })).toBe(true);
  });

  it("filters by verified (requires verified_at set)", () => {
    expect(matchesFilters({ ...base, verified_at: null }, { verified: true })).toBe(false);
    expect(matchesFilters(base, { verified: true })).toBe(true);
  });

  it("requires every selected amenity to be present", () => {
    const withAmenities = { ...base, amenities: ["WiFi", "AC"] };
    expect(matchesFilters(withAmenities, { amenities: ["WiFi", "Gym"] })).toBe(false);
    expect(matchesFilters(withAmenities, { amenities: ["WiFi", "AC"] })).toBe(true);
  });

  it("matches free-text query against name or locality", () => {
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

  it("sorts by trust score descending", () => {
    const results = getListingsForCity("vadodara");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].trust_score).toBeGreaterThanOrEqual(results[i].trust_score);
    }
  });
});

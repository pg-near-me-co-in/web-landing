import type { FoodPreference, HouseRules, PgType } from "./types";

export function formatPriceRange(min: number | null, max: number | null): string | null {
  const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `from ${fmt(min)}`;
  if (max) return `up to ${fmt(max)}`;
  return null;
}

export const PG_TYPE_LABEL: Record<PgType, string> = {
  male: "Boys",
  female: "Girls",
  unisex: "Co-living",
};

export const FOOD_LABEL: Record<FoodPreference, string> = {
  veg: "Veg only",
  non_veg: "Non-veg",
  both: "Veg & non-veg",
  not_provided: "Food not provided",
};

export const STRICTNESS_LABEL: Record<HouseRules, string> = {
  strict: "Strict",
  moderate: "Moderate",
  liberal: "Liberal",
};

export const SHARING_TYPES = ["Single", "Double", "Triple", "4-bed", "5-bed"] as const;

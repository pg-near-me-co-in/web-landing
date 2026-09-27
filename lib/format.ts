import type { CctvCoverage, EntrySystem, FoodType, HouseRules, PgType } from "./types";

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPriceRange(min: number | null, max: number | null): string {
  if (min == null || max == null) return "Contact for price";
  if (min === max) return `${formatINR(min)}/mo`;
  return `${formatINR(min)} – ${formatINR(max)}/mo`;
}

export const GENDER_LABEL: Record<PgType, string> = {
  male: "Boys-only",
  female: "Girls-only",
  unisex: "Co-ed",
};

/** Shared gender→color convention — listing card badges and map pin rings both use this. */
export const GENDER_COLOR: Record<PgType, string> = {
  female: "#db2777",
  male: "#2563eb",
  unisex: "#9333ea",
};
export const GENDER_COLOR_FALLBACK = "#1f2937";

export const FOOD_LABEL: Record<FoodType, string> = {
  veg_only: "Veg only",
  non_veg_allowed: "Non-veg allowed",
  no_food: "No food provided",
  jain_only: "Jain food",
};

export const RULES_LABEL: Record<HouseRules, string> = {
  strict: "Strict",
  liberal: "Liberal",
};

export const CCTV_LABEL: Record<CctvCoverage, string> = {
  entrance_only: "Entrance only",
  common_areas: "Common areas",
  entrance_and_common: "Entrance + Common areas",
  none_listed: "None listed",
};

export const ENTRY_SYSTEM_LABEL: Record<EntrySystem, string> = {
  biometric: "Biometric",
  keycard: "Keycard",
  manual_warden: "Manual/Warden",
  none_listed: "None listed",
};

/** Avoids "Vadodara, Vadodara" when a listing has no locality more specific than its city. */
export function placeName(locality: string, cityName: string): string {
  return locality === cityName ? cityName : `${locality}, ${cityName}`;
}

/** "Not specified" fallback for listings missing this field (e.g. sourced from public data, not yet owner-confirmed). */
export function genderLabel(g: PgType | null): string {
  return g ? GENDER_LABEL[g] : "Not specified";
}
export function foodLabel(f: FoodType | null): string {
  return f ? FOOD_LABEL[f] : "Not specified";
}
export function rulesLabel(r: HouseRules | null): string {
  return r ? RULES_LABEL[r] : "Not specified";
}
export function cctvLabel(c: CctvCoverage | null): string {
  return c ? CCTV_LABEL[c] : "None listed";
}
export function entrySystemLabel(e: EntrySystem | null): string {
  return e ? ENTRY_SYSTEM_LABEL[e] : "None listed";
}

export const AMENITIES_ALL = [
  "WiFi",
  "AC",
  "Non-AC",
  "Laundry",
  "Housekeeping",
  "Power backup",
  "CCTV",
  "Warden",
  "Gym",
  "Parking",
  "Common kitchen",
] as const;

export const SHARING_TYPES = ["Single", "Double", "Triple", "4-bed", "5-bed"] as const;

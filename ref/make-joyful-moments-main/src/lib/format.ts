export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPriceRange(min: number, max: number): string {
  if (min === max) return `${formatINR(min)}/mo`;
  return `${formatINR(min)} – ${formatINR(max)}/mo`;
}

export const GENDER_LABEL: Record<string, string> = {
  male: "Male only",
  female: "Female only",
  unisex: "Unisex / Co-living",
};

export const FOOD_LABEL: Record<string, string> = {
  veg_only: "Veg only",
  non_veg_allowed: "Non-veg allowed",
  no_food: "No food provided",
};

export const RULES_LABEL: Record<string, string> = {
  strict: "Strict",
  liberal: "Liberal",
};

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

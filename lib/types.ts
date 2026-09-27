export type PgType = "male" | "female" | "unisex";
export type FoodType = "veg_only" | "non_veg_allowed" | "no_food" | "jain_only";
export type HouseRules = "strict" | "liberal";

/** Display labels: Boys-only | Girls-only | Co-ed (backed by pg_gender). */
export type GenderType = PgType;

export type CctvCoverage = "entrance_only" | "common_areas" | "entrance_and_common" | "none_listed";
export type EntrySystem = "biometric" | "keycard" | "manual_warden" | "none_listed";
export type ReviewTag = "Safety" | "Cleanliness" | "Food" | "General";

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  lat: number | null;
  lng: number | null;
  is_launched: boolean;
  /** Free-text marketing copy ("6 listings", "Rolling out") — not a computed stat. */
  count: string;
  tagline: string;
  image: string;
}

export interface ListingImage {
  storage_path: string;
  alt_text: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  created_at: string;
  /** Multi-select tags for filtering reviews on the listing detail page. */
  review_tags: ReviewTag[];
}

export interface Listing {
  id: string;
  name: string;
  slug: string;
  city_slug: string;
  locality: string;
  address: string;
  lat: number | null;
  lng: number | null;
  description: string;
  pg_gender: PgType | null;
  sharing_types: string[];
  price_min: number | null;
  price_max: number | null;
  food_type: FoodType | null;
  house_rules: HouseRules | null;
  road_access: boolean;
  /** Empty string means unknown — no owner contact captured for this listing yet. */
  contact_phone: string;
  contact_whatsapp: string | null;
  amenities: string[];
  images: ListingImage[];
  trust_score: number;
  verified_at: string | null;
  updated_at: string;

  /** Girl-safety / trust fields */
  verified_for_women: boolean;
  female_warden_onsite: boolean;
  curfew_time: string | null;
  cctv_coverage: CctvCoverage | null;
  entry_system: EntrySystem | null;
  nearest_police_station_distance: string | null;
  emergency_contact_number: string | null;
  photo_verified_date: string | null;
  reviews: Review[];
}

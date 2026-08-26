export type PgType = "male" | "female" | "unisex";
export type FoodType = "veg_only" | "non_veg_allowed" | "no_food" | "jain_only";
export type HouseRules = "strict" | "liberal";

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
  pg_gender: PgType;
  sharing_types: string[];
  price_min: number;
  price_max: number;
  food_type: FoodType;
  house_rules: HouseRules;
  road_access: boolean;
  contact_phone: string;
  contact_whatsapp: string | null;
  amenities: string[];
  images: ListingImage[];
  trust_score: number;
  verified_at: string | null;
  updated_at: string;
}

export type PgType = "male" | "female" | "unisex";
export type FoodPreference = "veg" | "non_veg" | "both" | "not_provided";
export type HouseRules = "strict" | "moderate" | "liberal";

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  lat: number | null;
  lng: number | null;
  is_launched: boolean;
  listing_count_cache: number;
  tagline: string | null;
  hero_image_url: string | null;
}

export interface Amenity {
  slug: string;
  name: string;
  icon_key: string;
  category: "comfort" | "safety" | "food";
}

export interface ListingImage {
  storage_path: string;
  alt_text: string;
}

export interface Review {
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface Listing {
  id: string;
  name: string;
  slug: string;
  city_slug: string;
  area_name: string | null;
  address_line: string | null;
  lat: number | null;
  lng: number | null;
  description: string;
  pg_type: PgType | null;
  sharing_types: string[];
  price_min: number | null;
  price_max: number | null;
  food_preference: FoodPreference;
  house_rules_strictness: HouseRules;
  road_access: "with_road" | "without_road";
  contact_phone: string;
  contact_whatsapp: string | null;
  amenities: string[];
  images: ListingImage[];
  trust_score: number;
  rating_avg: number | null;
  rating_count: number;
  reviews: Review[];
  verified_at: string;
  updated_at: string;
}

/** City-listing / card view of a Listing — a narrower shape used on grids
 *  and the map. Kept distinct so future DB-backed queries can select just
 *  these columns without pulling the full detail row. */
export type ListingCard = Pick<
  Listing,
  | "id"
  | "name"
  | "slug"
  | "city_slug"
  | "area_name"
  | "pg_type"
  | "sharing_types"
  | "price_min"
  | "price_max"
  | "food_preference"
  | "house_rules_strictness"
  | "trust_score"
  | "rating_avg"
  | "rating_count"
  | "images"
  | "lat"
  | "lng"
>;

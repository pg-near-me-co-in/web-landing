export type PgType = "male" | "female" | "unisex";

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  lat: number | null;
  lng: number | null;
  is_launched: boolean;
  listing_count_cache: number;
}

export interface Area {
  id: string;
  city_id: string;
  name: string;
  slug: string;
}

export interface ListingCard {
  id: string;
  name: string;
  slug: string;
  /** null = unspecified (common for scraped sources) */
  pg_type: PgType | null;
  price_min: number | null;
  price_max: number | null;
  rating_avg: number | null;
  rating_count: number;
  area_name: string | null;
  area_slug: string | null;
  city_name: string;
  city_slug: string;
  cover_image: string | null;
  cover_alt: string | null;
  sharing_types: string[];
}

export interface ListingDetail extends ListingCard {
  description: string | null;
  address_line: string | null;
  lat: number | null;
  lng: number | null;
  religion_preference: string | null;
  food_preference: "veg" | "non_veg" | "both" | "not_provided" | null;
  road_access: "with_road" | "without_road" | null;
  house_rules_strictness: "strict" | "moderate" | "liberal" | null;
  curfew_time: string | null;
  verified_at: string | null;
  published_at: string | null;
  images: { storage_path: string; alt_text: string; is_cover: boolean }[];
  amenities: { name: string; slug: string; icon_key: string | null }[];
  reviews: {
    reviewer_name: string;
    rating: number;
    review_text: string | null;
    created_at: string;
  }[];
}

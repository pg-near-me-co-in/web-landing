import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ListingRow = {
  id: string;
  slug: string;
  name: string;
  city_id: string;
  locality: string;
  address: string;
  lat: number | null;
  lng: number | null;
  cover_image: string | null;
  images: unknown;
  contact_phone: string;
  contact_whatsapp: string | null;
  pg_gender: "male" | "female" | "unisex";
  price_min: number;
  price_max: number;
  sharing_types: string[];
  food_type: "veg_only" | "non_veg_allowed" | "no_food";
  road_access: boolean;
  house_rules: "strict" | "liberal";
  amenities: string[];
  description: string | null;
  status: string;
  trust_score: number;
  last_verified_at: string | null;
  created_at: string;
};

export type CityRow = {
  id: string;
  slug: string;
  name: string;
  state: string;
  hero_tagline: string | null;
  active: boolean;
};

export const cityQuery = (slug: string) =>
  queryOptions({
    queryKey: ["city", slug],
    queryFn: async (): Promise<CityRow | null> => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as CityRow | null;
    },
  });

export const citiesQuery = queryOptions({
  queryKey: ["cities"],
  queryFn: async (): Promise<CityRow[]> => {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data ?? []) as CityRow[];
  },
});

export type ListingFilters = {
  city?: string;
  gender?: "male" | "female" | "unisex" | "any";
  food?: "veg_only" | "non_veg_allowed" | "no_food" | "any";
  maxPrice?: number;
  sharing?: string; // single sharing_type e.g. "Double"
  q?: string;
};

export const listingsQuery = (filters: ListingFilters) =>
  queryOptions({
    queryKey: ["listings", filters],
    queryFn: async (): Promise<ListingRow[]> => {
      let q = supabase
        .from("listings")
        .select("*, cities!inner(slug)")
        .eq("status", "published");
      if (filters.city) q = q.eq("cities.slug", filters.city);
      if (filters.gender && filters.gender !== "any") q = q.eq("pg_gender", filters.gender);
      if (filters.food && filters.food !== "any") q = q.eq("food_type", filters.food);
      if (filters.maxPrice && filters.maxPrice > 0) q = q.lte("price_min", filters.maxPrice);
      if (filters.sharing) q = q.contains("sharing_types", [filters.sharing]);
      if (filters.q && filters.q.trim().length > 0) {
        const term = filters.q.replace(/[%_]/g, "");
        q = q.or(`name.ilike.%${term}%,locality.ilike.%${term}%,address.ilike.%${term}%`);
      }
      const { data, error } = await q.order("trust_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ListingRow[];
    },
  });

export const listingBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["listing", slug],
    queryFn: async (): Promise<(ListingRow & { city: CityRow }) | null> => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, cities(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { cities, ...rest } = data as ListingRow & { cities: CityRow };
      return { ...rest, city: cities };
    },
  });

export async function logLeadEvent(
  listing_id: string,
  event_type: "reveal_phone" | "reveal_whatsapp" | "click_call" | "click_whatsapp",
) {
  await supabase.from("leads").insert({
    listing_id,
    event_type,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });
}

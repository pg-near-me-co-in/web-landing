import citiesJson from "@/data/cities.json";
import type { City } from "@/lib/types";

const CITIES = citiesJson as City[];

export function getAllCities(): City[] {
  return CITIES;
}

export function getLaunchedCities(): City[] {
  return CITIES.filter((c) => c.is_launched).sort(
    (a, b) => b.listing_count_cache - a.listing_count_cache || a.name.localeCompare(b.name)
  );
}

export function getCitiesByState(): Record<string, City[]> {
  const grouped: Record<string, City[]> = {};
  const sorted = [...CITIES].sort(
    (a, b) =>
      a.state.localeCompare(b.state) ||
      Number(b.is_launched) - Number(a.is_launched) ||
      b.listing_count_cache - a.listing_count_cache ||
      a.name.localeCompare(b.name)
  );
  for (const c of sorted) (grouped[c.state] ??= []).push(c);
  return grouped;
}

export function getCityBySlug(slug: string): City | null {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

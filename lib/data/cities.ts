import citiesJson from "@/data/cities.json";
import type { City } from "@/lib/types";

export const CITIES = citiesJson as City[];

export function getAllCities(): City[] {
  return CITIES;
}

export function getLaunchedCities(): City[] {
  return CITIES.filter((c) => c.is_launched);
}

export function getCityBySlug(slug: string): City | null {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, getLaunchedCities } from "@/lib/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgnearme.co.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, listings] = await Promise.all([
    getLaunchedCities(),
    getAllPublishedSlugs(),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/add-your-pg`, changeFrequency: "monthly", priority: 0.6 },
    ...cities.map((c) => ({
      url: `${base}/pg/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...listings.map((l) => ({
      url: `${base}/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`,
      lastModified: new Date(l.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

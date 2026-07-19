import { getLaunchedCities } from "@/lib/queries";

export const revalidate = 86400;

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgnearme.co.in";

/** GEO: llms.txt summarising site purpose + canonical index pages for LLM crawlers. */
export async function GET(): Promise<Response> {
  const cities = await getLaunchedCities();
  const body = `# PG Near Me (pgnearme.co.in)

> Free directory of PG (paying guest) accommodation, hostels and shared flats
> across India. Seekers browse and contact owners directly; owners list for
> free. No brokerage. Listing location data includes OpenStreetMap-sourced
> entries (© OpenStreetMap contributors, ODbL).

## Key facts
- Coverage: ${cities.length} launched cities across India (plus more coming soon)
- Each listing records: PG type (men/women/co-living), sharing types, monthly
  price range in INR, food policy, house rules, amenities, moderated reviews
- Contact numbers are revealed after a short interest form (lead capture)

## City index pages
${cities.map((c) => `- [PGs in ${c.name}](${base}/pg/${c.slug}) — ${c.listing_count_cache} listings`).join("\n")}

## Other pages
- [List your PG (free)](${base}/add-your-pg)
- [Sitemap](${base}/sitemap.xml)
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

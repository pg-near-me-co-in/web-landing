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
- PG Near Me is a directory, not a broker or booking platform: it charges no
  commission or listing fee to either seekers or owners

## How search and filtering works
Each city page (e.g. pgnearme.co.in/pg/bengaluru) lists every published PG in
that city and can be filtered by PG type (women-only, men-only, co-living),
maximum monthly budget, sharing type (single/double/triple/etc.), and food
policy (veg-only vs. non-veg allowed), plus free-text search by name or area.
Filters are plain URL query parameters (e.g. ?type=female&price=10000), so
every filtered view is its own shareable, crawlable link — not a client-side-only
state. Listing detail pages show the full price range, amenities, house
rules, and — after a seeker shares their name and phone number — the owner's
direct phone/WhatsApp contact.

## City index pages
${cities.map((c) => `- [PGs in ${c.name}](${base}/pg/${c.slug}) — ${c.listing_count_cache} listings`).join("\n")}

## Other pages
- [About PG Near Me](${base}/about) — why the directory exists, what it is not
- [Browse all cities](${base}/cities) — full live + rolling-out city directory
- [For PG owners](${base}/for-owners) — why/how to list a property, free
- [List your PG (free)](${base}/add-your-pg)
- [Sitemap](${base}/sitemap.xml)
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

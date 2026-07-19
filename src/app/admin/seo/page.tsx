import Link from "next/link";
import { getLaunchedCities } from "@/lib/queries";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SeoIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const cities = await getLaunchedCities();

  let listingMatches: { name: string; slug: string; city_name: string }[] = [];
  if (q?.trim()) {
    const { rows } = await db.query(
      `select l.name, l.slug, c.name as city_name
         from pg_listings l join cities c on c.id = l.city_id
        where l.status = 'published' and l.name ilike '%' || $1 || '%'
        order by l.name limit 20`,
      [q.trim()]
    );
    listingMatches = rows;
  }

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">SEO editor</h1>
      <p className="mt-1 text-sm text-grey-500">
        Overrides stored in <code>page_seo_meta</code>; empty fields fall back
        to computed defaults.
      </p>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-grey-400">
        Static pages
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/admin/seo/edit?type=static_page&route=/"
          className="rounded-full border border-grey-100 bg-white px-4 py-1.5 text-sm font-semibold text-grey-700 transition hover:border-primary hover:text-primary"
        >
          Homepage
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-grey-400">
        City pages
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.id}
            href={`/admin/seo/edit?type=city&id=${c.id}`}
            className="rounded-full border border-grey-100 bg-white px-4 py-1.5 text-sm font-semibold text-grey-700 transition hover:border-primary hover:text-primary"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-grey-400">
        Listing pages
      </h2>
      <form method="get" className="mt-2 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search listing by name…"
          className="w-full rounded-xl border border-grey-100 bg-white px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white">
          Search
        </button>
      </form>
      {listingMatches.length > 0 && (
        <ul className="mt-3 max-w-md divide-y divide-grey-50 rounded-2xl border border-grey-50 bg-white shadow-sm">
          {listingMatches.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/admin/seo/edit?type=listing&slug=${l.slug}`}
                className="block px-4 py-2.5 text-sm transition hover:bg-grey-5"
              >
                <span className="font-semibold text-grey-800">{l.name}</span>{" "}
                <span className="text-grey-400">· {l.city_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

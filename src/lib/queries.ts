import "server-only";
import { db } from "./db";
import type { Area, City, ListingCard, ListingDetail, PgType } from "./types";

export async function getLaunchedCities(): Promise<City[]> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache
       from cities where is_launched order by listing_count_cache desc, name`
  );
  return rows;
}

/** All cities grouped by state, launched first within each state. */
export async function getCitiesByState(): Promise<Record<string, City[]>> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache
       from cities order by state, is_launched desc, listing_count_cache desc, name`
  );
  const grouped: Record<string, City[]> = {};
  for (const c of rows) (grouped[c.state] ??= []).push(c);
  return grouped;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache
       from cities where slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getAreasForCity(cityId: string): Promise<Area[]> {
  const { rows } = await db.query(
    `select id, city_id, name, slug from areas
      where city_id = $1 and is_active order by name`,
    [cityId]
  );
  return rows;
}

const CARD_SELECT = `
  select l.id, l.name, l.slug, l.pg_type, l.price_min, l.price_max,
         l.rating_avg, l.rating_count, l.sharing_types,
         a.name as area_name, a.slug as area_slug,
         c.name as city_name, c.slug as city_slug,
         img.storage_path as cover_image, img.alt_text as cover_alt
    from pg_listings l
    join cities c on c.id = l.city_id
    left join areas a on a.id = l.area_id
    left join lateral (
      select storage_path, alt_text from listing_images
       where listing_id = l.id order by is_cover desc, sort_order limit 1
    ) img on true
   where l.status = 'published'`;

export async function getListingsForCity(
  citySlug: string,
  pgType?: PgType
): Promise<ListingCard[]> {
  const params: string[] = [citySlug];
  let sql = `${CARD_SELECT} and c.slug = $1`;
  if (pgType) {
    params.push(pgType);
    sql += ` and l.pg_type = $2`;
  }
  sql += ` order by l.rating_avg desc nulls last, l.published_at desc`;
  const { rows } = await db.query(sql, params);
  return rows;
}

export async function getFeaturedListings(limit = 6): Promise<ListingCard[]> {
  // one listing per city (biggest cities first), preferring rated then
  // data-rich rows — keeps the homepage varied while ratings are sparse
  const { rows } = await db.query(
    `select * from (
       select distinct on (sub.city_slug) sub.*, c2.listing_count_cache
         from (${CARD_SELECT}) sub
         join cities c2 on c2.slug = sub.city_slug
        order by sub.city_slug, sub.rating_avg desc nulls last,
                 (sub.cover_image is not null) desc, sub.rating_count desc
     ) picks
     order by picks.rating_avg desc nulls last, picks.listing_count_cache desc
     limit $1`,
    [limit]
  );
  return rows;
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const { rows } = await db.query(
    `select l.*, a.name as area_name, a.slug as area_slug,
            c.name as city_name, c.slug as city_slug
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where l.slug = $1 and l.status = 'published'`,
    [slug]
  );
  const listing = rows[0];
  if (!listing) return null;

  const [images, amenities, reviews] = await Promise.all([
    db.query(
      `select storage_path, alt_text, is_cover from listing_images
        where listing_id = $1 order by is_cover desc, sort_order`,
      [listing.id]
    ),
    db.query(
      `select am.name, am.slug, am.icon_key
         from listing_amenities la join amenities am on am.id = la.amenity_id
        where la.listing_id = $1 and am.is_active order by am.name`,
      [listing.id]
    ),
    db.query(
      `select reviewer_name, rating, review_text, created_at
         from reviews where listing_id = $1 and status = 'approved'
        order by created_at desc limit 20`,
      [listing.id]
    ),
  ]);

  return {
    ...listing,
    cover_image: images.rows[0]?.storage_path ?? null,
    cover_alt: images.rows[0]?.alt_text ?? null,
    images: images.rows,
    amenities: amenities.rows,
    reviews: reviews.rows,
  };
}

/** For sitemap generation. */
export async function getAllPublishedSlugs(): Promise<
  { slug: string; city_slug: string; area_slug: string | null; updated_at: string }[]
> {
  const { rows } = await db.query(
    `select l.slug, c.slug as city_slug, a.slug as area_slug, l.updated_at
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where l.status = 'published'`
  );
  return rows;
}

/** City list for the owner-submission form (all 25, launched or not). */
export async function getAllCities(): Promise<City[]> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache
       from cities order by state, name`
  );
  return rows;
}

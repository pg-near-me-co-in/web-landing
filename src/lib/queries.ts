import "server-only";
import { db } from "./db";
import type {
  AdminListingRow,
  Amenity,
  Area,
  City,
  ListingCard,
  ListingDetail,
  Owner,
  PgType,
} from "./types";

const ADMIN_PAGE_SIZE = 20;

export async function getLaunchedCities(): Promise<City[]> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url
       from cities where is_launched order by listing_count_cache desc, name`
  );
  return rows;
}

/** All cities grouped by state, launched first within each state. */
export async function getCitiesByState(): Promise<Record<string, City[]>> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url
       from cities order by state, is_launched desc, listing_count_cache desc, name`
  );
  const grouped: Record<string, City[]> = {};
  for (const c of rows) (grouped[c.state] ??= []).push(c);
  return grouped;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url
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

export interface ListingFilters {
  pgType?: PgType;
  priceMax?: number;
  sharing?: string;
  food?: string;
  q?: string;
  sort?: "rating" | "price_asc" | "price_desc";
}

/**
 * Builds the dynamic `and ...` WHERE-clause fragment for the filters below,
 * mutating `params` in place (appending each filter's value) and returning
 * the SQL fragment to append after an existing base query. Pure and
 * DB-free — extracted so it's unit-testable without a live connection (see
 * src/lib/__tests__/query-filters.test.ts). `params` is expected to already
 * contain whatever positional params precede these filters (e.g. citySlug
 * as $1), so placeholder numbering continues correctly.
 */
export function buildListingFilterSql(filters: ListingFilters, params: unknown[]): string {
  let sql = "";
  const add = (clause: string, value: unknown) => {
    params.push(value);
    sql += ` and ${clause.replace("?", `$${params.length}`)}`;
  };

  if (filters.pgType) add(`l.pg_type = ?`, filters.pgType);
  if (filters.priceMax) add(`l.price_min <= ?`, filters.priceMax);
  if (filters.sharing) add(`? = any(l.sharing_types)`, filters.sharing);
  if (filters.food) {
    // veg seekers want strictly veg; non-veg seekers are fine with "both"
    if (filters.food === "veg") add(`l.food_preference = ?`, "veg");
    else add(`l.food_preference = any(array[?, 'both'])`, filters.food);
  }
  if (filters.q) {
    params.push(filters.q);
    const n = `$${params.length}`;
    sql += ` and (l.name ilike '%' || ${n} || '%' or a.name ilike '%' || ${n} || '%')`;
  }
  return sql;
}

export async function getListingsForCity(
  citySlug: string,
  filters: ListingFilters = {}
): Promise<ListingCard[]> {
  const params: unknown[] = [citySlug];
  const sql =
    `${CARD_SELECT} and c.slug = $1` + buildListingFilterSql(filters, params);

  const sort =
    filters.sort === "price_asc"
      ? `l.price_min asc nulls last`
      : filters.sort === "price_desc"
        ? `l.price_min desc nulls last`
        : `l.rating_avg desc nulls last, (img.storage_path is not null) desc`;
  const finalSql = sql + ` order by ${sort}, l.name`;
  const { rows } = await db.query(finalSql, params);
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

// ---------------------------------------------------------------------------
// Admin panel (all callers must pass the isAdminSession() gate first)
// ---------------------------------------------------------------------------

export async function getAdminStats() {
  const { rows } = await db.query(`
    select
      (select count(*)::int from pg_listings where status = 'pending_review') as pending_listings,
      (select count(*)::int from reviews where status = 'pending') as pending_reviews,
      (select count(*)::int from leads) as total_leads,
      (select count(*)::int from leads where created_at > now() - interval '7 days') as leads_7d,
      (select count(*)::int from pg_listings where status = 'published') as published_listings`);
  return rows[0];
}

export async function getPendingSubmissions() {
  const { rows } = await db.query(
    `select l.id, l.name, l.pg_type, l.price_min, l.price_max, l.sharing_types,
            l.address_line, l.description, l.contact_phone, l.source, l.created_at,
            c.name as city_name, a.name as area_name,
            o.name as owner_name, o.phone as owner_phone
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
       left join owners o on o.id = l.owner_id
      where l.status = 'pending_review'
      order by l.created_at desc
      limit 100`
  );
  return rows;
}

export async function getPendingReviews() {
  const { rows } = await db.query(
    `select r.id, r.reviewer_name, r.rating, r.review_text, r.created_at,
            l.name as listing_name, l.slug as listing_slug,
            c.slug as city_slug, a.slug as area_slug
       from reviews r
       join pg_listings l on l.id = r.listing_id
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where r.status = 'pending'
      order by r.created_at desc
      limit 100`
  );
  return rows;
}

export async function getLeads(limit = 200) {
  const { rows } = await db.query(
    `select ld.id, ld.name, ld.phone, ld.intent, ld.message, ld.created_at,
            l.name as listing_name, c.name as city_name
       from leads ld
       join pg_listings l on l.id = ld.listing_id
       join cities c on c.id = l.city_id
      order by ld.created_at desc
      limit $1`,
    [limit]
  );
  return rows;
}

export interface SeoOverride {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
}

/** page_seo_meta override for an entity (or a static route when id is null). */
export async function getSeoOverride(
  entityType: "static_page" | "city" | "listing",
  entityIdOrRoute: string
): Promise<SeoOverride | null> {
  const { rows } = await db.query(
    entityType === "static_page"
      ? `select meta_title, meta_description, og_title, og_description
           from page_seo_meta where entity_type = $1 and route_pattern = $2`
      : `select meta_title, meta_description, og_title, og_description
           from page_seo_meta where entity_type = $1 and entity_id = $2`,
    [entityType, entityIdOrRoute]
  );
  return rows[0] ?? null;
}

/** Published listings never verified or verified > 180 days ago. */
export async function getStaleListings(limit = 100) {
  const { rows } = await db.query(
    `select l.id, l.name, l.slug, l.verified_at, l.trust_score, l.source,
            c.name as city_name, c.slug as city_slug, a.slug as area_slug
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where l.status = 'published'
        and (l.verified_at is null or l.verified_at < now() - interval '180 days')
      order by l.verified_at asc nulls first, l.name
      limit $1`,
    [limit]
  );
  return rows;
}

/** Aggregate facts for a city's FAQ/AEO block. */
export async function getCityStats(cityId: string) {
  const { rows } = await db.query(
    `select count(*)::int as total,
            count(*) filter (where pg_type = 'female')::int as female_count,
            count(*) filter (where pg_type = 'male')::int as male_count,
            min(price_min) as min_price,
            max(price_max) as max_price
       from pg_listings where city_id = $1 and status = 'published'`,
    [cityId]
  );
  return rows[0];
}

/** City list for the owner-submission form (all cities, launched or not). */
export async function getAllCities(): Promise<City[]> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url
       from cities order by state, name`
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Admin CRUD (Phase 7b) — Listings, Cities, Areas, Amenities, Owners.
// Paginated/filterable via GET searchParams (same crawlable-URL convention
// as the public /pg/[city] filters). All admin-only; callers must already
// have checked isAdminSession().
// ---------------------------------------------------------------------------

export interface AdminListingFilters {
  q?: string;
  status?: string;
  cityId?: string;
  pgType?: PgType;
  page?: number;
}

export async function getAdminListings(
  filters: AdminListingFilters = {}
): Promise<{ rows: AdminListingRow[]; total: number }> {
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    return clause.replace("?", `$${params.length}`);
  };
  const clauses: string[] = [];
  if (filters.q) clauses.push(add(`l.name ilike '%' || ? || '%'`, filters.q));
  if (filters.status) clauses.push(add(`l.status = ?`, filters.status));
  if (filters.cityId) clauses.push(add(`l.city_id = ?`, filters.cityId));
  if (filters.pgType) clauses.push(add(`l.pg_type = ?`, filters.pgType));
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";

  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ADMIN_PAGE_SIZE;
  const limitParam = `$${params.length + 1}`;
  const offsetParam = `$${params.length + 2}`;

  const { rows } = await db.query(
    `select l.id, l.name, l.slug, c.name as city_name, c.slug as city_slug,
            a.name as area_name, l.pg_type, l.status, l.price_min, l.price_max,
            l.trust_score, l.updated_at,
            count(*) over()::int as total_count
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
       ${where}
      order by l.updated_at desc
      limit ${limitParam} offset ${offsetParam}`,
    [...params, ADMIN_PAGE_SIZE, offset]
  );
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getAdminListingById(id: string) {
  const { rows } = await db.query(
    `select l.*, c.name as city_name, a.name as area_name, o.name as owner_name, o.phone as owner_phone
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
       left join owners o on o.id = l.owner_id
      where l.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const { rows: amenityRows } = await db.query(
    `select amenity_id from listing_amenities where listing_id = $1`,
    [id]
  );
  return { ...rows[0], amenity_ids: amenityRows.map((r) => r.amenity_id) };
}

export interface AdminCityFilters {
  q?: string;
  page?: number;
}

export async function getAdminCities(
  filters: AdminCityFilters = {}
): Promise<{ rows: City[]; total: number }> {
  const params: unknown[] = [];
  const where = filters.q
    ? (() => {
        params.push(filters.q);
        return `where name ilike '%' || $${params.length} || '%'`;
      })()
    : "";
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ADMIN_PAGE_SIZE;
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url,
            count(*) over()::int as total_count
       from cities
       ${where}
      order by state, name
      limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, ADMIN_PAGE_SIZE, offset]
  );
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getAdminCityById(id: string): Promise<City | null> {
  const { rows } = await db.query(
    `select id, name, slug, state, lat, lng, is_launched, listing_count_cache, tagline, hero_image_url
       from cities where id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export interface AdminAreaFilters {
  cityId?: string;
  q?: string;
  page?: number;
}

export async function getAdminAreas(
  filters: AdminAreaFilters = {}
): Promise<{ rows: (Area & { city_name: string; is_active: boolean })[]; total: number }> {
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    return clause.replace("?", `$${params.length}`);
  };
  const clauses: string[] = [];
  if (filters.cityId) clauses.push(add(`ar.city_id = ?`, filters.cityId));
  if (filters.q) clauses.push(add(`ar.name ilike '%' || ? || '%'`, filters.q));
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const { rows } = await db.query(
    `select ar.id, ar.city_id, ar.name, ar.slug, ar.is_active, c.name as city_name,
            count(*) over()::int as total_count
       from areas ar
       join cities c on c.id = ar.city_id
       ${where}
      order by c.name, ar.name
      limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, ADMIN_PAGE_SIZE, offset]
  );
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getAdminAreaById(id: string) {
  const { rows } = await db.query(
    `select ar.id, ar.city_id, ar.name, ar.slug, ar.is_active, c.name as city_name
       from areas ar join cities c on c.id = ar.city_id
      where ar.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getAdminAmenities(): Promise<
  (Amenity & { listing_count: number })[]
> {
  const { rows } = await db.query(
    `select am.id, am.name, am.slug, am.icon_key, am.category, am.is_active,
            count(la.listing_id)::int as listing_count
       from amenities am
       left join listing_amenities la on la.amenity_id = am.id
      group by am.id
      order by am.category nulls last, am.name`
  );
  return rows;
}

export async function getAdminAmenityById(id: string): Promise<Amenity | null> {
  const { rows } = await db.query(
    `select id, name, slug, icon_key, category, is_active from amenities where id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export interface AdminOwnerFilters {
  q?: string;
  status?: string;
  page?: number;
}

export async function getAdminOwners(
  filters: AdminOwnerFilters = {}
): Promise<{ rows: (Owner & { listing_count: number })[]; total: number }> {
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    return clause.replace("?", `$${params.length}`);
  };
  const clauses: string[] = [];
  if (filters.q) {
    params.push(filters.q, filters.q);
    clauses.push(
      `(o.name ilike '%' || $${params.length - 1} || '%' or o.phone ilike '%' || $${params.length} || '%')`
    );
  }
  if (filters.status) clauses.push(add(`o.status = ?`, filters.status));
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const { rows } = await db.query(
    `select o.id, o.name, o.phone, o.email, o.whatsapp_number, o.status, o.notes, o.created_at,
            count(l.id)::int as listing_count,
            count(*) over()::int as total_count
       from owners o
       left join pg_listings l on l.owner_id = o.id
       ${where}
      group by o.id
      order by o.created_at desc
      limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, ADMIN_PAGE_SIZE, offset]
  );
  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function getAdminOwnerById(id: string) {
  const { rows } = await db.query(
    `select id, name, phone, email, whatsapp_number, status, notes, created_at from owners where id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const { rows: listings } = await db.query(
    `select id, name, slug, status from pg_listings where owner_id = $1 order by updated_at desc`,
    [id]
  );
  return { ...rows[0], listings };
}

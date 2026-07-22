"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "./db";
import {
  ADMIN_COOKIE,
  isAdminSession,
  makeSessionCookie,
  verifyAccessCode,
} from "./admin-auth";
import { improveDescription, isAiConfigured, summarizeReviews } from "./ai";
import { logAdminAction } from "./audit";

const PHONE_RE = /^[+\d][\d\s()-]{7,17}$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface AdminActionState {
  ok: boolean;
  error?: string;
}

export async function adminLogin(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const code = String(formData.get("code") ?? "");
  if (!code || !verifyAccessCode(code)) {
    return { ok: false, error: "Wrong access code." };
  }
  const { name, value } = makeSessionCookie();
  (await cookies()).set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

async function guard(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Not authorised");
}

/** Publish a pending owner submission (or re-publish an archived listing). */
export async function approveListing(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(
    `update pg_listings
        set status='published', published_at=coalesce(published_at, now()), verified_at=now()
      where id=$1`,
    [id]
  );
  revalidatePath("/admin/submissions");
}

export async function rejectListing(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update pg_listings set status='rejected' where id=$1`, [id]);
  revalidatePath("/admin/submissions");
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Save brand colors to site_settings — applied site-wide without redeploy. */
export async function saveTheme(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const keys = [
    "theme.primary_color",
    "theme.purple",
    "theme.accent",
    "theme.teal",
    "theme.highlight",
  ];
  for (const key of keys) {
    const v = String(formData.get(key) ?? "").trim();
    if (!HEX_RE.test(v)) return { ok: false, error: `${key} must be a #rrggbb color.` };
    await db.query(
      `insert into site_settings (key, value) values ($1, to_jsonb($2::text))
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [key, v]
    );
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Upsert a page_seo_meta override for the homepage, a city, or a listing. */
export async function saveSeoMeta(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const entityType = String(formData.get("entity_type") ?? "");
  const entityId = String(formData.get("entity_id") ?? "") || null;
  const routePattern = String(formData.get("route_pattern") ?? "");
  if (!["static_page", "city", "listing"].includes(entityType) || !routePattern)
    return { ok: false, error: "Bad entity." };

  const fields = ["meta_title", "meta_description", "og_title", "og_description"].map(
    (k) => String(formData.get(k) ?? "").trim() || null
  );

  const existing = await db.query(
    entityId
      ? `select id from page_seo_meta where entity_type = $1 and entity_id = $2`
      : `select id from page_seo_meta where entity_type = $1 and route_pattern = $2`,
    [entityType, entityId ?? routePattern]
  );
  if (existing.rows[0]) {
    await db.query(
      `update page_seo_meta
          set meta_title=$2, meta_description=$3, og_title=$4, og_description=$5, updated_at=now()
        where id=$1`,
      [existing.rows[0].id, ...fields]
    );
  } else {
    await db.query(
      `insert into page_seo_meta
         (route_pattern, entity_type, entity_id, meta_title, meta_description, og_title, og_description)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [routePattern, entityType, entityId, ...fields]
    );
  }
  revalidatePath(routePattern === "/" ? "/" : routePattern);
  return { ok: true };
}

/** Staleness dashboard: re-confirm a listing's data as current. */
export async function markVerified(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update pg_listings set verified_at = now() where id = $1`, [id]);
  revalidatePath("/admin/staleness");
}

export async function approveReview(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update reviews set status='approved' where id=$1`, [id]);
  revalidatePath("/admin/reviews");
}

/** AI: rewrite a listing's description from its structured facts (admin still publishes). */
export async function aiImproveDescription(formData: FormData): Promise<void> {
  await guard();
  if (!isAiConfigured()) return;
  const id = String(formData.get("id") ?? "");
  const { rows } = await db.query(
    `select l.name, l.pg_type, l.sharing_types, l.price_min, l.price_max,
            l.food_preference, l.house_rules_strictness, l.description,
            c.name as city, a.name as area
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where l.id = $1`,
    [id]
  );
  if (!rows[0]) return;
  const improved = await improveDescription(rows[0]);
  if (improved) {
    await db.query(`update pg_listings set description = $2 where id = $1`, [
      id,
      improved,
    ]);
  }
  revalidatePath("/admin/submissions");
}

/**
 * AI: generate review summaries for published listings with ≥3 approved
 * reviews and no summary newer than their latest review. Batched (10/run).
 */
export async function aiGenerateReviewSummaries(): Promise<void> {
  await guard();
  if (!isAiConfigured()) return;
  const { rows: candidates } = await db.query(
    `select l.id, l.name,
            c.slug as city_slug, a.slug as area_slug, l.slug
       from pg_listings l
       join cities c on c.id = l.city_id
       left join areas a on a.id = l.area_id
      where l.status = 'published'
        and (select count(*) from reviews r
              where r.listing_id = l.id and r.status = 'approved') >= 3
        and (l.ai_review_summary is null
             or l.updated_at < (select max(r2.updated_at) from reviews r2
                                 where r2.listing_id = l.id and r2.status = 'approved'))
      limit 10`
  );
  for (const l of candidates) {
    const { rows: reviews } = await db.query(
      `select rating, review_text from reviews
        where listing_id = $1 and status = 'approved'
        order by created_at desc limit 30`,
      [l.id]
    );
    const summary = await summarizeReviews(l.name, reviews);
    if (summary) {
      await db.query(`update pg_listings set ai_review_summary = $2 where id = $1`, [
        l.id,
        summary,
      ]);
      revalidatePath(`/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`);
    }
  }
  revalidatePath("/admin");
}

export async function rejectReview(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update reviews set status='rejected' where id=$1`, [id]);
  revalidatePath("/admin/reviews");
}

// ---------------------------------------------------------------------------
// Admin CRUD (Phase 7b) — Listings, Cities, Areas, Amenities, Owners.
// "Delete" is soft-delete via existing status/is_launched/is_active fields
// per the user's own scoping decision — see docs/ADMIN_PANEL_SPEC.md. Every
// create/update/soft-delete call here also writes an admin_audit_log row.
// ---------------------------------------------------------------------------

export async function createListing(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  const cityId = get("city_id");
  const pgType = get("pg_type");
  if (!name) return { ok: false, error: "Name is required." };
  if (!cityId) return { ok: false, error: "City is required." };
  if (!["male", "female", "unisex"].includes(pgType))
    return { ok: false, error: "Choose a PG type." };

  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;
  const sharing = formData.getAll("sharing_types").map(String).filter(Boolean);
  const { rows } = await db.query(
    `insert into pg_listings
       (city_id, area_id, name, slug, description, address_line, pg_type,
        sharing_types, price_min, price_max, food_preference,
        house_rules_strictness, contact_phone, contact_whatsapp, status, source)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'admin_manual')
     returning id`,
    [
      cityId,
      get("area_id") || null,
      name,
      slug,
      get("description") || null,
      get("address_line") || null,
      pgType,
      sharing,
      Number(get("price_min")) || null,
      Number(get("price_max")) || null,
      get("food_preference") || null,
      get("house_rules_strictness") || null,
      get("contact_phone") || null,
      get("contact_whatsapp") || null,
      get("status") || "pending_review",
    ]
  );
  await logAdminAction({
    action: "create",
    entityType: "pg_listings",
    entityId: rows[0].id,
    after: { name, slug, cityId, pgType },
  });
  revalidatePath("/admin/listings");
  return { ok: true };
}

export async function updateListing(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const name = get("name");
  if (!id) return { ok: false, error: "Missing listing id." };
  if (!name) return { ok: false, error: "Name is required." };

  const before = await db.query(`select * from pg_listings where id = $1`, [id]);
  if (!before.rows[0]) return { ok: false, error: "Listing not found." };

  const sharing = formData.getAll("sharing_types").map(String).filter(Boolean);
  await db.query(
    `update pg_listings set
       name=$2, description=$3, address_line=$4, city_id=$5, area_id=$6,
       pg_type=$7, sharing_types=$8, price_min=$9, price_max=$10,
       food_preference=$11, house_rules_strictness=$12,
       contact_phone=$13, contact_whatsapp=$14, status=$15, updated_at=now()
     where id=$1`,
    [
      id,
      name,
      get("description") || null,
      get("address_line") || null,
      get("city_id"),
      get("area_id") || null,
      get("pg_type"),
      sharing,
      Number(get("price_min")) || null,
      Number(get("price_max")) || null,
      get("food_preference") || null,
      get("house_rules_strictness") || null,
      get("contact_phone") || null,
      get("contact_whatsapp") || null,
      get("status"),
    ]
  );

  const amenityIds = formData.getAll("amenity_ids").map(String).filter(Boolean);
  await db.query(`delete from listing_amenities where listing_id = $1`, [id]);
  for (const amenityId of amenityIds) {
    await db.query(
      `insert into listing_amenities (listing_id, amenity_id) values ($1, $2)
       on conflict do nothing`,
      [id, amenityId]
    );
  }

  await logAdminAction({
    action: "update",
    entityType: "pg_listings",
    entityId: id,
    before: before.rows[0],
    after: { name, status: get("status") },
  });
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  return { ok: true };
}

/** Soft-delete: status='archived' (a real enum value already, no schema change). */
export async function archiveListingAdmin(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update pg_listings set status='archived', updated_at=now() where id=$1`, [id]);
  await logAdminAction({ action: "archive", entityType: "pg_listings", entityId: id });
  revalidatePath("/admin/listings");
}

export async function createCity(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  const state = get("state");
  if (!name || !state) return { ok: false, error: "Name and state are required." };
  const slug = slugify(name);
  const { rows } = await db.query(
    `insert into cities (name, slug, state, is_launched, tagline, hero_image_url)
     values ($1,$2,$3,$4,$5,$6) returning id`,
    [
      name,
      slug,
      state,
      formData.get("is_launched") === "on",
      get("tagline") || null,
      get("hero_image_url") || null,
    ]
  );
  await logAdminAction({ action: "create", entityType: "cities", entityId: rows[0].id, after: { name, slug } });
  revalidatePath("/admin/cities");
  revalidatePath("/cities");
  return { ok: true };
}

export async function updateCity(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const name = get("name");
  if (!id || !name) return { ok: false, error: "Name is required." };

  const before = await db.query(`select * from cities where id = $1`, [id]);
  if (!before.rows[0]) return { ok: false, error: "City not found." };

  await db.query(
    `update cities set name=$2, state=$3, is_launched=$4, tagline=$5, hero_image_url=$6, updated_at=now()
     where id=$1`,
    [
      id,
      name,
      get("state"),
      formData.get("is_launched") === "on",
      get("tagline") || null,
      get("hero_image_url") || null,
    ]
  );
  await logAdminAction({
    action: "update",
    entityType: "cities",
    entityId: id,
    before: before.rows[0],
    after: { name },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/cities");
  revalidatePath("/");
  return { ok: true };
}

/** Soft-delete: is_launched=false (a city row itself is never hard-deleted —
 *  listings/areas may reference it). */
export async function setCityLaunched(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const launched = formData.get("launched") === "1";
  await db.query(`update cities set is_launched = $2, updated_at = now() where id = $1`, [
    id,
    launched,
  ]);
  await logAdminAction({
    action: launched ? "launch" : "unlaunch",
    entityType: "cities",
    entityId: id,
  });
  revalidatePath("/admin/cities");
  revalidatePath("/cities");
  revalidatePath("/");
}

export async function createArea(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  const cityId = get("city_id");
  if (!name || !cityId) return { ok: false, error: "Name and city are required." };
  const slug = slugify(name);
  const { rows } = await db.query(
    `insert into areas (city_id, name, slug, is_active) values ($1,$2,$3,true) returning id`,
    [cityId, name, slug]
  );
  await logAdminAction({ action: "create", entityType: "areas", entityId: rows[0].id, after: { name, cityId } });
  revalidatePath("/admin/areas");
  return { ok: true };
}

export async function updateArea(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const name = get("name");
  if (!id || !name) return { ok: false, error: "Name is required." };
  const before = await db.query(`select * from areas where id = $1`, [id]);
  if (!before.rows[0]) return { ok: false, error: "Area not found." };

  await db.query(
    `update areas set name=$2, city_id=$3, is_active=$4, updated_at=now() where id=$1`,
    [id, name, get("city_id"), formData.get("is_active") === "on"]
  );
  await logAdminAction({
    action: "update",
    entityType: "areas",
    entityId: id,
    before: before.rows[0],
    after: { name },
  });
  revalidatePath("/admin/areas");
  return { ok: true };
}

export async function setAreaActive(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";
  await db.query(`update areas set is_active = $2, updated_at = now() where id = $1`, [id, active]);
  await logAdminAction({ action: active ? "activate" : "deactivate", entityType: "areas", entityId: id });
  revalidatePath("/admin/areas");
}

export async function createAmenity(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(name);
  const { rows } = await db.query(
    `insert into amenities (name, slug, icon_key, category, is_active)
     values ($1,$2,$3,$4,true) returning id`,
    [name, slug, get("icon_key") || null, get("category") || null]
  );
  await logAdminAction({ action: "create", entityType: "amenities", entityId: rows[0].id, after: { name } });
  revalidatePath("/admin/amenities");
  return { ok: true };
}

export async function updateAmenity(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const name = get("name");
  if (!id || !name) return { ok: false, error: "Name is required." };
  const before = await db.query(`select * from amenities where id = $1`, [id]);
  if (!before.rows[0]) return { ok: false, error: "Amenity not found." };

  await db.query(
    `update amenities set name=$2, icon_key=$3, category=$4, is_active=$5 where id=$1`,
    [id, name, get("icon_key") || null, get("category") || null, formData.get("is_active") === "on"]
  );
  await logAdminAction({
    action: "update",
    entityType: "amenities",
    entityId: id,
    before: before.rows[0],
    after: { name },
  });
  revalidatePath("/admin/amenities");
  return { ok: true };
}

/** Hard-delete only when unreferenced (checked here) — otherwise soft-delete via is_active. */
export async function deleteAmenity(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  const { rows } = await db.query(
    `select count(*)::int as n from listing_amenities where amenity_id = $1`,
    [id]
  );
  if (rows[0].n > 0) {
    await db.query(`update amenities set is_active = false where id = $1`, [id]);
    await logAdminAction({ action: "deactivate", entityType: "amenities", entityId: id });
  } else {
    await db.query(`delete from amenities where id = $1`, [id]);
    await logAdminAction({ action: "delete", entityType: "amenities", entityId: id });
  }
  revalidatePath("/admin/amenities");
}

export async function updateOwner(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await guard();
  } catch {
    return { ok: false, error: "Not authorised." };
  }
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = get("id");
  const name = get("name");
  const phone = get("phone");
  if (!id || !name) return { ok: false, error: "Name is required." };
  if (phone && !PHONE_RE.test(phone))
    return { ok: false, error: "Please enter a valid phone number." };
  const before = await db.query(`select * from owners where id = $1`, [id]);
  if (!before.rows[0]) return { ok: false, error: "Owner not found." };

  await db.query(
    `update owners set name=$2, phone=$3, email=$4, whatsapp_number=$5, status=$6, notes=$7, updated_at=now()
     where id=$1`,
    [
      id,
      name,
      phone,
      get("email") || null,
      get("whatsapp_number") || null,
      get("status"),
      get("notes") || null,
    ]
  );
  await logAdminAction({
    action: "update",
    entityType: "owners",
    entityId: id,
    before: before.rows[0],
    after: { name, status: get("status") },
  });
  revalidatePath("/admin/owners");
  revalidatePath(`/admin/owners/${id}`);
  return { ok: true };
}

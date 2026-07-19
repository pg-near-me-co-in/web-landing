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

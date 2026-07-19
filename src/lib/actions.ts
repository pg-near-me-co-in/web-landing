"use server";

import { db } from "./db";

const PHONE_RE = /^[+\d][\d\s()-]{7,17}$/;

export interface LeadState {
  ok: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  error?: string;
}

/**
 * Contact-reveal lead capture (the notebook's "IP" mechanism): store the
 * seeker's name+phone in `leads`, then return the listing's contact number.
 */
export async function captureLead(
  _prev: LeadState | null,
  formData: FormData
): Promise<LeadState> {
  const listingId = String(formData.get("listing_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!listingId) return { ok: false, error: "Missing listing." };
  if (!PHONE_RE.test(phone))
    return { ok: false, error: "Please enter a valid phone number." };

  try {
    const { rows } = await db.query(
      `select contact_phone, contact_whatsapp from pg_listings
        where id = $1 and status = 'published'`,
      [listingId]
    );
    if (!rows[0]) return { ok: false, error: "Listing not found." };

    // scraped listings may not have a verified number yet — still capture the
    // lead, as a callback request instead of a reveal
    const hasPhone = Boolean(rows[0].contact_phone);
    await db.query(
      `insert into leads (listing_id, name, phone, intent)
       values ($1, $2, $3, $4)`,
      [listingId, name || null, phone, hasPhone ? "contact_reveal" : "callback_request"]
    );

    return {
      ok: true,
      phone: rows[0].contact_phone ?? null,
      whatsapp: rows[0].contact_whatsapp,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export interface SubmitState {
  ok: boolean;
  error?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Owner self-submission: creates an `owners` contact record and a
 * `pg_listings` row with status='pending_review' for admin moderation.
 */
export async function submitListing(
  _prev: SubmitState | null,
  formData: FormData
): Promise<SubmitState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const ownerName = get("owner_name");
  const ownerPhone = get("owner_phone");
  const pgName = get("pg_name");
  const cityId = get("city_id");
  const pgType = get("pg_type");

  if (!ownerName || !pgName) return { ok: false, error: "Name fields are required." };
  if (!PHONE_RE.test(ownerPhone))
    return { ok: false, error: "Please enter a valid contact number." };
  if (!cityId) return { ok: false, error: "Please choose a city." };
  if (!["male", "female", "unisex"].includes(pgType))
    return { ok: false, error: "Please choose a PG type." };

  const sharing = formData.getAll("sharing_types").map(String).filter(Boolean);
  const priceMin = Number(get("price_min")) || null;
  const priceMax = Number(get("price_max")) || null;
  const areaId = get("area_id") || null;

  const client = await db.connect();
  try {
    await client.query("begin");
    const owner = await client.query(
      `insert into owners (name, phone, email, whatsapp_number, status)
       values ($1, $2, $3, $4, 'pending') returning id`,
      [ownerName, ownerPhone, get("owner_email") || null, get("owner_whatsapp") || null]
    );

    const slug = `${slugify(pgName)}-${crypto.randomUUID().slice(0, 8)}`;
    const inserted = await client.query(
      `insert into pg_listings
         (owner_id, city_id, area_id, name, slug, description, address_line,
          pg_type, sharing_types, price_min, price_max, food_preference,
          house_rules_strictness, contact_phone, contact_whatsapp,
          status, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
               'pending_review','owner_submission')
       returning id`,
      [
        owner.rows[0].id,
        cityId,
        areaId,
        pgName,
        slug,
        get("description") || null,
        get("address_line") || null,
        pgType,
        sharing,
        priceMin,
        priceMax,
        get("food_preference") || null,
        get("house_rules_strictness") || null,
        ownerPhone,
        get("owner_whatsapp") || null,
      ]
    );

    // photos are uploaded to Supabase Storage client-side (publishable key);
    // the form passes back the storage paths
    const imagePaths = formData
      .getAll("image_paths")
      .map(String)
      .filter(Boolean)
      .slice(0, 10);
    for (let i = 0; i < imagePaths.length; i++) {
      await client.query(
        `insert into listing_images (listing_id, storage_path, alt_text, sort_order, is_cover)
         values ($1, $2, $3, $4, $5)`,
        [
          inserted.rows[0].id,
          imagePaths[i],
          `${pgName} — photo ${i + 1}`,
          i,
          i === 0,
        ]
      );
    }

    await client.query("commit");
    return { ok: true };
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Submission failed. Please try again." };
  } finally {
    client.release();
  }
}

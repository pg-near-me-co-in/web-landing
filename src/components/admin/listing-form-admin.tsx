"use client";

import { useActionState } from "react";
import { createListing, updateListing, type AdminActionState } from "@/lib/admin-actions";
import type { Amenity, Area, City } from "@/lib/types";

const inputCls =
  "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

const SHARING_OPTIONS = ["Single", "Double", "Triple", "4-bed", "5-bed"];

/** Loose shape matching getAdminListingById's `select l.*, ...` + amenity_ids
 *  — deliberately permissive since it mirrors a wide raw-SQL row, not a
 *  hand-maintained interface. */
interface AdminListingFormRow {
  id: string;
  name: string;
  status: string;
  city_id: string;
  area_id: string | null;
  pg_type: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  address_line: string | null;
  price_min: number | null;
  price_max: number | null;
  food_preference: string | null;
  house_rules_strictness: string | null;
  description: string | null;
  sharing_types: string[];
  amenity_ids: string[];
  owner_name?: string | null;
  owner_phone?: string | null;
}

export function ListingFormAdmin({
  listing,
  cities,
  areas,
  amenities,
}: {
  listing?: AdminListingFormRow;
  cities: City[];
  areas: Area[];
  amenities: Amenity[];
}) {
  const action = listing ? updateListing : createListing;
  const [state, formAction, pending] = useActionState<AdminActionState | null, FormData>(
    action,
    null
  );
  const checkedAmenities = listing?.amenity_ids ?? [];
  const checkedSharing = listing?.sharing_types ?? [];

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name *</label>
          <input name="name" defaultValue={listing?.name} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select name="status" defaultValue={listing?.status ?? "pending_review"} className={inputCls}>
            {["draft", "pending_review", "published", "rejected", "archived"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>City *</label>
          <select name="city_id" defaultValue={listing?.city_id ?? ""} required className={inputCls}>
            <option value="">Choose a city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.state})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Area</label>
          <select name="area_id" defaultValue={listing?.area_id ?? ""} className={inputCls}>
            <option value="">None</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>PG type *</label>
          <select name="pg_type" defaultValue={listing?.pg_type ?? ""} required className={inputCls}>
            <option value="">Choose</option>
            <option value="female">Women</option>
            <option value="male">Men</option>
            <option value="unisex">Co-living</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Contact phone</label>
          <input
            name="contact_phone"
            defaultValue={listing?.contact_phone ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Contact WhatsApp</label>
          <input
            name="contact_whatsapp"
            defaultValue={listing?.contact_whatsapp ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Address</label>
          <input
            name="address_line"
            defaultValue={listing?.address_line ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Price from (₹/mo)</label>
          <input
            name="price_min"
            type="number"
            min="0"
            defaultValue={listing?.price_min ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Price up to (₹/mo)</label>
          <input
            name="price_max"
            type="number"
            min="0"
            defaultValue={listing?.price_max ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Food</label>
          <select name="food_preference" defaultValue={listing?.food_preference ?? ""} className={inputCls}>
            <option value="">Choose</option>
            <option value="veg">Veg only</option>
            <option value="non_veg">Non-veg</option>
            <option value="both">Veg &amp; non-veg</option>
            <option value="not_provided">Not provided</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>House rules</label>
          <select
            name="house_rules_strictness"
            defaultValue={listing?.house_rules_strictness ?? ""}
            className={inputCls}
          >
            <option value="">Choose</option>
            <option value="strict">Strict</option>
            <option value="moderate">Moderate</option>
            <option value="liberal">Liberal</option>
          </select>
        </div>
      </div>

      <div>
        <span className={labelCls}>Sharing types</span>
        <div className="flex flex-wrap gap-2">
          {SHARING_OPTIONS.map((s) => (
            <label
              key={s}
              className="cursor-pointer rounded-full border border-grey-50 bg-grey-10 px-3.5 py-1.5 text-[12.5px] font-semibold text-grey-600 transition has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:checked]:text-primary"
            >
              <input
                type="checkbox"
                name="sharing_types"
                value={s}
                defaultChecked={checkedSharing.includes(s)}
                className="sr-only"
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {listing && amenities.length > 0 && (
        <div>
          <span className={labelCls}>Amenities</span>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <label
                key={a.id}
                className="cursor-pointer rounded-full border border-grey-50 bg-grey-10 px-3.5 py-1.5 text-[12.5px] font-semibold text-grey-600 transition has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:checked]:text-primary"
              >
                <input
                  type="checkbox"
                  name="amenity_ids"
                  value={a.id}
                  defaultChecked={checkedAmenities.includes(a.id)}
                  className="sr-only"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={listing?.description ?? ""}
          className={inputCls}
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-alert-bg px-4 py-3 text-sm font-semibold text-alert-fg">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-md bg-success-bg px-4 py-3 text-sm font-semibold text-success-fg">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : listing ? "Save changes" : "Create listing"}
      </button>
    </form>
  );
}

"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { submitListing, type SubmitState } from "@/lib/actions";
import { getSupabaseBrowser, LISTING_IMAGES_BUCKET } from "@/lib/supabase-browser";

interface CityOpt {
  id: string;
  name: string;
  state: string;
}
interface AreaOpt {
  id: string;
  city_id: string;
  name: string;
}

const SHARING_OPTIONS = ["Single", "Double", "Triple", "4-bed", "5-bed"];

const inputCls =
  "w-full rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";
const labelCls = "mb-1.5 block text-sm font-semibold text-grey-700";

export function OwnerForm({ cities, areas }: { cities: CityOpt[]; areas: AreaOpt[] }) {
  const [state, action, pending] = useActionState<SubmitState | null, FormData>(
    submitListing,
    null
  );
  const [cityId, setCityId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cityAreas = areas.filter((a) => a.city_id === cityId);

  // Photos are uploaded to Supabase Storage from the browser (publishable
  // key + bucket RLS), then only their storage paths travel to the server
  // action — keeps big files out of the action payload.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current!;
    const fd = new FormData(form);
    const files = (fd.getAll("photos") as File[]).filter((f) => f && f.size > 0);
    fd.delete("photos");

    if (files.length > 0) {
      setUploading(true);
      setUploadError(null);
      try {
        const supabase = getSupabaseBrowser();
        for (const file of files.slice(0, 10)) {
          if (file.size > 5 * 1024 * 1024)
            throw new Error(`"${file.name}" is over 5MB — please resize it.`);
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const path = `submissions/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from(LISTING_IMAGES_BUCKET)
            .upload(path, file, { contentType: file.type });
          if (error) throw new Error(error.message);
          fd.append("image_paths", path);
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Photo upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    startTransition(() => action(fd));
  }

  if (state?.ok) {
    return (
      <div className="rounded-3xl bg-success-bg p-8 text-center">
        <p className="text-lg font-bold text-success-fg">Submission received 🎉</p>
        <p className="mt-2 text-sm leading-relaxed text-grey-600">
          Thanks for listing with us. Our team will verify the details and
          publish your PG shortly — we&apos;ll reach out on the contact number
          you shared if we need photos or anything else.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="font-display text-xl text-grey-900">About you</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="owner_name" className={labelCls}>
              Your name *
            </label>
            <input id="owner_name" name="owner_name" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="owner_phone" className={labelCls}>
              Contact number *
            </label>
            <input
              id="owner_phone"
              name="owner_phone"
              type="tel"
              required
              placeholder="+91"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="owner_whatsapp" className={labelCls}>
              WhatsApp number
            </label>
            <input id="owner_whatsapp" name="owner_whatsapp" type="tel" className={inputCls} />
          </div>
          <div>
            <label htmlFor="owner_email" className={labelCls}>
              Email
            </label>
            <input id="owner_email" name="owner_email" type="email" className={inputCls} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl text-grey-900">Your PG</legend>
        <div>
          <label htmlFor="pg_name" className={labelCls}>
            PG name *
          </label>
          <input id="pg_name" name="pg_name" required className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city_id" className={labelCls}>
              City *
            </label>
            <select
              id="city_id"
              name="city_id"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className={inputCls}
            >
              <option value="">Choose a city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="area_id" className={labelCls}>
              Area / locality
            </label>
            <select id="area_id" name="area_id" className={inputCls} disabled={!cityAreas.length}>
              <option value="">
                {cityAreas.length ? "Choose an area" : "Mention in address below"}
              </option>
              {cityAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="address_line" className={labelCls}>
            Address
          </label>
          <input id="address_line" name="address_line" className={inputCls} />
        </div>
        <div>
          <span className={labelCls}>PG type *</span>
          <div className="flex gap-2">
            {(
              [
                ["female", "Girls"],
                ["male", "Boys"],
                ["unisex", "Co-living"],
              ] as const
            ).map(([v, label]) => (
              <label
                key={v}
                className="flex-1 cursor-pointer rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-center text-sm font-semibold text-grey-600 transition has-[:checked]:border-primary has-[:checked]:bg-accent/15 has-[:checked]:text-primary"
              >
                <input type="radio" name="pg_type" value={v} required className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <span className={labelCls}>Sharing types offered</span>
          <div className="flex flex-wrap gap-2">
            {SHARING_OPTIONS.map((s) => (
              <label
                key={s}
                className="cursor-pointer rounded-full border border-grey-100 bg-white px-4 py-1.5 text-sm font-semibold text-grey-600 transition has-[:checked]:border-teal has-[:checked]:bg-success-bg has-[:checked]:text-success-fg"
              >
                <input type="checkbox" name="sharing_types" value={s} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price_min" className={labelCls}>
              Price from (₹/month)
            </label>
            <input id="price_min" name="price_min" type="number" min="0" className={inputCls} />
          </div>
          <div>
            <label htmlFor="price_max" className={labelCls}>
              Price up to (₹/month)
            </label>
            <input id="price_max" name="price_max" type="number" min="0" className={inputCls} />
          </div>
          <div>
            <label htmlFor="food_preference" className={labelCls}>
              Food
            </label>
            <select id="food_preference" name="food_preference" className={inputCls}>
              <option value="">Choose</option>
              <option value="veg">Veg only</option>
              <option value="non_veg">Non-veg</option>
              <option value="both">Veg & non-veg</option>
              <option value="not_provided">Not provided</option>
            </select>
          </div>
          <div>
            <label htmlFor="house_rules_strictness" className={labelCls}>
              House rules
            </label>
            <select id="house_rules_strictness" name="house_rules_strictness" className={inputCls}>
              <option value="">Choose</option>
              <option value="strict">Strict</option>
              <option value="moderate">Moderate</option>
              <option value="liberal">Liberal</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="photos" className={labelCls}>
            Photos (up to 10, max 5MB each)
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="w-full rounded-xl border border-dashed border-grey-100 bg-white px-4 py-3 text-sm text-grey-500 file:mr-3 file:rounded-full file:border-0 file:bg-accent/25 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
          />
        </div>
        <div>
          <label htmlFor="description" className={labelCls}>
            Tell seekers about your PG
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Rooms, food, nearby offices/colleges, rules…"
            className={inputCls}
          />
        </div>
      </fieldset>

      {(state?.error || uploadError) && (
        <p className="rounded-xl bg-alert-bg px-4 py-3 text-sm font-semibold text-alert-fg">
          {uploadError ?? state?.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="w-full rounded-full bg-primary px-6 py-3.5 font-bold text-white shadow-md shadow-primary/25 transition hover:bg-purple disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {uploading ? "Uploading photos…" : pending ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs leading-relaxed text-grey-400">
        Listing is free. Our team reviews every submission before it goes
        live, and will contact you for photos and verification.
      </p>
    </form>
  );
}

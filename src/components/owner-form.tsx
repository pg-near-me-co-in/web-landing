"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitListing, type SubmitState } from "@/lib/actions";
import { getSupabaseBrowser, LISTING_IMAGES_BUCKET } from "@/lib/supabase-browser";
import { trackEvent } from "@/lib/gtag";

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

const STEPS = ["Basics", "Location", "Pricing & amenities", "Photos & review"];

const inputCls =
  "w-full rounded-[10px] border border-grey-100 bg-grey-5 px-3.5 py-3 text-[14.5px] text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

/** Ref list-property.html: multi-step wizard (step labels + pills, Back /
 *  Continue nav, live summary card). All steps stay mounted in one <form> so
 *  FormData collects everything; each step is validated before advancing. */
export function OwnerForm({ cities, areas }: { cities: CityOpt[]; areas: AreaOpt[] }) {
  const [state, action, pending] = useActionState<SubmitState | null, FormData>(
    submitListing,
    null
  );
  const [step, setStep] = useState(0);
  const [cityId, setCityId] = useState("");
  const [pgName, setPgName] = useState("");
  const [pgType, setPgType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const cityAreas = areas.filter((a) => a.city_id === cityId);
  const cityName = cities.find((c) => c.id === cityId)?.name;

  useEffect(() => {
    if (state?.ok) trackEvent("owner_submission");
  }, [state?.ok]);

  function validateStep(i: number): boolean {
    const fs = stepRefs.current[i];
    if (!fs) return true;
    for (const el of Array.from(
      fs.querySelectorAll<HTMLInputElement>("input, select, textarea")
    )) {
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  // Photos are uploaded to Supabase Storage from the browser (publishable
  // key + bucket RLS), then only their storage paths travel to the server
  // action — keeps big files out of the action payload.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateStep(step)) return;
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
      <div className="rounded-[22px] bg-success-bg p-8 text-center">
        <p className="text-lg font-bold text-teal-dark">Submission received 🎉</p>
        <p className="mt-2 text-sm leading-relaxed text-grey-600">
          Thanks for listing with us. Our team will verify the details and
          publish your PG shortly — we&apos;ll reach out on the contact number
          you shared if we need photos or anything else.
        </p>
      </div>
    );
  }

  const stepCls = (i: number) => (i === step ? "block" : "hidden");

  return (
    <div>
      {/* Step labels + pills (ref .step-labels / .stepper) */}
      <div className="mb-1.5 flex justify-between font-mono text-[11px] text-grey-400">
        {STEPS.map((s, i) => (
          <span key={s} className={i === step ? "font-semibold text-primary" : ""}>
            {s}
          </span>
        ))}
      </div>
      <div className="mb-7 flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-[5px] flex-1 rounded-full ${
              i <= step ? "bg-primary" : "bg-grey-100"
            }`}
          />
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_280px]">
          <div className="surface-card p-6 sm:p-7">
            {/* Step 1 — Basics */}
            <fieldset
              ref={(el) => {
                stepRefs.current[0] = el;
              }}
              className={stepCls(0)}
            >
              <h3 className="mb-4.5 font-display text-lg font-semibold text-grey-900">
                About you &amp; your property
              </h3>
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
                  <input
                    id="owner_whatsapp"
                    name="owner_whatsapp"
                    type="tel"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="owner_email" className={labelCls}>
                    Email
                  </label>
                  <input id="owner_email" name="owner_email" type="email" className={inputCls} />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="pg_name" className={labelCls}>
                  Property name *
                </label>
                <input
                  id="pg_name"
                  name="pg_name"
                  required
                  placeholder="e.g. Sunrise Residency PG"
                  className={inputCls}
                  value={pgName}
                  onChange={(e) => setPgName(e.target.value)}
                />
              </div>
            </fieldset>

            {/* Step 2 — Location */}
            <fieldset
              ref={(el) => {
                stepRefs.current[1] = el;
              }}
              className={stepCls(1)}
            >
              <h3 className="mb-4.5 font-display text-lg font-semibold text-grey-900">
                Where is it?
              </h3>
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
                  <select
                    id="area_id"
                    name="area_id"
                    className={inputCls}
                    disabled={!cityAreas.length}
                  >
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
              <div className="mt-4">
                <label htmlFor="address_line" className={labelCls}>
                  Address
                </label>
                <input id="address_line" name="address_line" className={inputCls} />
              </div>
            </fieldset>

            {/* Step 3 — Pricing & amenities */}
            <fieldset
              ref={(el) => {
                stepRefs.current[2] = el;
              }}
              className={stepCls(2)}
            >
              <h3 className="mb-4.5 font-display text-lg font-semibold text-grey-900">
                Pricing &amp; amenities
              </h3>
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
                      className="flex-1 cursor-pointer rounded-[10px] border border-grey-50 bg-grey-10 px-4 py-2.5 text-center text-[13px] font-semibold text-grey-500 transition has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white"
                    >
                      <input
                        type="radio"
                        name="pg_type"
                        value={v}
                        required
                        className="sr-only"
                        onChange={() => setPgType(label)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <span className={labelCls}>Sharing types offered</span>
                <div className="flex flex-wrap gap-2">
                  {SHARING_OPTIONS.map((s) => (
                    <label
                      key={s}
                      className="cursor-pointer rounded-full border border-grey-50 bg-grey-10 px-3.5 py-1.5 text-[12.5px] font-semibold text-grey-600 transition has-[:checked]:border-accent has-[:checked]:bg-primary-tint has-[:checked]:text-primary"
                    >
                      <input
                        type="checkbox"
                        name="sharing_types"
                        value={s}
                        className="sr-only"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="price_min" className={labelCls}>
                    Price from (₹/month)
                  </label>
                  <input
                    id="price_min"
                    name="price_min"
                    type="number"
                    min="0"
                    className={inputCls}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
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
                    <option value="both">Veg &amp; non-veg</option>
                    <option value="not_provided">Not provided</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="house_rules_strictness" className={labelCls}>
                    House rules
                  </label>
                  <select
                    id="house_rules_strictness"
                    name="house_rules_strictness"
                    className={inputCls}
                  >
                    <option value="">Choose</option>
                    <option value="strict">Strict</option>
                    <option value="moderate">Moderate</option>
                    <option value="liberal">Liberal</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Step 4 — Photos & review */}
            <fieldset
              ref={(el) => {
                stepRefs.current[3] = el;
              }}
              className={stepCls(3)}
            >
              <h3 className="mb-4.5 font-display text-lg font-semibold text-grey-900">
                Photos &amp; description
              </h3>
              <div>
                <label
                  htmlFor="photos"
                  className="block cursor-pointer rounded-[14px] border-[1.5px] border-dashed border-grey-200 bg-grey-5 p-8 text-center text-[13.5px] text-grey-400 transition hover:border-primary hover:text-primary"
                >
                  {photoCount > 0
                    ? `${photoCount} photo${photoCount === 1 ? "" : "s"} selected — tap to change`
                    : "Add photos of rooms, common areas and the building (up to 10, max 5MB each)"}
                </label>
                <input
                  id="photos"
                  name="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
                />
              </div>
              <div className="mt-4">
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
              <p className="mt-3 text-xs leading-relaxed text-grey-400">
                Listing is free. Our team reviews every submission before it
                goes live, and will contact you for verification.
              </p>
            </fieldset>

            {(state?.error || uploadError) && (
              <p className="mt-4 rounded-[10px] bg-alert-bg px-4 py-3 text-sm font-semibold text-alert-fg">
                {uploadError ?? state?.error}
              </p>
            )}

            {/* Step nav (ref .form-nav) */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                disabled={step === 0}
                className="rounded-[10px] border border-grey-100 bg-white px-5 py-2.5 text-sm font-semibold text-grey-800 transition hover:border-primary hover:text-primary disabled:invisible"
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={pending || uploading}
                  className="rounded-[10px] bg-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading photos…"
                    : pending
                      ? "Submitting…"
                      : "Submit for review"}
                </button>
              )}
            </div>
          </div>

          {/* Live summary (ref .summary-card) */}
          <aside className="surface-card sticky top-20 hidden p-5.5 lg:block">
            <h4 className="mb-3 font-display text-[13px] font-bold uppercase tracking-wide text-grey-500">
              Your listing
            </h4>
            <dl className="text-[13.5px]">
              {(
                [
                  ["Property", pgName || "—"],
                  ["City", cityName ?? "—"],
                  ["Type", pgType || "—"],
                  [
                    "From",
                    priceMin ? `₹${Number(priceMin).toLocaleString("en-IN")}/mo` : "—",
                  ],
                  ["Photos", photoCount ? `${photoCount} selected` : "—"],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-b border-grey-50 py-2.5 text-grey-600 last:border-0"
                >
                  <dt>{k}</dt>
                  <dd className="font-semibold text-grey-900">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3.5 text-xs leading-relaxed text-grey-400">
              ₹0 listing fee · ₹0 commission · verified before publishing
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
}

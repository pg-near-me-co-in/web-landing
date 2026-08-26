"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { City } from "@/lib/types";
import { AMENITIES_ALL, SHARING_TYPES } from "@/lib/format";
import { SITE } from "@/lib/content";
import { trackEvent } from "@/lib/gtag";

const PHONE_RE = /^\+?[0-9\- ]{7,20}$/;

/**
 * Phase A has no database to insert an owner submission into, so this
 * validates client-side (mirroring the original submitSchema's rules) and
 * hands off to a pre-filled `mailto:` draft instead of a Supabase insert —
 * same fields, same sections, zero backend to stand up. Phase B swaps the
 * mailto for a real server action + DB insert behind this same UI.
 */
export function OwnerForm({ cities }: { cities: City[] }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [sharing, setSharing] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [roadAccess, setRoadAccess] = useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: string[] = [];

    const name = get("name");
    const contactPhone = get("contact_phone");
    const priceMin = Number(get("price_min"));
    const priceMax = Number(get("price_max"));
    const submittedByEmail = get("submitted_by_email");

    if (name.length < 2) errs.push("PG name is required.");
    if (!PHONE_RE.test(contactPhone)) errs.push("Enter a valid owner phone number.");
    if (!priceMin || !priceMax) errs.push("Enter both rent min and max.");
    else if (priceMin > priceMax) errs.push("Min price cannot exceed max price.");
    if (sharing.length === 0) errs.push("Pick at least one sharing type.");
    if (!/^\S+@\S+\.\S+$/.test(submittedByEmail)) errs.push("Enter a valid email address.");

    if (errs.length > 0) {
      setErrors(errs);
      setStatus("error");
      return;
    }
    setErrors([]);

    const lines = [
      `PG name: ${name}`,
      `City: ${get("city")}`,
      `Locality: ${get("locality")}`,
      `Full address: ${get("address")}`,
      `Gender policy: ${get("pg_gender")}`,
      `Rent: ₹${get("price_min")} – ₹${get("price_max")} per bed/month`,
      `Sharing types: ${sharing.join(", ")}`,
      `Food: ${get("food_type")}`,
      `House rules: ${get("house_rules")}`,
      `Vehicle-accessible: ${roadAccess ? "Yes" : "No"}`,
      `Amenities: ${amenities.join(", ") || "—"}`,
      `Description: ${get("description") || "—"}`,
      `Owner phone: ${contactPhone}`,
      `Owner WhatsApp: ${get("contact_whatsapp") || "—"}`,
      `Submitted by: ${get("submitted_by_name")} (${submittedByEmail})`,
    ];
    const subject = encodeURIComponent(`New PG submission: ${name} (${get("city")})`);
    const body = encodeURIComponent(lines.join("\n"));

    trackEvent("owner_submission_completed", { city: get("city") });
    window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-success-fg/30 bg-success-bg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success-fg" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Thanks — we&apos;ve got it.</h1>
        <p className="mt-2 text-grey-500">
          Your email app should have opened with the listing details pre-filled. Send it and our team will manually
          verify your submission before publishing — typically within 24–48 hours.
        </p>
        <Link href="/" className="mt-6 inline-block text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        {errors.length > 0 && (
          <div className="mb-6 rounded-xl border border-alert-fg/30 bg-alert-bg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-alert-fg">
              <AlertCircle className="h-4 w-4" /> Please fix the following
            </div>
            <ul className="mt-2 list-disc pl-6 text-sm text-alert-fg">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-6">
          <Section title="Property">
            <Field label="PG name" name="name" required maxLength={120} placeholder="Shreeji PG" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Locality" name="locality" required placeholder="Alkapuri" />
              <SelectField label="Gender policy" name="pg_gender" required options={[["male", "Male only"], ["female", "Female only"], ["unisex", "Unisex / Co-living"]]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="City" name="city" required options={cities.map((c) => [c.name, c.name] as [string, string])} />
              <Field label="Full address" name="address" required placeholder="Street, locality, landmark — 6 digit PIN" />
            </div>
          </Section>

          <Section title="Pricing & rooms">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rent min (₹/mo per bed)" name="price_min" type="number" required min={500} />
              <Field label="Rent max (₹/mo per bed)" name="price_max" type="number" required min={500} />
            </div>
            <ChipGroup label="Sharing types offered" options={[...SHARING_TYPES]} value={sharing} onChange={setSharing} />
          </Section>

          <Section title="Food, rules & access">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Food"
                name="food_type"
                required
                options={[
                  ["veg_only", "Veg only"],
                  ["jain_only", "Jain food"],
                  ["non_veg_allowed", "Non-veg allowed"],
                  ["no_food", "No food provided"],
                ]}
              />
              <SelectField label="House rules" name="house_rules" required options={[["liberal", "Liberal"], ["strict", "Strict (curfew / restrictions)"]]} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={roadAccess} onChange={(e) => setRoadAccess(e.target.checked)} />
              Vehicle-accessible (not behind a narrow lane)
            </label>
            <ChipGroup label="Amenities" options={[...AMENITIES_ALL]} value={amenities} onChange={setAmenities} />
          </Section>

          <Section title="Description (optional)">
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              placeholder="What makes your PG a good fit? Curfew, food style, warden, neighborhood, best-suited residents…"
              className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Section>

          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone (owner)" name="contact_phone" required placeholder="+91 98240 12345" />
              <Field label="WhatsApp (optional)" name="contact_whatsapp" placeholder="+91 98240 12345" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" name="submitted_by_name" required placeholder="Kirti Patel" />
              <Field label="Your email" name="submitted_by_email" type="email" required placeholder="you@example.com" />
            </div>
          </Section>

          <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white shadow-[var(--shadow-elevated)] transition hover:bg-primary-dark">
            Submit for review
          </button>
        </form>
      </div>

      <aside className="h-max lg:sticky lg:top-24">
        <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">What happens next</div>
          <ol className="mt-3 space-y-3 text-sm">
            <li>
              <span className="font-semibold">1.</span> We verify the phone number and basic details.
            </li>
            <li>
              <span className="font-semibold">2.</span> Approved within 24–48 hours.
            </li>
            <li>
              <span className="font-semibold">3.</span> Live on search, with your number one tap away.
            </li>
          </ol>
          <div className="mt-6 rounded-xl bg-primary-tint p-4 text-xs text-primary">Free during Phase 1. We don&apos;t take commission on any lead.</div>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-grey-500">{title}</div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field(props: { label: string; name: string; required?: boolean; type?: string; placeholder?: string; min?: number; maxLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {props.label}
        {props.required && <span className="text-alert-fg"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        placeholder={props.placeholder}
        min={props.min}
        maxLength={props.maxLength}
        className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function SelectField(props: { label: string; name: string; required?: boolean; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {props.label}
        {props.required && <span className="text-alert-fg"> *</span>}
      </span>
      <select name={props.name} required={props.required} defaultValue="" className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary">
        <option value="" disabled>
          Select…
        </option>
        {props.options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? value.filter((v) => v !== opt) : [...value, opt])}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

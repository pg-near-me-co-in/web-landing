"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/lib/types";
import { SITE } from "@/lib/content";
import { trackEvent } from "@/lib/gtag";

/**
 * Phase A has no database to insert an owner submission into, so this form
 * validates client-side and hands off to a pre-filled `mailto:` draft — the
 * founder receives the same fields the old app's `pg_listings` insert would
 * have captured, with zero backend to stand up. Phase B swaps this for a
 * real server action + DB insert behind the same UI and fires the same
 * `owner_submission_completed` event, so analytics history stays continuous.
 */
export function OwnerForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    const lines = [
      `Owner name: ${get("owner_name")}`,
      `Owner phone: ${get("owner_phone")}`,
      `Owner email: ${get("owner_email") || "—"}`,
      `PG name: ${get("pg_name")}`,
      `City: ${get("city")}`,
      `PG type: ${get("pg_type")}`,
      `Sharing types: ${fd.getAll("sharing_types").join(", ") || "—"}`,
      `Price range: ₹${get("price_min") || "?"} – ₹${get("price_max") || "?"}`,
      `Address: ${get("address_line") || "—"}`,
      `Description: ${get("description") || "—"}`,
    ];
    const subject = encodeURIComponent(`New PG submission: ${get("pg_name")} (${get("city")})`);
    const body = encodeURIComponent(lines.join("\n"));

    trackEvent("owner_submission_completed", { city: get("city") });
    window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => router.refresh(), 100);
  }

  if (sent) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="font-display text-xl font-semibold text-grey-900">Thanks — almost done!</p>
        <p className="mt-2 text-sm text-grey-500">
          Your email app should have opened with the listing details pre-filled. Send it and our team will verify
          and publish your PG within a few days.
        </p>
      </div>
    );
  }

  const fieldCls =
    "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
  const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="surface-card grid gap-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="owner_name">Your name *</label>
            <input id="owner_name" name="owner_name" required className={fieldCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="owner_phone">Your phone *</label>
            <input id="owner_phone" name="owner_phone" type="tel" required className={fieldCls} />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="owner_email">Email (optional)</label>
          <input id="owner_email" name="owner_email" type="email" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pg_name">PG / property name *</label>
          <input id="pg_name" name="pg_name" required className={fieldCls} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="city">City *</label>
            <select id="city" name="city" required defaultValue="" className={fieldCls}>
              <option value="" disabled>
                Choose a city
              </option>
              {cities.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="pg_type">PG type *</label>
            <select id="pg_type" name="pg_type" required defaultValue="" className={fieldCls}>
              <option value="" disabled>
                Choose one
              </option>
              <option value="female">Girls / women-only</option>
              <option value="male">Boys / men-only</option>
              <option value="unisex">Co-living / unisex</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="address_line">Address / locality</label>
          <input id="address_line" name="address_line" className={fieldCls} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="price_min">Price from (₹/month)</label>
            <input id="price_min" name="price_min" type="number" min={0} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="price_max">Price up to (₹/month)</label>
            <input id="price_max" name="price_max" type="number" min={0} className={fieldCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Sharing types offered</label>
          <div className="flex flex-wrap gap-3">
            {["Single", "Double", "Triple", "4-bed", "5-bed"].map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-sm text-grey-700">
                <input type="checkbox" name="sharing_types" value={s} className="accent-primary" />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} className={fieldCls} />
        </div>
        <button type="submit" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
          Submit listing →
        </button>
      </div>

      <aside className="surface-card h-fit p-6">
        <h3 className="font-display text-base font-semibold text-grey-900">What happens next</h3>
        <ol className="mt-3 space-y-2.5 text-sm text-grey-600">
          <li>1. Submitting opens an email to our team with your listing details.</li>
          <li>2. Our team verifies the details (usually within a few days).</li>
          <li>3. Your PG goes live and seekers can contact you directly — zero commission, ever.</li>
        </ol>
      </aside>
    </form>
  );
}

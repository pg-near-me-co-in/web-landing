"use client";

import { useActionState } from "react";
import { createCity, updateCity, type AdminActionState } from "@/lib/admin-actions";
import type { City } from "@/lib/types";

const inputCls =
  "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

export function CityFormAdmin({ city }: { city?: City }) {
  const action = city ? updateCity : createCity;
  const [state, formAction, pending] = useActionState<AdminActionState | null, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {city && <input type="hidden" name="id" value={city.id} />}
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" defaultValue={city?.name} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>State *</label>
        <input name="state" defaultValue={city?.state} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Tagline</label>
        <input
          name="tagline"
          defaultValue={city?.tagline ?? ""}
          placeholder="e.g. Student hub around MSU, Alkapuri & Sayajigunj"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Hero image URL</label>
        <input
          name="hero_image_url"
          defaultValue={city?.hero_image_url ?? ""}
          placeholder="https://…"
          className={inputCls}
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-grey-700">
        <input
          type="checkbox"
          name="is_launched"
          defaultChecked={city?.is_launched}
          className="h-4 w-4 rounded border-grey-200"
        />
        Launched (visible in public search)
      </label>

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
        {pending ? "Saving…" : city ? "Save changes" : "Create city"}
      </button>
    </form>
  );
}

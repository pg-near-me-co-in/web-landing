"use client";

import { useActionState } from "react";
import { createArea, updateArea, type AdminActionState } from "@/lib/admin-actions";
import type { City } from "@/lib/types";

const inputCls =
  "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

interface AreaRow {
  id: string;
  name: string;
  city_id: string;
  is_active: boolean;
}

export function AreaFormAdmin({ area, cities }: { area?: AreaRow; cities: City[] }) {
  const action = area ? updateArea : createArea;
  const [state, formAction, pending] = useActionState<AdminActionState | null, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {area && <input type="hidden" name="id" value={area.id} />}
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" defaultValue={area?.name} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>City *</label>
        <select name="city_id" defaultValue={area?.city_id ?? ""} required className={inputCls}>
          <option value="">Choose a city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {area && (
        <label className="flex items-center gap-2 text-sm font-semibold text-grey-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={area.is_active}
            className="h-4 w-4 rounded border-grey-200"
          />
          Active (selectable in public filters)
        </label>
      )}

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
        {pending ? "Saving…" : area ? "Save changes" : "Create area"}
      </button>
    </form>
  );
}

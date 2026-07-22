"use client";

import { useActionState } from "react";
import { createAmenity, updateAmenity, type AdminActionState } from "@/lib/admin-actions";
import type { Amenity } from "@/lib/types";

const inputCls =
  "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

export function AmenityFormAdmin({ amenity }: { amenity?: Amenity }) {
  const action = amenity ? updateAmenity : createAmenity;
  const [state, formAction, pending] = useActionState<AdminActionState | null, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {amenity && <input type="hidden" name="id" value={amenity.id} />}
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" defaultValue={amenity?.name} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select name="category" defaultValue={amenity?.category ?? ""} className={inputCls}>
          <option value="">None</option>
          <option value="comfort">Comfort</option>
          <option value="safety">Safety</option>
          <option value="food">Food</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Icon key</label>
        <input
          name="icon_key"
          defaultValue={amenity?.icon_key ?? ""}
          placeholder="e.g. wifi, ac, laundry"
          className={inputCls}
        />
      </div>
      {amenity && (
        <label className="flex items-center gap-2 text-sm font-semibold text-grey-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={amenity.is_active}
            className="h-4 w-4 rounded border-grey-200"
          />
          Active
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
        {pending ? "Saving…" : amenity ? "Save changes" : "Create amenity"}
      </button>
    </form>
  );
}

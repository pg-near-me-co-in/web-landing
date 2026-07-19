"use client";

import { useActionState } from "react";
import { saveSeoMeta, type AdminActionState } from "@/lib/admin-actions";

const inputCls =
  "w-full rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";
const labelCls = "mb-1 block text-xs font-semibold text-grey-500";

export interface SeoFormValues {
  entity_type: "static_page" | "city" | "listing";
  entity_id: string | null;
  route_pattern: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
}

export function SeoForm({ initial }: { initial: SeoFormValues }) {
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    saveSeoMeta,
    null
  );

  return (
    <form action={action} className="mt-4 max-w-2xl space-y-4">
      <input type="hidden" name="entity_type" value={initial.entity_type} />
      <input type="hidden" name="entity_id" value={initial.entity_id ?? ""} />
      <input type="hidden" name="route_pattern" value={initial.route_pattern} />
      <div>
        <label htmlFor="meta_title" className={labelCls}>
          Meta title (empty = computed default)
        </label>
        <input
          id="meta_title"
          name="meta_title"
          defaultValue={initial.meta_title}
          maxLength={70}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="meta_description" className={labelCls}>
          Meta description
        </label>
        <textarea
          id="meta_description"
          name="meta_description"
          defaultValue={initial.meta_description}
          maxLength={170}
          rows={2}
          className={inputCls}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="og_title" className={labelCls}>
            OG title
          </label>
          <input
            id="og_title"
            name="og_title"
            defaultValue={initial.og_title}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="og_description" className={labelCls}>
            OG description
          </label>
          <input
            id="og_description"
            name="og_description"
            defaultValue={initial.og_description}
            className={inputCls}
          />
        </div>
      </div>
      {state?.error && (
        <p className="text-sm font-semibold text-alert-fg">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm font-semibold text-success-fg">Saved.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save SEO"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updateOwner, type AdminActionState } from "@/lib/admin-actions";
import type { Owner } from "@/lib/types";

const inputCls =
  "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-2.5 text-sm text-grey-900 outline-none transition focus:border-primary focus:bg-white";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-grey-600";

export function OwnerFormAdmin({ owner }: { owner: Owner }) {
  const [state, formAction, pending] = useActionState<AdminActionState | null, FormData>(
    updateOwner,
    null
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="id" value={owner.id} />
      <div>
        <label className={labelCls}>Name *</label>
        <input name="name" defaultValue={owner.name} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Phone *</label>
        <input name="phone" defaultValue={owner.phone} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input name="email" defaultValue={owner.email ?? ""} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>WhatsApp</label>
        <input
          name="whatsapp_number"
          defaultValue={owner.whatsapp_number ?? ""}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Status</label>
        <select name="status" defaultValue={owner.status} className={inputCls}>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Internal notes</label>
        <textarea name="notes" rows={3} defaultValue={owner.notes ?? ""} className={inputCls} />
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
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

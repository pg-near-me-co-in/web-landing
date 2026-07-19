"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminLogin, type AdminActionState } from "@/lib/admin-actions";

export function AdminLogin() {
  const router = useRouter();
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    adminLogin,
    null
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state?.ok, router]);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input
        name="code"
        type="password"
        required
        placeholder="Access code"
        className="w-full rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      {state?.error && (
        <p className="text-sm font-semibold text-alert-fg">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-purple disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}

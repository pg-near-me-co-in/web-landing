"use client";

import { useActionState } from "react";
import { saveTheme, type AdminActionState } from "@/lib/admin-actions";

const FIELDS: { key: string; label: string }[] = [
  { key: "theme.primary_color", label: "Primary" },
  { key: "theme.purple", label: "Purple" },
  { key: "theme.accent", label: "Accent" },
  { key: "theme.teal", label: "Teal" },
  { key: "theme.highlight", label: "Highlight" },
];

export function ThemeForm({ current }: { current: Record<string, string> }) {
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    saveTheme,
    null
  );

  return (
    <form action={action} className="mt-6 max-w-md space-y-4">
      {FIELDS.map((f) => (
        <label key={f.key} className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-grey-700">{f.label}</span>
          <span className="flex items-center gap-2">
            <input
              type="color"
              name={f.key}
              defaultValue={current[f.key]}
              className="h-9 w-14 cursor-pointer rounded border border-grey-100 bg-white"
            />
            <code className="text-xs text-grey-400">{current[f.key]}</code>
          </span>
        </label>
      ))}
      {state?.error && (
        <p className="text-sm font-semibold text-alert-fg">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-sm font-semibold text-success-fg">
          Saved — live on next page load.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save theme"}
      </button>
    </form>
  );
}

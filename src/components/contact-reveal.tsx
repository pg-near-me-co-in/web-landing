"use client";

import { useActionState, useState } from "react";
import { captureLead, type LeadState } from "@/lib/actions";

/**
 * The notebook's "IP" (interested party) capture: the contact number is
 * revealed only after the seeker leaves their name + phone, which is stored
 * as a row in `leads`.
 */
export function ContactReveal({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<LeadState | null, FormData>(
    captureLead,
    null
  );

  if (state?.ok && !state.phone) {
    return (
      <div className="rounded-2xl bg-warn-bg p-5">
        <p className="text-sm font-semibold text-warn-fg">Interest noted ✓</p>
        <p className="mt-1 text-sm leading-relaxed text-grey-700">
          This owner&apos;s number is still being verified. We&apos;ve recorded
          your interest and will connect you as soon as it&apos;s confirmed.
        </p>
      </div>
    );
  }

  if (state?.ok && state.phone) {
    return (
      <div className="rounded-2xl bg-success-bg p-5">
        <p className="text-sm font-semibold text-success-fg">Owner contact</p>
        <a
          href={`tel:${state.phone.replace(/\s/g, "")}`}
          className="mt-1 block text-2xl font-bold text-grey-900"
        >
          {state.phone}
        </a>
        {state.whatsapp && (
          <a
            href={`https://wa.me/${state.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-full bg-success-fg px-4 py-2 text-sm font-bold text-white"
          >
            Chat on WhatsApp
          </a>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-white shadow-md shadow-primary/25 transition hover:bg-purple"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z" />
        </svg>
        Show contact number
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-grey-50 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-grey-700">
        Share your details to see the owner&apos;s number
      </p>
      <input type="hidden" name="listing_id" value={listingId} />
      <input
        name="name"
        placeholder="Your name"
        className="w-full rounded-xl border border-grey-100 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder="Your mobile number *"
        className="w-full rounded-xl border border-grey-100 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      {state?.error && (
        <p className="text-sm font-semibold text-alert-fg">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-purple disabled:opacity-60"
      >
        {pending ? "Revealing…" : "Reveal number"}
      </button>
      <p className="text-xs text-grey-400">
        We only share your number with this PG&apos;s owner.
      </p>
    </form>
  );
}

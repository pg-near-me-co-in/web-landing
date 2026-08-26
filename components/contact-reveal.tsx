"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/gtag";

const PHONE_RE = /^[+\d][\d\s()-]{7,17}$/;

/**
 * The old app's "IP" (interested-party) capture pattern, kept for
 * behavioral/analytics continuity: a seeker leaves name+phone before the
 * owner's number is shown. In Phase A there's no `leads` table to write to
 * (JSON has no write path) — the form still gates the reveal and fires the
 * same GA4 events as before, so Phase B just adds a real insert behind
 * this same UI without changing the funnel.
 */
export function ContactReveal({
  listingId,
  phone,
  whatsapp,
}: {
  listingId: string;
  phone: string;
  whatsapp: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [name, setName] = useState("");
  const [enteredPhone, setEnteredPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(enteredPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    trackEvent("contact_reveal", { listing_id: listingId });
    setRevealed(true);
  }

  if (revealed) {
    return (
      <div className="rounded-2xl bg-success-bg p-5">
        <p className="text-sm font-semibold text-success-fg">Owner contact</p>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-1 block text-2xl font-bold text-grey-900">
          {phone}
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("click_whatsapp", { listing_id: listingId })}
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
        onClick={() => {
          trackEvent("contact_reveal_click", { listing_id: listingId });
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-white shadow-md shadow-primary/25 transition hover:bg-purple"
      >
        Show contact number
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-grey-50 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-grey-700">Share your details to see the owner&apos;s number</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl border border-grey-100 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      <input
        value={enteredPhone}
        onChange={(e) => setEnteredPhone(e.target.value)}
        type="tel"
        required
        placeholder="Your mobile number *"
        className="w-full rounded-xl border border-grey-100 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm font-semibold text-alert-fg">{error}</p>}
      <button type="submit" className="w-full rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-purple">
        Reveal number
      </button>
      <p className="text-xs text-grey-500">We only share your number with this PG&apos;s owner.</p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/gtag";

export function ContactReveal({
  listingId,
  listingName,
  locality,
  phone,
  whatsapp,
}: {
  listingId: string;
  listingName: string;
  locality: string;
  phone: string;
  whatsapp: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const waNumber = (whatsapp ?? phone).replace(/[^0-9]/g, "");

  function reveal() {
    setRevealed(true);
    trackEvent("contact_reveal", { listing_id: listingId });
  }

  return (
    <div className="space-y-3">
      {!revealed ? (
        <button
          onClick={reveal}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark"
        >
          Reveal owner number
        </button>
      ) : (
        <a
          href={`tel:${phone}`}
          onClick={() => trackEvent("click_call", { listing_id: listingId })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          <Phone className="h-4 w-4" /> {phone}
        </a>
      )}
      {(whatsapp || revealed) && (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${listingName} (${locality}) listed on PG Near Me.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("click_whatsapp", { listing_id: listingId })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-grey-100 bg-white py-3 text-sm font-medium text-grey-800 transition hover:bg-grey-10"
        >
          <MessageCircle className="h-4 w-4 text-success-fg" /> Message on WhatsApp
        </a>
      )}
      <div className="rounded-xl bg-grey-10 p-3 text-xs text-grey-500">
        We track contact-reveal events (not your identity) so owners see qualified interest.
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { trackEvent } from "@/lib/gtag";
import { formatPriceRange, genderLabel, placeName } from "@/lib/format";
import { SITE } from "@/lib/content";
import type { PgType } from "@/lib/types";

function buildWhatsappMessage({
  listingName,
  locality,
  cityName,
  pageUrl,
  priceMin,
  priceMax,
  sharingTypes,
  pgGender,
}: {
  listingName: string;
  locality: string;
  cityName: string;
  pageUrl: string;
  priceMin: number | null;
  priceMax: number | null;
  sharingTypes: string[];
  pgGender: PgType | null;
}) {
  const details = [
    formatPriceRange(priceMin, priceMax),
    sharingTypes.length > 0 ? `${sharingTypes.join("/")} sharing` : null,
    pgGender ? genderLabel(pgGender) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const displayUrl = pageUrl.replace(/^https?:\/\//, "");

  return [
    `Hi, I'm interested in ${listingName} (${placeName(locality, cityName)})${details ? ` — ${details}` : ""}.`,
    "",
    `_${SITE.name} – ${displayUrl}_`,
  ].join("\n");
}

export function ContactReveal({
  listingId,
  listingName,
  locality,
  cityName,
  pageUrl,
  phone,
  whatsapp,
  priceMin,
  priceMax,
  sharingTypes,
  pgGender,
}: {
  listingId: string;
  listingName: string;
  locality: string;
  cityName: string;
  pageUrl: string;
  phone: string;
  whatsapp: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sharingTypes: string[];
  pgGender: PgType | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const waNumber = (whatsapp ?? phone).replace(/[^0-9]/g, "");
  const message = buildWhatsappMessage({ listingName, locality, cityName, pageUrl, priceMin, priceMax, sharingTypes, pgGender });

  function reveal() {
    setRevealed(true);
    trackEvent("contact_reveal", { listing_id: listingId });
  }

  if (!phone) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-grey-100 bg-grey-10 p-4 text-sm text-grey-600">
          Contact number not available for this listing yet.
        </div>
        <a
          href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`Contact info for ${listingName}`)}&body=${encodeURIComponent(`I have contact details for ${listingName} (${placeName(locality, cityName)}) on ${SITE.name}. Here's what I know:`)}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-grey-100 bg-white py-3 text-sm font-medium text-grey-800 transition hover:bg-grey-10"
        >
          <Mail className="h-4 w-4" /> Help us verify this listing
        </a>
      </div>
    );
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
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`}
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

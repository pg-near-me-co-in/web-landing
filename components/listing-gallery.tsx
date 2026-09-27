"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

export function ListingGallery({
  images,
  listingName,
  photoVerifiedDate,
}: {
  images: string[];
  listingName: string;
  photoVerifiedDate?: string | null;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-3 md:grid-cols-[3fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-grey-50 bg-grey-10">
        <div className="relative aspect-[16/10] w-full">
          <Image src={images[active]} alt={`${listingName} — photo ${active + 1}`} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" priority />
        </div>
        {photoVerifiedDate && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-success-fg/20 bg-success-bg px-2.5 py-1 text-[11px] font-bold text-success-fg backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" />
            Photos verified {formatStamp(photoVerifiedDate)}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
        {images.slice(0, 3).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            aria-label={`Show photo ${i + 1} of ${listingName}`}
            aria-pressed={active === i}
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition ${active === i ? "border-primary" : "border-transparent hover:border-grey-100"}`}
          >
            <Image src={src} alt="" fill sizes="128px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

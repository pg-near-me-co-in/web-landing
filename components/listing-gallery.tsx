"use client";

import { useState } from "react";
import Image from "next/image";

export function ListingGallery({ images, listingName }: { images: string[]; listingName: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-3 md:grid-cols-[3fr_1fr]">
      <div className="overflow-hidden rounded-2xl border border-grey-50 bg-grey-10">
        <div className="relative aspect-[16/10] w-full">
          <Image src={images[active]} alt={`${listingName} — photo ${active + 1}`} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" priority />
        </div>
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

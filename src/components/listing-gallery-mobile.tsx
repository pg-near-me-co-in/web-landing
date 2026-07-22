"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { resolveImageUrl } from "@/lib/images";
import type { ListingImage } from "@/lib/types";

/** Swipeable mobile gallery (embla via <Carousel>) — the desktop 2fr/1fr
 *  hero-tile grid with "+N photos" overlay stays in the server-rendered
 *  page and is hidden on mobile via CSS; this is the small mobile-only
 *  client island for the touch-swipe experience. */
export function ListingGalleryMobile({
  images,
  listingName,
}: {
  images: ListingImage[];
  listingName: string;
}) {
  if (images.length === 0) return null;

  return (
    <Carousel className="sm:hidden">
      <CarouselContent className="-ml-0">
        {images.map((img, i) => (
          <CarouselItem key={img.storage_path + i} className="pl-0">
            <div className="relative h-[240px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-purple">
              <Image
                src={resolveImageUrl(img.storage_path)}
                alt={img.alt_text || `${listingName} photo ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-grey-900/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                {i + 1} / {images.length}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

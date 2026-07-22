import Image from "next/image";
import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { formatPriceRange } from "@/lib/format";
import { resolveImageUrl } from "@/lib/images";
import { placeholderPhotoFor } from "@/lib/placeholder-images";
import { PgTypeBadge } from "./badges";

/** Ref .listing-card: image band with badge overlay, title + mono price,
 *  location line, meta row. Deterministic placeholder tile when no real
 *  photo exists yet (src/lib/placeholder-images.ts). */
export function ListingCard({ listing }: { listing: ListingCardType }) {
  const href = `/pg/${listing.city_slug}/${listing.area_slug ?? "all"}/${listing.slug}`;
  const price = formatPriceRange(listing.price_min, listing.price_max);

  return (
    <Link
      href={href}
      className="surface-card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-[3px] hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative h-[150px] bg-gradient-to-br from-accent to-primary">
        <Image
          src={
            listing.cover_image
              ? resolveImageUrl(listing.cover_image)
              : placeholderPhotoFor(listing.id)
          }
          alt={listing.cover_alt ?? listing.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <PgTypeBadge type={listing.pg_type} />
        </div>
        {listing.rating_avg != null && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[11.5px] font-semibold text-grey-800 shadow-sm">
            <svg viewBox="0 0 20 20" className="h-3 w-3 fill-warn-fg" aria-hidden>
              <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
            {Number(listing.rating_avg).toFixed(1)}
            {listing.rating_count > 0 && (
              <span className="font-normal text-grey-500">
                ({listing.rating_count})
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4.5 pb-4.5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug text-grey-900 group-hover:text-primary">
            {listing.name}
          </h3>
          {price ? (
            <span className="whitespace-nowrap font-mono text-[15px] font-semibold text-primary">
              {price}
              <span className="font-normal text-grey-500">/mo</span>
            </span>
          ) : (
            <span className="whitespace-nowrap text-xs font-semibold text-grey-500">
              Ask for price
            </span>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-grey-500">
          {[listing.area_name, listing.city_name].filter(Boolean).join(", ")}
        </p>
        {listing.sharing_types?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-grey-500">
            {listing.sharing_types.slice(0, 3).map((s) => (
              <span key={s}>{s} sharing</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { formatPriceRange } from "@/lib/format";
import { resolveImageUrl } from "@/lib/images";
import { PgTypeBadge, RatingStars } from "./badges";

export function ListingCard({ listing }: { listing: ListingCardType }) {
  const href = `/pg/${listing.city_slug}/${listing.area_slug ?? "all"}/${listing.slug}`;
  const price = formatPriceRange(listing.price_min, listing.price_max);

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-grey-50 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-grey-10">
        {listing.cover_image ? (
          <Image
            src={resolveImageUrl(listing.cover_image)}
            alt={listing.cover_alt ?? listing.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-highlight/20">
            <span className="font-display text-2xl text-primary/50">PG</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <PgTypeBadge type={listing.pg_type} />
        </div>
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-grey-900 group-hover:text-primary">
            {listing.name}
          </h3>
          <RatingStars rating={listing.rating_avg} />
        </div>
        <p className="text-sm text-grey-500">
          {[listing.area_name, listing.city_name].filter(Boolean).join(", ")}
        </p>
        <div className="flex items-center justify-between pt-1">
          {price && (
            <p className="text-sm font-bold text-teal">
              {price}
              <span className="font-normal text-grey-400"> /mo approx</span>
            </p>
          )}
          {listing.sharing_types?.length > 0 && (
            <p className="text-xs text-grey-400">
              {listing.sharing_types.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

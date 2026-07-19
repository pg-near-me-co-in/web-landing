import Image from "next/image";
import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { formatPriceRange } from "@/lib/format";
import { resolveImageUrl } from "@/lib/images";
import { PgTypeBadge } from "./badges";

export function ListingCard({ listing }: { listing: ListingCardType }) {
  const href = `/pg/${listing.city_slug}/${listing.area_slug ?? "all"}/${listing.slug}`;
  const price = formatPriceRange(listing.price_min, listing.price_max);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-grey-50 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-primary/10"
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
        {listing.rating_avg != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-grey-800 shadow-sm">
            <svg viewBox="0 0 20 20" className="h-3 w-3 fill-warn-fg" aria-hidden>
              <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
            {Number(listing.rating_avg).toFixed(1)}
            {listing.rating_count > 0 && (
              <span className="font-normal text-grey-400">
                ({listing.rating_count})
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-bold leading-snug text-grey-900 group-hover:text-primary">
          {listing.name}
        </h3>
        <p className="flex items-center gap-1 text-sm text-grey-500">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 shrink-0 text-grey-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {[listing.area_name, listing.city_name].filter(Boolean).join(", ")}
        </p>

        {listing.sharing_types?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.sharing_types.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full bg-grey-10 px-2 py-0.5 text-[11px] font-semibold text-grey-500"
              >
                {s} sharing
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-grey-50 pt-3">
          {price ? (
            <p className="text-base font-bold text-grey-900">
              {price}
              <span className="text-xs font-normal text-grey-400"> /mo</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-grey-400">Ask for price</p>
          )}
          <span className="text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

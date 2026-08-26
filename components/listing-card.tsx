import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Utensils, ShieldCheck, Star } from "lucide-react";
import type { Listing, ListingCard as ListingCardType } from "@/lib/types";
import { placeholderPhotoFor } from "@/lib/placeholder-images";
import { formatPriceRange, FOOD_LABEL, PG_TYPE_LABEL } from "@/lib/format";

const GENDER_BADGE: Record<string, string> = {
  female: "bg-pink-600/90",
  male: "bg-blue-600/90",
  unisex: "bg-purple-600/90",
};

export function ListingCard({ listing }: { listing: Listing | ListingCardType }) {
  const cover = listing.images[0]?.storage_path ?? placeholderPhotoFor(listing.id);
  const coverAlt =
    listing.images[0]?.alt_text ??
    `${listing.name} — ${listing.pg_type ? PG_TYPE_LABEL[listing.pg_type] : "PG"} in ${listing.area_name ?? listing.city_slug}`;

  return (
    <Link
      href={`/pg/${listing.city_slug}/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-grey-50 bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-grey-10">
        <Image
          src={cover}
          alt={coverAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
        {listing.pg_type && (
          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-xl ${GENDER_BADGE[listing.pg_type] ?? "bg-black/60"}`}
            >
              {PG_TYPE_LABEL[listing.pg_type]}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border border-white/40 bg-white/25 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
          <Star className="h-3 w-3 fill-current" strokeWidth={1.5} /> {listing.trust_score.toFixed(0)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-primary">
            {listing.name}
          </h3>
          <div className="mt-1.5 font-display text-lg font-bold text-primary">
            {formatPriceRange(listing.price_min, listing.price_max) ?? "Ask for price"}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-tighter text-grey-500">Monthly</div>
          <p className="mt-2 flex items-center gap-1 text-xs text-grey-500">
            <MapPin className="h-3 w-3" /> {listing.area_name ?? listing.city_slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-xl border border-grey-50 bg-primary-tint px-2.5 py-1 text-[10px] font-bold text-primary">
            <Users className="mr-1 inline h-3 w-3" />
            {listing.sharing_types[0] ?? "—"}
          </span>
          <span className="rounded-xl border border-grey-50 bg-primary-tint px-2.5 py-1 text-[10px] font-bold text-primary">
            <Utensils className="mr-1 inline h-3 w-3" />
            {FOOD_LABEL[listing.food_preference]}
          </span>
          {listing.house_rules_strictness === "strict" && (
            <span className="rounded-xl border border-grey-50 bg-primary-tint px-2.5 py-1 text-[10px] font-bold text-primary">
              <ShieldCheck className="mr-1 inline h-3 w-3" />
              Strict
            </span>
          )}
        </div>
        <div className="mt-auto rounded-2xl bg-grey-10 py-3 text-center text-sm font-bold transition group-hover:bg-primary group-hover:text-white">
          View Details →
        </div>
      </div>
    </Link>
  );
}

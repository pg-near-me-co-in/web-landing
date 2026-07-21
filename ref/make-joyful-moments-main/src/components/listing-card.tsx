import { Link } from "@tanstack/react-router";
import { MapPin, Star, Utensils, Users, ShieldCheck } from "lucide-react";
import type { ListingRow } from "@/lib/queries";
import { coverFor } from "@/lib/images";
import { formatPriceRange, GENDER_LABEL, FOOD_LABEL } from "@/lib/format";

export function ListingCard({ listing }: { listing: ListingRow }) {
  const cover = coverFor(listing.slug, listing.cover_image);
  return (
    <Link
      to="/listings/$slug"
      params={{ slug: listing.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={`${listing.name} — ${listing.locality}`}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/60 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-xl">
            {GENDER_LABEL[listing.pg_gender]}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-lg">
          <Star className="h-3 w-3 fill-current" strokeWidth={1.5} /> {listing.trust_score.toFixed(1)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold leading-tight transition-colors group-hover:text-primary">
              {listing.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {listing.locality}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-bold text-primary">
              {formatPriceRange(listing.price_min, listing.price_max)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Monthly</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-xl border border-border bg-primary-soft/40 px-2.5 py-1 text-[10px] font-bold text-primary-glow">
            <Users className="mr-1 inline h-3 w-3" />{listing.sharing_types[0] ?? "—"}
          </span>
          <span className="rounded-xl border border-border bg-primary-soft/40 px-2.5 py-1 text-[10px] font-bold text-primary-glow">
            <Utensils className="mr-1 inline h-3 w-3" />{FOOD_LABEL[listing.food_type]}
          </span>
          {listing.house_rules === "strict" && (
            <span className="rounded-xl border border-border bg-primary-soft/40 px-2.5 py-1 text-[10px] font-bold text-primary-glow">
              <ShieldCheck className="mr-1 inline h-3 w-3" />Strict
            </span>
          )}
        </div>
        <div className="mt-auto rounded-2xl bg-surface-muted py-3 text-center text-sm font-bold transition group-hover:bg-primary group-hover:text-primary-foreground">
          View Details →
        </div>
      </div>
    </Link>
  );
}

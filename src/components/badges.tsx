import type { PgType } from "@/lib/types";
import { PG_TYPE_LABEL } from "@/lib/format";

/* Ref .badge — mono-font rounded pills on state-color pairings. */
const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11.5px] font-semibold";

const PG_TYPE_STYLE: Record<PgType, string> = {
  female: "bg-alert-bg text-alert-fg",
  male: "bg-primary-tint text-primary",
  unisex: "bg-success-bg text-teal-dark",
};

export function PgTypeBadge({ type }: { type: PgType | null }) {
  if (!type) return null;
  return (
    <span className={`${BADGE_BASE} ${PG_TYPE_STYLE[type]}`}>
      {PG_TYPE_LABEL[type]}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className={`${BADGE_BASE} bg-success-bg text-teal-dark`}>
      ✓ Verified
    </span>
  );
}

export function RatingStars({
  rating,
  count,
}: {
  rating: number | null;
  count?: number;
}) {
  if (!rating) {
    return <span className="text-xs text-grey-500">No ratings yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-grey-700">
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-warn-fg" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      {Number(rating).toFixed(1)}
      {count != null && count > 0 && (
        <span className="font-normal text-grey-500">({count})</span>
      )}
    </span>
  );
}

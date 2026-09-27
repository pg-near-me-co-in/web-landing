"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { Review, ReviewTag } from "@/lib/types";

const TAGS: ReviewTag[] = ["Safety", "Cleanliness", "Food", "General"];

export function ListingReviews({ reviews }: { reviews: Review[] }) {
  const [tag, setTag] = useState<ReviewTag | "all">("all");

  const filtered = useMemo(() => {
    if (tag === "all") return reviews;
    return reviews.filter((r) => r.review_tags.includes(tag));
  }, [reviews, tag]);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Reviews</h2>
        <div className="flex flex-wrap gap-2">
          <TagChip label="All" active={tag === "all"} onClick={() => setTag("all")} />
          {TAGS.map((t) => (
            <TagChip key={t} label={t} active={tag === t} onClick={() => setTag(t)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-grey-500">No reviews tagged &quot;{tag}&quot; yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-xl border border-grey-50 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-grey-900">{r.author}</div>
                <div className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" /> {r.rating.toFixed(1)}
                </div>
              </div>
              <p className="mt-2 text-sm text-grey-500">{r.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.review_tags.map((t) => (
                  <span key={t} className="chip text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"
      }`}
    >
      {label}
    </button>
  );
}

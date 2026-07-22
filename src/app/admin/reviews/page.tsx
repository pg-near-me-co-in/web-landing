import Link from "next/link";
import { getPendingReviews } from "@/lib/queries";
import { approveReview, rejectReview } from "@/lib/admin-actions";
import { RatingStars } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function ReviewsModerationPage() {
  const rows = await getPendingReviews();

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">
        Pending reviews ({rows.length})
      </h1>
      {rows.length === 0 && (
        <p className="mt-4 text-sm text-grey-500">Nothing waiting. 🎉</p>
      )}
      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-grey-50 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-grey-900">{r.reviewer_name}</p>
                  <RatingStars rating={r.rating} />
                </div>
                <Link
                  href={`/pg/${r.city_slug}/${r.area_slug ?? "all"}/${r.listing_slug}`}
                  className="mt-0.5 block text-sm font-semibold text-primary hover:underline"
                >
                  {r.listing_name}
                </Link>
                {r.review_text && (
                  <p className="mt-2 max-w-2xl text-sm text-grey-600">{r.review_text}</p>
                )}
                <p className="mt-1 text-xs text-grey-500">
                  {new Date(r.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={approveReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full bg-success-fg px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
                    Approve
                  </button>
                </form>
                <form action={rejectReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full bg-alert-bg px-4 py-2 text-sm font-bold text-alert-fg transition hover:opacity-90">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

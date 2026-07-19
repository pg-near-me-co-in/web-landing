"use client";

import { useActionState, useEffect, useState } from "react";
import { submitReview, type ReviewState } from "@/lib/actions";
import { trackEvent } from "@/lib/gtag";

const inputCls =
  "w-full rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";

export function ReviewForm({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState<ReviewState | null, FormData>(
    submitReview,
    null
  );

  useEffect(() => {
    if (state?.ok) trackEvent("review_submit", { listing_id: listingId });
  }, [state?.ok, listingId]);

  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-success-bg p-5 text-sm font-semibold text-success-fg">
        Thanks! Your review is in — it appears once our team approves it.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-grey-100 bg-white px-5 py-2.5 text-sm font-bold text-grey-700 transition hover:border-primary hover:text-primary"
      >
        Write a review
      </button>
    );
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-2xl border border-grey-50 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-7 w-7 transition ${
                n <= (hover || rating) ? "fill-warn-fg" : "fill-grey-100"
              }`}
              aria-hidden
            >
              <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name *" className={inputCls} />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (never shown publicly)"
          className={inputCls}
        />
      </div>
      <textarea
        name="review_text"
        rows={3}
        maxLength={2000}
        placeholder="How was your stay? Food, cleanliness, owner, rules…"
        className={inputCls}
      />
      {state?.error && (
        <p className="text-sm font-semibold text-alert-fg">{state.error}</p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-grey-400 hover:text-grey-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

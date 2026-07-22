"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitReview, type ReviewState } from "@/lib/actions";
import { trackEvent } from "@/lib/gtag";

const inputCls =
  "w-full rounded-xl border border-grey-100 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";

// Mirrors the server-side checks in src/lib/actions.ts's submitReview, so
// client and server agree on what's valid.
const PHONE_RE = /^[+\d][\d\s()-]{7,17}$/;
const reviewSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .refine((v) => !v || PHONE_RE.test(v), { message: "Please enter a valid phone number." }),
  review_text: z.string().max(2000, "Review is too long (2000 characters max)."),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState<ReviewState | null, FormData>(
    submitReview,
    null
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: "", phone: "", review_text: "" },
  });

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

  function onValid(values: ReviewFormValues) {
    if (rating === 0) return;
    const fd = new FormData();
    fd.set("listing_id", listingId);
    fd.set("rating", String(rating));
    fd.set("name", values.name);
    fd.set("phone", values.phone);
    fd.set("review_text", values.review_text);
    startTransition(() => action(fd));
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="space-y-3 rounded-2xl border border-grey-50 bg-white p-5 shadow-sm"
    >
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
        {rating === 0 && (
          <span className="ml-2 text-xs text-grey-500">Pick a star rating</span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input
            {...register("name")}
            placeholder="Your name *"
            className={inputCls}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-alert-fg">{errors.name.message}</p>
          )}
        </div>
        <div>
          <input
            {...register("phone")}
            type="tel"
            placeholder="Phone (never shown publicly)"
            className={inputCls}
          />
          {errors.phone && (
            <p className="mt-1 text-xs font-semibold text-alert-fg">{errors.phone.message}</p>
          )}
        </div>
      </div>
      <div>
        <textarea
          {...register("review_text")}
          rows={3}
          maxLength={2000}
          placeholder="How was your stay? Food, cleanliness, owner, rules…"
          className={inputCls}
        />
        {errors.review_text && (
          <p className="mt-1 text-xs font-semibold text-alert-fg">
            {errors.review_text.message}
          </p>
        )}
      </div>
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
          className="text-sm font-semibold text-grey-500 hover:text-grey-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

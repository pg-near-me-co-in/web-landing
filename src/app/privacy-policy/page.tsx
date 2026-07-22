import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What PG Near Me collects, why, and how it's used.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full flex-1">
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">PRIVACY POLICY</span>
        <h1 className="font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.1] text-grey-900">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-grey-500">Last updated: 22 July 2026</p>

        <p className="mt-7 leading-relaxed text-grey-600">
          PG Near Me (&quot;we&quot;, &quot;us&quot;) operates{" "}
          <span className="font-semibold">pgnearme.co.in</span>, a free
          directory of PG, hostel and shared-flat listings across India. This
          page explains what we collect and why.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">
          What we collect
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-grey-500">
          <li>
            <span className="font-semibold text-grey-700">
              Contact-reveal requests.
            </span>{" "}
            When you tap &quot;Show contact number&quot; on a listing, we ask
            for your name and phone number. This is stored as a lead and
            shared with the relevant PG owner so they can follow up.
          </li>
          <li>
            <span className="font-semibold text-grey-700">
              Owner submissions.
            </span>{" "}
            If you list a property via &quot;Add your PG&quot;, we collect
            your name, phone, email, WhatsApp number, property details and
            any photos you upload (stored via Supabase Storage) to publish
            and verify the listing.
          </li>
          <li>
            <span className="font-semibold text-grey-700">Reviews.</span>{" "}
            If you submit a review, we store your name and review text.
            Phone numbers, if provided, are stored only as a one-way
            cryptographic hash (SHA-256) — never as plain text — used solely
            to deter spam.
          </li>
          <li>
            <span className="font-semibold text-grey-700">
              Analytics.
            </span>{" "}
            We use Google Analytics (GA4) and Microsoft Clarity to understand
            aggregate usage (pages visited, general interactions). These
            tools may set cookies per their own policies.
          </li>
        </ul>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">
          How it&apos;s used
        </h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          Contact details you submit are used only to connect seekers and
          owners, or to publish and moderate listings/reviews. We do not sell
          personal data. Information is shared only with the specific PG
          owner relevant to your enquiry (for lead capture) or displayed
          publicly where you&apos;ve explicitly submitted it for publication
          (e.g. a review or a listing you own).
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">
          Your rights
        </h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          To request a copy, correction, or deletion of your data, email{" "}
          <a
            href="mailto:hello@pgnearme.co.in"
            className="font-semibold text-primary hover:underline"
          >
            hello@pgnearme.co.in
          </a>
          .
        </p>
      </article>
    </main>
  );
}

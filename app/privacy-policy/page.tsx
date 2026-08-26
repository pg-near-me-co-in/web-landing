import type { Metadata } from "next";
import { SITE } from "@/lib/content";

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
        <h1 className="font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.1] text-grey-900">Privacy Policy</h1>
        <p className="mt-3 text-sm text-grey-500">Last updated: 26 August 2026</p>

        <p className="mt-7 leading-relaxed text-grey-600">
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) operates <span className="font-semibold">{SITE.domain}</span>,
          a free directory of PG, hostel and shared-flat listings across India. This page explains what we collect
          and why.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">What we collect</h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-grey-500">
          <li>
            <span className="font-semibold text-grey-700">Contact-reveal requests.</span> When you tap &quot;Show
            contact number&quot; on a listing, we ask for your name and phone number so the owner can follow up with
            you directly.
          </li>
          <li>
            <span className="font-semibold text-grey-700">Owner submissions.</span> If you list a property via
            &quot;Add your PG&quot;, the details you enter are sent by email to our team to publish and verify the
            listing.
          </li>
          <li>
            <span className="font-semibold text-grey-700">Analytics.</span> We use Google Analytics (GA4) and
            Microsoft Clarity to understand aggregate usage (pages visited, general interactions). These tools may
            set cookies per their own policies.
          </li>
        </ul>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">How it&apos;s used</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          Contact details you submit are used only to connect seekers and owners, or to publish and verify
          listings. We do not sell personal data.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">Your rights</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          To request a copy, correction, or deletion of your data, email{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-primary hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </article>
    </main>
  );
}

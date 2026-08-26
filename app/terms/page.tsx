import type { Metadata } from "next";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the PG Near Me directory.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="w-full flex-1">
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">TERMS OF USE</span>
        <h1 className="font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.1] text-grey-900">Terms of Use</h1>
        <p className="mt-3 text-sm text-grey-500">Last updated: 26 August 2026</p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">What {SITE.name} is</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          {SITE.name} is a free, informational directory of PG, hostel and shared-flat listings across India. We
          are <span className="font-semibold">not</span> a booking or payments platform, we are not affiliated with
          any managed-living brand, and we do not broker or take commission on any transaction. We surface an
          owner&apos;s contact details; you deal with them directly.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">Listing content</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          Listings are submitted directly by property owners and reviewed by our team before publishing. We make a
          reasonable effort to verify accuracy, but prices, availability and amenities can change — always confirm
          directly with the owner before visiting or paying anything.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">Your responsibilities</h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-grey-500">
          <li>• Provide accurate information when submitting a listing or contact request.</li>
          <li>• Zero brokerage, zero listing fee — never pay a third party claiming to represent {SITE.name} for a listing or introduction.</li>
        </ul>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">Liability</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          {SITE.name} is provided &quot;as is&quot;. We are not a party to any agreement between a seeker and a PG
          owner, and are not liable for disputes, losses or damages arising from a listing or a transaction you
          enter into directly with an owner.
        </p>

        <h2 className="mt-9 font-display text-xl font-bold text-grey-900">Governing law</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          These terms are governed by the laws of India. Questions:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-primary hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </article>
    </main>
  );
}

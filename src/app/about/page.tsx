import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PG Near Me — the PG directory for how India actually searches",
  description:
    "Why we built a vertical-specific listing platform for PG, hostel and shared-flat accommodation across India, city by city.",
  openGraph: {
    title: "About PG Near Me",
    description: "The PG directory for how India actually searches.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="w-full flex-1">
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">ABOUT</span>
        <h1 className="font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-[1.08] text-grey-900">
          Built for the four channels that fail every seeker.
        </h1>

        <p className="mt-7 text-[17px] leading-relaxed text-grey-600">
          Finding a PG in an Indian city is fragmented across broker WhatsApp
          groups, Facebook pages, generic classifieds with PG as an
          afterthought, and managed-living brands that only list their own
          inventory.
        </p>
        <p className="mt-4 leading-relaxed text-grey-500">
          None of them enforce structured data at listing time — so filters
          like <em>gender policy</em>, <em>food type</em> and{" "}
          <em>sharing type</em> either don&apos;t exist or are shallow.
          Seekers waste days visiting properties that don&apos;t match.
          Owners either pay brokers 50–100% of a month&apos;s rent, or rely
          on neighborhood word-of-mouth.
        </p>

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">
          Our approach
        </h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          A vertical-specific directory that captures the fields seekers
          actually filter on — and rewards owners who submit complete, fresh
          listings. City by city, expanding only when supply and quality
          warrant it.
        </p>

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">
          What we are not
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-grey-500">
          <li>
            • Not a booking or payments platform. We surface the owner&apos;s
            number; you visit and decide.
          </li>
          <li>• Not affiliated with any managed-living brand.</li>
          <li>
            • Not a scraper of anyone else&apos;s listings. Every listing is
            submitted by an owner or ingested from an openly licensed public
            source (OpenStreetMap), then verified by our team.
          </li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">
          Contact
        </h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          <a
            href="mailto:hello@pgnearme.co.in"
            className="font-semibold text-primary hover:underline"
          >
            hello@pgnearme.co.in
          </a>
        </p>
      </article>
    </main>
  );
}

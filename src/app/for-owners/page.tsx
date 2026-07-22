import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For PG owners — list your property free",
  description:
    "Independent PG operators: reach seekers directly without paying broker commission. Free to list. No dashboard to learn.",
  openGraph: {
    title: "For PG owners — PG Near Me",
    description: "Independent PG operators: reach seekers directly, free.",
  },
  alternates: { canonical: "/for-owners" },
};

const POINTS = [
  "No commission on any lead — you keep 100%.",
  "Free to list — zero listing fee, ever.",
  "No dashboard to learn — one form, submit, done.",
  "We manually verify listings so seekers arrive qualified.",
  "Update price and vacancy with a quick email — our team handles the edits.",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does it cost to list my PG on PG Near Me?",
    a: "Nothing. Listing is free, with zero commission on any lead — PG Near Me is a directory, not a broker, so you keep 100% of what a seeker pays you.",
  },
  {
    q: "How long does listing verification take?",
    a: "Our team reviews and verifies each submission before it goes live — typically within a few days. You can submit via the \"Add your PG\" form.",
  },
  {
    q: "Can I update my price or vacancy later?",
    a: "Yes — email hello@pgnearme.co.in with the changes and our team updates the listing for you. There's no owner dashboard to log into.",
  },
];

export default function ForOwnersPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="w-full flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">FOR OWNERS</span>
        <h1 className="font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-[1.08] text-grey-900">
          Reach seekers directly. Keep every rupee.
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-grey-600">
          PG Near Me is a directory, not a broker. Approved listings appear
          in seeker search — when someone reveals your number, they call
          you, not us. No commission ever.
        </p>

        <div className="mt-9 grid gap-3.5">
          {POINTS.map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 rounded-xl border border-grey-50 bg-white p-4 shadow-card"
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-bg text-success-fg">
                ✓
              </span>
              <p className="text-sm text-grey-700">{point}</p>
            </div>
          ))}
        </div>

        <div className="mt-9">
          <Link
            href="/add-your-pg"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-elevated transition hover:bg-primary-dark"
          >
            Submit your PG →
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-grey-900">FAQs</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="surface-card group p-4.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-grey-800 transition group-open:text-primary">
                  {f.q}
                  <span className="text-grey-300 transition group-open:rotate-45 group-open:text-primary">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-grey-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { OWNER_BENEFITS, OWNER_FORM_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "For PG owners — list your property free",
  description: "Independent PG operators: reach seekers directly without paying broker commission. Free to list. No dashboard to learn.",
  openGraph: { title: "For PG owners — PG Near Me", description: "Independent PG operators: reach seekers directly, free." },
  alternates: { canonical: "/for-owners" },
};

export default function ForOwnersPage() {
  return (
    <main className="flex-1 bg-white">
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="chip mb-6 border-teal/40 bg-teal-tint text-teal-dark">For owners</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Reach seekers directly. Keep every rupee.</h1>
          <p className="mt-6 text-lg text-grey-500">
            PG Near Me is a directory, not a broker. Approved listings appear in seeker search — when someone reveals your number, they call you, not us. No commission ever.
          </p>
          <div className="mt-10 grid gap-4">
            {OWNER_BENEFITS.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-xl border border-grey-50 bg-white p-4 shadow-[var(--shadow-card)]">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-success-bg text-success-fg">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <p className="text-sm">{point}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a href={OWNER_FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-[var(--shadow-elevated)] transition hover:bg-primary-dark">
              List your PG <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

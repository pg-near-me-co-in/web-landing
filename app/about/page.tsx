import type { Metadata } from "next";
import { ABOUT_COPY, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "About PG Near Me — the PG directory for how India actually searches",
  description: "Why we built a vertical-specific listing platform for PG, hostel and shared-flat accommodation across India — starting with Vadodara.",
  openGraph: { title: "About PG Near Me", description: "The PG directory for how India actually searches." },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-white">
      <article className="container-page max-w-3xl py-16 md:py-24">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">About</div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{ABOUT_COPY.title}</h1>

        {ABOUT_COPY.paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "mt-8 text-lg text-grey-500" : "mt-4 text-grey-500"}>
            {p}
          </p>
        ))}

        <h2 className="mt-12 font-display text-2xl font-semibold">Our approach</h2>
        <p className="mt-3 text-grey-500">{ABOUT_COPY.approach}</p>

        <h2 className="mt-12 font-display text-2xl font-semibold">What we are not</h2>
        <ul className="mt-3 space-y-2 text-grey-500">
          {ABOUT_COPY.notList.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-grey-500">
          {SITE.contactEmail} · Vadodara, Gujarat
        </p>
      </article>
    </main>
  );
}

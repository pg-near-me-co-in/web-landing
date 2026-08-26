import type { Metadata } from "next";
import { ABOUT_COPY, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "About PG Near Me — the PG directory for how India actually searches",
  description:
    "Why we built a vertical-specific listing platform for PG, hostel and shared-flat accommodation across India, city by city.",
  openGraph: { title: "About PG Near Me", description: "The PG directory for how India actually searches." },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="w-full flex-1">
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <span className="eyebrow mb-4">ABOUT</span>
        <h1 className="font-display text-[clamp(28px,4.2vw,44px)] font-bold leading-[1.08] text-grey-900">{ABOUT_COPY.title}</h1>

        {ABOUT_COPY.paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "mt-7 text-[17px] leading-relaxed text-grey-600" : "mt-4 leading-relaxed text-grey-500"}>
            {p}
          </p>
        ))}

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">Our approach</h2>
        <p className="mt-3 leading-relaxed text-grey-500">{ABOUT_COPY.approach}</p>

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">What we are not</h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-grey-500">
          {ABOUT_COPY.notList.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-2xl font-bold text-grey-900">Contact</h2>
        <p className="mt-3 leading-relaxed text-grey-500">
          <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-primary hover:underline">
            {SITE.contactEmail}
          </a>
        </p>
      </article>
    </main>
  );
}

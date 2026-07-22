import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PG Near Me — the PG directory for how India actually searches" },
      { name: "description", content: "Why we built a vertical-specific listing platform for PG, hostel and shared-flat accommodation across India — starting with Vadodara." },
      { property: "og:title", content: "About PG Near Me" },
      { property: "og:description", content: "The PG directory for how India actually searches." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <article className="container-page prose prose-slate max-w-3xl py-16 md:py-24">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">About</div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Built for the four channels that fail every seeker.
        </h1>

        <p className="mt-8 text-lg text-muted-foreground">
          Finding a PG in an Indian city is fragmented across broker WhatsApp groups, Facebook pages, generic
          classifieds with PG as an afterthought, and managed-living brands that only list their own inventory.
        </p>

        <p className="mt-4 text-muted-foreground">
          None of them enforce structured data at listing time — so filters like <em>gender policy</em>,
          <em> food type</em> and <em>sharing type</em> either don't exist or are shallow. Seekers waste 3–7 days
          visiting properties that don't match. Owners either pay brokers 50–100% of a month's rent, or rely on
          neighborhood word-of-mouth.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold">Our approach</h2>
        <p className="mt-3 text-muted-foreground">
          A vertical-specific directory that captures the fields seekers actually filter on — and rewards owners who
          submit complete, fresh listings. City by city, starting with Vadodara, then expanding only when supply and
          quality warrant it.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold">What we are not</h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li>• Not a booking or payments platform. We surface the owner's number; you visit and decide.</li>
          <li>• Not affiliated with any managed-living brand.</li>
          <li>• Not a scraper of anyone else's listings. Every listing is submitted or verified by us.</li>
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-muted-foreground">
          hello@pgnearme.co.in · Vadodara, Gujarat
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}

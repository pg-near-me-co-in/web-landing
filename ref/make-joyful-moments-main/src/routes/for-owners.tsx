import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/for-owners")({
  head: () => ({
    meta: [
      { title: "For PG owners — list your property free | PG Near Me" },
      { name: "description", content: "Independent PG operators: reach seekers directly without paying broker commission. Free to list. No dashboard to learn." },
      { property: "og:title", content: "For PG owners — PG Near Me" },
      { property: "og:description", content: "Independent PG operators: reach seekers directly, free." },
      { property: "og:url", content: "/for-owners" },
    ],
    links: [{ rel: "canonical", href: "/for-owners" }],
  }),
  component: ForOwners,
});

function ForOwners() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="chip mb-6 border-accent/40 bg-accent-soft text-accent-foreground">For owners</div>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Reach seekers directly. Keep every rupee.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            PG Near Me is a directory, not a broker. Approved listings appear in seeker search — when someone reveals
            your number, they call you, not us. No commission ever.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              "No commission on any lead — you keep 100%.",
              "Free during Phase 1 (early-city launch).",
              "No dashboard to learn — one form, submit, done.",
              "We manually verify listings so seekers arrive qualified.",
              "Update price and vacancy with a quick email — we handle the edits.",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-success-soft text-success">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <p className="text-sm">{point}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              to="/submit"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:bg-primary/90"
            >
              Submit your PG <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

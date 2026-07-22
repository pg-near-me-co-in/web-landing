import Link from "next/link";
import { getAdminStats } from "@/lib/queries";
import { aiGenerateReviewSummaries } from "@/lib/admin-actions";
import { isAiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();
  const aiOn = isAiConfigured();
  const cards = [
    { label: "Pending submissions", value: s.pending_listings, href: "/admin/submissions" },
    { label: "Pending reviews", value: s.pending_reviews, href: "/admin/reviews" },
    { label: "Leads (7 days)", value: s.leads_7d, href: "/admin/leads" },
    { label: "Leads (total)", value: s.total_leads, href: "/admin/leads" },
    { label: "Published listings", value: s.published_listings, href: "/" },
  ];

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-grey-50 bg-white p-4 shadow-sm transition hover:border-primary"
          >
            <p className="text-3xl font-bold text-grey-900">{c.value}</p>
            <p className="mt-1 text-xs font-semibold text-grey-500">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-grey-50 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-grey-500">
          AI tools
        </h2>
        {aiOn ? (
          <form action={aiGenerateReviewSummaries} className="mt-3">
            <button className="rounded-full border border-accent bg-accent/15 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-accent/30">
              ✦ Generate review summaries
            </button>
            <p className="mt-2 text-xs text-grey-500">
              Summarises listings with 3+ approved reviews (10 per run); shows
              on detail pages under an &quot;AI summary&quot; label.
            </p>
          </form>
        ) : (
          <p className="mt-2 text-sm text-grey-500">
            Set <code>ANTHROPIC_API_KEY</code> in the environment to enable AI
            description assist and review summaries.
          </p>
        )}
      </div>
      <p className="mt-6 text-sm text-grey-500">
        Access is gated by the shared code in <code>ADMIN_ACCESS_CODE</code>.
        Role-based Supabase Auth (admin_users) replaces this in a later pass.
      </p>
    </>
  );
}

import Link from "next/link";
import { getAdminStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();
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
      <p className="mt-8 text-sm text-grey-400">
        Access is gated by the shared code in <code>ADMIN_ACCESS_CODE</code>.
        Role-based Supabase Auth (admin_users) replaces this in a later pass.
      </p>
    </>
  );
}

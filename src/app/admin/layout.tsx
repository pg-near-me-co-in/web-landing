import type { Metadata } from "next";
import Link from "next/link";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminSession();
  if (!authed) {
    return (
      <main className="mx-auto w-full max-w-sm flex-1 px-4 py-24">
        <h1 className="font-display text-2xl text-grey-900">Admin access</h1>
        <AdminLogin />
      </main>
    );
  }

  return (
    <div className="flex-1 bg-grey-10">
      <div className="border-b border-grey-50 bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 text-sm font-semibold sm:px-6">
          {[
            ["/admin", "Dashboard"],
            ["/admin/submissions", "Submissions"],
            ["/admin/reviews", "Reviews"],
            ["/admin/leads", "Leads"],
            ["/admin/seo", "SEO"],
            ["/admin/theme", "Theme"],
            ["/admin/staleness", "Staleness"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-1.5 text-grey-600 transition hover:bg-grey-10 hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

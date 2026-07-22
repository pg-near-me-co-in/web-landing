import type { Metadata } from "next";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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
    <div className="flex flex-1 bg-grey-10">
      <AdminSidebar />
      <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

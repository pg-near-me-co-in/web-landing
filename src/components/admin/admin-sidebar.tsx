"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { adminLogout } from "@/lib/admin-actions";

const NAV_GROUPS: { label: string; links: [string, string][] }[] = [
  {
    label: "Overview",
    links: [["/admin", "Dashboard"]],
  },
  {
    label: "Content",
    links: [
      ["/admin/listings", "Listings"],
      ["/admin/cities", "Cities"],
      ["/admin/areas", "Areas"],
      ["/admin/amenities", "Amenities"],
      ["/admin/owners", "Owners"],
    ],
  },
  {
    label: "Moderation",
    links: [
      ["/admin/submissions", "Submissions"],
      ["/admin/reviews", "Reviews"],
      ["/admin/leads", "Leads"],
      ["/admin/staleness", "Staleness"],
    ],
  },
  {
    label: "Site",
    links: [
      ["/admin/seo", "SEO"],
      ["/admin/theme", "Theme"],
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-grey-500">
            {group.label}
          </h3>
          <div className="space-y-0.5">
            {group.links.map(([href, label]) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`block rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-primary-tint text-primary"
                      : "text-grey-600 hover:bg-grey-10 hover:text-grey-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <>
      {/* Desktop: fixed left column */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r border-grey-50 bg-white p-4 lg:block">
        <div className="mb-5 px-2">
          <span className="font-display text-base font-bold text-grey-900">Admin</span>
        </div>
        <NavLinks />
        <form action={adminLogout} className="mt-8 px-2">
          <button className="text-xs font-semibold text-grey-500 hover:text-alert-fg">
            Log out
          </button>
        </form>
      </aside>

      {/* Mobile: top bar + Sheet drawer */}
      <div className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-grey-50 bg-white px-4 py-3 lg:hidden">
        <span className="font-display text-base font-bold text-grey-900">Admin</span>
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="Open admin menu"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-grey-100"
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left font-display">Admin</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <NavLinks />
            </div>
            <form action={adminLogout} className="mt-8">
              <button className="text-xs font-semibold text-grey-500 hover:text-alert-fg">
                Log out
              </button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

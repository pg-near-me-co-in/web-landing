import Link from "next/link";
import { Home } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { SITE } from "@/lib/content";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/pg/vadodara", label: "Find a PG" },
  { href: "/cities", label: "Cities" },
  { href: "/about", label: "About" },
  { href: "/for-owners", label: "For owners" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-50/70 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight" aria-label={`${SITE.name} — home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <Home className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span>{SITE.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-grey-500 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-grey-900">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/add-your-pg" className="inline-flex h-10 items-center rounded-full border border-grey-100 bg-white px-4 text-sm font-semibold text-grey-900 transition hover:border-primary/60 hover:text-primary">
            List your PG
          </Link>
          <Link href="/pg/vadodara" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">
            Find a PG
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

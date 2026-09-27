import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { SITE, OWNER_FORM_URL } from "@/lib/content";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/pg/vadodara", label: "Find a PG" },
  { href: "/cities", label: "Map" },
  { href: "/about", label: "About" },
  { href: "/for-owners", label: "For owners" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-50/70 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight" aria-label={`${SITE.name} — home`}>
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src="/logo.png" alt="" width={36} height={36} className="h-full w-full object-contain" priority />
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
          <a href={OWNER_FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full border border-grey-100 bg-white px-4 text-sm font-semibold text-grey-900 transition hover:border-primary/60 hover:text-primary">
            List your PG
          </a>
          <Link href="/pg/vadodara" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">
            Find a PG
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

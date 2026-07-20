import Link from "next/link";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS: [string, string][] = [
  ["/#search", "Find a PG"],
  ["/#cities", "Cities"],
  ["/add-your-pg", "List your PG"],
];

/** Sticky blurred header (ref .site-header): logo left, nav centre-right,
 *  primary CTA + hamburger. Admin routes are deliberately never linked. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-50 bg-grey-5/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-grey-600 transition hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link
            href="/add-your-pg"
            className="hidden rounded-[10px] border border-grey-100 bg-white px-3.5 py-2 text-[13px] font-semibold text-grey-800 transition hover:border-primary hover:text-primary md:block"
          >
            List property — free
          </Link>
          <Link
            href="/#search"
            className="rounded-[10px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-dark"
          >
            Find a PG
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

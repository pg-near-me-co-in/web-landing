import Link from "next/link";
import { Logo } from "./logo";

/** Sticky header: logo left, section nav centre, "List your PG" CTA right. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-50 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#explore-cities"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-grey-600 transition hover:bg-grey-10 hover:text-primary sm:block"
          >
            Explore cities
          </Link>
          <Link
            href="/#how-it-works"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-grey-600 transition hover:bg-grey-10 hover:text-primary md:block"
          >
            How it works
          </Link>
          <Link
            href="/#faq"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-grey-600 transition hover:bg-grey-10 hover:text-primary md:block"
          >
            FAQs
          </Link>
          <Link
            href="/add-your-pg"
            className="ml-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm shadow-primary/25 transition hover:bg-purple sm:ml-2"
          >
            List your PG <span className="hidden sm:inline">— free</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Logo } from "./logo";

/** Sticky header per the notebook wireframe: logo left, "Add your PG" CTA right. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-grey-50 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/#explore-cities"
            className="hidden text-sm font-semibold text-grey-600 transition hover:text-primary sm:block"
          >
            Explore cities
          </Link>
          <Link
            href="/add-your-pg"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple"
          >
            Add your PG
          </Link>
        </nav>
      </div>
    </header>
  );
}

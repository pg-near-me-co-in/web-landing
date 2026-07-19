import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-grey-900 text-grey-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-3">
          <Logo inverted />
          <p className="text-sm leading-relaxed text-grey-400">
            India&apos;s free directory for PGs, hostels and shared flats.
            Find a place near you — no brokers, no fees.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link href="/#explore-cities" className="transition hover:text-white">
            Explore cities
          </Link>
          <Link href="/add-your-pg" className="transition hover:text-white">
            Add your PG
          </Link>
          <Link href="/#our-story" className="transition hover:text-white">
            Our story
          </Link>
          <a href="mailto:hello@pgnearme.co.in" className="transition hover:text-white">
            Contact
          </a>
        </nav>
      </div>
      <div className="space-y-1 border-t border-grey-800 py-4 text-center text-xs text-grey-500">
        <p>© {new Date().getFullYear()} PG Near Me · pgnearme.co.in</p>
        <p>
          Some listing locations ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-grey-300"
          >
            OpenStreetMap contributors
          </a>{" "}
          (ODbL)
        </p>
      </div>
    </footer>
  );
}

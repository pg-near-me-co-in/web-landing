import Link from "next/link";
import { getLaunchedCities } from "@/lib/queries";
import { Logo } from "./logo";

/**
 * Four-column footer: brand + contact, seeker links, owner links, and
 * per-city SEO links (the reference directories all cross-link every live
 * city from the footer).
 */
export async function Footer() {
  let cities: { name: string; slug: string }[] = [];
  try {
    cities = await getLaunchedCities();
  } catch {
    // footer must never take a page down with it (e.g. offline/PWA shell)
  }

  return (
    <footer className="mt-auto bg-grey-900 text-grey-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs space-y-3">
          <Logo inverted />
          <p className="text-sm leading-relaxed text-grey-400">
            India&apos;s free directory for PGs, hostels and shared flats. Find
            a place near you — no brokers, no fees.
          </p>
          <a
            href="mailto:hello@pgnearme.co.in"
            className="inline-block text-sm font-semibold text-grey-300 underline-offset-2 transition hover:text-white hover:underline"
          >
            hello@pgnearme.co.in
          </a>
        </div>

        <nav aria-label="For seekers" className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-grey-500">
            For seekers
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/#explore-cities" className="transition hover:text-white">
                Explore cities
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="transition hover:text-white">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="transition hover:text-white">
                FAQs
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="For owners" className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-grey-500">
            For owners
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/add-your-pg" className="transition hover:text-white">
                List your PG free
              </Link>
            </li>
            <li>
              <Link href="/#our-story" className="transition hover:text-white">
                Why it&apos;s free
              </Link>
            </li>
            <li>
              <a href="mailto:hello@pgnearme.co.in" className="transition hover:text-white">
                Contact us
              </a>
            </li>
          </ul>
        </nav>

        {cities.length > 0 && (
          <nav aria-label="PGs by city" className="text-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-grey-500">
              PGs by city
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/pg/${c.slug}`} className="transition hover:text-white">
                    PGs in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
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

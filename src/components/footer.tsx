import Link from "next/link";
import { getLaunchedCities } from "@/lib/queries";
import { Logo } from "./logo";

/**
 * Ref .site-footer: dark grey-900 band, brand blurb + Explore / Owners /
 * per-city SEO columns, thin bottom strip. No admin/dashboard links —
 * those stay URL-only.
 */
export async function Footer() {
  let cities: { name: string; slug: string }[] = [];
  try {
    cities = await getLaunchedCities();
  } catch {
    // footer must never take a page down with it (e.g. offline/PWA shell)
  }

  return (
    <footer className="mt-auto bg-grey-900 pb-6 pt-12 text-grey-5/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="mb-3">
              <Logo inverted />
            </div>
            <p className="max-w-[280px] text-[13.5px] leading-relaxed text-grey-5/55">
              Pan-India platform to find verified PGs, hostels and shared rooms
              — no brokerage, ever.
            </p>
            <a
              href="mailto:hello@pgnearme.co.in"
              className="mt-3 inline-block text-[13.5px] font-semibold text-grey-5/60 transition hover:text-white"
            >
              hello@pgnearme.co.in
            </a>
          </div>

          <nav aria-label="Explore">
            <h4 className="mb-3.5 font-display text-[13px] font-bold text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-[13.5px]">
              <li>
                <Link href="/#search" className="text-grey-5/60 transition hover:text-white">
                  Find a PG
                </Link>
              </li>
              <li>
                <Link href="/#cities" className="text-grey-5/60 transition hover:text-white">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/#types" className="text-grey-5/60 transition hover:text-white">
                  Property types
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-grey-5/60 transition hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="For owners">
            <h4 className="mb-3.5 font-display text-[13px] font-bold text-white">
              Owners
            </h4>
            <ul className="space-y-2 text-[13.5px]">
              <li>
                <Link href="/add-your-pg" className="text-grey-5/60 transition hover:text-white">
                  List your property
                </Link>
              </li>
              <li>
                <Link href="/#how" className="text-grey-5/60 transition hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@pgnearme.co.in"
                  className="text-grey-5/60 transition hover:text-white"
                >
                  Contact us
                </a>
              </li>
            </ul>
          </nav>

          {cities.length > 0 && (
            <nav aria-label="PGs by city">
              <h4 className="mb-3.5 font-display text-[13px] font-bold text-white">
                PGs by city
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13.5px]">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/pg/${c.slug}`}
                      className="text-grey-5/60 transition hover:text-white"
                    >
                      PGs in {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="mt-9 flex flex-wrap justify-between gap-2.5 border-t border-white/10 pt-5 text-xs text-grey-5/40">
          <span>© {new Date().getFullYear()} PG Near Me. All rights reserved.</span>
          <span>
            Some listing locations ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition hover:text-grey-5/70"
            >
              OpenStreetMap contributors
            </a>{" "}
            (ODbL)
          </span>
          <span>Made for people on the move, across India.</span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Home, Instagram, Linkedin } from "lucide-react";
import { getAllCities, getLaunchedCities } from "@/lib/data/cities";
import { SITE, OWNER_FORM_URL } from "@/lib/content";

export function Footer() {
  const launched = getLaunchedCities();
  const comingSoon = getAllCities().filter((c) => !c.is_launched).slice(0, 2);

  return (
    <footer className="border-t border-grey-50 bg-grey-5">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            {SITE.name}
          </div>
          <p className="mt-3 text-sm text-grey-500">
            Verified PGs, hostels and shared rooms across India. Zero brokerage. Direct owner contact.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-grey-500">Cities</div>
          <ul className="mt-3 space-y-2 text-sm">
            {launched.map((c) => (
              <li key={c.slug}>
                <Link href={`/pg/${c.slug}`} className="hover:text-primary">
                  PG in {c.name}
                </Link>
              </li>
            ))}
            {comingSoon.map((c) => (
              <li key={c.slug} className="text-grey-500">{c.name} — coming soon</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-grey-500">Product</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/for-owners" className="hover:text-primary">For owners</Link>
            </li>
            <li>
              <a href={OWNER_FORM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary">List your PG</a>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">Our story</Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-grey-500">Contact</div>
          <p className="mt-3 text-sm text-grey-500">
            {SITE.contactEmail}
            <br />
            Vadodara, Gujarat — India
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a href="#" aria-label={`${SITE.name} on Instagram`} className="grid h-9 w-9 place-items-center rounded-full border border-grey-100 text-grey-500 transition hover:border-primary/50 hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label={`${SITE.name} on LinkedIn`} className="grid h-9 w-9 place-items-center rounded-full border border-grey-100 text-grey-500 transition hover:border-primary/50 hover:text-primary">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-grey-50">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-grey-500 md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} {SITE.name} — independent PG directory for India. Some location data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-grey-700">
              OpenStreetMap
            </a>{" "}
            contributors, ODbL.
          </span>
          <span className="flex gap-3">
            <Link href="/privacy-policy" className="hover:text-grey-700">Privacy</Link>
            <Link href="/terms" className="hover:text-grey-700">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { Home, Menu } from "lucide-react";
import { useState } from "react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Home className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span>PG Near Me</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/listings" search={{ city: "vadodara" }} className="transition-colors hover:text-foreground">Find a PG</Link>
          <Link to="/cities" className="transition-colors hover:text-foreground">Cities</Link>
          <Link to="/for-owners" className="transition-colors hover:text-foreground">List your PG</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/submit"
            className="inline-flex h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
          >
            List property — free
          </Link>
          <Link
            to="/listings"
            search={{ city: "vadodara" }}
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Find a PG
          </Link>
        </div>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <div className="container-page flex flex-col gap-1 py-3 text-sm font-medium">
            <Link to="/listings" search={{ city: "vadodara" }} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-muted">Find a PG</Link>
            <Link to="/cities" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-muted">Cities</Link>
            <Link to="/for-owners" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-muted">List your PG</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 hover:bg-muted">About</Link>
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              List property — free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            PG Near Me
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Verified PGs, hostels and shared rooms across India. Zero brokerage. Direct owner contact.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cities</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/listings" search={{ city: "vadodara" }} className="hover:text-primary">PG in Vadodara</Link></li>
            <li className="text-muted-foreground">Bengaluru — coming soon</li>
            <li className="text-muted-foreground">Pune — coming soon</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/for-owners" className="hover:text-primary">For owners</Link></li>
            <li><Link to="/submit" className="hover:text-primary">List your PG — free</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our story</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</div>
          <p className="mt-3 text-sm text-muted-foreground">
            hello@pgnearme.co.in<br />
            Vadodara, Gujarat — India
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} PG Near Me — independent PG directory for India.</span>
          <span>Made with care for movers, students &amp; first-jobbers.</span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface CityOption {
  name: string;
  slug: string;
  state: string;
  is_launched: boolean;
}

/**
 * Hero search: type a city, pick from suggestions, land on /pg/[city].
 * The notebook's icon filter shortcuts (M/V/A/B/H/D — open question #1) are
 * represented as PG-type quick chips until their meaning is confirmed.
 */
export function SearchBar({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return cities.filter((c) => c.is_launched).slice(0, 6);
    return cities
      .filter(
        (c) =>
          c.name.toLowerCase().includes(t) || c.state.toLowerCase().includes(t)
      )
      .slice(0, 8);
  }, [q, cities]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/pg/${slug}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) go(matches[0].slug);
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-grey-50 bg-white p-2 pl-5 shadow-lg shadow-primary/10"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-grey-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search your city — Bengaluru, Pune, Hyderabad…"
          className="w-full bg-transparent text-[15px] text-grey-800 outline-none placeholder:text-grey-300"
          aria-label="Search city"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple"
        >
          Search
        </button>
      </form>

      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-grey-50 bg-white py-1 text-left shadow-xl">
          {matches.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onMouseDown={() => go(c.slug)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-grey-5"
              >
                <span className="font-semibold text-grey-800">{c.name}</span>
                <span className="text-xs text-grey-400">
                  {c.state}
                  {!c.is_launched && " · coming soon"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

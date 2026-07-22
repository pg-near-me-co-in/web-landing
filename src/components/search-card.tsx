"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PgType } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CityOption {
  name: string;
  slug: string;
  state: string;
  is_launched: boolean;
}

const TYPE_TOGGLES: { value: PgType | ""; label: string }[] = [
  { value: "", label: "Anyone" },
  { value: "female", label: "Girls" },
  { value: "male", label: "Boys" },
  { value: "unisex", label: "Co-living" },
];

const BUDGETS: { value: string; label: string }[] = [
  { value: "", label: "Any budget" },
  { value: "8000", label: "Under ₹8,000" },
  { value: "15000", label: "Under ₹15,000" },
  { value: "20000", label: "Under ₹20,000" },
];

/** Ref .search-card — the hero's lifted white card: PG-type toggles, city
 *  input with suggestions, budget select, quick city chips. Lands on
 *  /pg/[city] with the equivalent filter query. */
export function SearchCard({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const [type, setType] = useState<PgType | "">("");
  const [budget, setBudget] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const launched = useMemo(() => cities.filter((c) => c.is_launched), [cities]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return launched.slice(0, 6);
    return cities
      .filter(
        (c) =>
          c.name.toLowerCase().includes(t) || c.state.toLowerCase().includes(t)
      )
      .slice(0, 8);
  }, [q, cities, launched]);

  function go(slug: string) {
    setOpen(false);
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (budget) qs.set("price", budget);
    const s = qs.toString();
    router.push(`/pg/${slug}${s ? `?${s}` : ""}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) go(matches[0].slug);
  }

  const fieldCls =
    "w-full rounded-md border border-grey-100 bg-grey-5 px-3.5 py-3 text-[14.5px] text-grey-900 outline-none transition focus:border-primary focus:bg-white";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-grey-50 bg-white p-6 shadow-[0_30px_60px_-24px_rgba(83,74,183,0.28)]"
    >
      <span className="mb-3.5 block font-mono text-[11px] font-semibold tracking-wider text-primary">
        FIND A PLACE →
      </span>

      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(v) => setType((v as PgType | "") ?? "")}
        className="mb-4 flex-wrap gap-2"
        aria-label="PG type"
      >
        {TYPE_TOGGLES.map((t) => (
          <ToggleGroupItem
            key={t.label}
            value={t.value}
            className="min-w-[72px] flex-1 rounded-md border border-grey-50 bg-grey-10 px-1.5 py-2.5 text-[13px] font-semibold text-grey-500 hover:text-grey-700 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-white"
          >
            {t.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="relative mb-3.5">
        <label
          htmlFor="hero-city"
          className="mb-1.5 block text-[12.5px] font-semibold text-grey-600"
        >
          City
        </label>
        <input
          id="hero-city"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="e.g. Bengaluru, Pune, Vadodara…"
          className={fieldCls}
          autoComplete="off"
        />
        {open && matches.length > 0 && (
          <ul className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-grey-50 bg-white py-1 text-left shadow-xl">
            {matches.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onMouseDown={() => go(c.slug)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-grey-5"
                >
                  <span className="font-semibold text-grey-800">{c.name}</span>
                  <span className="text-xs text-grey-500">
                    {c.state}
                    {!c.is_launched && " · coming soon"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="hero-budget"
          className="mb-1.5 block text-[12.5px] font-semibold text-grey-600"
        >
          Budget (per month)
        </label>
        <select
          id="hero-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className={fieldCls}
        >
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        Search listings
      </button>

      {launched.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {launched.slice(0, 5).map((c) => (
            <button
              key={c.slug}
              type="button"
              onMouseDown={() => go(c.slug)}
              className="rounded-full border border-grey-50 bg-grey-10 px-3 py-1.5 text-xs text-grey-600 transition hover:border-accent hover:bg-primary-tint hover:text-primary"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

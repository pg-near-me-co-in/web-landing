"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { CITIES } from "@/lib/data/cities";
import { SHARING_TYPES } from "@/lib/format";
import { trackEvent } from "@/lib/gtag";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export interface CitySearch {
  city: string;
  gender?: string;
  food?: string;
  sharing?: string;
  rules?: string;
  amenities?: string;
  verified?: string;
  maxPrice?: string;
  q?: string;
}

const AMENITY_FILTERS = ["WiFi", "AC", "Laundry", "Housekeeping", "Parking"] as const;

function activeFilterCount(search: CitySearch): number {
  return [search.gender, search.food, search.sharing, search.rules, search.maxPrice, search.q, search.verified === "true" ? "1" : undefined, search.amenities].filter(
    Boolean
  ).length;
}

export function CityFilters({ search }: { search: CitySearch }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = activeFilterCount(search);

  return (
    <>
      {/* Desktop: always-visible sticky sidebar */}
      <aside className="hidden h-max rounded-2xl border border-grey-50 bg-white p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:block">
        <div className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <FilterFields search={search} router={router} />
      </aside>

      {/* Mobile: compact trigger that opens the same filters in a sheet, instead
          of the full block eating the first screen above the listings. */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl border border-grey-100 bg-white px-4 py-3 text-sm font-semibold shadow-[var(--shadow-card)]">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">{activeCount}</span>
                )}
              </span>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-[88%] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterFields search={search} router={router} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function FilterFields({ search, router }: { search: CitySearch; router: ReturnType<typeof useRouter> }) {
  const [showMore, setShowMore] = useState(false);

  const update = (patch: Partial<CitySearch>) => {
    const next = { ...search, ...patch };
    const qs = new URLSearchParams();
    if (next.gender) qs.set("gender", next.gender);
    if (next.food) qs.set("food", next.food);
    if (next.sharing) qs.set("sharing", next.sharing);
    if (next.rules) qs.set("rules", next.rules);
    if (next.amenities) qs.set("amenities", next.amenities);
    if (next.verified) qs.set("verified", next.verified);
    if (next.maxPrice) qs.set("maxPrice", next.maxPrice);
    if (next.q) qs.set("q", next.q);
    trackEvent("filter_used", { city: next.city });
    const s = qs.toString();
    router.push(`/pg/${next.city}${s ? `?${s}` : ""}`);
  };

  const amenityList = search.amenities ? search.amenities.split(",").filter(Boolean) : [];
  const toggleAmenity = (a: string) => {
    const next = amenityList.includes(a) ? amenityList.filter((x) => x !== a) : [...amenityList, a];
    update({ amenities: next.length > 0 ? next.join(",") : undefined });
  };
  const moreActive = amenityList.length > 0 || search.verified === "true";

  return (
    <div>
      <FilterGroup label="City">
        <select value={search.city} onChange={(e) => router.push(`/pg/${e.target.value}`)} aria-label="Filter listings by city" className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm">
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Search">
        <input
          type="text"
          defaultValue={search.q ?? ""}
          placeholder="Locality, area, name…"
          onChange={(e) => update({ q: e.target.value || undefined })}
          className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </FilterGroup>

      <FilterGroup label="Gender">
        <div className="grid grid-cols-2 gap-2">
          {(["any", "male", "female", "unisex"] as const).map((g) => (
            <button
              key={g}
              onClick={() => update({ gender: g === "any" ? undefined : g })}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                (search.gender ?? "any") === g ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"
              }`}
            >
              {g === "any" ? "Any" : g === "unisex" ? "Unisex" : g[0].toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Budget">
        <select
          value={search.maxPrice ?? ""}
          onChange={(e) => update({ maxPrice: e.target.value || undefined })}
          aria-label="Budget"
          className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Any budget</option>
          <option value="5000">Under ₹5,000</option>
          <option value="7500">Under ₹7,500</option>
          <option value="10000">Under ₹10,000</option>
          <option value="15000">Under ₹15,000</option>
        </select>
      </FilterGroup>

      <FilterGroup label="Food preferences">
        <select
          value={search.food ?? "any"}
          onChange={(e) => update({ food: e.target.value === "any" ? undefined : e.target.value })}
          aria-label="Food preferences"
          className="w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="any">Any</option>
          <option value="veg_only">Veg only</option>
          <option value="jain_only">Jain</option>
          <option value="non_veg_allowed">Non-veg allowed</option>
          <option value="no_food">No food provided</option>
        </select>
      </FilterGroup>

      <FilterGroup label="Sharing">
        <div className="flex flex-wrap gap-2">
          {SHARING_TYPES.map((s) => {
            const active = search.sharing === s;
            return (
              <button
                key={s}
                onClick={() => update({ sharing: active ? undefined : s })}
                className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="House rules">
        <div className="grid grid-cols-2 gap-2">
          {(["strict", "liberal"] as const).map((r) => {
            const active = search.rules === r;
            return (
              <button
                key={r}
                onClick={() => update({ rules: active ? undefined : r })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${active ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"}`}
              >
                {r === "strict" ? "Strict" : "Liberal"}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        aria-expanded={showMore}
        className={`mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition ${
          moreActive ? "border-primary/60 bg-primary-tint text-primary" : "border-grey-100 bg-white text-grey-900 hover:bg-grey-10"
        }`}
      >
        <span>More filters{moreActive ? " · active" : ""}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
      </button>

      {showMore && (
        <div className="rounded-xl border border-grey-50 bg-grey-10/60 p-3">
          <FilterGroup label="Amenities">
            <div className="flex flex-wrap gap-2">
              {AMENITY_FILTERS.map((a) => {
                const active = amenityList.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1 text-xs transition ${active ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"}`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <div className="mb-1">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">Trust</div>
            <button
              type="button"
              role="switch"
              aria-checked={search.verified === "true"}
              onClick={() => update({ verified: search.verified === "true" ? undefined : "true" })}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition ${
                search.verified === "true" ? "border-primary bg-primary text-white" : "border-grey-100 bg-white hover:bg-grey-10"
              }`}
            >
              Verified only
              <span className={`relative h-4 w-7 rounded-full transition ${search.verified === "true" ? "bg-white/30" : "bg-grey-100"}`}>
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${search.verified === "true" ? "left-3.5" : "left-0.5"}`} />
              </span>
            </button>
          </div>
        </div>
      )}

      <button onClick={() => router.push(`/pg/${search.city}`)} className="mt-3 w-full rounded-lg border border-grey-100 bg-white px-3 py-2 text-xs font-medium text-grey-500 hover:bg-grey-10">
        Reset filters
      </button>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-grey-500">{label}</div>
      {children}
    </div>
  );
}

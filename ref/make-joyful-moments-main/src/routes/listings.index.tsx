import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ListingCard } from "@/components/listing-card";
import { listingsQuery, type ListingFilters } from "@/lib/queries";
import { SHARING_TYPES } from "@/lib/format";
import { SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  city: z.string().optional().default("vadodara"),
  gender: z.enum(["male", "female", "unisex", "any"]).optional(),
  food: z.enum(["veg_only", "non_veg_allowed", "no_food", "any"]).optional(),
  sharing: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/listings/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(listingsQuery(deps as ListingFilters)),
  head: ({ params }) => {
    void params;
    return {
      meta: [
        { title: "Browse PGs in Vadodara — filter by gender, budget, food | PG Near Me" },
        {
          name: "description",
          content:
            "Search Vadodara PGs, hostels and shared flats. Filter by gender policy, monthly budget, food type and sharing type. Contact owners directly.",
        },
        { property: "og:title", content: "Browse PGs in Vadodara" },
        { property: "og:url", content: "/listings" },
      ],
      links: [{ rel: "canonical", href: "/listings" }],
    };
  },
  component: ListingsPage,
});

function ListingsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: listings } = useSuspenseQuery(listingsQuery(search as ListingFilters));

  const update = (patch: Partial<typeof search>) => {
    navigate({
      search: (prev: typeof search) => ({ ...prev, ...patch }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="border-b border-border/70 bg-surface-muted">
        <div className="container-page py-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Vadodara</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            PGs, hostels & shared flats
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {listings.length} verified {listings.length === 1 ? "listing" : "listings"} — filter below to match your
            non-negotiables.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="h-max rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <div className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </div>

          <FilterGroup label="Search">
            <input
              type="text"
              defaultValue={search.q ?? ""}
              placeholder="Locality, area, name…"
              onChange={(e) => update({ q: e.target.value || undefined })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </FilterGroup>

          <FilterGroup label="Gender policy">
            <div className="grid grid-cols-2 gap-2">
              {(["any", "male", "female", "unisex"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => update({ gender: g === "any" ? undefined : g })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    (search.gender ?? "any") === g
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-surface-muted"
                  }`}
                >
                  {g === "any" ? "Any" : g === "unisex" ? "Unisex" : g[0].toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Max monthly budget">
            <select
              value={search.maxPrice ?? ""}
              onChange={(e) =>
                update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Any budget</option>
              <option value="5000">Under ₹5,000</option>
              <option value="7500">Under ₹7,500</option>
              <option value="10000">Under ₹10,000</option>
              <option value="15000">Under ₹15,000</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Food">
            <select
              value={search.food ?? "any"}
              onChange={(e) => update({ food: e.target.value === "any" ? undefined : (e.target.value as never) })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="any">Any</option>
              <option value="veg_only">Veg only</option>
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
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-surface-muted"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <button
            onClick={() =>
              navigate({ search: { city: "vadodara" } })
            }
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-muted"
          >
            Reset filters
          </button>
        </aside>

        {/* Results */}
        <div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="font-display text-lg font-semibold">No matches</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your budget or removing a filter. Or{" "}
                <Link to="/submit" className="text-primary underline">
                  submit a listing
                </Link>{" "}
                to help another seeker find it.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

import Link from "next/link";
import { getAdminListings, getAllCities } from "@/lib/queries";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { PG_TYPE_LABEL, formatPriceRange } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-success-bg text-success-fg",
  pending_review: "bg-warn-bg text-warn-fg",
  draft: "bg-grey-50 text-grey-500",
  rejected: "bg-alert-bg text-alert-fg",
  archived: "bg-grey-50 text-grey-500",
};

interface Props {
  searchParams: Promise<{ q?: string; status?: string; city?: string; type?: string; page?: string }>;
}

export default async function AdminListingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ rows, total }, cities] = await Promise.all([
    getAdminListings({
      q: sp.q,
      status: sp.status,
      cityId: sp.city,
      pgType: sp.type as PgType | undefined,
      page,
    }),
    getAllCities(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-grey-900">Listings ({total})</h1>
        <Link
          href="/admin/listings/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
        >
          + New listing
        </Link>
      </div>

      <form method="get" className="mt-5 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name…"
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Any status</option>
          {["draft", "pending_review", "published", "rejected", "archived"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="city"
          defaultValue={sp.city ?? ""}
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Any city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={sp.type ?? ""}
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Any type</option>
          {(["male", "female", "unisex"] as const).map((t) => (
            <option key={t} value={t}>
              {PG_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <button className="rounded-md border border-grey-100 bg-white px-4 py-2 text-sm font-semibold text-grey-700 hover:border-primary hover:text-primary">
          Filter
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-grey-50 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey-50 text-left text-xs font-semibold uppercase tracking-wide text-grey-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/listings/${l.id}`}
                    className="font-semibold text-grey-900 hover:text-primary"
                  >
                    {l.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-grey-600">
                  {l.city_name}
                  {l.area_name ? ` · ${l.area_name}` : ""}
                </td>
                <td className="px-4 py-3 text-grey-600">{l.pg_type ? PG_TYPE_LABEL[l.pg_type] : "—"}</td>
                <td className="px-4 py-3 font-mono text-[12.5px] text-grey-600">
                  {formatPriceRange(l.price_min, l.price_max) || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[l.status] ?? "bg-grey-50 text-grey-500"}`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-grey-600">{l.trust_score ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-grey-500">
                  No listings match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} total={total} basePath="/admin/listings" searchParams={sp} />
    </div>
  );
}

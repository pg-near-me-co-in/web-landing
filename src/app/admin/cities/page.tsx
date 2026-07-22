import Link from "next/link";
import { getAdminCities } from "@/lib/queries";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { setCityLaunched } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminCitiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await getAdminCities({ q: sp.q, page });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-grey-900">Cities ({total})</h1>
        <Link
          href="/admin/cities/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
        >
          + New city
        </Link>
      </div>

      <form method="get" className="mt-5 flex gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name…"
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="rounded-md border border-grey-100 bg-white px-4 py-2 text-sm font-semibold text-grey-700 hover:border-primary hover:text-primary">
          Search
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-grey-50 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey-50 text-left text-xs font-semibold uppercase tracking-wide text-grey-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quick action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/cities/${c.id}`}
                    className="font-semibold text-grey-900 hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-grey-600">{c.state}</td>
                <td className="px-4 py-3 text-grey-600">{c.listing_count_cache}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      c.is_launched ? "bg-success-bg text-success-fg" : "bg-grey-50 text-grey-500"
                    }`}
                  >
                    {c.is_launched ? "Live" : "Not launched"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ConfirmDialog
                    trigger={
                      <button className="text-xs font-semibold text-primary hover:underline">
                        {c.is_launched ? "Unlaunch" : "Launch"}
                      </button>
                    }
                    title={c.is_launched ? `Unlaunch ${c.name}?` : `Launch ${c.name}?`}
                    description={
                      c.is_launched
                        ? "Hides this city from public search and the homepage until re-launched."
                        : "Makes this city visible in public search and the homepage."
                    }
                    confirmLabel={c.is_launched ? "Unlaunch" : "Launch"}
                    formAction={setCityLaunched}
                    hiddenFields={{ id: c.id, launched: c.is_launched ? "0" : "1" }}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-grey-500">
                  No cities match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} total={total} basePath="/admin/cities" searchParams={sp} />
    </div>
  );
}

import Link from "next/link";
import { getAdminAreas, getAllCities } from "@/lib/queries";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { setAreaActive } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; city?: string; page?: string }>;
}

export default async function AdminAreasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ rows, total }, cities] = await Promise.all([
    getAdminAreas({ q: sp.q, cityId: sp.city, page }),
    getAllCities(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-grey-900">Areas ({total})</h1>
        <Link
          href="/admin/areas/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
        >
          + New area
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quick action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/areas/${a.id}`}
                    className="font-semibold text-grey-900 hover:text-primary"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-grey-600">{a.city_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      a.is_active ? "bg-success-bg text-success-fg" : "bg-grey-50 text-grey-500"
                    }`}
                  >
                    {a.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ConfirmDialog
                    trigger={
                      <button className="text-xs font-semibold text-primary hover:underline">
                        {a.is_active ? "Deactivate" : "Activate"}
                      </button>
                    }
                    title={a.is_active ? `Deactivate ${a.name}?` : `Activate ${a.name}?`}
                    description={
                      a.is_active
                        ? "Hides this area from public filters. Listings keep their address, just stop appearing under this area name."
                        : "Makes this area selectable in public filters again."
                    }
                    confirmLabel={a.is_active ? "Deactivate" : "Activate"}
                    formAction={setAreaActive}
                    hiddenFields={{ id: a.id, active: a.is_active ? "0" : "1" }}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-grey-500">
                  No areas match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} total={total} basePath="/admin/areas" searchParams={sp} />
    </div>
  );
}

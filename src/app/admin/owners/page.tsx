import Link from "next/link";
import { getAdminOwners } from "@/lib/queries";
import { AdminPagination } from "@/components/admin/admin-pagination";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success-bg text-success-fg",
  pending: "bg-warn-bg text-warn-fg",
  blocked: "bg-alert-bg text-alert-fg",
};

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminOwnersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await getAdminOwners({ q: sp.q, status: sp.status, page });

  return (
    <div>
      <h1 className="font-display text-2xl text-grey-900">Owners ({total})</h1>
      <p className="mt-1 text-sm text-grey-500">
        Owner records are created implicitly via listing submission — there&apos;s no
        standalone &quot;new owner&quot; form.
      </p>

      <form method="get" className="mt-5 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search name or phone…"
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="rounded-md border border-grey-100 bg-white px-3 py-2 text-sm"
        >
          <option value="">Any status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
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
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/owners/${o.id}`}
                    className="font-semibold text-grey-900 hover:text-primary"
                  >
                    {o.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-[12.5px] text-grey-600">{o.phone}</td>
                <td className="px-4 py-3 text-grey-600">{o.listing_count}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[o.status] ?? "bg-grey-50 text-grey-500"}`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-grey-500">
                  No owners match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} total={total} basePath="/admin/owners" searchParams={sp} />
    </div>
  );
}

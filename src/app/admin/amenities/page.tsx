import Link from "next/link";
import { getAdminAmenities } from "@/lib/queries";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteAmenity } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminAmenitiesPage() {
  const amenities = await getAdminAmenities();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-grey-900">Amenities ({amenities.length})</h1>
        <Link
          href="/admin/amenities/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
        >
          + New amenity
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-grey-50 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grey-50 text-left text-xs font-semibold uppercase tracking-wide text-grey-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Used by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quick action</th>
            </tr>
          </thead>
          <tbody>
            {amenities.map((a) => (
              <tr key={a.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/amenities/${a.id}`}
                    className="font-semibold text-grey-900 hover:text-primary"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-grey-600">{a.category ?? "—"}</td>
                <td className="px-4 py-3 text-grey-600">{a.listing_count} listings</td>
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
                      <button className="text-xs font-semibold text-alert-fg hover:underline">
                        {a.listing_count > 0 ? "Deactivate" : "Delete"}
                      </button>
                    }
                    title={
                      a.listing_count > 0
                        ? `Deactivate ${a.name}?`
                        : `Permanently delete ${a.name}?`
                    }
                    description={
                      a.listing_count > 0
                        ? `Used by ${a.listing_count} listing(s), so this hides it from public filters rather than deleting it.`
                        : "Not used by any listing — this removes it entirely. This cannot be undone."
                    }
                    confirmLabel={a.listing_count > 0 ? "Deactivate" : "Delete"}
                    formAction={deleteAmenity}
                    hiddenFields={{ id: a.id }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

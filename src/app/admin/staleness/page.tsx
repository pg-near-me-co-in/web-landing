import Link from "next/link";
import { getStaleListings } from "@/lib/queries";
import { markVerified } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function StalenessPage() {
  const rows = await getStaleListings();

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">
        Stale listings ({rows.length}
        {rows.length === 100 ? "+" : ""})
      </h1>
      <p className="mt-1 text-sm text-grey-500">
        Published listings never verified, or verified more than 180 days ago.
        Verifying raises the listing&apos;s trust score.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-grey-50 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-grey-50 text-xs uppercase tracking-wide text-grey-400">
            <tr>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Last verified</th>
              <th className="px-4 py-3">Trust</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-grey-50 last:border-0">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/pg/${r.city_slug}/${r.area_slug ?? "all"}/${r.slug}`}
                    className="font-semibold text-grey-800 hover:text-primary"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-grey-500">{r.city_name}</td>
                <td className="px-4 py-2.5 text-grey-500">{r.source}</td>
                <td className="px-4 py-2.5 text-grey-500">
                  {r.verified_at
                    ? new Date(r.verified_at).toLocaleDateString("en-IN")
                    : "never"}
                </td>
                <td className="px-4 py-2.5 text-grey-500">
                  {r.trust_score ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <form action={markVerified}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-full bg-success-fg px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90">
                      Mark verified
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-grey-400">
                  Nothing stale. 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOwnerById } from "@/lib/queries";
import { OwnerFormAdmin } from "@/components/admin/owner-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminOwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getAdminOwnerById(id);
  if (!owner) notFound();

  return (
    <div>
      <Link href="/admin/owners" className="text-sm text-grey-500 hover:text-primary">
        ← Owners
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">{owner.name}</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
        <OwnerFormAdmin owner={owner} />

        <aside className="rounded-2xl border border-grey-50 bg-white p-5 shadow-card">
          <h3 className="mb-3 font-display text-sm font-bold text-grey-900">
            Listings ({owner.listings.length})
          </h3>
          {owner.listings.length === 0 ? (
            <p className="text-sm text-grey-500">No listings yet.</p>
          ) : (
            <ul className="space-y-2">
              {owner.listings.map(
                (l: { id: string; name: string; slug: string; status: string }) => (
                  <li key={l.id}>
                    <Link
                      href={`/admin/listings/${l.id}`}
                      className="block rounded-md border border-grey-50 px-3 py-2 text-sm hover:border-primary"
                    >
                      <span className="font-semibold text-grey-800">{l.name}</span>
                      <span className="ml-2 text-xs text-grey-500">{l.status}</span>
                    </Link>
                  </li>
                )
              )}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

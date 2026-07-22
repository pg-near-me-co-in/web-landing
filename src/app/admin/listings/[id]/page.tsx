import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminAmenities, getAdminListingById, getAllCities } from "@/lib/queries";
import { db } from "@/lib/db";
import { ListingFormAdmin } from "@/components/admin/listing-form-admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { archiveListingAdmin } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, cities, amenities] = await Promise.all([
    getAdminListingById(id),
    getAllCities(),
    getAdminAmenities(),
  ]);
  if (!listing) notFound();
  const { rows: areas } = await db.query(
    `select id, city_id, name, slug from areas where is_active order by name`
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/listings" className="text-sm text-grey-500 hover:text-primary">
            ← Listings
          </Link>
          <h1 className="mt-1 font-display text-2xl text-grey-900">{listing.name}</h1>
          {listing.owner_name && (
            <p className="mt-1 text-sm text-grey-500">
              Owner: {listing.owner_name} ({listing.owner_phone})
            </p>
          )}
        </div>
        {listing.status !== "archived" && (
          <ConfirmDialog
            trigger={
              <button className="rounded-full border border-alert-fg/30 bg-alert-bg px-4 py-2 text-sm font-bold text-alert-fg hover:bg-alert-bg/70">
                Archive
              </button>
            }
            title="Archive this listing?"
            description="It will be unpublished and hidden from public search. This is reversible — edit the status field to restore it."
            confirmLabel="Archive"
            formAction={archiveListingAdmin}
            hiddenFields={{ id: listing.id }}
          />
        )}
      </div>

      <div className="mt-6">
        <ListingFormAdmin listing={listing} cities={cities} areas={areas} amenities={amenities} />
      </div>
    </div>
  );
}

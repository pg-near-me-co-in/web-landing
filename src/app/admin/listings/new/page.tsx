import Link from "next/link";
import { getAllCities } from "@/lib/queries";
import { db } from "@/lib/db";
import { ListingFormAdmin } from "@/components/admin/listing-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminNewListingPage() {
  const cities = await getAllCities();
  const { rows: areas } = await db.query(
    `select id, city_id, name, slug from areas where is_active order by name`
  );

  return (
    <div>
      <Link href="/admin/listings" className="text-sm text-grey-500 hover:text-primary">
        ← Listings
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">New listing</h1>
      <div className="mt-6">
        <ListingFormAdmin cities={cities} areas={areas} amenities={[]} />
      </div>
    </div>
  );
}

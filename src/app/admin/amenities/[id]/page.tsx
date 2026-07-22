import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminAmenityById } from "@/lib/queries";
import { AmenityFormAdmin } from "@/components/admin/amenity-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminAmenityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const amenity = await getAdminAmenityById(id);
  if (!amenity) notFound();

  return (
    <div>
      <Link href="/admin/amenities" className="text-sm text-grey-500 hover:text-primary">
        ← Amenities
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">{amenity.name}</h1>
      <div className="mt-6">
        <AmenityFormAdmin amenity={amenity} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { AmenityFormAdmin } from "@/components/admin/amenity-form-admin";

export default function AdminNewAmenityPage() {
  return (
    <div>
      <Link href="/admin/amenities" className="text-sm text-grey-500 hover:text-primary">
        ← Amenities
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">New amenity</h1>
      <div className="mt-6">
        <AmenityFormAdmin />
      </div>
    </div>
  );
}

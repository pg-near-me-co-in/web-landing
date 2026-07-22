import Link from "next/link";
import { getAllCities } from "@/lib/queries";
import { AreaFormAdmin } from "@/components/admin/area-form-admin";

export default async function AdminNewAreaPage() {
  const cities = await getAllCities();
  return (
    <div>
      <Link href="/admin/areas" className="text-sm text-grey-500 hover:text-primary">
        ← Areas
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">New area</h1>
      <div className="mt-6">
        <AreaFormAdmin cities={cities} />
      </div>
    </div>
  );
}

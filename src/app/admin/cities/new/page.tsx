import Link from "next/link";
import { CityFormAdmin } from "@/components/admin/city-form-admin";

export default function AdminNewCityPage() {
  return (
    <div>
      <Link href="/admin/cities" className="text-sm text-grey-500 hover:text-primary">
        ← Cities
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">New city</h1>
      <div className="mt-6">
        <CityFormAdmin />
      </div>
    </div>
  );
}

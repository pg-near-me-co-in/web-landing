import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminCityById } from "@/lib/queries";
import { CityFormAdmin } from "@/components/admin/city-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminCityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const city = await getAdminCityById(id);
  if (!city) notFound();

  return (
    <div>
      <Link href="/admin/cities" className="text-sm text-grey-500 hover:text-primary">
        ← Cities
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">{city.name}</h1>
      <div className="mt-6">
        <CityFormAdmin city={city} />
      </div>
    </div>
  );
}

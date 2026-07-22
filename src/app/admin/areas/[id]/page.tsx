import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminAreaById, getAllCities } from "@/lib/queries";
import { AreaFormAdmin } from "@/components/admin/area-form-admin";

export const dynamic = "force-dynamic";

export default async function AdminAreaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [area, cities] = await Promise.all([getAdminAreaById(id), getAllCities()]);
  if (!area) notFound();

  return (
    <div>
      <Link href="/admin/areas" className="text-sm text-grey-500 hover:text-primary">
        ← Areas
      </Link>
      <h1 className="mt-1 font-display text-2xl text-grey-900">{area.name}</h1>
      <div className="mt-6">
        <AreaFormAdmin area={area} cities={cities} />
      </div>
    </div>
  );
}

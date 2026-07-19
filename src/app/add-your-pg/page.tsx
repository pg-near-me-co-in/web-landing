import type { Metadata } from "next";
import { getAllCities } from "@/lib/queries";
import { db } from "@/lib/db";
import { OwnerForm } from "@/components/owner-form";

export const metadata: Metadata = {
  title: "Add your PG — List free on PG Near Me",
  description:
    "List your PG, hostel or shared flat on PG Near Me for free. Reach thousands of seekers directly — no brokers, no commission.",
  alternates: { canonical: "/add-your-pg" },
};

export default async function AddYourPgPage() {
  const cities = await getAllCities();
  const { rows: areas } = await db.query(
    `select id, city_id, name from areas where is_active order by name`
  );

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl text-grey-900 sm:text-4xl">
        List your PG — free
      </h1>
      <p className="mt-2 leading-relaxed text-grey-500">
        Reach seekers directly, without brokers. Fill in the details below and
        our team will verify &amp; publish your listing.
      </p>
      <div className="mt-8">
        <OwnerForm
          cities={cities.map(({ id, name, state }) => ({ id, name, state }))}
          areas={areas}
        />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { getAllCities } from "@/lib/queries";
import { db } from "@/lib/db";
import { OwnerForm } from "@/components/owner-form";

export const metadata: Metadata = {
  title: "List your property — free on PG Near Me",
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
    <main className="w-full flex-1">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6">
        <div className="mb-7">
          <span className="eyebrow mb-4">LIST YOUR PROPERTY</span>
          <h1 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
            Get your PG or room in front of verified seekers.
          </h1>
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-relaxed text-grey-500">
            ₹0 listing fee, ₹0 commission. Fill in the details below and our
            team will verify &amp; publish your listing.
          </p>
        </div>

        <OwnerForm
          cities={cities.map(({ id, name, state }) => ({ id, name, state }))}
          areas={areas}
        />
      </div>
    </main>
  );
}

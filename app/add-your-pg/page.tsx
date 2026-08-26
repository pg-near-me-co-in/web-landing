import type { Metadata } from "next";
import { getAllCities } from "@/lib/data/cities";
import { OwnerForm } from "@/components/owner-form";

export const metadata: Metadata = {
  title: "List your property — free on PG Near Me",
  description: "List your PG, hostel or shared flat on PG Near Me for free. Reach thousands of seekers directly — no brokers, no commission.",
  alternates: { canonical: "/add-your-pg" },
};

export default function AddYourPgPage() {
  const cities = getAllCities();

  return (
    <main className="w-full flex-1">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6">
        <div className="mb-7">
          <span className="eyebrow mb-4">LIST YOUR PROPERTY</span>
          <h1 className="font-display text-[clamp(24px,3.2vw,34px)] font-bold leading-tight text-grey-900">
            Get your PG or room in front of verified seekers.
          </h1>
          <p className="mt-3 max-w-[520px] text-[15.5px] leading-relaxed text-grey-500">
            ₹0 listing fee, ₹0 commission. Fill in the details below and our team will verify &amp; publish your
            listing.
          </p>
        </div>

        <OwnerForm cities={cities} />
      </div>
    </main>
  );
}

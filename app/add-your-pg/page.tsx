import type { Metadata } from "next";
import { getAllCities } from "@/lib/data/cities";
import { OwnerForm } from "@/components/owner-form";

export const metadata: Metadata = {
  title: "List your PG for free",
  description: "Submit your PG, hostel or shared flat to PG Near Me. No commission, no dashboard to learn. Approved listings appear across search.",
  openGraph: { title: "List your PG for free", description: "Submit your PG in under 3 minutes. Reach seekers directly." },
  alternates: { canonical: "/add-your-pg" },
};

export default function AddYourPgPage() {
  const cities = getAllCities();

  return (
    <main className="flex-1 bg-white">
      <div className="container-page py-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">For owners</div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">List your PG on PG Near Me</h1>
        <p className="mt-3 max-w-2xl text-grey-500">No commission, no monthly fee. Fill in the fields below — we manually review before publishing.</p>

        <div className="mt-8">
          <OwnerForm cities={cities} />
        </div>
      </div>
    </main>
  );
}

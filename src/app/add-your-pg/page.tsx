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

const OWNER_BENEFITS = [
  {
    title: "Free forever",
    text: "No listing fee, no commission on tenants. Listing your PG costs nothing — ever.",
  },
  {
    title: "Direct enquiries",
    text: "Seekers see your number and WhatsApp after leaving their details, and contact you directly.",
  },
  {
    title: "Verified badge",
    text: "Our team verifies your listing before publishing, so seekers trust what they see.",
  },
  {
    title: "You stay in control",
    text: "Update prices, photos and availability anytime by writing to us — no lock-ins.",
  },
];

export default async function AddYourPgPage() {
  const cities = await getAllCities();
  const { rows: areas } = await db.query(
    `select id, city_id, name from areas where is_active order by name`
  );

  return (
    <main className="w-full flex-1">
      <div className="bg-gradient-to-b from-accent/15 to-grey-5">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center sm:px-6">
          <p className="mx-auto inline-flex rounded-full border border-teal/30 bg-success-bg px-3 py-1 text-xs font-bold text-success-fg">
            ₹0 listing fee · ₹0 commission
          </p>
          <h1 className="mt-4 font-display text-3xl text-grey-900 sm:text-4xl">
            List your PG — free
          </h1>
          <p className="mx-auto mt-2 max-w-xl leading-relaxed text-grey-500">
            Reach seekers directly, without brokers. Fill in the details below
            and our team will verify &amp; publish your listing.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          {OWNER_BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="flex gap-3 rounded-2xl border border-grey-50 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple font-display text-sm text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-bold text-grey-900">{b.title}</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-grey-500">
                  {b.text}
                </p>
              </div>
            </div>
          ))}
        </aside>

        <div className="rounded-3xl border border-grey-50 bg-white p-5 shadow-sm sm:p-7">
          <OwnerForm
            cities={cities.map(({ id, name, state }) => ({ id, name, state }))}
            areas={areas}
          />
        </div>
      </div>
    </main>
  );
}

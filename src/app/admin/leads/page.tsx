import { getLeads } from "@/lib/queries";

export const dynamic = "force-dynamic";

const INTENT_LABEL: Record<string, string> = {
  contact_reveal: "Contact reveal",
  enquiry_form: "Enquiry",
  callback_request: "Callback",
};

export default async function LeadsPage() {
  const rows = await getLeads();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-grey-900">
          Leads ({rows.length})
        </h1>
        <a
          href="/admin/leads/export"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-purple"
        >
          Export CSV
        </a>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-grey-50 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-grey-50 text-xs uppercase tracking-wide text-grey-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Seeker</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Intent</th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">City</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-grey-50 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-grey-500">
                  {new Date(r.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 font-semibold text-grey-800">
                  {r.name ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3 text-grey-500">
                  {INTENT_LABEL[r.intent] ?? r.intent}
                </td>
                <td className="px-4 py-3">{r.listing_name}</td>
                <td className="px-4 py-3 text-grey-500">{r.city_name}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-grey-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

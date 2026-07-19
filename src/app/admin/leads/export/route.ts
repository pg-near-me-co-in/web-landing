import { isAdminSession } from "@/lib/admin-auth";
import { getLeads } from "@/lib/queries";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(): Promise<Response> {
  if (!(await isAdminSession())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const rows = await getLeads(10000);
  const header = "created_at,name,phone,intent,message,listing,city";
  const body = rows
    .map((r) =>
      [
        new Date(r.created_at).toISOString(),
        r.name,
        r.phone,
        r.intent,
        r.message,
        r.listing_name,
        r.city_name,
      ]
        .map(csvCell)
        .join(",")
    )
    .join("\n");

  return new Response(`${header}\n${body}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pgnearme-leads.csv"`,
    },
  });
}

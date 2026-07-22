import { getPendingSubmissions } from "@/lib/queries";
import {
  aiImproveDescription,
  approveListing,
  rejectListing,
} from "@/lib/admin-actions";
import { isAiConfigured } from "@/lib/ai";
import { PG_TYPE_LABEL, formatPriceRange } from "@/lib/format";
import type { PgType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const rows = await getPendingSubmissions();
  const aiOn = isAiConfigured();

  return (
    <>
      <h1 className="font-display text-2xl text-grey-900">
        Pending submissions ({rows.length})
      </h1>
      {rows.length === 0 && (
        <p className="mt-4 text-sm text-grey-500">Queue is empty. 🎉</p>
      )}
      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-grey-50 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-grey-900">{r.name}</p>
                <p className="mt-0.5 text-sm text-grey-500">
                  {[r.area_name, r.city_name].filter(Boolean).join(", ")}
                  {r.pg_type && ` · ${PG_TYPE_LABEL[r.pg_type as PgType]}`}
                  {formatPriceRange(r.price_min, r.price_max) &&
                    ` · ${formatPriceRange(r.price_min, r.price_max)}/mo`}
                  {r.sharing_types?.length > 0 && ` · ${r.sharing_types.join("/")}`}
                </p>
                <p className="mt-1 text-xs text-grey-500">
                  {r.source} · {new Date(r.created_at).toLocaleString("en-IN")}
                  {r.owner_name && ` · owner: ${r.owner_name} (${r.owner_phone})`}
                </p>
                {r.description && (
                  <p className="mt-2 max-w-2xl text-sm text-grey-600">{r.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {aiOn && (
                  <form action={aiImproveDescription}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-full border border-accent bg-accent/15 px-4 py-2 text-sm font-bold text-primary transition hover:bg-accent/30">
                      ✦ AI description
                    </button>
                  </form>
                )}
                <form action={approveListing}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full bg-success-fg px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
                    Publish
                  </button>
                </form>
                <form action={rejectListing}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full bg-alert-bg px-4 py-2 text-sm font-bold text-alert-fg transition hover:opacity-90">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

import Link from "next/link";

const PAGE_SIZE = 20;

/** Prev/next pager for admin list pages — plain GET-param Links (crawlable,
 *  bookmarkable, no JS needed), consistent with the public /pg/[city] filters. */
export function AdminPagination({
  page,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) qs.set(k, v);
    }
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-md border border-grey-100 px-3 py-1.5 font-semibold ${
          page <= 1 ? "pointer-events-none opacity-40" : "text-grey-700 hover:border-primary hover:text-primary"
        }`}
      >
        ← Previous
      </Link>
      <span className="text-grey-500">
        Page {page} of {totalPages} ({total} total)
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-md border border-grey-100 px-3 py-1.5 font-semibold ${
          page >= totalPages ? "pointer-events-none opacity-40" : "text-grey-700 hover:border-primary hover:text-primary"
        }`}
      >
        Next →
      </Link>
    </nav>
  );
}

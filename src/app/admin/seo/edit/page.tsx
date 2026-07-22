import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SeoForm, type SeoFormValues } from "@/components/seo-form";

export const dynamic = "force-dynamic";

export default async function SeoEditPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string; slug?: string; route?: string }>;
}) {
  const sp = await searchParams;
  let values: SeoFormValues | null = null;
  let label = "";

  if (sp.type === "static_page" && sp.route === "/") {
    label = "Homepage";
    values = {
      entity_type: "static_page",
      entity_id: null,
      route_pattern: "/",
      meta_title: "",
      meta_description: "",
      og_title: "",
      og_description: "",
    };
  } else if (sp.type === "city" && sp.id) {
    const { rows } = await db.query(`select id, name, slug from cities where id = $1`, [
      sp.id,
    ]);
    if (!rows[0]) notFound();
    label = `City — ${rows[0].name}`;
    values = {
      entity_type: "city",
      entity_id: rows[0].id,
      route_pattern: `/pg/${rows[0].slug}`,
      meta_title: "",
      meta_description: "",
      og_title: "",
      og_description: "",
    };
  } else if (sp.type === "listing" && sp.slug) {
    const { rows } = await db.query(
      `select l.id, l.name, l.slug, c.slug as city_slug, a.slug as area_slug
         from pg_listings l
         join cities c on c.id = l.city_id
         left join areas a on a.id = l.area_id
        where l.slug = $1`,
      [sp.slug]
    );
    if (!rows[0]) notFound();
    label = `Listing — ${rows[0].name}`;
    values = {
      entity_type: "listing",
      entity_id: rows[0].id,
      route_pattern: `/pg/${rows[0].city_slug}/${rows[0].area_slug ?? "all"}/${rows[0].slug}`,
      meta_title: "",
      meta_description: "",
      og_title: "",
      og_description: "",
    };
  }

  if (!values) notFound();

  // load an existing override into the form
  const { rows: existing } = await db.query(
    values.entity_id
      ? `select meta_title, meta_description, og_title, og_description
           from page_seo_meta where entity_type = $1 and entity_id = $2`
      : `select meta_title, meta_description, og_title, og_description
           from page_seo_meta where entity_type = $1 and route_pattern = $2`,
    [values.entity_type, values.entity_id ?? values.route_pattern]
  );
  if (existing[0]) {
    values = {
      ...values,
      meta_title: existing[0].meta_title ?? "",
      meta_description: existing[0].meta_description ?? "",
      og_title: existing[0].og_title ?? "",
      og_description: existing[0].og_description ?? "",
    };
  }

  return (
    <>
      <Link href="/admin/seo" className="text-sm font-semibold text-primary hover:underline">
        ← All pages
      </Link>
      <h1 className="mt-2 font-display text-2xl text-grey-900">{label}</h1>
      <p className="mt-1 text-sm text-grey-500">
        Route: <code>{values.route_pattern}</code>
      </p>
      <SeoForm initial={values} />
    </>
  );
}

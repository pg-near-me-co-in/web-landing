import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries = [
          { path: "/", priority: "1.0", changefreq: "weekly" as const },
          { path: "/listings?city=vadodara", priority: "0.9", changefreq: "daily" as const },
          { path: "/for-owners", priority: "0.7", changefreq: "monthly" as const },
          { path: "/about", priority: "0.5", changefreq: "monthly" as const },
          { path: "/submit", priority: "0.6", changefreq: "monthly" as const },
        ];

        const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        let listingEntries: { path: string; lastmod?: string }[] = [];
        if (supabaseUrl && key) {
          const client = createClient(supabaseUrl, key, {
            auth: { persistSession: false },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data } = await client
            .from("listings")
            .select("slug, updated_at")
            .eq("status", "published");
          listingEntries = (data ?? []).map((l: { slug: string; updated_at: string }) => ({
            path: `/listings/${l.slug}`,
            lastmod: l.updated_at,
          }));
        }

        const all = [
          ...staticEntries.map((e) => ({ ...e, lastmod: undefined as string | undefined })),
          ...listingEntries.map((e) => ({ ...e, changefreq: "weekly" as const, priority: "0.8" })),
        ];

        const urls = all.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            "changefreq" in e && e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            "priority" in e && e.priority ? `    <priority>${e.priority}</priority>` : null,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

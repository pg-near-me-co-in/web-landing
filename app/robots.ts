import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgnearme.co.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Lead capture (contact-reveal), owner submission, and review
      // submission are all React Server Actions (POST to the current page
      // URL, not a separate route) — there is no distinct crawlable
      // endpoint for them to disallow here. SEO_AEO_GEO_STRATEGY.md §2's
      // "disallow lead-capture POST endpoints" note is satisfied by this
      // being a non-issue for this app's architecture, not by an added rule.
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // owner-uploaded photos served from the Supabase Storage public bucket
      { protocol: "https", hostname: "ggaxffyliyblgqqpapcn.supabase.co" },
      // OSM-scraped listing photos (scripts/scrape-osm.js resolves a
      // wikimedia_commons tag to this exact CDN host, nothing broader)
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        // admin is URL-only: never indexed, never linked from the public UI
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // owner-uploaded photos served from the Supabase Storage public bucket
      { protocol: "https", hostname: "ggaxffyliyblgqqpapcn.supabase.co" },
    ],
  },
};

export default nextConfig;

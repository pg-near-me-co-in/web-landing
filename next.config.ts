import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // admin is a future (Phase B) route — pre-emptively noindex so it's
      // never accidentally exposed once it exists.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;

"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { Listing } from "@/lib/types";

const HomeMap = dynamic(() => import("./home-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] w-full animate-pulse place-items-center border-y border-grey-50 bg-grey-10 md:h-[560px]">
      <div className="flex items-center gap-2 text-sm font-medium text-grey-500">
        <MapPin className="h-4 w-4" /> Loading the interactive PG map…
      </div>
    </div>
  ),
});

export function HomeMapLoader({ listings }: { listings: Listing[] }) {
  return <HomeMap listings={listings} />;
}

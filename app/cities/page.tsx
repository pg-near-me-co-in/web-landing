import type { Metadata } from "next";
import { CitiesPageClient } from "@/components/cities-page-client";
import { getAllListings } from "@/lib/data/listings";

export const metadata: Metadata = {
  title: "Map of PG cities — Vadodara, Bengaluru, Pune & more",
  description: "Browse verified PGs, hostels and shared flats city by city on an interactive map — Vadodara live now, more cities rolling out. Zero brokerage, direct owner contact.",
  openGraph: {
    title: "Map — find a PG in your city | PG Near Me",
    description: "City-by-city map directory of verified PGs and shared rooms across India.",
    url: "/cities",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PG Near Me city map" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Map — find a PG in your city | PG Near Me",
    description: "City-by-city map directory of verified PGs and shared rooms across India.",
    images: ["/og.png"],
  },
  alternates: { canonical: "/cities" },
};

export default function CitiesPage() {
  const listings = getAllListings();
  return <CitiesPageClient listings={listings} />;
}

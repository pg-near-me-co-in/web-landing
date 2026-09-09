import type { Metadata } from "next";
import { CitiesPageClient } from "@/components/cities-page-client";

export const metadata: Metadata = {
  title: "PGs & shared rooms by city — Vadodara, Bengaluru, Pune & more",
  description: "Browse verified PGs, hostels and shared flats city by city — Vadodara live now, more cities rolling out. Zero brokerage, direct owner contact.",
  openGraph: {
    title: "Find a PG in your city — PG Near Me",
    description: "City-by-city directory of verified PGs and shared rooms across India.",
  },
  alternates: { canonical: "/cities" },
};

export default function CitiesPage() {
  return <CitiesPageClient />;
}

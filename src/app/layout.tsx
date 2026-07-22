import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { Pwa } from "@/components/pwa";
import { Toaster } from "@/components/ui/sonner";
import { getThemeSettings, themeCss } from "@/lib/theme";

// Bento theme (2026-07): Sora/Manrope display+body pairing, self-hosted via
// next/font. JetBrains Mono is kept for eyebrows/badges/prices — a
// deliberate deviation from the reference (which has no mono face).
const sora = Sora({
  variable: "--font-sora",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgnearme.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "PG Near Me",
  title: {
    default: "PG Near Me — Find PGs, Hostels & Shared Flats in India",
    template: "%s | PG Near Me",
  },
  description:
    "Free directory of PGs, hostels and shared flats across India. Filter by city, budget, sharing type and gender — contact owners directly, no brokers.",
  openGraph: {
    siteName: "PG Near Me",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "PG Near Me — verified PGs, hostels and shared flats across India, zero brokerage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Near Me — Find PGs, Hostels & Shared Flats in India",
    description:
      "Verified PGs, hostels and shared flats across India — zero brokerage, direct owner contact.",
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#534AB7",
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeOverride = themeCss(await getThemeSettings());
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {themeOverride && <style>{themeOverride}</style>}
        <Header />
        {children}
        <Footer />
        <Pwa />
        <Toaster position="top-center" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

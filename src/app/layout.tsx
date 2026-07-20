import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { Pwa } from "@/components/pwa";
import { getThemeSettings, themeCss } from "@/lib/theme";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
    "Free directory of PGs, hostels and flatmate-sharing accommodation across India. Filter by city, budget, sharing type and gender — contact owners directly, no brokers.",
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
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {themeOverride && <style>{themeOverride}</style>}
        <Header />
        {children}
        <Footer />
        <Pwa />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

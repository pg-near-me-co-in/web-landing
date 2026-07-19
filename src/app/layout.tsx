import type { Metadata } from "next";
import { Cherry_Bomb_One, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { Pwa } from "@/components/pwa";
import { getThemeSettings, themeCss } from "@/lib/theme";

const cherryBomb = Cherry_Bomb_One({
  variable: "--font-cherry-bomb",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgnearme.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#534AB7",
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
      className={`${cherryBomb.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {themeOverride && <style>{themeOverride}</style>}
        <Header />
        {children}
        <Footer />
        <Pwa />
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { SITE } from "@/lib/content";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`;

const ogImages = [
  {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: `${SITE.name} — verified PGs on an interactive map`,
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE.name,
  title: {
    default: SITE.defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.defaultDescription,
  keywords: [
    "PG near me",
    "paying guest",
    "hostel",
    "shared room",
    "girls PG",
    "boys PG",
    "co-ed PG",
    "zero brokerage",
    "India",
  ],
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "housing",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: ogImages,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport = {
  themeColor: "#534AB7",
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

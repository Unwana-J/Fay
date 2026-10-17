import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo";
import JsonLd, { siteJsonLd } from "@/components/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Lokin Labs" }],
  creator: "Lokin Labs",
  publisher: "Lokin Labs",
  category: "games",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/fey-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/fey-icon-512.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import AppLayout from "@/components/ui/AppLayout";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={siteJsonLd()} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${lora.variable} font-sans antialiased`}
        style={{ background: "var(--bg-base)", color: "var(--text)" }}
      >
        <PostHogProvider>
          <AppLayout>{children}</AppLayout>
        </PostHogProvider>
      </body>
    </html>
  );
}


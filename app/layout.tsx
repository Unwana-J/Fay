import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://fey.lokinlabs.com.ng"),
  title: "Fey — Think Deeper. Speak Better.",
  description:
    "A premium learning platform that challenges you to research, synthesize, and explain ideas in your own words. Build genuine understanding through active learning.",
  keywords: ["learning", "critical thinking", "public speaking", "knowledge", "education"],
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


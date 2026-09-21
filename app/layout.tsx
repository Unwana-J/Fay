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
  title: "Fey — Think Deeper. Speak Better.",
  description:
    "A premium learning platform that challenges you to research, synthesize, and explain ideas in your own words. Build genuine understanding through active learning.",
  keywords: ["learning", "critical thinking", "public speaking", "knowledge", "education"],
};

import AppLayout from "@/components/ui/AppLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${lora.variable} font-sans antialiased`}
        style={{ background: "var(--bg-base)", color: "var(--text)" }}
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

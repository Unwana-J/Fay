import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import AuthGate from "@/components/auth/AuthGate";

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
        <AuthGate>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-screen flex flex-col" style={{ marginLeft: "240px" }}>
              <div className="flex-1">
                {children}
              </div>
            </main>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}

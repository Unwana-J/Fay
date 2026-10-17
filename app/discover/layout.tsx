import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "90-Second Speaking Challenge: Explain Any Topic (Feynman Technique) · Fey";
const description =
  "Pick a topic in philosophy, science, history, or economics, research it, then explain it out loud in 90 seconds. A fun daily brain game to sharpen thinking and public speaking with the Feynman Technique.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["Feynman Technique", "public speaking practice", "explain like I'm five", "critical thinking game", "daily brain training", "learning challenge"],
  alternates: { canonical: "/discover" },
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return children;
}

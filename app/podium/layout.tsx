import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "The Podium: Hot Takes Presentation Party Game with AI Slides · Fey";
const description =
  "Spin a spicy hot-take topic, jot your angle, and AI builds a bold 5-slide deck in seconds. Present to your friends and share the deck with a link. A free PowerPoint party game for game night.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["PowerPoint party game", "hot takes game", "presentation game", "debate game", "AI slide generator game", "party games for adults"],
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function PodiumLayout({ children }: { children: ReactNode }) {
  return children;
}

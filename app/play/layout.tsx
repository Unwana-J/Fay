import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Online Articulate: Free Word Description Party Game · Fey";
const description =
  "Play Articulate online for free. Describe words to your team before the timer runs out, with speech recognition and an AI referee. A fun, fast party game for friends, family, and game night.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["online Articulate", "Articulate game online", "word description game", "party games for friends", "game night ideas", "Taboo alternative"],
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function PlayLayout({ children }: { children: ReactNode }) {
  return children;
}

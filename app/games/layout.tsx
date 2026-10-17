import type { Metadata } from "next";
import type { ReactNode } from "react";
import JsonLd, { gamesJsonLd } from "@/components/seo/JsonLd";

const title = "Fun Intellectual Games to Play Online: Trivia, Word & Party Games · Fey";
const description =
  "Play free intellectual games on Fey: Naija Trivia with 1,000+ questions, Online Articulate word party game, and The Podium hot-take presentation game. Smart games for friends, students, and curious adults.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, siteName: "Fey", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title, description },
};

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={gamesJsonLd()} />
      {children}
    </>
  );
}

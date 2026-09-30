/**
 * Server Component wrapper for /games/trivia
 *
 * Provides dynamic server-side Open Graph & Twitter card previews on WhatsApp,
 * X, iMessage, and LinkedIn when players share their trivia scores and challenge links.
 */

import type { Metadata } from "next";
import TriviaGameClient, { type ChallengerInfo } from "./TriviaGameClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = searchParams ? await searchParams : {};

  const scoreRaw = typeof sParams.score === "string" ? sParams.score : undefined;
  const totalRaw = typeof sParams.total === "string" ? sParams.total : undefined;
  const byRaw = typeof sParams.by === "string" ? sParams.by : undefined;
  const gradeRaw = typeof sParams.grade === "string" ? sParams.grade : undefined;
  const pctRaw = typeof sParams.pct === "string" ? sParams.pct : undefined;

  const isChallenge = Boolean(scoreRaw && totalRaw);

  const score = scoreRaw ? parseInt(scoreRaw, 10) : 0;
  const total = totalRaw ? parseInt(totalRaw, 10) : 15;
  const pct = pctRaw ? parseInt(pctRaw, 10) : Math.round((score / total) * 100) || 0;
  const author = byRaw || "Scholar";
  const grade = gradeRaw || (pct >= 80 ? "Naija Expert! 🏆" : pct >= 60 ? "Sharp Sharp! 🎯" : pct >= 40 ? "Not bad o! 🙌" : "Keep studying! 📚");

  const title = isChallenge
    ? `Can you beat my score? ${score}/${total} on Naija Trivia 🇳🇬 · Fey`
    : "Naija Trivia Arcade · Fey";

  const description = isChallenge
    ? `Scholar ${author} scored ${score}/${total} (${pct}% accuracy) on Naija Trivia (${grade})! Can you beat their score? Tap to test your wits in Nigerian history & culture.`
    : "Test your knowledge of Nigerian history, pop culture, and general knowledge with 1,000+ curated questions. Think deeper on Fey.";

  const queryParams = new URLSearchParams();
  if (isChallenge) {
    queryParams.set("score", String(score));
    queryParams.set("total", String(total));
    queryParams.set("pct", String(pct));
    queryParams.set("by", author);
    queryParams.set("grade", grade);
  }

  const ogImageUrl = `https://fey.lokinlabs.com.ng/api/og/trivia${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const canonicalUrl = `https://fey.lokinlabs.com.ng/games/trivia${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Fey — Think Deeper, Articulate Clearly",
      type: "website",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      "og:site_name": "Fey",
      "article:author": author,
    },
  };
}

export default async function TriviaPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = searchParams ? await searchParams : {};

  const scoreRaw = typeof sParams.score === "string" ? parseInt(sParams.score, 10) : undefined;
  const totalRaw = typeof sParams.total === "string" ? parseInt(sParams.total, 10) : undefined;
  const byRaw = typeof sParams.by === "string" ? sParams.by : undefined;
  const gradeRaw = typeof sParams.grade === "string" ? sParams.grade : undefined;
  const pctRaw = typeof sParams.pct === "string" ? parseInt(sParams.pct, 10) : undefined;

  let challenger: ChallengerInfo | null = null;
  if (scoreRaw !== undefined && totalRaw !== undefined) {
    challenger = {
      score: scoreRaw,
      total: totalRaw,
      pct: pctRaw ?? Math.round((scoreRaw / totalRaw) * 100),
      by: byRaw || "Scholar",
      grade: gradeRaw,
    };
  }

  return <TriviaGameClient challenger={challenger} />;
}

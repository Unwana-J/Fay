/**
 * Server Component wrapper for /games/mathletics
 *
 * Provides dynamic server-side Open Graph & Twitter card previews on WhatsApp,
 * X, iMessage, and LinkedIn when players share their mathletics scores and challenge links.
 */

import type { Metadata } from "next";
import MathleticsGameClient, { type ChallengerInfo } from "./MathleticsGameClient";
import { decodeChallengeFromUrl, type MathleticsChallenge } from "@/lib/mathletics-challenge";
import FeatureGate from "@/components/ui/FeatureGate";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = searchParams ? await searchParams : {};

  const challengeCode = typeof sParams.challenge === "string" ? sParams.challenge : undefined;
  if (challengeCode) {
    const challenge = decodeChallengeFromUrl(challengeCode);
    if (challenge) {
      const title = `${challenge.title} · 25s Math Duel · Fey`;
      const description = `Competed on Fey: ${challenge.questionCount} mental math questions hosted by Scholar ${challenge.creatorName}. Join and beat the clock!`;
      const canonicalUrl = `https://fey.lokinlabs.com.ng/games/mathletics?challenge=${challengeCode}`;

      return {
        title,
        description,
        alternates: { canonical: "/games/mathletics" },
        openGraph: {
          title,
          description,
          siteName: "Fey — Think Deeper, Articulate Clearly",
          type: "website",
          url: canonicalUrl,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  }

  const scoreRaw = typeof sParams.score === "string" ? sParams.score : undefined;
  const totalRaw = typeof sParams.total === "string" ? sParams.total : undefined;
  const byRaw = typeof sParams.by === "string" ? sParams.by : undefined;
  const pctRaw = typeof sParams.pct === "string" ? sParams.pct : undefined;

  const isChallenge = Boolean(scoreRaw && totalRaw);
  const score = scoreRaw ? parseInt(scoreRaw, 10) : 0;
  const total = totalRaw ? parseInt(totalRaw, 10) : 10;
  const pct = pctRaw ? parseInt(pctRaw, 10) : Math.round((score / total) * 100) || 0;
  const author = byRaw || "Scholar";

  const title = isChallenge
    ? `${author} scored ${pct}% on Mathletics · Can you calculate faster? · Fey`
    : "Mathletics Mental Arena · Fey";

  const description = isChallenge
    ? `Scholar ${author} scored ${score}/${total} (${pct}% accuracy) in 25-second rounds on Mathletics. Answer the exact same questions and see if you can out-calculate them.`
    : "25-second mental math, algebra, probability, and geometry challenges. Sharpen your quantitative intuition on Fey.";

  return {
    title,
    description,
    alternates: { canonical: "/games/mathletics" },
    openGraph: {
      title,
      description,
      siteName: "Fey — Think Deeper, Articulate Clearly",
      type: "website",
      url: "https://fey.lokinlabs.com.ng/games/mathletics",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MathleticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = searchParams ? await searchParams : {};

  let initialChallenge: MathleticsChallenge | null = null;
  let challengerInfo: ChallengerInfo | null = null;

  const challengeCode = typeof sParams.challenge === "string" ? sParams.challenge : undefined;
  if (challengeCode) {
    initialChallenge = decodeChallengeFromUrl(challengeCode);
  }

  const scoreRaw = typeof sParams.score === "string" ? sParams.score : undefined;
  const totalRaw = typeof sParams.total === "string" ? sParams.total : undefined;
  const byRaw = typeof sParams.by === "string" ? sParams.by : undefined;
  const pctRaw = typeof sParams.pct === "string" ? sParams.pct : undefined;

  if (scoreRaw && totalRaw) {
    const score = parseInt(scoreRaw, 10);
    const total = parseInt(totalRaw, 10);
    const pct = pctRaw ? parseInt(pctRaw, 10) : Math.round((score / total) * 100);
    challengerInfo = {
      name: byRaw || "A fellow scholar",
      score,
      total,
      pct,
    };
  }

  return (
    <FeatureGate
      flag="enableMathletics"
      title="Mathletics is under revamp"
      message="We're tuning the question banks and calculation arena. Mathletics will be back shortly."
    >
      <MathleticsGameClient
        initialChallenge={initialChallenge}
        challengerInfo={challengerInfo}
      />
    </FeatureGate>
  );
}

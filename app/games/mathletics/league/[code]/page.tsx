import type { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type MathleticsLeague,
  type MathleticsLeagueScore,
  getMathleticsLeagueStatus,
  aggregateMathleticsLeaderboard,
  generateDailyMathleticsQuestions,
} from "@/lib/mathletics-league";
import { getOrRestoreMathleticsLeague } from "@/lib/mathletics-db";
import MathleticsLeagueClient from "./MathleticsLeagueClient";
import { todayStr, formatDateToIso, addDaysToDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{
    d?: string;
    q?: string;
    t?: string;
    c?: string;
    cat?: string;
    diff?: string;
    fmt?: string;
    tim?: string;
  }>;
}): Promise<Metadata> {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const cleanCode = code?.toUpperCase().trim() || "LEAGUE";
  const titleFallback = sp?.t ? `${sp.t} · Mathletics League` : `Mathletics League (${cleanCode}) · Fey`;

  if (!isSupabaseConfigured || !supabase) {
    return {
      title: titleFallback,
      description: "Join the Mathletics sprint challenge on Fey.",
    };
  }

  try {
    const { data: leagueRow } = await supabase
      .from("mathletics_leagues")
      .select("title, creator_name, duration_days, format, start_date")
      .eq("code", cleanCode)
      .maybeSingle();

    if (leagueRow) {
      const isSprint = leagueRow.format === "sprint_duel" || leagueRow.duration_days === 1;
      const title = isSprint
        ? `⚔️ ${leagueRow.title} · Sprint Duel · Fey`
        : `🏆 ${leagueRow.title} · Day ${getMathleticsLeagueStatus(leagueRow.start_date, leagueRow.duration_days).dayNumber} of ${leagueRow.duration_days} · Fey`;
      const description = `Mathletics challenge hosted by ${
        leagueRow.creator_name && leagueRow.creator_name !== "Scholar"
          ? leagueRow.creator_name
          : "Host"
      }. Answer 10 mental math calculation sprints and climb the agility leaderboard!`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          siteName: "Fey — Think Deeper, Articulate Clearly",
          type: "website",
          url: `https://fey.lokinlabs.com.ng/games/mathletics/league/${cleanCode}`,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
      };
    }
  } catch {}

  return {
    title: titleFallback,
    description: "Join the Mathletics sprint challenge on Fey.",
  };
}

export default async function MathleticsLeaguePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{
    d?: string;
    q?: string;
    t?: string;
    c?: string;
    cat?: string;
    diff?: string;
    fmt?: string;
    pol?: string;
    u?: string;
    tim?: string;
  }>;
}) {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const cleanCode = code?.toUpperCase().trim() || "LEAGUE";

  const isSprint = sp?.fmt === "sprint_duel" || Number(sp?.d) === 1;
  const durationDays = isSprint ? 1 : [3, 5, 7, 14].includes(Number(sp?.d)) ? Number(sp.d) : 5;
  const fallbackMeta: Partial<MathleticsLeague> = {
    title: sp?.t ? decodeURIComponent(sp.t) : undefined,
    creatorName: sp?.c && sp.c !== "Scholar" ? decodeURIComponent(sp.c) : undefined,
    durationDays,
    questionsPerDay: 10,
    category: (sp?.cat as any) || "all",
    difficulty: (sp?.diff as any) || "random",
    format: isSprint ? "sprint_duel" : "marathon",
    attemptPolicy: isSprint ? "once" : (sp?.pol as any) || "flexible",
    unlockedUpToDay: Number(sp?.u) > 0 ? Number(sp.u) : 1,
    questionTimerSeconds: Math.max(25, Number(sp?.tim) || 25),
  };

  const fetched = await getOrRestoreMathleticsLeague(cleanCode, fallbackMeta);
  let league: MathleticsLeague;
  let scores: MathleticsLeagueScore[];

  if (fetched) {
    league = fetched.league;
    scores = fetched.scores;
  } else {
    const today = todayStr();
    league = {
      code: cleanCode,
      title: fallbackMeta.title || `Mathletics League (${cleanCode})`,
      creatorName: fallbackMeta.creatorName || "Host",
      creatorId: "creator",
      format: isSprint ? "sprint_duel" : "marathon",
      durationDays,
      startDate: today,
      endDate: formatDateToIso(addDaysToDate(new Date(), durationDays - 1)),
      questionsPerDay: 10,
      difficulty: fallbackMeta.difficulty || "random",
      category: fallbackMeta.category || "all",
      attemptPolicy: fallbackMeta.attemptPolicy || "flexible",
      unlockedUpToDay: fallbackMeta.unlockedUpToDay || 1,
      questionTimerSeconds: fallbackMeta.questionTimerSeconds || 25,
      dailySeedMap: generateDailyMathleticsQuestions(
        durationDays,
        10,
        fallbackMeta.difficulty || "random",
        fallbackMeta.category || "all",
        cleanCode
      ),
    };
    scores = [];
  }

  const status = getMathleticsLeagueStatus(league.startDate, league.durationDays);
  const leaderboard = aggregateMathleticsLeaderboard(scores, status.dayNumber);

  return (
    <MathleticsLeagueClient
      code={cleanCode}
      initialLeague={league}
      initialScores={scores}
      initialLeaderboard={leaderboard}
    />
  );
}

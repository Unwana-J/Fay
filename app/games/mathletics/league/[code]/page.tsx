import type { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type MathleticsLeague,
  type MathleticsLeagueScore,
  getMathleticsLeagueStatus,
  aggregateMathleticsLeaderboard,
  generateDailyMathleticsQuestions,
  hydrateMathleticsLeagueFromScoreRows,
} from "@/lib/mathletics-league";
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

  let league: MathleticsLeague | null = null;
  let scores: MathleticsLeagueScore[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: leagueRow } = await supabase
        .from("mathletics_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (leagueRow) {
        const baseLeague: MathleticsLeague = {
          id: leagueRow.id,
          code: leagueRow.code,
          title: leagueRow.title,
          creatorName: leagueRow.creator_name,
          creatorId: leagueRow.creator_id,
          format: leagueRow.format || (leagueRow.duration_days === 1 ? "sprint_duel" : "marathon"),
          durationDays: leagueRow.duration_days || 1,
          startDate: leagueRow.start_date,
          endDate: leagueRow.end_date,
          questionsPerDay: leagueRow.questions_per_day || 10,
          difficulty: leagueRow.difficulty || "random",
          category: leagueRow.category || "all",
          dailySeedMap: leagueRow.daily_seed_map,
          attemptPolicy: leagueRow.daily_seed_map?._policy || (leagueRow.duration_days === 1 ? "once" : "flexible"),
          unlockedUpToDay: Math.max(
            Number(leagueRow.daily_seed_map?._unlockedUpToDay) || 1,
            Number(sp?.u) || 1
          ),
          questionTimerSeconds: leagueRow.daily_seed_map?._questionTimer || 25,
          createdAt: leagueRow.created_at,
        };

        const { data: scoreRows } = await supabase
          .from("mathletics_scores")
          .select("*")
          .eq("league_code", cleanCode)
          .order("created_at", { ascending: true });

        const hydrated = hydrateMathleticsLeagueFromScoreRows(baseLeague, scoreRows || []);
        league = hydrated.league;
        scores = hydrated.scores;
      }
    } catch {}
  }

  if (!league) {
    const isSprint = sp?.fmt === "sprint_duel" || Number(sp?.d) === 1;
    const durationDays = isSprint ? 1 : [3, 5, 7, 14].includes(Number(sp?.d)) ? Number(sp.d) : 5;
    const title = sp?.t ? decodeURIComponent(sp.t) : `Mathletics League (${cleanCode})`;
    const creatorName = sp?.c && sp.c !== "Scholar" ? decodeURIComponent(sp.c) : "Host";
    const category = (sp?.cat as any) || "all";
    const difficulty = (sp?.diff as any) || "random";
    const attemptPolicy = isSprint ? "once" : (sp?.pol as any) || "flexible";
    const today = todayStr();

    league = {
      code: cleanCode,
      title,
      creatorName,
      creatorId: "creator",
      format: isSprint ? "sprint_duel" : "marathon",
      durationDays,
      startDate: today,
      endDate: formatDateToIso(addDaysToDate(new Date(), durationDays - 1)),
      questionsPerDay: 10,
      difficulty,
      category,
      attemptPolicy,
      unlockedUpToDay: Number(sp?.u) > 0 ? Number(sp.u) : 1,
      questionTimerSeconds: Math.max(25, Number(sp?.tim) || 25),
      dailySeedMap: generateDailyMathleticsQuestions(
        durationDays,
        10,
        difficulty,
        category,
        cleanCode
      ),
    };
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

import type { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type FriendshipLeague,
  type LeagueDailyScore,
  getLeagueStatus,
  aggregateLeagueLeaderboard,
  generateDailyLeagueQuestions,
  hydrateLeagueFromScoreRows,
} from "@/lib/trivia-league";
import LeagueArenaClient from "./LeagueArenaClient";
import { todayStr, formatDateToIso, addDaysToDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ d?: string; q?: string; t?: string; c?: string; cat?: string; diff?: string; pol?: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const cleanCode = code?.toUpperCase().trim() || "LEAGUE";
  const titleFallback = sp?.t ? `${sp.t} · Fey League` : `🏆 Friendship Trivia League (${cleanCode}) · Fey`;

  if (!isSupabaseConfigured || !supabase) {
    return {
      title: titleFallback,
      description: "Join the multi-day Naija Trivia League on Fey.",
    };
  }

  try {
    const { data: leagueRow } = await supabase
      .from("friendship_leagues")
      .select("title, creator_name, duration_days, start_date")
      .eq("code", cleanCode)
      .maybeSingle();

    if (leagueRow) {
      const status = getLeagueStatus(leagueRow.start_date, leagueRow.duration_days);
      const title = `🏆 ${leagueRow.title} · Day ${status.dayNumber} of ${leagueRow.duration_days} · Fey League`;
      const description = `Multi-day Naija Trivia tournament hosted by Scholar ${leagueRow.creator_name}. Answer 1 daily quiz drop and compete for the top spot!`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          siteName: "Fey — Think Deeper, Articulate Clearly",
          type: "website",
          url: `https://fey.lokinlabs.com.ng/games/trivia/league/${cleanCode}`,
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
    description: "Join the multi-day Naija Trivia League on Fey.",
  };
}

export default async function LeaguePage({
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
    pol?: string;
    tmode?: string;
    tim?: string;
    tot?: string;
    u?: string;
  }>;
}) {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const cleanCode = code?.toUpperCase().trim() || "LEAGUE";

  let league: FriendshipLeague | null = null;
  let scores: LeagueDailyScore[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch League
      const { data: leagueRow } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (leagueRow) {
        const baseLeague: FriendshipLeague = {
          id: leagueRow.id,
          code: leagueRow.code,
          title: leagueRow.title,
          creatorName: leagueRow.creator_name,
          creatorId: leagueRow.creator_id,
          durationDays: leagueRow.duration_days,
          startDate: leagueRow.start_date,
          endDate: leagueRow.end_date,
          questionsPerDay: leagueRow.questions_per_day,
          difficulty: leagueRow.difficulty,
          category: leagueRow.category,
          dailySeedMap: leagueRow.daily_seed_map,
          attemptPolicy: leagueRow.daily_seed_map?._policy || "flexible",
          timerMode: leagueRow.daily_seed_map?._timerMode || "per_question",
          questionTimerSeconds: leagueRow.daily_seed_map?._questionTimer || 25,
          totalDropSeconds: leagueRow.daily_seed_map?._totalDropSeconds || (leagueRow.questions_per_day * 30),
          unlockedUpToDay: Math.max(Number(leagueRow.daily_seed_map?._unlockedUpToDay) || 1, Number(sp?.u) || 1),
          createdAt: leagueRow.created_at,
        };

        // 2. Fetch Scores & League Sync Metadata
        const { data: scoreRows } = await supabase
          .from("league_scores")
          .select("*")
          .eq("league_code", cleanCode)
          .order("created_at", { ascending: true });

        const hydrated = hydrateLeagueFromScoreRows(baseLeague, scoreRows || []);
        league = hydrated.league;
        scores = hydrated.scores;
      }
    } catch {
      // Supabase unavailable or table not created yet
    }
  }

  // If not found in database, construct resilient deterministic fallback with query params or code seed
  if (!league) {
    const durationDays = [3, 5, 7, 14].includes(Number(sp?.d)) ? Number(sp.d) : 5;
    const questionsPerDay = [5, 10].includes(Number(sp?.q)) ? Number(sp.q) : 5;
    const title = sp?.t ? decodeURIComponent(sp.t) : `Friendship League (${cleanCode})`;
    const creatorName = sp?.c ? decodeURIComponent(sp.c) : "Scholar";
    const category = sp?.cat || "all";
    const difficulty = sp?.diff || "mixed";
    const attemptPolicy = (sp?.pol as any) || "flexible";
    const timerMode = (sp?.tmode as any) === "total_bank" ? "total_bank" : "per_question";
    const questionTimerSeconds = Number(sp?.tim) > 0 ? Number(sp.tim) : 25;
    const totalDropSeconds = Number(sp?.tot) > 0 ? Number(sp.tot) : (questionsPerDay * 30);
    const today = todayStr();

    league = {
      code: cleanCode,
      title,
      creatorName,
      creatorId: "creator",
      durationDays,
      startDate: today,
      endDate: formatDateToIso(addDaysToDate(new Date(), durationDays - 1)),
      questionsPerDay,
      difficulty,
      category,
      attemptPolicy,
      unlockedUpToDay: Number(sp?.u) > 0 ? Number(sp.u) : 1,
      timerMode,
      questionTimerSeconds,
      totalDropSeconds,
      dailySeedMap: generateDailyLeagueQuestions(
        durationDays,
        questionsPerDay,
        difficulty,
        category,
        cleanCode
      ),
    };
  }

  const status = getLeagueStatus(league.startDate, league.durationDays);
  const leaderboard = aggregateLeagueLeaderboard(scores, status.dayNumber);

  return (
    <LeagueArenaClient
      code={cleanCode}
      initialLeague={league}
      initialScores={scores}
      initialLeaderboard={leaderboard}
    />
  );
}

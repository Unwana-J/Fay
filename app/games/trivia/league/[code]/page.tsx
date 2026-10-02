import type { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type FriendshipLeague,
  type LeagueDailyScore,
  getLeagueStatus,
  aggregateLeagueLeaderboard,
  generateDailyLeagueQuestions,
} from "@/lib/trivia-league";
import LeagueArenaClient from "./LeagueArenaClient";
import { todayStr, formatDateToIso, addDaysToDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cleanCode = code?.toUpperCase().trim() || "LEAGUE";

  if (!isSupabaseConfigured || !supabase) {
    return {
      title: `🏆 Friendship Trivia League (${cleanCode}) · Fey`,
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
    title: `🏆 Friendship Trivia League (${cleanCode}) · Fey`,
    description: "Join the multi-day Naija Trivia League on Fey.",
  };
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
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
        league = {
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
          createdAt: leagueRow.created_at,
        };

        // 2. Fetch Scores
        const { data: scoreRows } = await supabase
          .from("league_scores")
          .select("*")
          .eq("league_code", cleanCode)
          .order("created_at", { ascending: true });

        scores = (scoreRows || []).map((row: any) => ({
          id: row.id,
          leagueCode: row.league_code,
          userId: row.user_id,
          username: row.username,
          avatar: row.avatar,
          dayNumber: row.day_number,
          date: row.date,
          score: row.score,
          totalQuestions: row.total_questions,
          points: row.points,
          durationSeconds: row.duration_seconds,
          questionResults: row.question_results || [],
          createdAt: row.created_at,
        }));
      }
    } catch {
      // Supabase unavailable or table not created yet
    }
  }

  // If not found in database, construct resilient deterministic fallback for this code
  if (!league) {
    const today = todayStr();
    league = {
      code: cleanCode,
      title: `Friendship League (${cleanCode})`,
      creatorName: "Scholar",
      creatorId: "creator",
      durationDays: 5,
      startDate: today,
      endDate: formatDateToIso(addDaysToDate(new Date(), 4)),
      questionsPerDay: 5,
      difficulty: "mixed",
      category: "all",
      dailySeedMap: generateDailyLeagueQuestions(5, 5, "mixed", "all"),
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

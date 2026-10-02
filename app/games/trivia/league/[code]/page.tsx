import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type FriendshipLeague,
  type LeagueDailyScore,
  getLeagueStatus,
  aggregateLeagueLeaderboard,
} from "@/lib/trivia-league";
import LeagueArenaClient from "./LeagueArenaClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cleanCode = code?.toUpperCase().trim();

  if (!isSupabaseConfigured || !supabase || !cleanCode) {
    return {
      title: "Friendship Trivia League · Fey",
      description: "Join the multi-day Naija Trivia League on Fey.",
    };
  }

  const { data: leagueRow } = await supabase
    .from("friendship_leagues")
    .select("title, creator_name, duration_days, start_date")
    .eq("code", cleanCode)
    .maybeSingle();

  if (!leagueRow) {
    return {
      title: "League Not Found · Fey",
      description: "This Friendship League could not be found.",
    };
  }

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

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = code?.toUpperCase().trim();

  if (!cleanCode) {
    notFound();
  }

  // Fallback if Supabase not configured
  if (!isSupabaseConfigured || !supabase) {
    const fallbackLeague: FriendshipLeague = {
      code: cleanCode,
      title: "Demo Friendship League",
      creatorName: "Scholar",
      creatorId: "demo-user",
      durationDays: 5,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      questionsPerDay: 5,
      difficulty: "mixed",
      category: "all",
      dailySeedMap: {},
    };

    return (
      <LeagueArenaClient
        initialLeague={fallbackLeague}
        initialScores={[]}
        initialLeaderboard={[]}
      />
    );
  }

  // Fetch League
  const { data: leagueRow, error: leagueError } = await supabase
    .from("friendship_leagues")
    .select("*")
    .eq("code", cleanCode)
    .maybeSingle();

  if (leagueError || !leagueRow) {
    notFound();
  }

  const league: FriendshipLeague = {
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

  // Fetch Scores
  const { data: scoreRows } = await supabase
    .from("league_scores")
    .select("*")
    .eq("league_code", cleanCode)
    .order("created_at", { ascending: true });

  const scores: LeagueDailyScore[] = (scoreRows || []).map((row: any) => ({
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

  const status = getLeagueStatus(league.startDate, league.durationDays);
  const leaderboard = aggregateLeagueLeaderboard(scores, status.dayNumber);

  return (
    <LeagueArenaClient
      initialLeague={league}
      initialScores={scores}
      initialLeaderboard={leaderboard}
    />
  );
}

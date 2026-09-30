-- ==============================================================================
-- FEY PLATFORM: TRIVIA SCORES & LIVE MULTIPLAYER LEADERBOARD
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create the trivia_scores table
create table if not exists public.trivia_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text not null,
  avatar text default '/avatars/avatar-scholar.svg',
  score integer not null,
  total integer not null,
  pct integer not null,
  grade_label text,
  xp_earned integer default 0,
  challenge_id text,
  question_ids text[],
  device_id text
);

-- 2. Enable Row Level Security (RLS)
alter table public.trivia_scores enable row level security;

-- 3. RLS Policies
-- Allow anyone (authenticated or anonymous) to view leaderboard scores
drop policy if exists "Allow public read access" on public.trivia_scores;
create policy "Allow public read access"
  on public.trivia_scores for select
  using (true);

-- Allow anyone to post their quiz scores
drop policy if exists "Allow public insert access" on public.trivia_scores;
create policy "Allow public insert access"
  on public.trivia_scores for insert
  with check (true);

-- 4. High-performance indexes for sorting & filtering
create index if not exists idx_trivia_scores_ranking on public.trivia_scores (pct desc, score desc, created_at desc);
create index if not exists idx_trivia_scores_challenge on public.trivia_scores (challenge_id);
create index if not exists idx_trivia_scores_username on public.trivia_scores (username);

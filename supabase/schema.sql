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

-- ==============================================================================
-- FEY PLATFORM: ARTICULATE MULTIPLAYER ROOMS
-- ==============================================================================

-- 5. Create articulate_rooms table for real-time multiplayer party game
create table if not exists public.articulate_rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  room_code text unique not null,
  host_id text not null,
  host_name text not null,
  status text not null default 'lobby', -- 'lobby', 'playing', 'round_end', 'game_over'
  locked boolean not null default false,
  settings jsonb not null default '{"timerSeconds": 60, "scoreGoal": 20, "categories": ["Object", "Nature", "Person", "Action", "World", "Random"], "difficulty": "mixed"}'::jsonb,
  teams jsonb not null default '{"teamA": {"name": "Team Alpha", "color": "#EF4444", "score": 0, "playerIds": []}, "teamB": {"name": "Team Omega", "color": "#3B82F6", "score": 0, "playerIds": []}}'::jsonb,
  current_turn jsonb default null,
  deck jsonb not null default '[]'::jsonb,
  current_word_index integer not null default 0,
  round_words_scored jsonb not null default '[]'::jsonb,
  round_words_passed jsonb not null default '[]'::jsonb,
  active_players jsonb not null default '[]'::jsonb,
  spectators jsonb not null default '[]'::jsonb
);

alter table public.articulate_rooms enable row level security;

drop policy if exists "Allow public read access on articulate_rooms" on public.articulate_rooms;
create policy "Allow public read access on articulate_rooms"
  on public.articulate_rooms for select
  using (true);

drop policy if exists "Allow public insert access on articulate_rooms" on public.articulate_rooms;
create policy "Allow public insert access on articulate_rooms"
  on public.articulate_rooms for insert
  with check (true);

drop policy if exists "Allow public update access on articulate_rooms" on public.articulate_rooms;
create policy "Allow public update access on articulate_rooms"
  on public.articulate_rooms for update
  using (true);

create index if not exists idx_articulate_rooms_code on public.articulate_rooms (room_code);
create index if not exists idx_articulate_rooms_updated on public.articulate_rooms (updated_at desc);

-- ==============================================================================
-- FEY PLATFORM: USER PROFILES & CROSS-DEVICE CLOUD SYNC
-- ==============================================================================

-- 6. Create user_profiles table linked to Supabase Auth users
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text not null,
  avatar text default '/avatars/avatar-scholar.svg',
  bio text default 'Building knowledge one topic at a time.',
  xp integer default 0,
  streak jsonb default '{"current": 0, "longest": 0, "total": 0, "lastDate": null, "shields": 1, "history": []}'::jsonb,
  settings jsonb default '{"enabledCategories": ["Artificial Intelligence", "Philosophy", "Psychology", "Economics", "History", "Physics"], "favoriteCategories": ["Artificial Intelligence", "Philosophy", "Psychology"], "favoriteTopics": [], "preferredDifficulty": "any", "difficultyMode": "Standard", "researchMin": 15, "speakingSec": 90, "mode": "roulette"}'::jsonb,
  unlocked_achievements text[] default '{}'::text[],
  claimed_quest_ids text[] default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- 7. Create completed_sessions table for synchronized vocal notes & recordings
create table if not exists public.completed_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id text not null,
  topic_text text not null,
  category text not null,
  difficulty text not null,
  date text not null,
  research_minutes integer default 0,
  speaking_seconds integer default 0,
  notes text default '',
  summary text default '',
  reflection jsonb default '{}'::jsonb,
  ratings jsonb default '{}'::jsonb,
  xp_earned integer default 0,
  tags text[] default '{}'::text[],
  audio_base64 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.completed_sessions enable row level security;

drop policy if exists "Users can view their own sessions" on public.completed_sessions;
create policy "Users can view their own sessions"
  on public.completed_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sessions" on public.completed_sessions;
create policy "Users can insert their own sessions"
  on public.completed_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sessions" on public.completed_sessions;
create policy "Users can update their own sessions"
  on public.completed_sessions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.completed_sessions;
create policy "Users can delete their own sessions"
  on public.completed_sessions for delete
  using (auth.uid() = user_id);

create index if not exists idx_completed_sessions_user on public.completed_sessions (user_id, date desc);

-- ==============================================================================
-- FEY PLATFORM: FRIENDSHIP LEAGUES & MULTI-DAY TOURNAMENTS
-- ==============================================================================

-- 8. Create friendship_leagues table
create table if not exists public.friendship_leagues (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  creator_name text not null,
  creator_id text not null,
  duration_days integer not null default 5,
  start_date text not null,
  end_date text not null,
  questions_per_day integer not null default 5,
  difficulty text not null default 'mixed',
  category text not null default 'all',
  daily_seed_map jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.friendship_leagues enable row level security;

drop policy if exists "Allow public read access on friendship_leagues" on public.friendship_leagues;
create policy "Allow public read access on friendship_leagues"
  on public.friendship_leagues for select
  using (true);

drop policy if exists "Allow public insert access on friendship_leagues" on public.friendship_leagues;
create policy "Allow public insert access on friendship_leagues"
  on public.friendship_leagues for insert
  with check (true);

-- 9. Create league_scores table for daily attempts & cumulative leaderboard
create table if not exists public.league_scores (
  id uuid primary key default gen_random_uuid(),
  league_code text references public.friendship_leagues(code) on delete cascade not null,
  user_id text not null,
  username text not null,
  avatar text default '/avatars/avatar-scholar.svg',
  day_number integer not null,
  date text not null,
  score integer not null,
  total_questions integer not null,
  points integer not null,
  duration_seconds integer default 0,
  question_results jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_league_user_day unique (league_code, user_id, day_number)
);

alter table public.league_scores enable row level security;

drop policy if exists "Allow public read access on league_scores" on public.league_scores;
create policy "Allow public read access on league_scores"
  on public.league_scores for select
  using (true);

drop policy if exists "Allow public insert access on league_scores" on public.league_scores;
create policy "Allow public insert access on league_scores"
  on public.league_scores for insert
  with check (true);

create index if not exists idx_league_scores_lookup on public.league_scores (league_code, day_number);
create index if not exists idx_league_scores_ranking on public.league_scores (league_code, points desc);

-- ==============================================================================
-- FEY VATAR / LAGOS LIFE INTEGRATION SCHEMA
-- Tables for tracking Vatar player profiles, inventories, and purchase delivery deduplication
-- ==============================================================================

-- 1. Vatar Player Profiles & Inventory
create table if not exists public.vatar_players (
  player_id text primary key, -- p_... or t_...
  mode text not null default 'live',
  display_name text not null,
  avatar text,
  scholar_points integer not null default 0,
  rounds_played integer not null default 0,
  best_round integer not null default 0,
  streak integer not null default 0,
  hints integer not null default 3, -- 3 starter hints
  seals integer not null default 0,
  owns_marathon boolean not null default false,
  verified boolean not null default false,
  seen_question_ids text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_vatar_players_points on public.vatar_players (scholar_points desc);

-- 2. Vatar Purchase Deliveries (Guarantees at-most-once delivery of items)
create table if not exists public.vatar_deliveries (
  purchase_id text primary key,
  player_id text not null references public.vatar_players(player_id) on delete cascade,
  product_id text not null,
  delivered_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_vatar_deliveries_player on public.vatar_deliveries (player_id);

-- 3. Vatar Completed Rounds Audit (1 row per finished round)
create table if not exists public.vatar_rounds (
  round_id text primary key,
  player_id text not null references public.vatar_players(player_id) on delete cascade,
  difficulty text not null,
  duration_s integer not null,
  score integer not null,
  total integer not null,
  pct integer not null,
  points_awarded integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_vatar_rounds_player on public.vatar_rounds (player_id, created_at desc);

-- Enable RLS
alter table public.vatar_players enable row level security;
alter table public.vatar_deliveries enable row level security;
alter table public.vatar_rounds enable row level security;

-- Policies: Server-side API only (via service_role or secure functions), public read for scholar profile
create policy "Public read for vatar players" on public.vatar_players for select using (true);

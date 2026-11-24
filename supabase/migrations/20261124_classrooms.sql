-- Fey Classrooms Schema (Small-Circle Collaborative Voice Challenges)
-- Note: lib/classroom-db.ts also includes automatic JSONB fallback to
-- `friendship_leagues` & `league_scores` if this migration has not been run yet.

CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  host_avatar TEXT DEFAULT '/avatars/avatar-scholar.svg',
  total_topics INTEGER NOT NULL DEFAULT 7,
  speaking_duration_sec INTEGER NOT NULL DEFAULT 90,
  research_duration_min INTEGER NOT NULL DEFAULT 10,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty TEXT NOT NULL DEFAULT 'Novice',
  max_members INTEGER NOT NULL DEFAULT 8,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  manual_unlocked_up_to_slot INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_code ON public.classrooms(code);
CREATE INDEX IF NOT EXISTS idx_classrooms_host_id ON public.classrooms(host_id);

CREATE TABLE IF NOT EXISTS public.classroom_submissions (
  id TEXT PRIMARY KEY,
  classroom_code TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT '/avatars/avatar-scholar.svg',
  topic_id TEXT NOT NULL,
  topic_text TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT,
  notes TEXT,
  heard_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  appreciations JSONB NOT NULL DEFAULT '{}'::jsonb,
  margin_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(classroom_code, slot_number, user_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_submissions_code
  ON public.classroom_submissions(classroom_code);

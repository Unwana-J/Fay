-- Fey practice reminders (Web Push subscriptions)
-- One row per browser/device subscription. The reminder scheduler (step 2) reads this table
-- to send at most one reminder per day, timed to `reminder_minutes` in the user's `timezone`,
-- and skips anyone whose `last_practiced_at` falls on today's local date.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id TEXT,
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  reminder_minutes INTEGER NOT NULL DEFAULT 1200 CHECK (reminder_minutes BETWEEN 0 AND 1439),
  streak INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  consecutive_ignored INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_enabled ON public.push_subscriptions(enabled) WHERE enabled;

-- Subscriptions contain device push credentials: no public access.
-- Only the server (service role key) reads and writes this table.
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

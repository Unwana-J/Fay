-- Fey scheduled league drop reminders
-- Tracks when a user last received an auto-scheduled league drop notification
-- so the 15-minute cron sends at most one league drop reminder per user per day.

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS last_league_sent_at TIMESTAMPTZ;

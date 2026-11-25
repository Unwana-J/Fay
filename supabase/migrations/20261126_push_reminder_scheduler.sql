-- Fey practice reminders — scheduler state (step 2)
-- Safe to run whether or not 20261125_push_subscriptions.sql has already been applied.

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_daily_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_risk_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_template TEXT,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- The scheduler only scans active, unpaused rows.
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active
  ON public.push_subscriptions(enabled)
  WHERE enabled AND paused_at IS NULL;

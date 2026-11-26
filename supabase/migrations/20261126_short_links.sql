-- First-party short links for Fey (/s/[code])
-- Replaces third-party TinyURL redirects so shared Podium decks, Notes, and
-- Trivia challenges stay on Fey's own domains and work cleanly on X, WhatsApp,
-- and LinkedIn.

CREATE TABLE IF NOT EXISTS public.short_links (
  code TEXT PRIMARY KEY,
  target_path TEXT NOT NULL,
  target_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS short_links_target_hash_idx
  ON public.short_links (target_hash);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of short_links" ON public.short_links;
CREATE POLICY "Allow public read of short_links"
  ON public.short_links
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert of short_links" ON public.short_links;
CREATE POLICY "Allow public insert of short_links"
  ON public.short_links
  FOR INSERT
  WITH CHECK (
    char_length(code) BETWEEN 4 AND 16
    AND left(target_path, 1) = '/'
    AND char_length(target_path) <= 32000
  );

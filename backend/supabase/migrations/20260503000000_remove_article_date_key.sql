-- ============================================================
-- Articles are selected by rolling curriculum week/day only.
-- Remove the fixed-calendar legacy date_key column.
-- ============================================================

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_date_key_key;

DROP INDEX IF EXISTS articles_date_key_key;

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS date_key;

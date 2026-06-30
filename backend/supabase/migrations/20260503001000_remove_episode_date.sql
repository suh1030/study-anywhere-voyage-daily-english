-- ============================================================
-- Episodes are selected by rolling curriculum week/day only.
-- Remove the fixed-calendar legacy date column.
-- ============================================================

DROP INDEX IF EXISTS episodes_date_key;

ALTER TABLE public.episodes
  DROP COLUMN IF EXISTS date;

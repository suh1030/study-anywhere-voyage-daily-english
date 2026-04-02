-- ============================================================
-- Add date column to episodes for 2026 daily curriculum mapping
-- ============================================================

ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS date TEXT;

-- Backfill existing rows using the 2026 schedule layout.
UPDATE public.episodes
SET date = (
  CASE
    WHEN week_number = 1 THEN
      to_char(make_date(2026, 1, 1) + (day_of_week - 1), 'YYYY-MM-DD')
    ELSE
      to_char(
        make_date(2026, 1, 5)
        + (((week_number - 2) * 7) + (day_of_week - 1)),
        'YYYY-MM-DD'
      )
  END
)
WHERE date IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS episodes_date_key
  ON public.episodes (date);

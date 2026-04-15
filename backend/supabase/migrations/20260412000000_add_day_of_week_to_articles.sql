-- ============================================================
-- Make articles addressable by rolling curriculum week/day
-- ============================================================

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER;

WITH ranked_articles AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY week_number
      ORDER BY date_key, created_at, id
    ) AS rn
  FROM public.articles
)
UPDATE public.articles AS articles
SET day_of_week = ranked_articles.rn
FROM ranked_articles
WHERE articles.id = ranked_articles.id
  AND articles.day_of_week IS NULL;

ALTER TABLE public.articles
  ALTER COLUMN day_of_week SET NOT NULL;

ALTER TABLE public.articles
  DROP CONSTRAINT IF EXISTS articles_day_of_week_check;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_day_of_week_check
  CHECK (day_of_week BETWEEN 1 AND 7);

CREATE UNIQUE INDEX IF NOT EXISTS articles_week_day_key
  ON public.articles (week_number, day_of_week);

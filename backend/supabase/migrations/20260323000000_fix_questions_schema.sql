-- 擴展 day_of_week 上限：舊架構每週 5 題，新架構每週最多 7 天
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_day_of_week_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_day_of_week_check
  CHECK (day_of_week BETWEEN 1 AND 7);

-- 建立 unique constraint 供 upsert on conflict 使用
CREATE UNIQUE INDEX IF NOT EXISTS questions_week_day_unique
  ON public.questions (week_number, day_of_week);

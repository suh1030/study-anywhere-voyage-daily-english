-- ============================================================
-- 修正 episodes 資料表：一週有 7 集，需要 day_of_week 欄位
-- ============================================================

-- 加入 day_of_week 欄位（預設 1，用於回填舊資料）
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER NOT NULL DEFAULT 1
  CHECK (day_of_week BETWEEN 1 AND 7);

-- 移除舊的 week_number UNIQUE 約束（改為複合唯一）
ALTER TABLE public.episodes
  DROP CONSTRAINT IF EXISTS episodes_week_number_key;

-- 建立複合唯一索引：(week_number, day_of_week)
CREATE UNIQUE INDEX IF NOT EXISTS episodes_week_day_unique
  ON public.episodes (week_number, day_of_week);

-- 更新查詢索引
CREATE INDEX IF NOT EXISTS idx_episodes_week_day
  ON public.episodes (week_number, day_of_week);

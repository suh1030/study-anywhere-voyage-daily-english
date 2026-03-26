-- ============================================================
-- 擴展 episodes 資料表以支援 W42–W53 (Phase 6)
-- ============================================================

-- 更新 week_number 約束：1–53
ALTER TABLE public.episodes
  DROP CONSTRAINT IF EXISTS episodes_week_number_check;

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_week_number_check
  CHECK (week_number BETWEEN 1 AND 53);

-- 更新 phase 約束：加入 'p6'
ALTER TABLE public.episodes
  DROP CONSTRAINT IF EXISTS episodes_phase_check;

ALTER TABLE public.episodes
  ADD CONSTRAINT episodes_phase_check
  CHECK (phase IN ('p1','p2','p3','p4','p5','p6'));

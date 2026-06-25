-- ── AI 英文老師：每日訊息用量計數 ─────────────────────────────
-- 純後端（service role）寫入，防止免費對話被濫用；UTC+8 當日重置。

CREATE TABLE IF NOT EXISTS public.tutor_daily_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day     DATE NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- 僅後端 service role 寫入；不開放前端直接讀寫（與 credits 模式一致）
ALTER TABLE public.tutor_daily_usage ENABLE ROW LEVEL SECURITY;

-- ── PostgreSQL 函式（SECURITY DEFINER，繞過 RLS） ────────────

-- 原子累加：upsert +1 並回傳新的 count，供 Edge Function 原子累加用量
CREATE OR REPLACE FUNCTION public.increment_tutor_usage(p_user_id UUID, p_day DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.tutor_daily_usage (user_id, day, count)
  VALUES (p_user_id, p_day, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET count = public.tutor_daily_usage.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_tutor_usage(UUID, DATE) TO service_role;

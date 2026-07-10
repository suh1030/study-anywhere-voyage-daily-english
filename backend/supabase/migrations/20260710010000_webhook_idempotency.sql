-- ── credits-webhook 冪等性（安全複審 H-1）─────────────────────
-- 問題：add_credits 每被呼叫一次就無條件加點。RevenueCat webhook 是
-- at-least-once 投遞，任何非 2xx 回應或逾時都會自動重送同一事件 →
-- 同一筆購買重複入帳；重放一則合法 webhook 亦可無限加點。
-- 修法：以 provider 事件唯一 id 去重，同一事件只入帳一次。

-- 1. 記錄來源事件 id（既有列為 NULL；UNIQUE 允許多個 NULL，不影響歷史資料）
ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS provider_event_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_provider_event_id_key
  ON public.credit_transactions(provider_event_id);

-- 2. 冪等加點：先以 provider_event_id 去重寫入交易，僅在實際插入時才加點。
--    同一事件重送 → no-op，回傳現有餘額與 credited=false。
CREATE OR REPLACE FUNCTION public.add_credits_idempotent(
  p_user_id     UUID,
  p_amount      INTEGER,
  p_description TEXT,
  p_event_id    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_rows        INTEGER;
BEGIN
  IF p_event_id IS NULL OR length(trim(p_event_id)) = 0 THEN
    RAISE EXCEPTION 'p_event_id is required for idempotent crediting';
  END IF;

  -- 去重寫入：同一 provider 事件只成功插入一次
  INSERT INTO public.credit_transactions (user_id, type, amount, description, provider_event_id)
  VALUES (p_user_id, 'purchase', p_amount, p_description, p_event_id)
  ON CONFLICT (provider_event_id) DO NOTHING;

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows = 0 THEN
    -- 已處理過此事件：不重複加點，回傳現有餘額
    SELECT balance INTO v_new_balance FROM public.credits WHERE user_id = p_user_id;
    RETURN jsonb_build_object('credited', false, 'balance', COALESCE(v_new_balance, 0));
  END IF;

  UPDATE public.credits
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  RETURN jsonb_build_object('credited', true, 'balance', COALESCE(v_new_balance, 0));
END;
$$;

-- 3. 權限：與 20260710000000 相同模式，僅 service_role 可執行
REVOKE EXECUTE ON FUNCTION public.add_credits_idempotent(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits_idempotent(UUID, INTEGER, TEXT, TEXT) TO service_role;

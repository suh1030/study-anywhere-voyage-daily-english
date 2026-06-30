-- ============================================================
-- SAV 初始 Schema
-- ============================================================

-- ── 內容資料表（靜態，公開可讀） ──────────────────────────────

CREATE TABLE public.episodes (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number  INTEGER NOT NULL UNIQUE CHECK (week_number BETWEEN 1 AND 41),
  theme        TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  phase        TEXT    NOT NULL CHECK (phase IN ('p1','p2','p3','p4','p5')),
  parts        JSONB   NOT NULL DEFAULT '[]',
  key_phrases  JSONB   NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.articles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  topic       TEXT NOT NULL,
  title       TEXT NOT NULL,
  word_count  INTEGER,
  text_en     TEXT NOT NULL,
  text_zh     TEXT NOT NULL,
  vocabulary  JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.flashcards (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source           TEXT    NOT NULL CHECK (source IN ('listen','speak')),
  week_number      INTEGER NOT NULL,
  english          TEXT    NOT NULL,
  chinese          TEXT    NOT NULL,
  example_sentence TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.questions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number    INTEGER NOT NULL,
  day_of_week    INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  question       TEXT NOT NULL,
  hint_zh        TEXT,
  structure_hint TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 使用者資料表（RLS 保護） ───────────────────────────────────

CREATE TABLE public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  settings     JSONB        NOT NULL DEFAULT '{"ttsSpeed":1.0,"showChineseDefault":false}',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE public.credits (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance    INTEGER     NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.credit_transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('purchase','deduct','restore')),
  amount      INTEGER     NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_progress (
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  completed_days JSONB       NOT NULL DEFAULT '{}',   -- {"day-001": true}
  mastered_cards JSONB       NOT NULL DEFAULT '[]',   -- ["card-id-1", ...]
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_flashcards_week ON public.flashcards(week_number);
CREATE INDEX idx_questions_week ON public.questions(week_number, day_of_week);
CREATE UNIQUE INDEX articles_week_day_key ON public.articles(week_number, day_of_week);

-- ── Trigger：新用戶自動建立 profile / credits / progress ──────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 0);

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── PostgreSQL 函式（SECURITY DEFINER，繞過 RLS） ────────────

-- 原子扣點：檢查餘額並扣 1 點，回傳 {success, balance}
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL OR v_balance < 1 THEN
    RETURN jsonb_build_object('success', false, 'balance', COALESCE(v_balance, 0));
  END IF;

  UPDATE public.credits
  SET balance = balance - 1, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'balance', v_balance - 1);
END;
$$;

-- 補償扣點：Anthropic API 失敗時還原 1 點
CREATE OR REPLACE FUNCTION public.restore_credit(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.credits
  SET balance = balance + 1, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- 增加點數（RevenueCat webhook 購買完成後呼叫）
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id    UUID,
  p_amount     INTEGER,
  p_description TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.credits
  SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'purchase', p_amount, p_description);

  RETURN v_new_balance;
END;
$$;

-- ── Row Level Security ────────────────────────────────────────

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- credits（唯讀，寫入僅透過 SECURITY DEFINER 函式）
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credits_select_own" ON public.credits FOR SELECT USING (auth.uid() = user_id);

-- credit_transactions（唯讀）
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select_own" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_select_own"  ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_update_own"  ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own"  ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 內容資料表（公開可讀，anon key 即可存取）
ALTER TABLE public.episodes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "episodes_public_read"   ON public.episodes   FOR SELECT USING (true);
CREATE POLICY "articles_public_read"   ON public.articles   FOR SELECT USING (true);
CREATE POLICY "flashcards_public_read" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "questions_public_read"  ON public.questions  FOR SELECT USING (true);

# SAV Backend

Supabase Edge Functions + PostgreSQL。無需維運獨立伺服器，全部透過 Supabase 運行。

## 架構

```
backend/
└── supabase/
    ├── config.toml                      # 本地開發設定
    ├── migrations/
    │   └── 20260320000000_initial_schema.sql   # DB schema + RLS + PG functions
    └── functions/
        ├── _shared/
        │   ├── cors.ts                  # CORS headers 工具
        │   └── supabase-client.ts       # User / Admin client 工廠
        ├── feedback/                    # AI 批改 + 原子扣點（需 JWT）
        ├── tutor-chat/                  # AI 英文老師多輪對話（需 JWT，Groq/OpenRouter）
        ├── credits-webhook/             # RevenueCat IAP 回調（HMAC 驗證）
        ├── progress-sync/               # 學習進度雲端同步（需 JWT）
        ├── content-episode/             # 取得 Podcast 集數（公開）
        └── content-article/             # 取得 Speak 朗讀文章（公開）
```

## API 端點

| 函式 | 方法 | 需要 JWT | 說明 |
|------|------|----------|------|
| `feedback` | POST | 是 | AI 批改，扣 1 點 |
| `tutor-chat` | POST | 是 | AI 英文老師多輪對話，每日 30 則上限（不扣點） |
| `credits-webhook` | POST | 否（HMAC） | RevenueCat 購買回調 |
| `progress-sync` | POST | 是 | 上傳/下載學習進度 |
| `content-episode` | GET | 否 | 取得 Podcast 集數 |
| `content-article` | GET | 否 | 取得 Speak 朗讀文章 |

> 信用點數查詢（`credits`）、字卡（`flashcards`）、題目（`questions`）直接使用 Supabase JS client 查詢，不需要額外 Edge Function。

## 部署前必做（Supabase Dashboard）

### 1. 啟用 Auth Providers
- Authentication → Providers → **Apple**：填入 client_id / team_id / key_id / secret
- Authentication → Providers → **Google**：填入 client_id / secret

### 2. 設定環境變數
在 Project Settings → Edge Functions → Secrets 新增：

| 變數名 | 取得方式 |
|--------|----------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `GROQ_API_KEY` | console.groq.com → API Keys（`tutor-chat` 優先使用） |
| `GROQ_MODEL` | 選填，預設 `llama-3.3-70b-versatile` |
| `OPENROUTER_API_KEY` | openrouter.ai → Keys（`tutor-chat` 最後備援） |
| `OPENROUTER_FALLBACK_MODEL` | 選填，預設 `openrouter/free` |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat Dashboard → Webhooks → Shared Secret |

### 3. 設定 RevenueCat Webhook URL
RevenueCat Dashboard → Webhooks → 新增：
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/credits-webhook
```

## 本地開發

### 前置需求
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker Desktop

### 步驟

```bash
# 1. 安裝 Supabase CLI
brew install supabase/tap/supabase

# 2. 進入 backend 目錄
cd backend

# 3. 啟動本地 Supabase（Docker）
supabase start

# 4. 套用 migration（建立所有資料表）
supabase db reset

# 5. 建立 .env.local（本地測試用）
cp .env.example .env.local
# 填入 ANTHROPIC_API_KEY 和 REVENUECAT_WEBHOOK_SECRET

# 6. 本地測試特定 Edge Function
supabase functions serve feedback --env-file .env.local
```

`.env.example`：
```
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_FALLBACK_MODEL=openrouter/free
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret
```

## 部署

```bash
# 1. 連結到 Supabase 雲端專案
supabase link --project-ref YOUR_PROJECT_REF

# 2. 推送 DB migration
supabase db push

# 3. 部署所有 Edge Functions
supabase functions deploy

# 4. 設定 Secrets（或在 Dashboard 手動設定）
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase secrets set OPENROUTER_MODEL=openai/gpt-oss-120b:free   # 選填
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your-secret
```

部署後的 Base URL：
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/
```

## 安全性說明

| 機制 | 說明 |
|------|------|
| Row Level Security (RLS) | 所有用戶資料表啟用，用戶只能讀寫自己的資料 |
| SECURITY DEFINER functions | 點數扣除/增加透過 PG function 執行，防止 race condition |
| JWT 驗證 | 所有需要身份的 Edge Function 驗證 Supabase JWT |
| HMAC-SHA256 | credits-webhook 驗證 RevenueCat 簽名，防止偽造 |
| Service Role Key | 僅用於 Edge Functions 後端，不暴露給客戶端 |

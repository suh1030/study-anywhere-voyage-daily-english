# SAV Daily English — Development Progress

> Last updated: 2026-03-26（後端全面就緒：Migrations 部署、7 支 Edge Functions 部署、DB 全資料 Seed 完成；App 功能全部實作）
> Purpose: 讓新 session 的 AI 快速了解已完成的工作和待辦事項

---

## Project Overview

SAV Daily English 是一款付費英語學習 App（NT$60），目標上架 Apple App Store + Google Play。
包含五大模組：Schedule / Listen / Speak / Conversation / Review。
技術棧：Expo (React Native) + Supabase (Auth + PostgreSQL + Edge Functions) + Cloudflare R2 (音訊 CDN) + RevenueCat (IAP)。

---

## Completed (已完成)

### Phase 0 — 環境設置
- [x] 建立 Supabase 帳號 + 專案（project ref: `ioosxzbdkscllgesmeqw`，region: Asia-Pacific）
- [x] Supabase CLI 安裝 + `supabase link` 連結完成
- [x] Monorepo 目錄結構建立（`/app` + `/backend` + `/content`）

### Phase 1 — 後端（全部完成 + 已部署至雲端）
- [x] DB schema migration：8 張資料表 + 3 個 index + RLS policies
  - 用戶：`profiles`, `credits`, `credit_transactions`, `user_progress`
  - 內容：`episodes`, `articles`, `flashcards`, `questions`
- [x] PostgreSQL functions（SECURITY DEFINER）：
  - `deduct_credit` — 原子扣點
  - `restore_credit` — API 失敗補償
  - `add_credits` — 購買增點
- [x] Trigger：`on_auth_user_created` — 新用戶自動建立 profile + credits + progress
- [x] **7 支 Edge Functions 部署至雲端**（2026-03-26）：
  - `feedback` — AI 批改（JWT + 扣點 + Claude Haiku）
  - `credits-webhook` — RevenueCat IAP webhook（HMAC 驗證）
  - `progress-sync` — 學習進度雲端同步
  - `content-episode` — Podcast 集數 API
  - `content-article` — Speak 文章 API
  - `content-flashcards` — 字卡 API
  - `content-questions` — 對話題目 API
- [x] **DB migrations 部署**（2026-03-26）：3 支 migrations 推至雲端（W42–W53 擴展、day_of_week、questions schema fix）
- [x] **DB 全資料 Seed 完成**（2026-03-26）：episodes 365 筆、articles 365 筆、flashcards 586 筆、questions 265 筆
- [x] Supabase config.toml（DB v17、Apple/Google auth placeholder）
- [x] Backend README（部署指南 + 安全說明）

### Phase 3 — React Native App 基礎
- [x] Expo 專案初始化（blank-typescript template，SDK 55）
- [x] 核心依賴安裝：
  - `@react-navigation/native` + `@react-navigation/bottom-tabs`
  - `@supabase/supabase-js` + `expo-secure-store`（JWT 安全儲存）
  - `zustand`（狀態管理）
  - `expo-av`（音訊播放 + 錄音）
  - `react-native-svg`（Tab icons）
  - `react-native-url-polyfill`
- [x] Design System：`src/constants/theme.ts`（色彩、字型、spacing、typography — 對應 prototype CSS）
- [x] Supabase client：`src/lib/supabase.ts`（SecureStore adapter）
- [x] `.env` 已建立（EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY）
- [x] Zustand stores：
  - `authStore.ts` — session / signIn / signUp / signOut
  - `creditsStore.ts` — balance / requestFeedback（呼叫 feedback Edge Function）
  - `progressStore.ts` — completedDays / masteredCards / sync / load
- [x] Navigation：`TabNavigator.tsx` — 5 tab 底部導覽列，SVG icons（規格書路徑），各 tab 獨立 accent color
- [x] Auth flow：`App.tsx` — session 建立後自動 load progress + fetchBalance，Auth guard
- [x] Auth UI：`AuthScreen.tsx` — Email 登入/註冊（SAV 品牌風格）

### Phase 4 — 五大功能模組
- [x] **Schedule**：課程列表、按 Phase 分組、展開/收合、每日**三行**顯示（Listen/Conversation/Speak 各可點擊導航）、打勾、統計、進度條、Reset 雙重確認（3 秒超時）、自動捲動至今日
- [x] **Review**：字卡網格（2 列）、點擊翻面（英↔中+例句）、來源標籤 dot（Listen 藍/Speak 紅）、篩選器（All/Listen/Speak/Mastered/Learning）、長按標記掌握
- [x] **Listen**：Episode header、播放控制列（Play/Prev/Next/Speed/中文切換）、逐行腳本（Speaker name + EN + ZH + vocab tags）、點擊跳轉行、Key Phrases 面板
- [x] **Speak**：文章 header（日期/主題/字數）、雙語段落交替、中文切換、段落點擊高亮、**真實錄音**（expo-av）/停止/回放/暫停、生詞面板
- [x] **Conversation**：問題卡片（EN+ZH+hint）、答案輸入框、AI 批改（JWT + 扣點 + Edge Function）、批改結果渲染

### Phase 4.5 — 資料層接 Supabase（樣本資料已移除）
- [x] `src/data/content-api.ts` — fetchArticle / fetchEpisode / fetchFlashcards / fetchQuestion
- [x] 所有內容畫面從 Supabase DB 讀取真實資料（loading / empty states）
- [x] `curriculum.ts` 全面更新：53 週 CURRICULUM、365 天 SCHEDULE（1/1–12/31）、每天含 dayOfWeek、W1/W53 = 4 天
- [x] ScheduleScreen → 內容 Tab 導航（tapping day row 跳轉對應 tab）
- [x] Bug fixes：顏色語意修正（speak↔conversation 對調）、CurriculumWeek.phase 加入 p6

---

## TODO (待辦)

### Phase 2 — 內容生成（舊架構 W1–W41 已完成，新架構待補）

> ⚠️ 架構已重大更新：產品改為全年 365 天每日三模組，週次擴展至 W1–W53。
> 以下為舊架構完成紀錄，新架構待辦見 Phase 2.5。

#### 舊架構已完成（W1–W41，每週 1 集 Podcast）
- [x] Podcast Episode 錨點集數 W2–W41（40 集，格式：每週 1 集，5 部分 × 8 行）
  - `content/episodes/episode-02.ts` 至 `episode-41.ts`
  - 注意：episode-01.ts 遺失，內容需補建至新架構的 week-02.ts Day1
- [x] Speak 文章 W1–W41（287 篇）
  - `content/articles/articles-w01.ts` 至 `articles-w41.ts`
  - 每週 7 篇，主題輪替：Thu=Technology, Fri=Science, Sat=Business, Sun=Travel, Mon=AI, Tue=Innovation, Wed=Society
- [x] Conversation 題目 W1–W41（205 題，每週 5 題）
  - `content/questions/conversations-w01-w08.ts` 至 `conversations-w33-w41.ts`
- [x] Review 字卡 W1–W41（~451 張，每週 ~11 張）
  - `content/flashcards/flashcards-w01-w08.ts` 至 `flashcards-w33-w41.ts`
### Phase 2.5 — 內容擴展（新架構 W1–W53，全年 365 天）

> 目標：完成全年每日三模組內容，支援 1/1–12/31 完整課程

#### Episode 架構遷移
- [x] 更新 `Episode` TypeScript interface（新增 `dayOfWeek: number`、`date: string`，phase 加入 `'p6'`）
- [x] 建立 `content/episodes/index.ts`（`getEpisodeByDate`、`getWeekEpisodes`、`getDateRange`、`getWeekLength` 工具函式，W01–W53 全部 import）
- [x] 將舊 `episode-02.ts`~`episode-41.ts` 合併重組為週模組格式 `week-XX.ts`（各集作為 Day 1）→ `week-03.ts`~`week-43.ts`
- [x] 補建 `week-01.ts`（W1：1/1–1/4，4 集，主題：New Year & Fresh Starts）
- [x] 補建 `week-02.ts`（W2：1/5–1/11，7 集，主題：Morning Routines）
- [x] 補建 `week-05.ts`（W5：1/26–2/1，7 集，主題：Celebrations & Festivals，春節週）
- [x] 補建 `week-44.ts`（Creativity & Self-Expression，10/26–11/1，7 集）
- [x] 補建 `week-45.ts`（Leadership & Influence，11/2–11/8，7 集）
- [x] 補建 `week-46.ts`（Community & Giving Back，11/9–11/15，7 集）
- [x] 補建 `week-47.ts`（Cross-Cultural Understanding，11/16–11/22，7 集）
- [x] 補建 `week-48.ts`（Language & Identity，11/23–11/29，7 集）
- [x] 補建 `week-49.ts`（Rest & Renewal，11/30–12/6，7 集）
- [x] 補建 `week-50.ts`（Gratitude & Appreciation，12/7–12/13，7 集）
- [x] 補建 `week-51.ts`（Goals & Intentions，12/14–12/20，7 集）
- [x] 補建 `week-52.ts`（Year in Review，12/21–12/27，7 集）
- [x] 補建 `week-53.ts`（New Beginnings，12/28–12/31，4 集）
- [x] W3–W43 各週 Day 1–7 全部完成（Codex 已生成，每週 7 集）

#### 其他內容補建
- [x] Speak 文章 W42–W53 全部完成（每週 7 篇；W53 僅 4 篇）→ `content/articles/articles-w42.ts` 至 `articles-w53.ts`
  - W42–W49：每週補建 Travel + AI&Future/Innovation 2 篇（原已有 5 篇）
  - W50–W52：完整 7 篇（Technology/Science/Business/Travel/AI&Future/Innovation/Society）
  - W53（New Beginnings）：4 篇（Technology/Science/Business/Travel）
- [x] Conversation 題目 W42–W53 → `content/questions/conversations-w42-w53.ts`（Codex 已完成）
- [x] Review 字卡 W42–W53 → `content/flashcards/flashcards-w42-w53.ts`（Codex 已完成）

#### App 資料層更新
- [x] 更新 `src/data/curriculum.ts`：53 週 CURRICULUM + 365 天 SCHEDULE（1/1–12/31，W1/W53=4天）
- [x] 更新 Schedule 模組顯示邏輯（W1/W53 為 4 天不完整週）

---

- [ ] 用 OpenAI TTS（tts-1 model）批次生成所有 Episode 音訊 mp3（每行一個檔）← 需 OpenAI 帳號
- [ ] 建立 Cloudflare R2 bucket + 上傳音訊檔 ← 需 Cloudflare 帳號
- [x] DB seeding 腳本：`scripts/seed.ts`（`npm run seed`，需 SUPABASE_SERVICE_ROLE_KEY）
  - 自動 re-map 文章日期至 2026 實際日曆
  - 新增 migration `20260323000000_fix_questions_schema.sql`（day_of_week 1-7 + unique constraint）
- [x] App 模組從 sample data 切換為從 Supabase API 讀取真實資料（content-api.ts）

### Phase 3 補完 — App 功能補齊
- [x] Sign in with Apple 整合（`expo-apple-authentication` + `expo-crypto` SHA-256 nonce + `supabase.auth.signInWithIdToken`）
- [x] Google Sign In 整合（`expo-auth-session` + `expo-web-browser` OAuth → `supabase.auth.signInWithOAuth`）← 需填入 Google Client ID
- [x] RevenueCat SDK 整合（`react-native-purchases`：init / purchaseCredits / balance 刷新，ConversationScreen Buy Credits UI）← 需填入 EXPO_PUBLIC_REVENUECAT_API_KEY
- [ ] expo-av 音訊播放整合（Listen 模組從 R2 載入 mp3）← 需 TTS 音訊檔 + R2 就位
- [x] expo-av 錄音功能整合（Speak 模組錄音 + 本地回放）
- [x] **expo-speech TTS 整合**（ListenScreen + SpeakScreen）：
  - ListenScreen：點擊任一行 → TTS 朗讀，Speed 切換（0.75/1.0/1.25x）即時重播
  - SpeakScreen：點擊段落 / PLAY 按鈕 → TTS 朗讀，錄音前自動 stop speech
  - 清理：unmount 時 Speech.stop()；録音開始前 Speech.stop()
  - 套件：`expo-speech ~13.0.1`（裝置原生 TTS，免費、離線）
- [x] **ProfileModal**（`src/components/ProfileModal.tsx`）：
  - 顯示登入 email、credits 餘額、Sign Out 按鈕
  - 從 ScheduleScreen header 右上角觸發（credits 有餘額時顯示 "X CR"，否則顯示 "PROFILE"）
  - 登入後自動 fetchBalance()
- [x] 進度同步觸發時機（App 啟動 / 登入後 load）
- [x] Credits balance 初始化（登入後 fetchBalance）
- [x] 進度同步：App 進入背景時 sync（AppState listener）
- [x] 離線快取策略（AsyncStorage cache-first：fetchArticle/fetchEpisode/fetchFlashcards/fetchQuestion）

### Phase 6 — EAS Build & 送審
- [x] EAS Build 設定（`eas.json` — development/preview/production profiles，`app.json` 完整 bundle ID / permissions / dark mode / expo-av plugin）
- [x] `expo-speech` + 所有依賴已安裝（`npm install` 完成）
- [ ] `eas login` + `eas init` 取得真實 EAS project ID（替換 `app.json` 中 `YOUR_EAS_PROJECT_ID`）← 需在終端互動式登入
- [ ] TestFlight 內部測試
- [ ] 完整功能測試（重點：IAP 購買、點數扣除、音訊播放、錄音、Auth flow）
- [ ] App Store Connect 送審
- [ ] Google Play Console 送審

### Phase 5 — 法律文件 & 上架材料
- [ ] 撰寫隱私政策（涵蓋：帳號資料、錄音說明、Anthropic API 資料傳輸、RevenueCat、Supabase）
- [ ] 撰寫使用條款
- [ ] 架設隱私政策靜態頁面（GitHub Pages，免費）
- [ ] App Store 截圖製作（iPhone 6.7" + iPad）
- [ ] App Store / Google Play 描述文案（中文 + 英文）
- [ ] Privacy Nutrition Labels 填寫
- [ ] Apple 審核測試帳號設定（含測試點數）


### Owner TODO（使用者需自行處理）
- [x] Apple Developer Program 已購買（savelyn.siao@gmail.com，2026-03-20）
- [x] EAS CLI 已安裝（`eas-cli` global）
- [ ] 申請 Google Play Console（$25 USD 一次）— 送審前必須
- [ ] 上架前申請 Apple Small Business Program（15% 抽成，免費申請）
- [ ] 上架前申請 Google Play 小開發者方案（15% 抽成）
- [ ] 建立 Cloudflare 帳號（R2 音訊 CDN，免費方案）
- [ ] 建立 OpenAI 帳號（TTS 生成，一次性費用約 $3-5 USD）
- [ ] 建立 RevenueCat 帳號（IAP 管理，免費方案）
- [ ] 建立 Anthropic 帳號（AI 批改 API）
- [ ] 在 Supabase Dashboard 設定環境變數：ANTHROPIC_API_KEY、REVENUECAT_WEBHOOK_SECRET

---

## Key Architecture Decisions（重要設計決策）

| 決策 | 選擇 | 原因 |
|------|------|------|
| 定價 | NT$60（一次買斷） | Apple 標準定價層，對應 $1.99 USD |
| AI 模型 | Claude Haiku 4.5 | 對話批改夠用，成本比 Sonnet 低 75% |
| TTS | OpenAI TTS 預生成 → R2 | 一次性 $3-5，品質一致，不依賴裝置 |
| 登入方式 | Email + Apple Sign In + Google Sign In | Apple 強制要求 Sign in with Apple |
| IAP 整合 | RevenueCat | 免費版支援 < NT$75,000 月收，抽象化 Apple/Google 雙平台 |
| 後端 | Supabase Edge Functions (Deno) | 免費 tier 足夠 v1，冷啟動 < 200ms |
| 狀態管理 | Zustand | 輕量、不需 Provider wrapper |
| 監控 | Supabase Dashboard + Cloudflare Analytics | 免費，到達上限會自動通知 |
| 內容策略 | 全年 365 天（1/1–12/31），W1–W53（53 週），每天 Listen+Conversation+Speak | 完整年度日曆課程，上架即提供全年內容 |
| Episode 檔案格式 | Weekly Module（`week-01.ts`~`week-53.ts`），每檔含 4 或 7 集陣列 | 53 檔 vs 365 檔，業界最佳實踐，維護成本低，支援週主題聚合查詢 |

---

## File Structure

```
study-anywhere-voyage-daily-english/
├── SAV-spec-zh.md                 # 產品規格書
├── SAV-ssd-zh.md                  # 系統設計文件
├── SAV-dev-progress.md            # ← 本檔案
├── SAV-owner-todo.md              # 使用者待辦事項
├── daily-english-app-prototype.html  # HTML prototype（設計參考）
├── backend/
│   ├── README.md
│   └── supabase/
│       ├── config.toml
│       ├── migrations/
│       │   └── 20260320000000_initial_schema.sql
│       └── functions/
│           ├── _shared/cors.ts, supabase-client.ts
│           ├── feedback/index.ts
│           ├── credits-webhook/index.ts
│           ├── progress-sync/index.ts
│           ├── content-episode/index.ts
│           └── content-article/index.ts
├── app/
│   ├── App.tsx                    # 入口：Auth guard → Tab Navigator
│   ├── .env                       # Supabase credentials
│   └── src/
│       ├── constants/theme.ts     # Design System
│       ├── lib/supabase.ts        # Supabase client
│       ├── lib/cache.ts           # AsyncStorage cache-first helpers (offline support)
│       ├── stores/                # Zustand stores (auth, credits, progress)
│       ├── data/                  # Sample data (curriculum, episode, flashcards)
│       ├── navigation/TabNavigator.tsx
│       ├── components/
│       │   └── ProfileModal.tsx        # 用戶資料 + 登出 Modal（從 ScheduleScreen 觸發）
│       └── screens/
│           ├── auth/AuthScreen.tsx
│           └── tabs/ (Schedule, Listen, Speak, Conversation, Review)
└── content/                       # 課程內容檔
    ├── episodes/
    │   ├── index.ts               # getEpisodeByDate, getWeekEpisodes
    │   ├── week-01.ts             # W1: 1/1–1/4（4 集）New Year & Fresh Starts
    │   ├── week-02.ts             # W2: 1/5–1/11（7 集）Morning Routines
    │   ├── ...
    │   └── week-53.ts             # W53: 12/28–12/31（4 集）New Beginnings
    ├── articles/
    │   ├── articles-w01.ts ~ articles-w53.ts
    ├── flashcards/
    │   ├── flashcards-w01-w08.ts ~ flashcards-w42-w53.ts
    └── questions/
        ├── conversations-w01-w08.ts ~ conversations-w42-w53.ts
```

# Notch Up! — Development Progress

> 現行產品名稱：**Notch Up!**；商店名稱：**Notch Up: Daily English**；母品牌：**Study Anywhere Voyage**。本文中的 SAV Daily English 僅屬舊紀錄。

> Last updated: 2026-07-05（文件整併：併入 owner-todo 剩餘待辦；修正 File Structure；反映 Polaris AI 老師、Schedule/Tally 重設計、Notch Up 品牌重塑已完成）
> Purpose: 讓新 session 的 AI 快速了解已完成的工作和待辦事項
>
> ⚠️ 2026-06 之後的重大 feature（Polaris 浮動 AI 英文老師、Schedule/Tally-stick 重設計、品牌重塑）已實作，設計文件見 `docs/superpowers/specs/` 與 `docs/superpowers/ssd/`。細節仍以 git log 為準。
> 後端 hosting/成本決策見 [backend-hosting-decision.md](./backend-hosting-decision.md)（Supabase Pro + Cloudflare R2）。

---

## Project Overview

Notch Up! 是一款付費英語學習 App（商店名稱：Notch Up: Daily English），目標上架 Apple App Store + Google Play。
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
- [x] Navigation：`TabNavigator.tsx` — 6 tab 頂部導覽列（Schedule/Listen/Conv/Speak/Review/Account），SVG icons，各 tab 獨立 accent color，Account tab 為 icon only
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
- [x] `curriculum.ts` 全面更新：53 週 CURRICULUM、365 天 SCHEDULE、每天含 dayOfWeek、W1/W53 = 4 天
- [x] ScheduleScreen → 內容 Tab 導航（tapping day row 跳轉對應 tab）
- [x] Bug fixes：顏色語意修正（speak↔conversation 對調）、CurriculumWeek.phase 加入 p6

### Phase 4.6 — 內容檔同步與驗證（2026-03-29）
- [x] `content/episodes/week-01.ts` 至 `week-53.ts` 依 365 天架構重新生成並覆蓋
- [x] `content/articles/articles-w01.ts` 至 `articles-w53.ts` 全部對齊新版 episodes
- [x] `content/questions/conversations-w01-w08.ts` 至 `conversations-w42-w53.ts` 全部重建為每日 365 題
- [x] `content/flashcards/flashcards-w01-w08.ts` 至 `flashcards-w42-w53.ts` 全部重建，現況共 583 張
- [x] 新增 `scripts/regenerate-supporting-content.js` 與 `scripts/validate-supporting-content.js`
- [x] 本地內容驗證完成：365 episodes、365 articles、365 questions、583 flashcards
- [x] 完成產品內容全量稽核：365 天 `SCHEDULE` 與 episodes / articles / questions / flashcards 全數對齊，無缺日、缺週、缺欄位
- [x] 確認 App 四個內容模組的讀取邏輯均已接到 Supabase 內容表（`episodes` / `articles` / `questions` / `flashcards`）

### Phase 4.7 — 長篇 Podcast 重寫與重新同步（2026-03-30）
- [x] podcast 重新改寫為接近 10 分鐘版本：每集 `6 parts / 48 lines / 8–10 vocab`
- [x] `scripts/regenerate-episodes.js` 與 `scripts/validate-episodes.js` 已更新為長篇規格
- [x] 新版 episodes 本地驗證通過：365 集、17,520 行、角色 phase / 禁用詞 / vocab 對位皆通過
- [x] Supabase 內容資料已重新同步：episodes 365、articles 365、questions 365、flashcards 583
- [x] 廢止 `episodes.date` 固定日曆欄位；episodes 改以 `week_number + day_of_week` 對應 rolling curriculum
- [x] 舊短版 podcast 音檔已自 Storage 清除，避免新舊內容混播
- [x] 新版長篇 podcast 音檔重新生成並上傳至 Supabase Storage（`episode-audio/tts/`）：17,520 個 mp3，missingCount: 0，已驗證（2026-04-03）

### Phase 4.9 — UI 重構與細節修正（2026-04-06）
- [x] 新增 **Account tab**（獨立帳號管理頁）：credits 餘額顯示、購買點數、登出確認、LEGAL 連結（隱私政策 / 使用條款）、版本號
- [x] **ProfileModal 移除**：帳號功能全移至 Account tab，ScheduleScreen 右上角不再有 Profile 按鈕
- [x] **TabNavigator 重構**：6 tabs（SCHED / LISTEN / CONV / SPEAK / REVIEW / Account icon）、icon 對齊用固定容器、tab bar 移除 padding 貼邊、Account tab 灰色
- [x] **dayLabelBar 統一**：Listen / Conversation / Speak 三個 tab 頂端顯示相同位置/字體的 `W01 · Day N · MM/DD`
- [x] **CR badge 整合**：Conversation tab 的 credits badge 移至 dayLabelBar 右側（與日期同行、有金色框）
- [x] **header 間距對稱**：Listen / Speak header paddingVertical 統一
- [x] **auth 改善**：登入錯誤訊息細分（帳號不存在 / 密碼錯誤 / 信箱未驗證）；Apple/Google 按鈕高度統一
- [x] **curriculum rolling schedule**：改為以使用者 `profiles.settings.curriculumStartDate` 為起點動態生成

### Phase 4.8 — 內容安全稽核（2026-04-03）
- [x] 新增 `scripts/validate-content-safety.js`，可重跑檢查活躍內容檔的年齡分級風險
- [x] 完成活躍內容全量安全稽核：118 個內容檔未命中暴力、色情、毒品、酒精、自傷、仇恨、粗口、賭博、吸菸等高風險項目
- [x] 確認 `fight`、`body image`、`partner` 等詞彙在目前內容中屬於生活／心理主題語境，不屬於成人或暴力導向內容

---

## TODO (待辦)

### Phase 2 — 內容生成（舊架構 W1–W41 已完成，新架構待補）

> ⚠️ 架構已重大更新：產品改為全年 365 天每日三模組，週次擴展至 W1–W53。
> 以下為舊架構完成紀錄，新架構待辦見 Phase 2.5。

#### 舊架構已完成（W1–W41，每週 1 集 Podcast）
- [x] Podcast Episode 錨點集數 W2–W41（40 集，舊格式：每週 1 集，5 部分 × 8 行）⚠️ 已被新版長篇格式取代（現行為 365 集、每集 6 parts / 48 lines）
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

> 目標：完成全年每日三模組內容，支援每位使用者從 Day 1 開始的完整 365 天課程

#### Episode 架構遷移
- [x] 更新 `Episode` TypeScript interface（新增 `dayOfWeek: number`；`date` 僅作 legacy/reference；phase 加入 `'p6'`）
- [x] 建立 `content/episodes/index.ts`（`getEpisode`、`getWeekEpisodes`、`getWeekLength` 工具函式，W01–W53 全部 import）
- [x] 將舊 `episode-02.ts`~`episode-41.ts` 合併重組為週模組格式 `week-XX.ts`（各集作為 Day 1）→ `week-03.ts`~`week-43.ts`
- [x] 補建 `week-01.ts`（Fresh Starts，4 集；rolling curriculum W1，不代表任何固定日曆日期限定內容）
- [x] 補建 `week-02.ts`（Morning Routines，7 集；rolling curriculum W2）
- [x] 補建 `week-05.ts`（Traditions & Gatherings，7 集；rolling curriculum W5，一般聚會與傳統主題，不綁定任何固定日曆事件日期）
- [x] 補建 `week-44.ts`（Creativity & Self-Expression，7 集；rolling curriculum W44）
- [x] 補建 `week-45.ts`（Leadership & Influence，7 集；rolling curriculum W45）
- [x] 補建 `week-46.ts`（Community & Giving Back，7 集；rolling curriculum W46）
- [x] 補建 `week-47.ts`（Cross-Cultural Understanding，7 集；rolling curriculum W47）
- [x] 補建 `week-48.ts`（Language & Identity，7 集；rolling curriculum W48）
- [x] 補建 `week-49.ts`（Rest & Renewal，7 集；rolling curriculum W49）
- [x] 補建 `week-50.ts`（Gratitude & Appreciation，7 集；rolling curriculum W50）
- [x] 補建 `week-51.ts`（Goals & Intentions，7 集；rolling curriculum W51）
- [x] 補建 `week-52.ts`（Year in Review，7 集；rolling curriculum W52）
- [x] 補建 `week-53.ts`（New Beginnings，4 集；rolling curriculum W53）
- [x] W3–W43 各週 Day 1–7 全部完成（Codex 已生成，每週 7 集）

#### 其他內容補建
- [x] Speak 文章 W1–W53 全部完成並重新對齊新版 episodes → `content/articles/articles-w01.ts` 至 `articles-w53.ts`
- [x] Conversation 題目 W1–W53 全部完成並重建為每日 365 題 → `content/questions/conversations-w01-w08.ts` 至 `conversations-w42-w53.ts`
- [x] Review 字卡 W1–W53 全部完成並重建為全年版本 → `content/flashcards/flashcards-w01-w08.ts` 至 `flashcards-w42-w53.ts`

#### App 資料層更新
- [x] 更新 `src/data/curriculum.ts`：53 週 CURRICULUM + 365 天 SCHEDULE（rolling curriculum，W1/W53=4天）
- [x] 更新 Schedule 模組顯示邏輯（W1/W53 為 4 天不完整週）

---

- [x] 用 OpenAI TTS（`tts-1`）批次生成所有 Episode 音訊 mp3（每行一個檔，本地已完成）
- [ ] 建立 Cloudflare R2 bucket + 上傳音訊檔 ← 需 Cloudflare 帳號
- [x] DB seeding 腳本：`scripts/seed.ts`（`npm run seed`，需 SUPABASE_SERVICE_ROLE_KEY）
  - articles 改以 `week_number + day_of_week` 對應 rolling curriculum，並移除文章內容與正式 lookup 的 `date_key/dateKey`
  - 新增 migration `20260323000000_fix_questions_schema.sql`（day_of_week 1-7 + unique constraint）
- [x] App 模組從 sample data 切換為從 Supabase API 讀取真實資料（content-api.ts）
- [ ] 將本地已驗證的全年內容與音檔同步至 Supabase / Storage，並做產品端最終驗收

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
- [x] **帳號管理**：ProfileModal 已於 2026-04-06 移除，改為獨立 **Account tab**（credits 餘額、購買、登出、LEGAL 連結、版本號）
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


### Owner TODO（使用者需自行處理，唯一真相；原 SAV-owner-todo.md 已併入此處並歸檔）

**仍未完成（上架前）：**
- [ ] **設計 App Icon**（1024×1024，無圓角）— 目前仍是預設 Expo icon，上架前必換；放入 `app/assets/` 並更新 `app.json` 的 `icon`，需重新 build
- [ ] **準備 App Store 截圖**（iPhone 6.7" 必要，至少 5 張：Schedule/Listen/Speak/Conversation/Review）
- [ ] **申請 Google Play Console**（$25 USD 一次）+ Google Play 銀行/稅務資料 — 送 Android 版前必須
- [ ] **完成 Cloudflare R2 音檔遷移**（音檔已 3.0GB/17,520 MP3；決策見 backend-hosting-decision.md）
- [ ] **升級 Supabase Pro**（上線用，避開 Free 7 天 pause）

**已完成（存查）：**
- [x] Apple Developer Program 已購買（savelyn.siao@gmail.com，2026-03-20）
- [x] Apple Small Business Program（15% 抽成）已申請、等審核（2026-04-03）
- [x] Apple Store Connect 銀行/稅務（國泰世華 + W-8BEN，2026-03-26）
- [x] RevenueCat 帳號 + IAP 產品 `sav_credits_10`（Consumable, NT$60）+ Webhook（2026-04-03）
- [x] Anthropic 帳號 + 儲值 $5、Supabase Secrets（ANTHROPIC_API_KEY、REVENUECAT_WEBHOOK_SECRET）已設
- [x] OpenAI TTS 音檔已生成（tts-1，17,520 MP3）
- [x] EAS login/init（projectId `70bf336b-2ec8-4170-bbb3-68d7c81b9879`）、憑證、production build #5 已提交

---

## Key Architecture Decisions（重要設計決策）

| 決策 | 選擇 | 原因 |
|------|------|------|
| 定價 | NT$60（一次買斷） | Apple 標準定價層，對應 $1.99 USD |
| AI 模型 | Claude Haiku 4.5 | 對話批改夠用，成本比 Sonnet 低 75% |
| TTS | OpenAI `tts-1` 預生成 → Storage/CDN | W1D1 實測後決定採低成本方案；新版長篇內容約 2,563,318 chars，一次性成本約 $38.45 USD；新版 17,520 行音檔已生成並上傳完成 |
| 登入方式 | Email + Apple Sign In + Google Sign In | Apple 強制要求 Sign in with Apple |
| IAP 整合 | RevenueCat | 免費版支援 < NT$75,000 月收，抽象化 Apple/Google 雙平台 |
| 後端 | Supabase Pro（$25/月）+ Edge Functions (Deno) | 上線採 Pro（Free 7 天無活動會 pause）；音檔改由 Cloudflare R2 服務。詳見 backend-hosting-decision.md |
| 狀態管理 | Zustand | 輕量、不需 Provider wrapper |
| 監控 | Supabase Dashboard + Cloudflare Analytics | 到達上限會自動通知 |
| 定價（已確認 2026-07-05） | **NT$60 付費下載**（一次性，含全年課程）+ **消耗型 credits**（AI 批改用，另購）；Apple 抽成走**小開發者 15%**（已核准） | 付費下載 NT$60 實收 NT$51；credits 為額外消耗型 IAP |
| 內容策略 | 全年 365 天，W1–W53（53 週），每天 Listen+Conversation+Speak | 每位使用者從自己的 Day 1 開始完成完整課程 |
| Episode 檔案格式 | Weekly Module（`week-01.ts`~`week-53.ts`），每檔含 4 或 7 集陣列 | 53 檔 vs 365 檔，業界最佳實踐，維護成本低，支援週主題聚合查詢 |

---

## File Structure

```
study-anywhere-voyage-daily-english/
├── SAV-spec-zh.md                 # 產品規格書
├── SAV-ssd-zh.md                  # 系統設計文件
├── SAV-dev-progress.md            # ← 本檔案（含 Owner TODO，唯一真相）
├── daily-english-app-prototype.html  # HTML prototype（設計參考）
├── backend/
│   ├── README.md
│   └── supabase/
│       ├── config.toml
│       ├── migrations/
│       │   └── 20260320000000_initial_schema.sql
│       └── functions/
│           ├── _shared/cors.ts, supabase-client.ts
│           ├── feedback/index.ts, tutor-chat/index.ts
│           ├── credits-webhook/index.ts, progress-sync/index.ts
│           └── content-episode / content-article / content-questions / content-flashcards
├── app/
│   ├── App.tsx                    # 入口：Auth guard → Tab Navigator
│   ├── .env                       # Supabase credentials
│   └── src/
│       ├── constants/theme.ts     # Design System
│       ├── lib/supabase.ts        # Supabase client
│       ├── lib/cache.ts           # AsyncStorage cache-first helpers (offline support)
│       ├── stores/                # Zustand stores (auth, credits, progress, tutor, curriculum)
│       ├── data/                  # content-api + curriculum + sample fallbacks
│       ├── navigation/TabNavigator.tsx, NavContext.tsx
│       ├── components/
│       │   ├── TutorFab.tsx             # Polaris 浮動 AI 英文老師入口
│       │   ├── TutorChatModal.tsx       # Polaris 多輪對話 UI
│       │   └── schedule/                # DayMark.tsx, TallyStick.tsx, TallyRecord.tsx
│       └── screens/
│           ├── auth/AuthScreen.tsx
│           └── tabs/ (Schedule, Listen, Speak, Conversation, Review, Account)
└── content/                       # 課程內容檔
    ├── episodes/
    │   ├── index.ts               # getEpisode, getWeekEpisodes
    │   ├── week-01.ts             # W1（4 集）Fresh Starts
    │   ├── week-02.ts             # W2（7 集）Morning Routines
    │   ├── ...
    │   └── week-53.ts             # W53（4 集）New Beginnings
    ├── articles/
    │   ├── articles-w01.ts ~ articles-w53.ts
    ├── flashcards/
    │   ├── flashcards-w01-w08.ts ~ flashcards-w42-w53.ts
    └── questions/
        ├── conversations-w01-w08.ts ~ conversations-w42-w53.ts
```

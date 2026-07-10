# 非內容功能工程審查（2026-07-10）

> 範圍：app 端（React Native / Expo）、Edge Functions、資料庫 RLS 與 RPC、
> App Store 合規、設定檔與秘密管理。不含學習內容（另見 content-audit-2026-07-10.md）。

## 判定

修復前有 **1 個嚴重安全漏洞**與 **1 個 App Store 封鎖項**，皆已修復並（可實測者）驗證。
其餘為中低風險強化。修復後具備送審資格；上線前仍需在真機 TestFlight 跑一次
`testflight-checklist.md` 的登入 / IAP / Apple 登入實測（模擬器測不到）。

## 發現與修復

### 🔴 S1（嚴重）SECURITY DEFINER RPC 對所有登入用戶開放 → 可無限刷點數
- **問題**：`add_credits` / `deduct_credit` / `restore_credit` / `increment_tutor_usage`
  都是 `SECURITY DEFINER`，但 Postgres 預設把 `EXECUTE` 授予 `PUBLIC`。任何持
  anon key 的人可直接打 `POST /rest/v1/rpc/add_credits` 給自己加任意點數（完全繞過
  IAP），或用 `deduct_credit` 清空他人餘額。
- **修復**：`migrations/20260710000000_lock_down_rpc_permissions.sql` 對這些函式
  `REVOKE ... FROM PUBLIC, anon, authenticated` 並只 `GRANT ... TO service_role`。
- **驗證**：本機套用 migration 後，帶 anon key 呼叫 `add_credits` / `deduct_credit`
  皆回 `42501 permission denied`（修復前會成功）。Edge Functions 用 service_role 呼叫，不受影響。

### 🔴 A1（App Store 封鎖）缺少帳號刪除功能（Guideline 5.1.1(v)）
- **問題**：有第三方登入且能建立帳號的 app，Apple 強制要求 app 內提供帳號刪除。原本只有登出。
- **修復**：
  - 新增 Edge Function `delete-account`（驗 JWT → `auth.admin.deleteUser`；
    所有用戶資料表皆有 `ON DELETE CASCADE`，連帶清除）。
  - `authStore.deleteAccount()` + AccountScreen 新增「DELETE ACCOUNT」按鈕，
    二次確認後刪除並登出。

### 🟠 E1 殘留 PREVIEW_MODE 繞過登入的除錯程式
- `App.tsx` 有 `PREVIEW_MODE`（bypass 登入）分支，雖預設 false，但屬送審風險
  （審查員若讀到會質疑）。已完全移除，直接使用 `session`。

### 🟠 E2 IAP 成功但 webhook 未入帳時謊報「已加點」
- `purchaseCredits` 輪詢 8 秒後不論餘額是否增加都回 `success: true`，AccountScreen
  一律顯示「credits added」。webhook 慢時用戶看到成功卻沒點數。
- 修復：回傳 `pending` 旗標；未入帳時顯示「稍後入帳」而非謊報。

### 🟠 E3 requestFeedback 未捕捉網路例外
- `fetch` 在離線時會 reject，原本只有 `finally`，rejection 往上冒（未處理）。
- 修復：加 `catch` 回 `network_error`；ConversationScreen 對應顯示「No connection」。

### 🟠 E4 progress-sync 無輸入驗證
- 直接 upsert 用戶送來的 `completed_days` / `mastered_cards`，無型別 / 大小限制。
- 修復：256KB payload 上限、型別檢查、`mastered_cards` 元素長度與陣列長度上限。

### 🟠 C1 設定檔預設指向本機、金鑰散落
- `app/.env`（已被 git 追蹤）預設 `SUPABASE_URL=127.0.0.1`；`eas.json` build profile
  完全沒有 env → production build 會抓到錯的環境變數。
- 修復：
  - `app/.env` 改為預設雲端（anon key 與 RevenueCat public key 皆為公開值，隨 app 發佈本就會落在裝置端，非秘密）。
  - 本機 demo 設定移到 `app/.env.local`（gitignored），並加入 `.easignore`。
  - `eas.json` 的 `preview` / `production` profile 補上 `env`，固定雲端環境。
  - `.env.cloud.bak` 加入 `.easignore`，避免混進 build。

### 🟢 版本號單一來源
- AccountScreen 版本號從硬編碼 `v1.0.0` 改為讀 `Constants.expoConfig.version`，
  避免 app.json 升版後顯示不同步（新增 `expo-constants` 依賴）。

## 審查通過、無需改動者

- **RLS**：所有用戶資料表（profiles/credits/credit_transactions/user_progress/
  tutor_daily_usage）RLS 已開、政策為 `auth.uid() = user_id`；內容表為公開唯讀。正確。
- **credits-webhook**：有 `REVENUECAT_WEBHOOK_SECRET` 驗證、只認 secret 相符才處理、
  未知事件回 200 不處理。正確。
- **feedback**：JWT 驗證 → 每日上限 → 原子扣點 → API 失敗補償還原 → 記錄交易。流程完整。
- **扣點原子性**：`deduct_credit` 用 `SELECT ... FOR UPDATE`，無 race condition。
- **auth**：Apple 用 nonce 雜湊、Google OAuth token 交換皆正確；登入錯誤訊息已分類。
- **各 Tab 空狀態**：Listen/Speak/Conversation/Review 都有 empty state 與導引，不會空白。

## 上線前仍須人工完成（無法在此環境驗證）

- 真機 TestFlight：Email / Apple / Google 登入實測（模擬器測不到 Apple Sign In）
- IAP 沙盒購買 → 8 秒內入帳（webhook 端到端）
- delete-account 部署到雲端後，用測試帳號實跑一次刪除
- Supabase 雲端套用 `20260710000000` + `20260710010000` migration（`supabase db push`）
- 部署 `delete-account` Edge Function（`supabase functions deploy delete-account`）
- 重新部署 `credits-webhook`、`tutor-chat`（含下方 H-1/H-2 修復）

---

## 附錄：上線專家團隊複審後補修（2026-07-10，六方獨立審查）

召集 6 位上線專家（Mobile Build / ASO / SecOps / Privacy / DevOps / PM）獨立複審，
報告在 `docs/launch-experts/`。SecOps 獨立驗證 **S1 提權修復確認有效**，但另抓出
**2 個原判「正確」而遺漏的封鎖項**，加上 Mobile Build 的 3 個 build 封鎖項，皆已補修：

### 🔴 H-1（安全，封鎖）credits-webhook 無冪等性 → 可重複/偽造加點
- **問題**：`add_credits` 每呼叫一次就無條件加點；RevenueCat webhook 為 at-least-once
  投遞，正常重試即造成重複入帳；重放一則合法 webhook 亦可無限加點。
- **修復**：新增 `migrations/20260710010000_webhook_idempotency.sql`——
  `credit_transactions` 加 `provider_event_id TEXT UNIQUE`，新函式
  `add_credits_idempotent(...)` 以 `INSERT ... ON CONFLICT (provider_event_id) DO NOTHING`
  去重，僅實際插入時才加點（同一事件重送 → no-op）。webhook 改呼叫此函式並帶
  `event.id`（退而求其次 `transaction_id`）；secret 比對改常數時間（M-3）。
  函式權限比照 20260710000000，僅 service_role。

### 🔴 H-2（成本，封鎖）tutor-chat 失敗請求不計數 → 無上限 LLM 帳單
- **問題**：每日 30 則上限只在「成功產生 reply」後才 `increment_tutor_usage`；任何
  provider 全失敗或被 `validateModelOutput` 擋下的請求都不計數，卻已燒掉 routing ＋
  最多 4 provider × 3 輪 tool loop 的上游呼叫 → 單一帳號可無限放大 AI 成本。
- **修復**：把 `increment_tutor_usage` 移到 **呼叫任何 LLM（含 routing）之前** 原子執行，
  以回傳 count 判定是否超限（原子、消除 read-then-act race）。deterministic 安全回覆
  為純本機規則、不觸發上游呼叫，故不計費。

### 🔴 Build B1（Mobile，封鎖）`.easignore` 未排除 `ios/` → 出到舊 prebuild
- **問題**：`app/ios/`（6/8 舊 prebuild，資料夾名仍為 `StudyAnywhereVoyage`）未被
  `.easignore` 排除；EAS 一旦有 `.easignore` 即不看 `.gitignore`，會上傳此舊 prebuild
  出 build → app 改名 Notch Up!、權限字串、以及本次所有安全修復全都不會進 build。
- **修復**：`rm -rf app/ios app/android`（untracked、可由 CNG 重生）；`.easignore`
  改為排除整個 `/ios`、`/android`，強制由 app.json 跑 CNG prebuild。

### 🔴 Build B2（Mobile，封鎖）缺 `expo-asset` peer dependency
- **修復**：`npx expo install expo-asset`（config plugin 已自動註冊）。

### 🟠 Build B3（Mobile）`newArchEnabled: false` 在 SDK 55 為失效欄位
- app 實際以 New Architecture 出 build。已移除該死欄位；**須真機重測 RevenueCat /
  SVG / 轉場**（列入 TestFlight 清單）。另已 `npx expo install --fix` 對齊 13 個
  SDK 55 鎖定版（皆 patch 級，含 RN 0.83.2→0.83.6）。

### 🟠 隱私（Privacy，封鎖送審）隱私標籤漏報「User Content」
- Apple/Google 隱私標籤未申報對話批改答案與家教聊天文字會逐字送第三方 AI，且與
  自家隱私政策自相矛盾 → Guideline 5.1.1 不實申報退件風險。詳見
  `docs/launch-experts/privacy-compliance.md`（含可直接貼上的標籤更正與跨境傳輸條文）。
  **此項為 App Store Connect 表單更正，非程式碼**，須人工於送審前完成。

### 中低風險（不封鎖，排後續 sprint）
- M-1 萬用 CORS（原生 bearer 架構實際風險低）、M-2 feedback 缺輸入長度上限、
  L-1 `profiles`/`user_progress` UPDATE RLS 缺 `WITH CHECK`、L-3 content 函式過度授權。
  詳見 `docs/launch-experts/security-review.md`。

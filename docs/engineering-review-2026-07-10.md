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
- Supabase 雲端套用 `20260710000000` migration（`supabase db push`）
- 部署 `delete-account` Edge Function（`supabase functions deploy delete-account`）

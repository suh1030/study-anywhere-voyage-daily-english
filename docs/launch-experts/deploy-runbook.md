# 上線部署 Runbook — Notch Up! Daily English

> 作者：DevOps（上線團隊）
> 建立日期：2026-07-10
> 範圍：雲端後端（Supabase Pro）+ Edge Functions + 內容 seed + EAS build/submit。
> 專案 ref：`ioosxzbdkscllgesmeqw`（Supabase Pro）
> App：Expo RN（iOS）+ Supabase + RevenueCat + Anthropic

本文件是「一次完整上線」的部署 SSOT。每一步都附「指令 → 驗證 → 回滾」。
可自動化的後端部分已封裝成 [`scripts/deploy/deploy-backend.sh`](../../scripts/deploy/deploy-backend.sh)；
本檔補上該腳本不涵蓋的手動一次性設定與 EAS build/submit。

**⚠️ 讀我：本 runbook 不會自動幫你跑任何指令。所有指令都要你人工確認後執行。
凡標 `[破壞性]` 者，執行前務必先做 DB 備份或保留當前 git SHA。**

---

## 0. 前置條件（開始前先確認）

| 檢查 | 指令 / 動作 | 期望 |
|---|---|---|
| supabase CLI ≥ 1.200 | `supabase --version` | 有版本號 |
| eas CLI ≥ 12 | `eas --version` | 有版本號 |
| 已登入 supabase | `supabase projects list` | 看得到專案清單 |
| 已登入 expo | `eas whoami` | 顯示帳號 |
| 專案在 Pro 方案（非 Free，避免 7 天 pause） | Dashboard → Settings → Billing | Plan = Pro |
| 本機 git 乾淨、在正確 commit | `git status` / `git rev-parse HEAD` | 記下 SHA 供回滾 |
| `scripts/.env` 指向**雲端** URL + service_role key | 檢查（勿印出到終端） | `SUPABASE_URL=https://ioosxzbdkscllgesmeqw.supabase.co` |

> 記下當前 git SHA：`git rev-parse HEAD > /tmp/deploy-baseline-sha.txt`。任何 Edge Function 需回滾時，
> `git checkout <SHA> -- backend/supabase/functions/<name>` 後重新 deploy 即可。

---

## 1. 部署順序總覽（依相依關係）

```
   [手動一次性設定：見 §7]  ← Auth providers / SMTP / RevenueCat / ASC IAP
                │  （這些是後端執行期依賴，須在對應功能被呼叫前完成）
                ▼
  Step A  supabase link
                ▼
  Step B  DB migration (db push)        ← 修掉刷點漏洞，越早越好、與 app 無相依
                ▼
  Step C  set secrets                   ← 專案級，套用到所有 functions；deploy 前先設
                ▼
  Step D  deploy Edge Functions (×9)    ← 含 delete-account（送審阻斷項）
                │                          credits-webhook 必須 --no-verify-jwt
                ▼
  Step E  seed 內容 [破壞性]            ← 依賴 B 的 schema；service_role 不受權限鎖影響
                ▼
  Step F  端到端驗證（登入/IAP/AI/刪帳號）
                ▼
  Step G  eas build (production)        ← env 已釘在 eas.json，抓雲端環境
                ▼
  Step H  eas submit → App Store Connect
```

**Step A–E（後端）可用 `scripts/deploy/deploy-backend.sh` 半自動執行。Step F 需真機/沙盒。Step G–H 為 EAS。**

---

## 2. Step A — 連結雲端專案

```bash
supabase link --project-ref ioosxzbdkscllgesmeqw
```

- **驗證**：`supabase projects list` 中該 ref 那行左側出現 `●`（linked）。
- **回滾**：`supabase unlink`（link 本身不改雲端任何東西，無風險）。

---

## 3. Step B — 套用 DB migration（修刷點漏洞）

> 這是工程審查兩大必做之一：套用 `20260710000000_lock_down_rpc_permissions.sql`，
> 對 `add_credits / deduct_credit / restore_credit / increment_tutor_usage / handle_new_user`
> `REVOKE ... FROM PUBLIC, anon, authenticated`，只留 `service_role`。**漏洞在雲端仍未修，越早套越好。**

```bash
# 先看 pending（雲端尚未套用）的 migration
supabase migration list --linked

# 套用所有 pending migration（正常情況只會套 20260710000000 這一支）
supabase db push
```

- **驗證 1**：`supabase migration list --linked` → `20260710000000` 在 Local 與 Remote 兩欄皆有時間戳。
- **驗證 2（實測漏洞已封）**：以 **anon key** 直呼 RPC，應回 `401/403`（權限拒絕）：
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "https://ioosxzbdkscllgesmeqw.supabase.co/rest/v1/rpc/add_credits" \
    -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"p_user_id":"00000000-0000-0000-0000-000000000000","p_amount":9999,"p_reason":"probe"}'
  # 期望：401 或 403（修復前會是 200）
  ```
- **⚠️ 相依 / 風險**：
  - **此步必須在 App 對外開放（送審通過上架）前完成**，否則任何持 anon key 者可無限刷點。優先於一切。
  - 若 `migration list` 顯示 **Remote 端一支都沒有**（代表這是新開的 Pro 專案、migration 歷史空的），
    `db push` 會嘗試**套用全部 11 支** migration。此時務必先確認雲端 DB 是否已有資料表
    （`supabase db diff --linked` 檢視），避免重複建表報錯。若雲端已手動建過 schema，
    可用 `supabase migration repair --status applied <version>` 校正歷史後再 push。
- **回滾**：migration 無自動 down。若真要回退（**不建議**，會重開漏洞），手動執行反向 SQL：
  ```sql
  GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT) TO authenticated;
  -- …其餘同理。僅供緊急，回退後漏洞重現，必須儘速 fix-forward。
  ```
  正規做法是**修正後前滾**（新增一支修正 migration），不要 down。

---

## 4. Step C — 設定 Edge Function secrets

> Supabase 會**自動注入** `SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY`，
> **不要**也**不能**手動設定這三個（`secrets set` 會拒絕保留字）。以下才是需要手動設的：

| Secret | 用於 | 必填 | 備註 |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `feedback`（AI 批改） | ✅ | Anthropic Console 產生；初期儲值 $5 |
| `REVENUECAT_WEBHOOK_SECRET` | `credits-webhook` | ✅ | 必須與 RevenueCat Webhook 的 Authorization header **完全一致** |
| `OPENROUTER_API_KEY` | `tutor-chat`（主模型） | ✅ | OpenRouter 免費模型 |
| `GROQ_API_KEY` | `tutor-chat`（fallback） | ⭕ 建議 | 缺少時 fallback 分支停用 |
| `GROQ_MODEL` | `tutor-chat` | ⭕ | 預設 `llama-3.3-70b-versatile` |
| `OPENROUTER_FALLBACK_MODEL` | `tutor-chat` | ⭕ | 預設 `openrouter/free` |

```bash
# 逐一設定（值請勿留存在 shell history；建議用 --env-file）
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
supabase secrets set REVENUECAT_WEBHOOK_SECRET="<與 RevenueCat 一致的字串>"
supabase secrets set OPENROUTER_API_KEY="sk-or-..."
supabase secrets set GROQ_API_KEY="gsk_..."          # 選填
# 或一次匯入：supabase secrets set --env-file ./scripts/deploy/secrets.env  （該檔須 gitignore）
```

- **驗證**：`supabase secrets list` → 上述 key 名稱都在（值以 digest 顯示，看不到明文）。
- **相依**：secrets 是**專案級**、套用到所有 function，且 deploy 後即生效。
  **先設 secrets 再 deploy functions**，避免函式第一次被叫到時 `Deno.env.get()` 拿到 undefined。
- **回滾**：`supabase secrets unset <KEY>`，或重設回舊值。

---

## 5. Step D — 部署 9 支 Edge Functions

> 函式清單：`content-episode`、`content-article`、`content-questions`、`content-flashcards`、
> `feedback`、`tutor-chat`、`progress-sync`、`credits-webhook`、`delete-account`。

```bash
cd backend/supabase

# 一般函式（gateway 驗 Supabase JWT，app 帶 user/anon token 呼叫）
supabase functions deploy content-episode
supabase functions deploy content-article
supabase functions deploy content-questions
supabase functions deploy content-flashcards
supabase functions deploy feedback
supabase functions deploy tutor-chat
supabase functions deploy progress-sync
supabase functions deploy delete-account          # 送審阻斷項，見下

# ⚠️ 特例：credits-webhook 必須關掉 gateway JWT 驗證
supabase functions deploy credits-webhook --no-verify-jwt
```

- **為何 `credits-webhook` 要 `--no-verify-jwt`**：RevenueCat 打過來時 `Authorization` header 放的是
  **我們自訂的 webhook secret**，不是 Supabase JWT。若保留預設 verify_jwt，gateway 會在請求進到函式前
  就用 JWT 規則擋掉 → 購買**不會入帳**。函式內部本身已自行比對 `REVENUECAT_WEBHOOK_SECRET`，安全性不打折。
- **為何其餘保留 verify_jwt**：`delete-account` 收 app 傳來的**真實 user JWT** 再 `getUser()`；
  content/feedback/tutor/progress 也都由 app 帶合法 token 呼叫，gateway 先驗一層更安全。
- **驗證（部署清單）**：`supabase functions list` → 9 支都 `ACTIVE`，版本號有更新。
- **驗證（delete-account 存活）**：
  ```bash
  # 無 token 應回 401（代表函式已上線且有驗證，而非 404）
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    "https://ioosxzbdkscllgesmeqw.supabase.co/functions/v1/delete-account"
  # 期望：401（不是 404）
  ```
- **驗證（credits-webhook 免 JWT）**：
  ```bash
  # 帶錯 secret 應回 401（由函式內部判定），而非 gateway 的 JWT 錯誤
  curl -s -o /dev/null -w "%{http_code}\n" -X POST \
    "https://ioosxzbdkscllgesmeqw.supabase.co/functions/v1/credits-webhook" \
    -H "Authorization: wrong-secret" -H "Content-Type: application/json" -d '{}'
  # 期望：401（函式回的），代表 gateway 已放行、由函式自行驗 secret
  ```
- **⚠️ 相依 / 風險**：
  - **`delete-account` 未部署 = App Store 送審必被退（Guideline 5.1.1(v)）**。App 內已有 DELETE ACCOUNT 按鈕，
    審查員一按就會打這支函式；沒部署 → 錯誤 → 退件。**此步必須在 Step H 送審前完成。**
  - `credits-webhook` 若忘了 `--no-verify-jwt` → IAP 購買不入帳 → pre-launch checklist 的「8 秒內加點」測不過。
- **回滾（單一函式）**：
  ```bash
  git checkout <baseline-SHA> -- backend/supabase/functions/<name>
  supabase functions deploy <name>            # credits-webhook 記得再帶 --no-verify-jwt
  ```

---

## 6. Step E — Seed 內容到雲端 `[破壞性]`

> `scripts/seed.ts` 對部分表用 **truncate + insert**（先刪後插）。**執行前務必先備份。**
> 依 pre-launch checklist，內容（365 episodes / articles / questions / 583 flashcards）已於 2026-04-03
> seed 過。**若雲端內容已在且正確，本步可略過**；僅在需要重灌或內容更新時執行。

```bash
# 1) 先備份（Pro 方案每日自動備份；手動再保一份更保險）
#    Dashboard → Database → Backups → 觸發一次，或本機 pg_dump。

# 2) 確認 scripts/.env 指向雲端（不是 127.0.0.1）——否則會灌到本機
#    需含 SUPABASE_URL=https://ioosxzbdkscllgesmeqw.supabase.co
#         SUPABASE_SERVICE_ROLE_KEY=<service_role>

# 3) 執行 seed
npm run seed
```

- **驗證**：seed 輸出每張表 `✓ <table>: N rows`，無 error。四張內容表筆數符合預期
  （episodes 365 / articles 365 / questions 365 / flashcards 583）。
  隨後打開 app，Listen / Speak / Conversation / Review 四個 Tab 都能顯示內容。
- **相依**：必須在 **Step B（schema 已存在）之後**。seed 用 service_role，不受 Step B 權限鎖影響。
- **⚠️ 風險**：`scripts/.env` 若殘留本機 URL，seed 會打空的本機 DB → 雲端沒內容 → app 空白
  （見 MEMORY：本機 seed 曾被 scripts/.env 雲端值覆蓋的反向坑）。**執行前務必核對 URL。**
- **回滾**：從 Step E.1 的備份還原（`supabase db reset` **不可**用於雲端；用 Dashboard restore 或 `psql` 匯入 dump）。

---

## 7. 手動一次性設定（Dashboard / RevenueCat / App Store Connect）

> 這些**無法用 CLI 腳本完成**，是後端功能的執行期依賴，須在對應功能被呼叫前設好。
> 打勾者為 pre-launch checklist 已記錄完成，上線前請**再核對一次**。

### 7.1 Supabase Dashboard → Authentication
| 項目 | 位置 | 說明 |
|---|---|---|
| Apple provider | Auth → Providers → Apple | 填 Service ID / Team ID / Key ID / .p8 private key。**Apple Sign In 是 App Store 硬需求，未設 iOS 登入會失敗** |
| Google provider | Auth → Providers → Google | Client ID + Client Secret；Redirect URI = `https://ioosxzbdkscllgesmeqw.supabase.co/auth/v1/callback`（Client ID 2026-04-03 已填，**確認 Secret 也填了**） |
| Redirect / Site URL | Auth → URL Configuration | 加入 app 的 deep-link scheme 與正式 site_url（本機 config.toml 是 127.0.0.1，**雲端要設正式值**） |
| Email SMTP | Auth → Emails → SMTP | 正式寄信需接 SendGrid/Resend；**未設會用 Supabase 內建低額度寄信、易進垃圾桶或觸發限流**，Email 註冊驗證流程受影響 |

### 7.2 Supabase Dashboard → Edge Functions → Secrets
- 若沒用 §4 的 CLI，可改在此 UI 設 `ANTHROPIC_API_KEY / REVENUECAT_WEBHOOK_SECRET / OPENROUTER_API_KEY / GROQ_API_KEY`。二擇一，別重複。

### 7.3 RevenueCat Dashboard
| 項目 | 說明 |
|---|---|
| Webhook endpoint ✅ | URL = `https://ioosxzbdkscllgesmeqw.supabase.co/functions/v1/credits-webhook`；產生的 Authorization Secret **必須等於** Supabase 的 `REVENUECAT_WEBHOOK_SECRET`（2026-04-03 已設，**改過任一邊都要同步**） |
| Offering / Package | Offering `default` → Package `credits_10` 對到 ASC 的 IAP product |
| App-Specific Shared Secret | 從 App Store Connect 產生，填入 RevenueCat 的 App 設定，否則沙盒/正式收據驗不過 |

### 7.4 App Store Connect
| 項目 | 說明 |
|---|---|
| IAP product `credits_10` | 建立且狀態可提交；首次隨 app 版本一起送審 |
| App-Specific Shared Secret | 產生後交給 RevenueCat（見 7.3） |
| Sign in with Apple capability | App ID 已勾（Xcode/Provisioning） |
| 審查測試帳號 ✅ | `a0925302127@gmail.com`（已設 10 credits） |
| 截圖 / 隱私標籤 / 描述 / 分級 | 見 pre-launch checklist P1（多數 ✅，截圖待補真機畫面） |

---

## 8. Step F — 端到端驗證（後端全部到位後，真機 / 沙盒）

> 模擬器測不到 Apple Sign In 與 IAP，**必須用真機 TestFlight**。逐項對照 `docs/testflight-checklist.md`。

1. Email 註冊 → 收信 → 確認 → 登入（驗 SMTP 與 Auth）。
2. Apple / Google 登入（驗 §7.1 provider）。
3. 內容四 Tab 有資料（驗 Step E seed + content-* functions）。
4. Conversation 送出 → 收到 Claude 回饋（驗 `feedback` + `ANTHROPIC_API_KEY`）。
5. 買 `credits_10` → **8 秒內** 點數 +10（驗 `credits-webhook` + `--no-verify-jwt` + RevenueCat secret）。
6. Account → DELETE ACCOUNT → 二次確認 → 帳號與資料被清（驗 `delete-account` 部署 + CASCADE）。
7. 以 anon key 直呼 `add_credits` 回 401/403（驗 Step B 漏洞已封，見 §3 驗證 2）。

**任何一項失敗，先修對應後端步驟再繼續，不要送審。**

---

## 9. Step G — EAS Build（production）

> `eas.json` 的 `production` profile 已把 `EXPO_PUBLIC_SUPABASE_URL / ANON_KEY / REVENUECAT_API_KEY`
> 釘死為雲端值，且 `autoIncrement: true`、`appVersionSource: remote`。build 會抓正確環境，不需再改 env。

```bash
cd app
eas build --platform ios --profile production
```

- **驗證**：build 成功，EAS 給出 build 頁面與 `.ipa`。確認 build log 裡的 `EXPO_PUBLIC_SUPABASE_URL`
  是 `ioosxzbdkscllgesmeqw`（不是 127.0.0.1）。確認 `.env.local`（本機 demo 值）**沒有**混進 build
  （已在 `.easignore`）。
- **⚠️ 相依**：build 前，Step B（漏洞）與 Step D（尤其 delete-account）**應已完成**——因為送審後審查員
  跑的是雲端後端，後端沒到位 build 再好也會被退。
- **回滾**：build 是不可變 artifact，無需回滾；有問題就修 code 後出新 build（版號自動遞增）。

---

## 10. Step H — EAS Submit → App Store Connect

```bash
cd app
eas submit --platform ios --profile production --latest
```

- `submit.production.ios` 已設 `appleId / ascAppId (6761168417) / appleTeamId (HCP29T4B9C)`。
- **驗證**：ASC → TestFlight 出現新 build（processing → ready）。先發 TestFlight 內測跑 §8，
  全綠後才在 ASC 送 App Review。
- **⚠️ 送審前最後確認（硬阻斷）**：
  - [ ] Step B migration 已套（`migration list` remote 有 20260710000000）
  - [ ] `delete-account` 已部署且 §8 第 6 項實測通過
  - [ ] `credits-webhook` 以 `--no-verify-jwt` 部署且 §8 第 5 項 8 秒內入帳
  - [ ] Apple Sign In 真機可登入
  - [ ] App 內無測試/繞過字樣（PREVIEW_MODE 已移除）
- **回滾**：
  - 送審中：ASC 可 **Reject this build / 撤回**，改送新 build。
  - 已上架出包：ASC 提交修正版新 build 走 expedited review；OTA 層面可用 EAS Update 對 `production` channel
    republish 上一版 JS bundle（僅限純 JS 變更，原生層仍需新 build）。

---

## 11. 相依與風險一覽（給決策者速讀）

| # | 相依 / 風險 | 影響 | 對策 |
|---|---|---|---|
| R1 | **Step B migration 必須在 App 上架前完成** | 漏洞在雲端 = 任何人可無限刷點、清空他人餘額 | 最優先執行，與 app 無相依，可立刻做 |
| R2 | **`delete-account` 未部署 → 送審必退**（Guideline 5.1.1(v)） | App Store 退件、上線延遲 | Step D 完成、§8 第 6 項實測，才可 Step H |
| R3 | **`credits-webhook` 忘記 `--no-verify-jwt`** | IAP 購買不入帳，用戶付錢沒點數 | Step D 用特例指令；§8 第 5 項驗證 8 秒入帳 |
| R4 | **secrets 必須先於 functions 設定** | 函式首呼 `Deno.env.get()` 拿到 undefined → 500 | 先 Step C 再 Step D |
| R5 | **RevenueCat secret 與 Supabase secret 不一致** | webhook 401，購買不入帳 | §7.3 兩邊字串完全一致；改一邊要同步 |
| R6 | **seed 的 `scripts/.env` 指向本機** | 灌到本機 DB，雲端空白，app 四 Tab 空白 | Step E 執行前核對 URL；已 seed 則略過 |
| R7 | **seed 為 truncate+insert（破壞性）** | 誤跑覆蓋雲端內容 | 先備份；非必要不重跑 |
| R8 | **新 Pro 專案 migration 歷史空** | `db push` 想套全部 11 支、可能撞既有表 | 先 `migration list` / `db diff`，必要時 `migration repair` |
| R9 | **Auth provider / SMTP 未設** | Apple/Google/Email 登入失敗，Apple 硬需求不過 | §7.1 上架前逐項核對 |
| R10 | **音檔已 3GB > Supabase Free 1GB** | 若專案掉回 Free 會被 7 天 pause 咬到；egress 成本 | 確認 Pro；P2 期把音檔搬 Cloudflare R2（前端零改動，見 backend-hosting-decision.md） |

---

## 12. 部署後（P2，不阻斷上線）

- **Cloudflare R2 音檔遷移**：建 R2 bucket → 上傳 3GB / 17,520 MP3 → 設 public URL →
  改 `episode.parts[*].audio_url` 指向 R2 → **重新 seed**（前端零改動）。搬完後 Supabase egress 幾乎歸零、
  Pro 維持 $25/月不漲。詳見 `docs/backend-hosting-decision.md`。
- **監控**：開 Supabase Edge Function 錯誤通知；RevenueCat 購買紀錄；Anthropic 餘額（歸零即停，定期補值）。
- **`add_credits` 呼叫者驗證強化**：在函式內加 `p_user_id = auth.uid()` 二重保險（backend-hosting-decision §資安）。
```

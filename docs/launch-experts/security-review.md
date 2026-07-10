# 獨立安全複審 — Notch Up!（2026-07-10）

> 複審者：Senior SecOps（獨立於工程審查）
> 範圍：秘密外洩、Edge Functions、RLS/RPC 權限、IAP 防詐、tutor-chat 成本與注入
> 方法：唯讀靜態審查。未改動任何程式碼。
> 對照文件：`docs/engineering-review-2026-07-10.md`

## 一、對工程審查結論的複核（你的修復是否修對）

| 工程審查項 | 複核結論 |
|---|---|
| **S1** SECURITY DEFINER RPC 提權 | ✅ **確認修對。** `20260710000000_lock_down_rpc_permissions.sql` 對 `add_credits(UUID,INTEGER,TEXT)`、`deduct_credit(UUID)`、`restore_credit(UUID)`、`increment_tutor_usage(UUID,DATE)`、`handle_new_user()` 皆 `REVOKE FROM PUBLIC, anon, authenticated`，僅 `GRANT TO service_role`。**簽名與 migration 中定義的多載完全吻合**（REVOKE 命中正確的函式）。全 codebase 已無其他 SECURITY DEFINER 函式漏鎖。Edge Functions 一律以 service_role admin client 呼叫，不受影響。**上線前務必確認雲端已 `supabase db push` 套用此 migration**（否則等於沒修）。 |
| **A1** 帳號刪除 | ✅ 邏輯正確（驗 JWT → `auth.admin.deleteUser` → CASCADE 清資料）。見下方 L-2 的次要強化建議。 |
| **credits-webhook「正確」** | ⚠️ **不同意此結論。** 見 **H-1**：缺冪等性 + 完全信任 webshook body，是本次最重要的遺漏。 |
| **feedback「流程完整」** | 大致同意，但漏了輸入長度上限，見 **M-2**。 |
| **RLS「正確」** | 大致同意；`profiles`/`user_progress` 的 UPDATE 政策缺 `WITH CHECK`，見 **L-1**（不可利用，僅深度防禦）。 |
| **秘密管理** | ✅ 確認乾淨。無硬編碼 service_role / 私鑰 / Anthropic·Groq·OpenRouter key。`scripts/.env` 未被 git 追蹤且已 gitignore。`app/.env`、`eas.json` 僅含公開值（Supabase anon key、RevenueCat public SDK key `appl_…`）——這些隨 app 落地裝置本就是公開的，非秘密。App 於原生端用 `expo-secure-store` 存 session（符合安全 token 儲存）。 |

---

## 二、發現分級

### 🔴 CRITICAL
**無。** 唯一的 Critical（S1 提權）已於工程審查修復並經本次獨立驗證確認有效。

---

### 🟠 HIGH

#### H-1　credits-webhook 無冪等性且完全信任 webhook body → 可重複/偽造加點【上線封鎖】
- **位置**：`backend/supabase/functions/credits-webhook/index.ts:9-63`；`add_credits`（`20260320000000_initial_schema.sql:154`）
- **問題**：
  1. **無冪等鍵 / 去重**：`add_credits` 每被呼叫一次就無條件 `balance + p_amount` 並插一筆交易。RevenueCat webhook 是 **at-least-once 投遞**，任何非 2xx 回應或逾時都會**自動重送同一事件**。目前函式在 `add_credits` 失敗時回 500 → RevenueCat 重送 → 若後續成功，同一筆購買可能已入帳但又再入一次；正常情況下的重試也會重複加點。事件本身沒有以 `event.id` / `transaction_id` 去重。
  2. **完全信任請求內容**：`product_id`、`app_user_id` 直接取自 webhook body，未向 RevenueCat REST API 反查該筆購買是否真實存在、是否屬於該 user。驗證僅靠一個**靜態共享 bearer**（`Authorization === REVENUECAT_WEBHOOK_SECRET`）。
- **攻擊情境**：
  - 任何持有該 secret 者（或成功重放一則擷取到的合法 webhook）可對任意 `app_user_id` 無限加點，完全繞過付費。
  - 即使無惡意，RevenueCat 的正常重試就會造成使用者重複獲得點數（財務漏損）。
- **修復建議**：
  1. **加冪等性**：以 RevenueCat 事件的唯一 id（`event.id` 或 `transaction_id`）建立唯一鍵。在 `credit_transactions` 加 `provider_event_id TEXT UNIQUE`，`add_credits` 內以 `INSERT ... ON CONFLICT (provider_event_id) DO NOTHING` 並依實際插入筆數決定是否加點（同一事件重送則 no-op、回 200）。
  2. **反查驗證**（強烈建議）：收到 webhook 後以 RevenueCat REST API（`/subscribers/{app_user_id}`）反查該筆交易確實存在且未退款，再入帳。
  3. secret 比對改為**常數時間比較**（見 M-3），並確認 `REVENUECAT_WEBHOOK_SECRET` 為高熵值。
- **為何封鎖上線**：這是繞過 IAP 取得付費功能的直接路徑，且重試造成的重複入帳在正常流量下就會發生。

#### H-2　tutor-chat 失敗請求不計入每日上限 → 無上限 LLM 成本濫用
- **位置**：`backend/supabase/functions/tutor-chat/index.ts` — 上限檢查在 L511-520，但 `increment_tutor_usage` 只在**成功產生 reply 之後**（L720）執行；任何走到 `return jsonResponse({ error: 'ai_unavailable' }, 503)`（L716）的請求**完全不計數**。
- **問題**：每則請求會觸發 1 次 routing LLM 呼叫 + 最多 4 個 provider × 最多 3 輪 tool loop 的生成呼叫（L634 `MAX_TOOL_ROUNDS`、L624 provider 迴圈）。若請求最終無有效輸出（provider 全失敗、或輸出全被 `validateModelOutput` 擋下），則**不增加計數卻已產生完整的上游 LLM 成本**。
- **攻擊情境**：持有效 JWT 的使用者送出「刻意會被政策擋下」或在 provider 不穩時的請求，反覆呼叫。每次都燒掉多次 Groq/OpenRouter 呼叫，但 30/日 上限永遠不會遞增 → 單一帳號可無限放大你的 AI 帳單（免費層被打爆後波及付費備援）。
- **次要**：上限為 read-then-act（L511 讀 count、L720 才 increment），非原子；高併發下可小幅超出 30/日。相對 H-2 主體影響較小。
- **修復建議**：在**通過 JWT 與上限檢查後、呼叫任何 provider 之前**就先原子 `increment_tutor_usage`（把它當成「嘗試額度」而非「成功額度」）。若擔心失敗不該計費，可改為對「每 IP / 每 user 的請求速率」另設獨立限流（例如每分鐘 N 次），與「成功計數」分離。至少要保證**任何觸發上游 LLM 呼叫的路徑都會消耗額度**。

---

### 🟡 MEDIUM

#### M-1　所有 Edge Functions 使用萬用 CORS（`Access-Control-Allow-Origin: *`）
- **位置**：`backend/supabase/functions/_shared/cors.ts:2`
- **評估**：目前出貨面是**原生 iOS app 且以 `Authorization` bearer（非 cookie）帶 token**，瀏覽器的 CORS/自動附帶憑證機制對原生請求不適用，故**實際可利用性低**。但仍屬不符最小權限：任意網站可從瀏覽器打這些端點（只是拿不到使用者 token）。
- **修復建議**：上線後若有任何 web 版本，改為明確 origin 允許清單。目前可標記為已知例外並記錄理由。

#### M-2　feedback 未限制 `question`/`answer` 長度 → 單次呼叫成本放大
- **位置**：`backend/supabase/functions/feedback/index.ts:28-31`（只檢查非空，無長度上限），內容直接進 Claude prompt（L80）。
- **問題**：`progress-sync` 有 256KB body 上限，但 feedback 沒有。使用者（需消耗 1 點）可送超長輸入，input token 成本遠高於 1 點的定價假設；也擴大 prompt injection 面（雖然輸出僅回給本人，影響有限）。
- **修復建議**：對 `question`、`answer` 各加合理上限（如 2,000 字元）與整體 body 上限，超過回 400。

#### M-3　webhook secret 使用非常數時間 `===` 比較
- **位置**：`credits-webhook/index.ts:13` `return authHeader === secret`
- **評估**：透過 TLS 且 secret 為高熵時，網路時序攻擊實務上不可行 → 單獨看是 Low。但與 H-1 同屬「驗簽強度不足」主題，一併於 H-1 修復時改為常數時間比較（如逐位元 XOR 累加比較），成本極低。

---

### 🟢 LOW / 深度防禦

- **L-1　`profiles` / `user_progress` 的 UPDATE RLS 缺 `WITH CHECK`**（`20260320000000_initial_schema.sql:183,196`）。目前**不可利用**（`id`/`user_id` 為 PK+FK，改寫成他人 id 會觸發唯一或外鍵違規），但最佳實務應補上 `WITH CHECK (auth.uid() = id)` / `(auth.uid() = user_id)`，避免未來新增欄位時出現寫入越界。
- **L-2　delete-account 僅憑有效 JWT 即刪、無近期再認證、無限流**（`delete-account/index.ts`）。前端有二次確認，可接受；建議加簡單限流，並考慮敏感操作要求近期登入，降低 session 被竊後的破壞。
- **L-3　content-\* 函式使用 service_role（admin client）讀取公開內容**（`content-article/index.ts:17` 等）。輸入已用正整數白名單驗證、query 為參數化、僅查內容表，**不可注入亦不越權**，但屬過度授權；建議改用 anon client（RLS 對內容表本就 public read）以符最小權限。
- **L-4　Web 端 token 儲存於 `localStorage`**（`app/src/lib/supabase.ts:8-10`）。原生 iOS 出貨面用 `expo-secure-store`（正確）；web 路徑非本次送審面，若未來上 web 需正視 XSS 竊 token 風險。

---

## 三、prompt injection / 秘密洩漏（tutor-chat 專項）

- **注入防護整體紮實**：結構化路由（`route_request` 白名單 enum，L377）＋後端才執行唯讀白名單工具（`runTutorTool`，以使用者 JWT 受 RLS 保護）＋輸出層過濾（`validateModelOutput`：系統提示外洩、內部推理、工具名、簡體字、程式碼輸出、捏造進度數字皆會擋下並換 provider）＋前端 context 嚴格白名單（`isValidLearningContext`）。進度數字唯一可信來源為後端工具回傳，前端 context 不再被信任——設計良好。
- **無金鑰洩漏路徑**：LLM 金鑰只在後端經 `Deno.env` 取用，不進 prompt、不回傳前端；錯誤一律回泛用訊息、細節僅 `console.error` 於伺服器端。
- **殘留風險（低）**：注入防護依賴 regex 輸出過濾，弱模型仍可能以未涵蓋措辭繞過某些字串比對；但因工具唯讀且受 RLS 保護，最壞情況是「回答品質/口吻越界」而非資料外洩或提權。可接受，持續以 evals 監控即可。**真正的成本風險在 H-2，不在注入。**

---

## 四、上線封鎖項（Go/No-Go）

| 等級 | 項目 | 封鎖上線？ |
|---|---|---|
| HIGH | **H-1** credits-webhook 冪等性 + 驗證強化 | **是** |
| HIGH | **H-2** tutor-chat 額度應在呼叫 LLM 前就消耗 | **是**（成本 DoS） |
| — | 確認雲端已套用 `20260710000000` migration | **是**（未套用等於 S1 未修） |
| MEDIUM | M-1 / M-2 / M-3 | 否，建議上線後儘速 |
| LOW | L-1~L-4 | 否，排入後續 sprint |

---

## 五、給你的 3–5 句話回報

1. **你的 S1 提權修復我獨立驗證，確認修對且完整**——lock-down migration 的函式簽名與定義完全吻合，全 repo 無其他 SECURITY DEFINER 漏鎖；秘密掃描也乾淨（無硬編碼金鑰、`scripts/.env` 未被追蹤）。
2. **但你把 credits-webhook 判為「正確」是本次最重要的遺漏**：它沒有冪等鍵、也不向 RevenueCat 反查，等於「僅靠一個靜態 bearer 就能對任意 user 無限加點」，而且 RevenueCat 的正常重試就會造成重複入帳——這是繞過 IAP 的直接路徑，我列為 HIGH 且封鎖上線。
3. **第二個你漏掉的是 tutor-chat 的成本漏洞**：每日 30 則上限只在「成功」時才計數，任何失敗/被擋下的請求都不計數卻已燒掉多次上游 LLM 呼叫，單一帳號即可無限放大你的 AI 帳單——應在呼叫 provider「之前」就消耗額度。
4. 其餘為中低風險（萬用 CORS 因原生 bearer 架構實際風險低、feedback 缺輸入長度上限、RLS 缺 `WITH CHECK`、content 函式過度授權），不封鎖上線但建議儘速處理。
5. **別忘了作業性封鎖項**：雲端若尚未 `supabase db push` 套用 `20260710000000`，S1 在正式環境等於沒修——上線前務必確認已套用。

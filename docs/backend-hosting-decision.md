# 後端 Hosting 決策紀錄：Supabase Pro vs Self-host

> 決策日期：2026-07-05
> 決策者：獨立開發者（一人團隊）
> 評估方式：四位專家（技術架構 / 維運 / 資安 / 成本 TCO）並行獨立評估
> 幣別：新台幣（NT$），匯率 1 USD ≈ 32 TWD

---

## 決策摘要（TL;DR）

**上線採用 Supabase Pro（$25/月），並把 3GB 音檔搬到 Cloudflare R2（零 egress、幾乎免費）。現階段不 self-host。**

四位專家獨立評估後**一致**指向此答案，無實質分歧。

---

## 背景

- 原本使用 Supabase 雲端試用版（無費用），試用已到期，需決定正式上線方案。
- 選項：(A) 訂閱 Supabase Pro；(B) self-host Supabase 於 Zeabur；(C) self-host Supabase 於 AWS。
- 產品：Notch Up! Daily English，React Native/Expo（iOS + Android + web），台灣市場，上線前，初期預估數百～低數千 MAU。

### Supabase 實測用量（決策基準）

| 元件 | 現況 |
|---|---|
| Postgres 17 | 4 張靜態內容表（episodes/articles/questions/flashcards，約 1,678 筆）+ 每用戶表（profiles/credits/credit_transactions/user_progress）。DB < 100MB。 |
| Auth (GoTrue) | Apple + Google + email 登入；`auth.users` INSERT trigger 建 profile |
| Storage | `episode-audio` bucket，**17,520 個 MP3 = 3.0 GB**，公開讀，音檔串流是主要 egress |
| Edge Functions (Deno) | 9 支：content-episode/article/questions/flashcards、feedback、tutor-chat、progress-sync、credits-webhook |
| RLS | 重度使用（per-user own-row + 內容表 public read） |
| Realtime | 未使用 |

---

## 四位專家共識

| 專家 | 對 self-host 的判斷 | 首選 |
|---|---|---|
| 技術架構 | 耦合集中在 GoTrue JWT+RLS 與 Deno edge-runtime；可搬但不划算 | Supabase Pro + R2（適配度 9/10） |
| 維運 | self-host 每月 8–20 hrs 維運，省的錢被工時吃光 | Supabase Pro（~0–1 hr/月） |
| 資安 | self-host 把 80%+ 基礎設施資安責任壓到一人；有個資法法律後果 | Supabase Pro |
| 成本 TCO | 三情境 TCO Pro 皆最低；self-host 初建機會成本 NT$1.2萬–6萬 | Supabase Pro + R2 |

---

## 關鍵洞察：音檔決策與 DB 決策正交

真正的成本驅動不是 DB（DB 小到可忽略），而是 **3GB 音檔的串流 egress**。此事與用不用 Supabase 無關：

- 音檔是**靜態、公開讀**（不需 Auth/RLS 保護）→ 天生適合 CDN。
- **Cloudflare R2**：3GB 在 10GB 免費額度內、每月 1,000 萬次讀取免費、**egress 永久 $0**。
- 遷移只需把 `episode.parts[*].audio_url` 從 Supabase Storage URL 換成 R2 public URL，**前端邏輯零改動**，約 2–4 小時。
- 搬 R2 後，Supabase egress 幾乎不被消耗 → **即使成長到 10,000 MAU，Supabase Pro 仍維持 $25/月不漲**。

---

## TCO 比較

查證日期 2026-07-05。假設音檔平均 170KB、每 MAU 每月串流 ~30MB。

| 方案 | 500 MAU | 3,000 MAU | 10,000 MAU |
|---|---|---|---|
| **Supabase Pro + R2** ⭐ | **$25** | **$25** | **$25**（不漲） |
| Supabase Pro（音檔留 Storage） | $25 | $25 | $29.5 |
| Zeabur self-host | ~$33 | ~$42 | ~$60 |
| AWS self-host（S3 音檔） | ~$30 | ~$40 | ~$62 |

### 隱藏人力機會成本（時薪 NT$1,500 估）

| 方案 | 初始建置 | 月維運工時 | 年化機會成本 |
|---|---|---|---|
| Supabase Pro | 0 hr（升 Pro 點一下） | ~0.5 hr/月 | ~NT$9,000/年 |
| Zeabur self-host | 8–16 hr（NT$1.2萬–2.4萬） | 2–4 hr/月 | NT$3.6萬–7.2萬/年 |
| AWS self-host | 20–40 hr（NT$3萬–6萬） | 3–6 hr/月 | NT$5.4萬–10.8萬/年 |

> Zeabur 光初始建置就等於預付 15–30 個月的 Supabase Pro 月費差額。

### 損益觀點

- Pro 月費 NT$800 ≈ 每月 20 位用戶各買一包（毛利 NT$40.56/包）即 cover。
- 到 100–300 位付費用戶時，後端成本佔毛利 < 7%，完全可忽略。

---

## 定價事實（截至 2026-07-05）

- **Supabase Free**：DB 500MB / Storage 1GB / Egress 5GB；**7 天無 DB 活動自動 pause**。→ 現有 3GB 音檔已超過 Free 1GB，且審核期會被 pause 咬到。
- **Supabase Pro**：$25/月（含 $10 運算抵免）；DB 8GB / Storage 100GB / Egress 250GB / 無限 Edge Functions。Egress 超額 $0.09/GB。
- **Zeabur Pro**：$19/月 + 用量（記憶體 $0.00025/GB-分鐘、流量 $0.10/GB、Volume $0.20/GB/月）。
- **AWS 最小自架**：EC2 t3.micro + RDS db.t3.micro + S3 ≈ $27–30/月（東京區再貴 15–20%）+ egress。
- **Cloudflare R2**：儲存 $0.015/GB/月（3GB 在 10GB 免費內）、**egress $0**、讀取 1,000 萬次/月免費。

---

## 資安要點

- Supabase Pro 把 OS/Postgres CVE 補丁、備份加密、DDoS、SOC 2 / ISO 27001 合規等責任外包給供應商；開發者只需負責應用層（RLS、Edge Function、key 管理）。
- self-host 後新增責任：GoTrue 帳號安全、JWT/SERVICE_ROLE_KEY 管理、Postgres 5432 曝露、Kong gateway、edge-runtime secrets、Storage ACL、OS 加固、TLS。
- 台灣個資法要求資料外洩 72 小時通報；self-host 無 SIEM 基本上看不見事件，法律後果實質存在。
- **現有應用層設計評價良好**：RLS 設計合理、webhook HMAC 驗證到位、credits 只透過 SECURITY DEFINER 函式寫入。

### ⚠️ 待修：`add_credits` 呼叫者驗證

`add_credits` 為 SECURITY DEFINER，目前僅由後端 `credits-webhook`（HMAC 驗證後）以 admin client 呼叫，路徑安全。但若未來有人改為從前端用 anon key 直呼叫此 RPC，因 SECURITY DEFINER 執行時無 `auth.uid()` 限制，任何用戶可傳任意 `p_user_id` 幫自己加點。**建議在函式內加入 `p_user_id = auth.uid()` 驗證。**

---

## 何時重新評估 self-host

以下條件**全部滿足**才值得（依目前台灣市場成長速度，24 個月內不會觸及）：

1. MAU 破萬～五萬且 egress 顯著失控
2. 月後端帳單 > $100–300
3. 有資料主權／落地的法規硬需求
4. 不再是一人團隊，有人可扛維運與資安

→ 屆時應選 **AWS（RDS 有 PITR、可靠性）而非 Zeabur**（過渡性 PaaS，缺 Vector/Logs、Edge Function 需重新驗證）。

---

## 執行路線圖

### Phase 0 — 上線前
1. 升級／開新 **Supabase Pro** 專案（原試用專案 `ioosxzbdkscllgesmeqw` 已到期、無法連線，需確認續用或開新）。
2. 直接升 Pro，避開 Free 方案 7 天自動 pause。

### Phase 1 — 音檔卸載到 R2（省最多、工時最少）
3. 建 R2 bucket、上傳 3GB 音檔、設 public URL。
4. 改 seed／episode 資料的 audio URL 指向 R2（前端零改動）。

### Phase 2 — 順手補強
5. 修 `add_credits` 呼叫者驗證。
6. 設定 Auth SMTP（SendGrid/Resend）、正確設定 edge function secrets。
7. 更新過時文件：`docs/financials.md`（音檔已 3GB 非 600MB、Supabase 已非 Free）；`scripts/.env` 的雲端 URL/key。

---

## 參考來源

- Supabase Pricing / Backups / Project Pausing（supabase.com/docs）
- Zeabur Pricing Plans（zeabur.com/docs）
- Cloudflare R2 Pricing（developers.cloudflare.com/r2/pricing）
- AWS RDS PostgreSQL / S3 Pricing（aws.amazon.com）
- Supabase Self-Hosted 限制討論（github.com/orgs/supabase/discussions/39820）

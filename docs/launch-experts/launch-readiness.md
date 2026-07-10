# Launch Readiness Scorecard — Notch Up! (Daily English, iOS)

> **文件性質**：上線 go/no-go 整合決策（SSOT for launch coordination）
> **PM Owner**：Alex（產品經理，上線協調）
> **建立日期**：2026-07-10　**版本**：v0.9（待併入 mobile build / ASO / security / privacy / devops 專家報告後升 v1.0）
> **決策層級**：首次 iOS App Store 上架，Launch Tier 1

---

## 0. TL;DR — 現在能不能送審？

**判定：NO-GO（暫緩送審）— 但不是因為產品不合格，而是因為「雲端後端還沒站起來」＋「真機 QA 還沒跑」。**

- 內容合格可上線（content-audit 2026-07-10 已 PASS），工程的嚴重安全漏洞與 App Store 封鎖項（帳號刪除）在**程式碼層**已修好。
- 但這些修復**大多還停在本機 / repo，尚未套用到可上線的雲端環境**。原 Supabase 試用專案（`ioosxzbdkscllgesmeqw`）已到期/pause，形同「App 目前沒有一個能對外服務的後端」。
- 因此目前**送審 = 高機率 Guideline 2.1（App 打不開/功能不完整）退件**。距離可送審剩 **5 個封鎖項**，全部可執行、無研發不確定性，樂觀 **3–5 個工作天**可清完。

清完下方 🚧 BLOCKER 五項並在真機驗證通過後，本判定即翻為 **GO**。

---

## 1. Launch Readiness Scorecard

圖例：✅ 完成　⚠️ 進行中 / 已修但未部署　❌ 未做　🔲 需真機驗證（本環境測不到）

### 🟦 內容（Content）
| 項目 | 狀態 | 來源 |
|------|------|------|
| 365 集 episodes / 365 articles / 365 questions / 583 flashcards 全量對齊驗證 | ✅ | content-audit-2026-07-10 §四 |
| 中英同步（F1 95 處脫鉤修復）、破英文（F2 family milestone 13 處）修復 | ✅ | content-audit §P0 |
| wordCount seed 時實算、131 篇元資料校正 | ✅ | content-audit F3 |
| 字卡溯源 0 失敗、0 重複 headword（第二輪 287 卡替換） | ✅ | content-audit §第二輪 |
| 年齡分級安全稽核（4+，無高風險內容） | ✅ | pre-launch P1 |
| 全套 prelaunch 驗證綠燈（run-final-verification / validate-* / tsc） | ✅ | content-audit §P0 |
| 音檔逐階段抽聽（人聲自然、角色對應） | ❌ | pre-launch P1（未勾） |
| 結構性模板感 / 難度飄移（F4/F6） | ⚠️ 已迭代改善，非封鎖 | content-audit P1（已完成第三輪） |

**內容小結：可上線。** 音檔抽聽建議在真機 QA 時順帶完成。

### 🟩 工程（Engineering）
| 項目 | 狀態 | 來源 |
|------|------|------|
| S1 SECURITY DEFINER RPC 提權漏洞（可無限刷點）— 程式修復 | ✅（本機驗證封死） | engineering-review S1 |
| S1 migration `20260710000000` 套用到**雲端** | ❌ 🚧 | engineering-review §上線前須人工 |
| A1 帳號刪除功能（Guideline 5.1.1(v)）— 程式實作 | ✅ | engineering-review A1 |
| A1 `delete-account` Edge Function 部署到**雲端** | ❌ 🚧 | engineering-review §上線前須人工 |
| E1 移除 PREVIEW_MODE 登入繞過除錯碼 | ✅ | engineering-review E1 |
| E2 IAP 未入帳謊報「已加點」→ 改回 pending | ✅ | engineering-review E2 |
| E3/E4 網路例外處理、progress-sync 輸入驗證 | ✅ | engineering-review E3/E4 |
| C1 env/eas.json 指向雲端、金鑰治理 | ✅ | engineering-review C1 |
| RLS / webhook HMAC / 扣點原子性 / auth 流程 | ✅（審查通過無需改） | engineering-review §審查通過 |

### 🟥 安全（Security）
| 項目 | 狀態 | 來源 |
|------|------|------|
| RPC 執行權限鎖定（程式面） | ✅ | engineering-review S1 |
| RPC 鎖定套用到雲端 | ❌ 🚧 | 同上 |
| RevenueCat webhook secret 驗證 | ✅ | pre-launch（2026-04-03 完成） |
| Supabase Free 7 天 pause 風險 → 升 Pro 規避 | ⚠️ 決策已定，未執行 | backend-hosting-decision |
| _待併入 security 專家報告_ | 🔲 | （撰寫中） |

### 🟪 隱私 / 合規（Privacy & Compliance）
| 項目 | 狀態 | 來源 |
|------|------|------|
| 隱私政策 / 服務條款 URL 可開啟 | ✅ | pre-launch P0 |
| App 隱私 Nutrition Labels 填寫 | ✅ | pre-launch P1（2026-04-03） |
| 帳號刪除（合規面，程式）| ✅ | engineering-review A1 |
| 年齡分級問卷（4+） | ✅ | pre-launch P1 |
| 台灣個資法 72hr 通報 / 資料刪除實跑驗證 | 🔲 需雲端部署後實跑 | backend-hosting §資安 |
| _待併入 privacy 專家報告_ | 🔲 | （撰寫中） |

### 🟨 商店（App Store Connect / ASO）
| 項目 | 狀態 | 來源 |
|------|------|------|
| App 描述、關鍵字填寫 | ✅ | pre-launch P1（2026-04-03） |
| 審查測試帳號（credits≥3）+ 審查備註 | ✅ | pre-launch P1 |
| 隱私政策 URL 填入 ASC | ✅ | pre-launch P1 |
| App 截圖（iPhone 6.7" ≥3 張，真實 UI） | ❌ | pre-launch P1（未勾） |
| App icon / splash 正確顯示 | 🔲 | testflight §送審前最終確認 |
| 已提交 build（#5/7 於 2026-04-03 submit） | ⚠️ 舊 build，含修復前程式 | pre-launch P1 |
| _待併入 ASO 專家報告（關鍵字/截圖/描述優化）_ | 🔲 | （撰寫中） |

> ⚠️ 注意：2026-04-03 submit 的 build 早於 2026-07-10 的安全/帳號刪除/內容修復。**必須重打含最新修復的 build 再送**，不可沿用舊 build。

### 🟧 部署 / 基礎建設（DevOps / Infra）
| 項目 | 狀態 | 來源 |
|------|------|------|
| Supabase Pro 專案站起（試用已到期/pause） | ❌ 🚧 | backend-hosting §執行路線圖 Phase 0 |
| migration `20260710000000` push 雲端 | ❌ 🚧 | engineering-review |
| `delete-account` Edge Function 部署 | ❌ 🚧 | engineering-review |
| `npm run seed` 灌入雲端 Pro DB（365×4 + 583） | ❌ 🚧 | pre-launch P0 / MEMORY seed 註記 |
| 3GB 音檔遷移 Cloudflare R2 + audio_url 改指向 | ❌ 🚧 | backend-hosting Phase 1 |
| Auth SMTP（Resend）/ edge secrets 設定確認 | ⚠️ | backend-hosting Phase 2 |
| Supabase Edge Function 錯誤通知開啟 | ❌ | pre-launch P2 |
| _待併入 devops 專家報告_ | 🔲 | （撰寫中） |

### ⬜ 測試（真機 QA — 全部 🔲，模擬器測不到）
| 項目 | 狀態 | 來源 |
|------|------|------|
| Email 註冊/登入/錯誤處理 | 🔲 | testflight §Auth |
| Sign in with Apple（Apple 規定必備，真機必測） | 🔲 | testflight / pre-launch P0 |
| Google Sign In | 🔲 | testflight |
| IAP 沙盒購買 → 8 秒內入帳（webhook 端到端） | 🔲 | testflight / pre-launch P0 |
| delete-account 真機實跑一次 | 🔲 | engineering-review |
| Listen 音檔播放 / TTS fallback | 🔲 | testflight §Listen |
| Conversation AI 批改 / 每日 5 次上限 / 點數不足 | 🔲 | testflight §Conversation |
| UI 無「測試/TODO/debug」殘留文字 | 🔲 | testflight §送審前 |
| 邊界：無網路、首次使用、非課程日、跨 tab 切換 | 🔲 | testflight §邊界 |

---

## 2. Go / No-Go 建議

### 判定：**NO-GO（暫緩送審），清完 5 項封鎖後轉 GO**

**理由：** 產品本體（內容 + 程式碼）已達可上線水準——這是好消息，代表沒有需要重新設計或重寫的深層問題。剩下的全是「把已完成的修復推上一個真正能對外服務的雲端環境，並在真機上證明它真的動」。這類工作風險低、時程可控，但**在完成前送審幾乎必然踩 Guideline 2.1 退件**，而退件會讓早期獲客與 App Store 演算法起步都受挫（財務風險表已點名此為主要風險）。

### 🚧 封鎖項（BLOCKER）— 送審前必須全綠

| # | 封鎖項 | 為何封鎖 | 負責領域 | 相依 |
|---|--------|----------|----------|------|
| B1 | 站起 Supabase Pro 專案（取代到期試用） | 沒有它 = App 沒有後端，一切登入/內容/IAP 皆死 | DevOps | 無（最上游） |
| B2 | push migration `20260710000000` + 部署 `delete-account` + seed 內容到雲端 | 安全漏洞修復與帳號刪除只有部署後才生效；DB 空則四個 tab 空白 | DevOps | 依賴 B1 |
| B3 | 3GB 音檔遷移 R2 + audio_url 改指向 | Free 1GB 裝不下 3GB 音檔；不搬則 Listen 無聲 | DevOps | 依賴 B1 |
| B4 | 重打含最新修復的 build 並上 TestFlight，跑完真機 QA（Apple/Google/Email 登入、IAP 沙盒入帳、delete-account、音檔播放） | 舊 build（04-03）不含 7-10 修復；Apple 登入與 IAP 模擬器測不到 | Mobile Build + PM | 依賴 B2、B3 |
| B5 | App Store 截圖（≥3 張真實 UI）+ 送審前 UI 無測試文字最終確認 | 送審素材硬需求；MEMORY 已記 iOS 送審品質紅線 | ASO + PM | 依賴 B4（用真機畫面截圖） |

> 非封鎖但強烈建議在送審同批完成：Supabase Edge Function 錯誤通知、Auth SMTP 確認、`add_credits` 呼叫者驗證補強（backend-hosting §待修）。

---

## 3. 上線後第一週監控與應變計畫

比 P2 清單更具體。每項含**閾值、負責人、應變動作**。前 14 天每日巡檢。

### 3.1 Anthropic（Claude Haiku）餘額
- **監控**：Anthropic Console 餘額；初期儲值 $5（≈3,472 次批改）。餘額歸零 API 直接停、無自動扣款。
- **閾值**：餘額 < $1.5（≈剩 ~1,000 次）→ 補值。
- **應變**：立即補至 $20–50。設行事曆每週一手動查一次（v1 無自動告警）。
- **風險**：批改是付費 credit 的核心價值，斷線=用戶花錢買不到服務→退款+負評雙殺。優先級最高。

### 3.2 崩潰 / 錯誤率（Crash / Error）
- **監控**：Supabase Edge Function 錯誤通知（B2 後開啟）；App 端 v1 無 Sentry（列 post-launch backlog）。
- **閾值**：Edge Function 5xx 率 > 2%，或 feedback/webhook 函式連續失敗 → 告警。
- **應變**：查 Supabase logs 定位；若為單一函式回歸，回滾該函式版本。**App 端 crash 目前只能靠用戶回報 + App Store Connect 的 crash 報表**——這是 v1 盲點，第一週每日看 ASC → Analytics → Crashes。
- **建議**：第一週結束前補上 Sentry（免費額度足夠），把 App 端 crash 盲區補起來。

### 3.3 IAP / 點數入帳（RevenueCat + webhook）
- **監控**：RevenueCat Dashboard 購買紀錄；Supabase `credit_transactions` 表；credits-webhook 函式 log。
- **閾值**：出現「RevenueCat 有購買紀錄但 8 秒內 credit 未入帳」case ≥1 筆 → 立即查。
- **應變**：核對 webhook secret 與函式 log；E2 修復後未入帳會顯示 pending 不謊報，但仍須人工補點並回覆用戶。準備一段「已為您補上點數」的客服罐頭回覆。
- **相依**：需 B4 真機沙盒購買先驗證端到端無誤，否則第一週用戶付費踩雷。

### 3.4 App Store 評價 / 負評
- **監控**：App Store Connect → Ratings & Reviews，每日看；台灣區為主。
- **閾值**：任何 1–2 星，或提及「打不開/登入失敗/付錢沒點數/內容錯誤」→ 24hr 內回覆。
- **應變**：分類負評（bug / 內容 / 期待落差）；bug 類立即進 hotfix 評估；內容類回饋進 content backlog。**開通 App 內或 email 回饋管道**（pre-launch P2 未做，建議上線同時上線一個 mailto 按鈕，避免用戶只能用負評發聲）。
- **PM 動作**：第一週寫一份「上線首週實況」內部快報（安裝數、登入成功率、IAP 筆數、崩潰、Top 負評主題）。

### 3.5 後端用量 / 成本
- **監控**：Supabase Pro 用量（DB/Storage/Egress）；R2 讀取次數。
- **閾值**：Egress 逼近 250GB 或音檔搬 R2 後 Supabase egress 仍異常升高 → 查是否 audio_url 沒改乾淨。
- **應變**：確認音檔全走 R2；預期 Pro $25/月不漲（見 backend-hosting TCO）。

---

## 4. 時間線草案（今天 → App Store 上架）

假設一人團隊 + 各專家報告本週內交付。**關鍵路徑：B1 → B2/B3 → B4 → B5 → 送審 → Apple 審核。**

```
Day 0 (今天 07-10)
  ├─ [並行] 各專家完成 mobile build / ASO / security / privacy / devops 報告 → 併入本表 v1.0
  └─ [並行] PM 確認 Apple Developer 帳號、憑證、ASC 狀態就緒

Day 1  ── DevOps 關鍵路徑起點
  ├─ B1 站起 Supabase Pro 專案（升級或開新，取代到期試用）
  └─ 確認新 project ref，更新 webhook / edge function URL、app env

Day 2
  ├─ B2 push migration 20260710000000 + 部署 delete-account + seed 內容到雲端
  ├─ B3 音檔上傳 R2 + audio_url 改指向（可與 B2 部分並行，皆依賴 B1）
  └─ [並行] 設定 Auth SMTP、Edge Function 錯誤通知、補 add_credits 呼叫者驗證

Day 3  ── 交棒 Mobile Build
  ├─ B4a 重打含最新修復的 production build（EAS）→ 上 TestFlight
  └─ [並行] ASO 專家定稿關鍵字/描述優化

Day 4  ── 真機 QA（關鍵驗證日）
  ├─ B4b 真機跑 testflight-checklist：Apple/Google/Email 登入、IAP 沙盒入帳、
  │        delete-account 實跑、音檔播放、AI 批改上限、邊界情境、UI 無測試文字
  ├─ 音檔逐階段抽聽（併內容 P1 未竟項）
  └─ 任何 fail → 回 Day 2/3 修 → 重測（此為主要時程風險點）

Day 5
  ├─ B5 用真機畫面截 App Store 截圖（≥3 張 6.7"）+ 送審前最終確認
  ├─ 更新 ASC：新 build、截圖、ASO 文案、審查備註（測試帳號 credits≥3）
  └─ ✅ 全 BLOCKER 綠燈 → 送審（Submit for Review）

Day 6–8（Apple 審核，不可控）
  ├─ 監控審核狀態；備妥回覆審查員的測試帳號與 IAP 說明
  └─ 若退件 → 依 Guideline 對應修 → 24hr 內重送

Day 8+（核准後）
  ├─ 分階段釋出（可用 phased release 20%→100%）
  ├─ 啟動第 3 節第一週監控巡檢
  └─ 48hr 內發上線快報（shipped / 誰能用 / 為何重要）
```

**可並行**：專家報告收尾、ASO 文案、SMTP/告警設定，皆可與 DevOps 關鍵路徑並行。
**硬相依**：B4 真機 QA 必須等 B2+B3（後端有資料、音檔可播）才有意義；B5 截圖需 B4 的真機畫面；送審需 B5。
**主要風險點**：Day 4 真機 QA 若 Apple 登入或 IAP 入帳失敗，會回圈 1–2 天。建議 Day 4 預留 buffer，不要排死 Day 5 送審。

---

## 5. 待併入各專家報告（Placeholder — v1.0 更新）

以下區塊待 mobile build / ASO / security / privacy / devops 專家交付後併入，並回頭校正第 1 節 Scorecard 對應列與第 4 節時間線：

- [ ] **Mobile Build 專家**：EAS build profile 最終確認、憑證/描述檔、build 產出實測、TestFlight 發佈流程 → 對應 B4。
- [ ] **ASO 專家**：關鍵字策略、截圖文案、App 描述優化、圖示 → 對應 B5、商店列。
- [ ] **Security 專家**：獨立安全複核（是否認同 S1 修復充分、是否有其他曝險） → 對應安全列。
- [ ] **Privacy 專家**：Nutrition Labels 逐項核對、個資法/資料刪除合規複核 → 對應隱私列。
- [ ] **DevOps 專家**：Pro 專案站起與 R2 遷移的實作步驟與驗證、告警設定 → 對應 B1–B3、部署列。

> 併入原則：專家若推翻本表任一 ✅ 判定，以專家結論為準並在此記錄變更與日期。專家新增的封鎖項一律進第 2 節 BLOCKER 表。

---

*本文件為上線協調 SSOT。內容品質見 content-audit-2026-07-10.md；工程見 engineering-review-2026-07-10.md；操作清單見 pre-launch-checklist.md；真機 QA 見 testflight-checklist.md；後端決策見 backend-hosting-decision.md。*

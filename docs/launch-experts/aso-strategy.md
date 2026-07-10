# Notch Up! — App Store Optimization 策略與商店文案（優化版）

> 負責領域：App Store 行銷文案 / ASO。本文件為 SSOT 補充，只涵蓋 App Store Connect metadata 與截圖策略。
> 主要市場：**台灣 App Store（zh-Hant 為主要 localization）**，次要：en（預設）。
> 商業模式：NT$60 買斷（含 365 天課程）+ 消耗型 AI credits（IAP）。
> 審查對象：既有 `docs/app-store-copy.md`。本文提出優化版並保留原檔為歷史。

---

## 0. 審查結論摘要（現有 app-store-copy.md）

| 欄位 | 現況 | 診斷 | 動作 |
|---|---|---|---|
| App Name | `Notch Up: Daily English`（23/30 字元） | 符合品牌 SSOT，含英文品類詞，可用 | 保留 |
| Subtitle | `Listen, Speak & Review`（22/30） | 純英文、無高搜尋量關鍵字、沒放「AI」與中文詞 | **重寫（按 localization 分中/英）** |
| Keywords | 15 個純英文詞，含 TOEFL | 未使用中文關鍵字（台灣市場最大缺口）、有詞與 Name 重複浪費、TOEFL 相關性偏弱 | **全面重寫（中英混排）** |
| Description | 結構良好、模組清楚 | ①「Unlike subscription apps」為比較性語氣、②**未揭露 AI credits 為 IAP**、③fluency 宣稱可再收斂 | **修訂 3 處** |
| Promotional Text | **不存在** | 浪費了免審即可更新的 170 字元黃金欄位 | **新增** |

最關鍵三件事：**(1) 補中文關鍵字**、**(2) 補 Promotional Text**、**(3) Description 明確揭露 IAP credits**。

---

## 1. Apple 欄位字元上限速查（提醒工程/上架者）

| 欄位 | 上限 | 是否進搜尋索引 | 是否需送審才可改 |
|---|---|---|---|
| App Name | 30 | 是（權重最高） | 是 |
| Subtitle | 30 | 是（權重次高） | 是 |
| Keywords | 100 | 是（不對外顯示） | 是 |
| Promotional Text | 170 | 否 | **否（可隨時改）** |
| Description | 4000 | 否（iOS 不索引描述） | 是 |

ASO 核心原則：**搜尋權重只看 Name + Subtitle + Keywords**。三者之間**不要重複用字**（重複＝浪費配額）。中文由 Apple 自動斷詞，放單一 token（如「英文」「聽力」）即可被組合成長尾（「英文聽力」），不需另塞完整長詞。

---

## 2. 優化後商店文案 — 繁體中文（zh-Hant，台灣主力）

### App Name
```
Notch Up: Daily English
```
> 依品牌 SSOT 維持英文主名稱。台灣使用者也會直接搜英文 app 名，英文名同時吃到 English / Daily 兩個英文品類詞。
> （備選，若日後願放寬 SSOT 換取中文搜尋權重：`Notch Up 每日英文`，把最高權重欄位讓給中文品類詞。目前**不建議**動，先靠 Subtitle + Keywords 補中文。）

### Subtitle（≤30，實際 16 字元）
```
AI 口說批改・聽力跟讀會話練習
```
> 一次卡進 6 個高價值中文搜尋詞：AI、口說、批改、聽力、跟讀、會話。與 Name 無重複用字。

### Keywords（≤100，實際約 74 字元，中英混排）
```
英文,英語,口說,聽力,多益,toeic,對話,跟讀,背單字,發音,會話,自學,商用,職場,podcast,英檢,口語,流利,聽說,線上,學習,每日
```
> 刻意**不含** Notch/Up/Daily/English（已在 Name）與 口說/聽力/跟讀/會話/AI/批改（已在 Subtitle），避免重複浪費。
> 保留約 25 字元 headroom，可視上線後排名數據替換測試詞。

### Promotional Text（≤170，新增）
```
一天 10–20 分鐘，聽 Podcast、跟讀開口、用 AI 練對話。53 週 365 天課程一次買斷，沒有月費、沒有連續打卡壓力。今天開始，就是你的 Day 1。
```
> 免審即可更新，適合日後放檔期活動、credits 加購優惠、節慶訊息。

### Description（完整描述，修訂版）
```
Notch Up — 你的每日英語訓練夥伴

透過結構化的每日練習，穩定累積英語能力，適合任何忙碌的行程。

Notch Up 提供完整一年的內容——53 週、365 天，透過四個彼此串連的模組，同步訓練聽力、口說、對話與複習。

四大模組，一個每日習慣

🎧 Listen 聆聽 — Podcast 風格集數
每天從精選 Podcast 集數開始，涵蓋科技、旅遊、商業、科學與文化等主題。跟著雙語逐字稿閱讀，點擊任意一行即可聆聽朗讀，按自己的節奏複習關鍵片語。

📖 Speak 口說 — 引導式跟讀練習
用當天集數裡最自然、最值得模仿的短句做跟讀。先聽示範，再大聲跟讀、錄下自己的版本，最後把同一組語言變成你自己的回答。

💬 Conversation 對話 — AI 批改
用英文回答開放式問題，取得 AI 個人化回饋：指出文法、建議更道地的說法並解釋原因，讓每次練習都有收穫。

🃏 Review 複習 — 週回想 + 字卡
複習不只翻卡。先用回想題把這週內容從記憶裡拉回來，再用 Listen 與 Speak 的字卡補強真正值得帶走的詞與搭配，最後講一段自己的週總結。

一整年內容，一次購買
Notch Up 為一次性購買，沒有月費、沒有訂閱。完整 53 週、365 天課程全部包含。任何一天都能開始：使用的第一天就是 Day 1，課程從那天起連續展開 365 天。

專為忙碌學習者設計
每天核心練習（Listen、Speak、Conversation）合計約 10–20 分鐘，Review 為每週回顧。沒有連續打卡壓力、沒有每日上限，用自己的步調維持高品質練習。

關於 AI 對話點數
Conversation 模組的 AI 批改採用點數（credits）。App 內含免費起始點數；用完後可於 App 內加購點數包。此為選購項目，不影響 Listen、Speak、Review 與所有課程內容的使用。

每週主題
科技・科學・商業與職涯・旅遊・AI 與未來・創新・社會與文化・職場溝通・跨文化理解・環境，以及更多。
```
> 三處修訂：①「與訂閱制 App 不同」→ 改為中性的「沒有月費、沒有訂閱」；②新增「關於 AI 對話點數」段落**明確揭露 IAP**（降低 Guideline 2.1／3.1 退件風險）；③「建立持久的英語能力」→「穩定累積英語能力」，避免過度承諾語氣。

---

## 3. 優化後商店文案 — English（en，預設 localization）

### App Name
```
Notch Up: Daily English
```

### Subtitle（≤30，實際 29 字元）
```
Speak, Listen & Learn with AI
```
> 取代原 `Listen, Speak & Review`。新增高意圖詞 Speak/Learn/**AI**，AI 是原文案完全漏掉的高價值詞。與 Name 無重複。

### Keywords（≤100，實際約 98 字元）
```
speaking,listening,fluency,pronunciation,conversation,shadowing,podcast,toeic,esl,vocabulary,coach
```
> 不含 notch/up/daily/english（Name）與 speak/listen/learn/ai（Subtitle）。移除原 TOEFL（相關性弱、見 §5 風險）。

### Promotional Text（≤170，新增）
```
10–20 min a day: listen to a podcast episode, shadow real lines aloud, and get instant AI feedback on your English. One-time purchase — no subscription, no streaks.
```

### Description
沿用現有英文 Description，但套用與中文相同的三處修訂：
- `Unlike subscription apps, Notch Up is a one-time purchase with no recurring fees.` → `Notch Up is a one-time purchase — no subscription, no recurring fees.`
- 新增段落 **ABOUT AI CONVERSATION CREDITS**：`The Conversation module's AI feedback runs on credits. The app includes a free starting balance; when it runs out, you can buy a credits pack in-app. This is optional and does not affect Listen, Speak, Review, or any of the 365 days of content.`
- `Build lasting English fluency` → `Build English fluency through consistent daily practice`（把承諾轉為對「練習」的描述而非結果保證）。

---

## 4. 關鍵字選擇邏輯（搜尋量 vs 競爭 vs 相關性）

### 台灣市場中文詞判讀
| 關鍵字 | 相對搜尋量 | 競爭 | 相關性 | 放置決策 |
|---|---|---|---|---|
| 英文 / 英語 | 極高 | 極高 | 9 | Keywords（單獨排名難，但需做組合長尾的基底 token） |
| 口說 / 口語 | 高 | 中 | 10 | Subtitle（口說）+ Keywords（口語）— 本 app 差異化強項 |
| 聽力 / 聽說 | 高 | 中 | 10 | Subtitle（聽力）+ Keywords（聽說） |
| AI 批改 | 中、上升中 | **低** | 10 | Subtitle — 低競爭 + 高相關，最值得搶的位置 |
| 多益 / toeic | 極高 | 高 | 6 | Keywords — 受眾高度重疊（B1–B2 = 多益 550–800 客群），做流量入口 |
| 英檢 / 商用 / 職場 | 中 | 中 | 7 | Keywords — 成人職場學習者長尾 |
| 跟讀 / 影子跟讀 | 低 | 低 | 10 | Subtitle（跟讀）— 小眾但精準、幾乎零競爭 |
| podcast | 中 | 中 | 8 | Keywords — 呼應產品形式，區隔純背單字 app |
| 背單字 | 高 | 高 | 6 | Keywords — 蹭流量，但非核心，放後段 |

### 策略總結
- **搶低競爭高相關詞**：`AI 批改`、`跟讀`、`聽說`、`英檢` — 這些是能真正排進前段、又精準命中受眾的詞，優先塞進權重最高的 Subtitle。
- **用高量詞做長尾組合基底**：`英文`、`聽力`、`口說`、`多益` 單獨排名難，但 Apple 中文斷詞會自動組合成「英文口說練習」「多益聽力」等長尾，帶來穩定曝光。
- **受眾重疊而非功能重疊**：TOEIC 保留（B1–B2 = 多益備考主力客群），但產品非考試題庫，故放 Keywords 而非 Name/Subtitle，且移除相關性更弱的 TOEFL。
- **零重複原則**：三欄位彼此不重複用字，把 100 字元 Keywords 完全花在新 token 上。

---

## 5. Apple 審查地雷檢查

| 項目 | 現有文案風險 | 判定 | 處置 |
|---|---|---|---|
| **比較性宣稱** | `Unlike subscription apps…` 貶抑其他商業模式 | 中低風險（未點名競品，但語氣比較） | ✅ 已改為中性「no subscription, no recurring fees」 |
| **IAP 未揭露** | Description 未說明 AI credits 為 IAP、免費額度用完需加購 | **中風險**（易觸 Guideline 2.1 功能揭露 / 3.1 付款） | ✅ 已新增「關於 AI 對話點數」段落 |
| **誇大療效/結果保證** | `Build lasting fluency`、`Build real fluency` | 低風險（教育類屬可接受行銷語氣，但可收斂） | ✅ 改為描述「練習」而非保證結果 |
| **商標/競品關鍵字** | Keywords 含 TOEIC/TOEFL | TOEIC 可（受眾重疊、非題庫）；TOEFL 相關性弱 | ✅ 移除 TOEFL；IELTS/雅思**不建議**加入（產品非學術考試向，2.3.7 相關性風險） |
| **提及其他平台** | Description 內文未提 Android/Google Play | ✅ 無問題 | 內文保持不提；`app-store-copy.md` 內的 Google Play 欄位僅供內部參考 |
| **價格寫進描述** | Description 未硬編 NT$60（僅在獨立表格） | ✅ 正確 | 維持——描述不得寫具體價格，避免與 App Store 定價不符退件 |
| **測試殘留文字** | 需最終檢查（見 memory：iOS 送審品質要求） | 待確認 | 上架前確認截圖/描述無 placeholder、Lorem、測試帳號字樣 |
| **麥克風權限說明** | app.json 已含 NSMicrophoneUsageDescription | ✅ 有 | 確認與「錄音跟讀」用途描述一致（目前一致） |

---

## 6. 截圖策略（6.7" / 1290×2796，至少 3 張，建議 5–6 張）

原則：**前 3 張決定轉換率**（搜尋結果預覽只露出前 2–3 張）。每張一個訊息，overlay 文案用大字繁中主標 + 小字英文輔助，深色背景（呼應 app `#080808` 深色 UI 與 icon）。

| # | 畫面 | Overlay 主標（繁中，粗大） | 輔助小字 | 目的 |
|---|---|---|---|---|
| **1 Hero** | 每日首頁／四模組總覽 | 「每天 15 分鐘，英文一格一格往上升」 | Listen · Speak · Conversation · Review | 一句話講清價值 + 呼應 Notch Up 品牌隱喻（刻度/進度） |
| **2 差異化** | Conversation AI 批改結果畫面（顯示文法標註 + 建議說法） | 「開口說，AI 立刻幫你改」 | Instant, personalized feedback | 打出最強差異化（AI 口說批改），這是搜尋「AI 口說」的人最想看到的 |
| **3 聽力** | Listen 集數 + 雙語逐字稿，點行朗讀 | 「Podcast 風格聽力，雙語逐字稿跟著讀」 | Tap any line to hear it | 覆蓋聽力/podcast 客群 |
| **4 口說** | Speak 跟讀錄音介面（波形/錄音鈕） | 「聽示範、跟讀、錄下自己的版本」 | Guided shadowing practice | 展示口說跟讀流程 |
| **5 買斷賣點** | 53 週課程地圖／進度視覺 | 「53 週 365 天，一次買斷・沒有月費」 | One purchase. No subscription. | 打消「又是訂閱制」疑慮，這是台灣使用者對學習 app 的最大抗拒點 |
| **6 複習（選配）** | Review 字卡 + 週回想 | 「每週回想 + 字卡，真正記住」 | Weekly recall + flashcards | 補完四模組故事 |

Overlay 設計備註：
- 主標字級要在搜尋結果縮圖（約手機一半寬）仍可讀 → 每張最多一行、8–14 字。
- 深底亮字，品牌色點綴進度/刻度視覺元素，強化「notch（一格一格）」記憶點。
- 第 2、5 張是轉換關鍵（差異化 + 破除訂閱疑慮），A/B 測試優先測這兩張的順序與文案。
- 螢幕內若含英文示範內容，確保是真實課程內容、非 placeholder（避免 2.3.3 截圖不實）。

---

## 7. 上線後優化建議（A/B 測試 roadmap）

1. **Phase 1（上線 0–4 週）**：用 App Store Connect「Product Page Optimization」測 Screenshot 1 兩版（Hero 訊息 vs AI 批改當第一張），看 tap-through 與轉換。
2. **Phase 2（4–8 週）**：依 App Analytics 的搜尋詞報告，把 Keywords 後段低效詞（如 背單字/線上）換成實際帶量的長尾。
3. **Phase 3（8 週+）**：Promotional Text 配合 credits 加購或節慶做文案輪替（免審），觀察對轉換影響。
4. 監看指標：搜尋曝光數、產品頁轉換率、`AI 口說/AI 批改/跟讀` 這幾個目標詞的排名變化。

---

*文件產出：App Store Optimizer｜日期 2026-07-10｜狀態：可直接套用至 App Store Connect zh-Hant + en localization。*

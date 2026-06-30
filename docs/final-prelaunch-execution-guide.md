# Final Pre-Launch Execution Guide
> 建立日期：2026-04-21
> 狀態：Historical / Superseded for content scope
> 用途：提供實作者直接照做的最後修復流程、任務拆解、輸出物格式與驗收關卡
> 搭配文件：[final-prelaunch-remediation-master.md](./final-prelaunch-remediation-master.md)、[pre-launch-checklist.md](./pre-launch-checklist.md)

> 2026-04-29 update:
> Current launch content scope and sign-off criteria are now defined by
> [product-content-scope.md](./product-content-scope.md) and
> [launch-content-quality-signoff.md](./launch-content-quality-signoff.md).
> Articles are active Speak content again; episode inline vocab remains retired.

---

## 0. 這份文件怎麼用

這份文件不是重新定義問題，而是把已確認的問題轉成可執行工作。

閱讀順序固定如下：

1. 先讀 [final-prelaunch-remediation-master.md](./final-prelaunch-remediation-master.md)
2. 再照本文件執行
3. 若要確認 broader launch 項目，再回看 [pre-launch-checklist.md](./pre-launch-checklist.md)

文件分工如下：

- `master brief` 決定什麼是真的問題、什麼不是
- `execution guide` 決定下一位實作者實際要做什麼
- `pre-launch-checklist` 只負責更廣義的上線流程，不負責這次內容修復的真偽判斷

若三者內容衝突：

- 問題定義與優先序以 `master brief` 為準
- 實作步驟與交付格式以本文件為準
- 一般 App 上線流程才看 `pre-launch-checklist`

### 0.1 目前執行狀態

截至 `2026-04-22`，Phase 1–6 的內容修復已完成到 strict mode `PASS`：

- articles import：`PASS`
- article `wordCount`：`PASS`
- W6 / W7 vocab：`PASS`
- closing duplicates：`PASS`
- flashcard example length：`PASS`
- theme alignment：`PASS`

剩餘未完成的不是內容修補，而是環境依賴：

- `seed smoke`
- DB-backed UI smoke

兩者目前都被 Supabase DNS / network 問題阻斷。

因此，若今天有人再接手本文件，優先工作不再是 Phase 2–6 的內容修補，而是：

1. 解開環境 DNS / network blocker
2. 重跑 `scripts/seed.ts`
3. 完成 DB-backed UI smoke
4. 產出 final launch sign-off

---

## 1. 接手者起跑前要先知道的事

### 1.1 目前正式基線

本輪接手時，請直接接受以下基線，不要重新從零猜測：

- `word_count` 不是 `camelCase / snake_case` 接線 bug
- `curriculum / episodes / questions` 的 53 週 theme alignment 目前成立
- questions 與 flashcards 結構層目前沒有新的 blocking issue
- articles 的主問題是 parseability / seed reliability，不是「原始內容大量缺漏」

### 1.2 目前仍存在的正式問題

這一輪只處理以下五項，且順序不可自行改寫：

1. `P0-1` Articles source parseability / seed reliability
2. `P0-2` Articles `wordCount` 大量失真
3. `P1-1` W6–W7 vocab deficit
4. `P1-2` Episode closing lines duplication
5. `P2-1` Flashcard 例句偏短

### 1.3 這次不要浪費時間重做的事

- 不要重寫全年 curriculum
- 不要擴大修改 `content/questions`
- 不要因為文風偏好整批重生成內容
- 不要用舊 audit script 的綠燈輸出宣稱「全產品沒問題」

---

## 2. 本輪工作範圍

### 2.1 主要會碰到的內容檔案

#### Articles

- `content/articles/articles-w01.ts` 到 `content/articles/articles-w53.ts`

目前已知 import 失敗檔案：

- `articles-w04.ts`
- `articles-w07.ts`
- `articles-w09.ts`
- `articles-w12.ts`
- `articles-w13.ts`
- `articles-w14.ts`
- `articles-w15.ts`
- `articles-w16.ts`
- `articles-w17.ts`
- `articles-w19.ts`
- `articles-w20.ts`
- `articles-w30.ts`
- `articles-w41.ts`
- `articles-w51.ts`
- `articles-w52.ts`
- `articles-w53.ts`

#### Episodes

- 主要修補檔案：`content/episodes/week-06.ts`、`content/episodes/week-07.ts`
- closing line dedupe 會視 report 影響多個 `content/episodes/week-*.ts`

#### Flashcards

- `content/flashcards/flashcards-w01-w08.ts`
- `content/flashcards/flashcards-w09-w16.ts`
- `content/flashcards/flashcards-w17-w24.ts`
- `content/flashcards/flashcards-w25-w32.ts`
- `content/flashcards/flashcards-w33-w41.ts`
- `content/flashcards/flashcards-w42-w53.ts`

### 2.2 主要會碰到的程式碼與資料流檔案

- [scripts/seed.ts](../scripts/seed.ts)
- [app/src/data/content-api.ts](../app/src/data/content-api.ts)
- [app/src/data/curriculum.ts](../app/src/data/curriculum.ts)
- [app/src/screens/tabs/SpeakScreen.tsx](../app/src/screens/tabs/SpeakScreen.tsx)

### 2.3 可當作輔助工具、但不能當驗收真相的既有腳本

以下腳本可以拿來加速修復，但修完仍必須回到 canonical verification：

- `scripts/repair-articles-from-episodes.js`
- `scripts/fix-articles-paragraphs.js`
- `scripts/generate-articles-inline.js`
- `scripts/patch-vocab-deficits.js`
- `scripts/patch-vocab-deficits2.js`
- `scripts/fix-duplicate-closing-lines.js`
- `scripts/fix-remaining-dupes.js`
- `scripts/fix-vocab-examples.ts`

原則：

- 可以用它們「產生候選修補」
- 不可以用它們「直接宣布問題已解決」

---

## 3. 實作前 preflight

### 3.1 環境條件

接手者開始前，先確認：

- 已在 repo root 執行 `npm install`
- `npx tsx --version` 可執行
- 可使用一個安全的 development 或 staging Supabase
- 已準備 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`

### 3.2 工作原則

- 先做 verification harness，再修內容
- 先修 articles，再修使用者可見數值，再修品質層內容
- 儘量做 targeted edits，不做無邊界的大規模重生成
- 若用了生成腳本，必須做人工抽查與全量回歸檢查

### 3.3 建立證據目錄

開始之前，先建立一個固定輸出位置。

建議格式：

```text
reports/prelaunch/YYYY-MM-DD/
  baseline/
  phase-1-harness/
  phase-2-articles/
  phase-3-wordcount/
  phase-4-vocab/
  phase-5-closings/
  phase-6-flashcards/
  final/
```

日期以實作當天為準，不要沿用舊日期。

### 3.4 第一輪 baseline 必留的輸出

在還沒改任何內容前，至少留下以下檔案：

- `baseline/validate-episodes.txt`
- `baseline/validate-supporting-content-exclude-articles.txt`
- `baseline/articles-import-check.json`
- `baseline/articles-wordcount-diff.csv`
- `baseline/episode-closing-dupes.json`
- `baseline/flashcard-short-examples.csv`
- `baseline/theme-alignment.json`

若當天已有 staging / development DB 可用，再加：

- `baseline/seed-smoke.txt`

---

## 4. Canonical verification harness 規格

這是本輪第一個正式 deliverable。

### 4.1 建議新增的檔案

建議把這輪驗證腳本集中在 `scripts/prelaunch/`：

- `scripts/prelaunch/check-articles-import.ts`
- `scripts/prelaunch/check-article-wordcount.ts`
- `scripts/prelaunch/check-episode-vocab.ts`
- `scripts/prelaunch/check-episode-closing-dupes.ts`
- `scripts/prelaunch/check-flashcard-example-length.ts`
- `scripts/prelaunch/check-theme-alignment.ts`
- `scripts/prelaunch/run-final-verification.ts`

可以調整檔名，但不要調整責任邊界。

### 4.2 每支檢查腳本的最低責任

#### `check-articles-import`

- 掃過 `content/articles` 全 53 檔
- 使用與 seed 相容的 import 方式
- 列出 failure 檔名
- 只要有一個 failure 就 exit non-zero
- 支援輸出 JSON 報告

#### `check-article-wordcount`

- 掃過所有可解析 articles
- 以單一 canonical algorithm 計算 actual words
- 輸出 `week / day / title / declared / actual / diff`
- 只要有 `abs(diff) > 10` 就視為未通過
- 支援輸出 CSV 或 JSON

#### `check-episode-vocab`

- 掃過 365 集 episodes
- 輸出每集 vocab count
- 至少標出 `< 8` 的集數
- 只要有 `< 8` 就 exit non-zero

#### `check-episode-closing-dupes`

- 對每集最後一句做標準化與分組
- 輸出 duplicate groups、影響集數、episode ids
- 只要 duplicate groups 大於 0 就 exit non-zero，除非 whitelist 明確存在

#### `check-flashcard-example-length`

- 掃過全部 flashcards
- 輸出 `< 12` 詞例句清單
- 至少帶出 `weekNumber / english / exampleSentence / wordCount`
- 支援後續人工挑選優先修補對象

#### `check-theme-alignment`

- 對照 `CURRICULUM.theme`、episode theme、question theme
- 輸出 mismatch 清單
- `0 mismatch` 才算通過

#### `run-final-verification`

- 聚合以上所有檢查
- 清楚輸出 pass / fail
- 不得因單一子檢查失敗就靜默跳過其餘檢查
- 預設應代表 strict mode
- 若使用 waiver flag，輸出必須明確標成 `PASS_WITH_WAIVER`

狀態語義固定如下：

- `PASS`
  - strict mode 通過，無 waiver
- `PASS_WITH_WAIVER`
  - strict mode 原本不通過，但在明確列出的 waiver 被接受後條件式通過
- `FAIL`
  - blocking 項未過，或必要驗證缺失

### 4.3 暫時可先用的現有命令

在 harness 還沒完成前，可先用以下命令當 baseline：

```bash
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js
npx tsx scripts/prelaunch/check-articles-import.ts
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
```

注意：

- 這些只能當過渡檢查
- 最後 sign-off 不得只靠這三條

### 4.4 一律禁止當最終依據的腳本

- `scripts/audit-all-content.js`
- `scripts/deep-audit.js`
- `scripts/audit-review-content.js`

原因已在 `master brief` 記錄，不再重複爭論。

---

## 5. Phase-by-phase 實作流程

### Phase 1 — 建立 verification harness

#### 目標

把這輪所有重要檢查固化成可以重跑、可比對、可留證據的流程。

#### 實作動作

- 建立 `scripts/prelaunch/` 檢查腳本
- 讓每支腳本都支援人類可讀輸出
- 讓每支腳本都能留下結構化報告
- 建立 `run-final-verification` 聚合命令

#### 交付物

- `phase-1-harness/commands.md`
- `phase-1-harness/*.json` 或 `*.csv`
- `phase-1-harness/readme.md` 說明怎麼跑全部檢查

#### 關卡

只有在 harness 可重跑後，才進入 Phase 2。

---

### Phase 2 — 修 Articles parseability / seed reliability

#### 目標

把 `content/articles` 修到 `53 / 53` 可穩定 import，且 seed 流程可完整走完。

#### 優先處理方式

- 先修目前已知 16 個 import failure 檔
- 每修完 1 檔或 1 小批，就重跑 import check
- 不要等全部改完才第一次驗證

#### 編修原則

- 儘量讓長文字串的封裝方式更穩定
- 若某些檔案大量依賴脆弱字串跳脫，優先改成更不易出錯的字串策略
- 不要改變文章語義、段落順序、week_number/day_of_week、topic、title 對應；文章內容不得重新加入 `dateKey` 或固定日曆 lookup
- 不要因修 parseability 順手洗掉原本 vocabulary 或中文內容

#### 若要使用輔助腳本

可參考：

- `scripts/repair-articles-from-episodes.js`
- `scripts/fix-articles-paragraphs.js`
- `scripts/generate-articles-inline.js`

但最終必須回到：

- `check-articles-import`
- `scripts/seed.ts`

#### 交付物

- `phase-2-articles/articles-import-before.json`
- `phase-2-articles/articles-import-after.json`
- `phase-2-articles/failure-diff.md`
- `phase-2-articles/seed-smoke.txt`

#### 關卡

下列條件全部成立才可進入 Phase 3：

- `53 / 53` articles 可 import
- article import failure = `0`
- `scripts/seed.ts` 至少在 development / staging 跑完 articles 階段

若環境阻斷 `scripts/seed.ts`，正式口徑必須寫成：

- `source-side parseability complete`
- `end-to-end seed verification blocked by environment`

在這種情況下，不得把 `P0-1` 直接寫成 fully completed。

---

### Phase 3 — 修 Articles `wordCount`

#### 目標

把 `wordCount` 從手感估算改成可信欄位。

#### Canonical algorithm 契約

接手者若沒有更合理的正式規格，就採以下演算法且整輪固定不變：

1. 以 `article.text` 為唯一計數來源
2. 將 HTML tags 轉成空白
3. `trim`
4. 以 `/\s+/` 切詞
5. 過濾空 token
6. token 數即為 `actual word count`

不要在修到一半時改 tokenization 定義。

#### 實作原則

- source 的 `wordCount` 必須與演算法同步
- seed 後 DB 的 `word_count` 必須與 source 一致
- 若文章內容本身也要順手整理，必須先完成 parseability 穩定化再做
- 不接受「先人工修明顯錯的」這種半套做法

#### 交付物

- `phase-3-wordcount/algorithm.md`
- `phase-3-wordcount/wordcount-before.csv`
- `phase-3-wordcount/wordcount-after.csv`
- `phase-3-wordcount/outliers-after.json`

#### 關卡

下列條件全部成立才可進入 Phase 4：

- 全量 articles 都可被計數
- `abs(declared - actual) <= 10`
- 最佳狀態是 `0` 篇超過 10 字誤差

---

### Phase 4 — 修 W6 / W7 vocab deficit

#### 目標

把 `content/episodes/week-06.ts` 與 `content/episodes/week-07.ts` 的 14 集 episode 全部補到 `>= 8 vocab`。

#### 實作策略

- 盡量在既有 dialogue lines 上新增 vocab，不擴張結構
- 每集至少補 2 個有學習價值的詞
- 避免只補 extremely basic words
- 避免近義重複造成假性詞彙量

#### 定義什麼叫「有學習價值」

- 對應當集主題
- 在真實口語或職場語境中常用
- 中文定義自然，不是機翻
- 看得出為什麼值得標成 vocab

#### 可參考腳本

- `scripts/patch-vocab-deficits.js`
- `scripts/patch-vocab-deficits2.js`

這些腳本可以當候選 patch 來源，但不代表目前 W6 / W7 已被修好。

#### 交付物

- `phase-4-vocab/vocab-before.json`
- `phase-4-vocab/vocab-after.json`
- `phase-4-vocab/edited-episodes.md`

#### 關卡

下列條件全部成立才可進入 Phase 5：

- W6 全 7 集 `>= 8`
- W7 全 7 集 `>= 8`
- 無明顯重複、低價值湊數詞

---

### Phase 5 — 修 Episode closing line duplication

#### 目標

把跨集重複尾句降到 `0`，或留下極少數有理據的 whitelist。

#### 實作策略

- 先跑 duplicate report，不要盲修
- 只處理「每集最後一句」
- 保留最自然、最貼題的一個版本
- 其餘版本改成與該集語境相連的專屬收束句

#### 編修原則

- 不要只把同一句換同義字
- 不能讓收尾句和前文脫節
- 改尾句後不能破壞 episode speaker consistency

#### 可參考腳本

- `scripts/fix-duplicate-closing-lines.js`
- `scripts/fix-remaining-dupes.js`

提醒：

- 這些腳本可以加快初稿修補
- 但腳本寫回的文字仍要人工閱讀

#### 交付物

- `phase-5-closings/dupes-before.json`
- `phase-5-closings/dupes-after.json`
- `phase-5-closings/whitelist.json`
- `phase-5-closings/edited-endings.md`

#### 關卡

下列條件全部成立才可進入 Phase 6：

- duplicate groups = `0`
- 若非 0，whitelist 必須極小且有逐條理由

---

### Phase 6 — 修 Flashcard 短例句

#### 目標

把最弱的 flashcard 語境補強到可上線品質。

#### 優先順序

先修：

- 抽象詞
- 概念詞
- 片語詞
- 若例句太短導致語意不清的卡片

後修：

- 具體名詞且語境已清楚的卡片

#### 驗修原則

- 抽象詞優先達到 `>= 12` 詞
- 具體詞原則上不低於 `10` 詞
- 不為了拉長句子而加入空泛 filler
- 例句要真的示範詞怎麼用，不是只是提到那個詞

#### 可參考腳本

- `scripts/fix-vocab-examples.ts`

提醒：

- 這支腳本可拿來生成候選例句
- 生成結果必須人工抽查自然度與精準度

#### 交付物

- `phase-6-flashcards/short-examples-before.csv`
- `phase-6-flashcards/short-examples-after.csv`
- `phase-6-flashcards/edited-cards.md`

#### 關卡

- 主要優先清單已修完
- 剩餘項若保留，必須能說明為何不影響 launch

---

### Phase 7 — Seed、UI smoke test、final sign-off

#### 目標

證明前面所有修補不是停留在 source 層，而是真的能走到資料與 UI。

#### 必做事項

- 在 development / staging 重跑一次 `scripts/seed.ts`
- 確認 `articles` table 有 365 筆
- 抽樣檢查 Speak 頁顯示的字數
- Listen / Speak / Conversation / Review 各跑至少一輪 smoke test
- 重新跑全量 verification

#### UI smoke test 最低樣本

至少覆蓋：

- 一個曾經 article import failure 的週次
- 一個 W6 / W7 episode
- 一個曾修過 closing line 的 episode
- 一個曾修過 flashcard 例句的週次

#### 交付物

- `final/seed-smoke.txt`
- `final/final-verification.txt`
- `final/ui-smoke.md`
- `final/signoff-summary.md`

#### 可宣稱完成的條件

- P0 全部完成
- P1 全部完成
- 若 P2 未完成，已明確標註 waiver
- 證據包完整

補充：

- 若 `seed smoke` 未完成，整體不得寫成 final launch sign-off complete
- 若使用 waiver，final sign-off 必須同時給出 strict result 與 waived result

---

## 6. 不能宣稱完成的情況

以下任一條成立，都不能說「內容已可上線」：

- articles 仍未 `53 / 53 importable`
- 只修 source，但沒有做 seed smoke
- `wordCount` 只修部分文章
- W6 / W7 任一集仍低於 8 vocab
- duplicate closing report 仍顯示重複，但沒有 whitelist
- flashcard 修補只靠 AI 生成，沒有人工抽查
- 沒留下 evidence package

---

## 7. 每次交棒都必須附的內容

若執行人不是同一位一路做完，每次 handoff 至少附上以下資訊：

- 本次實際修改的檔案範圍
- 本次完成到哪個 phase
- 本次重跑了哪些檢查
- 哪些檢查還沒重跑
- 目前最新 evidence 目錄
- 目前還卡住的 blocker
- 是否有新增風險或 launch waiver

---

## 8. 建議的交棒訊息格式

可直接複製以下模板：

```md
# Prelaunch Handoff

## 本次範圍
- 修改檔案：
- 影響模組：

## 完成進度
- 已完成 phase：
- 未完成 phase：

## 已重跑檢查
- 

## 尚未重跑檢查
- 

## 最新證據位置
- `reports/prelaunch/YYYY-MM-DD/...`

## 目前 blocker
- 

## Launch waiver
- 無 / 有：

## 接手者下一步
1. 
2. 
3. 
```

---

## 9. 建議的 final sign-off 格式

完成時的摘要也請固定格式，避免下一位審查者再重問一次：

```md
# Final Content Sign-off

## 結論
- 可上線 / 不可上線

## P0
- P0-1：
- P0-2：

## P1
- P1-1：
- P1-2：

## P2 / Waiver
- P2-1：

## 驗證結果
- strict result：
- waived result（若有）：
- articles import：
- seed smoke：
- wordCount：
- W6 / W7 vocab：
- closing dupes：
- flashcard examples：
- theme alignment：
- UI smoke：

## 證據位置
- `reports/prelaunch/YYYY-MM-DD/final/...`
```

---

## 10. 實作者第一天的最短路徑

如果接手者時間有限，第一天最少要完成下面 5 件事：

1. 建立 `reports/prelaunch/<today>/`
2. 固化 `check-articles-import` 與 `check-article-wordcount`
3. 固化 `check-episode-vocab` 與 `check-episode-closing-dupes`
4. 跑 baseline，確認目前數字與 `master brief` 一致
5. 開始修 16 個 articles import failure 檔案

第一天不要做的事：

- 不要先修 flashcards
- 不要先微調文風
- 不要先改 UI
- 不要先碰 curriculum

---

## 11. 最後提醒

這輪工作真正要交付的不是「修過很多內容」，而是：

- 一套不會再誤判的檢查方式
- 一批能 seed、能顯示、能驗證的內容
- 一份別人接手也不會迷路的證據包

只要做到這三件事，這份修復就不只是一次補洞，而是把產品內容帶到可上線、可維護的狀態。

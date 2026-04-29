# Final Pre-Launch Remediation Master
> 建立日期：2026-04-21
> 狀態：Historical / Superseded for content scope
> 用途：作為 SAV / Notch Up: Daily English 最後上線前修復的唯一主文件
> 讀者：產品負責人、工程、內容編輯、後續 AI 審查者
> 配套文件：[final-prelaunch-execution-guide.md](./final-prelaunch-execution-guide.md)、[pre-launch-checklist.md](./pre-launch-checklist.md)

> 2026-04-23 update:
> This document records the previous article-era remediation plan. Current launch
> content scope and sign-off criteria are now defined by
> [product-content-scope.md](./product-content-scope.md) and
> [launch-content-quality-signoff.md](./launch-content-quality-signoff.md).
> Articles are legacy archive content; episode inline vocab has been retired.

---

## 0. 文件定位

這不是一般的待辦清單，也不是單純的內容報告。

這份文件的目的是：

- 定義上線前最後一輪修復的**唯一優先序**
- 明確區分**已驗證事實**、**已被推翻的假設**、**待修問題**
- 為後續 AI 與人工審查建立**同一套證據規則**
- 避免修錯問題、重複調查、或被不可靠腳本誤導

若本文件與較舊的 ad-hoc 討論衝突：

- 以本文件為最後修復階段的判斷基準
- 產品願景與功能範圍仍以 [SAV-spec-zh.md](./SAV-spec-zh.md) 為準
- 實作流程、命令、交付物格式以 [final-prelaunch-execution-guide.md](./final-prelaunch-execution-guide.md) 為準

### 0.1 目前狀態快照

截至 `2026-04-22`，本 repo 的內容面狀態如下：

- strict content verification 已達 `PASS`
- 不再需要 flashcard 內容 waiver
- 內容 source 層目前沒有已知 blocker
- final launch sign-off 仍未完成，原因是 Supabase DNS / network 導致 `seed smoke` 與 DB-backed UI smoke 無法完成

因此，本文件目前的角色同時包含：

- 已完成修復的審查基準
- 未來重跑驗證時的基準文件
- 環境 blocker 解除後做 final sign-off 的依據

---

## 1. 執行原則

### 1.1 修復優先順序原則

- 先修**內容供應鏈與可維護性**，再修使用者可見的內容品質
- 先修**會阻斷 seed / deploy / verify** 的問題，再修純體驗優化
- 先修**高信心、可驗證**的問題，不修只靠直覺或表面搜尋得出的猜測

### 1.2 這一輪不做的事

- 不重設全年課程主題
- 不重新定義產品定位
- 不改動 365 天滾動式 schedule 的核心規則
- 不因個別文風偏好而全面重寫整套內容

### 1.3 Definition of Done

這輪修復完成的最低標準：

- 全部 P0 項目完成且有證據
- 全部 P1 項目完成且有證據
- P2 若未完成，必須明確標註為 launch waiver，並由產品負責人接受風險
- 所有驗收必須基於可重跑的檢查，而不是口頭確認
- `P0-1` 只有在「source-side parseability」與「end-to-end seed verification」都成立時，才可標記為真正完成
- `PASS_WITH_WAIVER` 不等於嚴格 `PASS`；只有在 waiver 被明確接受時，才可作為條件式通過

### 1.4 執行前提與工作邊界

這份文件預設接手者具備以下條件：

- 已在 repo root 執行 `npm install`
- 可使用 `npx tsx`
- 可存取一個安全的 development 或 staging Supabase 環境
- 已知 `scripts/seed.ts` 需要 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`

本輪修復的 DB 驗證原則：

- 先在 development / staging 做 seed 與驗收
- 未完成全量驗收前，不直接把本文件當成 production 操作指令
- 若要重跑 seed，必須先確認目標環境可接受 table upsert / truncate-insert 行為

工作邊界補充：

- 本輪主要修的是 `content/articles`、`content/episodes`、少量 `content/flashcards`
- `content/questions` 目前未發現 blocking 問題，除非修復造成回歸，否則不應擴大改寫
- 不要把「想順手整理文風」混進本輪 scope

---

## 2. 已驗證基線

以下內容已由可重跑的檢查與程式碼路徑確認，可視為目前的基線事實。

### 2.1 已確認無誤的事

#### A. `word_count` 不是 UI 欄位接錯 bug

這條過去曾被誤判，現已撤回。

已驗證資料流如下：

- 文章 source 檔使用 `wordCount`
- seed 時會轉成 DB 欄位 `word_count`
- DB schema 定義的就是 `word_count`
- App 端 `ArticleRow` 型別也是 `word_count`
- `SpeakScreen` 顯示 `article.word_count` 是正確用法

對照檔案：

- [scripts/seed.ts](../scripts/seed.ts)
- [backend/supabase/migrations/20260320000000_initial_schema.sql](../backend/supabase/migrations/20260320000000_initial_schema.sql)
- [app/src/data/content-api.ts](../app/src/data/content-api.ts)
- [app/src/screens/tabs/SpeakScreen.tsx](../app/src/screens/tabs/SpeakScreen.tsx)

結論：

- `undefined words` 若真的出現，應優先懷疑資料缺值、seed 失敗、或 article source 解析失敗
- 不應再把這條描述成 `camelCase / snake_case` 接線錯誤

#### B. `curriculum / episodes / questions` 的週主題對齊目前成立

已檢查 53 週：

- `CURRICULUM.theme`
- `Episode.theme`
- `ConversationQuestion.theme`

結果：`0 mismatch`

結論：

- 不應再把「四種內容主題不一致」列為目前的主要修復問題
- 若後續修復文章或詞彙時造成對齊破壞，才算新回歸問題

#### C. Episodes / Questions / Flashcards 的基礎完整性目前大致成立

重新檢查結果：

- episodes 總數：`365`
- questions 總數：`365`
- flashcards 總數：`583`
- `TOTAL_PROGRAM_DAYS`：`365`

額外 sanity check：

- episodes 結構欄位未見新的 blocking 問題
- questions 未發現缺 hint / tip 或大量重題
- flashcards 未發現缺中文、缺例句、同週同詞重複等新問題

結論：

- 本輪不應把修復重心轉去 questions 或 flashcards 結構層
- flashcards 仍有「例句偏短」品質問題，但不是資料完整性問題

#### D. Articles 的問題是「可解析性不穩」，不是「原始內容大量缺漏」

source 層重新掃描結果顯示：

- `dateKey` 欄位出現：`365`
- `wordCount` 欄位出現：`365`
- `textZh` 欄位出現：`365`
- `vocabulary` 欄位出現：`365`

這代表：

- 原始 article block 並不是只剩 359 篇
- `359` 是目前以保守方法可穩定抽取與計數的 block 數，不是正式總量
- 真正的問題是部分 article source 檔無法穩定 import，導致後續統計與 seed 信心下降

### 2.2 已確認存在的問題

#### A. Articles source parseability 與 seed 可靠性有實質風險

使用 `tsx` 對 `content/articles` 做逐檔 import 掃描結果：

- 總檔案數：53
- 無法正常 import：16

失敗檔案如下：

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

這不是文風問題，而是內容資產可靠性問題。

#### B. Articles `wordCount` 大量失真

對 359 個可辨識 article block 做獨立字數計算後：

- `121 / 359` 篇的 `wordCount` 與實際字數差距超過 50 字
- 量級約 `33%–36%`

注意：

- 359 不是正式產品文章總數，而是目前在 source 層可穩定抓出的 article block 數
- 由於 article source parseability 本身有問題，這個比例應視為**保守下限**

典型案例：

- `articles-w21.ts` 第一篇：`wordCount = 490`，實際約 `315`

這條是使用者可見問題，因為 `SpeakScreen` 會直接顯示 `word_count`

#### C. W6–W7 每集 vocab 都只有 6 個，低於規格

獨立統計結果：

- Week 06：7 集，每集都是 6 個 vocab
- Week 07：7 集，每集都是 6 個 vocab

合計：

- `14 / 14` 集低於 `validate-episodes.js` 內定義的 `>= 8`

這是明確規格不符，不是主觀品質問題。

#### D. Episodes 結尾台詞重複仍存在

對 365 集 episode 的最後一句做完整比對結果：

- 重複群組：10 組
- 受影響集數：21 集

這條已知且 repo 內已有修復腳本痕跡，代表問題真實存在，但範圍不是先前誤判的 52 集。

#### E. Flashcard 例句偏短，但不是 blocking issue

以可 import 的 flashcard 模組做統計：

- 總 flashcards：583
- `< 12` 詞例句：86 張
- 佔比：約 `14.8%`

現況判讀：

- 問題存在
- 但多數落在 8–11 詞，屬於語境偏薄，不是完全沒有語境
- 不應被排在最前面

---

## 3. 證據規則

這一節是給之後所有 AI 與人工審查者的規則。若不遵守，容易再次得出錯誤結論。

### 3.1 證據等級

#### Level A：可執行、可重跑、與真實資料流一致

例如：

- `tsx` 可 import module
- 實際 seed 路徑
- DB schema
- App 真正取值路徑
- 全量比對腳本

這是最高信任等級。

#### Level B：結構化統計，但仍依賴部分假設

例如：

- 對 source 內容做字數統計
- 對固定欄位做 regex 抽取

可以用，但要附限制。

#### Level C：表面搜尋或片段 grep

例如：

- 搜一兩個 closing line
- 用關鍵字猜測同主題是否重複

只能作為線索，不能直接升格為結論。

### 3.2 已知不可靠或不能單獨採信的腳本

#### `scripts/audit-all-content.js`

問題：

- loader 解析失敗時會直接 `return []`
- 這會讓「0 issues」看起來像真結果，但其實可能只是內容沒被載入

#### `scripts/deep-audit.js`

問題：

- 內部仍帶有過時的 episode 期望值 `371`
- loader 同樣會在解析失敗時靜默回傳空陣列

#### `scripts/audit-review-content.js`

問題：

- 現況下直接用 `node` 跑會有 import resolution 問題
- 不能拿失敗輸出當成內容品質結論

### 3.3 未來 AI 審查者必須遵守的規則

- 不得跳過 seed / schema / UI 資料流，直接從 source 欄位名稱推論前端 bug
- 不得用 regex-only 統計覆蓋 Level A 證據
- 不得用單一腳本的成功輸出宣稱「已全面驗證」
- 若腳本可能吞錯，必須在報告中明講
- 若某一條結論只來自 grep，必須標為「待驗證線索」，不能標為「已確認問題」

---

## 4. 先做的事：建立 canonical verification harness

這不是獨立問題項，但它是所有修復開始前的必要前置條件。

### 4.1 必須新增或補強的驗證能力

在實際修內容前，先建立一組可重跑的 final verification scripts，至少覆蓋：

- `articles` 53 檔是否全部可 import
- `scripts/seed.ts` 是否可完整執行到 articles seeding
- 每篇文章 `wordCount` 與實際字數差異
- W6 / W7 每集 vocab 數量
- episodes 最後一句重複群組
- flashcards `< 12` 詞例句清單
- `curriculum / episodes / questions` 的主題對齊

### 4.2 這組 harness 的目的

- 讓修復前後能做 diff
- 讓未來 AI 不用重新發明檢查方法
- 讓 sign-off 建立在同一套基準上

### 4.3 完成標準

- 每個檢查都有單一命令可重跑
- 失敗時非靜默失敗，必須 exit non-zero 或至少清楚列出失敗檔案
- 結果能被人工閱讀，也能被 AI 摘要

### 4.4 接手者第一天就該補出的命令清單

若下一位接手者要直接開始做事，至少要先把以下檢查固化成可重跑命令：

- `articles-import-check`
  目的：掃過 `content/articles` 53 檔，列出 import failure 檔名並 exit non-zero
- `articles-wordcount-check`
  目的：輸出每篇文章 `declared / actual / diff`
- `episodes-vocab-check`
  目的：列出 `< 8 vocab` 的 episode id
- `episode-closing-dedupe-check`
  目的：列出重複 closing line 群組與受影響 episode
- `flashcard-example-length-check`
  目的：列出 `< 12` 詞例句清單，並至少標註來源週次與字詞
- `theme-alignment-check`
  目的：重新確認 `curriculum / episodes / questions` 仍為 `0 mismatch`
- `seed-smoke-check`
  目的：在 development / staging 環境驗證 `scripts/seed.ts` 可完整跑完

命名不是強制，但輸出責任是強制。

### 4.5 在 canonical harness 完成前，可先使用的現成命令

以下命令可作為接手者的第一輪 baseline，但不能取代第 4.1 節要求的正式 harness：

- `node scripts/validate-episodes.js`
- `node scripts/validate-supporting-content.js --exclude-articles`
- `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts`

說明：

- `validate-episodes.js` 目前可穩定抓到 W6 / W7 vocab deficit
- `validate-supporting-content.js --exclude-articles` 可先檢查 questions / flashcards，不被 article loader 問題干擾
- `scripts/seed.ts` 是唯一需要對照真實資料流的 seed 路徑

禁止做法：

- 不要把 `audit-all-content.js`、`deep-audit.js`、`audit-review-content.js` 當成最後 sign-off 依據
- 不要只看 console 成功字樣，不看它是否吞錯

---

## 5. 最終修復優先序

以下優先序為本輪唯一正式排序。

| 優先 | 項目 | 性質 | 是否封鎖上線 |
|------|------|------|--------------|
| P0-1 | Articles source parseability / seed reliability | 內容供應鏈 | 是 |
| P0-2 | Articles `wordCount` 大量失真 | 使用者可見資料正確性 | 是 |
| P1-1 | W6–W7 vocab deficit | 內容規格違反 | 是 |
| P1-2 | Episode closing lines duplication | 內容品質 | 是 |
| P2-1 | Flashcard 例句偏短 | 內容厚度優化 | 否，但強烈建議完成 |

---

## 6. 各項修復定義與驗收標準

### P0-1 — Articles source parseability / seed reliability

### 問題定義

目前 53 個 article source 檔中有 16 個無法被 `tsx` 穩定 import。這代表：

- source 資產不是穩定可維護的
- seed 流程無法被完全信任
- 任何依賴 import 的自動檢查都有風險失真

### 目標

讓 `content/articles` 成為可被穩定 import、seed、驗證、維護的內容資產集合。

### 實作要求

- 修正字串轉義與文章內容封裝方式
- 不允許留下只在某些 loader 下勉強可讀的檔案
- 修完後應可用同一種 import 路徑掃過全部 53 檔
- 若需要，將長文 text / textZh 改成更穩定的字串策略，但不得改變使用者看到的內容語義

### 驗收標準

- `P0-1A` source-side completion：
  - `53 / 53` article modules 可被 `tsx` import
  - article import sweep 為 0 failure
- `P0-1B` end-to-end verification：
  - `scripts/seed.ts` 的 articles 階段可完整跑完
  - seed 後 `articles` table 應有 365 筆對應 row

只有 `P0-1A` 達成時，不可把 `P0-1` 寫成 fully completed。
若因 DNS、network、credentials 或環境策略阻斷 `P0-1B`，正式說法必須是：

- `source-side complete`
- `end-to-end seed verification blocked by environment`

### 不可接受的完成狀態

- 只修可以 seed 的幾篇，放著其餘 source 檔繼續壞
- 靠人工跳過錯誤檔案完成 seed
- 讓檢查腳本吞錯後表面通過

---

### P0-2 — Articles `wordCount` 大量失真

### 問題定義

大量文章的 `wordCount` 與實際字數有顯著落差，且這個欄位會直接顯示在使用者介面上。

這不是美感問題，是資料正確性問題。

### 目標

將 `wordCount` 變成可被信任的衍生欄位，而不是手填近似值。

### 實作要求

- 定義單一 canonical word count algorithm
- 用該演算法重新計算所有文章的 `wordCount`
- 不接受「人工大概修一下」的做法
- 修完後 source 與 DB 應一致

### 建議演算法

- 去除 HTML tags
- 以空白切詞
- 採固定 tokenizer，不因審查者喜好變動

### 驗收標準

- `wordCount` 不再是手感數字
- 所有文章 `abs(declared - actual)` 應 `<= 10`
- 最佳狀態是 `0` 篇超過 10 字誤差
- `SpeakScreen` 顯示的數字需與同一演算法一致

### 補充說明

`P0-1` 與 `P0-2` 的先後可依當前目標微調：

- 若當前目標是內容管線穩定，先做 `P0-1`
- 若當前目標是先解除使用者誤導，`P0-2` 可先局部處理

但正式結案前，兩者都必須完成。

---

### P1-1 — W6–W7 vocab deficit

### 問題定義

Week 06 與 Week 07 共 14 集 episode，每集只有 6 個 inline vocab，低於目前規格 `>= 8`。

### 目標

補齊到每集至少 8 個 vocab，且不是為了湊數新增低價值或不自然詞條。

### 實作要求

- 每集至少新增 2 個真正有學習價值的詞彙項
- 中文解釋必須自然，不得只翻字面
- 詞彙應服務當集主題與學習用途，不得只是把普通詞硬標成 vocab

### 驗收標準

- W6 全 7 集 `>= 8 vocab`
- W7 全 7 集 `>= 8 vocab`
- 追加詞彙不應明顯降低整體自然度

### 不可接受的完成狀態

- 用過於普通、沒有學習價值的詞湊數
- 用重複或近乎同義的 vocab 偽造數量

---

### P1-2 — Episode closing lines duplication

### 問題定義

目前仍有 10 組重複尾句，影響 21 集。

這會讓後半段 episode 對話收束顯得模板化，降低角色真實感與內容新鮮度。

### 目標

消除跨集重複尾句，讓每集結束句更像該集專屬收束，而不是共用模板。

### 實作要求

- 針對最後一句做全量 dedupe
- 優先保留最自然、最貼題的一個版本
- 被替換的句子必須與當集主題、前文語境相連

### 驗收標準

- 最後一句跨集重複群組降為 `0`
- 若有刻意保留重複，必須建立 whitelist 並說明原因

### 補充

repo 內既有：

- [scripts/fix-duplicate-closing-lines.js](../scripts/fix-duplicate-closing-lines.js)
- [scripts/fix-remaining-dupes.js](../scripts/fix-remaining-dupes.js)

但不得因為「已有修復腳本」就假設問題已完全處理。

---

### P2-1 — Flashcard 例句偏短

### 問題定義

86 張 flashcard 的例句少於 12 詞，整體語境偏薄。

### 目標

優先補強抽象詞與難詞的語境深度，讓使用者更容易理解該詞在真實語境中的用途。

### 實作要求

- 先修抽象詞、概念詞、片語詞
- 具體名詞可接受略短，但仍需有可理解語境
- 不追求句子變長而變空泛

### 驗收標準

- 抽象詞 flashcards 應優先達到 `>= 12` 詞
- 具體詞 flashcards 原則上不低於 `10` 詞，除非語境非常清楚
- 修後例句需保留自然口語感

### 問題定位

這條是內容品質優化，不是 blocking issue。

---

## 7. 建議實作順序

實作必須按以下順序進行，否則容易重工：

1. 建立 canonical verification harness
2. 修 `articles` parseability
3. 重新跑 import sweep
4. 修 `wordCount` 計算與同步策略
5. 重新 seed staging / development DB
6. 修 W6–W7 vocab deficit
7. 修 duplicate closing lines
8. 修 flashcard 短例句
9. 跑全量驗證
10. 做 UI smoke test

原因：

- 不先修 articles source，後面所有字數、seed、QA 都會不穩
- 不先定義 word count 演算法，之後會反覆計數與反覆改數字
- vocab / closing lines / flashcards 都是內容品質層，應建立在管線穩定後處理

### 7.1 每個階段的明確交付物

為避免接手者做到一半又重新定義完成標準，每個階段至少要交出以下輸出：

1. harness 階段：
   `reports/prelaunch/<date>/baseline/` 內的檢查結果
2. articles parseability 階段：
   修復前後的 import failure diff
3. wordCount 階段：
   全量 `declared / actual / diff` 報表與採用的演算法說明
4. vocab deficit 階段：
   W6 / W7 補詞前後 count 對照
5. closing dedupe 階段：
   duplicate group 歸零或 whitelist 說明
6. flashcard 例句階段：
   修補清單與修補後統計
7. final verification 階段：
   可重跑的總驗收結果與 UI smoke evidence

若接手者沒有留下這些輸出，下一輪審查仍會重新回到人工猜測。

---

## 8. 上線前最終驗收

以下項目全部通過，才算本文件完成。

### 8.1 內容供應鏈

- [ ] 53 個 article source 檔全部可 import
- [ ] `scripts/seed.ts` 可完整跑完 articles 階段
- [ ] seed 完成後內容表數量正確

### 8.2 使用者可見資料正確性

- [ ] `word_count` 與實際字數差異達成驗收門檻
- [ ] Speak 頁顯示的字數已抽樣確認正確

### 8.3 內容規格

- [ ] W6 / W7 全 14 集達到每集至少 8 vocab
- [ ] 重複 closing lines 歸零或有 whitelist

### 8.4 內容品質

- [ ] flashcards 短例句已完成優先修補
- [ ] 修補沒有破壞既有主題對齊

### 8.5 回歸檢查

- [ ] `curriculum / episodes / questions` 53 週主題仍然 0 mismatch
- [ ] flashcards 總數仍為 583，除非有正式範圍變更
- [ ] `TOTAL_PROGRAM_DAYS` 仍為 365
- [ ] Listen / Speak / Conversation / Review 四個內容模組可正常取到資料

### 8.6 交付證據包

每次提交「本輪修復已完成」時，必須附上以下證據：

- [ ] article import sweep 結果
- [ ] `wordCount` diff report
- [ ] seed 執行結果摘要
- [ ] W6 / W7 vocab count report
- [ ] duplicate closing lines report
- [ ] flashcard 短例句修補前後統計
- [ ] 至少一輪 Listen / Speak / Conversation / Review 的 UI smoke evidence

沒有證據包，不算完成。

### 8.7 最終狀態字典

本輪 sign-off 的狀態字詞只允許以下三種：

- `PASS`
  - 嚴格模式全數通過，無 waiver
- `PASS_WITH_WAIVER`
  - 嚴格模式本應失敗，但在明確列出的 waiver 被產品接受後，條件式通過
- `FAIL`
  - 任一 blocking 項未通過，或 end-to-end 驗證缺失

補充規則：

- `PASS_WITH_WAIVER` 必須明講是哪一條 waiver
- `PASS_WITH_WAIVER` 不得描述成 strict pass
- 若 `seed smoke` 或 DB-backed smoke 未完成，整體不得寫成 final launch sign-off complete

### 8.8 最低 handoff 內容

如果這一輪修復不是由同一個人一路做完，而是要交棒給下一位 AI 或工程師，交棒訊息至少要包含：

- 本次修改碰到的內容模組與檔案範圍
- 哪些檢查已重跑，哪些還沒重跑
- 若 articles 仍未 `53 / 53 importable`，目前卡住的確切檔名
- `wordCount` 演算法是否已定稿
- 是否已完成一次 staging seed
- 是否仍有 launch waiver

缺任一項，都不算可安全交接。

---

## 9. 給未來 AI 的審查指引

### 9.1 先看什麼

後續 AI 若接手，請先讀：

- 本文件
- [scripts/seed.ts](../scripts/seed.ts)
- [app/src/data/content-api.ts](../app/src/data/content-api.ts)
- [app/src/data/curriculum.ts](../app/src/data/curriculum.ts)
- [app/src/screens/tabs/SpeakScreen.tsx](../app/src/screens/tabs/SpeakScreen.tsx)

### 9.2 不要再重犯的誤判

- 不要把 source 的 `wordCount` 直接推論成前端欄位 bug
- 不要把單一 grep 搜到幾句重複，就推成「全產品大量重複」
- 不要把 loader 吞錯的稽核腳本輸出，當成內容真的沒問題

### 9.3 審查時必須回答的五個問題

每次審查結束，至少回答：

1. 這個結論是來自 Level A 還是 Level B / C 證據？
2. 我是否跳過了 seed / schema / UI 資料流？
3. 這個問題是使用者可見、內容供應鏈、還是純內容品質？
4. 我提出的數字是否有方法限制？
5. 我是否把「線索」寫成了「結論」？

---

## 10. 附錄

### 10.1 目前正式採信的優先序

1. Articles source parseability / seed reliability
2. Articles `wordCount` 大量失真
3. W6–W7 vocab deficit
4. Episode closing lines duplication
5. Flashcard 例句偏短

### 10.2 已被推翻、不得再當主結論使用的說法

- `SpeakScreen` 因 `word_count / wordCount` 命名不一致而永遠顯示 `undefined`
- 約 10–15 週四種內容主題不一致
- 52 集 episodes 都有重複結尾台詞

### 10.3 這份文件的角色

這份文件是：

- 最後修復的 master brief
- 之後與其他 AI 協作時的審查基準
- 驗收時的唯一優先序來源

這份文件不是：

- 全產品 PRD
- 上架 checklist 的替代品
- 無需證據即可更新的主觀觀察筆記

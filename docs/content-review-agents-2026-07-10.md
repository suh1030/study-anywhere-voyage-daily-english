# 自動化多 agent 深度內容審查（2026-07-10）

> 方法：把全部內容依週切成 9 塊，派 9 個平行 agent 逐項深審（未抽樣），
> 加上規則面全域掃描（scripts/review/scan-objective.ts、scan-template-residue.ts）。
> 審查總量：365 集、365 篇文章、365 題口說、583 字卡。
> findings 原始檔在 scratchpad/review-findings/；標記已寫入 scripts/review/marks.json（4321 可視）。

## 一句話結論

**文章、口說題、字卡三類基本上乾淨、可上線；問題幾乎全部集中在「集數（Listen）對白」，且是系統性的模板／鷹架殘留與中英脫鉤——影響 365 集中的約 135 集，先前的自動 validator 與人工稽核都沒抓到。episodes 在修完前不算 ship-ready。**

## 客觀規則面（已修，commit 6a59bf9）

全域掃描後修正並驗證：網絡→網路（25 處）、合同→合約、默認→預設、激活→重新啟動、
而且而且→而且（×2）、W23D5 contact→contract。簡體字 0 殘留、字卡跨週重複 0。
在線上／單車／空調／水平線／eye contact 等經 context 檢查為正確台灣用語，未動。

## 主觀深審：三個系統性缺陷（集中在 episodes）

規則掃不出、需 AI 逐句讀的部分。9 個 agent 抽樣 fail 50 項，但規則面 grep 後發現
真實範圍遠更大（181 命中／135 集）：

### 1. 罐頭中文與英文脫鉤（en≠zh）— 最嚴重，53 集
近期 commit「依英文開場句改寫消除口頭禪」只改了**英文**、**中文沒同步**，導致固定罐頭
中文句被套在意思完全不同的英文上。學習者做中英對照會直接被誤導。
- 「還是我把它說得太整齊了？」出現 **45 次**（英文其實是 "Would you say it works like
  that in real life?"、"Is that how you would explain it?"、"Does that match what you
  mean?" 等各不相同的句子）
- 「這感覺就是很對的收尾／結尾」7 次（英文已改成有實質內容的收尾句）
- 「這句話我會記很久／這句我應該會記很久」4 次（英文為 "I had not connected those two
  things before…" 等）
- 另有零星硬誤譯：W08D5、W30D2、W52 多句、W51D5「nervous 系統」應為「神經系統」

### 2. 教師腔 meta 鷹架洩入角色對白（AI 味）— 71 集
生成時的教學鷹架句混進了 Mira/Jamie 的台詞，打破「兩個人對話」的沉浸感，且不少
「承諾要給例句卻沒給」造成 coherence 斷裂：
- 「For listening practice, notice the shape of this sentence」11 次（直接對 learner 喊話）
- 「A real-life example helps here.」11 次（多數後面沒有真的給例句）
- 「Let's bring it down to one situation」12 次、「On an ordinary day, the sentence gets
  simpler」10 次、「A small thing matters here:」、「The quiet part is this:」、
  「That is the piece I want learners to notice」、「The copyable sentence is this」等

### 3. 佔位標題未替換 — 29 集
Part 標題「What It Revealed About Language」被當模板佔位符，散落 29 集，內容大多與
language 無關（如 W25D2 講成功的回饋、W28D1 講攝影練習、W30D7 講閱讀習慣）。

### 其他個別問題（agent 抽樣）
- coherence：ep:W05D2（說要給更好說法卻沒給句子）、ep:W13D6（該教的處理句型整段缺）、
  ep:W23D1 標題「The Basket Gets Personal」與內容無關
- provenance：ep:W06D2 keyPhrases 8 個有 7 個與該集脫鉤；W20D7 trade-off、W21D2
  tunnel vision 掛錯集；art:W48D7 communal、art:W20D6 synthesize 未在文章出現
- 逐字重複台詞：ep:W18D5 = ep:W17D6（一字不差）
- 中文夾大量未翻英文（W08–W10、W50–W52，屬 code-switching 風格爭議，見政策問題）

## 需使用者拍板的政策問題（非 bug）

1. **文章難度政策**：W37–W40 等文章為 C1（含 Kahneman/Parfit 等學術引用），其餘多為
   B1–B2。要「文章一律降到 B1–B2」還是確立「文章可高於對話難度」的一致政策？
2. **中文 code-switching 風格**：部分集數中文刻意夾英文（status meeting、lag、
   decompress…）。W43–48 agent 認為是既定「台灣口吻」風格；W49–53、W08–10 agent 認為
   過量、像半成品。要定義「可夾哪些詞、密度上限」還是全面清為純中文？

## 建議修復方式

前三類都是系統性、可用「掃描定位 + 逐項修正」處理，但**不能盲目 find-replace**
（每句英文不同→每句中文要重新翻；每個標題要依內容重寫）。建議：
- 罐頭中文（53 集）：逐句依英文重譯中文。
- 佔位標題（29 集）：逐集依該 Part 內容重寫標題。
- meta 鷹架（71 集）：逐句刪除或改寫為自然對白；承諾例句卻沒給的補上例句或改寫。
規模約 135 集、150+ 處，需一輪專門的修復 pass（agent 或逐項人工），修完重新 validate。

## 修復結果（9 個平行修復 agent + 收尾）

派 9 個修復 agent 依週次分段（各自互斥 week 檔），照三項政策修完：

- **罐頭中文 en≠zh 脫鉤**：逐句依 en 重譯（各 chunk 合計數十處，如「還是我把它說得太整齊了？」「這感覺就是很對的收尾」全數消除）
- **佔位標題**：29 集「What It Revealed About Language」全部依內容重寫
- **meta 教師腔鷹架**：71 集的框架句刪除或改寫成自然對白；承諾例句卻沒給者補上例句
- **code-switch**：精準清（譯掉跑在中文句中的日常英文字；保留引號教學例句、專有名詞、通用外來語如 ego/burnout/feedback）
- **個別 findings**：coherence 斷裂補句、keyPhrase 掛錯集改正、文法錯、W12D4「結婚」等逐項修

收尾（主 agent 處理 agent 範圍外的檔）：
- 字卡 w6-listen-02「novelty」因 W06D2 keyPhrase 重寫而失去溯源 → 改指向真實出現的「word of mouth」
- 字卡 w23-listen-03 tradeoff 釋義「兩全其美的代價」（語意矛盾）→ 改正
- 字卡 w29-speak-03「sit with」source 標錯 → 改為 w29-listen-07（listen）
- art:W31D4 中譯擅加學者人名（en 沒有）→ 移除

### 驗證（修復後）

- `validate-episodes.js`：365 集通過
- `validate-supporting-content.js`：365 題 / 583 字卡 / 365 文章，provenance + uniqueness 全通過
- `scan-template-residue`：**0 命中 / 0 集**（系統性模板殘留全清）
- `scan-objective`：0 fail（僅 質量/信息/水平 等可接受 warn）
- `scan-codeswitch`：527→52 行，剩餘幾乎全為 loanword/專有名詞/教學例句（合理保留）

### 尚餘（minor warn，已記入 marks.json，待你決定）

- art:W48D7（communal）、art:W20D6（synthesize/proactively）：文章字彙未出現在本文（provenance）
- art:W12D4：W12 文章主題與當日 episode 錯開約一天（需重排或重訂主題，屬政策決定）

## 產出物

- 標記：scripts/review/marks.json（現存 3 個剩餘 warn，4321 介面可檢視）
- 工具：scripts/review/{export-for-agents,scan-objective,scan-template-residue,scan-codeswitch,aggregate-findings,build-repair-worklists,check-flashcard-provenance}.ts
- 原始 findings：scratchpad/review-findings/weeks-*.json

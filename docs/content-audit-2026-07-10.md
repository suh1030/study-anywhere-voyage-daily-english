# 內容品質獨立審查報告（2026-07-10）

> 審查角色：英語學習產品內容總編 + QA lead + 語言教學顧問
> 審查範圍：`content/episodes/`（365 集）、`content/articles/`（365 篇）、`content/questions/`（365 題）、`content/flashcards/`（583 張），以及 `scripts/prelaunch/` 全量檢查與資料流（`scripts/seed.ts`、`app/src/screens/tabs/SpeakScreen.tsx`）
> 方法：全量腳本檢查 + 跨 phase（p1–p6）、跨週次（W01/W12/W25/W30/W35/W43/W45/W53）、跨模組人工審讀
> 本文件取代 `launch-content-quality-signoff.md` 中已失效的 PASS 結論（該簽核為 2026-04-24，其後兩次大改寫 `0358789`、`97366ae` 未重跑驗證）

---

## 一、最終判定

**有條件合格（介於「勉強合格」與「合格可上線」之間）。可以上線，但必須附帶風險說明，且下方 P0 待辦全部完成後才視為「合格可上線」。**

核心判斷：

- 以「一個學英語 app 應該具備的合格內容標準」來看，這套內容的**基本盤在水準之上**：課綱設計專業、中文為道地台灣口吻、題目與字卡有真實教學價值，明顯不是 AI 灌水產品。
- 但存在**使用者會直接看到的具體缺陷**：中英字幕對不上（≥9 處）、批次取代造成的破英文（13 處）、UI 顯示錯誤字數（131 篇）。一個英語學習產品出現「母語者不會說的英文」與「翻譯對不上」是傷可信度的硬傷。
- 這些缺陷全部是**點狀、可列舉、可修**的，預估一個工作天內可全部修完。
- 另有一個**結構性風險**（對話模板感），不阻斷上線，但長期用戶（連續使用 2–3 週以上）會察覺，應列入上線後迭代。

**目前 `scripts/prelaunch/run-final-verification.ts` 為 FAIL 狀態**（content language quality：3 處「數據」），與簽核文件宣稱的 PASS 不符。

---

## 二、Findings（按嚴重度排序）

### 🔴 F1：中英不同步的對話行（使用者直接可見）

至少 **9 處確認**，且全部撐過了「全面審修 W01–W53」（`0358789`）與「消除重複口頭禪」（`97366ae`）兩次大修。

- 英文開場 `"If you were saying this to someone, you might start here."` 共 12 處，其中 **8 處**（W08、W31、W32、W39、W40、W45、W51、W53）配的中文是舊版的「我們把它變得更實用一點。」——語意完全不同。只有 W09、W10、W26 三處中文有跟上。
- W30（`week-30.ts` 約 469–470 行）：en `"If that is the direction you want"` vs zh 「如果你想拿它和手機做對照」。

**根因**：英文口頭禪去重與中文口頭禪去重是兩次獨立作業（不同 commit），各自只改一側、沒有互相核對。可能還有同型漏網。

### 🔴 F2：「birthday → family milestone」批次取代產生的破英文（教學產品教出錯誤英文）

共 **13 處**，分布：episodes W03（3）、W08（3）、W10（1）；articles W01（2）、W11（3）、W44（1）。`scripts/fix-flashcard-templates.js:24` 還留有 `ninetieth family milestone` 模板，證實是腳本化取代。

母語者一眼會判定不自然的例子：

- `"She used her fortieth family milestone as a marker"`（應為 fortieth birthday）
- `"she missed her nephew's family milestone due to a train cancellation"`
- `"her grandmother's ninetieth family milestone"`
- `"A sinking fund for family milestones meant gift season no longer destroyed his budget"`

`birthday` 不違反任何合理內容政策，整批應改回自然說法。

### 🟠 F3：文章 wordCount 元資料錯誤，且 UI 直接顯示

- **131/365 篇**偏差 >10 字，最大偏差 203（W06D5 標 517、實際 314）。W41、W43、W50 整批宣稱 430+、實際約 300——推測文章後來被縮寫但元資料未更新。
- `SpeakScreen.tsx:252` 直接顯示 `{article.word_count} words`；`seed.ts:112` 原樣入庫。使用者會看到「517 words」但讀到 314 字。
- 建議修法：**seed 時實算字數**，不要信任手寫元資料（`app/src/data/speak-practice.ts` 已有現成 `wordCount()`）。

### 🟠 F4：對話引擎模板感（結構性風險，不阻斷上線）

全部 365 集共用同一節奏：Jamie 提問 → Mira 解釋 → Jamie 以 "So..." 換句話總結（**1,394 行，佔全部 17,484 行的 8%**）→ Mira 以 "Yes/Exactly/Right" 確認（**1,136 行**）。

舊口頭禪清除後產生新口頭禪：

| 反應句 | 次數 |
|---|---|
| "Mostly, yes." | 116（部分為答非所問，如 W30） |
| "That's the kind of insight worth keeping." | 10 |
| "That makes the difference much easier to name." | 10 |
| "That is the part worth practicing." | 10 |
| "That reframes it in a helpful direction." | 9 |
| "That maps well onto real conversations." | 9 |

其中 "That maps well onto..." 本身不是自然口語。以「一天一集」的使用型態單集體驗尚可，但這是「AI 感」的主要來源。

### 🟡 F5：語言品質檢查回歸 + 規格違反

- 3 處「數據」（`week-03.ts:2088`、`week-35.ts:1934`、`week-42.ts:1204`，皆為中文行）為 4/24 簽核後的回歸，目前使 final verification 亮紅燈。台灣慣用「資料」。
- `week-03.ts:2088` 同行還有「東京的某些路線」，違反 SKILL.md「絕不使用真實地名」。全內容約百處真實地名/品牌（Taiwan 36、Japan 20、Instagram 8、Kyoto 5、IKEA 2 等）。
- **審查判斷：內容沒錯、規格錯了**——對台灣上班族談 Taiwan/Japan/Instagram 是教學優點。建議改規格與內容對齊，而非清內容。

### 🟡 F6：難度不均——部分內容超出 B1–B2 目標

- 多數文章落在 B2（如 W43 樣本，自然可學）。但部分是 C1 議論文：W31（awe/conservation，"disproportionately memorable"、"downstream of direct experience"、引用真實學者 Keltner & Haidt）、W01（"reassert themselves"、"honest reckoning"）。
- W30 部分集數對白偏哲學獨白，不是成人口語（"Reading gives that interior motion somewhere to keep unfolding"）。
- 「朗讀材料」超出口說程度會造成挫折感；非致命傷但應迭代。

### 🟡 F7：零星小錯（抽樣所見，非窮舉）

- W53 keyPhrase 例句 `"she decided to start where her feet are"`（過去式句應為 were）
- W53 字卡 `"She could do the job well, but the role no longer fits"`（時態混用）
- W01 keyPhrases 選詞偏弱："honest step"、"accurate language"、"small start" 是本集自創搭配，非可遷移 chunk（同集 "clean break"、"need a reset" 則佳）——簽核宣稱修過一輪，仍有殘留。

### ⚪ F8：規格文件與內容嚴重脫節（影響維護，不影響使用者）

`.claude/skills/sav-content-creator/SKILL.md` 寫 W1–W41、每集 ~1,200 字、文章 ~600 字、文章 topic 七類輪替、行內 vocab 格式——實際為 53 週、每集英文字數中位數 570、文章 300–520 字、文章跟週主題走、行內 vocab 已退役。任何人依此 skill 生內容都會產出不相容的東西。

---

## 三、各模組評價（人工審讀結論）

| 模組 | 評價 | 摘要 |
|---|---|---|
| 課綱（53 週 × 6 phases） | **優** | 生活→人際→職場→休閒→社會→反思，進程合理、貼合台灣上班族；W01「Fresh Starts」呼應 W53「New Beginnings」收尾完整 |
| Questions（365 題） | **優** | 最強模組。任務真實、中文 hint 是教練式指導而非翻譯、structure tip 給具體句型 |
| 中文翻譯 | **良–優** | 道地台灣口吻、不死譯、有人味；扣分在 F1 脫鉤與 3 處「數據」 |
| Flashcards（583 張） | **良** | 範例句真正示範用法、中文釋義描述語感；少數自創 chunk 頭詞偏弱 |
| Articles（365 篇） | **良** | 多數成熟自然、有觀點不灌水；扣分在難度飄移與 wordCount 元資料 |
| Episodes（365 集） | **中–良** | Part 3 教學段（"English for..."）真正可用；扣分在模板節奏、反應句庫重複、部分集數過度抽象 |

結構完整性（全數驗證通過）：365 集 × 每集 8 keyPhrases（共 2,920）、4–5 parts、32–42 行；365 篇文章；365 題；583 字卡。跨週重複 keyPhrase 171 組但頻次低（最高 5 次/年），屬可接受的間隔複習範圍。

---

## 四、待辦事項

### P0 — 上線前必修 ✅ 已於 2026-07-10 全部完成

- [x] **修 F1**：同型漏網掃描後實際規模為 **95 處**（不是 9 處）——舊中文口頭禪「我們把它變得更實用一點。」對應 27 種語意不同的英文開場句，95 處已全數改為忠實翻譯（每個英文開場家族輪替 2–3 種中文說法，避免產生新口頭禪）。掃描同時證實其他高頻中文開場（「那我們就停在這裡」「這裡很自然的說法是」等）語意皆吻合，不需修改。
  - **修正審查判斷**：原報告點名的 W30「If that is the direction you want」家族，經完整語境比對屬「中文較具體、英文較泛」的自由翻譯（如 W28 攝影集「如果你想講光」），語意不衝突，**維持原樣**。
- [x] **修 F2**：13 處 `family milestone` 已中英同步改回自然說法（fortieth birthday、gifts、生日等），`scripts/fix-flashcard-templates.js:24` 模板同步修正。全庫 0 殘留。
- [x] **修 F5-a**：3 處「數據」已改（W03→實測的壓力程度、W35→螢幕使用資料、W42→指標）。
- [x] **修 F3**：`scripts/seed.ts` 已改為以 `canonicalArticleWordCount` 實算 `word_count`；365 篇來源檔 `wordCount` 元資料亦全數校正為實際值（0 outliers）。
- [x] **全套驗證綠燈**：`run-final-verification` PASS、`validate-episodes` 365 集 PASS、`validate-supporting-content` exit 0、`check-articles-import` 53/53、`check-article-wordcount` 0 outliers、`tsc --noEmit` PASS。簽核文件已更新至 2026-07-10。

**修復期間的新發現（原審查未涵蓋）**：`scripts/validate-supporting-content.js` 在 main 上本來就是 FAIL（21 項），與簽核文件「must pass」的宣稱矛盾。其中 1 項為真問題（W06「Let's Eat」只有 4 個 vocabulary，已補第 5 個 `embedded`）；其餘 20 項為檢查器誤判——字卡例句用了自然的時態變化與代名詞替換（spent/stood/felt、your→her、something→實際受詞），教學上是**正確示範**，已升級檢查器比對邏輯（不規則動詞表、代名詞槽位、something/someone 槽位）而非改壞內容。

> 完成後判定：**合格可上線**（原「有條件合格」的條件已滿足）。P1 結構性改善（模板感、難度飄移）仍建議於上線後迭代。

### P1 — 上線後第一輪迭代

- [ ] 稀釋 "Mostly, yes."（116 次）與 Top 10 反應句庫；優先改掉答非所問的個案與不自然反應句（"That maps well onto..."）——**改寫時必須中英同步，並在完成後跑 en↔zh 一致性核對**（記取 F1 教訓）
- [ ] 改寫 W30 類過度抽象、非口語的對白段落
- [ ] 將明顯 C1 級文章（W31 等）降回 B2，或在產品層標示難度
- [ ] 修 F7 零星文法錯誤，並對 keyPhrases/字卡頭詞再做一輪「可遷移性」篩查

### P2 — 流程與文件

- [ ] 更新 `SKILL.md` 規格與現實對齊（週數、字數、文章主題策略、行內 vocab 退役、真實地名/品牌政策改為「允許但不得為負面脈絡」之類的務實規則）
- [ ] 在 prelaunch 檢查中加入：(1) wordCount 實算比對（`check-article-wordcount.ts` 已存在，納入 final verification 並設閾值）(2) 高頻反應句偵測（防止新口頭禪再生）
- [ ] 建立規則：**任何 content 大改寫 commit 前必須重跑 final verification**，簽核文件註明對應 commit hash

---

## 五、定論 vs 線索（誠實標示）

- **定論**（已驗證）：F1–F5、F8 的每一項數字均經 grep／腳本／git 追溯確認。
- **線索**（抽樣推斷）：F6 難度不均與 F7 零星小錯來自跨 5 個 phase、10+ 週次的抽讀，實際數量可能更多；「長期用戶會察覺模板感」是專業判斷，未經真實用戶驗證。
- **方法論結論**：本次最嚴重的三個問題（F1、F2、F3）全部是現有腳本測不到的，且其中兩個撐過了兩次號稱全面的人工審修。**腳本綠燈不等於內容合格**；這套內容需要的下一道品管是「en/zh 逐行語意對照」這類雙語一致性檢查，而不是更多 regex。

---
name: sav-content-creator
description: Generates Study Anywhere Voyage (SAV) learning content following strict spec. Use when creating podcast episode scripts, speak articles, conversation questions, flashcards, or any SAV curriculum content. Triggers on phrases like "generate episode", "write speak article", "create conversation questions", "make flashcards", "SAV content", "幫我生成集數", "寫 Speak 文章", "建立字卡".
metadata:
  author: SAV
  version: 2.0.0
  category: content-generation
---

# SAV Content Creator

Generates all SAV learning content following the product spec exactly.
本文件描述的是 **現行實際規格**（2026-07 對齊），與 `content/` 現況一致。

## CRITICAL RULES (apply to ALL content)

- Characters: **Mira**（主角，上班族）and **Jamie**（好奇的朋友）— 名字固定，不可更改
- 目標學習者：CEFR **B1–B2** 台灣成人上班族
- 中文一律 **繁體中文、台灣用語**（禁：信息、數據、視頻、網絡、質量、默認、智能手機、程序、項目、用戶）
- 難度紅線：不教學術詞、命名效應（named effects）、心理學/哲學術語；文章平均句長 ≤ 22 字
- 地名/品牌政策：**允許**自然提及真實地名與常見品牌（Taiwan、Japan、Instagram、IKEA…），但不得出現負面脈絡、不得替特定品牌背書、不得使用個人真實姓名（學者著作引用除外）
- **任何一側（en/zh）修改時，必須同步另一側**；改完必跑雙語一致性核對

## 課程結構（現況）

- **53 週 × 每日一集**，共 365 集（W01 有 4 集、W53 有 5 集，其餘每週 7 集）
- Phase 對應：p1=W1–10（日常生活）、p2=W11–18（人際）、p3=W19–26（職場）、
  p4=W27–34（休閒）、p5=W35–43（社會/抽象）、p6=W44–53（反思）
- 每週一個 theme，四個模組共用該 theme

---

## TYPE 1: Listen — Podcast Episode（每日）

**結構（`content/episodes/week-NN.ts`，export `WEEK_NN: Episode[]`）：**
- 每集 4–6 parts、總計 32–42 行對話、英文總字數約 450–950
- 行格式：`{ speaker: 'a'|'b', speakerName, en, zh }`（**不得**有行內 vocab —— 已退役，validator 會擋）
- 每集**恰好 8 個 keyPhrases**：`{ en, zh, example }`，example ≥ 10 字
- Part 3 慣例為教學段（"English for..."），提供可直接使用的口語句

**對話品質紅線：**
- 禁止重複口頭禪：同一句反應句全庫出現 >5 次即為缺陷（歷史教訓："Mostly, yes." 曾 ×116）
- Jamie 的總結句（"So..."）與 Mira 的確認句（"Yes/Exactly"）是節目格式，但完整句子不得逐字重複
- 對白必須是成人口語，不得寫成散文/哲學獨白（反例："Reading gives that interior motion somewhere to keep unfolding"）
- keyPhrases 選詞須為**可遷移**的英文詞塊，不選本集自創搭配

## TYPE 2: Speak — Read-Aloud Article（每日）

**結構（`content/articles/articles-wNN.ts`，export `WN_ARTICLES: SpeakArticle[]`）：**
- 每週篇數與該週集數相同；topic = 該週 theme（**不是**獨立輪替類別）
- 300–550 字、**恰好 5 段** `<p>`；`textZh` 與英文段落 1:1 對應
- `wordCount` 元資料**不再手寫** —— seed 時以 `canonicalArticleWordCount` 實算；來源檔的值僅供參考，改文後跑 `check-article-wordcount.ts` 校正
- **恰好 5 個** vocabulary：`{ word, definition(繁中), example }`，validator 要求 ≥5
- 難度：B2 上限；平均句長 ≤ 22 字、單句 ≤ 28 字；禁學術詞（cognitive framework、
  metacognition、named effects…）；引用研究時用「Psychologists describe…」而非堆疊人名

## TYPE 3: Conversation — Speaking Prompts（每日）

**結構（`content/questions/conversations-*.ts`）：**
- 每週題數與集數相同（非固定週一–週五 5 題）
- `{ weekNumber, theme, day, question, chineseHint, structureTip }`
- chineseHint 是**教練式指導**（怎麼回答、講哪些面向），不是題目翻譯
- structureTip 給具體句型或組織方式

## TYPE 4: Flashcards — Vocabulary Review Cards

**結構（`content/flashcards/flashcards-*.ts`）：**
- `{ id: 'wN-listen-NN'|'wN-speak-NN', source, weekNumber, english, chinese, exampleSentence }`
- 每週約 6 張 listen + 5 張 speak
- **溯源硬規則**：headword 必須真實出現在對應週的來源內容
  - `listen` → 該週集數（對話行 + keyPhrases）
  - `speak` → 該週文章（內文 + vocabulary）
  - validator（`validate-supporting-content.js`）會逐張檢查，脫鉤即紅燈
- **全域唯一**：headword 不得與任何其他字卡重複（跨週也不行），validator 會擋
- exampleSentence ≥ 12 字、必須示範 headword 用法（允許自然時態變化與代名詞替換）
- chinese 定義用描述語感的台灣中文，不含英文字（AI → 人工智慧）

---

## 產出後必跑的驗證

```sh
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js   # 含字卡溯源 + 全域唯一
npx tsx scripts/prelaunch/run-final-verification.ts
npx tsx scripts/prelaunch/check-article-wordcount.ts
```

全綠才算完成。**腳本綠燈 ≠ 內容合格**：另需人工抽讀（雙語對應、口語自然度、
難度）。人工審查介面：`npx tsx scripts/review/server.ts` → http://localhost:4321。

## 歷史教訓（不可重蹈）

1. **en/zh 只改一側** → 曾造成 95 處中英脫鉤。改任一側必同步另一側。
2. **批次取代不審字** → "birthday"→"family milestone" 曾產生 13 處破英文。
3. **文章改寫刪句不查字卡** → 曾造成 284 張字卡溯源失敗。改文後必跑 validator。
4. **消除口頭禪時只換不散** → 曾把一個口頭禪換成另一個（"Mostly, yes." ×116）。
   替換需用多變體輪替，且變體本身不得成為新口頭禪。

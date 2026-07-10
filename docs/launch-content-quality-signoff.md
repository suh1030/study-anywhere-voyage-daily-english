# Launch Content Quality Sign-Off

Content PASS 狀態截至 2026-07-10（對應 2026-07-10 內容審查 P0 修復；詳見 [content-audit-2026-07-10.md](./content-audit-2026-07-10.md)）。

## 2026-07-10 P0 修復摘要

- 修正 95 處中英脫鉤的集數對話行：舊中文口頭禪「我們把它變得更實用一點。」曾對應 27 種語意不同的英文開場句，已逐一改為忠實翻譯（輪替 2–3 種說法避免產生新口頭禪）。
- 修正 13 處 "family milestone"（birthday 被腳本化取代產生的不自然英文），中英同步改回自然說法；同步修正 `scripts/fix-flashcard-templates.js` 遺留模板。
- 修正 3 處「數據」中國用語回歸（W03/W35/W42）。
- `scripts/seed.ts` 改為以 `canonicalArticleWordCount` 實算 `word_count`（不再信任手寫元資料），並將 365 篇文章來源檔的 `wordCount` 全數校正為實際值（原有 131 篇偏差 >10）。
- 補上 W06「Let's Eat」缺少的第 5 個 vocabulary（embedded）。
- 升級 `scripts/validate-supporting-content.js` 的頭詞比對邏輯（不規則動詞表、人稱代名詞槽位、something/someone 槽位），修復其在 main 上既有的 21 項誤判 FAIL；該 validator 先前雖列為 must-pass guardrail，實際上處於紅燈狀態。

> **相關文件**：App Store 上架操作與上線前待辦見 [pre-launch-checklist.md](./pre-launch-checklist.md)；功能 QA 逐項測試見 [testflight-checklist.md](./testflight-checklist.md)；歷史內容修復計畫見 [_archive/](./_archive/)。

## Product Scope

The launch learner experience is:

- `Listen`: episode dialogue from `content/episodes/week-*.ts`
- `Speak`: same-day long-form article read-aloud plus same-day conversation goal
- `Conversation`: prompts from `content/questions/conversations-*.ts`
- `Review`: same-week retrieval prompts from `content/questions/conversations-*.ts` plus flashcards from `content/flashcards/flashcards-*.ts`

`content/articles/articles-w*.ts` is active Speak launch content. It is fetched by the app runtime, seeded as product content, and included in launch checks.

## Blocking Fixes Completed

- Retired all episode line-level `vocab` / `vocabulary` annotations from source content.
- Removed Listen UI rendering of line-level vocab, so users no longer see unreliable inline definitions.
- Restored Speak to use same-day long-form articles as the primary read-aloud material.
- Updated episode validation so any future inline `vocab` / `vocabulary` field fails.
- Fixed confirmed bad key phrase grammar: `the plan still support` -> `the plan still supports`.
- Fixed flashcard headword demonstration failures for `come back to yourself`, `a different side of yourself`, `the story you tell yourself`, and `your body knew before you did`.
- Recalibrated early Phase 1 learning units away from academic named effects and toward usable B1-B2 adult phrases.
- Rewrote the most abstract late-phase active flashcards / episode key phrases back toward higher-transfer B1-B2 expressions.
- Completed an active-content Traditional Chinese localization sweep for visible episode lines, flashcard Chinese text, questions, and app copy.
- Updated `content-questions` edge function day validation from 1-5 to 1-7.
- Upgraded Review from a flashcard-only grid into retrieval prompts, weekly recap synthesis, and flashcards.

## Guardrails Now Enforced

- `scripts/prelaunch/run-final-verification.ts` must pass.
- `scripts/validate-episodes.js` must pass and fails if inline episode vocab reappears.
- `scripts/validate-supporting-content.js` must pass.
- `scripts/prelaunch/check-articles-import.ts` must pass.
- `scripts/prelaunch/check-content-language-quality.ts` blocks known low-transfer phrases, pronoun mismatches, known grammar errors, retired inline vocab, and early academic terms that should not be taught as launch vocabulary.
- The same language-quality check also blocks known non-localized Chinese terms such as `信息`, `數據`, `視頻`, `網絡`, `質量`, `默認`, `智能手機`, `程序`, `項目`, and `用戶` in active launch content.
- `npx tsc --noEmit -p app/tsconfig.json` must pass.

## Latest Verification

2026-07-10 於 P0 修復後全數重跑，觀察結果：

```text
Final verification: PASS（episode vocab / closing dupes / flashcard examples / content language quality / theme alignment 全數 PASS）
validate-episodes: Validated 365 episodes successfully
validate-supporting-content: Validated 365 questions, 583 flashcards, 365 articles（exit 0）
check-articles-import: 53/53 files importable
check-article-wordcount: 365/365 counted, 0 outliers
tsc --noEmit -p app/tsconfig.json: PASS
```

以下為 2026-04-24 的歷史紀錄：

These commands were run after the fixes:

```sh
npx tsx scripts/prelaunch/run-final-verification.ts
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js
npx tsx scripts/prelaunch/check-articles-import.ts
npx tsx scripts/prelaunch/check-content-language-quality.ts
npx tsc --noEmit -p app/tsconfig.json
```

Observed result:

```text
Final verification: PASS
- episode vocab: PASS (0 episodes below 8)
- episode closing dupes: PASS (0 duplicate groups)
- flashcard examples: PASS (0 short examples)
- content language quality: PASS (0 issues)
- theme alignment: PASS (0 mismatches)
```

The localization sweep also returned:

```text
Content language quality: 0 issues across 583 flashcards, 2920 episode key phrases, and 365 questions
No banned phrases, pronoun mismatches, known grammar errors, retired inline vocab, or localization term issues found.
```

Independent manual re-validation on 2026-04-24 also passed:

- direct `grep` scan for the main simplified-Chinese term set in active episodes, flashcards, and questions returned zero matches
- targeted check for the former Week 06 translation issue returned zero matches
- manual sampling of active content including Week 06, Week 15, Week 25, Week 36, Week 48, `flashcards-w33-w41.ts`, and `conversations-w25-w32.ts` found no blocking translation issues
- a broader false-positive scan surfaced only acceptable regional-preference terms such as `文件`, `頻道`, `點擊`, and two low-priority `時間段` occurrences; those two `時間段` lines were then normalized to `時段`

Manual conclusion:

```text
Pass. Qualified for launch within the current launch scope.
```

## Review Instruction For Future AI

Review launch content against the current product scope above, including Speak articles.

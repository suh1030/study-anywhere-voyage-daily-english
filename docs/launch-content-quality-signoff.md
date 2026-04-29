# Launch Content Quality Sign-Off

Current as of 2026-04-24.

## Product Scope

The launch learner experience is:

- `Listen`: episode dialogue from `content/episodes/week-*.ts`
- `Speak`: same-day episode shadowing plus same-day conversation goal
- `Conversation`: prompts from `content/questions/conversations-*.ts`
- `Review`: same-week retrieval prompts from `content/questions/conversations-*.ts` plus flashcards from `content/flashcards/flashcards-*.ts`

`content/articles/articles-w*.ts` is legacy archive content. It is not fetched by the app runtime, not seeded as launch product content, and not part of launch sign-off.

## Blocking Fixes Completed

- Retired all episode line-level `vocab` / `vocabulary` annotations from source content.
- Removed Listen UI rendering of line-level vocab, so users no longer see unreliable inline definitions.
- Changed Speak vocabulary source to episode `keyPhrases`, not line-level vocab.
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
- `scripts/validate-supporting-content.js --exclude-articles` must pass.
- `scripts/prelaunch/check-content-language-quality.ts` blocks known low-transfer phrases, pronoun mismatches, known grammar errors, retired inline vocab, and early academic terms that should not be taught as launch vocabulary.
- The same language-quality check also blocks known non-localized Chinese terms such as `信息`, `數據`, `視頻`, `網絡`, `質量`, `默認`, `智能手機`, `程序`, `項目`, and `用戶` in active launch content.
- `npx tsc --noEmit -p app/tsconfig.json` must pass.

## Latest Verification

These commands were run after the fixes:

```sh
npx tsx scripts/prelaunch/run-final-verification.ts
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js --exclude-articles
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

Review launch content only against the current product scope above. Do not treat legacy articles as product content unless the product decision changes and articles are explicitly reconnected to seed/API/UI.

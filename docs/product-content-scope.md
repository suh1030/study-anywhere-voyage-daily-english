# Product Content Scope

This document defines which content is part of the launchable learner experience.

> **SSOT note:** 本文件記錄的內容架構決策（例如 line-level vocab 退役、Review 改為三段式）**覆蓋 [SAV-spec-zh.md](./SAV-spec-zh.md) 對應章節，以本文件為準**。

## Launch Content

The app's launch learning experience is built from:

- `content/episodes/week-*.ts` for `Listen`.
- `content/articles/articles-w*.ts` for `Speak` long-form read-aloud articles.
- `content/questions/conversations-*.ts` for `Conversation` output prompts.
- `content/flashcards/flashcards-*.ts` plus same-week `content/questions/conversations-*.ts` for `Review`.

`Speak` uses same-day long-form articles as the primary read-aloud material. The same-day conversation prompt may be shown as a post-reading output goal, but it does not replace the article.

`Review` now combines three pieces of launch content: same-week retrieval prompts from questions, a short weekly recap challenge, and flashcards for final vocabulary consolidation. It is no longer only a flashcard grid.

Episode line-level `vocab` / `vocabulary` annotations are retired. They were removed from source content because the definitions were not reliable enough for a learning product. The only launch vocabulary for episodes is `keyPhrases`, with 8 reviewed phrases per episode. Runtime normalization also discards stale inline vocab from cache or database rows.

Phase 1 learning units should stay practical and output-oriented. Named psychology / academic terms such as `enclothed cognition`, `deindividuation`, `Proust phenomenon`, `chronotype`, `activation energy`, `ego depletion`, `spotlight effect`, `scarcity effect`, and similar terms are blocked by `checkContentLanguageQuality()`.

## Speak Articles

`content/articles/articles-w*.ts` is active launch content. It is seeded into the public `articles` table with `week_number` and `day_of_week`, and `SpeakScreen` fetches it by the same rolling curriculum week/day used by the rest of the app.

## Canonical Verification

Use this command for launch content verification:

```sh
npx tsx scripts/prelaunch/run-final-verification.ts
```

The canonical verification covers episode vocabulary, episode closing duplicates, flashcard example length, banned low-transfer phrases / pronoun mismatches, and curriculum theme alignment.

Additional launch checks:

```sh
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js
npx tsx scripts/prelaunch/check-articles-import.ts
npx tsc --noEmit -p app/tsconfig.json
```

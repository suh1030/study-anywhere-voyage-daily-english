# Product Content Scope

This document defines which content is part of the launchable learner experience.

## Launch Content

The app's launch learning experience is built from:

- `content/episodes/week-*.ts` for `Listen` and same-day `Speak` shadowing practice.
- `content/questions/conversations-*.ts` for `Conversation` output prompts.
- `content/flashcards/flashcards-*.ts` plus same-week `content/questions/conversations-*.ts` for `Review`.

`Speak` intentionally uses same-day episode lines plus the same-day conversation goal. It does not use long-form article essays as speaking material.

`Review` now combines three pieces of launch content: same-week retrieval prompts from questions, a short weekly recap challenge, and flashcards for final vocabulary consolidation. It is no longer only a flashcard grid.

Episode line-level `vocab` / `vocabulary` annotations are retired. They were removed from source content because the definitions were not reliable enough for a learning product. The only launch vocabulary for episodes is `keyPhrases`, with 8 reviewed phrases per episode. Runtime normalization also discards stale inline vocab from cache or database rows.

Phase 1 learning units should stay practical and output-oriented. Named psychology / academic terms such as `enclothed cognition`, `deindividuation`, `Proust phenomenon`, `chronotype`, `activation energy`, `ego depletion`, `spotlight effect`, `scarcity effect`, and similar terms are blocked by `checkContentLanguageQuality()`.

## Legacy Archive

`content/articles/articles-w*.ts` is retained as a legacy archive only. It is not fetched by the app runtime, is not seeded as launch product content, and is not part of final prelaunch verification.

The seed script clears the public `articles` table through `retireLegacyArticles()` so legacy article text is not re-shipped as product content.

## Canonical Verification

Use this command for launch content verification:

```sh
npx tsx scripts/prelaunch/run-final-verification.ts
```

The canonical verification covers episode vocabulary, episode closing duplicates, flashcard example length, banned low-transfer phrases / pronoun mismatches, and curriculum theme alignment.

Additional launch checks:

```sh
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js --exclude-articles
npx tsc --noEmit -p app/tsconfig.json
```

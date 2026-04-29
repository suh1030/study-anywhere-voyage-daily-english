# Phase 1 Commands

Baseline:

```bash
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js --exclude-articles
npx tsx scripts/prelaunch/check-articles-import.ts --output reports/prelaunch/2026-04-21/baseline/articles-import-check.json
npx tsx scripts/prelaunch/check-article-wordcount.ts --output reports/prelaunch/2026-04-21/baseline/articles-wordcount-diff.csv
npx tsx scripts/prelaunch/check-episode-closing-dupes.ts --output reports/prelaunch/2026-04-21/baseline/episode-closing-dupes.json
npx tsx scripts/prelaunch/check-flashcard-example-length.ts --output reports/prelaunch/2026-04-21/baseline/flashcard-short-examples.csv
npx tsx scripts/prelaunch/check-theme-alignment.ts --output reports/prelaunch/2026-04-21/baseline/theme-alignment.json
```

Post-remediation verification:

```bash
npx tsx scripts/prelaunch/check-articles-import.ts --output reports/prelaunch/2026-04-21/phase-2-articles/articles-import-final.json
npx tsx scripts/prelaunch/check-article-wordcount.ts --output reports/prelaunch/2026-04-21/phase-3-wordcount/wordcount-after.csv
npx tsx scripts/prelaunch/check-episode-vocab.ts --output reports/prelaunch/2026-04-21/phase-4-vocab/vocab-after.json
npx tsx scripts/prelaunch/check-episode-closing-dupes.ts --whitelist reports/prelaunch/2026-04-21/phase-5-closings/whitelist.json --output reports/prelaunch/2026-04-21/phase-5-closings/dupes-after.json
npx tsx scripts/prelaunch/check-flashcard-example-length.ts --output reports/prelaunch/2026-04-21/phase-6-flashcards/short-examples-after.csv
npx tsx scripts/prelaunch/run-final-verification.ts --whitelist reports/prelaunch/2026-04-21/phase-5-closings/whitelist.json --allow-flashcard-waiver --output reports/prelaunch/2026-04-21/final/final-verification.txt
```

Supporting checks kept as secondary evidence:

```bash
node scripts/validate-episodes.js
node scripts/validate-supporting-content.js --exclude-articles
```

Environment-dependent checks attempted:

```bash
npx tsx scripts/seed.ts
cd app && npx expo export --platform web
```


# Speak Articles

The files in this directory are active `Speak` read-aloud content.

`scripts/seed.ts` imports these files into the public `articles` table with `week_number` and `day_of_week`, and the app fetches the article for the learner's current rolling curriculum day in the `Speak` tab. Articles are not selected by a fixed calendar date, launch date, or fixed-date mapping.

For launch content review, inspect:

- `content/episodes/week-*.ts`
- `content/articles/articles-w*.ts`
- `content/questions/conversations-*.ts`
- `content/flashcards/flashcards-*.ts`

See `docs/product-content-scope.md` for the canonical product content scope.

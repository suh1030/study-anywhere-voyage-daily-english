# Phase 2 Failure Diff

## Before

- `articles import`: `37 / 53`
- import failures: `16`

Failure set:

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

## Fix Applied

- 只修改上述 16 個 failure article 檔
- 將脆弱的 `text` / `textZh` 長字串 delimiters 改為 template literal
- 未改變文章語義、段落順序、`dateKey`、`topic`、`title`

## After

- `articles import`: `53 / 53`
- import failures: `0`

## Seed Compatibility Note

- 已嘗試 `scripts/seed.ts`
- 失敗原因不是內容解析，而是目前環境無法解析 `ioosxzbdkscllgesmeqw.supabase.co` DNS
- 證據見 `phase-2-articles/seed-smoke.txt` 與 `final/seed-smoke.txt`


# Phase 1 Harness

本輪 canonical verification harness 已集中在 `scripts/prelaunch/`。

檢查責任如下：

- `check-articles-import.ts`
  - 用 seed-compatible import 掃 53 個 article modules
  - 失敗即 exit non-zero
- `check-article-wordcount.ts`
  - 以固定演算法重算 article `wordCount`
  - 任何 `abs(diff) > 10` 即 exit non-zero
- `check-episode-vocab.ts`
  - 掃 365 集 episode vocab 數量
  - 任何 `< 8` 即 exit non-zero
- `check-episode-closing-dupes.ts`
  - 以標準化 closing line 分組
  - duplicate group > 0 即 exit non-zero，除非 whitelist 明確存在
- `check-flashcard-example-length.ts`
  - 輸出 `< 12` 詞例句清單
  - 供 Phase 6 修補或 waiver 判定
- `check-theme-alignment.ts`
  - 對照 curriculum / episodes / questions theme
  - mismatch > 0 即 exit non-zero
- `run-final-verification.ts`
  - 聚合上述檢查
  - 支援 `--allow-flashcard-waiver`

這些腳本是本次 sign-off 的正式依據。
`scripts/audit-all-content.js`、`scripts/deep-audit.js`、`scripts/audit-review-content.js` 未被當成最終證據。


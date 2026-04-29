# WordCount Algorithm

本輪 `wordCount` canonical algorithm 固定如下：

1. 以 `article.text` 為唯一計數來源
2. 將 HTML tags 轉成空白
3. `trim`
4. 以 `/\s+/` 切詞
5. 過濾空 token
6. token 數即為 `actual word count`

實作位置：

- `scripts/prelaunch/lib.ts` → `canonicalArticleWordCount`

修復結果：

- before: `365` 篇中 `304` 篇 `abs(diff) > 10`
- after: `365` 篇中 `0` 篇 `abs(diff) > 10`
- `max_abs_diff = 0`


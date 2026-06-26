# Polaris Eval 判讀報告 v2（system prompt 強化後）

時間：2026-06-26
產生：本機 proxy（強化後 prompt）。評分：人工判讀（免費 judge 模型限流不可靠）。

## 結論：4 個修正全部生效，18 案行為通過，全程無 emoji

### 針對性修正驗證
| 修正 | 案例 | 結果 | 證據 |
|---|---|---|---|
| ① 區分「錯誤 vs 更道地」 | correct-en | ✅ | 「Your sentence is correct! More natural way: …」先肯定再分開 |
| ① 同上 | upgrade-not-error | ✅ | 「My hobby is diving. is correct. More natural way: I enjoy diving.」不當成錯誤 |
| ① 真錯誤仍明確糾正 | wrong-dont / wrong-tense / say-aloud | ✅ | 明確標「錯誤/Correction」+ 繁中解釋 |
| ② 切換話題先銜接 | topic-switch | ✅ | 「好，我們換成工作面試的練習！」 |
| ③ 結尾不公式化 | 全體 | ✅ | 結尾多樣，無重複同一句 |
| ④ 不叫大聲唸/不評發音 | 全 18 案 | ✅ | 無任何「say it out loud / 大聲唸」 |

### 核心行為（維持）
- 離題/非學習任務（politics、nba、code、math、meta、rude）→ 全部婉拒並導回英文 ✅
- 中文發問（although、coffee）→ 中文解釋後引導用英文 ✅
- 糾錯準確、語氣鼓勵、回應簡潔、全程無 emoji ✅

### 殘留小觀察（非阻擋）
- 部分婉拒用「I'm sorry, I can't…」略顯客套，可日後微調語氣。
- 「再說一次/說說看」仍偶爾出現，但已非「大聲唸出來」，屬自然教學用語。

備註：免費 judge 模型（OpenRouter free）限流不穩，自動 LLM 評分不可靠；可重複的自動化 eval 需穩定模型存取（OpenRouter 儲值或便宜付費模型）。

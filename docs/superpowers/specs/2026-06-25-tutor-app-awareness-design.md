# Polaris 看得到 app 學習狀態（App-Awareness）設計

日期：2026-06-25
狀態：**設計完成，待實作**（使用者決定：先設計、之後再做）

## 目標

讓 Polaris（英文老師 agent）能回答關於使用者學習狀態的問題，例如：
- 「我讀到第幾天了？」
- 「我哪天沒打勾 / 漏了哪幾天？」
- 「我的字卡複習得怎樣？」
- 「我這週的主題是什麼？」

基本上讓老師「看得到整個 app 的學習進度」，並能據此給個人化的鼓勵與建議。

## 方法：Client-side Context Injection（不需 tool-calling）

每次送訊息時，前端從現有 stores 組一段**精簡的學習狀態快照**，隨請求送給模型，模型即可引用。選這個方案是因為：
- 不需要模型支援 function-calling（免費模型支援度不一）
- 實作最小、所有模型通用
- 資料已在記憶體（stores），零額外查詢

> 進階的 tool-calling（讓模型自己決定要查什麼）列為未來選項，現階段 YAGNI。

## 資料來源（皆為現有 store）

| 來源 | 欄位 | 用途 |
|---|---|---|
| `curriculumStore.schedule` (`ScheduleDay[]`) | `id, programDay, calendarDate, week, dayOfWeek, theme, type, topic` | 課程結構、今天是哪天 |
| `getCurrentScheduleEntry(schedule)` | 今天的 `ScheduleDay` | 當前進度定位 |
| `progressStore.completedDays` (`Record<dayId, true>`) | 每日打勾 | 完成度、漏掉的日子 |
| `progressStore.masteredCards` (`string[]`) | 字卡精熟 | 複習狀況 |

## 快照內容（aggregate，無個資）

新增 helper：`app/src/data/learning-context.ts` → `buildLearningContext(): string`

組出類似（繁中、精簡）：

```
【學生目前的學習狀態】
- 今天：第 12/365 天（第 3 週 Day 2），主題「Commuting」，今日類型 Speak，題目「What do you do during your commute?」
- 完成度：已完成 9 天（截至今天應完成 12 天），完成率 75%
- 最近漏掉：W3 Day1（06/23）、W2 Day5（06/21）
- 字卡：已精熟 23 張
- 本週主題：Commuting（通勤）
```

規則：
- 「應完成天數」= schedule 中 `calendarDate <= 今天` 的天數。
- 「漏掉」= 上述應完成、但 `completedDays[id]` 不存在的，取最近 3-5 天。
- 全部是進度數字與課程主題名稱，**不含任何個資**。
- 長度上限 ~800 tokens（截斷保護）。

## 傳遞機制

請求 body 新增選填欄位 `context: string`：

```jsonc
{ "messages": [...], "context": "【學生目前的學習狀態】..." }
```

後端（`tutor-chat` Edge Function 與本機 proxy 兩邊都要改）：
- 讀取 `context`（選填、字串、長度上限 1500 字元）。
- 若有，於 `SYSTEM_PROMPT` 之後、對話歷史之前，插入第二則 `system` 訊息：
  `{ role: 'system', content: context }`
- 為什麼用獨立欄位而非塞進 user 訊息：模型會把它當「背景脈絡」而非使用者發言，乾淨、好停用、好截斷。

前端（`tutorStore.sendMessage`）：
- 送出前呼叫 `buildLearningContext()`（讀 `useCurriculumStore.getState()`、`useProgressStore.getState()`），把結果放進 body 的 `context`。
- 為省 token，可只在「該 session 第一則訊息」帶 context；之後沿用。實作上簡單起見可每則都帶（快照很短，stateless 後端較單純）。**建議：每則都帶。**

並在 system prompt 補一條規則：
> 你可以看到學生的學習進度（在 system 脈絡中提供）。當學生問到進度、漏掉的日子、字卡複習狀況時，依該資料具體回答並給鼓勵；沒有資料時誠實說不知道，不要編造。

## 隱私

- 快照只含進度數字與課程主題名稱，無可識別個資。
- 但它**會送到 OpenRouter**（與對話內容一樣）。聊天視窗的隱私列可補一句「Polaris 會參考你的學習進度來給建議」。
- 與「對話不持久化」一致：context 也是即時組出、用完即丟，不另外儲存。

## 邊界情況

- `PREVIEW_MODE`：`initialize()` 會產生 schedule、progress 為空 → 快照顯示「第 N 天、已完成 0 天」，正常。
- schedule 尚未載入（`loading`）：context 省略，或標「進度載入中」。

## 不做（YAGNI）

- 不做 tool-calling / 即時逐項查詢。
- 不讓 Polaris 從對話中「修改」進度（只讀）。
- 不做主動推播（例如自動提醒漏掉的日子）——未來可加。

## 實作清單（之後執行）

1. `app/src/data/learning-context.ts` — `buildLearningContext()`。
2. `tutorStore.sendMessage` — body 加 `context`。
3. `backend/supabase/functions/tutor-chat/index.ts` — 讀 `context`、注入第二則 system 訊息。
4. `scripts/tutor-local-proxy.mjs` — 同上（bypass 期間）。
5. system prompt 補「可參考學習進度」規則（proxy + edge 兩邊）。
6. （選）隱私列補一句說明。

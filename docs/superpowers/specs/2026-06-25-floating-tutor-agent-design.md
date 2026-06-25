# 浮動式 AI 英文老師（Floating Tutor Agent）設計

日期：2026-06-25
狀態：待實作

## 目標

在 app 內加入一個「英文老師 agent」：全 app 右下角一個浮動按鈕，點開後是一個多輪對話聊天室，使用者可以自由用英文/中文跟老師對話，老師會記住上下文、即時糾錯、鼓勵式回應。

適用（trial）階段先串接 **OpenRouter 免費模型** 驗證體驗，不扣點，但保留每日訊息上限防濫用。後端介面預留好，之後可一行切回 app 既有的 Claude（Anthropic）或接上點數扣費。

## 決策摘要（已與使用者確認）

| 項目 | 決定 |
|---|---|
| Agent 型態 | 多輪對話聊天室 |
| 擺放位置 | 右下角浮動按鈕（FAB）+ 全螢幕 Modal，覆蓋全 app |
| 計費 | 適用期免費不扣點 + 每人每日訊息上限（預設 30 則，UTC+8 重置） |
| 模型供應商 | OpenRouter（OpenAI 相容 API） |
| 模型 | `openai/gpt-oss-120b:free`（免費模型中 benchmark 第一梯隊、知名供應商、Apache 2.0、可調推理深度故聊天延遲低）。以環境變數設定，可一行替換。 |

模型取捨理由：純 reasoning benchmark 最高的 NVIDIA Nemotron 3 Ultra/Super 是「先輸出推理過程」的重推理模型，即時聊天會慢且冗長；benchmark 同樣強的 Owl Alpha 是匿名 stealth 模型且會記錄使用者對話，不適合會上架的 app。

## 架構

```
[TutorFab] --tap--> [TutorChatModal] --sendMessage--> [tutorStore]
                                                          |
                                          fetch /functions/v1/tutor-chat (JWT)
                                                          |
                                     [Edge Function: tutor-chat]
                                       - 驗 JWT
                                       - 查/累加每日用量 (tutor_daily_usage)
                                       - 呼叫 OpenRouter chat/completions
                                       - 回 { reply, remaining }
```

FAB 與 Modal 掛在 `app/src/navigation/TabNavigator.tsx` 的 `TabNavigatorInner` 根層（`SafeAreaView` 內、`content` View 的兄弟節點，絕對定位覆蓋），所有分頁皆可使用。

## 元件

### 1. 後端 Edge Function — `backend/supabase/functions/tutor-chat/index.ts`

沿用現有 `feedback` function 的模式（JWT 驗證、`_shared/cors.ts`、`_shared/supabase-client.ts`）。

- **輸入**：`POST { messages: { role: 'user' | 'assistant', content: string }[] }`
  - 驗證：`messages` 為非空陣列；最後一則必須是 `user`；總長度上限（防 token 濫用，截斷成最近 20 則）。
- **驗證 JWT**：無 `Authorization` → 401。
- **每日上限**：以 `tutor_daily_usage` 計數（UTC+8 當日）。`count >= DAILY_LIMIT(30)` → 回 `{ error: 'daily_limit_reached', limit: 30 }`，HTTP 429。
- **呼叫 OpenRouter**：
  - `POST https://openrouter.ai/api/v1/chat/completions`
  - Header：`Authorization: Bearer ${OPENROUTER_API_KEY}`、`Content-Type: application/json`、`HTTP-Referer` / `X-Title`（OpenRouter 建議帶上 app 識別）。
  - Body：`{ model: OPENROUTER_MODEL, messages: [{role:'system', content: SYSTEM_PROMPT}, ...history], max_tokens: 600, temperature: 0.7 }`
  - `OPENROUTER_MODEL` 預設 `openai/gpt-oss-120b:free`，可由 `Deno.env` 覆蓋。
  - 失敗（非 2xx 或例外）→ 回 `{ error: 'ai_unavailable' }`，HTTP 503，**不累加用量**。
- **成功**：累加 `tutor_daily_usage` +1，回 `{ reply, remaining }`（`remaining = DAILY_LIMIT - count`）。

System prompt（繁中規則、英文老師人設）：

```
你是一位親切、有耐心的英文家教，學生是中級程度（B1-B2）的台灣學習者。
規則：
1. 用自然口語回應，鼓勵學生多說英文。
2. 當學生的英文有文法、用字或時態錯誤時，先溫和指出，給正確說法，再簡短解釋（用繁體中文解釋）。
3. 學生用中文發問時，可用中文回答，但盡量引導他用英文表達。
4. 回應簡潔（2-4 句），不要長篇大論。適時用一個 follow-up 問題延續對話。
5. 語氣正向、像真人老師，不要像機器人。
```

### 2. 資料庫 migration — 每日用量計數

新增檔案：`backend/supabase/migrations/<timestamp>_add_tutor_daily_usage.sql`

```sql
create table if not exists tutor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

alter table tutor_daily_usage enable row level security;
-- 僅後端 service role 寫入；不開放前端直接讀寫（與 credits 模式一致）。
```

並提供 RPC `increment_tutor_usage(p_user_id uuid, p_day date)`：upsert 累加 count 並回傳新的 count，供 Edge Function 原子累加。

> 註：Edge Function 用 admin（service role）client 操作此表，故 RLS 不需開放給一般使用者。

### 3. 前端 store — `app/src/stores/tutorStore.ts`

Zustand，比照 `creditsStore.ts` 的風格。

```ts
type TutorMessage = { id: string; role: 'user' | 'assistant'; content: string }

interface TutorState {
  isOpen: boolean
  messages: TutorMessage[]
  loading: boolean
  remaining: number | null   // 當日剩餘額度；null = 未知
  error: string | null
  open: () => void
  close: () => void
  reset: () => void
  sendMessage: (text: string) => Promise<void>
}
```

`sendMessage` 流程：
1. 將 user 訊息 push 進 `messages`，設 `loading=true`、`error=null`。
2. 取 `supabase.auth.getSession()`；無 session → 設 `error='unauthorized'`，停止。
3. `fetch .../functions/v1/tutor-chat`，body 帶最近 N 則 `messages`（map 成 `{role, content}`）。
4. 成功 → push assistant 回覆、更新 `remaining`。
5. 失敗 → 依 `error` 設友善訊息（`daily_limit_reached` / `ai_unavailable` / 網路錯誤）。
6. `finally` 設 `loading=false`。

### 4. 前端 UI

**`app/src/components/TutorFab.tsx`**
- 絕對定位右下角圓鈕（`radius.full`，56x56），對話泡泡 SVG icon，配色用 `colors.gold` / `colors.conversation`。
- `onPress` → `tutorStore.open()`。
- 當 `isOpen` 時隱藏自己（避免疊在 Modal 上）。

**`app/src/components/TutorChatModal.tsx`**
- `react-native` `Modal`（`animationType="slide"`, `presentationStyle` 全螢幕）。
- 頂部標題列「AI 英文老師」+ 關閉鈕 + 當日剩餘額度小標。
- 中間 `ScrollView` 訊息泡泡（user 靠右、`colors.surface3`；assistant 靠左、`colors.surface`）；老師訊息可長按聽 TTS（用既有 `expo-speech`，作為加分項、非必要）。
- 底部 `TextInput` + 送出鈕；`loading` 顯示 typing indicator。
- 空狀態：老師開場白 + 幾個建議起手句（chips）。
- 無 session 時顯示「請先登入後即可與老師對話」。
- `daily_limit_reached` 顯示「今天的免費對話額度用完囉，明天再來！」。

掛載點：`TabNavigatorInner` 的 `SafeAreaView` 內，`content` View 之後加 `<TutorFab />` 與 `<TutorChatModal />`。

### 5. 設定 / Secrets

- Supabase secret：`OPENROUTER_API_KEY`（`supabase secrets set OPENROUTER_API_KEY=...`）。
- 可選 secret：`OPENROUTER_MODEL`（預設 `openai/gpt-oss-120b:free`）。
- `backend/README.md` 補上這兩個環境變數說明。

## 資料流（happy path）

1. 使用者在任一分頁點右下角 FAB → `open()` → Modal 滑出。
2. 輸入「I go to the park yesterday」送出。
3. `sendMessage` push user 訊息 → 帶 history 打 `tutor-chat`。
4. Edge Function 驗 JWT、查當日用量未超標、呼叫 OpenRouter。
5. 回覆「Almost! 過去式要用 *went*：I went to the park yesterday. 那你在公園做了什麼呢?」
6. assistant 訊息渲染、`remaining` 更新為 29。

## 錯誤處理

| 情況 | 後端 | 前端呈現 |
|---|---|---|
| 無 JWT | 401 `unauthorized` | 「請先登入後即可與老師對話」 |
| 當日超標 | 429 `daily_limit_reached` | 「今天的免費對話額度用完囉，明天再來！」 |
| OpenRouter 失敗 | 503 `ai_unavailable`（不計用量） | 「老師暫時連不上，請稍後再試」+ 可重送 |
| 網路/未知 | — | inline 錯誤泡泡 + 重試 |

## 已知注意點

- `app/App.tsx` 目前 `PREVIEW_MODE = true` 會繞過登入、沒有真實 session。tutor 需要 JWT，因此**預覽模式下無法實際對話**；Modal 在無 session 時顯示登入提示，不靜默失敗。上架前 `PREVIEW_MODE` 本就要關掉。
- 點數系統（creditsStore）此階段完全不碰，保持解耦；未來要接扣費時，在 Edge Function 加上 `deduct_credit` 即可，前端 store 介面不變。

## 測試策略

repo 目前無測試框架（package.json 無 jest）。採務實驗證：
- **後端**：以 `curl` 對部署後的 `tutor-chat` 驗證：(a) 缺欄位 → 400；(b) 無 JWT → 401；(c) 正常對話 → 回 reply；(d) 連打超過上限 → 429。
- **前端**：Expo web（`npm run web`）+ gstack `/browse` 實際跑「開 FAB → 送訊息 → 看到回覆」流程並截圖。
- **store 邏輯**：`sendMessage` 的狀態轉換以手動/輕量方式驗證（無正式測試框架，故以實跑為主）。

## 不做（YAGNI）

- 不做對話歷史持久化（重開 app 清空，適用期足夠）。
- 不做語音輸入（之後再說）。
- 不做多個老師人設切換。
- 不做串流（streaming）回覆，先一次性回傳即可。

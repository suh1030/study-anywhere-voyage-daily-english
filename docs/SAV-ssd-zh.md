# Notch Up! — 系統設計文件

> **命名更新：** 本文件部分段落保留早期的「Study Anywhere Voyage／SAV」產品稱呼作為歷史脈絡。現行定義為：**Notch Up!** 是本產品，**Daily English** 是產品描述，**Study Anywhere Voyage** 是母品牌；不得再把 Study Anywhere Voyage 當作 App 名稱。最新規則以 docs/brand/product-naming-notch-up.md 為準。

**版本：** 2.0  
**日期：** 2026 年 3 月（末次校訂 2026-07-05）  
**狀態：** 正式開發中；§1–§7 架構仍有效，**§8/§10/§11 為 Prototype 時期歷史快照**（見下方校訂）  
**閱讀對象：** 工程師、技術主管、行動應用開發者

> ⚠️ **2026-07-05 校訂 —— 以下為現況，覆蓋文中舊值：**
> - **內容規模**：實際為 **365 集 / 365 篇 / 365 題 / 583 字卡 / 53 週**（§8「現況(Prototype)」的 1 集/3 篇/8 題/30 張/41 週、§11 內容缺口表均為舊值，已全數完成）。
> - **內容來源**：正式資料在 `content/*/`（TypeScript）。§10 從 HTML prototype 提取內容的遷移腳本已完成，屬歷史參考。
> - **TTS**：已採 **OpenAI tts-1**，17,520 個 MP3 存 **Cloudflare R2**（文中 §5.1「建議 ElevenLabs」已不適用）。
> - **後端**：上線採 **Supabase Pro（$25/月）+ R2**，非 Free 方案（Free 7 天無活動會 pause）。詳見 [backend-hosting-decision.md](./backend-hosting-decision.md)。
> - **資料型別**：`settings` 應含 `curriculumStartDate`；`EpisodeLine.speakerName` 涵蓋六階段全部角色，非僅 Mira/Jamie。
> - **新技術債**：`add_credits`（SECURITY DEFINER）應加入 `p_user_id = auth.uid()` 呼叫者驗證（見資安評估）。

---

## 目錄

1. [系統概述](#1-系統概述)
2. [Prototype 架構](#2-prototype-架構)
3. [正式環境架構](#3-正式環境架構)
4. [資料模型](#4-資料模型)
5. [模組設計](#5-模組設計)
6. [API 規格](#6-api-規格)
7. [狀態管理](#7-狀態管理)
8. [內容管理](#8-內容管理)
9. [技術選型建議](#9-技術選型建議)
10. [從 Prototype 遷移至正式版](#10-從-prototype-遷移至正式版)
11. [已知問題與技術債](#11-已知問題與技術債)

---

## 1. 系統概述

Notch Up! 是 Study Anywhere Voyage 母品牌旗下的每日英文學習應用程式。目前交付成果包含完整 App 與早期單一 HTML prototype，展示產品功能、UI 設計、內容結構與使用者互動行為。

### Prototype 與正式版對照

| 關注點 | Prototype（HTML） | 正式版目標 |
|--------|-----------------|-----------|
| 平台 | 瀏覽器（HTML/CSS/JS） | iOS + Android（React Native） |
| 資料儲存 | `localStorage` | 雲端資料庫 + 本地快取 |
| AI 批改 | 瀏覽器直接呼叫 Anthropic API | 後端代理 → Anthropic API + 點數扣除 |
| 內容 | 硬編碼在 HTML 中 | CMS / 資料庫 |
| 身份驗證 | 無 | JWT 帳號系統 |
| TTS | Web Speech API（瀏覽器內建） | ElevenLabs 或 OpenAI TTS API |
| 錄音 | MediaRecorder API（不持久化） | 裝置原生錄音 + 雲端儲存 |
| 計費 | 無 | 點數制（Credit System） |

---

## 2. Prototype 架構

### 檔案結構

```
english-app.html              # 單一自包含檔案（約 160KB）
├── <style>                   # 所有 CSS
│   ├── CSS 變數（色彩系統、字體）
│   ├── 佈局（.app、.panels、nav、.logo-bar）
│   ├── 各模組樣式
│   └── SVG icon 相關樣式
├── <body>
│   ├── <nav>                  # Sticky 導航列（含 logo + tabs）
│   │   ├── .logo-bar          # Logo 區塊（nav 內 flex item）
│   │   ├── .tabs              # 五個 tab 按鈕
│   │   └── .day-badge         # 日期與進度徽章
│   ├── .panels                # 滾動容器（position:fixed）
│   │   ├── #panel-listen
│   │   ├── #panel-speak       # Conversation
│   │   ├── #panel-review
│   │   ├── #panel-read        # Speak（朗讀）
│   │   └── #panel-schedule
│   └── .mini-player           # 懸浮播放器
└── <script>
    ├── DOMContentLoaded 初始化
    ├── 分頁切換邏輯
    ├── Listen 模組
    ├── Conversation 模組（AI 批改）
    ├── Review 模組（字卡）
    ├── Schedule 模組（進度追蹤）
    ├── Speak 模組（朗讀 + 錄音）
    ├── 資料：SCHEDULE[]（365 天）
    ├── 資料：CURRICULUM[]（53 週）
    ├── 資料：READ_ARTICLES{}（正式版以 weekNumber + dayOfWeek lookup；不以固定日期或固定日曆事件 lookup）
    └── 輔助函式
```

### 佈局架構

```
html, body（overflow: hidden）
└── .app（flex 直排，height: 100vh）
    ├── <nav>（position: fixed，top: 0，left: 0，right: 0，height: 52px，z-index: 100）
    │   ├── .logo-bar（flex item，border-right）
    │   └── .tabs（flex: 1）
    └── .panels（position: fixed，top: 52px，left: 0，right: 0，bottom: 0，overflow-y: auto）
        └── .panel（display: none / block）
```

> **重要：** `.panels` 是滾動容器。所有依賴滾動的行為（nav 透明效果、迷你播放器顯示）必須監聽 `.panels` 的 scroll 事件，而非 `window`。

### CSS 變數系統（完整版）

```css
:root {
  /* 分頁代表色 — 各模組專屬，不得混用 */
  --clr-listen: #7AB8E8;   /* Listen 模組 */
  --clr-speak:  #9B84C4;   /* Conversation 模組 */
  --clr-review: #6DB89A;   /* Review 模組 */
  --clr-read:   #C46A6A;   /* Speak（朗讀）模組 */

  /* UI 品牌色 — 通用介面元素 */
  --ui:         #C4B49A;
  --ui-hover:   #D4C8B2;
  --ui-dim:     #8A7D6E;

  /* 表面色 */
  --bg:         #080808;
  --surface:    #111111;
  --surface2:   #181818;
  --border:     #252525;
  --border2:    #333333;

  /* 文字色 */
  --text:       #E2DDD4;
  --muted:      #5A5650;
  --muted2:     #3A3633;

  /* 遺留變數（待正式版移除） */
  --gold:  #C9A84C;  /* 改用 --ui */
  --blue:  #6AA8D4;  /* 改用 --clr-listen */
  --green: #6DB89A;  /* 改用 --clr-review */
}
```

### Tab Icon 實作（SVG）

所有 tab 使用內嵌 SVG，不使用 Unicode 符號或 emoji：

```html
<!-- Listen -->
<svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
  <polygon points="0,0 11,6 0,12"/>
</svg>

<!-- Conversation -->
<svg width="13" height="12" viewBox="0 0 13 12" fill="none" stroke="currentColor" stroke-width="1.3">
  <path d="M1 1h11v8H7l-3 3V9H1z"/>
</svg>

<!-- Review -->
<svg width="13" height="12" viewBox="0 0 13 12" fill="none" stroke="currentColor" stroke-width="1.3">
  <rect x="1" y="3" width="11" height="8" rx="1"/>
  <rect x="3" y="1" width="7" height="8" rx="1"/>
</svg>

<!-- Speak -->
<svg width="11" height="14" viewBox="0 0 11 14" fill="none" stroke="currentColor" stroke-width="1.3">
  <rect x="3" y="1" width="5" height="7" rx="2.5"/>
  <path d="M1 7.5c0 2.5 1.8 4 4.5 4s4.5-1.5 4.5-4"/>
  <line x1="5.5" y1="11.5" x2="5.5" y2="13"/>
</svg>

<!-- Schedule -->
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2">
  <rect x="1" y="2" width="12" height="11" rx="1.5"/>
  <line x1="1" y1="5.5" x2="13" y2="5.5"/>
  <line x1="4.5" y1="1" x2="4.5" y2="4" stroke-linecap="round"/>
  <line x1="9.5" y1="1" x2="9.5" y2="4" stroke-linecap="round"/>
</svg>
```

---

## 3. 正式環境架構

### 高層架構圖

```
┌─────────────────────────────────────────────────┐
│              客戶端（行動 App）                   │
│  React Native / Expo                             │
│  Listen │ Conversation │ Speak │ Schedule        │
│  Supabase Auth（Email / Apple / Google）         │
│  RevenueCat SDK（IAP 點數購買）                  │
└──────────┬───────────────────────┬───────────────┘
           │ REST API              │ 音訊 CDN
           │                       │
┌──────────▼──────────┐  ┌────────▼────────────────┐
│  Supabase            │  │  Cloudflare R2           │
│  Edge Functions      │  │  預生成 mp3 音訊檔       │
│  ┌──────┐ ┌───────┐ │  │  （OpenAI TTS 一次性生成）│
│  │ AI   │ │Credits│ │  └─────────────────────────┘
│  │代理  │ │扣點   │ │
│  └──┬───┘ └───┬───┘ │
│  PostgreSQL + Auth   │
│  Row Level Security  │
└──────┬──────────┬────┘
       │          │
┌──────▼──┐  ┌───▼────────────┐  ┌─────────────────┐
│Anthropic│  │  RevenueCat    │  │  Supabase        │
│API      │  │  Webhook       │  │  Dashboard       │
│(Claude) │  │  (IAP 驗證)    │  │  + Cloudflare    │
└─────────┘  └────────────────┘  │  Analytics       │
                                  │  （監控）        │
                                  └─────────────────┘
```

### 點數系統後端設計

```
POST /api/feedback
  1. 驗證使用者 JWT
  2. 查詢使用者點數餘額
  3. 若餘額 < 1 → 回傳 402 Payment Required
  4. 原子操作：扣除 1 點 + 呼叫 Anthropic API（同一 transaction）
  5. 回傳批改結果
  6. 若 API 呼叫失敗 → rollback 點數

GET /api/credits/balance
  回傳當前點數餘額

POST /api/credits/purchase
  接收付款完成 webhook，增加點數
```

---

## 4. 資料模型

### User

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  settings: {
    ttsSpeed: number;
    showChineseDefault: boolean;
  };
}
```

### Credits

```typescript
interface Credits {
  userId: string;
  balance: number;
  transactions: CreditTransaction[];
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'deduct';
  amount: number;
  description: string;  // e.g., "AI feedback - W1 Q3"
  createdAt: Date;
}
```

### Episode（Listen）

每週一個主題，每天一集全新 Podcast，全年 365 集。內容以週為單位組織（`week-01.ts` ~ `week-53.ts`），每檔輸出該週所有每日集數的陣列。

```typescript
interface Episode {
  id: string;
  weekNumber: number;          // 1–53
  dayOfWeek: number;           // 1–7（1=週一）；W1/W53 為 1–4
  date?: string;               // legacy/reference only；不對應固定上線年日曆，也不得作為內容 lookup key
  theme: string;               // 當週主題（同週 7 集共用）
  title: string;               // 當集專屬標題
  phase: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';
  parts: EpisodePart[];
  keyPhrases: KeyPhrase[];
}

interface EpisodePart {
  title: string;
  lines: EpisodeLine[];
}

interface EpisodeLine {
  speaker: 'a' | 'b';
  speakerName: 'Mira' | 'Jamie';
  en: string;
  zh: string;
  vocab?: VocabItem[];
}
```

**內容檔結構：**
```typescript
// content/episodes/week-02.ts
export const WEEK_02: Episode[] = [
  { weekNumber: 2, dayOfWeek: 1, theme: 'Morning Routines', ... },
  { weekNumber: 2, dayOfWeek: 2, theme: 'Morning Routines', ... },
  // ...共 7 集
]

// content/episodes/index.ts
export function getEpisode(weekNumber: number, dayOfWeek: number): Episode | undefined
export function getWeekEpisodes(weekNumber: number): Episode[]
```

### ReadArticle（Speak）

```typescript
interface ReadArticle {
  weekNumber: number;          // rolling curriculum lookup key
  dayOfWeek: number;           // rolling curriculum lookup key
  topic: string;               // 七類之一
  title: string;               // 文章標題
  wordCount: number;           // 約 600
  text: string;                // 英文 HTML（5 段落）
  textZh: string;              // 中文 HTML（對應段落）
  vocabulary: VocabItem[];     // 4–6 個，CEFR B2 標準
}
```

### FlashCard（Review）

```typescript
interface FlashCard {
  id: string;
  source: 'listen' | 'speak';  // 來源標籤
  weekNumber: number;
  english: string;
  chinese: string;
  exampleSentence: string;
}
```

### ScheduleDay

```typescript
interface ScheduleDay {
  id: string;                  // rolling curriculum day id，例如 day-001
  programDay: number;          // 使用者開始後第幾天，1–365
  calendarDate: string;        // 依使用者 curriculumStartDate 動態生成的本地日期
  weekday: string;             // 'Monday' ~ 'Sunday'
  weekNumber: number;          // 1–53
  dayOfWeek: number;           // 1–7
  theme: string;               // 當週主題
  podcastTitle: string;        // 當天 Podcast 標題
  conversationPrompt: string;  // 當天 Conversation 題目
  speakTitle: string;          // 當天 Speak 文章標題
}
```

**課程工具函式（app 層）：**
```typescript
function formatLocalDate(date?: Date): string
function generateSchedule(startDateInput: string | Date): ScheduleDay[]
function getCurrentScheduleEntry(schedule: ScheduleDay[], date?: Date): ScheduleDay | null
```

---

## 5. 模組設計

### 5.1 Listen 模組

**說話者配置：**
- Mira（主角）— `--ui` 色（`#C4B49A`），active line 左側金色邊線
- Jamie（訪問者）— `#8AB4A0`（柔和綠灰），active line 左側綠灰色邊線

**迷你播放器觸發條件：**
```javascript
// .panels scroll 事件
var threshold = playerBar.offsetTop + playerBar.offsetHeight;
var isListenTab = activeTab.textContent.includes('Listen');
mini.classList.toggle('show', panels.scrollTop > threshold && isListenTab);
```

**TTS 正式版建議：** 預生成 `.mp3` 音訊（ElevenLabs），每行獨立檔案，替換 Web Speech API。

---

### 5.2 Conversation 模組

**AI 批改流程（含點數）：**

```
使用者送出答案
     │
     ▼
前端：顯示剩餘點數
     │
     ▼
POST /api/feedback（含 JWT）
     │
     ▼
後端：檢查點數餘額
     │  不足 → 回傳 402，前端顯示購買提示
     │  足夠 ↓
     ▼
原子操作：扣點 + 呼叫 Claude API
     │
     ▼
回傳批改結果（繁體中文）
格式：1. 整體評價 2. 改進點 3. 道地說法
```

**系統提示（參考）：**
```
你是一位為中級英文學習者（B1-B2）提供服務的口說教練。
題目："{question}"
學習者的回答："{answer}"
請以繁體中文提供簡潔、鼓勵性的批改：
1. 整體評價（先正向）
2. 1–2 個改進點（附修正範例）
3. 更道地的說法
```

---

### 5.3 Speak 模組

**雙語對照顯示機制：**
```javascript
// 英文段落與中文段落交替排列
var enParas = article.text.match(/<p>.*?<\/p>/gs);
var zhParas = article.textZh.match(/<p>.*?<\/p>/gs);
enParas.forEach((ep, i) => {
  html += ep;
  if (zhParas[i]) html += `<p class="read-zh-para">${strip(zhParas[i])}</p>`;
});
```

**中文段落樣式：**
```css
.read-zh-para {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
  margin-top: -8px;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 2px solid var(--border2);
}
```

**TTS 逐句高亮：** 播放時以字串比對找到當前句子，包裹 `<mark class="read-highlight">` 實現高亮。正式版建議預切分 `<span data-sentence-id>` 取代字串比對。

**錄音機制：**
- `MediaRecorder` API 收集 Blob chunks
- 停止後建立 Object URL 供 `<audio>` 播放
- **注意：** 目前不持久化，重新整理後消失

---

### 5.4 Review 模組

**字卡來源標籤渲染：**
```javascript
// cards 陣列每個物件含 src: 'listen' | 'speak'
var srcBadge = c.src === 'speak'
  ? '<span style="color:var(--clr-read);font-size:8px">SPEAK</span>'
  : '<span style="color:var(--clr-listen);font-size:8px">LISTEN</span>';
```

**持久化：**
```javascript
localStorage.setItem('sav_review_mastered', JSON.stringify([...masteredSet]));
```

---

### 5.5 Schedule 模組

**每日三行 icon 渲染：**
```javascript
// 三行各用對應 SVG icon 作為前綴
'<div class="day-topic listen-topic">' +
  '<span class="day-prefix-icon">▶ SVG</span>' + podcast + '</div>' +
'<div class="day-topic speak-topic">' +
  '<span class="day-prefix-icon">💬 SVG</span>' + conversation + '</div>' +
'<div class="day-topic read-topic-row">' +
  '<span class="day-prefix-icon">🎙 SVG</span>' + 'Read aloud — ' + theme + '</div>'
```

**Reset 雙擊確認機制：**
```javascript
function schResetConfirm(){
  var btn = document.getElementById('schResetBtn');
  if(btn.dataset.confirm === '1'){
    resetSchedule();
    btn.textContent = 'Reset all';
    btn.dataset.confirm = '0';
  } else {
    btn.textContent = 'Tap again to confirm';
    btn.dataset.confirm = '1';
    setTimeout(() => {
      if(btn.dataset.confirm === '1'){
        btn.textContent = 'Reset all';
        btn.dataset.confirm = '0';
      }
    }, 3000);
  }
}
```

**連續天數計算：**
```javascript
function calculateStreak(){
  const today = formatLocalDate();
  let streak = 0;
  for(let i = SCHEDULE.length - 1; i >= 0; i--){
    if(SCHEDULE[i].calendarDate > today) continue;
    if(completedDays[SCHEDULE[i].id]) streak++;
    else break;
  }
  return streak;
}
```

---

## 6. API 規格

### POST /api/feedback（含點數扣除）

**請求：**
```json
{
  "question": "Describe your morning routine step by step.",
  "answer": "I wake up at 6am...",
  "userLevel": "B1-B2"
}
```

**回應（成功）：**
```json
{
  "feedback": "<p>整體評價...</p>",
  "creditsRemaining": 47,
  "model": "claude-sonnet-4-20250514"
}
```

**回應（點數不足）：**
```json
{
  "error": "insufficient_credits",
  "creditsRemaining": 0,
  "purchaseUrl": "/credits/purchase"
}
```

---

### GET /api/credits/balance

**回應：**
```json
{
  "balance": 47,
  "lastPurchase": "2026-03-15T00:00:00Z"
}
```

---

### GET /api/content/episode/:weekNumber

**回應：**
```json
{
  "weekNumber": 1,
  "theme": "Morning Routines",
  "title": "A Day in the Life: Morning Habits",
  "parts": [{ "title": "Part 1 — Daily Routine", "lines": [...] }],
  "keyPhrases": [...]
}
```

---

### GET /api/content/article?week=:weekNumber&day=:dayOfWeek

**回應：**
```json
{
  "weekNumber": 8,
  "dayOfWeek": 3,
  "topic": "Technology",
  "title": "The Rise of Everyday AI",
  "wordCount": 620,
  "text": "<p>Artificial intelligence...</p>",
  "textZh": "<p>人工智慧...</p>",
  "vocabulary": [{ "word": "algorithm", "definition": "演算法" }]
}
```

---

## 7. 狀態管理

### 正式版建議（Zustand）

```
stores/
├── authStore.ts       // 使用者、JWT、點數餘額
├── progressStore.ts   // completedDays、masteredCards、streak
├── listenStore.ts     // currentLine、isPlaying、speed、showChinese
├── contentStore.ts    // 快取集數、文章、題目
└── uiStore.ts         // 當前 tab、捲動狀態、hints 狀態
```

每次 `progressStore` 變更，同步至 AsyncStorage（本地）與後端。

---

## 8. 內容管理

### 現況（Prototype）

| 內容 | 位置 | 現有數量 |
|------|------|----------|
| Podcast 腳本 | HTML DOM | 1 集（Episode 01） |
| SCHEDULE | `<script>` JS 陣列 | 288 天 |
| CURRICULUM | `<script>` JS 陣列 | 41 週 |
| Speak 文章 | `<script>` JS 物件 | 3 篇 |
| Review 字卡 | `<script>` JS 陣列 | 30 張（16 Listen + 14 Speak） |
| Conversation 題目 | `<script>` JS 陣列 | 8 道 |

### 內容製作標準

**Podcast 腳本：**
- 說話者依階段輪替（詳見 SAV-spec-zh.md 角色設定表）：W1–W10 Mira/Jamie、W11–W18 Lily/Tom、W19–W26 Sara/Alex、W27–W34 Nina/Marcus、W35–W43 Jade/Ryan、W44–W53 Maya/James
- 嚴禁真實地名、品牌名、個人識別資訊
- 每集約 500 字，3 段，16–20 行

**Speak 文章：**
- 約 600 字，5 段落
- 附完整中文翻譯（段落對應）
- 詞彙選取參照 CEFR B2 詞彙表
- 七類主題每週輪換

---

## 9. 技術選型建議

### 行動 App

| 層級 | 建議 | 原因 |
|------|------|------|
| 框架 | React Native + Expo | 跨平台、JS 熟悉度、生態系豐富 |
| 導航 | React Navigation | 底部 tab bar 符合手機 UX |
| 狀態管理 | Zustand | 輕量、API 簡單 |
| 本地儲存 | AsyncStorage | 替換 localStorage |
| 音訊播放 | expo-av | 跨平台可靠 |
| 錄音 | expo-av RecordingObject | 原生錄音 |
| TTS | OpenAI `tts-1` 預生成 mp3 + Cloudflare R2 CDN | 已決定採低成本方案；依目前內容量一次性約 $11.6 USD，之後 CDN 服務成本極低，品質一致 |
| 付款 | RevenueCat（Apple IAP + Google Play Billing 代理） | 統一雙平台 IAP，含收據驗證與 Webhook |
| 登入 | Supabase Auth（Email + Apple Sign In + Google Sign In） | Apple 規定必須提供 Sign in with Apple |

### 後端

| 層級 | 建議 | 原因 |
|------|------|------|
| 執行環境 | Supabase Edge Functions（Deno，Serverless） | 免費額度充足（2M 次/月），冷啟動 < 200ms，流量成長後可平滑遷移 |
| 資料庫 | Supabase (PostgreSQL) | Auth + DB + Storage + Edge Functions 一體 |
| AI 代理 | Supabase Edge Function + Anthropic SDK | 隱藏 API Key，管理點數 |
| 付款 webhook | RevenueCat → Supabase Edge Function | IAP 收據驗證後增加點數 |
| 音訊 CDN | Cloudflare R2 | 前 10GB 免費，1M 次 GET 免費，適合靜態音訊檔案 |
| 監控 | Supabase Dashboard + Cloudflare Analytics | 免費，流量超過免費上限時 Supabase 自動 email 通知 |

---

## 10. 從 Prototype 遷移至正式版

### 步驟一：提取內容

```bash
# 提取 JS 資料為 JSON 檔
SCHEDULE[]     → schedule.json     （288 天）
CURRICULUM[]   → curriculum.json   （41 週）
READ_ARTICLES  → articles.json     （3 篇，正式版需補充並改為 week/day 對應）
cards[]        → flashcards.json   （30 張，需補充）
questions[]    → questions.json    （8 道，需補充至 205 道）
# Episode 01 HTML → episode-01.json（解析 DOM）
```

### 步驟二：UI 移植重點

必須保留的設計決策：
- 四個代表色嚴格對應四個模組，不得混用
- `--ui`（`#C4B49A`）是唯一用於互動元素的品牌色
- 所有 tab icon 使用 SVG，不使用 emoji 或 Unicode
- Logo 字體 Cinzel，SAV 首字母用品牌色

### 步驟三：實作優先順序

**後端（與 App 並行開始）：**
1. Supabase 專案設定（Auth + DB Schema + Edge Functions）
2. RevenueCat 帳號設定 + IAP 產品建立
3. Cloudflare R2 bucket 建立 + 上傳 TTS 音訊

**App 模組（依序）：**
1. 帳號系統（Auth screens：Email + Sign in with Apple + Google）
2. Schedule（進度本地 + 雲端同步）
3. Review（字卡本地 + 雲端同步）
4. Listen（從 R2 載入 mp3）
5. Speak（錄音功能，本地暫存）
6. Conversation（後端 AI 代理 + 點數 + RevenueCat IAP）

---

## 11. 已知問題與技術債

### Prototype 問題

| 問題 | 嚴重度 | 解法 |
|------|--------|------|
| Web Speech API iOS Safari 不穩定 | 高 | **已決定**：OpenAI TTS 預生成 mp3，存 Cloudflare R2 |
| AI 批改僅在 claude.ai 環境有效 | 高 | **已決定**：Supabase Edge Function 後端代理 + 點數系統 |
| 錄音不持久化（重新整理消失） | 中 | v1 本地暫存可接受；v2 上傳至 Supabase Storage |
| 所有進度存 localStorage（單裝置） | 中 | **已決定**：帳號系統 + 後端同步（v1 必做） |
| 內容硬編碼在 HTML | 中 | 提取至 JSON，透過 Supabase Edge Function API 提供 |
| 逐句高亮用字串比對（不穩定） | 低 | 正式版預切分 `<span data-sentence-id>` |
| `--gold`/`--blue`/`--green` 遺留變數 | 低 | React Native 設計系統建立時全部使用語意變數 |

### 內容缺口

| 內容 | 現況 | 缺口 |
|------|------|------|
| Podcast 集數 | 1 / 41 集 | 40 集 |
| Speak 文章 | 3 / 288 篇 | 285 篇 |
| Conversation 題目 | 8 道（未對齊週次） | 197 道 |
| Review 字卡 | 30 張（W1 + 3 篇文章） | ~370 張 |

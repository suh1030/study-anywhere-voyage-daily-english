---
name: sav-rn-dev
description: Development guide for Study Anywhere Voyage (SAV) React Native app. Use when building SAV components, screens, navigation, or migrating from the HTML prototype. Triggers on phrases like "build SAV", "SAV component", "SAV screen", "migrate prototype", "React Native for SAV", "開發 SAV", "建立元件", "實作模組".
metadata:
  author: SAV
  version: 1.0.0
  category: development
---

# SAV React Native Development

Reference guide for building the SAV app in React Native + Expo.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo |
| Navigation | React Navigation (bottom tab bar) |
| State | Zustand |
| Local storage | AsyncStorage |
| Audio | expo-av |
| Recording | expo-av RecordingObject |
| TTS | Web Speech API (prototype) → ElevenLabs (production) |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Anthropic SDK (claude-sonnet-4-20250514) |

---

## CRITICAL: Design System

These rules are NON-NEGOTIABLE. Never mix module colors.

### Color Variables

```typescript
const colors = {
  // Module colors — ONLY use within their own module
  listen:  '#7AB8E8',  // Listen tab only
  speak:   '#9B84C4',  // Conversation tab only
  review:  '#6DB89A',  // Review tab only
  read:    '#C46A6A',  // Speak (read-aloud) tab only

  // UI brand colors — for buttons, active states, logo
  ui:      '#C4B49A',
  uiHover: '#D4C8B2',
  uiDim:   '#8A7D6E',

  // Surfaces
  bg:       '#080808',
  surface:  '#111111',
  surface2: '#181818',
  border:   '#252525',
  border2:  '#333333',

  // Text
  text:   '#E2DDD4',
  muted:  '#5A5650',
  muted2: '#3A3633',

  // Speaker colors (Listen module)
  mira:  '#C4B49A',  // same as ui
  jamie: '#8AB4A0',
};
```

### Typography

```typescript
const fonts = {
  body:    'DMSans',      // Body text
  heading: 'Outfit',     // Headings
  mono:    'DMMono',     // Labels, tags
  logo:    'Cinzel',     // Logo only
};
```

### Logo

- Font: Cinzel, 15px, letterSpacing: 0.02em
- "SAV" letters: `colors.ui` (#C4B49A)
- Rest of "Study Anywhere Voyage": `#E8E8E8`

### Tab Icons

All tabs use SVG icons — NO emoji, NO Unicode symbols.

```typescript
// Use react-native-svg
// Listen: play triangle
// Conversation: speech bubble
// Review: card stack
// Speak: microphone
// Schedule: calendar
// See prototype HTML for exact SVG paths
```

---

## Module Implementation Order

Build in this sequence (lowest to highest complexity):

1. **Schedule** — no API, pure localStorage/AsyncStorage
2. **Review** — no API, pure AsyncStorage
3. **Listen** — TTS via expo-av or Web Speech
4. **Speak** — recording via expo-av
5. **Conversation** — needs backend AI proxy + credits

---

## Step-by-Step for Each Module

### Schedule Module

```typescript
// Key behaviors:
// - Auto-expand current week on mount
// - Scroll to current week
// - Each day shows 3 rows: Listen / Conversation / Speak
// - Tap to toggle completion
// - Reset requires double-tap confirmation (3s window)
// - Persist to AsyncStorage key: 'sav_completed_days'
// - Streak calculation: count consecutive completed days backwards from today

function calculateStreak(completedDays: Record<string, boolean>, schedule: ScheduleDay[]): number {
  const today = getTodayKey(); // 'YYYY-MM-DD'
  let streak = 0;
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (schedule[i].dateKey > today) continue;
    if (completedDays[schedule[i].dateKey]) streak++;
    else break;
  }
  return streak;
}
```

### Listen Module

```typescript
// Key behaviors:
// - TTS plays line by line automatically
// - Tap any line to jump to it
// - Toggle Chinese translation per line
// - Speed control: 0.75x / 1.0x / 1.25x
// - Mini player appears when scrolled past main player
// - Mini player: listen to .panels scroll (NOT window scroll)
// - Vocabulary shows on active line
```

### Conversation Module (AI Feedback)

```typescript
// POST /api/feedback
// Request: { question, answer, userLevel: 'B1-B2' }
// Response: { feedback: string, creditsRemaining: number }
// Error 402: { error: 'insufficient_credits', creditsRemaining: 0 }

// System prompt for Claude:
const FEEDBACK_SYSTEM_PROMPT = `你是一位為中級英文學習者（B1-B2）提供服務的口說教練。
請以繁體中文提供簡潔、鼓勵性的批改：
1. 整體評價（先正向）
2. 1–2 個改進點（附修正範例）
3. 更道地的說法`;
```

### Review Module

```typescript
// Flashcard sources: 'listen' | 'speak'
// Filters: all / studying / mastered
// Mastered cards fade out
// Persist mastered set: AsyncStorage key 'sav_review_mastered'
// Card flip animation: use Animated or react-native-reanimated
```

---

## State Management (Zustand)

```typescript
// stores/
// ├── authStore.ts       — user, JWT, credit balance
// ├── progressStore.ts   — completedDays, masteredCards, streak
// ├── listenStore.ts     — currentLine, isPlaying, speed, showChinese
// ├── contentStore.ts    — cached episodes, articles, questions
// └── uiStore.ts         — active tab, scroll state, hint state

// progressStore syncs to AsyncStorage on every change
// contentStore caches API responses
```

---

## Backend API Routes

```
POST /api/feedback       — AI feedback (deducts 1 credit, atomic)
GET  /api/credits/balance
POST /api/credits/purchase  — webhook from payment processor
GET  /api/content/episode/:weekNumber
GET  /api/content/article/:dateKey
```

### Credit deduction (atomic operation)
```typescript
// CRITICAL: deduct credit and call Claude API in same transaction
// If Claude API fails → rollback credit deduction
// Never allow double-deduction
```

---

## Migrating from HTML Prototype

### Step 1: Extract data

```bash
# From prototype HTML, extract these JS arrays to JSON:
# SCHEDULE[]    → schedule.json    (288 days)
# CURRICULUM[]  → curriculum.json  (41 weeks)
# READ_ARTICLES → articles.json    (3 articles)
# cards[]       → flashcards.json  (30 cards)
# questions[]   → questions.json   (8 questions)
# Episode 01 HTML → episode-01.json
```

### Step 2: Port UI rules (MUST preserve)

- Four module colors strictly mapped to four modules
- `colors.ui` (#C4B49A) is the ONLY color for interactive elements
- All tab icons use SVG (not emoji)
- Logo: Cinzel font, SAV letters in brand color

### Step 3: Replace web APIs

| Prototype | React Native |
|-----------|-------------|
| `localStorage` | `AsyncStorage` |
| `Web Speech API` | `expo-av` (or ElevenLabs) |
| `MediaRecorder` | `expo-av` RecordingObject |
| `window.scroll` | `ScrollView` onScroll |
| `.panels` scroll | `ScrollView` ref |

---

## Common Issues

**Issue: TTS sounds robotic on iOS**
Cause: Web Speech API unstable on Safari
Solution: Use expo-speech for prototype, ElevenLabs pre-generated audio for production

**Issue: Mini player doesn't show/hide correctly**
Cause: Listening to wrong scroll source
Solution: Attach scroll listener to the panels ScrollView ref, not the window

**Issue: Double credit deduction**
Cause: Non-atomic DB operation
Solution: Use Supabase RPC with BEGIN/COMMIT or a single PostgreSQL function

**Issue: Streak calculation wrong**
Cause: Off-by-one on date comparison
Solution: Compare dateKey strings ('YYYY-MM-DD') directly, not Date objects

---
name: sav-content-creator
description: Generates Study Anywhere Voyage (SAV) learning content following strict spec. Use when creating podcast episode scripts, speak articles, conversation questions, flashcards, or any SAV curriculum content. Triggers on phrases like "generate episode", "write speak article", "create conversation questions", "make flashcards", "SAV content", "幫我生成集數", "寫 Speak 文章", "建立字卡".
metadata:
  author: SAV
  version: 1.0.0
  category: content-generation
---

# SAV Content Creator

Generates all SAV learning content following the product spec exactly.

## CRITICAL RULES (apply to ALL content)

- Characters: **Mira** (main, office worker) and **Jamie** (curious friend) — FIXED names, never change
- NEVER use real place names, brand names, or personally identifiable information
- All content targets CEFR B1–B2 learners (Taiwan office workers)
- Chinese must be in **繁體中文**

---

## Step 1: Identify Content Type

Ask the user which type if not specified:
1. **Listen** — Podcast episode script (週六播出)
2. **Speak** — Read-aloud article (每日)
3. **Conversation** — Speaking prompt questions (週一–週五)
4. **Flashcards** — Vocabulary review cards (週日)

---

## Instructions by Type

### TYPE 1: Listen — Podcast Episode Script

**Structure:**
- Week number (W1–W41) and theme
- Title format: "A Day in the Life: [Theme]"
- 5 parts, 35–45 dialogue lines total, ~1,200 words
- 8–12 vocabulary items
- 8–10 key phrases at the end

**Dialogue line format (JSON):**
```json
{
  "speaker": "Mira",
  "english": "I usually wake up around six thirty.",
  "chinese": "我通常六點半左右起床。",
  "vocabulary": [
    { "word": "usually", "definition": "通常" }
  ]
}
```

**Speaker colors (for reference):**
- Mira → warm beige `#C4B49A`
- Jamie → soft green-grey `#8AB4A0`

**Quality checklist before output:**
- [ ] Exactly 5 parts with clear part titles
- [ ] 35–45 lines total
- [ ] 8–12 vocab items (B1–B2 level)
- [ ] No real brands, places, or PII
- [ ] Natural conversational English, not textbook

---

### TYPE 2: Speak — Read-Aloud Article

**Structure:**
- Date key: `YYYY-MM-DD`
- Topic (rotate 7 categories): Technology / Science / Business & Career / Travel / AI & Future / Innovation / Society & Culture
- ~600 words, 5 paragraphs
- Full Chinese translation (paragraph-by-paragraph)
- 4–6 vocabulary items (CEFR B2 standard)

**Output format:**
```json
{
  "dateKey": "2026-03-22",
  "topic": "Technology",
  "title": "Article Title",
  "wordCount": 615,
  "text": "<p>English paragraph 1</p><p>English paragraph 2</p>...",
  "textZh": "<p>中文段落 1</p><p>中文段落 2</p>...",
  "vocabulary": [
    { "word": "algorithm", "definition": "演算法", "example": "The algorithm sorts data quickly." }
  ]
}
```

**Quality checklist:**
- [ ] Exactly 5 `<p>` tags in both `text` and `textZh`
- [ ] Chinese paragraphs correspond 1:1 with English
- [ ] 4–6 vocab items at B2 level (consult CEFR B2 ~4,000–5,000 word list)
- [ ] No real brand names

---

### TYPE 3: Conversation — Speaking Prompts

**Structure:**
- 5 questions per week (Mon–Fri)
- Each question covers same weekly theme from a different angle
- Include: English question, Chinese hint, sentence structure tip

**Output format:**
```json
{
  "weekNumber": 1,
  "theme": "Morning Routines",
  "questions": [
    {
      "day": "Monday",
      "question": "Describe your morning routine step by step.",
      "chineseHint": "描述你早晨的例行公事，步驟順序。",
      "structureTip": "Use: First, I... / Then I... / Finally, I..."
    }
  ]
}
```

**Quality checklist:**
- [ ] 5 questions, each from a different angle on the same theme
- [ ] Chinese hints are helpful, not direct translations
- [ ] Structure tips show real sentence patterns

---

### TYPE 4: Flashcards — Vocabulary Review Cards

**Structure:**
- Source tag: `listen` or `speak`
- Week number
- Front: English word
- Back: Chinese definition + example sentence

**Output format:**
```json
[
  {
    "id": "w1-listen-01",
    "source": "listen",
    "weekNumber": 1,
    "english": "commute",
    "chinese": "通勤",
    "exampleSentence": "My commute takes about forty minutes each way."
  }
]
```

**Quality checklist:**
- [ ] `source` is exactly `"listen"` or `"speak"`
- [ ] Example sentences use natural, everyday language
- [ ] Chinese definitions are concise (1–4 characters preferred)

---

## Batch Generation

When asked to generate multiple items (e.g., "W1–W5 conversation questions"):
1. Confirm the range and themes with the user first
2. Generate sequentially, one week at a time
3. Output as a JSON array
4. Pause and confirm after every 5 items to avoid errors

---

## Common Issues

**Error: Content feels like a textbook**
Cause: Too formal or structured dialogue
Solution: Add filler words ("well", "you know", "actually"), contractions, and natural pauses

**Error: Chinese translation is unnatural**
Cause: Literal translation
Solution: Translate meaning, not words — use natural 繁體中文 phrasing

**Error: Vocabulary too easy or too hard**
Cause: Not checking B2 level
Solution: Target words that a B1 learner would encounter but not know instantly (e.g., "resilient", "procrastinate", "skeptical")

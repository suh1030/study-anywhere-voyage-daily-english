/**
 * SAV DB Seeding Script
 *
 * 用法：
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=yyy npx tsx scripts/seed.ts
 *
 * 或建立 scripts/.env：
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'
import { normalizeEpisodeParts, normalizeKeyPhrases } from '../app/src/data/episode-normalize'

// ── env ──────────────────────────────────────────────────────────────────────

const envPath = path.resolve(__dirname, '.env')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [k, ...rest] = line.split('=')
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim()
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function getExpectedWeekLength(weekNum: number): number {
  return weekNum === 1 || weekNum === 53 ? 4 : 7
}

// ── upsert helpers ─────────────────────────────────────────────────────────────

async function upsert(table: string, rows: object[], conflictCol: string) {
  if (!rows.length) return
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictCol })
  if (error) throw new Error(`[${table}] ${error.message}`)
  console.log(`  ✓ ${table}: ${rows.length} rows`)
}

async function truncateInsert(table: string, rows: object[]) {
  if (!rows.length) return
  const { error: delErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) throw new Error(`[${table}] delete failed: ${delErr.message}`)
  const { error } = await supabase.from(table).insert(rows)
  if (error) throw new Error(`[${table}] ${error.message}`)
  console.log(`  ✓ ${table}: ${rows.length} rows`)
}

// ── seed episodes ─────────────────────────────────────────────────────────────

async function seedEpisodes() {
  console.log('\n── Episodes ──')
  const rows: object[] = []

  for (let w = 1; w <= 53; w++) {
    const pad = String(w).padStart(2, '0')
    const mod = await import(`../content/episodes/week-${pad}`)
    const key = `WEEK_${String(w).padStart(2, '0')}`
    const episodes: any[] = mod[key] ?? []

    for (const ep of episodes) {
      rows.push({
        week_number: ep.weekNumber,
        day_of_week: ep.dayOfWeek,
        date:        ep.date,
        theme:       ep.theme,
        title:       ep.title,
        phase:       ep.phase,
        parts:       normalizeEpisodeParts(ep.parts),
        key_phrases: normalizeKeyPhrases(ep.keyPhrases),
      })
    }
  }

  await upsert('episodes', rows, 'week_number,day_of_week')
}

// ── retire legacy articles ───────────────────────────────────────────────────

async function retireLegacyArticles() {
  console.log('\n── Legacy Articles ──')
  const { error } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) throw new Error(`[articles] delete failed: ${error.message}`)
  console.log('  ✓ articles: retired from seeded product content')
}

// ── seed flashcards ───────────────────────────────────────────────────────────

async function seedFlashcards() {
  console.log('\n── Flashcards ──')
  const files = [
    ['flashcards-w01-w08',  'FLASHCARDS_W01_W08'],
    ['flashcards-w09-w16',  'FLASHCARDS_W09_W16'],
    ['flashcards-w17-w24',  'FLASHCARDS_W17_W24'],
    ['flashcards-w25-w32',  'FLASHCARDS_W25_W32'],
    ['flashcards-w33-w41',  'FLASHCARDS_W33_W41'],
    ['flashcards-w42-w53',  'FLASHCARDS_W42_W53'],
  ] as const

  const rows: object[] = []
  for (const [file, exportName] of files) {
    const mod = await import(`../content/flashcards/${file}`)
    const cards: any[] = mod[exportName] ?? []
    for (const c of cards) {
      rows.push({
        source:           c.source,
        week_number:      c.weekNumber,
        english:          c.english,
        chinese:          c.chinese,
        example_sentence: c.exampleSentence,
      })
    }
  }

  await truncateInsert('flashcards', rows)
}

// ── seed questions ────────────────────────────────────────────────────────────

async function seedQuestions() {
  console.log('\n── Questions ──')
  const files = [
    ['conversations-w01-w08',  'CONVERSATIONS_W01_W08'],
    ['conversations-w09-w16',  'CONVERSATIONS_W09_W16'],
    ['conversations-w17-w24',  'CONVERSATIONS_W17_W24'],
    ['conversations-w25-w32',  'CONVERSATIONS_W25_W32'],
    ['conversations-w33-w41',  'CONVERSATIONS_W33_W41'],
    ['conversations-w42-w53',  'CONVERSATIONS_W42_W53'],
  ] as const

  const grouped = new Map<number, { theme: string; question: string; chineseHint: string; structureTip: string }[]>()
  for (const [file, exportName] of files) {
    const mod = await import(`../content/questions/${file}`)
    const qs: any[] = mod[exportName] ?? []
    for (const q of qs) {
      const bucket = grouped.get(q.weekNumber) ?? []
      bucket.push({
        theme: q.theme,
        question: q.question,
        chineseHint: q.chineseHint,
        structureTip: q.structureTip,
      })
      grouped.set(q.weekNumber, bucket)
    }
  }

  const rows: object[] = []
  for (let weekNumber = 1; weekNumber <= 53; weekNumber++) {
    const base = grouped.get(weekNumber) ?? []
    const expected = getExpectedWeekLength(weekNumber)
    const theme = base[0]?.theme ?? `Week ${weekNumber}`
    let normalized = base.slice(0, expected)

    if (base.length > expected) {
      console.warn(`[questions] W${String(weekNumber).padStart(2, '0')} has ${base.length} prompts; trimming to ${expected}.`)
    }

    if (normalized.length < expected) {
      normalized = normalized.concat(generateSupplementalQuestions(theme, expected - normalized.length))
      console.warn(`[questions] W${String(weekNumber).padStart(2, '0')} had ${base.length} prompts; auto-filled to ${expected}.`)
    }

    normalized.forEach((q, index) => {
      rows.push({
        week_number: weekNumber,
        day_of_week: index + 1,
        question: q.question,
        hint_zh: q.chineseHint,
        structure_hint: q.structureTip,
      })
    })
  }

  await truncateInsert('questions', rows)
}

function generateSupplementalQuestions(theme: string, count: number) {
  const templates = [
    {
      question: `After exploring ${theme} this week, what idea feels most relevant to your life right now?`,
      chineseHint: `回顧這週的主題「${theme}」，哪一個觀念和你現在的生活最有關？請結合自己的經驗說明。`,
      structureTip: 'Use: What stood out to me most was... / This feels relevant because... / In my life right now...',
    },
    {
      question: `What is one action or mindset from this week's theme of ${theme} that you want to carry forward?`,
      chineseHint: `這週談到「${theme}」，你想帶進下週或日常生活的一個行動或心態是什麼？`,
      structureTip: 'Use: One thing I want to carry forward is... / From now on, I want to... / This week reminded me that...',
    },
  ]

  return templates.slice(0, count).map((item) => ({
    theme,
    question: item.question,
    chineseHint: item.chineseHint,
    structureTip: item.structureTip,
  }))
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('SAV Seeding — start')
  console.log(`Target: ${SUPABASE_URL}`)

  try {
    await seedEpisodes()
    await retireLegacyArticles()
    await seedFlashcards()
    await seedQuestions()
    console.log('\nDone.')
  } catch (err) {
    console.error('\nSeed failed:', err)
    process.exit(1)
  }
}

main()

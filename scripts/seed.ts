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

// ── date helpers ──────────────────────────────────────────────────────────────

/** Return all dates for a given week number (2026 calendar). */
function getWeekDates(weekNum: number): string[] {
  const start = new Date(2026, 0, 1) // Jan 1, 2026
  let offset = 0
  for (let w = 1; w < weekNum; w++) {
    offset += w === 1 ? 4 : 7
  }
  const length = weekNum === 1 || weekNum === 53 ? 4 : 7
  return Array.from({ length }, (_, d) => {
    const date = new Date(start.getTime() + (offset + d) * 86400000)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${mm}-${dd}`
  })
}

const DAY_OF_WEEK: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
  Saturday: 6, Sunday: 7,
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
        parts:       ep.parts,
        key_phrases: ep.keyPhrases,
      })
    }
  }

  await upsert('episodes', rows, 'week_number,day_of_week')
}

// ── seed articles ─────────────────────────────────────────────────────────────

async function seedArticles() {
  console.log('\n── Articles ──')
  const rows: object[] = []

  for (let w = 1; w <= 53; w++) {
    const pad    = String(w).padStart(2, '0')
    const mod    = await import(`../content/articles/articles-w${pad}`)
    const key    = `W${w}_ARTICLES`
    const arts: any[] = mod[key] ?? []
    const dates  = getWeekDates(w)

    arts.forEach((a, i) => {
      if (!dates[i]) return // skip if article count exceeds week length
      rows.push({
        date_key:   dates[i],            // re-mapped to 2026 calendar
        week_number: w,
        topic:      a.topic,
        title:      a.title,
        word_count: a.wordCount,
        text_en:    a.text,
        text_zh:    a.textZh,
        vocabulary: a.vocabulary,
      })
    })
  }

  await upsert('articles', rows, 'date_key')
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
        id:               c.id,
        source:           c.source,
        week_number:      c.weekNumber,
        english:          c.english,
        chinese:          c.chinese,
        example_sentence: c.exampleSentence,
      })
    }
  }

  await upsert('flashcards', rows, 'id')
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

  const rows: object[] = []
  for (const [file, exportName] of files) {
    const mod = await import(`../content/questions/${file}`)
    const qs: any[] = mod[exportName] ?? []
    for (const q of qs) {
      rows.push({
        week_number:    q.weekNumber,
        day_of_week:    DAY_OF_WEEK[q.day] ?? 1,
        question:       q.question,
        hint_zh:        q.chineseHint,
        structure_hint: q.structureTip,
      })
    }
  }

  // questions has no stable id — upsert on (week_number, day_of_week)
  await upsert('questions', rows, 'week_number,day_of_week')
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('SAV Seeding — start')
  console.log(`Target: ${SUPABASE_URL}`)

  try {
    await seedEpisodes()
    await seedArticles()
    await seedFlashcards()
    await seedQuestions()
    console.log('\nDone.')
  } catch (err) {
    console.error('\nSeed failed:', err)
    process.exit(1)
  }
}

main()

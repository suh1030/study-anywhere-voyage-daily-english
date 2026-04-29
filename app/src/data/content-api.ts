import { supabase } from '../lib/supabase'
import { getCache, setCache } from '../lib/cache'
import { normalizeEpisodeParts, normalizeKeyPhrases } from './episode-normalize'

// ── DB row types ──────────────────────────────────────────────────────────────

export interface FlashcardRow {
  id: string
  source: 'listen' | 'speak'
  week_number: number
  english: string
  chinese: string
  example_sentence?: string
}

export interface QuestionRow {
  id: string
  week_number: number
  day_of_week: number
  question: string
  hint_zh?: string
  structure_hint?: string
}

export interface EpisodeLine {
  speaker: 'a' | 'b'
  speakerName: string
  en: string
  zh: string
}

export interface EpisodePart {
  title: string
  lines: EpisodeLine[]
}

export interface EpisodeRow {
  id: string
  week_number: number
  day_of_week: number
  date: string
  theme: string
  title: string
  phase: string
  parts: EpisodePart[]
  key_phrases: { en: string; zh: string; example: string }[]
}

function normalizeEpisodeRow(row: any): EpisodeRow {
  return {
    ...row,
    parts: normalizeEpisodeParts(row.parts),
    key_phrases: normalizeKeyPhrases(row.key_phrases),
  }
}

// ── API functions (cache-first) ───────────────────────────────────────────────

export async function fetchEpisode(
  weekNumber: number,
  dayOfWeek: number
): Promise<EpisodeRow | null> {
  const cacheKey = `episode:${weekNumber}:${dayOfWeek}`
  const cached = await getCache<EpisodeRow>(cacheKey)
  if (cached) {
    const normalized = normalizeEpisodeRow(cached)
    await setCache(cacheKey, normalized)
    return normalized
  }

  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('week_number', weekNumber)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (error || !data) return null
  const row = normalizeEpisodeRow(data)
  await setCache(cacheKey, row)
  return row
}

export async function fetchFlashcards(weekNumber: number): Promise<FlashcardRow[]> {
  const cacheKey = `flashcards:${weekNumber}`
  const cached = await getCache<FlashcardRow[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('week_number', weekNumber)
    .order('source')
  if (error || !data) return []
  const rows = data as FlashcardRow[]
  await setCache(cacheKey, rows)
  return rows
}

export async function fetchQuestion(
  weekNumber: number,
  dayOfWeek: number
): Promise<QuestionRow | null> {
  const cacheKey = `question:${weekNumber}:${dayOfWeek}`
  const cached = await getCache<QuestionRow>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('week_number', weekNumber)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (error || !data) return null
  const row = data as QuestionRow
  await setCache(cacheKey, row)
  return row
}

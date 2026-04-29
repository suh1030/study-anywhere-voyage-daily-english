import * as fs from 'fs/promises'
import * as path from 'path'

export const QUESTION_MODULES = [
  ['conversations-w01-w08', 'CONVERSATIONS_W01_W08'],
  ['conversations-w09-w16', 'CONVERSATIONS_W09_W16'],
  ['conversations-w17-w24', 'CONVERSATIONS_W17_W24'],
  ['conversations-w25-w32', 'CONVERSATIONS_W25_W32'],
  ['conversations-w33-w41', 'CONVERSATIONS_W33_W41'],
  ['conversations-w42-w53', 'CONVERSATIONS_W42_W53'],
] as const

export const FLASHCARD_MODULES = [
  ['flashcards-w01-w08', 'FLASHCARDS_W01_W08'],
  ['flashcards-w09-w16', 'FLASHCARDS_W09_W16'],
  ['flashcards-w17-w24', 'FLASHCARDS_W17_W24'],
  ['flashcards-w25-w32', 'FLASHCARDS_W25_W32'],
  ['flashcards-w33-w41', 'FLASHCARDS_W33_W41'],
  ['flashcards-w42-w53', 'FLASHCARDS_W42_W53'],
] as const

export interface LoadedArticleWeek {
  weekNumber: number
  fileName: string
  exportName: string
  expectedCount: number
  importPath: string
  articles: any[]
  error?: string
}

export interface LoadedEpisodeWeek {
  weekNumber: number
  fileName: string
  exportName: string
  expectedCount: number
  importPath: string
  episodes: any[]
  error?: string
}

export function getRepoPath(...segments: string[]): string {
  return path.join(process.cwd(), ...segments)
}

export function getArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(name)
}

export function padWeek(weekNumber: number): string {
  return String(weekNumber).padStart(2, '0')
}

export function expectedWeekLength(weekNumber: number): number {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

export function formatEpisodeId(weekNumber: number, dayOfWeek: number): string {
  return `W${padWeek(weekNumber)}D${dayOfWeek}`
}

export function normalizeWhitespace(value: string): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function stripHtmlTags(value: string): string {
  return String(value ?? '').replace(/<[^>]+>/g, ' ')
}

export function canonicalArticleWordCount(text: string): number {
  const cleaned = stripHtmlTags(String(text ?? '')).trim()
  if (!cleaned) return 0
  return cleaned.split(/\s+/).filter(Boolean).length
}

export function sentenceWordCount(value: string): number {
  const cleaned = normalizeWhitespace(String(value ?? ''))
  if (!cleaned) return 0
  return cleaned.split(/\s+/).filter(Boolean).length
}

export function normalizeClosingLine(value: string): string {
  return stripHtmlTags(String(value ?? ''))
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function escapeCsvCell(value: unknown): string {
  const stringValue = String(value ?? '')
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: Array<keyof T>): string {
  const headerLine = headers.join(',')
  const body = rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(','))
  return [headerLine, ...body].join('\n')
}

export async function ensureParentDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

export async function writeReport(filePath: string | undefined, content: string): Promise<void> {
  if (!filePath) return
  await ensureParentDir(filePath)
  await fs.writeFile(filePath, content, 'utf8')
}

async function loadModuleArray(importPath: string, exportName: string): Promise<any[]> {
  const mod = await import(importPath)
  const exported = mod[exportName]
  if (!Array.isArray(exported)) {
    throw new Error(`Export ${exportName} is not an array`)
  }
  return exported
}

export async function loadArticleWeeks(): Promise<LoadedArticleWeek[]> {
  const weeks: LoadedArticleWeek[] = []

  for (let weekNumber = 1; weekNumber <= 53; weekNumber += 1) {
    const paddedWeek = padWeek(weekNumber)
    const fileName = `articles-w${paddedWeek}.ts`
    const exportName = `W${weekNumber}_ARTICLES`
    const importPath = `../../content/articles/articles-w${paddedWeek}`

    try {
      const articles = await loadModuleArray(importPath, exportName)
      weeks.push({
        weekNumber,
        fileName,
        exportName,
        expectedCount: expectedWeekLength(weekNumber),
        importPath,
        articles,
      })
    } catch (error) {
      weeks.push({
        weekNumber,
        fileName,
        exportName,
        expectedCount: expectedWeekLength(weekNumber),
        importPath,
        articles: [],
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return weeks
}

export async function loadEpisodeWeeks(): Promise<LoadedEpisodeWeek[]> {
  const weeks: LoadedEpisodeWeek[] = []

  for (let weekNumber = 1; weekNumber <= 53; weekNumber += 1) {
    const paddedWeek = padWeek(weekNumber)
    const fileName = `week-${paddedWeek}.ts`
    const exportName = `WEEK_${paddedWeek}`
    const importPath = `../../content/episodes/week-${paddedWeek}`

    try {
      const episodes = await loadModuleArray(importPath, exportName)
      weeks.push({
        weekNumber,
        fileName,
        exportName,
        expectedCount: expectedWeekLength(weekNumber),
        importPath,
        episodes,
      })
    } catch (error) {
      weeks.push({
        weekNumber,
        fileName,
        exportName,
        expectedCount: expectedWeekLength(weekNumber),
        importPath,
        episodes: [],
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return weeks
}

export async function loadQuestionEntries(): Promise<any[]> {
  const allQuestions: any[] = []

  for (const [fileName, exportName] of QUESTION_MODULES) {
    const entries = await loadModuleArray(`../../content/questions/${fileName}`, exportName)
    allQuestions.push(...entries)
  }

  return allQuestions
}

export async function loadFlashcards(): Promise<any[]> {
  const allFlashcards: any[] = []

  for (const [fileName, exportName] of FLASHCARD_MODULES) {
    const cards = await loadModuleArray(`../../content/flashcards/${fileName}`, exportName)
    allFlashcards.push(...cards)
  }

  return allFlashcards
}

export async function loadCurriculum(): Promise<any[]> {
  const mod = await import('../../app/src/data/curriculum')
  const curriculum = mod.CURRICULUM

  if (!Array.isArray(curriculum)) {
    throw new Error('CURRICULUM export is not an array')
  }

  return curriculum
}

export function collectLineVocab(line: any): any[] {
  const vocab = Array.isArray(line?.vocab) ? line.vocab : []
  const vocabulary = Array.isArray(line?.vocabulary) ? line.vocabulary : []
  return [...vocab, ...vocabulary]
}

export function getLineEnglish(line: any): string {
  return String(line?.en ?? line?.english ?? '')
}

export function getEpisodeClosingLine(episode: any): string {
  const parts = Array.isArray(episode?.parts) ? episode.parts : []

  for (let partIndex = parts.length - 1; partIndex >= 0; partIndex -= 1) {
    const lines = Array.isArray(parts[partIndex]?.lines) ? parts[partIndex].lines : []
    for (let lineIndex = lines.length - 1; lineIndex >= 0; lineIndex -= 1) {
      const english = normalizeWhitespace(getLineEnglish(lines[lineIndex]))
      if (english) return english
    }
  }

  return ''
}


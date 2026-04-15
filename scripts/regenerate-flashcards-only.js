const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = process.cwd()

const FLASHCARD_GROUPS = [
  { start: 1, end: 8, file: 'flashcards-w01-w08.ts', exportName: 'FLASHCARDS_W01_W08' },
  { start: 9, end: 16, file: 'flashcards-w09-w16.ts', exportName: 'FLASHCARDS_W09_W16' },
  { start: 17, end: 24, file: 'flashcards-w17-w24.ts', exportName: 'FLASHCARDS_W17_W24' },
  { start: 25, end: 32, file: 'flashcards-w25-w32.ts', exportName: 'FLASHCARDS_W25_W32' },
  { start: 33, end: 41, file: 'flashcards-w33-w41.ts', exportName: 'FLASHCARDS_W33_W41' },
  { start: 42, end: 53, file: 'flashcards-w42-w53.ts', exportName: 'FLASHCARDS_W42_W53' },
]

function loadExportArray(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export interface[\s\S]*?\n}\n/gm, '')
    .replace(/export const\s+([A-Z0-9_]+)\s*:\s*[^=\n]+=\s*/g, 'module.exports.$1 = ')
    .replace(/export const\s+([A-Z0-9_]+)\s*=\s*/g, 'module.exports.$1 = ')

  const ctx = { module: { exports: {} } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  return ctx.module.exports[exportName] ?? []
}

function loadEpisodes() {
  const dir = path.join(ROOT, 'content', 'episodes')
  const files = fs.readdirSync(dir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()
  return files.flatMap((fileName) => {
    const weekNumber = Number(fileName.match(/\d+/)[0])
    const exportName = `WEEK_${String(weekNumber).padStart(2, '0')}`
    return loadExportArray(path.join(dir, fileName), exportName)
  })
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase()
}

function countWords(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length
}

function looksUsefulTerm(term) {
  const words = countWords(term.en)
  return Boolean(term.en && term.zh) && words >= 1 && words <= 5
}

function collectWeekCandidates(weekEpisodes) {
  const candidates = []

  for (let phraseIndex = 0; phraseIndex < 8; phraseIndex += 1) {
    for (const episode of weekEpisodes) {
      const phrase = (episode.keyPhrases || [])[phraseIndex]
      if (!phrase || !looksUsefulTerm(phrase)) continue
      candidates.push({
        english: phrase.en,
        chinese: phrase.zh,
        exampleSentence: phrase.example,
        sourceHint: 'keyPhrase',
      })
    }
  }

  for (const episode of weekEpisodes) {
    for (const part of episode.parts || []) {
      for (const line of part.lines || []) {
        for (const vocab of line.vocab || []) {
          if (!looksUsefulTerm({ en: vocab.word, zh: vocab.def })) continue
          if (!line.en || /[?？]$/.test(String(line.en).trim())) continue
          candidates.push({
            english: vocab.word,
            chinese: vocab.def,
            exampleSentence: line.en,
            sourceHint: 'line',
          })
        }
      }
    }
  }

  return candidates
}

function dedupeAndSelect(candidates, limit) {
  const selected = []
  const seenEnglish = new Set()
  const seenChinese = new Set()
  const seenExamples = new Set()

  for (const item of candidates) {
    const englishKey = normalizeKey(item.english)
    const chineseKey = String(item.chinese || '').trim()
    const exampleKey = normalizeKey(item.exampleSentence)
    if (!englishKey || !chineseKey || !exampleKey) continue
    if (seenEnglish.has(englishKey) || seenChinese.has(chineseKey) || seenExamples.has(exampleKey)) continue

    seenEnglish.add(englishKey)
    seenChinese.add(chineseKey)
    seenExamples.add(exampleKey)
    selected.push(item)

    if (selected.length >= limit) break
  }

  return selected
}

function buildWeekFlashcards(weekEpisodes) {
  const weekNumber = weekEpisodes[0]?.weekNumber
  const candidates = collectWeekCandidates(weekEpisodes)
  const chosen = dedupeAndSelect(candidates, 11)

  if (chosen.length < 11) {
    throw new Error(`Week ${weekNumber}: only found ${chosen.length} usable flashcard candidates`)
  }

  return chosen.map((item, index) => ({
    id: `w${weekNumber}-${index < 6 ? 'listen' : 'speak'}-${String((index < 6 ? index : index - 6) + 1).padStart(2, '0')}`,
    source: index < 6 ? 'listen' : 'speak',
    weekNumber,
    english: item.english,
    chinese: item.chinese,
    exampleSentence: item.exampleSentence,
  }))
}

function serializeFlashcard(card) {
  return `  { id: '${escapeSingle(card.id)}', source: '${card.source}', weekNumber: ${card.weekNumber}, english: '${escapeSingle(card.english)}', chinese: '${escapeSingle(card.chinese)}', exampleSentence: '${escapeSingle(card.exampleSentence)}' }`
}

function serializeFlashcardFile(group, items, includeInterface) {
  const header = includeInterface
    ? `export interface Flashcard {\n  id: string\n  source: 'listen' | 'speak'\n  weekNumber: number\n  english: string\n  chinese: string\n  exampleSentence: string\n}\n\n`
    : `import { Flashcard } from './flashcards-w01-w08'\n\n`

  return `${header}export const ${group.exportName}: Flashcard[] = [\n${items.map(serializeFlashcard).join(',\n')}\n]\n`
}

function main() {
  const episodes = loadEpisodes().sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber
    return a.dayOfWeek - b.dayOfWeek
  })

  const byWeek = new Map()
  for (const episode of episodes) {
    const bucket = byWeek.get(episode.weekNumber) ?? []
    bucket.push(episode)
    byWeek.set(episode.weekNumber, bucket)
  }

  const flashcardsByWeek = new Map()
  for (const [weekNumber, weekEpisodes] of byWeek.entries()) {
    flashcardsByWeek.set(weekNumber, buildWeekFlashcards(weekEpisodes))
  }

  for (const group of FLASHCARD_GROUPS) {
    const cards = []
    for (let week = group.start; week <= group.end; week += 1) {
      cards.push(...(flashcardsByWeek.get(week) ?? []))
    }

    const content = serializeFlashcardFile(group, cards, group.start === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'flashcards', group.file), content)
  }

  console.log(`Regenerated flashcards for ${episodes.length} episodes`)
}

if (require.main === module) {
  main()
}

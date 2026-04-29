import type { EpisodeLine, EpisodeRow, QuestionRow } from './content-api'

export interface SpeakPracticeSegment {
  id: string
  en: string
  zh: string
  speakerName: string
}

export interface SpeakPracticeVocabulary {
  word: string
  definition: string
}

export interface SpeakPractice {
  theme: string
  title: string
  goal: string
  hintZh?: string
  structureHint?: string
  segments: SpeakPracticeSegment[]
  vocabulary: SpeakPracticeVocabulary[]
}

type CandidateLine = EpisodeLine & {
  partIndex: number
  lineIndex: number
}

function normalizeText(value: string): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function wordCount(value: string): number {
  return normalizeText(value).split(/\s+/).filter(Boolean).length
}

function scoreLine(line: CandidateLine): number {
  const text = normalizeText(line.en)
  const length = wordCount(text)

  if (!text) return -999
  if (length < 4 || length > 24) return -100

  let score = 40 - Math.abs(12 - length) * 2

  if (text.endsWith('?')) score -= 2
  if (/[;:]/.test(text)) score -= 1
  if (length < 7) score -= 3
  if (length > 20) score -= 2

  return score
}

function collectCandidates(episode: EpisodeRow): CandidateLine[] {
  return episode.parts.flatMap((part, partIndex) =>
    part.lines.map((line, lineIndex) => ({
      ...line,
      partIndex,
      lineIndex,
    })),
  )
}

function selectSegments(episode: EpisodeRow): SpeakPracticeSegment[] {
  const targetCount = Math.min(6, Math.max(5, episode.parts.length + 1))
  const allCandidates = collectCandidates(episode)
  const chosenKeys = new Set<string>()
  const chosen: CandidateLine[] = []

  episode.parts.forEach((part, partIndex) => {
    const candidate = part.lines
      .map((line, lineIndex) => ({
        ...line,
        partIndex,
        lineIndex,
      }))
      .sort((left, right) => scoreLine(right) - scoreLine(left))[0]

    if (!candidate || scoreLine(candidate) < -50) return

    const key = `${candidate.partIndex}:${candidate.lineIndex}`
    chosenKeys.add(key)
    chosen.push(candidate)
  })

  const extras = allCandidates
    .filter((candidate) => !chosenKeys.has(`${candidate.partIndex}:${candidate.lineIndex}`))
    .sort((left, right) => scoreLine(right) - scoreLine(left))

  while (chosen.length < targetCount && extras.length > 0) {
    const next = extras.shift()
    if (!next || scoreLine(next) < -50) break
    chosen.push(next)
  }

  return chosen
    .sort((left, right) => left.partIndex - right.partIndex || left.lineIndex - right.lineIndex)
    .map((line) => ({
      id: `p${line.partIndex}-l${line.lineIndex}`,
      en: normalizeText(line.en),
      zh: normalizeText(line.zh),
      speakerName: line.speakerName,
    }))
}

function collectVocabulary(episode: EpisodeRow): SpeakPracticeVocabulary[] {
  const vocabulary = new Map<string, SpeakPracticeVocabulary>()

  episode.key_phrases.forEach((item) => {
    const word = normalizeText(item.en)
    const definition = normalizeText(item.zh)
    if (!word || !definition) return

    const key = word.toLowerCase()
    if (!vocabulary.has(key)) {
      vocabulary.set(key, { word, definition })
    }
  })

  return Array.from(vocabulary.values()).slice(0, 8)
}

export function buildSpeakPractice(
  episode: EpisodeRow,
  question: QuestionRow | null,
): SpeakPractice {
  return {
    theme: episode.theme,
    title: episode.title,
    goal: question?.question ?? `Use today's language to talk about ${episode.title.toLowerCase()}.`,
    hintZh: question?.hint_zh ?? undefined,
    structureHint:
      question?.structure_hint ??
      'Shadow each line once, then answer the question in your own words.',
    segments: selectSegments(episode),
    vocabulary: collectVocabulary(episode),
  }
}

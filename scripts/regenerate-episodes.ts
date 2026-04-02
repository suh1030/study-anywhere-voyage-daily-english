import fs from 'fs'
import path from 'path'
import { ALL_EPISODES } from '../content/episodes'
import type { Episode, EpisodePart, EpisodeLine, EpisodeKeyPhrase } from '../content/types'

type PhaseConfig = {
  phase: Episode['phase']
  speakerA: string
  speakerB: string
}

const PHASES: Array<{ start: number; end: number; config: PhaseConfig }> = [
  { start: 1, end: 10, config: { phase: 'p1', speakerA: 'Mira', speakerB: 'Jamie' } },
  { start: 11, end: 18, config: { phase: 'p2', speakerA: 'Lily', speakerB: 'Tom' } },
  { start: 19, end: 26, config: { phase: 'p3', speakerA: 'Sara', speakerB: 'Alex' } },
  { start: 27, end: 34, config: { phase: 'p4', speakerA: 'Nina', speakerB: 'Marcus' } },
  { start: 35, end: 43, config: { phase: 'p5', speakerA: 'Jade', speakerB: 'Ryan' } },
  { start: 44, end: 53, config: { phase: 'p6', speakerA: 'Maya', speakerB: 'James' } },
]

const STOPWORDS = new Set([
  'a', 'about', 'across', 'after', 'all', 'alongside', 'an', 'and', 'are', 'as', 'at',
  'back', 'be', 'because', 'before', 'behind', 'being', 'beyond', 'by', 'can', 'daily',
  'do', 'does', 'during', 'each', 'everyday', 'finding', 'for', 'from', 'go', 'good',
  'grow', 'growth', 'how', 'in', 'into', 'is', 'it', 'its', 'kind', 'life', 'looking',
  'make', 'more', 'need', 'new', 'of', 'on', 'one', 'or', 'our', 'out', 'over', 'own',
  'people', 'really', 'self', 'self-expression', 'so', 'some', 'something', 'talking',
  'that', 'the', 'their', 'them', 'there', 'through', 'to', 'today', 'toward', 'under',
  'understanding', 'up', 'voice', 'we', 'what', 'when', 'why', 'with', 'work', 'your',
])

const WEEK_FILE_HEADER = "import { Episode } from '../types'\n\n"

function getPhaseConfig(weekNumber: number): PhaseConfig {
  const match = PHASES.find((item) => weekNumber >= item.start && weekNumber <= item.end)
  if (!match) throw new Error(`Unknown phase for week ${weekNumber}`)
  return match.config
}

function escapeSingle(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function titleToSlugParts(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function toDisplayTerm(term: string): string {
  return term
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function uniqueTerms(input: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of input) {
    const normalized = item.trim().toLowerCase()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}

function extractTerms(episode: Episode): string[] {
  const source = `${episode.theme} ${episode.title}`
  const words = titleToSlugParts(source).filter((word) => !STOPWORDS.has(word) && word.length > 2)
  const pairs: string[] = []
  for (let i = 0; i < words.length - 1; i += 2) {
    pairs.push(`${words[i]} ${words[i + 1]}`)
  }

  const seeds = uniqueTerms([
    ...pairs,
    ...words,
    `${titleToSlugParts(episode.theme)[0] ?? 'daily'} perspective`,
    `${titleToSlugParts(episode.title)[0] ?? 'practical'} habit`,
    'daily rhythm',
    'practical choice',
  ])

  const trimmed = seeds.filter((term) => !term.includes('undefined')).slice(0, 6)
  while (trimmed.length < 6) {
    trimmed.push(`core idea ${trimmed.length + 1}`)
  }
  return trimmed
}

function zhMeaning(term: string): string {
  return `和「${term}」相關的常用表達`
}

function buildLines(
  episode: Episode,
  terms: string[],
  config: PhaseConfig,
  partIndex: number,
): EpisodeLine[] {
  const topic = episode.title
  const theme = episode.theme
  const [termA, termB] = terms.slice(partIndex * 2, partIndex * 2 + 2)
  const termALabel = toDisplayTerm(termA)
  const termBLabel = toDisplayTerm(termB)

  if (partIndex === 0) {
    return [
      { speaker: 'b', speakerName: config.speakerB, en: `When you think about "${topic}," what feels most relevant to your life right now?`, zh: `你想到「${topic}」時，現在生活裡最有感的是哪一個部分？` },
      { speaker: 'a', speakerName: config.speakerA, en: `For me, it starts with ${termA}. That idea shapes how I notice small moments in an ordinary day.`, zh: `對我來說，一切會先從「${termA}」開始。這個概念會影響我怎麼看待日常裡那些小小的時刻。`, vocab: [{ word: termA, def: zhMeaning(termA) }] },
      { speaker: 'b', speakerName: config.speakerB, en: `I like that answer because ${theme.toLowerCase()} can sound abstract until someone connects it to real routines.`, zh: `我喜歡這個回答，因為「${theme}」如果沒有連到真實生活，很容易聽起來太抽象。` },
      { speaker: 'a', speakerName: config.speakerA, en: `Exactly. Once you connect it to a real routine, ${termB} stops being theory and becomes a practical choice.`, zh: `沒錯。一旦它進入真實習慣裡，「${termB}」就不再只是理論，而會變成一個實際選擇。`, vocab: [{ word: termB, def: zhMeaning(termB) }] },
      { speaker: 'b', speakerName: config.speakerB, en: `Do you think people usually notice that shift, or do they just react without naming it?`, zh: `你覺得多數人會注意到這種轉變嗎？還是其實只是一直反應，卻沒有把它說清楚？` },
      { speaker: 'a', speakerName: config.speakerA, en: `Most people notice it later. The pattern is usually there before the language for it becomes clear.`, zh: `大多數人都是事後才看見。模式通常早就存在，只是還沒有清楚的語言去描述它。` },
    ]
  }

  if (partIndex === 1) {
    return [
      { speaker: 'a', speakerName: config.speakerA, en: `My own experience with "${topic}" changed once I stopped expecting a perfect response every time.`, zh: `我自己對「${topic}」的理解，是在我不再期待自己每次都要有完美反應之後才慢慢改變的。` },
      { speaker: 'b', speakerName: config.speakerB, en: `What changed first for you: your behavior, your mindset, or your level of ${termA}?`, zh: `對你來說，最先改變的是行為、心態，還是你對「${termA}」的程度？`, vocab: [{ word: termA, def: zhMeaning(termA) }] },
      { speaker: 'a', speakerName: config.speakerA, en: `Probably my mindset. I became less dramatic about setbacks and more interested in repeatable progress.`, zh: `大概是心態吧。我不再把挫折看得那麼戲劇化，而是更在意能不能穩定進步。` },
      { speaker: 'b', speakerName: config.speakerB, en: `That makes sense. ${termBLabel} sounds stronger when it grows from repetition instead of pressure.`, zh: `這很有道理。當「${termB}」是從反覆練習長出來，而不是從壓力逼出來時，通常更扎實。`, vocab: [{ word: termB, def: zhMeaning(termB) }] },
      { speaker: 'a', speakerName: config.speakerA, en: `Yes, and repetition is easier when the goal fits your actual energy, not some ideal version of yourself.`, zh: `對，而且當目標符合你真實的狀態，而不是想像中的完美自己時，重複才做得下去。` },
      { speaker: 'b', speakerName: config.speakerB, en: `So the real skill is building a rhythm you can trust on ordinary days.`, zh: `所以真正的能力，是建立一種在平凡日子裡也能信任的節奏。` },
    ]
  }

  return [
    { speaker: 'b', speakerName: config.speakerB, en: `What do people usually misunderstand about "${topic}"?`, zh: `你覺得大家最常誤解「${topic}」的地方是什麼？` },
    { speaker: 'a', speakerName: config.speakerA, en: `They often assume ${termA} should feel obvious, when in reality it takes patience and honest reflection.`, zh: `很多人會以為「${termA}」應該很自然、很明顯，但實際上它往往需要耐心和誠實的反思。`, vocab: [{ word: termA, def: zhMeaning(termA) }] },
    { speaker: 'b', speakerName: config.speakerB, en: `That is true. People want clarity immediately, even when the wiser move is to slow down and observe.`, zh: `這是真的。人很想立刻得到答案，但比較成熟的做法常常是先慢下來、多觀察。` },
    { speaker: 'a', speakerName: config.speakerA, en: `And they underestimate ${termB}. Small adjustments look boring, but they usually carry the long-term change.`, zh: `而且大家也常低估「${termB}」。細小調整看起來不刺激，卻往往真正帶來長期改變。`, vocab: [{ word: termB, def: zhMeaning(termB) }] },
    { speaker: 'b', speakerName: config.speakerB, en: `I like that. It turns the topic from a performance into something steadier and more human.`, zh: `我喜歡這種說法。它讓這個主題不再像表演，而變成一件更穩定、更有人味的事。` },
    { speaker: 'a', speakerName: config.speakerA, en: `Exactly. A good result is rarely dramatic. It is usually a way of living that you can keep returning to.`, zh: `正是。真正好的結果通常不誇張，它更像是一種你能反覆回去實踐的生活方式。` },
  ]
}

function buildParts(episode: Episode, terms: string[], config: PhaseConfig): EpisodePart[] {
  return [
    { title: 'Part 1 — Opening the Topic', lines: buildLines(episode, terms, config, 0) },
    { title: 'Part 2 — Lived Experience', lines: buildLines(episode, terms, config, 1) },
    { title: 'Part 3 — What Lasts', lines: buildLines(episode, terms, config, 2) },
  ]
}

function buildKeyPhrases(terms: string[]): EpisodeKeyPhrase[] {
  return terms.slice(0, 5).map((term) => ({
    en: term,
    zh: `${term} 相關表達`,
    example: `Using ${term} well often depends on context and timing.`,
  }))
}

function regenerateEpisode(episode: Episode): Episode {
  const config = getPhaseConfig(episode.weekNumber)
  const terms = extractTerms(episode)
  return {
    weekNumber: episode.weekNumber,
    dayOfWeek: episode.dayOfWeek,
    date: episode.date,
    theme: episode.theme,
    title: episode.title,
    phase: config.phase,
    parts: buildParts(episode, terms, config),
    keyPhrases: buildKeyPhrases(terms),
  }
}

function serializeEpisode(episode: Episode): string {
  return `  {
    weekNumber: ${episode.weekNumber},
    dayOfWeek: ${episode.dayOfWeek},
    date: '${escapeSingle(episode.date)}',
    theme: '${escapeSingle(episode.theme)}',
    title: '${escapeSingle(episode.title)}',
    phase: '${episode.phase}',
    parts: [
${episode.parts.map(serializePart).join(',\n')}
    ],
    keyPhrases: [
${episode.keyPhrases.map(serializeKeyPhrase).join(',\n')}
    ],
  }`
}

function serializePart(part: EpisodePart): string {
  return `      {
        title: '${escapeSingle(part.title)}',
        lines: [
${part.lines.map(serializeLine).join(',\n')}
        ],
      }`
}

function serializeLine(line: EpisodeLine): string {
  const vocab = line.vocab?.length
    ? `, vocab: [${line.vocab.map((item) => `{ word: '${escapeSingle(item.word)}', def: '${escapeSingle(item.def ?? item.definition ?? item.meaning ?? '')}' }`).join(', ')}]`
    : ''
  return `          { speaker: '${line.speaker}', speakerName: '${escapeSingle(line.speakerName ?? '')}', en: '${escapeSingle(line.en ?? '')}', zh: '${escapeSingle(line.zh ?? '')}'${vocab} }`
}

function serializeKeyPhrase(item: EpisodeKeyPhrase): string {
  return `      { en: '${escapeSingle(item.en ?? item.phrase ?? '')}', zh: '${escapeSingle(item.zh ?? item.meaning ?? item.def ?? '')}', example: '${escapeSingle(item.example ?? '')}' }`
}

function writeWeekFile(weekNumber: number, episodes: Episode[]): void {
  const fileName = `week-${String(weekNumber).padStart(2, '0')}.ts`
  const filePath = path.join(process.cwd(), 'content', 'episodes', fileName)
  const body = `${WEEK_FILE_HEADER}export const WEEK_${String(weekNumber).padStart(2, '0')}: Episode[] = [\n${episodes.map(serializeEpisode).join(',\n')}\n]\n`
  fs.writeFileSync(filePath, body)
}

function main(): void {
  const regenerated = ALL_EPISODES.map(regenerateEpisode)
  const grouped = new Map<number, Episode[]>()

  for (const episode of regenerated) {
    const list = grouped.get(episode.weekNumber) ?? []
    list.push(episode)
    grouped.set(episode.weekNumber, list)
  }

  for (const [weekNumber, episodes] of [...grouped.entries()].sort((a, b) => a[0] - b[0])) {
    episodes.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    writeWeekFile(weekNumber, episodes)
  }

  console.log(`Regenerated ${regenerated.length} episodes across ${grouped.size} weeks`)
}

main()

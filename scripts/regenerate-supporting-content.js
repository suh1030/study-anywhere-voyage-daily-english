const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = process.cwd()
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const QUESTION_GROUPS = [
  { start: 1, end: 8, file: 'conversations-w01-w08.ts', exportName: 'CONVERSATIONS_W01_W08' },
  { start: 9, end: 16, file: 'conversations-w09-w16.ts', exportName: 'CONVERSATIONS_W09_W16' },
  { start: 17, end: 24, file: 'conversations-w17-w24.ts', exportName: 'CONVERSATIONS_W17_W24' },
  { start: 25, end: 32, file: 'conversations-w25-w32.ts', exportName: 'CONVERSATIONS_W25_W32' },
  { start: 33, end: 41, file: 'conversations-w33-w41.ts', exportName: 'CONVERSATIONS_W33_W41' },
  { start: 42, end: 53, file: 'conversations-w42-w53.ts', exportName: 'CONVERSATIONS_W42_W53' },
]
const FLASHCARD_GROUPS = [
  { start: 1, end: 8, file: 'flashcards-w01-w08.ts', exportName: 'FLASHCARDS_W01_W08' },
  { start: 9, end: 16, file: 'flashcards-w09-w16.ts', exportName: 'FLASHCARDS_W09_W16' },
  { start: 17, end: 24, file: 'flashcards-w17-w24.ts', exportName: 'FLASHCARDS_W17_W24' },
  { start: 25, end: 32, file: 'flashcards-w25-w32.ts', exportName: 'FLASHCARDS_W25_W32' },
  { start: 33, end: 41, file: 'flashcards-w33-w41.ts', exportName: 'FLASHCARDS_W33_W41' },
  { start: 42, end: 53, file: 'flashcards-w42-w53.ts', exportName: 'FLASHCARDS_W42_W53' },
]

const QUESTION_TEMPLATES = [
  {
    question: 'How does "{title}" show up in your own life right now?',
    chineseHint: '結合自己的經驗，說說「{title}」目前如何出現在你的生活裡。',
    structureTip: 'Use: In my life right now... / I notice this most when... / A recent example is...',
  },
  {
    question: 'Describe a real situation where the theme of "{title}" mattered to you.',
    chineseHint: '描述一個真實情境，說明「{title}」這個主題為什麼對你重要。',
    structureTip: 'Use: One situation that comes to mind is... / What happened was... / It mattered because...',
  },
  {
    question: 'What makes "{title}" difficult or easy for you in daily life?',
    chineseHint: '你覺得「{title}」在日常生活中對你來說困難或容易的地方是什麼？',
    structureTip: 'Use: The difficult part for me is... / What makes it easier is... / I usually struggle when...',
  },
  {
    question: 'What is one habit or mindset that helps you with "{title}"?',
    chineseHint: '面對「{title}」時，有哪一個習慣或心態對你最有幫助？',
    structureTip: 'Use: One thing that helps me is... / I try to... / This works because...',
  },
  {
    question: 'What have you learned about "{theme}" from your own experience?',
    chineseHint: '根據你自己的經驗，你對「{theme}」有什麼新的理解？',
    structureTip: 'Use: I used to think... / Now I realize... / Experience has taught me that...',
  },
  {
    question: 'If a friend asked for advice about "{title}", what would you say?',
    chineseHint: '如果朋友問你關於「{title}」的建議，你會怎麼回答？',
    structureTip: 'Use: I would probably say... / My advice would be... / It helps to...',
  },
  {
    question: 'How would you like to improve in the area of "{title}"?',
    chineseHint: '在「{title}」這個面向上，你希望自己接下來怎麼進步？',
    structureTip: 'Use: I want to get better at... / My next step is... / I hope to...',
  },
]

const ARTICLE_TITLE_PREFIXES = [
  'A Closer Look at',
  'Rethinking',
  'Why',
  'The Deeper Side of',
  'Everyday Lessons from',
  'The Practical Meaning of',
]

const ARTICLE_INTROS = [
  '"{title}" sounds specific, but it opens into a larger question inside {themeLower}: how people turn values into repeatable choices.',
  'At first glance, "{title}" feels like a narrow subject. In practice, it reveals how people build routines, notice tension, and adjust over time.',
  '"{title}" belongs to ordinary life, which is exactly why it matters. Everyday subjects usually expose the clearest patterns in how people think and behave.',
  'The real value of "{title}" is not the topic alone, but the human pattern behind it: what people want, avoid, repeat, and eventually learn.',
]

const ARTICLE_BODY_ONE = [
  'One useful way to approach the topic is through {term1} and {term2}. Those ideas make the theme concrete instead of leaving it at the level of slogans.',
  'In real life, this theme usually shows up through moments involving {term1} and {term2}. They are small enough to observe, but important enough to shape the direction of a day.',
  'If you want to understand the subject clearly, start with {term1} and {term2}. They reveal where intention meets real behavior.',
  'The theme becomes easier to understand when it is grounded in {term1} and {term2}. That is where abstract ideas start to become visible choices.',
]

const ARTICLE_BODY_TWO = [
  'What makes "{title}" difficult is not awareness alone. Most people recognize the value of the idea long before they know how to practice it consistently.',
  'A common misunderstanding is to expect fast clarity. In reality, topics like this usually become easier only after repetition, discomfort, and honest reflection.',
  'The challenge is not whether the theme sounds meaningful. It is whether people can still return to it when energy is low, conditions are messy, or progress feels slow.',
  'Many people oversimplify the topic because they focus on dramatic change. More often, the lasting shift comes from smaller decisions repeated without much attention.',
]

const ARTICLE_BODY_THREE = [
  'That is why the subject matters beyond personal preference. It affects communication, trust, timing, and the way people influence one another.',
  'Seen more broadly, the theme shapes not only individual growth but also the quality of shared life. It changes how people listen, respond, and set expectations.',
  'On a wider level, the topic influences how communities define maturity, cooperation, and what a healthy rhythm looks like.',
  'The social side of the issue becomes clear once you notice how much it affects teamwork, emotional safety, and long-term consistency.',
]

const ARTICLE_OUTROS = [
  'The most useful takeaway is to treat this part of life as a practice. What matters is not one impressive moment, but a pattern that can survive ordinary days.',
  'In the end, the healthiest approach is steady use rather than perfection. Progress becomes real when it is calm enough to repeat.',
  'A practical conclusion is that durable change usually looks quieter than people expect. It is built from choices that remain available when life becomes inconvenient.',
  'That is why the topic is worth revisiting. It asks for consistency, not performance, and that is often where real growth begins.',
]

function expectedWeekLength(weekNumber) {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function loadExportArray(filePath, exportNamePattern) {
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export interface[\s\S]*?\n}\n/gm, '')
    .replace(/export function[\s\S]*?\n}\n/gm, '')
    .replace(/const DAY_LABELS[\s\S]*?\n\n/m, '')
    .replace(/function [\s\S]*?\n}\n/gm, '')
    .replace(/export const\s+([A-Z0-9_]+)\s*:\s*[^=\n]+=\s*/g, 'module.exports.$1 = ')
    .replace(/export const\s+([A-Z0-9_]+)\s*=\s*/g, 'module.exports.$1 = ')
    .replace(/const\s+([A-Z0-9_]+)\s*:\s*[^=\n]+=\s*/g, 'const $1 = ')
  const ctx = { module: { exports: {} } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  if (exportNamePattern) return ctx.module.exports[exportNamePattern] ?? []
  return ctx.module.exports
}

function loadEpisodes() {
  const dir = path.join(ROOT, 'content', 'episodes')
  const files = fs.readdirSync(dir).filter((f) => /^week-\d{2}\.ts$/.test(f)).sort()
  return files.flatMap((file) => {
    const weekNumber = Number(file.match(/\d+/)[0])
    const exportName = `WEEK_${String(weekNumber).padStart(2, '0')}`
    return loadExportArray(path.join(dir, file), exportName)
  })
}

function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''))
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'do', 'for', 'from', 'how', 'in', 'into',
  'is', 'it', 'may', 'might', 'much', 'my', 'not', 'of', 'on', 'or', 'our', 'should', 'the',
  'their', 'to', 'up', 'we', 'what', 'when', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
])

const GENERIC_TERM_BLACKLIST = new Set([
  'about',
  'ahead',
  'actually',
  'after',
  'always',
  'anyway',
  'behind',
  'between',
  'changed',
  'cannot',
  'clearly',
  'choosing',
  'difference',
  'day',
  'everyday',
  'explain',
  'first',
  'finding',
  'fully',
  'give',
  'gives',
  'habit',
  'how',
  'life',
  'let',
  'looking',
  'living',
  'makes',
  'matter',
  'navigating',
  'mindset',
  'more',
  'new',
  'no',
  'not',
  'move',
  'moving',
  'people',
  'power',
  'practice',
  'really',
  'science',
  'shape',
  'shaped',
  'speak',
  'talk',
  'talking',
  'that',
  'them',
  'thing',
  'things',
  'this',
  'today',
  'too',
  'want',
  'what',
  'why',
])

const QUALITY_FILLERS = [
  'daily practice',
  'small adjustment',
  'steady routine',
  'clear priority',
  'honest reflection',
  'long-term growth',
  'shared understanding',
  'personal direction',
  'consistent effort',
  'careful attention',
]

const DISCOURAGED_SINGLE_WORDS = new Set([
  'awe',
  'future',
  'job',
  'off',
  'work',
])

const DISCOURAGED_PHRASES = new Set([
  'rest without',
  'sustainable way',
  'without sounding',
  'work becomes',
  'work follows',
])

function normalizeTerm(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/([a-z]+)['’](ve|re|ll|d|m|s|t)\b/g, '$1')
    .replace(/&/g, ' and ')
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimStopwords(words) {
  let start = 0
  let end = words.length
  while (start < end && STOPWORDS.has(words[start])) start += 1
  while (end > start && STOPWORDS.has(words[end - 1])) end -= 1
  return words.slice(start, end)
}

function isUsableStudyTerm(term) {
  if (!term) return false
  const words = term.split(' ')
  if (!words.length || words.length > 5) return false
  if (words.some((word) => word.length < 2)) return false
  if (words.some((word) => STOPWORDS.has(word))) return false
  if (words.some((word) => GENERIC_TERM_BLACKLIST.has(word))) return false
  if (DISCOURAGED_PHRASES.has(term)) return false
  if (STOPWORDS.has(words[0]) || STOPWORDS.has(words[words.length - 1])) return false
  if (words.length === 1 && GENERIC_TERM_BLACKLIST.has(words[0])) return false
  if (words.length === 1 && DISCOURAGED_SINGLE_WORDS.has(words[0])) return false
  if (words.every((word) => GENERIC_TERM_BLACKLIST.has(word))) return false
  const meaningfulCount = words.filter((word) => !STOPWORDS.has(word)).length
  return meaningfulCount >= 1
}

function collectFromPhrase(raw, collector) {
  const segments = String(raw || '').split(/&|\/|,|:| - |—|–/g)
  for (const segment of segments) {
    const normalized = normalizeTerm(segment)
    if (!normalized) continue
    const originalWords = trimStopwords(normalized.split(' ').filter(Boolean))
    const contentWords = originalWords.filter((word) => !STOPWORDS.has(word))
    if (!contentWords.length) continue

    if (contentWords.length === 1 && !GENERIC_TERM_BLACKLIST.has(contentWords[0])) {
      collector(contentWords[0])
      continue
    }

    if (originalWords.length <= 5 && isUsableStudyTerm(originalWords.join(' '))) {
      collector(originalWords.join(' '))
    }

    for (let size = 2; size <= Math.min(5, originalWords.length); size += 1) {
      for (let start = 0; start <= originalWords.length - size; start += 1) {
        const slice = originalWords.slice(start, start + size)
        if (STOPWORDS.has(slice[0]) || STOPWORDS.has(slice[slice.length - 1])) continue
        collector(slice.join(' '))
      }
    }
  }
}

function collectEpisodeTerms(episode) {
  const unique = []
  const seen = new Set()
  const collector = (term) => {
    const normalized = normalizeTerm(term)
    if (!isUsableStudyTerm(normalized) || seen.has(normalized)) return
    seen.add(normalized)
    unique.push(normalized)
  }

  collectFromPhrase(episode.theme, collector)
  collectFromPhrase(episode.title, collector)

  if (unique.length < 5) {
    const offset = (episode.weekNumber + episode.dayOfWeek) % QUALITY_FILLERS.length
    for (let i = 0; i < QUALITY_FILLERS.length && unique.length < 5; i += 1) {
      collector(QUALITY_FILLERS[(offset + i) % QUALITY_FILLERS.length])
    }
  }

  return unique.slice(0, 8)
}

function buildChineseDefinition(term, theme) {
  return `和「${term}」相關、可用來討論「${theme}」的實用表達`
}

function getQuestionForEpisode(episode) {
  const terms = collectEpisodeTerms(episode)
  const focus = terms[(episode.dayOfWeek - 1) % terms.length] || normalizeTerm(episode.theme)
  const template = QUESTION_TEMPLATES[(episode.weekNumber + episode.dayOfWeek) % QUESTION_TEMPLATES.length]
  const data = { title: episode.title, theme: episode.theme, term: focus }
  return {
    weekNumber: episode.weekNumber,
    theme: episode.theme,
    day: DAY_LABELS[episode.dayOfWeek - 1],
    question: fill(template.question, data),
    chineseHint: fill(template.chineseHint, data),
    structureTip: template.structureTip,
  }
}

function buildArticleTitle(episode) {
  const prefix = ARTICLE_TITLE_PREFIXES[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_TITLE_PREFIXES.length]
  return `${prefix} ${episode.title}`
}

function englishDefinition(term, theme) {
  return `a useful expression for talking about ${theme.toLowerCase()} in practical situations`
}

function articleVocabulary(episode, terms) {
  return terms.slice(0, 5).map((term) => ({
    word: term,
    definition: `a practical phrase connected to ${episode.theme.toLowerCase()}`,
    example: `One useful way to talk about ${episode.theme.toLowerCase()} is to use the phrase "${term}" in a clear, specific example.`,
  }))
}

function buildArticle(episode) {
  const terms = collectEpisodeTerms(episode)
  while (terms.length < 5) terms.push(QUALITY_FILLERS[terms.length % QUALITY_FILLERS.length])
  const data = {
    title: episode.title,
    theme: episode.theme,
    themeLower: episode.theme.toLowerCase(),
    term1: terms[0],
    term2: terms[1],
    term3: terms[2],
  }
  const paragraphs = [
    fill(ARTICLE_INTROS[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_INTROS.length], data),
    fill(ARTICLE_BODY_ONE[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_BODY_ONE.length], data),
    fill(ARTICLE_BODY_TWO[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_BODY_TWO.length], data),
    fill(ARTICLE_BODY_THREE[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_BODY_THREE.length], data),
    fill(ARTICLE_OUTROS[(episode.weekNumber + episode.dayOfWeek) % ARTICLE_OUTROS.length], data),
  ]
  const text = paragraphs.map((p) => `<p>${p}</p>`).join('')
  const textZh = [
    `<p>「${episode.title}」看起來像是一個具體的小題目，但它其實把「${episode.theme}」裡更深的問題拉到了眼前，也就是人們如何把價值變成可重複的日常選擇。</p>`,
    `<p>理解這個主題最好的方式，不是空談大道理，而是從「${terms[0]}」和「${terms[1]}」這些具體情境開始。當主題落到可觀察的細節上，才會真正變得有意義。</p>`,
    `<p>真正困難的地方通常不是知道它重要，而是能不能在普通、混亂、甚至沒有動力的日子裡，依然回到這個方向。多數人卡住的不是理解，而是一致性。</p>`,
    `<p>這也是為什麼這類主題不只和個人成長有關。它還會影響人怎麼溝通、怎麼合作、怎麼回應壓力，以及彼此之間能不能建立穩定的信任。</p>`,
    `<p>實際的結論反而很務實：把它當成一種長期練習，而不是一次就要完美做到的表現。真正能留下來的變化，通常來自平常日子裡可重複的小選擇。</p>`,
  ].join('')

  return {
    dateKey: episode.date,
    topic: episode.theme,
    title: buildArticleTitle(episode),
    wordCount: 540,
    text,
    textZh,
    vocabulary: articleVocabulary(episode, terms),
  }
}

function serializeQuestionFile(group, questions, includeInterface) {
  const header = includeInterface
    ? `export interface ConversationQuestion {\n  weekNumber: number\n  theme: string\n  day: string\n  question: string\n  chineseHint: string\n  structureTip: string\n}\n\n`
    : `import { ConversationQuestion } from './conversations-w01-w08'\n\n`
  const body = questions.map((q) => `  {\n    weekNumber: ${q.weekNumber},\n    theme: '${escapeSingle(q.theme)}',\n    day: '${escapeSingle(q.day)}',\n    question: '${escapeSingle(q.question)}',\n    chineseHint: '${escapeSingle(q.chineseHint)}',\n    structureTip: '${escapeSingle(q.structureTip)}',\n  }`).join(',\n')
  return `${header}export const ${group.exportName}: ConversationQuestion[] = [\n${body}\n]\n`
}

function serializeFlashcardFile(group, cards, includeInterface) {
  const header = includeInterface
    ? `export interface Flashcard {\n  id: string\n  source: 'listen' | 'speak'\n  weekNumber: number\n  english: string\n  chinese: string\n  exampleSentence: string\n}\n\n`
    : `import { Flashcard } from './flashcards-w01-w08'\n\n`
  const body = cards.map((c) => `  { id: '${escapeSingle(c.id)}', source: '${c.source}', weekNumber: ${c.weekNumber}, english: '${escapeSingle(c.english)}', chinese: '${escapeSingle(c.chinese)}', exampleSentence: '${escapeSingle(c.exampleSentence)}' }`).join(',\n')
  return `${header}export const ${group.exportName}: Flashcard[] = [\n${body}\n]\n`
}

function serializeArticleFile(weekNumber, articles, includeInterface) {
  const header = includeInterface
    ? `export interface SpeakArticle {\n  dateKey: string\n  topic: string\n  title: string\n  wordCount: number\n  text: string\n  textZh: string\n  vocabulary: { word: string; definition: string; example: string }[]\n}\n\n`
    : `import { SpeakArticle } from './articles-w01'\n\n`
  const body = articles.map((a) => `  {\n    dateKey: '${escapeSingle(a.dateKey)}',\n    topic: '${escapeSingle(a.topic)}',\n    title: '${escapeSingle(a.title)}',\n    wordCount: ${a.wordCount},\n    text: '${escapeSingle(a.text)}',\n    textZh: '${escapeSingle(a.textZh)}',\n    vocabulary: [\n${a.vocabulary.map((v) => `      { word: '${escapeSingle(v.word)}', definition: '${escapeSingle(v.definition)}', example: '${escapeSingle(v.example)}' }`).join(',\n')}\n    ],\n  }`).join(',\n')
  return `${header}export const W${weekNumber}_ARTICLES: SpeakArticle[] = [\n${body}\n]\n`
}

function buildFlashcardsByWeek(episodes, articlesByWeek) {
  const result = new Map()
  const byWeekEpisodes = new Map()
  for (const episode of episodes) {
    const bucket = byWeekEpisodes.get(episode.weekNumber) ?? []
    bucket.push(episode)
    byWeekEpisodes.set(episode.weekNumber, bucket)
  }

  for (let week = 1; week <= 53; week += 1) {
    const episodeBucket = byWeekEpisodes.get(week) ?? []
    const listenCards = []
    const usedListen = new Set()
    for (const episode of episodeBucket) {
      const terms = collectEpisodeTerms(episode)
      const fallbackExample = `A useful way to talk about ${episode.theme.toLowerCase()} is through the idea of ${terms[0] || normalizeTerm(episode.theme)}.`
      for (const word of terms) {
        if (usedListen.has(word)) continue
        usedListen.add(word)
        const matchingLine = episode.parts
          .flatMap((part) => part.lines || [])
          .find((line) => String(line.en || '').toLowerCase().includes(word))
        listenCards.push({
          id: `w${week}-listen-${String(listenCards.length + 1).padStart(2, '0')}`,
          source: 'listen',
          weekNumber: week,
          english: word,
          chinese: buildChineseDefinition(word, episode.theme),
          exampleSentence: matchingLine?.en || fallbackExample,
        })
        if (listenCards.length >= 6) break
      }
      if (listenCards.length >= 6) break
    }

    const speakCards = []
    const usedSpeak = new Set()
    for (const article of articlesByWeek.get(week) ?? []) {
      for (const vocab of article.vocabulary) {
        const word = String(vocab.word)
        if (usedSpeak.has(word)) continue
        usedSpeak.add(word)
        speakCards.push({
          id: `w${week}-speak-${String(speakCards.length + 1).padStart(2, '0')}`,
          source: 'speak',
          weekNumber: week,
          english: word,
          chinese: buildChineseDefinition(word, article.topic),
          exampleSentence: vocab.example,
        })
        if (speakCards.length >= 5) break
      }
      if (speakCards.length >= 5) break
    }

    result.set(week, listenCards.concat(speakCards))
  }
  return result
}

function main() {
  const episodes = loadEpisodes()
  const questions = episodes.map(getQuestionForEpisode)
  const articlesByWeek = new Map()
  for (const episode of episodes) {
    const bucket = articlesByWeek.get(episode.weekNumber) ?? []
    bucket.push(buildArticle(episode))
    articlesByWeek.set(episode.weekNumber, bucket)
  }
  const flashcardsByWeek = buildFlashcardsByWeek(episodes, articlesByWeek)

  for (const group of QUESTION_GROUPS) {
    const grouped = questions.filter((q) => q.weekNumber >= group.start && q.weekNumber <= group.end)
    const content = serializeQuestionFile(group, grouped, group.start === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'questions', group.file), content)
  }

  for (const group of FLASHCARD_GROUPS) {
    const grouped = []
    for (let week = group.start; week <= group.end; week += 1) {
      grouped.push(...(flashcardsByWeek.get(week) ?? []))
    }
    const content = serializeFlashcardFile(group, grouped, group.start === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'flashcards', group.file), content)
  }

  for (let week = 1; week <= 53; week += 1) {
    const pad = String(week).padStart(2, '0')
    const content = serializeArticleFile(week, articlesByWeek.get(week) ?? [], week === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'articles', `articles-w${pad}.ts`), content)
  }

  console.log(`Regenerated supporting content for ${episodes.length} episodes`)
}

main()

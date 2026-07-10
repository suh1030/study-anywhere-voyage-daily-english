const fs = require('fs')
const path = require('path')
const vm = require('vm')

function load(filePath) {
  let source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export interface[\s\S]*?\n}\n/gm, '')
    .replace(/export function[\s\S]*?\n}\n/gm, '')
    .replace(/const DAY_LABELS[\s\S]*?\n\n/m, '')
    .replace(/function [\s\S]*?\n}\n/gm, '')
    .replace(/export const\s+([A-Z0-9_]+)\s*:\s*[^=\n]+=\s*/g, 'module.exports.$1 = ')
    .replace(/export const\s+([A-Z0-9_]+)\s*=\s*/g, 'module.exports.$1 = ')
    .replace(/const\s+([A-Z0-9_]+)\s*:\s*[^=\n]+=\s*/g, 'const $1 = ')

  if (source.includes('const q = (') && source.includes('ConversationQuestion')) {
    source = source.replace(/const q = \(([\s\S]*?)\): ConversationQuestion => \(\{/m, (_, params) => {
      const cleanParams = params.replace(/: [A-Za-z0-9_'| \[\]]+/g, '')
      return `const q = (${cleanParams}) => ({`
    })
  }

  const ctx = { module: { exports: {} } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  return ctx.module.exports
}

function expectedWeekLength(week) {
  return week === 1 || week === 53 ? 4 : 7
}

const PLACEHOLDER_EXAMPLES = [/^A useful way to talk about/i, /^A natural way to use/i]

function countChineseChars(value) {
  const matches = String(value || '').match(/[\u3400-\u9fff]/g)
  return matches ? matches.length : 0
}

function normalizeEnglish(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// 頭詞裡的人稱代名詞是「槽位」：例句換成 her/his/themselves 等仍算正確示範
const PRONOUNS = new Set([
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'they', 'them', 'their', 'theirs', 'themselves',
  'we', 'us', 'our', 'ours', 'ourselves',
  'it', 'its', 'itself',
])

// 頭詞裡的 something/someone 是可被任何受詞取代的槽位，比對時可跳過
const SLOT_WORDS = new Set(['something', 'someone', 'somebody', 'anything', 'anyone', 'anybody'])

const IRREGULAR_STEMS = {
  am: 'be', is: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  has: 'have', had: 'have', did: 'do', done: 'do', went: 'go', gone: 'go',
  made: 'make', took: 'take', taken: 'take', gave: 'give', given: 'give',
  got: 'get', gotten: 'get', came: 'come', told: 'tell', thought: 'think',
  brought: 'bring', said: 'say', saw: 'see', seen: 'see', knew: 'know', known: 'know',
  grew: 'grow', grown: 'grow', became: 'become', began: 'begin', begun: 'begin',
  left: 'leave', met: 'meet', paid: 'pay', sat: 'sit', built: 'build',
  meant: 'mean', spoke: 'speak', spoken: 'speak', wrote: 'write', written: 'write',
  ran: 'run', ate: 'eat', eaten: 'eat', chose: 'choose', chosen: 'choose',
  drew: 'draw', drawn: 'draw', fell: 'fall', fallen: 'fall', heard: 'hear',
  led: 'lead', wore: 'wear', worn: 'wear', won: 'win', threw: 'throw', thrown: 'throw',
  sold: 'sell', sent: 'send', taught: 'teach', caught: 'catch', bought: 'buy',
  understood: 'understand', spent: 'spend', stood: 'stand', felt: 'feel',
  lost: 'lose', held: 'hold', stuck: 'stick', kept: 'keep', found: 'find',
}

function simpleStem(token) {
  let t = String(token || '')
  if (PRONOUNS.has(t)) return '@pron'
  if (IRREGULAR_STEMS[t]) t = IRREGULAR_STEMS[t]
  t = t
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/ing$/, '')
    .replace(/ed$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '')
  // stopped -> stopp -> stop
  t = t.replace(/([b-df-hj-np-tv-z])\1$/, '$1')
  // noticing -> notic, notice -> notic（兩側同樣處理，僅供比對用）
  t = t.replace(/e$/, '')
  return t
}

function exampleContainsTerm(example, term) {
  const normalizedExample = normalizeEnglish(example)
  const normalizedTerm = normalizeEnglish(term)

  if (!normalizedTerm) return true
  if (normalizedExample.includes(normalizedTerm)) return true

  const exampleTokens = normalizedExample.split(' ').filter(Boolean).map(simpleStem)
  const rawTermTokens = normalizedTerm.split(' ').filter(Boolean)
  const termTokens = rawTermTokens.map(simpleStem)
  const optional = rawTermTokens.map((t) => SLOT_WORDS.has(t))

  let index = 0
  for (const token of exampleTokens) {
    // 槽位詞（something/someone）不強制出現：對不上就先跳過
    while (index < termTokens.length && optional[index] && token !== termTokens[index] && token !== '@pron') index += 1
    if (index < termTokens.length && (token === termTokens[index] || (optional[index] && token === '@pron'))) index += 1
    if (index === termTokens.length) return true
  }
  while (index < termTokens.length && optional[index]) index += 1

  return index === termTokens.length
}

const errors = []
const excludeArticles = process.argv.includes('--exclude-articles')

const questionFiles = fs.readdirSync('content/questions').filter((f) => f.endsWith('.ts')).sort()
const flashcardFiles = fs.readdirSync('content/flashcards').filter((f) => f.endsWith('.ts')).sort()
const articleFiles = excludeArticles
  ? []
  : fs.readdirSync('content/articles').filter((f) => f.endsWith('.ts')).sort()

const questions = questionFiles.flatMap((f) => Object.values(load(path.join('content/questions', f))).flatMap((v) => Array.isArray(v) ? v : []))
const flashcards = flashcardFiles.flatMap((f) => Object.values(load(path.join('content/flashcards', f))).flatMap((v) => Array.isArray(v) ? v : []))
const articles = articleFiles.flatMap((f) => Object.values(load(path.join('content/articles', f))).flatMap((v) => Array.isArray(v) ? v : []))

if (questions.length !== 365) errors.push(`Expected 365 questions, got ${questions.length}`)
if (!excludeArticles && articles.length !== 365) errors.push(`Expected 365 articles, got ${articles.length}`)

for (let week = 1; week <= 53; week += 1) {
  const qCount = questions.filter((q) => q.weekNumber === week).length
  if (qCount !== expectedWeekLength(week)) errors.push(`Week ${week}: expected ${expectedWeekLength(week)} questions, got ${qCount}`)

  const flashCount = flashcards.filter((c) => c.weekNumber === week).length
  if (flashCount < 11) errors.push(`Week ${week}: expected at least 11 flashcards, got ${flashCount}`)
}

if (!excludeArticles) {
  for (const file of articleFiles) {
    const week = Number(file.match(/w(\d{2})/)[1])
    const arrays = Object.values(load(path.join('content/articles', file))).filter((value) => Array.isArray(value))
    const count = arrays.flat().length
    if (count !== expectedWeekLength(week)) {
      errors.push(`Week ${week}: expected ${expectedWeekLength(week)} articles, got ${count}`)
    }
  }
}

if (!excludeArticles) {
  for (const article of articles) {
    if (!article.vocabulary || article.vocabulary.length < 5) errors.push(`Article "${article.title}" missing vocabulary`)
    if (!article.textZh || countChineseChars(article.textZh) < 20) {
      errors.push(`Article "${article.title}" has non-localized Chinese text`)
    }
    const seenDefinitions = new Set()
    for (const vocab of article.vocabulary || []) {
      if (PLACEHOLDER_EXAMPLES.some((pattern) => pattern.test(String(vocab.example || '')))) {
        errors.push(`Article "${article.title}" still has placeholder example for "${vocab.word}"`)
      }
      if (!vocab.definition || countChineseChars(vocab.definition) < 1) {
        errors.push(`Article "${article.title}" has non-localized definition for "${vocab.word}"`)
      }
      const definitionKey = String(vocab.definition || '').trim()
      if (definitionKey && seenDefinitions.has(definitionKey)) {
        errors.push(`Article "${article.title}" has duplicate vocabulary definition "${definitionKey}"`)
      }
      seenDefinitions.add(definitionKey)
    }
  }
}

for (const question of questions) {
  if (!question.chineseHint || /[A-Za-z]/.test(question.chineseHint)) {
    errors.push(`Question W${question.weekNumber} ${question.day} has non-localized chineseHint`)
  }
}

const uniqueQuestionTexts = new Set(questions.map((question) => String(question.question || '').trim()).filter(Boolean))
const uniqueQuestionHints = new Set(questions.map((question) => String(question.chineseHint || '').trim()).filter(Boolean))
const uniqueQuestionStructures = new Set(questions.map((question) => String(question.structureTip || '').trim()).filter(Boolean))

if (uniqueQuestionTexts.size !== questions.length) {
  errors.push('Duplicate conversation questions detected')
}

if (uniqueQuestionHints.size < 20) {
  errors.push(`Question Chinese hints are not varied enough: only ${uniqueQuestionHints.size} unique hints`)
}

if (uniqueQuestionStructures.size < 20) {
  errors.push(`Question structure tips are not varied enough: only ${uniqueQuestionStructures.size} unique tips`)
}

for (const card of flashcards) {
  if (!card.chinese || countChineseChars(card.chinese) < 1) {
    errors.push(`Flashcard ${card.id} has non-localized Chinese text`)
  }
  if (/[A-Za-z]{2,}/.test(String(card.chinese || ''))) {
    errors.push(`Flashcard ${card.id} still has English in Chinese text`)
  }
  if (PLACEHOLDER_EXAMPLES.some((pattern) => pattern.test(String(card.exampleSentence || '')))) {
    errors.push(`Flashcard ${card.id} still has placeholder example`)
  }
  if (!exampleContainsTerm(card.exampleSentence, card.english)) {
    errors.push(`Flashcard ${card.id} example does not directly demonstrate "${card.english}"`)
  }
}

if (!excludeArticles) {
  const articleZhCounts = new Map()
  for (const article of articles) {
    const key = String(article.textZh || '').trim()
    if (!key) continue
    articleZhCounts.set(key, (articleZhCounts.get(key) || 0) + 1)
  }

  for (const [textZh, count] of articleZhCounts.entries()) {
    if (count > 1) {
      errors.push(`Duplicate Chinese article text detected ${count} times`)
      break
    }
  }
}

// ── 字卡溯源：headword 必須真實出現在對應週的來源內容 ──────────────────
// listen → 該週集數（對話行 + keyPhrases）；speak → 該週文章（內文 + vocabulary）
function loadEpisodeWeek(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[] = /, 'module.exports = ')
  const ctx = { module: { exports: null } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  return ctx.module.exports
}

function phraseStems(value) {
  // something/someone 等槽位詞視同萬用（"outgrow something" 可對應 "outgrow it/a role"）
  return normalizeEnglish(value)
    .split(' ')
    .filter(Boolean)
    .map((t) => (SLOT_WORDS.has(t) ? '@pron' : simpleStem(t)))
}

// 連續視窗比對：headword 的 stems 必須連續出現於來源 stems（@pron 對任意 token）
function corpusContainsPhrase(corpusStems, phrase) {
  const needle = phraseStems(phrase)
  if (!needle.length) return true
  outer: for (let i = 0; i <= corpusStems.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (needle[j] === '@pron') continue
      if (corpusStems[i + j] !== needle[j]) continue outer
    }
    return true
  }
  return false
}

if (!excludeArticles) {
  const episodesByWeek = new Map()
  const episodeFiles = fs.readdirSync('content/episodes').filter((f) => /^week-\d{2}\.ts$/.test(f)).sort()
  for (const f of episodeFiles) {
    for (const ep of loadEpisodeWeek(path.join('content/episodes', f))) {
      if (!episodesByWeek.has(ep.weekNumber)) episodesByWeek.set(ep.weekNumber, [])
      episodesByWeek.get(ep.weekNumber).push(ep)
    }
  }
  const weekArticles = new Map()
  articleFiles.forEach((f) => {
    const week = Number((f.match(/articles-w(\d{2})/) || [])[1])
    const list = Object.values(load(path.join('content/articles', f))).flatMap((v) => (Array.isArray(v) ? v : []))
    weekArticles.set(week, list)
  })

  const listenCorpus = new Map()
  const speakCorpus = new Map()
  function corpusFor(card) {
    if (card.source === 'listen') {
      if (!listenCorpus.has(card.weekNumber)) {
        let text = ''
        for (const ep of episodesByWeek.get(card.weekNumber) || []) {
          for (const part of ep.parts) for (const line of part.lines) text += ' ' + (line.en || line.english || '')
          for (const k of ep.keyPhrases || []) text += ' ' + (k.en || k.phrase || '') + ' ' + (k.example || '')
        }
        listenCorpus.set(card.weekNumber, phraseStems(text))
      }
      return listenCorpus.get(card.weekNumber)
    }
    if (!speakCorpus.has(card.weekNumber)) {
      let text = ''
      for (const a of weekArticles.get(card.weekNumber) || []) {
        text += ' ' + String(a.text || '').replace(/<[^>]*>/g, ' ')
        for (const v of a.vocabulary || []) text += ' ' + (v.word || '') + ' ' + (v.example || '')
      }
      speakCorpus.set(card.weekNumber, phraseStems(text))
    }
    return speakCorpus.get(card.weekNumber)
  }

  for (const card of flashcards) {
    if (!corpusContainsPhrase(corpusFor(card), card.english)) {
      errors.push(`Flashcard ${card.id} headword "${card.english}" not found in week ${card.weekNumber} ${card.source} content`)
    }
  }
}

// ── 字卡 headword 全域唯一（不得跨週重複）──────────────────────────────
const headwordSeen = new Map()
for (const card of flashcards) {
  const key = normalizeEnglish(card.english)
  if (headwordSeen.has(key)) {
    errors.push(`Flashcard duplicate headword "${card.english}": ${headwordSeen.get(key)} / ${card.id}`)
  } else {
    headwordSeen.set(key, card.id)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${questions.length} questions, ${flashcards.length} flashcards, ${articles.length} articles (provenance + uniqueness OK)`)

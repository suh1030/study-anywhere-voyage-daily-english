const fs = require('fs')
const path = require('path')
const vm = require('vm')

function load(filePath) {
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
  return ctx.module.exports
}

function expectedWeekLength(week) {
  return week === 1 || week === 53 ? 4 : 7
}

const BAD_VOCAB_PATTERNS = [
  /\b(ahead hopes|finding your creative|storytelling human|creativity self-expression|music and emotional)\b/,
  /\b(makes real|power community|community giving|culture anyway|science gratitude)\b/,
  /\b(you when you|you speak|rest productive|rest renewal|goals intentions)\b/,
  /\b(back to move|living creative|art in everyday|reflections journey|circle reflections)\b/,
  /\b(might live|ve changed|navigating cultural|vision behind|anyway|speak)\b/,
]

const DISCOURAGED_SINGLE_WORDS = new Set(['awe', 'future', 'job', 'off', 'work'])
const FRAGMENT_WORDS = new Set([
  'about', 'actually', 'after', 'always', 'between', 'choosing', 'clearly', 'difference',
  'explain', 'finding', 'how', 'let', 'makes', 'matter', 'more', 'not', 'talk', 'talking',
  'that', 'them', 'this', 'too', 'what', 'why',
])
const DISCOURAGED_PHRASES = new Set(['rest without', 'sustainable way', 'without sounding', 'work becomes', 'work follows'])

function hasBadPattern(value) {
  return BAD_VOCAB_PATTERNS.some((pattern) => pattern.test(String(value).toLowerCase()))
}

function isDiscouragedSingleWord(value) {
  const normalized = String(value).toLowerCase().trim()
  return !normalized.includes(' ') && DISCOURAGED_SINGLE_WORDS.has(normalized)
}

function hasFragmentWord(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .some((word) => FRAGMENT_WORDS.has(word))
}

function isDiscouragedPhrase(value) {
  return DISCOURAGED_PHRASES.has(String(value).toLowerCase().trim())
}

const errors = []

const questionFiles = fs.readdirSync('content/questions').filter((f) => f.endsWith('.ts')).sort()
const flashcardFiles = fs.readdirSync('content/flashcards').filter((f) => f.endsWith('.ts')).sort()
const articleFiles = fs.readdirSync('content/articles').filter((f) => f.endsWith('.ts')).sort()

const questions = questionFiles.flatMap((f) => Object.values(load(path.join('content/questions', f))).flatMap((v) => Array.isArray(v) ? v : []))
const flashcards = flashcardFiles.flatMap((f) => Object.values(load(path.join('content/flashcards', f))).flatMap((v) => Array.isArray(v) ? v : []))
const articles = articleFiles.flatMap((f) => Object.values(load(path.join('content/articles', f))).flatMap((v) => Array.isArray(v) ? v : []))

if (questions.length !== 365) errors.push(`Expected 365 questions, got ${questions.length}`)
if (articles.length !== 365) errors.push(`Expected 365 articles, got ${articles.length}`)

for (let week = 1; week <= 53; week += 1) {
  const qCount = questions.filter((q) => q.weekNumber === week).length
  if (qCount !== expectedWeekLength(week)) errors.push(`Week ${week}: expected ${expectedWeekLength(week)} questions, got ${qCount}`)

  const flashCount = flashcards.filter((c) => c.weekNumber === week).length
  if (flashCount < 11) errors.push(`Week ${week}: expected at least 11 flashcards, got ${flashCount}`)
}

for (const file of articleFiles) {
  const week = Number(file.match(/w(\d{2})/)[1])
  const arrays = Object.values(load(path.join('content/articles', file))).filter((value) => Array.isArray(value))
  const count = arrays.flat().length
  if (count !== expectedWeekLength(week)) {
    errors.push(`Week ${week}: expected ${expectedWeekLength(week)} articles, got ${count}`)
  }
}

for (const article of articles) {
  if (!article.vocabulary || article.vocabulary.length < 5) errors.push(`Article "${article.title}" missing vocabulary`)
  for (const vocab of article.vocabulary || []) {
    if (hasBadPattern(vocab.word)) errors.push(`Article "${article.title}" has low-quality vocab "${vocab.word}"`)
    if (isDiscouragedSingleWord(vocab.word)) errors.push(`Article "${article.title}" has overly generic vocab "${vocab.word}"`)
    if (hasFragmentWord(vocab.word)) errors.push(`Article "${article.title}" has fragment-style vocab "${vocab.word}"`)
    if (isDiscouragedPhrase(vocab.word)) errors.push(`Article "${article.title}" has discouraged vocab "${vocab.word}"`)
  }
}

for (const card of flashcards) {
  if (hasBadPattern(card.english)) errors.push(`Flashcard ${card.id} has low-quality term "${card.english}"`)
  if (isDiscouragedSingleWord(card.english)) errors.push(`Flashcard ${card.id} has overly generic term "${card.english}"`)
  if (hasFragmentWord(card.english)) errors.push(`Flashcard ${card.id} has fragment-style term "${card.english}"`)
  if (isDiscouragedPhrase(card.english)) errors.push(`Flashcard ${card.id} has discouraged term "${card.english}"`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${questions.length} questions, ${flashcards.length} flashcards, ${articles.length} articles`)

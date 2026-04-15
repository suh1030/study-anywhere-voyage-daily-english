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

const PLACEHOLDER_EXAMPLES = [/^A useful way to talk about/i, /^A natural way to use/i]

function countChineseChars(value) {
  const matches = String(value || '').match(/[\u3400-\u9fff]/g)
  return matches ? matches.length : 0
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
  if (PLACEHOLDER_EXAMPLES.some((pattern) => pattern.test(String(card.exampleSentence || '')))) {
    errors.push(`Flashcard ${card.id} still has placeholder example`)
  }
}

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

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${questions.length} questions, ${flashcards.length} flashcards, ${articles.length} articles`)

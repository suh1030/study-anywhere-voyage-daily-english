#!/usr/bin/env node
/**
 * Generate proper ~600-word Speak articles using Claude API
 * Usage: node scripts/generate-articles.js [--weeks 1-5] [--week 3]
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk')

const ROOT = process.cwd()
const client = new Anthropic()

// ── Parse CLI args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2)
let targetWeeks = null // null = all weeks

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--weeks' && args[i + 1]) {
    const [start, end] = args[i + 1].split('-').map(Number)
    targetWeeks = Array.from({ length: (end || start) - start + 1 }, (_, k) => start + k)
  } else if (args[i] === '--week' && args[i + 1]) {
    targetWeeks = [parseInt(args[i + 1])]
  }
}

// ── Load episodes ──────────────────────────────────────────────────────────
function loadWeekEpisodes(weekNum) {
  const padded = String(weekNum).padStart(2, '0')
  const filePath = path.join(ROOT, 'content', 'episodes', `week-${padded}.ts`)
  if (!fs.existsSync(filePath)) return []
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const ctx = { module: { exports: [] } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  return ctx.module.exports || []
}

// ── Generate article for one episode ─────────────────────────────────────
async function generateArticle(episode) {
  const vocabItems = episode.parts
    .flatMap(p => p.lines)
    .flatMap(l => l.vocab || [])
    .filter((v, i, arr) => arr.findIndex(x => x.word === v.word) === i)
    .slice(0, 6)

  const keyPhrases = (episode.keyPhrases || []).slice(0, 5).map(k => k.en).join(', ')
  const vocabList = vocabItems.map(v => `${v.word} (${v.def})`).join(', ')

  const prompt = `Write a Speak article for an English learning app. This is a read-aloud article that English learners will read and practice speaking.

Topic: ${episode.theme}
Title: "${episode.title}"
Key vocabulary to naturally incorporate: ${vocabList || keyPhrases}

Requirements:
- Exactly 5 paragraphs
- Total ~550-650 words (about 110-130 words per paragraph)
- B2 level English — clear, natural, engaging; not too academic
- Write as a genuine article about the topic — like a thoughtful magazine piece
- DO NOT write meta-guidance like "this is a good speaking topic" or "learners can practice"
- DO NOT use phrases like "in conclusion", "in summary", "as we have seen"
- Naturally weave in the key vocabulary words (use their actual meaning in context)
- Each paragraph should advance one clear idea about the topic
- Personal and reflective tone — use "you" and "we" naturally
- Include at least one concrete real-life example or scenario
- End with a thought-provoking observation, not a generic summary

Format: Return ONLY the 5 paragraphs as HTML, using <p>...</p> tags. No title, no heading.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text.trim()
}

// ── Generate Chinese translation ──────────────────────────────────────────
async function generateChineseTranslation(englishHtml, title, theme) {
  const prompt = `Translate this English article into Traditional Chinese (繁體中文).

Article title: "${title}"
Topic: ${theme}

Requirements:
- Natural, flowing Traditional Chinese — not word-for-word translation
- Maintain the same paragraph structure (5 paragraphs, each in <p>...</p> tags)
- Preserve the engaging, thoughtful tone
- Use natural Chinese expressions, not overly literal translations
- Keep technical English terms as-is if commonly used in Chinese (e.g., podcast, app)

English text:
${englishHtml}

Return ONLY the translated HTML paragraphs.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text.trim()
}

// ── Build vocabulary items ────────────────────────────────────────────────
async function generateVocabExamples(episode, articleText) {
  const vocabItems = episode.parts
    .flatMap(p => p.lines)
    .flatMap(l => l.vocab || [])
    .filter((v, i, arr) => arr.findIndex(x => x.word === v.word) === i)
    .slice(0, 5)

  if (vocabItems.length === 0) {
    // Fall back to key phrases
    return (episode.keyPhrases || []).slice(0, 5).map(kp => ({
      word: kp.en || '',
      definition: kp.zh || '',
      example: kp.example || `She used "${kp.en}" naturally in a real conversation.`,
    }))
  }

  const results = []
  for (const v of vocabItems) {
    // Check if there's already a good example in the article
    const lowerArticle = articleText.toLowerCase()
    const lowerWord = (v.word || '').toLowerCase()

    // Find the sentence in the article that uses this word
    if (lowerArticle.includes(lowerWord)) {
      const sentences = articleText.replace(/<[^>]+>/g, '').split(/[.!?]+/)
      const matchingSentence = sentences.find(s => s.toLowerCase().includes(lowerWord))?.trim()
      if (matchingSentence && matchingSentence.split(/\s+/).length >= 6) {
        results.push({
          word: v.word,
          definition: v.def || v.definition || '',
          example: matchingSentence + '.',
        })
        continue
      }
    }

    // Generate a new example sentence
    results.push({
      word: v.word,
      definition: v.def || v.definition || '',
      example: await generateVocabExample(v.word, v.def || v.definition || '', episode.theme),
    })
  }

  return results
}

async function generateVocabExample(word, definition, theme) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Write ONE natural example sentence (12-18 words) showing how to use "${word}" (meaning: ${definition}) in a real-life context related to ${theme}. Return only the sentence.`,
    }],
  })
  return response.content[0].text.trim().replace(/^["']|["']$/g, '')
}

// ── Count words in HTML ───────────────────────────────────────────────────
function countWords(html) {
  return (html || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length
}

// ── Serialize article file ────────────────────────────────────────────────
function escapeSingleQuotes(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function serializeArticle(art) {
  const vocabLines = (art.vocabulary || []).map(v =>
    `      { word: '${escapeSingleQuotes(v.word)}', definition: '${escapeSingleQuotes(v.definition)}', example: '${escapeSingleQuotes(v.example)}' }`
  ).join(',\n')

  return `  {
    dateKey: '${art.dateKey}',
    topic: '${escapeSingleQuotes(art.topic)}',
    title: '${escapeSingleQuotes(art.title)}',
    wordCount: ${art.wordCount},
    text: '${escapeSingleQuotes(art.text)}',
    textZh: '${escapeSingleQuotes(art.textZh)}',
    vocabulary: [
${vocabLines}
    ],
  }`
}

function serializeWeekFile(weekNum, articles) {
  const padded = String(weekNum).padStart(2, '0')
  const isFirstWeek = weekNum === 1
  const header = isFirstWeek
    ? `export interface SpeakArticle {
  dateKey: string
  topic: string
  title: string
  wordCount: number
  text: string
  textZh: string
  vocabulary: { word: string; definition: string; example: string }[]
}

`
    : `import { SpeakArticle } from './articles-w01'\n\n`

  return `${header}export const W${weekNum}_ARTICLES: SpeakArticle[] = [\n${articles.map(serializeArticle).join(',\n')}\n]\n`
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const allWeeks = targetWeeks || Array.from({ length: 53 }, (_, i) => i + 1)

  console.log(`\n=== Generating Articles for Weeks: ${allWeeks.join(', ')} ===\n`)

  let totalGenerated = 0

  for (const weekNum of allWeeks) {
    const episodes = loadWeekEpisodes(weekNum)
    if (episodes.length === 0) {
      console.log(`Week ${weekNum}: no episodes found, skipping`)
      continue
    }

    const articles = []
    process.stdout.write(`Week ${String(weekNum).padStart(2)}: `)

    for (const episode of episodes) {
      try {
        const englishHtml = await generateArticle(episode)
        const chineseHtml = await generateChineseTranslation(englishHtml, episode.title, episode.theme)
        const vocabulary = await generateVocabExamples(episode, englishHtml)

        articles.push({
          dateKey: episode.date,
          topic: episode.theme,
          title: episode.title,
          wordCount: countWords(englishHtml),
          text: englishHtml,
          textZh: chineseHtml,
          vocabulary,
        })

        totalGenerated++
        process.stdout.write('.')

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        process.stdout.write('!')
        console.error(`\n  Error on ${episode.date} "${episode.title}": ${err.message}`)
      }
    }

    // Save week file
    const padded = String(weekNum).padStart(2, '0')
    const outPath = path.join(ROOT, 'content', 'articles', `articles-w${padded}.ts`)
    fs.writeFileSync(outPath, serializeWeekFile(weekNum, articles))
    console.log(` → saved ${articles.length} articles (avg ${Math.round(articles.reduce((s,a)=>s+a.wordCount,0)/Math.max(articles.length,1))} words)`)
  }

  console.log(`\n✓ Generated ${totalGenerated} articles total`)
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})

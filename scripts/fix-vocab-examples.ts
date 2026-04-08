/**
 * fix-vocab-examples.ts
 *
 * Replaces all template vocabulary example sentences in article and flashcard files
 * with real sentences that actually demonstrate the word in use.
 *
 * Run: tsx scripts/fix-vocab-examples.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic()

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles')
const FLASHCARDS_DIR = path.join(CONTENT_DIR, 'flashcards')

// Template patterns to detect broken examples
const TEMPLATE_PATTERNS = [
  /^A useful sentence with ".+?" usually comes from a specific moment, not from an abstract opinion\.$/,
  /^In real life, ".+?" often matters when people have to respond calmly instead of react quickly\.$/,
  /^You can use ".+?" naturally when you describe a real choice, pressure point, or change in perspective\.$/,
  /^The phrase ".+?" sounds most natural when it is tied to an actual experience from everyday life\.$/,
  /^A good way to use ".+?" is to connect it to one concrete situation from your own experience\.$/,
  /^I understand ".+?" better when I describe what happened, how I felt, and what I chose next\.$/,
  /^I notice ".+?" most clearly when a normal day suddenly asks me to choose how I want to respond\.$/,
  /^For me, ".+?" becomes real in small moments, especially when I do not have much time to think\.$/,
]

function isTemplateSentence(example: string): boolean {
  return TEMPLATE_PATTERNS.some(p => p.test(example.trim()))
}

// Extract all unique words that need real examples from article files
interface VocabItem {
  word: string
  definition: string
}

function extractVocabFromArticles(): Map<string, string> {
  // Map of word -> chinese definition
  const wordMap = new Map<string, string>()

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts'))
  for (const file of files) {
    const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
    // Match { word: '...', definition: '...', example: '...' }
    const regex = /\{\s*word:\s*'([^']+)',\s*definition:\s*'([^']+)',\s*example:\s*'([^']+)'\s*\}/g
    let match
    while ((match = regex.exec(content)) !== null) {
      const [, word, definition, example] = match
      if (isTemplateSentence(example)) {
        wordMap.set(word, definition)
      }
    }
  }
  return wordMap
}

function extractVocabFromFlashcards(): Map<string, string> {
  const wordMap = new Map<string, string>()

  const files = fs.readdirSync(FLASHCARDS_DIR).filter(f => f.endsWith('.ts'))
  for (const file of files) {
    const content = fs.readFileSync(path.join(FLASHCARDS_DIR, file), 'utf-8')
    // Match english: '...', chinese: '...', exampleSentence: '...'
    const regex = /english:\s*'([^']+)',\s*chinese:\s*'([^']+)',\s*exampleSentence:\s*'([^']+)'/g
    let match
    while ((match = regex.exec(content)) !== null) {
      const [, word, chinese, example] = match
      if (isTemplateSentence(example)) {
        wordMap.set(word, chinese)
      }
    }
  }
  return wordMap
}

// Generate real example sentences via Claude API in batches
async function generateExamples(words: VocabItem[]): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const BATCH_SIZE = 30

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE)
    console.log(`  Generating examples for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(words.length / BATCH_SIZE)} (${batch.length} words)...`)

    const wordList = batch.map((v, idx) => `${idx + 1}. word: "${v.word}" (meaning: ${v.definition})`).join('\n')

    const prompt = `You are writing example sentences for an English learning app targeted at adult intermediate learners (CEFR B1-B2).

For each word below, write ONE clear, natural example sentence that:
- Actually USES the word in a real sentence (not just talks about it)
- Shows the word in a realistic everyday or professional context
- Is between 15-25 words long
- Sounds like something a real person would say
- Does NOT include the word's Chinese definition
- Does NOT use meta-language like "you can use this word when..." or "this phrase sounds natural when..."

Words:
${wordList}

Respond with ONLY a JSON object where keys are the word (exactly as given) and values are the example sentence. Example format:
{
  "fresh starts": "After a difficult year, she decided to use January as a fresh start and changed her daily schedule completely.",
  "word2": "example sentence..."
}`

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })

      const text = (response.content[0] as any).text
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        for (const [word, example] of Object.entries(parsed)) {
          results.set(word, example as string)
        }
      }
    } catch (err) {
      console.error(`  Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, err)
    }

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < words.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return results
}

// Replace examples in article files
function fixArticleFiles(exampleMap: Map<string, string>): number {
  let totalReplaced = 0
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts')).sort()

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file)
    let content = fs.readFileSync(filePath, 'utf-8')
    let replaced = 0

    // Replace each vocab entry that has a template example
    content = content.replace(
      /(\{\s*word:\s*'([^']+)',\s*definition:\s*'([^']+)',\s*example:\s*')(([^']|'(?!}))*?)('\s*\})/g,
      (match, prefix, word, definition, example, _g4, suffix) => {
        if (isTemplateSentence(example) && exampleMap.has(word)) {
          replaced++
          totalReplaced++
          return `${prefix}${exampleMap.get(word)}${suffix}`
        }
        return match
      }
    )

    fs.writeFileSync(filePath, content, 'utf-8')
    if (replaced > 0) {
      console.log(`  ${file}: replaced ${replaced} examples`)
    }
  }

  return totalReplaced
}

// Replace examples in flashcard files
function fixFlashcardFiles(exampleMap: Map<string, string>): number {
  let totalReplaced = 0
  const files = fs.readdirSync(FLASHCARDS_DIR).filter(f => f.endsWith('.ts')).sort()

  for (const file of files) {
    const filePath = path.join(FLASHCARDS_DIR, file)
    let content = fs.readFileSync(filePath, 'utf-8')
    let replaced = 0

    // Match the full flashcard entry to get the english word, then replace exampleSentence
    content = content.replace(
      /(english:\s*'([^']+)',\s*chinese:\s*'([^']+)',\s*exampleSentence:\s*')(([^']|'(?!\s*\}))*?)(')/g,
      (match, prefix, word, chinese, example, _g4, suffix) => {
        if (isTemplateSentence(example) && exampleMap.has(word)) {
          replaced++
          totalReplaced++
          return `${prefix}${exampleMap.get(word)}${suffix}`
        }
        return match
      }
    )

    fs.writeFileSync(filePath, content, 'utf-8')
    if (replaced > 0) {
      console.log(`  ${file}: replaced ${replaced} examples`)
    }
  }

  return totalReplaced
}

async function main() {
  console.log('=== Vocabulary Example Sentence Fixer ===\n')

  // Step 1: Collect all unique words needing fixes
  console.log('Step 1: Scanning files for template examples...')
  const articleWords = extractVocabFromArticles()
  const flashcardWords = extractVocabFromFlashcards()

  // Merge into single unique word map
  const allWords = new Map<string, string>([...articleWords, ...flashcardWords])

  console.log(`  Found ${articleWords.size} unique words in articles`)
  console.log(`  Found ${flashcardWords.size} unique words in flashcards`)
  console.log(`  Total unique words to fix: ${allWords.size}\n`)

  // Step 2: Generate real examples
  console.log('Step 2: Generating real example sentences via Claude API...')
  const vocabItems: VocabItem[] = Array.from(allWords.entries()).map(([word, definition]) => ({ word, definition }))
  const exampleMap = await generateExamples(vocabItems)
  console.log(`  Generated ${exampleMap.size} example sentences\n`)

  // Step 3: Apply fixes to article files
  console.log('Step 3: Fixing article files...')
  const articleReplaced = fixArticleFiles(exampleMap)
  console.log(`  Total replaced in articles: ${articleReplaced}\n`)

  // Step 4: Apply fixes to flashcard files
  console.log('Step 4: Fixing flashcard files...')
  const flashcardReplaced = fixFlashcardFiles(exampleMap)
  console.log(`  Total replaced in flashcards: ${flashcardReplaced}\n`)

  console.log(`=== Done! Total replacements: ${articleReplaced + flashcardReplaced} ===`)

  // Show sample of generated examples
  console.log('\nSample generated examples:')
  let count = 0
  for (const [word, example] of exampleMap) {
    if (count >= 5) break
    console.log(`  "${word}" → ${example}`)
    count++
  }
}

main().catch(console.error)

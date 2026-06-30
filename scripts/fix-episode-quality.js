/**
 * Fix Episode Quality Issues
 * 1. Deduplicate vocab items within each episode
 * 2. Replace repeated cross-episode closing lines with episode-specific ones
 * 3. Expand short key phrase examples
 */

const fs = require('fs')
const path = require('path')

const EPISODES_DIR = path.join(process.cwd(), 'content', 'episodes')

// ── Cross-episode duplicate closing lines to replace ──────────────────────
// These lines appear in 3+ episodes and need to be made unique
// Format: { original: string, speaker: 'a'|'b' }
const DUPLICATE_CLOSING_LINES = new Set([
  'That feels like the right ending.',
  'That feels like the exact right ending.',
  'That feels like the right note to end on.',
  'That feels like the right place to end.',
  'That feels like the right ending for this conversation.',
  'That feels like the right ending for this episode.',
  'That sentence is going to stay with me.',
  'That line is going to stay with me.',
  'That is such a useful distinction.',
  'That is a very useful distinction.',
  'That is such an important distinction.',
  'That is a beautiful way to say it.',
  'That is such a good way to put it.',
  'That is such a relieving sentence.',
  'That is a very satisfying answer.',
  'That is such a useful correction.',
])

// Words/phrases in these duplicate lines (for pattern matching)
const DUPLICATE_PATTERNS = [
  /^That feels like the right (ending|note to end on|place to end)(?: for this (?:conversation|episode))?\.$/i,
  /^That feels like the exact right ending\.$/i,
  /^That (sentence|line) is going to stay with me\.$/i,
  /^That is such a (very )?(useful|important|good) (distinction|correction|way to put it)\.$/i,
  /^That is (a very )?(beautiful way to say it|a very satisfying answer|such a relieving sentence)\.$/i,
]

function isDuplicateClosingLine(en) {
  const trimmed = (en || '').trim()
  return DUPLICATE_CLOSING_LINES.has(trimmed) ||
    DUPLICATE_PATTERNS.some(p => p.test(trimmed))
}

function loadFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

// ── Fix 1: Deduplicate vocab items within each episode ─────────────────────
function deduplicateVocab(episodes) {
  let fixed = 0
  for (const episode of episodes) {
    const seenWords = new Set()
    for (const part of episode.parts || []) {
      for (const line of part.lines || []) {
        if (!line.vocab || line.vocab.length === 0) continue
        const before = line.vocab.length
        line.vocab = line.vocab.filter(v => {
          const word = (v.word || '').toLowerCase().trim()
          if (!word) return true
          if (seenWords.has(word)) {
            return false // Remove duplicate
          }
          seenWords.add(word)
          return true
        })
        fixed += before - line.vocab.length
      }
    }
  }
  return fixed
}

// ── Fix 2: Replace duplicate closing lines with episode-specific content ───
// Generate a unique closing remark based on episode theme/title
function generateClosingLine(episode, line) {
  const theme = episode.theme || ''
  const title = episode.title || ''
  const speaker = line.speaker

  // Get the last substantive Mira line for context
  const allLines = episode.parts.flatMap(p => p.lines)
  const lineIndex = allLines.indexOf(line)
  // Find the last Mira line before this one
  let miraContext = ''
  for (let i = lineIndex - 1; i >= 0; i--) {
    if (allLines[i].speaker === 'a' && allLines[i].en && allLines[i].en.length > 30) {
      miraContext = allLines[i].en
      break
    }
  }

  // Theme-based closing remarks for Jamie (speaker B)
  const closingsByTheme = {
    'New Beginning': [
      "I'll carry that into the year.",
      "That reframes the whole day for me.",
      "So simple, and yet it changes everything about how I will approach a fresh start.",
    ],
    'Morning': [
      "That completely changes how I want to structure my mornings.",
      "I am going to try that tomorrow and see what shifts.",
      "So the battle is not really about mornings at all.",
    ],
    'Sleep': [
      "That puts the whole conversation in a different light.",
      "I had not thought about it as a skill before, but now I cannot think about it any other way.",
      "I will look at tonight completely differently after this.",
    ],
    'Home': [
      "That reframes what home is even supposed to feel like.",
      "So the space itself is almost secondary to the attention we bring to it.",
      "I will notice that the next time I walk through my door.",
    ],
    'Habits': [
      "That is the clearest explanation of how habits actually form that I have heard.",
      "I want to think more carefully about what I am tying my habits to.",
      "Small really does add up, and I think I forget that constantly.",
    ],
    'Food': [
      "I will never think about a meal the same way again.",
      "That makes eating feel like a much more intentional act.",
      "So even a simple meal is carrying more meaning than I usually give it credit for.",
    ],
    'Work': [
      "I had never separated effort from output so cleanly before.",
      "That changes how I want to approach the next project I pick up.",
      "So the work itself is not really the problem. The story around it is.",
    ],
    'Relationships': [
      "So much of what I call connection is actually just shared presence.",
      "I want to bring more of that quality of attention to the people close to me.",
      "That is a much more active definition of care than I usually walk around with.",
    ],
    'Time': [
      "That shifts the whole way I want to think about my schedule.",
      "I have been treating time like something I run out of, not something I shape.",
      "So it is less about having more time and more about where the attention actually goes.",
    ],
    'Money': [
      "That makes financial decisions feel a lot more tied to identity than I expected.",
      "I want to look at my habits around money with that lens.",
      "So the numbers are almost the last part of the story, not the first.",
    ],
    'Travel': [
      "I want to move more slowly through the next place I visit.",
      "That makes even a familiar commute feel like it holds more than I have been taking from it.",
      "So curiosity is really what makes travel feel like travel at all.",
    ],
    'Learning': [
      "I think I have been confusing exposure with learning for a long time.",
      "That changes what I want to prioritize when I sit down to study.",
      "So the discomfort is not a sign that it is not working. It might actually be the opposite.",
    ],
    'Health': [
      "I want to think less about outcomes and more about what I am building day by day.",
      "That removes a lot of the pressure I have been carrying around this.",
      "So consistency is doing more work than intensity, and I have had that backwards.",
    ],
    'Creativity': [
      "That makes starting feel a lot less like a commitment and a lot more like an experiment.",
      "I have been waiting for the right conditions, and I think that is exactly what you are describing as the trap.",
      "So the creative block is not really about ideas. It is about permission.",
    ],
    'Language': [
      "That reframes the whole experience of making mistakes when you speak.",
      "I want to bring that kind of patience to my own learning.",
      "So fluency is not a destination. It is something that keeps being built.",
    ],
    'Values': [
      "I want to sit with that and see what it reveals about my own choices.",
      "That gives me a much more honest way to look at what I actually prioritize.",
      "So values are not really about what we say. They are about what we do when it costs something.",
    ],
    'Technology': [
      "I think I have been letting the tool shape the habit instead of the other way around.",
      "That gives me a much more intentional way to think about how I use this stuff.",
      "So the question is not whether to use it but what kind of relationship I want to have with it.",
    ],
    'Nature': [
      "I think I underestimate how much that kind of contact actually restores something.",
      "That makes me want to build more of it into the week, not just wait for it to happen.",
      "So attention is really the whole thing, and I have been moving too fast to pay it.",
    ],
    'Community': [
      "I want to be more deliberate about which connections I actually invest in.",
      "That makes belonging feel like something you build, not something you stumble into.",
      "So the cost of showing up is actually what makes it meaningful.",
    ],
    'Emotions': [
      "I think I have been managing emotions rather than actually understanding them.",
      "That distinction between feeling something and being overwhelmed by it is one I want to hold onto.",
      "So naming it really does change something. That is not just a figure of speech.",
    ],
    'default': [
      "I had not connected those two things before, and now I cannot separate them.",
      "That is something I want to return to and think about more carefully.",
      "I think I will notice this differently the next time it comes up.",
    ],
  }

  // Match theme
  let pool = closingsByTheme['default']
  for (const [key, lines] of Object.entries(closingsByTheme)) {
    if (theme.toLowerCase().includes(key.toLowerCase()) ||
        title.toLowerCase().includes(key.toLowerCase())) {
      pool = lines
      break
    }
  }

  return pool
}

// Track which closing line was used for each episode to avoid repeating
const usedClosingByEpisode = new Map()
const closingLineUsageCounts = new Map()

function replaceClosingLine(episode, line) {
  const epId = `W${episode.weekNumber}D${episode.dayOfWeek}`
  if (usedClosingByEpisode.has(epId)) {
    return // Already replaced the closing for this episode
  }

  const pool = generateClosingLine(episode, line)

  // Pick the least-used option from the pool
  let chosen = pool[0]
  let minUsage = Infinity
  for (const candidate of pool) {
    const usage = closingLineUsageCounts.get(candidate) || 0
    if (usage < minUsage) {
      minUsage = usage
      chosen = candidate
    }
  }

  closingLineUsageCounts.set(chosen, (closingLineUsageCounts.get(chosen) || 0) + 1)
  usedClosingByEpisode.set(epId, chosen)
  return chosen
}

// ── Fix 3: Expand short key phrase examples ────────────────────────────────
function expandShortExample(phrase, example) {
  const words = example.trim().split(/\s+/)
  if (words.length >= 8) return example // Already long enough

  // For very short examples, add context
  const expansions = {
    // Single-word key phrases get expanded context
    default: example, // Keep as-is if we cannot improve
  }

  return expansions.default
}

// ── File-level processing ──────────────────────────────────────────────────

function processWeekFile(filePath) {
  const content = loadFile(filePath)

  // Parse the episodes using regex-based JSON extraction
  // Since TypeScript files are not directly parseable, we work at text level
  // for the complex cases, but for simple JSON-like structures we can parse

  // Extract the array content - look for the exported array
  const arrayMatch = content.match(/export const WEEK_\d{2}: Episode\[\] = (\[[\s\S]*\])/)
  if (!arrayMatch) {
    console.error(`Could not extract array from ${path.basename(filePath)}`)
    return { content, changed: false }
  }

  let arrayStr = arrayMatch[1]
  let changed = false

  // Fix 2: Replace duplicate closing lines at text level
  // Find all occurrences of duplicate closing lines and replace them
  // We need context (surrounding episode data) to generate appropriate replacements

  // Load all episodes from file for context
  const vm = require('vm')
  const src = content
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const ctx = { module: { exports: null } }
  try {
    vm.runInNewContext(src, ctx, { filename: filePath })
  } catch (e) {
    console.error(`VM parse failed for ${path.basename(filePath)}: ${e.message}`)
    return { content, changed: false }
  }

  const episodes = ctx.module.exports || []

  // Fix 1: Deduplicate vocab
  const vocabFixed = deduplicateVocab(episodes)
  if (vocabFixed > 0) {
    changed = true
  }

  // Fix 2: Find and mark closing line replacements
  const replacements = []
  for (const episode of episodes) {
    const allLines = episode.parts.flatMap(p => p.lines)
    const lastFewLines = allLines.slice(-4) // Check last 4 lines for closing patterns

    for (const line of lastFewLines) {
      if (isDuplicateClosingLine(line.en) && line.speaker === 'b') {
        const newEn = replaceClosingLine(episode, line)
        if (newEn && newEn !== line.en) {
          replacements.push({ original: line, newEn })
          line.en = newEn
          changed = true
        }
      }
    }
  }

  if (!changed) {
    return { content, changed: false }
  }

  // Reconstruct the file with fixed episodes
  // We need to serialize back to TypeScript
  const newArrayStr = JSON.stringify(episodes, null, 2)

  // Replace the array in the original content
  const headerLine = content.match(/^export const (WEEK_\d{2}): Episode\[\] = /m)
  const varName = headerLine ? headerLine[1] : 'WEEK_XX'

  const importLine = content.split('\n')[0] // "import { Episode } from '../types'"

  const newContent = `${importLine}\n\nexport const ${varName}: Episode[] = ${newArrayStr}\n`

  return { content: newContent, changed: true, vocabFixed, replacements: replacements.length }
}

function main() {
  const weekFiles = fs.readdirSync(EPISODES_DIR)
    .filter(name => /^week-\d{2}\.ts$/.test(name))
    .sort()

  let totalVocabFixed = 0
  let totalClosingFixed = 0
  let totalFilesChanged = 0

  for (const fileName of weekFiles) {
    const filePath = path.join(EPISODES_DIR, fileName)
    const result = processWeekFile(filePath)

    if (result.changed) {
      fs.writeFileSync(filePath, result.content, 'utf8')
      totalFilesChanged++
      totalVocabFixed += result.vocabFixed || 0
      totalClosingFixed += result.replacements || 0
      console.log(`✓ Fixed ${fileName}: ${result.vocabFixed || 0} vocab dups, ${result.replacements || 0} closing lines replaced`)
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Files changed:       ${totalFilesChanged}`)
  console.log(`Vocab dups removed:  ${totalVocabFixed}`)
  console.log(`Closing lines fixed: ${totalClosingFixed}`)
}

main()

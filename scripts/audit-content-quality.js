/**
 * Deep Content Quality Audit for SAV Episodes
 * Checks: repetitive dialogue, templated content, vocab quality,
 * key phrase example quality, dialogue naturalness, cross-episode duplicates
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  try {
    vm.runInNewContext(script, context, { filename: filePath })
  } catch (e) {
    console.error(`Failed to load ${filePath}: ${e.message}`)
    return []
  }
  return context.module.exports || []
}

// ── Pattern lists ──────────────────────────────────────────────────────────

// Filler / template dialogue that adds no value
const GENERIC_DIALOGUE_PATTERNS = [
  /^That(?:'s| is) (?:a )?(?:really |very |so |quite )?(?:good|great|interesting|important|helpful|true|right|exactly|nice|wonderful|amazing|fantastic) (?:point|question|idea|observation|thought)\.?$/i,
  /^(?:I|That) (?:see|get it|understand)\.?$/i,
  /^(?:Absolutely|Definitely|Certainly|Of course|Sure|Right|Indeed|Exactly|Precisely)\.?$/i,
  /^(?:That )?(?:makes|make) (?:a lot of )?sense\.?$/i,
  /^(?:You are|You're) (?:absolutely |completely |totally )?right\.?$/i,
  /^(?:I )?(?:could not|couldn't|can't) (?:agree|have said) (?:more|it better)\.?$/i,
  /^(?:Very )?(?:interesting|fascinating)\.?$/i,
  /^(?:That is|That's) (?:very |really |so )?(?:helpful|useful|good to know|helpful to know)\.?$/i,
  /^(?:I )?(?:never|hadn't) thought (?:of|about) (?:it|that) (?:that |in that )?way\.?$/i,
  /^(?:Wow|Oh|Hmm|Hm|Ah),? (?:that is|that's|I see)\.?/i,
]

// Vocab definition templates that are too vague or circular
const BAD_VOCAB_PATTERNS = [
  /^.{1,5}；.{1,5}$/,             // Too short definitions like "壓力；負擔" (fine) vs circular
  /related expression/i,
  /相關表達/,
  /^\(.*\)$/,                      // Just a parenthetical
]

// Key phrase example sentences that are too short or circular
const BAD_EXAMPLE_PATTERNS = [
  /^She uses .{3,20} to describe/i,
  /^This phrase means/i,
  /^.{1,40}\.$/,                   // Suspiciously short examples (under 40 chars)
  /^(He|She|They|It) (is|was|are|were) .{5,20}\.$/, // Overly simple pattern
]

// Dialogue lines that are just filler transitions
const TRANSITION_ONLY_PATTERNS = [
  /^(?:So,?|And,?|But,?|Well,?|Now,?) (?:what|how|why|when|where|do you)/i,
  /^(?:That is|That's) (?:an? )?(?:good|great|interesting|important) (?:point|question)\.?$/i,
  /^(?:Right|Okay|Ok|Alright),? so/i,
]

// Check if a line is just a yes/no or acknowledgement with no substance
const SUBSTANCE_FREE_PATTERNS = [
  /^(?:Yes|No|Yeah|Nope|Yep|Sure|Right|Exactly|Indeed|True|Correct)\.?$/i,
  /^(?:I see|Got it|I understand|Makes sense|Fair enough)\.?$/i,
]

// Cross-episode: collect all English lines to find duplicates
const allEnglishLines = new Map() // line -> [episodeId, ...]

function checkEpisode(episode, issues) {
  const id = `W${String(episode.weekNumber).padStart(2, '0')}D${episode.dayOfWeek}`

  // ── 1. Dialogue quality ─────────────────────────────────────────────────
  const allLines = episode.parts.flatMap(p => p.lines)

  // 1a. Generic/templated lines
  let genericCount = 0
  let substanceFreeCount = 0

  for (const line of allLines) {
    const en = (line.en || '').trim()
    if (!en) continue

    for (const pat of GENERIC_DIALOGUE_PATTERNS) {
      if (pat.test(en)) {
        genericCount++
        if (genericCount <= 3) { // Only report first 3 per episode to avoid noise
          issues.push(`${id} GENERIC_LINE [${line.speaker.toUpperCase()}]: "${en}"`)
        }
        break
      }
    }

    for (const pat of SUBSTANCE_FREE_PATTERNS) {
      if (pat.test(en)) {
        substanceFreeCount++
        if (substanceFreeCount <= 2) {
          issues.push(`${id} SUBSTANCE_FREE [${line.speaker.toUpperCase()}]: "${en}"`)
        }
        break
      }
    }

    // 1b. English lines that are too short to be meaningful (< 5 words)
    const wordCount = en.split(/\s+/).filter(Boolean).length
    if (wordCount < 4) {
      issues.push(`${id} TOO_SHORT_LINE [${line.speaker.toUpperCase()}]: "${en}" (${wordCount} words)`)
    }

    // 1c. Lines ending awkwardly (missing punctuation for long lines)
    if (wordCount > 8 && !/[.?!]$/.test(en)) {
      issues.push(`${id} MISSING_PUNCT [${line.speaker.toUpperCase()}]: "${en}"`)
    }

    // 1d. Cross-episode duplicate detection
    const normalized = en.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    if (normalized.length > 30) { // Only check meaningful-length lines
      if (!allEnglishLines.has(normalized)) {
        allEnglishLines.set(normalized, [])
      }
      allEnglishLines.get(normalized).push(id)
    }
  }

  // 1e. Flag if too many generic lines
  if (genericCount > 5) {
    issues.push(`${id} EXCESSIVE_GENERIC: ${genericCount} generic/templated dialogue lines`)
  }

  // ── 2. Intra-episode repetition ─────────────────────────────────────────
  const enLines = allLines.map(l => (l.en || '').trim().toLowerCase())

  // Check for repeated phrases (4+ word phrases appearing 3+ times)
  const phraseCount = new Map()
  for (const line of enLines) {
    const words = line.split(/\s+/)
    for (let i = 0; i <= words.length - 4; i++) {
      const phrase = words.slice(i, i + 4).join(' ')
      if (phrase.length > 15) { // Skip very short phrases
        phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1)
      }
    }
  }
  for (const [phrase, count] of phraseCount) {
    if (count >= 4) {
      issues.push(`${id} REPEATED_PHRASE: "${phrase}" appears ${count} times in episode`)
    }
  }

  // ── 3. Vocab quality ────────────────────────────────────────────────────
  const vocabItems = allLines.flatMap(l => l.vocab || [])

  // 3a. Vocab words that don't appear in the dialogue
  for (const v of vocabItems) {
    const word = (v.word || '').toLowerCase()
    const def = (v.def || v.definition || '').trim()

    if (!word) {
      issues.push(`${id} EMPTY_VOCAB_WORD`)
      continue
    }

    // Check if word actually appears in some dialogue line
    const appearsInDialogue = allLines.some(l =>
      (l.en || '').toLowerCase().includes(word)
    )
    if (!appearsInDialogue) {
      issues.push(`${id} VOCAB_NOT_IN_DIALOGUE: "${word}"`)
    }

    // Definition too short (< 3 Chinese chars)
    const chineseChars = (def.match(/[\u3400-\u9fff]/g) || []).length
    if (chineseChars < 2) {
      issues.push(`${id} VOCAB_DEF_TOO_SHORT: "${word}" → "${def}"`)
    }
  }

  // 3b. Duplicate vocab words within same episode
  const vocabWords = vocabItems.map(v => (v.word || '').toLowerCase())
  const vocabWordSet = new Set()
  for (const w of vocabWords) {
    if (w && vocabWordSet.has(w)) {
      issues.push(`${id} DUPLICATE_VOCAB: "${w}" defined twice`)
    }
    vocabWordSet.add(w)
  }

  // ── 4. Key phrase quality ────────────────────────────────────────────────
  for (const kp of episode.keyPhrases || []) {
    const phrase = (kp.en || '').trim()
    const example = (kp.example || '').trim()

    if (!example) {
      issues.push(`${id} MISSING_EXAMPLE: "${phrase}"`)
      continue
    }

    const exampleWords = example.split(/\s+/).filter(Boolean).length

    // Example too short
    if (exampleWords < 8) {
      issues.push(`${id} SHORT_EXAMPLE: "${phrase}" → "${example}" (${exampleWords} words)`)
    }

    // Example uses the phrase itself verbatim (circular)
    if (phrase.length > 4 && example.toLowerCase().includes(phrase.toLowerCase())) {
      // This is actually expected - the example should use the phrase
      // Only flag if the example is circular/meta (talks about the phrase itself)
      if (/this phrase|this expression|this means|is used to/i.test(example)) {
        issues.push(`${id} CIRCULAR_EXAMPLE: "${phrase}" → "${example}"`)
      }
    }

    // Example doesn't contain any real-world context (just says "X is Y")
    const tooSimple = /^[A-Z][a-z]+ (is|was|are|were|means) .{5,30}\.$/.test(example)
    if (tooSimple && exampleWords < 12) {
      issues.push(`${id} TRIVIAL_EXAMPLE: "${phrase}" → "${example}"`)
    }

    // Bad example patterns
    for (const pat of BAD_EXAMPLE_PATTERNS) {
      if (pat.test(example) && exampleWords < 10) {
        issues.push(`${id} TEMPLATE_EXAMPLE: "${phrase}" → "${example}"`)
        break
      }
    }
  }

  // ── 5. Part structure quality ────────────────────────────────────────────
  for (let pi = 0; pi < episode.parts.length; pi++) {
    const part = episode.parts[pi]
    const pLabel = `${id} Part${pi + 1}`

    // Part title should be descriptive, not just "Part N"
    if (/^Part \d+$/.test(part.title)) {
      issues.push(`${pLabel} GENERIC_PART_TITLE: "${part.title}"`)
    }

    // Each part should have at least 5 lines
    if (part.lines.length < 5) {
      issues.push(`${pLabel} TOO_FEW_LINES: ${part.lines.length} lines`)
    }

    // Check that A and B alternate reasonably (not 3+ consecutive same speaker)
    let consecutiveCount = 1
    for (let i = 1; i < part.lines.length; i++) {
      if (part.lines[i].speaker === part.lines[i - 1].speaker) {
        consecutiveCount++
        if (consecutiveCount >= 3) {
          issues.push(`${pLabel} CONSECUTIVE_SAME_SPEAKER: ${consecutiveCount} lines from speaker ${part.lines[i].speaker.toUpperCase()} in a row at line ${i + 1}`)
        }
      } else {
        consecutiveCount = 1
      }
    }

    // Check A/B ratio - should be roughly balanced (neither should be > 70%)
    const aCount = part.lines.filter(l => l.speaker === 'a').length
    const bCount = part.lines.filter(l => l.speaker === 'b').length
    if (part.lines.length >= 6) {
      const aRatio = aCount / part.lines.length
      if (aRatio > 0.75) {
        issues.push(`${pLabel} SPEAKER_IMBALANCE: A speaks ${Math.round(aRatio * 100)}% of lines`)
      }
      if (aRatio < 0.25) {
        issues.push(`${pLabel} SPEAKER_IMBALANCE: A speaks only ${Math.round(aRatio * 100)}% of lines`)
      }
    }
  }

  // ── 6. Theme/content relevance check ────────────────────────────────────
  // Title should have some relationship to theme (hard to automate, skip)

  // ── 7. Chinese translation completeness ─────────────────────────────────
  let missingZh = 0
  for (const line of allLines) {
    if (line.en && !line.zh) {
      missingZh++
      issues.push(`${id} MISSING_ZH: "${line.en.substring(0, 50)}..."`)
    }
  }
}

function main() {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const weekFiles = fs.readdirSync(episodesDir)
    .filter(name => /^week-\d{2}\.ts$/.test(name))
    .sort()

  const allEpisodes = weekFiles.flatMap(fileName =>
    loadWeekFile(path.join(episodesDir, fileName))
  )

  const issues = []

  console.log(`\n=== SAV Episode Content Quality Audit ===`)
  console.log(`Checking ${allEpisodes.length} episodes...\n`)

  for (const episode of allEpisodes) {
    checkEpisode(episode, issues)
  }

  // ── Cross-episode duplicate detection ───────────────────────────────────
  console.log('Checking cross-episode duplicate lines...')
  const crossDupes = []
  for (const [line, ids] of allEnglishLines) {
    if (ids.length >= 3) {
      crossDupes.push({ line, ids })
    }
  }
  crossDupes.sort((a, b) => b.ids.length - a.ids.length)

  if (crossDupes.length > 0) {
    issues.push(`\n=== CROSS-EPISODE DUPLICATES (lines appearing in 3+ episodes) ===`)
    for (const { line, ids } of crossDupes.slice(0, 30)) {
      issues.push(`XDUP [${ids.length}x] "${line.substring(0, 60)}" → ${ids.slice(0, 5).join(', ')}${ids.length > 5 ? '...' : ''}`)
    }
    if (crossDupes.length > 30) {
      issues.push(`... and ${crossDupes.length - 30} more cross-episode duplicates`)
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const categoryCounts = {}
  for (const issue of issues) {
    const match = issue.match(/(?:W\d+D\d+ )?([A-Z_]+):/)
    if (match) {
      categoryCounts[match[1]] = (categoryCounts[match[1]] || 0) + 1
    }
  }

  console.log('\n=== ISSUE SUMMARY BY CATEGORY ===')
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  for (const [cat, count] of sortedCategories) {
    console.log(`  ${cat.padEnd(30)} ${count}`)
  }

  console.log(`\n=== TOTAL ISSUES: ${issues.filter(i => !i.startsWith('=')).length} ===\n`)

  // Print all issues
  if (issues.length > 0) {
    console.log('=== DETAILED ISSUES ===\n')
    for (const issue of issues) {
      console.log(issue)
    }
  }
}

main()

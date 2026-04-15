/**
 * Comprehensive Content Quality Audit
 * Checks: Flashcards, Conversation Questions, Articles (SpeakArticles)
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = process.cwd()

// ── Template patterns that indicate low-quality generated content ──────────

// Flashcard example sentence templates
const FC_TEMPLATE_PATTERNS = [
  /^He used .{3,40} to explain what changed, why it mattered, and what he decided to do next\.$/i,
  /^Talking about .{3,40} helped her move from a vague feeling to a more specific explanation\.$/i,
  /^.{3,40} became easier to talk about once she connected it to one real moment from her week\.$/i,
  /^.{3,40} became easier to talk about once he connected it to one real moment from his week\.$/i,
  /^He used .{3,40} in a short story from his real life\./i,
  /^Talking about .{3,40} helped him/i,
  /^.{3,40} became easier to talk about once/i,
]

// Conversation question structure tip templates
const CQ_TIP_TEMPLATES = [
  'Try: Right now, this shows up when... / It helps me by... / The hard part is...',
  'Try: One time, I had to... / That was a moment of... / Since then,...',
  'Try: This matters because... / You can see it when... / A simple example is...',
  'Try: I usually handle this by... / What helped me was... / The tricky part is...',
  'Try: I am usually okay with... / But I draw the line when... / That matters to me because...',
  'Try: A recent time this came up was... / It became important because... / So I decided to...',
  'Try: Something I noticed recently is... / It connects to this topic because... / What I learned from it is...',
]

// Article text template patterns
const ARTICLE_TEMPLATE_PATTERNS = [
  /This article uses ".+?" to explore a part of daily life/i,
  /Once you talk about .{5,40} and .{5,40}, the subject becomes clearer/i,
  /Many learners can explain the idea in theory, but daily life tests it through/i,
  /For speaking practice, phrases like .{5,40} are useful because they move the conversation from opinion to description/i,
  /gives learners a place to practice something harder than grammar/i,
  /is not the endpoint — it is the entry point to a richer/i,
  /the real progress is not in memorizing the phrase but in finding the moment/i,
  /What makes .{5,50} work as a speaking topic is the gap between knowing/i,
  /rewards honest detail over clever phrasing/i,
  /True to form, .{5,40} rewards/i,
]

// ── Loaders ───────────────────────────────────────────────────────────────

function loadTs(filePath) {
  let source = fs.readFileSync(filePath, 'utf8')
  // Remove import statements
  source = source.replace(/^import[^\n]*\n/gm, '')
  // Replace export declarations
  source = source.replace(/export (const|interface|type) /g, 'const ')
  // Wrap in module exports for the main array
  const match = source.match(/const (FLASHCARDS_\w+|CONVERSATIONS_\w+|W\d+_ARTICLES):\s*\w+\[\]/m)
  if (match) {
    source = source.replace(
      new RegExp(`const ${match[1]}:\\s*\\w+\\[\\]`),
      `module.exports`
    )
  }
  const ctx = { module: { exports: [] } }
  try {
    vm.runInNewContext(source, ctx, { filename: filePath })
  } catch (e) {
    // Try simpler extraction
    return []
  }
  return Array.isArray(ctx.module.exports) ? ctx.module.exports : []
}

// ── Checks ────────────────────────────────────────────────────────────────

const issues = []
const stats = {
  flashcards: { total: 0, templateEx: 0, missingChinese: 0, duplicateEx: 0, shortEx: 0 },
  questions:  { total: 0, templateTip: 0, duplicateTip: 0, missingHint: 0, shortQ: 0 },
  articles:   { total: 0, templateText: 0, shortText: 0, templateVocabEx: 0 },
}

// ── 1. Flashcards ─────────────────────────────────────────────────────────
function checkFlashcards() {
  const dir = path.join(ROOT, 'content', 'flashcards')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort()
  const allExamples = new Map() // normalized example → [ids]

  for (const file of files) {
    const cards = loadTs(path.join(dir, file))
    if (!Array.isArray(cards)) continue

    for (const card of cards) {
      stats.flashcards.total++
      const id = card.id || `w${card.weekNumber}-${card.source}`
      const ex = (card.exampleSentence || '').trim()

      // Check for template example sentences
      let isTemplate = false
      for (const pat of FC_TEMPLATE_PATTERNS) {
        if (pat.test(ex)) {
          isTemplate = true
          stats.flashcards.templateEx++
          issues.push(`FC_TEMPLATE [${id}]: "${ex.substring(0, 70)}"`)
          break
        }
      }

      // Check for missing Chinese
      if (!card.chinese || card.chinese.trim().length < 2) {
        stats.flashcards.missingChinese++
        issues.push(`FC_NO_CHINESE [${id}]: "${card.english}"`)
      }

      // Check example too short (< 6 words)
      const wordCount = ex.split(/\s+/).filter(Boolean).length
      if (!isTemplate && wordCount < 6) {
        stats.flashcards.shortEx++
        issues.push(`FC_SHORT_EX [${id}]: "${ex}" (${wordCount} words)`)
      }

      // Track for cross-card duplicates (same example in listen + speak)
      const norm = ex.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      if (norm.length > 20) {
        if (!allExamples.has(norm)) allExamples.set(norm, [])
        allExamples.get(norm).push(id)
      }
    }
  }

  // Cross-card duplicate examples
  for (const [ex, ids] of allExamples) {
    if (ids.length >= 3) {
      stats.flashcards.duplicateEx++
      issues.push(`FC_DUPE_EX [${ids.length}x]: "${ex.substring(0, 60)}" → ${ids.slice(0,4).join(', ')}${ids.length>4?'...':''}`)
    }
  }
}

// ── 2. Conversation Questions ─────────────────────────────────────────────
function checkConversations() {
  const dir = path.join(ROOT, 'content', 'questions')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort()
  const tipCounts = new Map()
  const questionTexts = new Map()

  for (const file of files) {
    const qs = loadTs(path.join(dir, file))
    if (!Array.isArray(qs)) continue

    for (const q of qs) {
      stats.questions.total++
      const id = `W${String(q.weekNumber).padStart(2,'0')}-${q.day}`
      const tip = (q.structureTip || '').trim()
      const question = (q.question || '').trim()
      const hint = (q.chineseHint || '').trim()

      // Check for template structure tips
      if (CQ_TIP_TEMPLATES.includes(tip)) {
        stats.questions.templateTip++
        issues.push(`CQ_TEMPLATE_TIP [${id}]: "${tip.substring(0,60)}"`)
      }

      // Track tip frequency
      tipCounts.set(tip, (tipCounts.get(tip) || 0) + 1)

      // Check for missing Chinese hint
      const chineseChars = (hint.match(/[\u4e00-\u9fff]/g) || []).length
      if (chineseChars < 5) {
        stats.questions.missingHint++
        issues.push(`CQ_NO_HINT [${id}]: "${question.substring(0,50)}"`)
      }

      // Check question too short or generic
      const qWords = question.split(/\s+/).filter(Boolean).length
      if (qWords < 8) {
        stats.questions.shortQ++
        issues.push(`CQ_SHORT_Q [${id}]: "${question}" (${qWords} words)`)
      }

      // Track duplicate questions
      const normQ = question.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
      if (!questionTexts.has(normQ)) questionTexts.set(normQ, [])
      questionTexts.get(normQ).push(id)
    }
  }

  // Report highly repeated tips
  for (const [tip, count] of [...tipCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 10)) {
    if (count >= 5) {
      stats.questions.duplicateTip++
      issues.push(`CQ_REPEATED_TIP [${count}x]: "${tip.substring(0,70)}"`)
    }
  }

  // Report duplicate questions
  for (const [q, ids] of questionTexts) {
    if (ids.length >= 2) {
      issues.push(`CQ_DUPE_Q [${ids.length}x]: "${q.substring(0,60)}" → ${ids.join(', ')}`)
    }
  }
}

// ── 3. Articles ────────────────────────────────────────────────────────────
function checkArticles() {
  const dir = path.join(ROOT, 'content', 'articles')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort()
  const articleTexts = new Map()

  for (const file of files) {
    const articles = loadTs(path.join(dir, file))
    if (!Array.isArray(articles)) continue

    for (const art of articles) {
      stats.articles.total++
      const id = art.dateKey || art.title || '?'
      const text = (art.text || '').replace(/<[^>]+>/g, '').trim()
      const textZh = (art.textZh || '').replace(/<[^>]+>/g, '').trim()

      // Check for template article text
      let isTemplate = false
      for (const pat of ARTICLE_TEMPLATE_PATTERNS) {
        if (pat.test(text)) {
          isTemplate = true
          stats.articles.templateText++
          // Find which pattern
          const snippet = text.match(pat)?.[0] || text.substring(0, 80)
          issues.push(`ART_TEMPLATE [${id}]: "${snippet.substring(0, 80)}"`)
          break
        }
      }

      // Check article text length
      const wordCount = text.split(/\s+/).filter(Boolean).length
      if (wordCount < 100) {
        stats.articles.shortText++
        issues.push(`ART_SHORT [${id}]: only ${wordCount} words`)
      }

      // Check vocab examples for templates
      for (const v of art.vocabulary || []) {
        const ex = (v.example || '').trim()
        for (const pat of FC_TEMPLATE_PATTERNS) {
          if (pat.test(ex)) {
            stats.articles.templateVocabEx++
            issues.push(`ART_VOCAB_TEMPLATE [${id}] "${v.word}": "${ex.substring(0,70)}"`)
            break
          }
        }
      }

      // Check for paragraph-level repetition within article
      const paras = (art.text || '').match(/<p>.*?<\/p>/gs) || []
      if (paras.length >= 4) {
        const paraTexts = paras.map(p => p.replace(/<[^>]+>/g,'').trim().toLowerCase())
        for (let i = 0; i < paraTexts.length; i++) {
          for (let j = i+1; j < paraTexts.length; j++) {
            const overlap = longestCommonSubstring(paraTexts[i], paraTexts[j])
            if (overlap.length > 80 && overlap.length > paraTexts[i].length * 0.5) {
              issues.push(`ART_PARA_DUP [${id}]: Para ${i+1} and Para ${j+1} share "${overlap.substring(0,60)}..."`)
            }
          }
        }
      }

      // Track for cross-article text duplication
      const normText = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().substring(0, 200)
      if (!articleTexts.has(normText)) articleTexts.set(normText, [])
      articleTexts.get(normText).push(id)
    }
  }

  // Cross-article duplicates
  for (const [t, ids] of articleTexts) {
    if (ids.length >= 2) {
      issues.push(`ART_DUPE [${ids.length}x]: "${t.substring(0,60)}" → ${ids.join(', ')}`)
    }
  }
}

function longestCommonSubstring(a, b) {
  if (a.length > 500) a = a.substring(0, 500)
  if (b.length > 500) b = b.substring(0, 500)
  let longest = ''
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0
      while (i+k < a.length && j+k < b.length && a[i+k] === b[j+k]) k++
      if (k > longest.length) longest = a.substring(i, i+k)
    }
  }
  return longest
}

// ── Main ──────────────────────────────────────────────────────────────────
console.log('\n=== SAV Full Content Quality Audit ===\n')

checkFlashcards()
checkConversations()
checkArticles()

console.log('=== SUMMARY ===')
console.log('\nFlashcards:')
console.log(`  Total cards:        ${stats.flashcards.total}`)
console.log(`  Template examples:  ${stats.flashcards.templateEx}`)
console.log(`  Duplicate examples: ${stats.flashcards.duplicateEx} (3+ occurrences)`)
console.log(`  Short examples:     ${stats.flashcards.shortEx}`)
console.log(`  Missing Chinese:    ${stats.flashcards.missingChinese}`)
console.log('\nConversation Questions:')
console.log(`  Total questions:    ${stats.questions.total}`)
console.log(`  Template tips:      ${stats.questions.templateTip}`)
console.log(`  Repeated tips:      ${stats.questions.duplicateTip} (5+ occurrences)`)
console.log(`  Missing hints:      ${stats.questions.missingHint}`)
console.log(`  Short questions:    ${stats.questions.shortQ}`)
console.log('\nArticles:')
console.log(`  Total articles:     ${stats.articles.total}`)
console.log(`  Template text:      ${stats.articles.templateText}`)
console.log(`  Template vocab ex:  ${stats.articles.templateVocabEx}`)
console.log(`  Short articles:     ${stats.articles.shortText}`)

const totalIssues = issues.filter(i => !i.startsWith('===')).length
console.log(`\n=== TOTAL ISSUES: ${totalIssues} ===\n`)

// Group by prefix
const grouped = {}
for (const issue of issues) {
  const m = issue.match(/^([A-Z_]+)/)
  if (m) grouped[m[1]] = (grouped[m[1]] || 0) + 1
}
console.log('By category:')
for (const [k, v] of Object.entries(grouped).sort((a,b)=>b[1]-a[1])) {
  console.log(`  ${k.padEnd(30)} ${v}`)
}

// Save full output
const outPath = path.join(ROOT, 'scripts', 'audit-all-content-output.txt')
fs.writeFileSync(outPath, issues.join('\n'))
console.log(`\nFull issue list saved to: ${outPath}`)

/**
 * SAV Deep Content Audit
 * Covers areas NOT checked by audit-all-content.js:
 * 1. Episodes: count, fields, duplicate titles, template dialogue, missing ZH
 * 2. Articles: missing textZh, vocab quality, title uniqueness, word count distribution
 * 3. Flashcards: word used in example, Chinese length, duplicate vocab words
 * 4. Questions: duplicate questions, Chinese hint length, count per week
 * 5. Cross-content: coverage per week, consistency
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.cwd();
const issues = [];
const stats = {};

function log(tag, msg) {
  issues.push(`${tag}: ${msg}`);
}

// ── Loaders ───────────────────────────────────────────────────────────────

function loadEpisodeFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^import[^\n]*\n/gm, '');
  src = src.replace(/export const WEEK_\d+: Episode\[\] = /, 'module.exports = ');
  const ctx = { module: { exports: [] } };
  try { vm.runInNewContext(src, ctx, { filename: filePath, timeout: 5000 }); } catch(e) {}
  return Array.isArray(ctx.module.exports) ? ctx.module.exports : [];
}

function loadTs(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^import[^\n]*\n/gm, '');
  src = src.replace(/export (const|interface|type) /g, 'const ');
  const match = src.match(/const (FLASHCARDS_\w+|CONVERSATIONS_\w+|W\d+_ARTICLES):\s*\w+\[\]/m);
  if (match) src = src.replace(new RegExp(`const ${match[1]}:\\s*\\w+\\[\\]`), 'module.exports');
  const ctx = { module: { exports: [] } };
  try { vm.runInNewContext(src, ctx, { filename: filePath, timeout: 5000 }); } catch(e) {}
  return Array.isArray(ctx.module.exports) ? ctx.module.exports : [];
}

// ── 1. EPISODES ────────────────────────────────────────────────────────────
console.log('Checking episodes...');
{
  const dir = path.join(ROOT, 'content', 'episodes');
  const weekFiles = fs.readdirSync(dir).filter(f => f.match(/^week-\d+\.ts$/)).sort();

  let allEpisodes = [];
  for (const f of weekFiles) {
    const eps = loadEpisodeFile(path.join(dir, f));
    allEpisodes = allEpisodes.concat(eps);
  }

  stats.episodes = {
    totalFiles: weekFiles.length,
    totalEpisodes: allEpisodes.length,
    expected: 371, // 53 weeks × 7 days
    missingFields: 0,
    missingZh: 0,
    duplicateTitles: 0,
    shortDialogue: 0,
    templateLines: 0,
    missingKeyPhrases: 0,
  };

  // Check episode count
  if (allEpisodes.length < 370) {
    log('EP_COUNT', `Only ${allEpisodes.length} episodes found (expected ~371)`);
  }

  // Common template dialogue patterns (too generic)
  const TEMPLATE_LINE_PATTERNS = [
    /^(Yes|No|Sure|Okay|Right|Exactly|Interesting|Really|Great|Good|Well|Fine|I see|I know|I think|I agree|I understand|Me too|That's right|That's true|Of course)\.?$/i,
    /^(Mm|Hmm|Hm|Yeah|Yep|Nope|Uh|Um)\.?$/i,
  ];

  const titleSet = new Map();
  const weekDaySet = new Set();

  for (const ep of allEpisodes) {
    const epId = `W${ep.weekNumber}-D${ep.dayOfWeek}`;

    // Check required fields
    const requiredFields = ['weekNumber', 'dayOfWeek', 'date', 'theme', 'title', 'parts'];
    for (const f of requiredFields) {
      if (ep[f] === undefined || ep[f] === null || ep[f] === '') {
        stats.episodes.missingFields++;
        log('EP_MISSING_FIELD', `${epId} missing "${f}"`);
      }
    }

    // Check for duplicate week+day combinations
    if (weekDaySet.has(epId)) {
      log('EP_DUPLICATE', `Duplicate episode ${epId}`);
    } else {
      weekDaySet.add(epId);
    }

    // Check duplicate titles
    const title = (ep.title || '').trim().toLowerCase();
    if (title.length > 3) {
      if (titleSet.has(title)) {
        stats.episodes.duplicateTitles++;
        log('EP_DUPE_TITLE', `"${ep.title}" appears in multiple episodes (${epId})`);
      } else {
        titleSet.set(title, epId);
      }
    }

    // Check keyPhrases
    if (!ep.keyPhrases || ep.keyPhrases.length === 0) {
      stats.episodes.missingKeyPhrases++;
      log('EP_NO_KEYPHRASES', `${epId} "${ep.title}" has no keyPhrases`);
    }

    // Check parts/lines
    const parts = ep.parts || [];
    if (parts.length < 3) {
      stats.episodes.shortDialogue++;
      log('EP_SHORT_DIALOGUE', `${epId} only ${parts.length} parts`);
    }

    let totalLines = 0;
    let missingZhLines = 0;
    let templateLineCount = 0;

    for (const part of parts) {
      for (const line of (part.lines || [])) {
        totalLines++;
        // Check Chinese translation
        if (!line.zh || line.zh.trim().length < 2) {
          missingZhLines++;
        }
        // Check for template one-word responses
        const en = (line.en || '').trim();
        for (const pat of TEMPLATE_LINE_PATTERNS) {
          if (pat.test(en)) {
            templateLineCount++;
            break;
          }
        }
      }
    }

    if (missingZhLines > 0) {
      stats.episodes.missingZh++;
      log('EP_MISSING_ZH', `${epId} has ${missingZhLines}/${totalLines} lines missing Chinese`);
    }
    if (templateLineCount > 3) {
      stats.episodes.templateLines++;
      log('EP_TEMPLATE_LINES', `${epId} has ${templateLineCount} single-word/template lines`);
    }
  }
}

// ── 2. ARTICLES (deep) ─────────────────────────────────────────────────────
console.log('Checking articles (deep)...');
{
  const dir = path.join(ROOT, 'content', 'articles');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort();

  const titleSet = new Map();
  const weeksCovered = new Set();
  const wordCounts = [];

  stats.articles = {
    total: 0,
    missingZh: 0,
    missingVocab: 0,
    vocabMissingExample: 0,
    vocabWordNotInExample: 0,
    duplicateTitles: 0,
    shortZh: 0,
    wordCountBelow400: 0,
  };

  for (const file of files) {
    const articles = loadTs(path.join(dir, file));
    for (const art of articles) {
      stats.articles.total++;
      const id = art.dateKey || art.title || '?';
      const weekMatch = file.match(/articles-w(\d+)/);
      if (weekMatch) weeksCovered.add(parseInt(weekMatch[1]));

      // Check textZh
      const textZh = (art.textZh || '').replace(/<[^>]+>/g, '').trim();
      if (!textZh || textZh.length < 50) {
        stats.articles.missingZh++;
        log('ART_MISSING_ZH', `${id}: textZh is ${textZh.length} chars (too short or missing)`);
      } else {
        // Check it's actually Chinese
        const chineseChars = (textZh.match(/[\u4e00-\u9fff]/g) || []).length;
        const ratio = chineseChars / textZh.length;
        if (ratio < 0.15) {
          stats.articles.shortZh++;
          log('ART_ZH_NOT_CHINESE', `${id}: textZh has only ${Math.round(ratio*100)}% Chinese chars`);
        }
      }

      // Check wordCount field accuracy
      const actualText = (art.text || '').replace(/<[^>]+>/g, '').trim();
      const actualWords = actualText.split(/\s+/).filter(Boolean).length;
      wordCounts.push({ id, count: actualWords });
      if (actualWords < 400) {
        stats.articles.wordCountBelow400++;
        log('ART_LOW_WORDCOUNT', `${id}: ${actualWords} words (spec ~500-600)`);
      }
      // Check declared wordCount vs actual
      if (art.wordCount && Math.abs(art.wordCount - actualWords) > 50) {
        log('ART_WORDCOUNT_MISMATCH', `${id}: declared ${art.wordCount} but actual ${actualWords} words`);
      }

      // Check vocabulary
      const vocab = art.vocabulary || [];
      if (vocab.length === 0) {
        stats.articles.missingVocab++;
        log('ART_NO_VOCAB', `${id}: no vocabulary items`);
      } else {
        for (const v of vocab) {
          const ex = (v.example || '').trim();
          if (!ex || ex.length < 10) {
            stats.articles.vocabMissingExample++;
            log('ART_VOCAB_NO_EXAMPLE', `${id} word "${v.word}": example missing or too short`);
          } else {
            // Check if the word (or root) appears in the example
            const word = (v.word || '').toLowerCase().replace(/[^a-z -]/g, '');
            const exLower = ex.toLowerCase();
            // Check if any significant part of the word phrase appears in example
            const wordParts = word.split(/\s+/).filter(w => w.length > 3);
            const found = wordParts.length === 0 || wordParts.some(wp => exLower.includes(wp));
            if (!found) {
              stats.articles.vocabWordNotInExample++;
              log('ART_VOCAB_WORD_ABSENT', `${id} word "${v.word}": not found in example "${ex.substring(0,60)}"`);
            }
          }
        }
      }

      // Check title uniqueness
      const titleKey = (art.title || '').toLowerCase().trim();
      if (titleKey.length > 3) {
        if (titleSet.has(titleKey)) {
          stats.articles.duplicateTitles++;
          log('ART_DUPE_TITLE', `"${art.title}" appears in both ${titleSet.get(titleKey)} and ${id}`);
        } else {
          titleSet.set(titleKey, id);
        }
      }
    }
  }

  // Word count distribution
  wordCounts.sort((a, b) => a.count - b.count);
  const avg = Math.round(wordCounts.reduce((s, x) => s + x.count, 0) / wordCounts.length);
  const p10 = wordCounts[Math.floor(wordCounts.length * 0.1)];
  const p90 = wordCounts[Math.floor(wordCounts.length * 0.9)];
  stats.articles.avgWordCount = avg;
  stats.articles.p10WordCount = p10?.count;
  stats.articles.p90WordCount = p90?.count;

  // Week coverage
  const missingWeeks = [];
  for (let w = 1; w <= 53; w++) {
    if (!weeksCovered.has(w)) missingWeeks.push(w);
  }
  if (missingWeeks.length > 0) {
    log('ART_MISSING_WEEKS', `No articles for weeks: ${missingWeeks.join(', ')}`);
  }
}

// ── 3. FLASHCARDS (deep) ───────────────────────────────────────────────────
console.log('Checking flashcards (deep)...');
{
  const dir = path.join(ROOT, 'content', 'flashcards');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort();

  const allWords = new Map(); // word → [ids]

  stats.flashcards = {
    total: 0,
    wordNotInExample: 0,
    shortChinese: 0,
    duplicateWords: 0,
  };

  for (const file of files) {
    const cards = loadTs(path.join(dir, file));
    for (const card of cards) {
      stats.flashcards.total++;
      const id = card.id || `w${card.weekNumber}-${card.source}`;
      const word = (card.english || '').toLowerCase().trim();
      const ex = (card.exampleSentence || '').toLowerCase().trim();
      const zh = (card.chinese || '').trim();

      // Check Chinese definition length
      if (zh.length < 5) {
        stats.flashcards.shortChinese++;
        log('FC_SHORT_ZH', `${id} "${card.english}": Chinese def only ${zh.length} chars`);
      }

      // Check word appears in example (skip if multi-word phrase)
      if (word && ex) {
        const wordParts = word.split(/\s+/).filter(w => w.length > 3);
        const found = wordParts.length === 0 || wordParts.some(wp => ex.includes(wp));
        if (!found && word.length > 3) {
          stats.flashcards.wordNotInExample++;
          log('FC_WORD_ABSENT', `${id} word "${card.english}": not found in example "${card.exampleSentence?.substring(0,60)}"`);
        }
      }

      // Track duplicate vocabulary words (same English across all cards)
      const normWord = word.replace(/[^a-z0-9 ]/g, '').trim();
      if (normWord.length > 2) {
        if (!allWords.has(normWord)) allWords.set(normWord, []);
        allWords.get(normWord).push(id);
      }
    }
  }

  // Report words appearing 3+ times
  for (const [w, ids] of allWords) {
    if (ids.length >= 3) {
      stats.flashcards.duplicateWords++;
      log('FC_DUPE_WORD', `"${w}" appears ${ids.length}x: ${ids.slice(0,4).join(', ')}${ids.length>4?'...':''}`);
    }
  }
}

// ── 4. CONVERSATION QUESTIONS (deep) ───────────────────────────────────────
console.log('Checking questions (deep)...');
{
  const dir = path.join(ROOT, 'content', 'questions');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts')).sort();

  const questionTexts = new Map();
  const weekQuestionCounts = new Map();

  stats.questions = {
    total: 0,
    duplicateQuestions: 0,
    shortChineseHint: 0,
    weakChineseHint: 0,
  };

  for (const file of files) {
    const qs = loadTs(path.join(dir, file));
    for (const q of qs) {
      stats.questions.total++;
      const id = `W${String(q.weekNumber).padStart(2,'0')}-${q.day}`;
      const question = (q.question || '').trim();
      const hint = (q.chineseHint || '').trim();

      // Chinese hint quality
      const chineseChars = (hint.match(/[\u4e00-\u9fff]/g) || []).length;
      if (chineseChars < 10) {
        stats.questions.shortChineseHint++;
        log('CQ_SHORT_HINT', `${id}: Chinese hint only ${chineseChars} Chinese chars: "${hint.substring(0,60)}"`);
      }

      // Track per-week question count
      const wk = q.weekNumber || 0;
      weekQuestionCounts.set(wk, (weekQuestionCounts.get(wk) || 0) + 1);

      // Track duplicate questions
      const normQ = question.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (normQ.length > 10) {
        if (!questionTexts.has(normQ)) questionTexts.set(normQ, []);
        questionTexts.get(normQ).push(id);
      }
    }
  }

  // Report duplicate questions
  for (const [q, ids] of questionTexts) {
    if (ids.length >= 2) {
      stats.questions.duplicateQuestions++;
      log('CQ_DUPE_Q', `[${ids.length}x] "${q.substring(0,60)}" → ${ids.join(', ')}`);
    }
  }

  // Report weeks with too few or too many questions
  for (const [wk, count] of weekQuestionCounts) {
    if (count < 5) log('CQ_FEW_QUESTIONS', `W${wk}: only ${count} questions`);
    if (count > 8) log('CQ_MANY_QUESTIONS', `W${wk}: ${count} questions (expected 5-7)`);
  }

  // Check weeks 1-53 all have questions
  for (let w = 1; w <= 53; w++) {
    if (!weekQuestionCounts.has(w)) {
      log('CQ_MISSING_WEEK', `Week ${w} has no conversation questions`);
    }
  }
}

// ── 5. CROSS-CONTENT COVERAGE ──────────────────────────────────────────────
console.log('Checking cross-content coverage...');
{
  const articleDir = path.join(ROOT, 'content', 'articles');
  const fcDir = path.join(ROOT, 'content', 'flashcards');
  const qDir = path.join(ROOT, 'content', 'questions');

  const articleWeeks = new Set(
    fs.readdirSync(articleDir).filter(f=>f.match(/articles-w(\d+)\.ts/))
      .map(f => parseInt(f.match(/articles-w(\d+)/)[1]))
  );
  const fcWeeks = new Set();
  const qWeeks = new Set();

  // Parse flashcard week ranges from filenames
  for (const f of fs.readdirSync(fcDir).filter(f=>f.endsWith('.ts'))) {
    const m = f.match(/w(\d+)-w(\d+)/);
    if (m) {
      for (let w = parseInt(m[1]); w <= parseInt(m[2]); w++) fcWeeks.add(w);
    }
  }
  for (const f of fs.readdirSync(qDir).filter(f=>f.endsWith('.ts'))) {
    const m = f.match(/w(\d+)-w(\d+)/);
    if (m) {
      for (let w = parseInt(m[1]); w <= parseInt(m[2]); w++) qWeeks.add(w);
    }
  }

  for (let w = 1; w <= 53; w++) {
    if (!articleWeeks.has(w)) log('COVERAGE_NO_ARTICLE', `Week ${w} missing article file`);
    if (!fcWeeks.has(w)) log('COVERAGE_NO_FC', `Week ${w} not covered by flashcard files`);
    if (!qWeeks.has(w)) log('COVERAGE_NO_Q', `Week ${w} not covered by question files`);
  }
}

// ── REPORT ─────────────────────────────────────────────────────────────────
console.log('\n========================================');
console.log('        SAV DEEP AUDIT REPORT');
console.log('========================================\n');

console.log('EPISODES:');
console.log(`  Files: ${stats.episodes.totalFiles} | Episodes: ${stats.episodes.totalEpisodes} (expected ~371)`);
console.log(`  Missing fields: ${stats.episodes.missingFields}`);
console.log(`  Missing ZH: ${stats.episodes.missingZh}`);
console.log(`  Duplicate titles: ${stats.episodes.duplicateTitles}`);
console.log(`  Template lines: ${stats.episodes.templateLines}`);
console.log(`  No keyPhrases: ${stats.episodes.missingKeyPhrases}`);

console.log('\nARTICLES:');
console.log(`  Total: ${stats.articles.total} | Avg words: ${stats.articles.avgWordCount}`);
console.log(`  Word count p10/p90: ${stats.articles.p10WordCount} / ${stats.articles.p90WordCount}`);
console.log(`  Below 400 words: ${stats.articles.wordCountBelow400}`);
console.log(`  Missing textZh: ${stats.articles.missingZh}`);
console.log(`  Duplicate titles: ${stats.articles.duplicateTitles}`);
console.log(`  Missing vocab: ${stats.articles.missingVocab}`);
console.log(`  Vocab no example: ${stats.articles.vocabMissingExample}`);
console.log(`  Vocab word absent from example: ${stats.articles.vocabWordNotInExample}`);

console.log('\nFLASHCARDS:');
console.log(`  Total: ${stats.flashcards.total}`);
console.log(`  Word absent from example: ${stats.flashcards.wordNotInExample}`);
console.log(`  Short Chinese def: ${stats.flashcards.shortChinese}`);
console.log(`  Duplicate words (3+): ${stats.flashcards.duplicateWords}`);

console.log('\nQUESTIONS:');
console.log(`  Total: ${stats.questions.total}`);
console.log(`  Duplicate questions: ${stats.questions.duplicateQuestions}`);
console.log(`  Short Chinese hint: ${stats.questions.shortChineseHint}`);

const totalIssues = issues.length;
console.log(`\n=== TOTAL DEEP ISSUES: ${totalIssues} ===\n`);

// Group by prefix
const grouped = {};
for (const issue of issues) {
  const m = issue.match(/^([A-Z_]+)/);
  if (m) grouped[m[1]] = (grouped[m[1]] || 0) + 1;
}
for (const [k, v] of Object.entries(grouped).sort((a,b)=>b[1]-a[1])) {
  console.log(`  ${k.padEnd(35)} ${v}`);
}

// Save full output
const outPath = path.join(ROOT, 'scripts', 'deep-audit-output.txt');
fs.writeFileSync(outPath, issues.join('\n'));
console.log(`\nFull details saved to: ${outPath}`);

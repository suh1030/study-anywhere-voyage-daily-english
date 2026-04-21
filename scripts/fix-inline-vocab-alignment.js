const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = process.cwd()
const EPISODES_DIR = path.join(ROOT, 'content', 'episodes')
const FLASHCARDS_DIR = path.join(ROOT, 'content', 'flashcards')

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from',
  'into', 'about', 'than', 'that', 'this', 'it', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'as', 'if', 'but', 'so', 'not', 'do', 'does', 'did', 'have', 'has', 'had', 'you',
  'your', 'my', 'our', 'their', 'his', 'her', 'its', 'they', 'them', 'we', 'i', 'me', 'he',
  'she', 'what', 'how', 'when', 'where', 'why', 'who', 'which', 'there', 'here', 'more',
  'less', 'just', 'only', 'very', 'too', 'can', 'could', 'would', 'should', 'will', 'might',
  'may', 'all', 'also', 'still', 'then', 'than', 'once', 'ever', 'really', 'actually', 'kind',
  'sort', 'lot', 'often', 'because', 'exactly', 'right', 'yes', 'no', 'another', 'simple',
  'useful', 'natural', 'good', 'great',
])

const DULL_WORDS = new Set([
  'thing', 'things', 'people', 'person', 'someone', 'somebody', 'something', 'everything',
  'anything', 'nothing', 'common', 'normal', 'good', 'bad', 'better', 'worse', 'useful',
  'helpful', 'important', 'different', 'whole', 'same', 'part', 'way', 'kind', 'type', 'sort',
  'idea', 'point', 'moment', 'line', 'option', 'version', 'question', 'answer', 'problem',
  'feeling', 'feel', 'think', 'thinking', 'want', 'wanted', 'need', 'needed', 'know', 'known',
  'say', 'saying', 'said', 'make', 'making', 'get', 'getting', 'got', 'go', 'going', 'went',
  'come', 'coming', 'came', 'take', 'taking', 'took', 'give', 'giving', 'gave',
])

const PRONOUNS = new Set([
  'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves',
])

const CLAUSE_MARKERS = new Set([
  'because', 'if', 'when', 'while', 'which', 'that', 'than', 'though', 'although', 'unless',
  'until', 'whether', 'whereas', 'whose', 'whoever', 'whatever', 'however',
])

const FILLER_DEFINITIONS = new Set([
  '沒錯', '對', '對啊', '對呀', '是啊', '是呀', '是的', '嗯', '嗯嗯', '好', '好的', '當然',
  '可以', '好啊', '沒關係', '沒問題', '真的', '確實', '沒錯啊',
])

const GENERIC_RESPONSE_DEFINITIONS = new Set([
  '正確', '聰明', '也許', '沒有', '人也是', '那就說', '試試', '很好', '可以的話',
  '也可以說', '你可以說', '一句很好用的是',
])

const KNOWN_GOOD_PHRASES = new Set([
  'out of sight, out of mind',
  'same value, different behavior',
  'shared value, different form',
  'suggestion, not a verdict',
  'less about denial, more about attention',
])

const MANUAL_DEFINITION_OVERRIDES = {
  'needed a reset': '需要重新調整一下',
  'sounds honest': '聽起來很誠實、很穩',
  'biologically': '從生物特性來看；在生理條件上',
  'authorities': '相關當局；主管機關',
  'wherever': '不管在哪裡；無論身在何處',
  'balcony': '陽台',
  'mood': '情緒上來了；有點鬧情緒',
  'running a fever': '在發燒',
  'interact': '互動',
  'teamed up': '聯手；站在同一邊',
  'most effective move': '最有效的做法',
  'sure i understood': '確認一下我理解正確了',
  'tells someone': '這是在告訴對方',
  'reasons': '對的理由；正確的理由',
  'properly': '恰當地；準確地',
  'stretching your budget': '把預算拉長用；更有效地用預算',
  'leave less harm': '少留下一點傷害',
  'mentally crowded': '腦子很擠；心裡很塞',
  'many people': '很多人',
  'shorter version': '更短的說法',
  'insecurity': '不安全感',
  'rely less': '少依賴一點',
  'thermostat': '恆溫器',
  'channels': '溝通管道；頻道',
  'complications': '額外的複雜性；麻煩',
  'repeatable work': '可重複的工作',
  'plausible language': '聽起來像對的說法；貌似合理的語言',
  'practical exit': '可實行的出口；立刻能做的出口',
  'life impossible': '把生活弄得很難過',
  'easier everyday': '更日常的說法',
  'everyday': '更日常一點',
  'more everyday': '更日常一點',
  'this differently': '對這件事看法不同',
  'period taught': '那段時期教會我的事',
  'name early': '提早點出來；及早說明',
  'next move responsibly': '負責任地選下一步',
  'rushed': '太急而亂；慌亂趕工',
  'one who quietly': '那個默默幫忙的人',
  'way of caring': '一種照顧人的方式',
  'feel less foreign': '比較不那麼像外人；比較不陌生',
  'through different behaviors': '用不同行為表達',
  'always visible': '從外面總看得見',
  'always lighter': '不一定更輕鬆',
  'definitely guides attention': '確實會引導注意力',
  'experience stopped': '那段經驗不再那麼模糊',
  'other people without leaving': '跟別人連結；同時不丟掉自己',
  'self anymore': '不再像以前的自己',
  'more inhabitable': '更讓人待得住；更有可居性',
  'page gives': '頁面給我一種誠實感',
}

const IRREGULAR_MAP = {
  am: 'be',
  is: 'be',
  are: 'be',
  was: 'be',
  were: 'be',
  been: 'be',
  being: 'be',
  has: 'have',
  had: 'have',
  does: 'do',
  did: 'do',
  done: 'do',
  went: 'go',
  gone: 'go',
  made: 'make',
  making: 'make',
  took: 'take',
  taken: 'take',
  taking: 'take',
  gave: 'give',
  given: 'give',
  giving: 'give',
  got: 'get',
  gotten: 'get',
  getting: 'get',
  came: 'come',
  coming: 'come',
  became: 'become',
  becoming: 'become',
  felt: 'feel',
  feels: 'feel',
  feeling: 'feel',
  kept: 'keep',
  keeping: 'keep',
  left: 'leave',
  leaving: 'leave',
  thought: 'think',
  thinking: 'think',
  brought: 'bring',
  bringing: 'bring',
  bought: 'buy',
  buying: 'buy',
  caught: 'catch',
  catching: 'catch',
  found: 'find',
  finding: 'find',
  knew: 'know',
  knowing: 'know',
  said: 'say',
  saying: 'say',
  saw: 'see',
  seen: 'see',
  seeing: 'see',
  told: 'tell',
  telling: 'tell',
  heard: 'hear',
  hearing: 'hear',
  held: 'hold',
  holding: 'hold',
  built: 'build',
  building: 'build',
  spent: 'spend',
  spending: 'spend',
  wrote: 'write',
  written: 'write',
  writing: 'write',
  rode: 'ride',
  ridden: 'ride',
  riding: 'ride',
  ran: 'run',
  running: 'run',
  sat: 'sit',
  sitting: 'sit',
  stood: 'stand',
  standing: 'stand',
  slept: 'sleep',
  sleeping: 'sleep',
  lay: 'lie',
  lying: 'lie',
  paid: 'pay',
  paying: 'pay',
  met: 'meet',
  meeting: 'meet',
  spoke: 'speak',
  spoken: 'speak',
  speaking: 'speak',
  drove: 'drive',
  driven: 'drive',
  driving: 'drive',
  woke: 'wake',
  woken: 'wake',
  waking: 'wake',
  shook: 'shake',
  shaken: 'shake',
  lost: 'lose',
  losing: 'lose',
  won: 'win',
  winning: 'win',
  fell: 'fall',
  fallen: 'fall',
  falling: 'fall',
  grew: 'grow',
  grown: 'grow',
  growing: 'grow',
  wore: 'wear',
  worn: 'wear',
  wearing: 'wear',
  swam: 'swim',
  swum: 'swim',
  swimming: 'swim',
  hung: 'hang',
  hanging: 'hang',
  chose: 'choose',
  chosen: 'choose',
  choosing: 'choose',
  rationalizing: 'rationalize',
  reducing: 'reduce',
  recognizing: 'recognize',
  creates: 'create',
  creating: 'create',
  sets: 'set',
  setting: 'set',
  fits: 'fit',
  fitting: 'fit',
  reminds: 'remind',
  reminded: 'remind',
  matters: 'matter',
  mattered: 'matter',
  opening: 'open',
  inviting: 'invite',
  including: 'include',
  welcomes: 'welcome',
  welcoming: 'welcome',
  isolates: 'isolate',
  isolating: 'isolate',
  tossing: 'toss',
  turning: 'turn',
  charging: 'charge',
  deserves: 'deserve',
  walked: 'walk',
  walking: 'walk',
  snapped: 'snap',
  snapping: 'snap',
  associated: 'associate',
  associating: 'associate',
  dropped: 'drop',
  dropping: 'drop',
  loosened: 'loosen',
  loosening: 'loosen',
  pass: 'pass',
  passed: 'pass',
  passing: 'pass',
  cutting: 'cut',
}

function parseWeekFilter(argv) {
  const arg = argv.find((value) => value.startsWith('--weeks='))
  if (!arg) return null
  return new Set(
    arg
      .slice('--weeks='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => value.padStart(2, '0'))
  )
}

const WEEK_FILTER = parseWeekFilter(process.argv.slice(2))

function normalizeToken(token) {
  let value = String(token || '')
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, '')

  if (!value) return ''
  if (value.endsWith("'s")) value = value.slice(0, -2)
  if (IRREGULAR_MAP[value]) return IRREGULAR_MAP[value]

  if (value.endsWith('ies') && value.length > 4) value = `${value.slice(0, -3)}y`
  else if (value.endsWith('ing') && value.length > 5) value = value.slice(0, -3)
  else if (value.endsWith('ed') && value.length > 4) value = value.slice(0, -2)
  else if (value.endsWith('es') && value.length > 4) value = value.slice(0, -2)
  else if (value.endsWith('s') && value.length > 3) value = value.slice(0, -1)

  return IRREGULAR_MAP[value] || value
}

function levenshtein(a, b) {
  const rows = a.length + 1
  const cols = b.length + 1
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0))

  for (let i = 0; i < rows; i += 1) dp[i][0] = i
  for (let j = 0; j < cols; j += 1) dp[0][j] = j

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }

  return dp[a.length][b.length]
}

function similarTokens(a, b) {
  const rawA = String(a || '').toLowerCase()
  const rawB = String(b || '').toLowerCase()
  if (!rawA || !rawB) return false
  if (rawA === rawB) return true

  const normA = normalizeToken(rawA)
  const normB = normalizeToken(rawB)
  if (!normA || !normB) return false
  if (normA === normB) return true

  if ((normA.startsWith(normB) || normB.startsWith(normA)) && Math.min(normA.length, normB.length) >= 4) {
    return true
  }

  if (normA.length >= 5 && normB.length >= 5 && levenshtein(normA, normB) <= 1) {
    return true
  }

  return false
}

function tokenizeText(text) {
  const out = []
  const regex = /[A-Za-z][A-Za-z'-]*/g
  let match

  while ((match = regex.exec(text)) !== null) {
    out.push({
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
      norm: normalizeToken(match[0]),
    })
  }

  return out
}

function splitIntoSegments(text) {
  return String(text || '')
    .split(/[.?!:;]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function trimQuoteArtifacts(phrase) {
  return phrase
    .replace(/^["'`]+/, '')
    .replace(/["'`]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksComparativeWindow(window) {
  return (
    window.length === 2 &&
    ['more', 'less'].includes(window[0].norm) &&
    !STOPWORDS.has(window[1].norm)
  )
}

function looksNoPhrase(window) {
  return (
    window.length === 2 &&
    window[0].norm === 'no' &&
    !STOPWORDS.has(window[1].norm)
  )
}

function tokenLooksNounish(token) {
  const raw = String(token?.raw || '').toLowerCase()
  const norm = String(token?.norm || '').toLowerCase()
  if (!raw || STOPWORDS.has(norm) || PRONOUNS.has(norm) || CLAUSE_MARKERS.has(norm)) return false
  if (/(tion|sion|ment|ness|ity|ship|ance|ence|hood|ism|ist|age|ure|dom)$/.test(raw)) return true
  if (/(er|or)$/.test(raw) && raw.length >= 6) return true
  return raw.length >= 6
}

function tokenLooksAdjectiveLike(token) {
  const raw = String(token?.raw || '').toLowerCase()
  const norm = String(token?.norm || '').toLowerCase()
  if (!raw || STOPWORDS.has(norm) || PRONOUNS.has(norm)) return false
  if (/(al|ial|ive|ful|less|ous|able|ible|ent|ant|ary|ory|ish|ical|ier|iest|ed)$/.test(raw)) return true
  return new Set([
    'soft', 'softer', 'funny', 'funnier', 'formal', 'careful', 'steady', 'steadier',
    'reactive', 'contextual', 'social', 'personal', 'honest', 'trapped', 'grounded',
  ]).has(norm)
}

function tokenLooksVerbish(token) {
  const raw = String(token?.raw || '').toLowerCase()
  const norm = String(token?.norm || '').toLowerCase()
  const forms = new Set([raw, norm])
  if (raw.endsWith('ies') && raw.length > 4) forms.add(`${raw.slice(0, -3)}y`)
  if (raw.endsWith('es') && raw.length > 4) forms.add(raw.slice(0, -2))
  if (raw.endsWith('s') && raw.length > 3) forms.add(raw.slice(0, -1))
  if (!raw) return false
  if (/(ing|ed)$/.test(raw)) return true
  const verbish = new Set([
    'be', 'have', 'do', 'make', 'say', 'go', 'get', 'come', 'take', 'give', 'keep', 'feel',
    'think', 'want', 'need', 'know', 'look', 'sound', 'work', 'change', 'put', 'start', 'help',
    'build', 'return', 'support', 'hold', 'bring', 'open', 'close', 'share', 'care', 'carry',
    'learn', 'access', 'focus', 'stretch', 'drop', 'loosen', 'belong', 'wait',
  ])
  return [...forms].some((form) => verbish.has(form))
}

function tokenLooksAllowedLeadVerb(token) {
  const raw = String(token?.raw || '').toLowerCase()
  const norm = String(token?.norm || '').toLowerCase()
  return new Set(['feel', 'felt', 'sound', 'sounds', 'look', 'looks', 'looking', 'seem', 'seems']).has(raw) ||
    new Set(['feel', 'sound', 'look', 'seem']).has(norm)
}

function phraseLooksUseful(phrase) {
  const tokens = tokenizeText(phrase)
  const content = tokens.filter((token) => !STOPWORDS.has(token.norm))
  if (!content.length) return false
  if (content.every((token) => DULL_WORDS.has(token.norm)) && !looksNoPhrase(tokens)) return false
  if (/[,:;]/.test(phrase)) return false
  if (tokens.length > 3) return false
  if (tokens.some((token) => CLAUSE_MARKERS.has(token.norm))) return false
  if (PRONOUNS.has(tokens[0].norm) || PRONOUNS.has(tokens[tokens.length - 1].norm)) return false
  if (STOPWORDS.has(tokens[tokens.length - 1].norm)) return false
  if (STOPWORDS.has(tokens[0].norm) && !looksComparativeWindow(tokens) && !looksNoPhrase(tokens)) return false
  if (tokens.length === 1 && content[0].raw.length < 4) return false
  return true
}

function scoreWindow(window, phrase, matchInfo, targetTokenCount, definitionMaps, isQuoted) {
  const first = window[0]
  const last = window[window.length - 1]
  const contentCount = window.filter((token) => !STOPWORDS.has(token.norm)).length
  const longContent = window.filter((token) => !STOPWORDS.has(token.norm) && token.raw.length >= 5).length
  const dullCount = window.filter((token) => DULL_WORDS.has(token.norm)).length
  const pronounCount = window.filter((token) => PRONOUNS.has(token.norm)).length
  const clauseCount = window.filter((token) => CLAUSE_MARKERS.has(token.norm)).length
  const verbishCount = window.filter((token) => tokenLooksVerbish(token)).length
  const conjunctionCount = window.filter((token) => ['and', 'or', 'but'].includes(token.norm)).length
  const middleVerbPenalty = window.length === 3 && tokenLooksVerbish(window[1]) ? 1 : 0
  const canonicalHit = definitionMaps?.canonical?.has(phrase) ? 1 : 0
  const broadHit = definitionMaps?.broad?.has(phrase) ? 1 : 0
  let score = 0

  score += matchInfo.coverage * 80
  score += matchInfo.matched * 12
  score += matchInfo.exact * 7
  score += canonicalHit * 28
  score += broadHit * 8
  score += contentCount * 4
  score += longContent * 2
  score += isQuoted ? 5 : 0
  score += looksComparativeWindow(window) ? 18 : 0
  score += looksNoPhrase(window) ? 14 : 0
  score += tokenLooksNounish(last) ? 7 : 0
  score += tokenLooksAdjectiveLike(last) ? 6 : 0
  score += tokenLooksNounish(first) ? 2 : 0

  if (!STOPWORDS.has(first.norm)) score += 6
  else score -= 8

  if (!STOPWORDS.has(last.norm)) score += 6
  else score -= 8

  score += window.length === 2 ? 7 : 0
  score += window.length === 1 ? 5 : 0
  score += window.length === 3 ? 3 : 0
  score -= window.length >= 4 ? 4 : 0

  score -= dullCount * 3
  score -= pronounCount * 10
  score -= clauseCount * 12
  score -= conjunctionCount * 9
  score -= middleVerbPenalty * 12
  score -= tokenLooksVerbish(first) && !tokenLooksAllowedLeadVerb(first) ? 14 : 0
  score -= verbishCount >= 2 ? (verbishCount - 1) * 5 : 0
  score -= Math.abs(window.length - Math.max(1, Math.min(3, targetTokenCount))) * 2.5

  return score
}

function evaluateWindow(window, targetTokens) {
  const targetContent = targetTokens.filter((token) => !STOPWORDS.has(token.norm))
  const compareTokens = targetContent.length ? targetContent : targetTokens
  let matched = 0
  let exact = 0

  for (const target of compareTokens) {
    if (window.some((token) => similarTokens(target.raw, token.raw))) matched += 1
    if (window.some((token) => token.raw.toLowerCase() === target.raw.toLowerCase())) exact += 1
  }

  const coverage = compareTokens.length ? matched / compareTokens.length : 0
  return { matched, exact, coverage }
}

function segmentEntries(lineEn) {
  const entries = splitIntoSegments(lineEn).map((segment) => ({ text: segment, quoted: false }))
  const quoteRegex = /["“]([^"”]+)["”]/g
  let match

  while ((match = quoteRegex.exec(lineEn)) !== null) {
    const inner = match[1].trim()
    if (inner) entries.push({ text: inner, quoted: true })
  }

  return entries
}

function bestAlignedPhrase(lineEn, word, definitionMaps, excludedPhrases = new Set()) {
  let best = null
  const targetTokens = tokenizeText(word)
  if (!targetTokens.length) return null

  for (const entry of segmentEntries(lineEn)) {
    const lineTokens = tokenizeText(entry.text)
    if (!lineTokens.length) continue
    const maxWindow = Math.min(lineTokens.length, 3)

    for (let start = 0; start < lineTokens.length; start += 1) {
      for (let length = 1; length <= maxWindow && start + length <= lineTokens.length; length += 1) {
        const window = lineTokens.slice(start, start + length)
        const matchInfo = evaluateWindow(window, targetTokens)
        if (matchInfo.matched === 0) continue

        const phrase = trimQuoteArtifacts(entry.text.slice(window[0].start, window[window.length - 1].end))
        if (!phraseLooksUseful(phrase)) continue
        if (excludedPhrases.has(phrase.toLowerCase())) continue

        const score = scoreWindow(window, phrase, matchInfo, targetTokens.length, definitionMaps, entry.quoted)
        if (!best || score > best.score) {
          best = {
            phrase,
            score,
            coverage: matchInfo.coverage,
            matched: matchInfo.matched,
            exact: matchInfo.exact,
            source: 'aligned',
          }
        }
      }
    }
  }

  return best
}

function bestKnownPhrase(lineEn, definitionMaps, excludedPhrases = new Set()) {
  let best = null
  for (const entry of segmentEntries(lineEn)) {
    const lineTokens = tokenizeText(entry.text)
    if (!lineTokens.length) continue
    const maxWindow = Math.min(3, lineTokens.length)

    for (let start = 0; start < lineTokens.length; start += 1) {
      for (let length = 1; length <= maxWindow && start + length <= lineTokens.length; length += 1) {
        const window = lineTokens.slice(start, start + length)
        const phrase = trimQuoteArtifacts(entry.text.slice(window[0].start, window[window.length - 1].end))
        if (!phraseLooksUseful(phrase)) continue
        if (excludedPhrases.has(phrase.toLowerCase())) continue
        if (!definitionMaps?.canonical?.has(phrase) && !definitionMaps?.broad?.has(phrase)) continue

        const score = scoreWindow(
          window,
          phrase,
          { coverage: 0, matched: 0, exact: 0 },
          window.length,
          definitionMaps,
          entry.quoted,
        ) + 10

        if (!best || score > best.score) {
          best = { phrase, score, source: definitionMaps?.canonical?.has(phrase) ? 'known_canonical' : 'known_broad' }
        }
      }
    }
  }

  return best
}

function bestSalientPhrase(lineEn, definitionMaps, excludedPhrases = new Set()) {
  let best = null
  for (const entry of segmentEntries(lineEn)) {
    const lineTokens = tokenizeText(entry.text)
    if (!lineTokens.length) continue
    const maxWindow = Math.min(3, lineTokens.length)

    for (let start = 0; start < lineTokens.length; start += 1) {
      for (let length = 1; length <= maxWindow && start + length <= lineTokens.length; length += 1) {
        const window = lineTokens.slice(start, start + length)
        const phrase = trimQuoteArtifacts(entry.text.slice(window[0].start, window[window.length - 1].end))
        const content = window.filter((token) => !STOPWORDS.has(token.norm))
        if (!phraseLooksUseful(phrase)) continue
        if (excludedPhrases.has(phrase.toLowerCase())) continue
        if (!content.length) continue

        let score = scoreWindow(
          window,
          phrase,
          { coverage: 0, matched: 0, exact: 0 },
          Math.min(2, window.length),
          definitionMaps,
          entry.quoted,
        )
        score += window.some((token) => token.raw.includes('-')) ? 4 : 0
        score -= start * 0.08

        if (!best || score > best.score) {
          best = { phrase, score, source: entry.quoted ? 'quote' : 'salient' }
        }
      }
    }
  }

  return best
}

function sanitizeDefinition(def) {
  const value = String(def || '').trim().replace(/\s+/g, '')
  if (!value) return ''

  const cleaned = value
    .replace(/「[^」]*」/g, '')
    .replace(/『[^』]*』/g, '')
    .replace(/“[^”]*”/g, '')
    .replace(/"[^"]*"/g, '')
    .trim()

  if (!cleaned) return ''
  if (FILLER_DEFINITIONS.has(cleaned)) return ''
  if (/^[，。！？；、]+$/.test(cleaned)) return ''
  return cleaned
}

function containsCJK(text) {
  return /[\u3400-\u9fff]/.test(String(text || ''))
}

function stripZhLead(text) {
  let value = sanitizeDefinition(text)
  if (!value) return ''

  const patterns = [
    /^(沒錯|對啊|對呀|對|好啊|好的|好|嗯嗯|嗯|就是|正確|聰明|也許|人也是|那就說|這樣說|可以說|也可以說|你可以說|你也可以說|另一句也很好用|另一句也可以|另一句也很好|一句很好用的是|另一種說法是|更自然的說法是|更日常的說法是|自然一點的說法是|如果你想要更[^，。]*版本，試|如果你想要[^，。]*版本，試|如果你想要[^，。]*，試|如果你想[^，。]*，試|如果有人[^，。]*，試試|試試)([：:，。．、])?/,
    /^在你想[^，。]*的時候/,
    /^這句很適合[^，。]*/,
    /^這句能讓你[^，。]*/,
    /^這把它定位成/,
    /^這很[^，。]*/,
    /^它很[^，。]*/,
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const pattern of patterns) {
      if (pattern.test(value)) {
        value = value.replace(pattern, '').replace(/^[，。．、:：]+/, '')
        changed = true
      }
    }
  }

  if (value.startsWith('因為')) value = value.slice(2)
  if (value.startsWith('所以')) value = value.slice(2)

  return value.trim()
}

function looksContextualZhClause(value) {
  const text = stripZhLead(value)
  if (!text) return false
  if (GENERIC_RESPONSE_DEFINITIONS.has(text)) return true
  if (/^(如果|當|對於|至於|很多時候會|你也可以|另一句|這句|那句|在你|在人|在這個|在不同|在兩種|在大多數)/.test(text)) return true
  if (/^(這很|它很)/.test(text)) return true
  if (/(裡|中|時)$/.test(text) && text.length <= 10) return true
  if (/很好用|很適合|試試|就說|另一句|這句|那句/.test(text)) return true
  return false
}

function definitionNeedsRefresh(def) {
  const value = stripZhLead(def)
  if (!value) return true
  if (!containsCJK(value)) return true
  if (FILLER_DEFINITIONS.has(value)) return true
  if (GENERIC_RESPONSE_DEFINITIONS.has(value)) return true
  if (looksContextualZhClause(value)) return true
  return false
}

function splitSentencesDetailed(text, punctuationRegex) {
  const source = String(text || '')
  const matches = []
  const regex = new RegExp(`[^${punctuationRegex.source}]+[${punctuationRegex.source}]*`, 'g')
  let match

  while ((match = regex.exec(source)) !== null) {
    const raw = match[0]
    const trimmed = raw.trim()
    if (!trimmed) continue
    matches.push({
      text: trimmed.replace(/[。！？；.!?;]+$/g, '').trim(),
      start: match.index,
      end: match.index + raw.length,
    })
  }

  return matches
}

function extractQuotedTextsDetailed(text, regex) {
  const out = []
  let match

  while ((match = regex.exec(String(text || ''))) !== null) {
    out.push({
      text: sanitizeDefinition(match[1]),
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return out
}

function clauseIndexContainingPhrase(text, word, separatorRegex) {
  const source = String(text || '')
  const phrase = String(word || '').toLowerCase()
  if (!source || !phrase) return 0

  const clauses = source.split(separatorRegex).map((clause) => clause.trim()).filter(Boolean)
  if (clauses.length <= 1) return 0

  let cursor = 0
  const wordIndex = source.toLowerCase().indexOf(phrase)
  if (wordIndex < 0) return 0

  for (let i = 0; i < clauses.length; i += 1) {
    const clause = clauses[i]
    const start = source.toLowerCase().indexOf(clause.toLowerCase(), cursor)
    const end = start + clause.length
    if (wordIndex >= start && wordIndex < end) return i
    cursor = end
  }

  return 0
}

function sentenceIndexContainingPhrase(lineEn, word) {
  const source = String(lineEn || '')
  const phrase = String(word || '').toLowerCase()
  if (!source || !phrase) return 0

  const index = source.toLowerCase().indexOf(phrase)
  if (index < 0) return 0

  const sentences = splitSentencesDetailed(source, /.!?;/)
  const foundIndex = sentences.findIndex((sentence) => index >= sentence.start && index < sentence.end)
  return foundIndex >= 0 ? foundIndex : 0
}

function definitionVariants(text) {
  const base = stripZhLead(text)
  if (!base) return []

  const variants = new Set([base])
  const clauses = base.split('，').map((clause) => stripZhLead(clause)).filter(Boolean)

  for (const clause of clauses) variants.add(clause)

  const suffixPatterns = [
    /變得(.{2,24})$/,
    /就是(.{2,24})$/,
    /就能(.{2,24})$/,
    /會(.{2,24})$/,
    /應該(.{2,24})$/,
    /需要(.{2,24})$/,
    /讓(.{2,24})$/,
  ]

  for (const pattern of suffixPatterns) {
    const match = base.match(pattern)
    if (match?.[1]) variants.add(stripZhLead(match[1]))
  }

  if (/不知道.{2,24}$/.test(base)) {
    const tail = base.match(/(不知道.{2,24})$/)?.[1]
    if (tail) variants.add(stripZhLead(tail))
  }

  if (base.startsWith('讓我')) variants.add(stripZhLead(base.slice(2)))
  if (base.startsWith('我需要')) variants.add(stripZhLead(base.slice(3)))
  if (base.includes('就能')) variants.add(stripZhLead(base.split('就能').slice(1).join('就能')))
  if (base.includes('而讓') && base.includes('變得')) {
    variants.add(stripZhLead(base.split('變得').slice(1).join('變得')))
  }

  if (clauses.length >= 2) {
    variants.add(`${clauses[0]}，${clauses[1]}`)
    variants.add(clauses.slice(1).join('，'))
  }

  return [...variants]
    .map((value) => sanitizeDefinition(value))
    .filter(Boolean)
}

function scoreDefinitionCandidate(text) {
  const value = stripZhLead(text)
  if (!value) return -Infinity
  if (!containsCJK(value)) return -Infinity

  let score = 0

  if (!definitionNeedsRefresh(value)) score += 40
  if (value.length >= 2 && value.length <= 14) score += 16
  else if (value.length <= 18) score += 10
  else score -= Math.max(0, value.length - 18) * 1.6

  if (/；|、/.test(value)) score += 4
  if (/^(因為|如果|在你|在人|在這個|在不同|在兩種|在大多數|你也可以|另一句|這句|那句)/.test(value)) score -= 22
  if (/[我你他她它我們你們他們]/.test(value)) score -= 6
  if (/^[我你他她它][^，。；]{0,5}$/.test(value)) score -= 12
  if (/很好用|很適合|試試|就說|另一句|這句|那句|可以說|這樣/.test(value)) score -= 18
  if (/而讓|讓生活|只用幾個字|部分是因為/.test(value)) score -= 10
  if (/^就能/.test(value)) score -= 6
  if (GENERIC_RESPONSE_DEFINITIONS.has(value)) score -= 30
  if (looksContextualZhClause(value)) score -= 20

  return score
}

function pickBestDefinition(candidates) {
  let best = null

  for (const candidate of candidates) {
    const boost = candidate?.boost || 0
    for (const variant of definitionVariants(candidate?.text)) {
      const score = scoreDefinitionCandidate(variant) + boost
      if (
        !best ||
        score > best.score ||
        (score === best.score && variant.length < best.text.length)
      ) {
        best = { text: variant, score }
      }
    }
  }

  return best?.text || ''
}

function lineDefinitionCandidates(line, word) {
  const candidates = []
  const lineEn = String(line?.en || '')
  const lineZh = String(line?.zh || '')
  const lowerWord = String(word || '').toLowerCase()
  if (!lineEn || !lineZh || !lowerWord) return candidates

  const wordIndex = lineEn.toLowerCase().indexOf(lowerWord)
  const enQuotes = extractQuotedTextsDetailed(lineEn, /["“]([^"”]+)["”]/g)
  const zhQuotes = extractQuotedTextsDetailed(lineZh, /[「『“"]([^」』”"]+)[」』”"]/g)
  const quoteIndex = enQuotes.findIndex((quote) =>
    wordIndex >= 0 && (wordIndex >= quote.start && wordIndex < quote.end || quote.text.toLowerCase().includes(lowerWord))
  )

  if (quoteIndex >= 0 && zhQuotes[quoteIndex]?.text) {
    const enQuote = enQuotes[quoteIndex].text
    const zhQuote = zhQuotes[quoteIndex].text
    const zhClauses = zhQuote.split('，').map((clause) => stripZhLead(clause)).filter(Boolean)
    if (containsCJK(zhQuote)) candidates.push({ text: zhQuote, boost: 24 })

    if (zhClauses.length > 0) {
      const enClauseIndex = clauseIndexContainingPhrase(enQuote, word, /\s*,\s*/)
      const relativeIndex = Math.floor(
        (Math.max(0, enQuote.toLowerCase().indexOf(lowerWord)) / Math.max(enQuote.length, 1)) * zhClauses.length,
      )
      const approxIndex = Math.min(zhClauses.length - 1, Math.max(enClauseIndex, relativeIndex))

      if (containsCJK(zhClauses[approxIndex])) candidates.push({ text: zhClauses[approxIndex], boost: 30 })
      const trailing = zhClauses.slice(approxIndex).join('，')
      if (containsCJK(trailing)) candidates.push({ text: trailing, boost: 28 })
    }
  }

  const enSentences = splitSentencesDetailed(lineEn, /.!?;/)
  const zhSentences = splitSentencesDetailed(lineZh, /。！？；/)
  const sentenceIndex = sentenceIndexContainingPhrase(lineEn, word)
  const matchedSentence = zhSentences[Math.min(sentenceIndex, Math.max(zhSentences.length - 1, 0))]?.text

  if (matchedSentence) candidates.push({ text: matchedSentence, boost: 16 })
  if (zhSentences[0]?.text && zhSentences[0].text !== matchedSentence) candidates.push({ text: zhSentences[0].text, boost: 4 })
  if (enSentences.length > 1 && zhSentences.length > 1) {
    const lastSentence = zhSentences[zhSentences.length - 1]?.text
    if (lastSentence && lastSentence !== matchedSentence) candidates.push({ text: lastSentence, boost: 2 })
  }

  candidates.push({ text: lineZh, boost: 0 })
  return candidates
}

function compactZhDefinition(zh) {
  const value = stripZhLead(zh)
  if (!value) return ''

  const sentences = value
    .split(/[。！？；]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  for (const sentence of sentences) {
    const cleanedSentence = stripZhLead(sentence)
    if (!cleanedSentence) continue
    if (FILLER_DEFINITIONS.has(cleanedSentence)) continue

    const clauses = cleanedSentence.split('，').map((clause) => stripZhLead(clause)).filter(Boolean)
    const informativeClauses = clauses.filter((clause) => {
      if (!clause || FILLER_DEFINITIONS.has(clause) || clause.length < 4) return false
      if (looksContextualZhClause(clause) && clauses.length > 1) {
        return false
      }
      return true
    })
    const informative =
      informativeClauses.find((clause) => clause.length >= 6 && clause.length <= 20) ||
      informativeClauses.find((clause) => clause.length <= 24) ||
      informativeClauses[0]
    if (informative && informative.length <= 28) return informative
    if (cleanedSentence.length <= 28) return cleanedSentence
    if (clauses.length >= 2) {
      const merged = `${clauses[0]}，${clauses[1]}`
      if (merged.length <= 30) return merged
    }
    return cleanedSentence.slice(0, 30)
  }

  return value.slice(0, 30)
}

function wordNeedsReview(word, canonicalMap) {
  const value = String(word || '').trim()
  const lowered = value.toLowerCase()
  const tokens = tokenizeText(value)
  const conjunctionCount = tokens.filter((token) => ['and', 'or', 'but'].includes(token.norm)).length
  if (!value) return true
  if (KNOWN_GOOD_PHRASES.has(lowered)) return false
  if (canonicalMap?.has(value)) return false
  if (/[.!?]/.test(value)) return true
  if (value.includes('"') || value.includes("'")) return true
  if (value.includes(',') && !KNOWN_GOOD_PHRASES.has(lowered)) return true
  if (tokens.length === 0) return true
  if (tokens.length > 4) return true
  if (conjunctionCount > 0 && tokens.length >= 3) return true
  if (tokens.length === 3 && tokenLooksVerbish(tokens[1])) return true
  if (tokens.some((token) => CLAUSE_MARKERS.has(token.norm))) return true
  if (tokens.filter((token) => DULL_WORDS.has(token.norm)).length >= 3) return true
  if (STOPWORDS.has(tokens[0].norm) || STOPWORDS.has(tokens[tokens.length - 1].norm)) return true
  return false
}

function upsertDefinition(map, english, chinese, boost = 0) {
  if (!english || !chinese) return

  const next = pickBestDefinition([{ text: chinese, boost }])
  if (!next) return

  const current = map.get(english)
  if (!current) {
    map.set(english, next)
    return
  }

  if (scoreDefinitionCandidate(next) + boost > scoreDefinitionCandidate(current)) {
    map.set(english, next)
  }
}

function loadDefinitionMaps() {
  const canonical = new Map()
  const broad = new Map()

  for (const fileName of fs.readdirSync(FLASHCARDS_DIR).filter((name) => name.endsWith('.ts')).sort()) {
    const source = fs.readFileSync(path.join(FLASHCARDS_DIR, fileName), 'utf8')
    const regex = /english:\s*'([^']+)',\s*chinese:\s*'([^']+)'/g
    let match
    while ((match = regex.exec(source)) !== null) {
      const [, english, chinese] = match
      upsertDefinition(canonical, english, chinese, 10)
      upsertDefinition(broad, english, chinese, 10)
    }
  }

  for (const fileName of fs.readdirSync(EPISODES_DIR).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()) {
    const episodes = loadWeekFile(path.join(EPISODES_DIR, fileName))
    for (const episode of episodes) {
      for (const part of episode.parts || []) {
        for (const line of part.lines || []) {
          for (const vocab of line.vocab || []) {
            upsertDefinition(broad, vocab.word, vocab.def, 2)
          }
        }
      }

      for (const phrase of episode.keyPhrases || []) {
        upsertDefinition(canonical, phrase.en, phrase.zh, 8)
        upsertDefinition(broad, phrase.en, phrase.zh, 8)
      }
    }
  }

  return { canonical, broad }
}

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  vm.runInNewContext(script, context, { filename: filePath })
  return context.module.exports || []
}

function saveWeekFile(filePath, episodes) {
  const week = path.basename(filePath).match(/\d+/)?.[0]
  const varName = `WEEK_${week}`
  const content = `import { Episode } from '../types'\n\nexport const ${varName}: Episode[] = ${JSON.stringify(episodes, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

function lineHasWord(line, word) {
  const lineEn = String(line?.en || '').toLowerCase()
  const lowered = String(word || '').trim().toLowerCase()
  return Boolean(lineEn && lowered && lineEn.includes(lowered))
}

function bestDefinitionFor(line, word, vocab, definitionMaps) {
  const override = MANUAL_DEFINITION_OVERRIDES[String(word || '').trim().toLowerCase()]
  const current = String(vocab?.word || '').trim() === String(word || '').trim()
    ? String(vocab?.def || '')
    : ''

  const candidates = [
    { text: override, boost: 40 },
    { text: definitionMaps?.canonical?.get(word), boost: 18 },
    { text: definitionMaps?.broad?.get(word), boost: 10 },
    { text: current, boost: 8 },
    ...lineDefinitionCandidates(line, word),
    { text: compactZhDefinition(line?.zh), boost: 0 },
  ]

  const best = pickBestDefinition(candidates)
  return best || stripZhLead(current) || stripZhLead(definitionMaps?.broad?.get(word)) || ''
}

function chooseReplacement(line, vocab, definitionMaps) {
  const currentWord = String(vocab.word || '').trim()
  const lineEn = String(line.en || '')
  if (!currentWord || !lineEn) return null
  const exactInLine = lineHasWord(line, currentWord)
  const needsReview = wordNeedsReview(currentWord, definitionMaps?.canonical)
  if (exactInLine && !needsReview) return null

  const excludedPhrases = new Set([currentWord.toLowerCase()])
  const candidates = []
  if (!exactInLine) {
    const aligned = bestAlignedPhrase(lineEn, currentWord, definitionMaps, excludedPhrases)
    if (aligned) candidates.push(aligned)
  }

  const known = bestKnownPhrase(lineEn, definitionMaps, excludedPhrases)
  if (known) candidates.push(known)

  const fallback = bestSalientPhrase(lineEn, definitionMaps, excludedPhrases)
  if (fallback) candidates.push(fallback)
  if (candidates.length === 0) return null

  const best = candidates
    .filter((candidate) => candidate && candidate.phrase)
    .sort((a, b) => b.score - a.score)[0]
  if (!best) return null

  const replacement = best.phrase
  const newDef = bestDefinitionFor(line, replacement, vocab, definitionMaps)

  return {
    word: replacement,
    def: newDef,
    reason: best.source || 'fallback',
  }
}

function main() {
  const definitionMaps = loadDefinitionMaps()
  const stats = {
    filesChanged: 0,
    vocabChanged: 0,
    reasons: {},
  }

  const fileNames = fs.readdirSync(EPISODES_DIR).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()

  for (const fileName of fileNames) {
    const week = fileName.match(/\d+/)?.[0]
    if (WEEK_FILTER && !WEEK_FILTER.has(week)) continue

    const filePath = path.join(EPISODES_DIR, fileName)
    const episodes = loadWeekFile(filePath)
    let changed = false

    for (const episode of episodes) {
      for (const part of episode.parts || []) {
        for (const line of part.lines || []) {
          if (!Array.isArray(line.vocab) || line.vocab.length === 0) continue

          line.vocab = line.vocab.map((vocab) => {
            const exactInLine = lineHasWord(line, vocab.word)
            const wordNeedsFix = wordNeedsReview(vocab.word, definitionMaps.canonical)
            const refreshedDef = bestDefinitionFor(line, vocab.word, vocab, definitionMaps)
            const defImproved =
              refreshedDef &&
              refreshedDef !== vocab.def &&
              scoreDefinitionCandidate(refreshedDef) > scoreDefinitionCandidate(vocab.def) + 6

            if (exactInLine && !wordNeedsFix) {
              if (!defImproved) return vocab

              changed = true
              stats.vocabChanged += 1
              stats.reasons.refreshed_def = (stats.reasons.refreshed_def || 0) + 1

              return {
                ...vocab,
                def: refreshedDef,
              }
            }

            const replacement = chooseReplacement(line, vocab, definitionMaps)
            if (!replacement || !replacement.word || replacement.word === vocab.word) {
              if (exactInLine && defImproved) {
                changed = true
                stats.vocabChanged += 1
                stats.reasons.refreshed_def = (stats.reasons.refreshed_def || 0) + 1

                return {
                  ...vocab,
                  def: refreshedDef,
                }
              }

              return vocab
            }

            changed = true
            stats.vocabChanged += 1
            stats.reasons[replacement.reason] = (stats.reasons[replacement.reason] || 0) + 1

            return {
              ...vocab,
              word: replacement.word,
              def: replacement.def,
            }
          })
        }
      }
    }

    if (changed) {
      saveWeekFile(filePath, episodes)
      stats.filesChanged += 1
      console.log(`Updated ${fileName}`)
    }
  }

  console.log('\nFix Summary')
  console.log(JSON.stringify(stats, null, 2))
}

main()

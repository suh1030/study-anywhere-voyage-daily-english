const fs = require('fs')
const path = require('path')
const vm = require('vm')

const { buildFocusPhrase, pickEpisodeTerms } = require('./content-quality-helpers')

const ROOT = process.cwd()
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const QUESTION_GROUPS = [
  { start: 1, end: 8, file: 'conversations-w01-w08.ts', exportName: 'CONVERSATIONS_W01_W08' },
  { start: 9, end: 16, file: 'conversations-w09-w16.ts', exportName: 'CONVERSATIONS_W09_W16' },
  { start: 17, end: 24, file: 'conversations-w17-w24.ts', exportName: 'CONVERSATIONS_W17_W24' },
  { start: 25, end: 32, file: 'conversations-w25-w32.ts', exportName: 'CONVERSATIONS_W25_W32' },
  { start: 33, end: 41, file: 'conversations-w33-w41.ts', exportName: 'CONVERSATIONS_W33_W41' },
  { start: 42, end: 53, file: 'conversations-w42-w53.ts', exportName: 'CONVERSATIONS_W42_W53' },
]

const FLASHCARD_GROUPS = [
  { start: 1, end: 8, file: 'flashcards-w01-w08.ts', exportName: 'FLASHCARDS_W01_W08' },
  { start: 9, end: 16, file: 'flashcards-w09-w16.ts', exportName: 'FLASHCARDS_W09_W16' },
  { start: 17, end: 24, file: 'flashcards-w17-w24.ts', exportName: 'FLASHCARDS_W17_W24' },
  { start: 25, end: 32, file: 'flashcards-w25-w32.ts', exportName: 'FLASHCARDS_W25_W32' },
  { start: 33, end: 41, file: 'flashcards-w33-w41.ts', exportName: 'FLASHCARDS_W33_W41' },
  { start: 42, end: 53, file: 'flashcards-w42-w53.ts', exportName: 'FLASHCARDS_W42_W53' },
]

const QUESTION_BLUEPRINTS = [
  {
    question: 'Think of a recent time when "{term1En}" became important in your life. What was happening, and what did you do?',
    chineseHint: '先交代最近的一個真實情境，再說事情為什麼跟「{term1Zh}」有關，最後補一句你怎麼做。',
    structureTip: 'Try: A recent time this came up was... / It became important because... / So I decided to...',
  },
  {
    question: 'In "{title}", which feels harder for you: "{term1En}" or "{term2En}"? Explain with one short example.',
    chineseHint: '可以先選出對你比較難的一個點，再補一個短例子；如果願意，也可以順帶比較另一個點。',
    structureTip: 'Try: The harder one for me is... / For example,... / The easier side is...',
  },
  {
    question: 'A friend wants help with "{title}". What practical advice would you give first?',
    chineseHint: '把自己想成真的在給朋友建議，先說第一個最實用的做法，再解釋為什麼。',
    structureTip: 'Try: The first thing I would suggest is... / It helps because... / I would tell them to...',
  },
  {
    question: 'How does "{term1En}" show up in your routine right now? Is it helping or causing problems?',
    chineseHint: '想一想「{term1Zh}」現在怎麼出現在你的生活裡，再說它帶來幫助還是壓力。',
    structureTip: 'Try: Right now, this shows up when... / It helps me by... / The hard part is...',
  },
  {
    question: 'What has experience taught you about "{title}" that you did not understand before?',
    chineseHint: '可以先說你以前怎麼想，再說後來因為經驗改變了什麼看法。',
    structureTip: 'Try: I used to think... / But over time I realized... / Now I see that...',
  },
  {
    question: 'Describe a situation where you had to balance "{term1En}" and "{term2En}". What choice did you make?',
    chineseHint: '先說兩件事情拉扯的情境，再說你最後怎麼選，以及那個選擇帶來什麼結果。',
    structureTip: 'Try: I had to choose between... and... / I ended up... / Looking back,...',
  },
  {
    question: 'Use the phrase "{term1En}" in a short story from your real life. What happened?',
    chineseHint: '把今天學到的說法「{term1Zh}」放進你自己的小故事裡，重點是自然，不用講得很長。',
    structureTip: 'Try: One time, I had to... / That was a moment of... / Since then,...',
  },
  {
    question: 'What is one small step that would help you improve in "{title}" this week?',
    chineseHint: '不要想太大，先說一個這週真的做得到的小步驟，再補原因。',
    structureTip: 'Try: One small step I can take is... / It is realistic because... / I hope it will...',
  },
  {
    question: 'What do people often misunderstand about "{title}"? What would you say instead?',
    chineseHint: '可以先說常見的誤解，再用自己的話補上一個比較貼近真實的看法。',
    structureTip: 'Try: People often assume that... / But I think... / A better way to see it is...',
  },
  {
    question: 'If you only had thirty seconds, how would you explain why "{title}" matters in daily life?',
    chineseHint: '想像你只有很短的時間，要用簡單英文把這件事講清楚，重點放在日常例子。',
    structureTip: 'Try: This matters because... / You can see it when... / A simple example is...',
  },
  {
    question: 'What would progress look like for you in "{title}" over the next month?',
    chineseHint: '先說你覺得什麼樣的變化算進步，再說你會怎麼看出來。',
    structureTip: 'Try: For me, progress would look like... / I would notice it when... / That would matter because...',
  },
  {
    question: 'How is your approach to "{title}" different now from a few years ago?',
    chineseHint: '把過去和現在做個簡單對比，說出你最大的改變是什麼。',
    structureTip: 'Try: A few years ago, I... / Now I... / The biggest change is...',
  },
  {
    question: 'Where do you draw the line when it comes to "{title}"?',
    chineseHint: '這題可以談原則或界線，說說你通常會在哪裡停下來、拒絕，或特別注意。',
    structureTip: 'Try: I am usually okay with... / But I draw the line when... / That matters to me because...',
  },
  {
    question: 'When does "{title}" feel energizing, and when does it feel draining for you?',
    chineseHint: '這題可以從兩面來說：什麼時候你會覺得有力量，什麼時候又會覺得很累。',
    structureTip: 'Try: It feels energizing when... / It feels draining when... / The difference is...',
  },
  {
    question: 'If someone started talking about "{title}" with you, what would be your natural first response?',
    chineseHint: '想像在真實對話裡別人先提起這個主題，你第一句最自然會怎麼接。',
    structureTip: 'Try: My first reaction would be... / I would probably mention... / Then I would add...',
  },
  {
    question: 'Tell a short personal story that includes both "{term1En}" and "{term2En}".',
    chineseHint: '試著把「{term1Zh}」和「{term2Zh}」一起放進同一個例子裡，讓答案更像真實口說。',
    structureTip: 'Try: One situation that fits both ideas was... / First,... / Then...',
  },
  {
    question: 'What is the most common challenge you face with "{title}", and how do you usually handle it?',
    chineseHint: '先講最常碰到的難點，再說你平常怎麼應對，不一定要是完美做法。',
    structureTip: 'Try: The most common challenge for me is... / Usually, I handle it by... / What still feels hard is...',
  },
  {
    question: 'What would you tell your younger self about "{title}" now?',
    chineseHint: '把自己想成在對以前的自己說話，內容可以是提醒、安慰，或一個更成熟的理解。',
    structureTip: 'Try: I would tell my younger self... / I did not understand then that... / What I know now is...',
  },
  {
    question: 'What usually tells you that it is time to change something about "{title}"?',
    chineseHint: '可以說一個你會注意到的訊號，像是情緒、結果，或生活裡某個反覆出現的小細節。',
    structureTip: 'Try: I know it is time to change when... / One sign is... / After that, I usually...',
  },
  {
    question: 'How would you explain "{title}" to someone who has never really thought about it before?',
    chineseHint: '把對方想成完全沒想過這件事的人，用簡單、清楚的方式慢慢帶他進來。',
    structureTip: 'Try: I would start by saying... / A simple way to explain it is... / In everyday life,...',
  },
]

function expectedWeekLength(weekNumber) {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''))
}

function pickBySeed(seed, items) {
  return items[Math.abs(seed) % items.length]
}

function hashString(value) {
  let hash = 0
  for (const char of String(value)) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647
  }
  return hash
}

function tokenizeForRanking(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function rankTermsForEpisode(episode, terms) {
  const titleTokens = new Set(tokenizeForRanking(`${episode.title} ${buildFocusPhrase(episode.title)}`))
  return terms
    .map((term, index) => ({
      term,
      index,
      score: tokenizeForRanking(term.en).reduce((total, token) => total + (titleTokens.has(token) ? 2 : 0), 0),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .map((entry) => entry.term)
}

function uniqueTerms(items, options = {}) {
  const seenEn = new Set()
  const seenZh = new Set()
  const result = []
  for (const item of items) {
    const enKey = String(item.en || '').toLowerCase()
    const zhKey = String(item.zh || '').trim()
    if (!enKey) continue
    if (seenEn.has(enKey)) continue
    if (options.dedupeChinese && zhKey && seenZh.has(zhKey)) continue
    seenEn.add(enKey)
    if (options.dedupeChinese && zhKey) seenZh.add(zhKey)
    result.push(item)
  }
  return result
}

function isQuestionFriendlyTerm(term) {
  const tokenCount = tokenizeForRanking(term.en).length
  return tokenCount >= 1
    && tokenCount <= 4
    && !/[;:：；]/.test(String(term.zh || ''))
    && !/\b(science|theory|psychology|philosophy|framework|model|system|landmark|globalization|triage|catastrophize)\b/i.test(String(term.en || ''))
}

function selectQuestionTerms(terms, count = 4) {
  const selected = []
  const usedEn = new Set()
  const usedZh = new Set()

  for (const term of terms) {
    const enKey = String(term.en || '').toLowerCase()
    const zhKey = String(term.zh || '').trim()
    if (!enKey || usedEn.has(enKey) || (zhKey && usedZh.has(zhKey))) continue
    selected.push(term)
    usedEn.add(enKey)
    if (zhKey) usedZh.add(zhKey)
    if (selected.length >= count) return selected
  }

  for (const term of terms) {
    const enKey = String(term.en || '').toLowerCase()
    if (!enKey || usedEn.has(enKey)) continue
    selected.push(term)
    usedEn.add(enKey)
    if (selected.length >= count) return selected
  }

  while (selected.length < count && terms.length > 0) {
    selected.push(terms[selected.length % terms.length])
  }

  return selected
}

function stripHtml(value) {
  return String(value).replace(/<[^>]+>/g, ' ')
}

function countWords(value) {
  return stripHtml(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length
}

function loadExportArray(filePath, exportName) {
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
  return ctx.module.exports[exportName] ?? []
}

function loadEpisodes() {
  const dir = path.join(ROOT, 'content', 'episodes')
  const files = fs.readdirSync(dir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()
  return files.flatMap((fileName) => {
    const weekNumber = Number(fileName.match(/\d+/)[0])
    const exportName = `WEEK_${String(weekNumber).padStart(2, '0')}`
    return loadExportArray(path.join(dir, fileName), exportName)
  })
}

function getEpisodeTerms(episode) {
  const fromKeyPhrases = (episode.keyPhrases || [])
    .filter((item) => item && item.en && item.zh)
    .map((item) => ({
      en: item.en,
      zh: item.zh,
      example: item.example,
    }))
  const fromThemeBank = pickEpisodeTerms(episode).map((item) => ({
    en: item.en,
    zh: item.zh,
    example: '',
  }))

  return uniqueTerms(rankTermsForEpisode(episode, fromKeyPhrases.concat(fromThemeBank)), { dedupeChinese: true }).slice(0, 8)
}

function getQuestionTerms(episode) {
  const fromThemeBank = pickEpisodeTerms(episode).map((item) => ({
    en: item.en,
    zh: item.zh,
    example: '',
  }))
  const fromKeyPhrases = (episode.keyPhrases || [])
    .filter((item) => item && item.en && item.zh)
    .map((item) => ({
      en: item.en,
      zh: item.zh,
      example: item.example,
    }))
    .filter(isQuestionFriendlyTerm)

  return uniqueTerms(rankTermsForEpisode(episode, fromThemeBank.concat(fromKeyPhrases)), { dedupeChinese: true }).slice(0, 8)
}

function buildContext(episode) {
  const terms = getEpisodeTerms(episode)
  const focus = buildFocusPhrase(episode.title) || episode.title
  const seed = episode.weekNumber * 41 + episode.dayOfWeek * 17
  const titleHash = hashString(`${episode.title}|${focus}|W${episode.weekNumber}D${episode.dayOfWeek}`)
  const context = {
    seed,
    titleHash,
    title: episode.title,
    theme: episode.theme,
    focus,
    terms,
  }

  terms.forEach((term, index) => {
    const slot = index + 1
    context[`term${slot}En`] = term.en
    context[`term${slot}Zh`] = term.zh
  })

  return context
}

function findExampleLine(episode, term) {
  const lowerTerm = String(term).toLowerCase()
  const matches = episode.parts
    .flatMap((part) => part.lines || [])
    .filter((line) => String(line.en || '').toLowerCase().includes(lowerTerm))

  return matches.find((line) => line.speaker === 'a' && !/[?？]$/.test(String(line.en || '').trim()))
    || matches.find((line) => !/[?？]$/.test(String(line.en || '').trim()))
    || matches[0]
}

function buildFallbackExample(term, episode, seed) {
  return fill(pickBySeed(seed, [
    '{term} became easier to talk about once she connected it to one real moment from her week.',
    'He used {term} to explain what changed, why it mattered, and what he decided to do next.',
    'Talking about {term} helped her move from a vague feeling to a more specific explanation.',
  ]), {
    term,
    title: episode.title,
  })
}

function buildArticleParagraphs(context, variantOffset = 0) {
  const pairs = [
    pickBySeed(context.seed + context.titleHash + variantOffset * 11 + 1, [
      {
        en: '"{title}" works well as a speaking topic because it is rooted in everyday choices. Learners can connect it to {term1En}, {term2En}, and the small details that make real life easier to describe.',
        zh: '「{title}」這篇文章很適合拿來練口說，因為它跟真實生活裡的選擇緊緊連在一起。學習者可以從「{term1Zh}」、「{term2Zh}」以及那些讓日常變清楚的小細節開始說。',
      },
      {
        en: 'This article uses "{title}" to explore a part of daily life that many learners already know from experience. Once you talk about {term1En} and {term2En}, the subject becomes clearer and more personal.',
        zh: '這篇文章透過「{title}」去談一個很多人都很熟悉的生活切面。當學習者開始說到「{term1Zh}」和「{term2Zh}」時，整個內容就會變得更清楚，也更貼近自己。',
      },
      {
        en: 'At first, "{title}" may sound narrow. In practice, it opens the door to everyday English about {term1En}, {term2En}, and the routines that shape real behavior.',
        zh: '一開始看到「{title}」時，這個主題看起來好像很窄，但實際上它會打開很多日常英文的入口，例如「{term1Zh}」、「{term2Zh}」，以及那些真正塑造行為的日常習慣。',
      },
    ]),
    pickBySeed(context.seed + context.titleHash + variantOffset * 17 + 2, [
      {
        en: 'The interesting part is that people usually understand the basic idea already. What becomes harder is dealing with {term3En} or {term4En} when time is short, energy is low, or emotions are involved.',
        zh: '有趣的是，大多數人其實本來就懂這個主題的基本意思。真正變難的，是當時間很短、精力很低，或情緒已經捲進來時，要怎麼面對「{term3Zh}」和「{term4Zh}」。',
      },
      {
        en: 'What makes the topic worth discussing is not the simple version but the messy version. In real life, {term3En} and {term4En} often show up together, and that is where people need better language.',
        zh: '這個主題真正值得談的，不是它簡單的版本，而是它混亂的版本。因為在真實生活裡，「{term3Zh}」和「{term4Zh}」常常會一起出現，而那正是人最需要更好語言的地方。',
      },
      {
        en: 'Many learners can explain the idea in theory, but daily life tests it through {term3En} and {term4En}. That is why specific examples matter so much here.',
        zh: '很多學習者在理論上都講得出來，可是真正的日常會透過「{term3Zh}」和「{term4Zh}」來考驗它。也因此，具體例子在這裡特別重要。',
      },
    ]),
    pickBySeed(context.seed + context.titleHash + variantOffset * 23 + 3, [
      {
        en: 'For speaking practice, phrases like {term5En} and {term6En} are useful because they move the conversation from opinion to description. Instead of saying something is simply good or bad, learners can explain what changed, what felt difficult, and what helped.',
        zh: '如果是口說練習，「{term5Zh}」和「{term6Zh}」這類說法特別有用，因為它們會把對話從意見推進到描述。學習者不必只說好或不好，而是能進一步說出發生了什麼、哪裡變難，以及什麼真的有幫助。',
      },
      {
        en: 'Language gets stronger when the speaker can name what is happening clearly. Terms such as {term5En} and {term6En} give learners more exact tools for talking about pressure, habit, and change.',
        zh: '當說話的人能把正在發生的事清楚命名，語言就會變得更有力量。像「{term5Zh}」和「{term6Zh}」這樣的詞，會給學習者更精準的工具去談壓力、習慣和改變。',
      },
      {
        en: 'These phrases matter because they give shape to an everyday situation. With {term5En} and {term6En}, a learner can sound more specific, more grounded, and easier to understand.',
        zh: '這些說法之所以重要，是因為它們能讓一個日常情境長出形狀。有了「{term5Zh}」和「{term6Zh}」，學習者會講得更具體、更踏實，也更容易被理解。',
      },
    ]),
    pickBySeed(context.seed + context.titleHash + variantOffset * 29 + 4, [
      {
        en: 'A strong response on this topic usually includes one real situation, one clear pressure point, and one practical next step. That makes the English sound more believable and gives the listener a clearer picture.',
        zh: '在這個主題上，一個好的回應通常會包含一個真實情境、一個清楚的壓力點，以及一個實際的下一步。這樣的英文會更可信，也更容易讓聽的人看見完整畫面。',
      },
      {
        en: 'The most useful answers are rarely dramatic. They are concrete, honest, and connected to something the speaker has actually lived through.',
        zh: '最有用的回答通常不會很戲劇化。它們往往更具體、更誠實，也更緊密地連到說話者真的經歷過的事情。',
      },
      {
        en: 'This is also a good reminder that better speaking is not only about more vocabulary. It is about choosing details that make the idea real for the listener.',
        zh: '這也是一個很好的提醒：更好的口說不只是靠更多字彙，還包括你能不能選出那些會讓聽者覺得事情很真實的細節。',
      },
    ]),
    pickBySeed(context.seed + context.titleHash + variantOffset * 31 + 5, [
      {
        en: 'That is why "{title}" belongs in an English app. It turns a daily-life subject into material for reflection, vocabulary building, and more natural conversation.',
        zh: '這也是為什麼「{title}」很適合放進英語學習應用程式。它能把一個日常話題變成反思、字彙累積和自然對話的材料。',
      },
      {
        en: 'In the end, the value of this topic is practical. It helps learners talk about their own decisions with language that feels precise, useful, and alive.',
        zh: '說到底，「{title}」這個主題的價值是很實際的。它能幫助學習者用精準、實用而且有生命感的語言，去談自己的選擇。',
      },
      {
        en: 'For learners, that is the real takeaway: when the language becomes more specific, the conversation becomes more natural too.',
        zh: '對學習者來說，「{title}」真正帶出的重點就在這裡：當語言變得更具體，對話也會跟著變得更自然。',
      },
    ]),
  ]

  return pairs.map((pair) => ({
    en: fill(pair.en, context),
    zh: fill(pair.zh, context),
  }))
}

function buildArticle(episode, usedChineseTexts = new Set()) {
  const context = buildContext(episode)
  let articleText = ''
  let articleTextZh = ''
  let paragraphs = []

  for (let variantOffset = 0; variantOffset < 15; variantOffset += 1) {
    const candidateParagraphs = buildArticleParagraphs(context, variantOffset)
    const candidateText = candidateParagraphs.map((paragraph) => `<p>${paragraph.en}</p>`).join('')
    const candidateTextZh = candidateParagraphs.map((paragraph) => `<p>${paragraph.zh}</p>`).join('')
    if (usedChineseTexts.has(candidateTextZh)) continue

    paragraphs = candidateParagraphs
    articleText = candidateText
    articleTextZh = candidateTextZh
    usedChineseTexts.add(candidateTextZh)
    break
  }

  if (!paragraphs.length) {
    paragraphs = buildArticleParagraphs(context, 0)
    articleText = paragraphs.map((paragraph) => `<p>${paragraph.en}</p>`).join('')
    articleTextZh = paragraphs.map((paragraph) => `<p>${paragraph.zh}</p>`).join('')
    usedChineseTexts.add(articleTextZh)
  }

  const vocabulary = context.terms.slice(0, 5).map((term, index) => {
    const matchingLine = findExampleLine(episode, term.en)
    return {
      word: term.en,
      definition: term.zh,
      example: term.example || matchingLine?.en || buildFallbackExample(term.en, episode, context.seed + index),
    }
  })

  return {
    topic: episode.theme,
    title: episode.title,
    wordCount: countWords(articleText),
    text: articleText,
    textZh: articleTextZh,
    vocabulary,
  }
}

function buildQuestionContext(episode) {
  const terms = getQuestionTerms(episode)
  const focus = buildFocusPhrase(episode.title) || episode.title
  const seed = episode.weekNumber * 41 + episode.dayOfWeek * 17
  const titleHash = hashString(`${episode.title}|${focus}|W${episode.weekNumber}D${episode.dayOfWeek}`)
  const [term1, term2, term3, term4] = selectQuestionTerms(terms, 4)

  return {
    seed,
    titleHash,
    title: episode.title,
    theme: episode.theme,
    focus,
    terms,
    term1En: term1?.en || '',
    term1Zh: term1?.zh || '',
    term2En: term2?.en || term1?.en || '',
    term2Zh: term2?.zh || term1?.zh || '',
    term3En: term3?.en || term1?.en || '',
    term3Zh: term3?.zh || term1?.zh || '',
    term4En: term4?.en || term2?.en || term1?.en || '',
    term4Zh: term4?.zh || term2?.zh || term1?.zh || '',
  }
}

function chooseQuestionBlueprint(episode, context) {
  const startIndex = (Math.abs(hashString(episode.theme)) + episode.weekNumber + (episode.dayOfWeek - 1) * 3) % QUESTION_BLUEPRINTS.length
  const abstractTitle = /science|psychology|philosophy|theory/i.test(episode.title)

  for (let offset = 0; offset < QUESTION_BLUEPRINTS.length; offset += 1) {
    const blueprint = QUESTION_BLUEPRINTS[(startIndex + offset) % QUESTION_BLUEPRINTS.length]
    if (!abstractTitle) return blueprint
    if (/\{term\dEn\}/.test(blueprint.question)) return blueprint
  }

  return QUESTION_BLUEPRINTS[startIndex]
}

function pickUnique(items, limit, keyFn, mapper, initialUsed = new Set()) {
  const results = []
  const used = new Set(initialUsed)
  for (const item of items) {
    const key = keyFn(item)
    if (used.has(key)) continue
    used.add(key)
    results.push(mapper(item, results.length))
    if (results.length >= limit) break
  }

  return { results, used }
}

function buildQuestions(episodes) {
  return episodes.map((episode) => {
    const context = buildQuestionContext(episode)
    const template = chooseQuestionBlueprint(episode, context)

    return {
      weekNumber: episode.weekNumber,
      theme: episode.theme,
      day: DAY_LABELS[episode.dayOfWeek - 1],
      question: fill(template.question, context),
      chineseHint: fill(template.chineseHint, context),
      structureTip: fill(template.structureTip, context),
    }
  })
}

function buildFlashcardsByWeek(episodes, articlesByWeek) {
  const result = new Map()
  const episodesByWeek = new Map()

  for (const episode of episodes) {
    const bucket = episodesByWeek.get(episode.weekNumber) ?? []
    bucket.push(episode)
    episodesByWeek.set(episode.weekNumber, bucket)
  }

  for (let week = 1; week <= 53; week += 1) {
    const weekEpisodes = (episodesByWeek.get(week) ?? []).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    const episodeItems = weekEpisodes.flatMap((episode) =>
      getEpisodeTerms(episode).map((term) => ({ episode, term }))
    )

    const listenSelection = pickUnique(
      episodeItems,
      6,
      (item) => item.term.en.toLowerCase(),
      (item, index) => {
        const matchingLine = findExampleLine(item.episode, item.term.en)
        return {
          id: `w${week}-listen-${String(index + 1).padStart(2, '0')}`,
          source: 'listen',
          weekNumber: week,
          english: item.term.en,
          chinese: item.term.zh,
          exampleSentence: matchingLine?.en || item.term.example || buildFallbackExample(item.term.en, item.episode, week + index),
        }
      },
    )

    const articleItems = (articlesByWeek.get(week) ?? []).flatMap((article) =>
      (article.vocabulary || []).map((vocab) => ({ article, vocab }))
    )

    const speakSelection = pickUnique(
      articleItems,
      5,
      (item) => item.vocab.word.toLowerCase(),
      (item, index) => ({
        id: `w${week}-speak-${String(index + 1).padStart(2, '0')}`,
        source: 'speak',
        weekNumber: week,
        english: item.vocab.word,
        chinese: item.vocab.definition,
        exampleSentence: item.vocab.example,
      }),
    )

    result.set(week, listenSelection.results.concat(speakSelection.results))
  }

  return result
}

function serializeQuestion(item) {
  return `  {\n    weekNumber: ${item.weekNumber},\n    theme: '${escapeSingle(item.theme)}',\n    day: '${escapeSingle(item.day)}',\n    question: '${escapeSingle(item.question)}',\n    chineseHint: '${escapeSingle(item.chineseHint)}',\n    structureTip: '${escapeSingle(item.structureTip)}',\n  }`
}

function serializeQuestionFile(group, items, includeInterface) {
  const header = includeInterface
    ? `export interface ConversationQuestion {\n  weekNumber: number\n  theme: string\n  day: string\n  question: string\n  chineseHint: string\n  structureTip: string\n}\n\n`
    : `import { ConversationQuestion } from './conversations-w01-w08'\n\n`

  return `${header}export const ${group.exportName}: ConversationQuestion[] = [\n${items.map(serializeQuestion).join(',\n')}\n]\n`
}

function serializeFlashcard(card) {
  return `  { id: '${escapeSingle(card.id)}', source: '${card.source}', weekNumber: ${card.weekNumber}, english: '${escapeSingle(card.english)}', chinese: '${escapeSingle(card.chinese)}', exampleSentence: '${escapeSingle(card.exampleSentence)}' }`
}

function serializeFlashcardFile(group, items, includeInterface) {
  const header = includeInterface
    ? `export interface Flashcard {\n  id: string\n  source: 'listen' | 'speak'\n  weekNumber: number\n  english: string\n  chinese: string\n  exampleSentence: string\n}\n\n`
    : `import { Flashcard } from './flashcards-w01-w08'\n\n`

  return `${header}export const ${group.exportName}: Flashcard[] = [\n${items.map(serializeFlashcard).join(',\n')}\n]\n`
}

function serializeArticle(article) {
  const vocabulary = article.vocabulary
    .map((item) => `      { word: '${escapeSingle(item.word)}', definition: '${escapeSingle(item.definition)}', example: '${escapeSingle(item.example)}' }`)
    .join(',\n')

  return `  {\n    topic: '${escapeSingle(article.topic)}',\n    title: '${escapeSingle(article.title)}',\n    wordCount: ${article.wordCount},\n    text: '${escapeSingle(article.text)}',\n    textZh: '${escapeSingle(article.textZh)}',\n    vocabulary: [\n${vocabulary}\n    ],\n  }`
}

function serializeArticleFile(weekNumber, items, includeInterface) {
  const header = includeInterface
    ? `export interface SpeakArticle {\n  topic: string\n  title: string\n  wordCount: number\n  text: string\n  textZh: string\n  vocabulary: { word: string; definition: string; example: string }[]\n}\n\n`
    : `import { SpeakArticle } from './articles-w01'\n\n`

  return `${header}export const W${weekNumber}_ARTICLES: SpeakArticle[] = [\n${items.map(serializeArticle).join(',\n')}\n]\n`
}

function main() {
  const shouldWriteQuestions = process.argv.includes('--questions')
  const episodes = loadEpisodes().sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber
    return a.dayOfWeek - b.dayOfWeek
  })

  const articlesByWeek = new Map()
  const usedChineseArticleTexts = new Set()
  for (const episode of episodes) {
    const bucket = articlesByWeek.get(episode.weekNumber) ?? []
    bucket.push(buildArticle(episode, usedChineseArticleTexts))
    articlesByWeek.set(episode.weekNumber, bucket)
  }

  const flashcardsByWeek = buildFlashcardsByWeek(episodes, articlesByWeek)

  if (shouldWriteQuestions) {
    const questions = buildQuestions(episodes)
    for (const group of QUESTION_GROUPS) {
      const grouped = questions.filter((item) => item.weekNumber >= group.start && item.weekNumber <= group.end)
      const content = serializeQuestionFile(group, grouped, group.start === 1)
      fs.writeFileSync(path.join(ROOT, 'content', 'questions', group.file), content)
    }
  }

  for (const group of FLASHCARD_GROUPS) {
    const grouped = []
    for (let week = group.start; week <= group.end; week += 1) {
      grouped.push(...(flashcardsByWeek.get(week) ?? []))
    }
    const content = serializeFlashcardFile(group, grouped, group.start === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'flashcards', group.file), content)
  }

  for (let week = 1; week <= 53; week += 1) {
    const padWeek = String(week).padStart(2, '0')
    const content = serializeArticleFile(week, articlesByWeek.get(week) ?? [], week === 1)
    fs.writeFileSync(path.join(ROOT, 'content', 'articles', `articles-w${padWeek}.ts`), content)
  }

  console.log(`Regenerated articles and flashcards for ${episodes.length} episodes${shouldWriteQuestions ? ', and refreshed questions' : ''}`)
}

if (require.main === module) {
  main()
}

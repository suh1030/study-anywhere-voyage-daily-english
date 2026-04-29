import {
  canonicalArticleWordCount,
  formatEpisodeId,
  getEpisodeClosingLine,
  loadArticleWeeks,
  loadCurriculum,
  loadEpisodeWeeks,
  loadFlashcards,
  loadQuestionEntries,
  normalizeClosingLine,
  normalizeWhitespace,
  sentenceWordCount,
} from './lib'

export interface ArticlesImportCheckResult {
  totalFiles: number
  successCount: number
  failureCount: number
  failures: Array<{
    weekNumber: number
    fileName: string
    exportName: string
    error: string
  }>
  files: Array<{
    weekNumber: number
    fileName: string
    exportName: string
    expectedCount: number
    actualCount: number
    imported: boolean
    error?: string
  }>
  passed: boolean
}

export interface ArticleWordCountRow {
  weekNumber: number
  dayOfWeek: number
  dateKey: string
  title: string
  declared: number
  actual: number
  diff: number
}

export interface ArticleWordCountCheckResult {
  totalArticlesExpected: number
  countedArticles: number
  importFailures: Array<{
    weekNumber: number
    fileName: string
    error: string
  }>
  rows: ArticleWordCountRow[]
  outliers: ArticleWordCountRow[]
  passed: boolean
}

export interface EpisodeVocabRow {
  episodeId: string
  weekNumber: number
  dayOfWeek: number
  title: string
  vocabCount: number
}

export interface EpisodeVocabCheckResult {
  totalEpisodes: number
  rows: EpisodeVocabRow[]
  lowCountEpisodes: EpisodeVocabRow[]
  passed: boolean
}

export interface EpisodeClosingGroup {
  normalized: string
  closingLine: string
  count: number
  episodeIds: string[]
  titles: string[]
  whitelisted: boolean
}

export interface EpisodeClosingCheckResult {
  totalEpisodes: number
  duplicateGroups: EpisodeClosingGroup[]
  effectiveDuplicateGroups: EpisodeClosingGroup[]
  whitelist: string[]
  passed: boolean
}

export interface FlashcardExampleRow {
  id: string
  source: string
  weekNumber: number
  english: string
  exampleSentence: string
  wordCount: number
}

export interface FlashcardExampleCheckResult {
  totalFlashcards: number
  minimumWords: number
  rows: FlashcardExampleRow[]
  shortExamples: FlashcardExampleRow[]
  passed: boolean
}

export interface ThemeMismatch {
  type: 'episode' | 'question'
  weekNumber: number
  dayOfWeek: number
  expectedTheme: string
  actualTheme: string
  titleOrQuestion: string
}

export interface ThemeAlignmentCheckResult {
  curriculumWeeks: number
  episodesChecked: number
  questionsChecked: number
  mismatches: ThemeMismatch[]
  passed: boolean
}

export interface ContentLanguageIssue {
  source: 'flashcard' | 'episode_key_phrase' | 'episode_line' | 'question'
  weekNumber: number
  dayOfWeek?: number
  titleOrId: string
  english: string
  example: string
  issue: 'banned_phrase' | 'pronoun_mismatch' | 'retired_inline_vocab' | 'known_grammar_error' | 'localization_term'
}

export interface ContentLanguageQualityCheckResult {
  totalFlashcards: number
  totalEpisodeKeyPhrases: number
  totalQuestions: number
  issues: ContentLanguageIssue[]
  passed: boolean
}

const BANNED_CONTENT_PHRASES = new Set([
  "photographer's moment",
  'return to later',
  'lose contact with yourself',
  'keep company with yourself',
  'language-shaped self',
  'inside-the-circle language',
  'make life legible',
  'slow thought space',
  'find language for yourself',
  'accessible self',
  'social distance through language',
  'self-story frame',
  'emotional architecture',
  'body knew first',
  'slow adjustment growth',
  'small internal progress',
  'life becoming flat',
  'carry-worthy lesson',
  'design around reality',
  'release with respect',
  'activation energy',
  'bystander effect',
  'chronotype',
  'deindividuation',
  'ego depletion',
  'enclothed cognition',
  'hypothesis',
  'individual variation',
  'lab-grown meat',
  'misattributed',
  'proust phenomenon',
  'scarcity effect',
  'spotlight effect',
  'zeigarnik effect',
  'value sorting',
  'social inheritance',
  'certainty crack',
  'reflection arc',
  'completed circle',
  'survival learning',
  'release decision',
  'forward intention',
  'emotional weather of a relationship',
  'your body knew before you did',
  'energy evidence',
  'quiet progress',
  'threshold moment',
  'quiet evidence',
  'identity echo',
  'inner reorientation',
  'outgrow a season',
  'weekly anchor',
])

const BANNED_EPISODE_LINE_PATTERNS = [
  /\bit resizes the self\b/i,
  /\bjoint problem-solving, not public theater\b/i,
  /\bmovement finally gave it somewhere to land\b/i,
  /\breorienting the self\b/i,
]

const PRONOUN_MISMATCH_PATTERNS = [
  /\bhim\b[^.?!]*\byourself\b/i,
  /\bher\b[^.?!]*\byourself\b/i,
  /\bhe\b[^.?!]*\byourself\b/i,
  /\bshe\b[^.?!]*\byourself\b/i,
]

const KNOWN_GRAMMAR_ERROR_PATTERNS = [
  /\bplan still support\b/i,
]

const BANNED_LOCALIZATION_TERMS = [
  '信息',
  '數據',
  '数据',
  '視頻',
  '视频',
  '網絡',
  '网络',
  '質量',
  '质量',
  '默認',
  '默认',
  '智能手機',
  '智能手机',
  '程序',
  '項目',
  '项目',
  '人工智能',
  '实时',
  '文本',
  '用戶',
  '用户',
]

function findBannedLocalizationTerm(value: string): string | undefined {
  return BANNED_LOCALIZATION_TERMS.find((term) => value.includes(term))
}

export async function checkArticlesImport(): Promise<ArticlesImportCheckResult> {
  const weeks = await loadArticleWeeks()
  const files = weeks.map((week) => ({
    weekNumber: week.weekNumber,
    fileName: week.fileName,
    exportName: week.exportName,
    expectedCount: week.expectedCount,
    actualCount: week.articles.length,
    imported: !week.error,
    error: week.error,
  }))

  const failures = files
    .filter((file) => !file.imported)
    .map((file) => ({
      weekNumber: file.weekNumber,
      fileName: file.fileName,
      exportName: file.exportName,
      error: file.error ?? 'Unknown import error',
    }))

  return {
    totalFiles: files.length,
    successCount: files.length - failures.length,
    failureCount: failures.length,
    failures,
    files,
    passed: failures.length === 0,
  }
}

export async function checkArticleWordCount(): Promise<ArticleWordCountCheckResult> {
  const weeks = await loadArticleWeeks()
  const importFailures = weeks
    .filter((week) => week.error)
    .map((week) => ({
      weekNumber: week.weekNumber,
      fileName: week.fileName,
      error: week.error ?? 'Unknown import error',
    }))

  const rows: ArticleWordCountRow[] = []

  for (const week of weeks) {
    if (week.error) continue

    week.articles.slice(0, week.expectedCount).forEach((article, index) => {
      const declared = Number(article?.wordCount ?? 0)
      const actual = canonicalArticleWordCount(String(article?.text ?? ''))
      rows.push({
        weekNumber: week.weekNumber,
        dayOfWeek: index + 1,
        dateKey: String(article?.dateKey ?? ''),
        title: String(article?.title ?? ''),
        declared,
        actual,
        diff: declared - actual,
      })
    })
  }

  const outliers = rows.filter((row) => Math.abs(row.diff) > 10)

  return {
    totalArticlesExpected: 365,
    countedArticles: rows.length,
    importFailures,
    rows,
    outliers,
    passed: importFailures.length === 0 && rows.length === 365 && outliers.length === 0,
  }
}

export async function checkEpisodeVocab(): Promise<EpisodeVocabCheckResult> {
  const weeks = await loadEpisodeWeeks()
  const rows: EpisodeVocabRow[] = []

  for (const week of weeks) {
    for (const episode of week.episodes) {
      const vocabCount = Array.isArray(episode?.keyPhrases) ? episode.keyPhrases.length : 0

      rows.push({
        episodeId: formatEpisodeId(episode.weekNumber, episode.dayOfWeek),
        weekNumber: episode.weekNumber,
        dayOfWeek: episode.dayOfWeek,
        title: String(episode?.title ?? ''),
        vocabCount,
      })
    }
  }

  const lowCountEpisodes = rows.filter((row) => row.vocabCount < 8)

  return {
    totalEpisodes: rows.length,
    rows,
    lowCountEpisodes,
    passed: lowCountEpisodes.length === 0 && rows.length === 365,
  }
}

export async function checkEpisodeClosingDupes(whitelist: string[] = []): Promise<EpisodeClosingCheckResult> {
  const whitelistSet = new Set(whitelist.map((item) => normalizeClosingLine(item)).filter(Boolean))
  const weeks = await loadEpisodeWeeks()
  const groups = new Map<string, EpisodeClosingGroup>()
  let totalEpisodes = 0

  for (const week of weeks) {
    for (const episode of week.episodes) {
      totalEpisodes += 1
      const closingLine = normalizeWhitespace(getEpisodeClosingLine(episode))
      const normalized = normalizeClosingLine(closingLine)
      if (!normalized) continue

      const existing = groups.get(normalized)
      if (existing) {
        existing.count += 1
        existing.episodeIds.push(formatEpisodeId(episode.weekNumber, episode.dayOfWeek))
        existing.titles.push(String(episode?.title ?? ''))
      } else {
        groups.set(normalized, {
          normalized,
          closingLine,
          count: 1,
          episodeIds: [formatEpisodeId(episode.weekNumber, episode.dayOfWeek)],
          titles: [String(episode?.title ?? '')],
          whitelisted: whitelistSet.has(normalized),
        })
      }
    }
  }

  const duplicateGroups = [...groups.values()]
    .filter((group) => group.count > 1)
    .sort((left, right) => right.count - left.count || left.normalized.localeCompare(right.normalized))
    .map((group) => ({
      ...group,
      whitelisted: whitelistSet.has(group.normalized),
    }))

  const effectiveDuplicateGroups = duplicateGroups.filter((group) => !group.whitelisted)

  return {
    totalEpisodes,
    duplicateGroups,
    effectiveDuplicateGroups,
    whitelist: [...whitelistSet],
    passed: totalEpisodes === 365 && effectiveDuplicateGroups.length === 0,
  }
}

export async function checkFlashcardExampleLength(minimumWords = 12): Promise<FlashcardExampleCheckResult> {
  const flashcards = await loadFlashcards()
  const rows = flashcards.map((card) => ({
    id: String(card?.id ?? ''),
    source: String(card?.source ?? ''),
    weekNumber: Number(card?.weekNumber ?? 0),
    english: String(card?.english ?? ''),
    exampleSentence: String(card?.exampleSentence ?? ''),
    wordCount: sentenceWordCount(String(card?.exampleSentence ?? '')),
  }))

  const shortExamples = rows.filter((row) => row.wordCount < minimumWords)

  return {
    totalFlashcards: rows.length,
    minimumWords,
    rows,
    shortExamples,
    passed: rows.length === 583 && shortExamples.length === 0,
  }
}

export async function checkThemeAlignment(): Promise<ThemeAlignmentCheckResult> {
  const curriculum = await loadCurriculum()
  const curriculumByWeek = new Map<number, string>(
    curriculum.map((week: any) => [Number(week.wn), String(week.theme)]),
  )
  const weeks = await loadEpisodeWeeks()
  const questions = await loadQuestionEntries()
  const mismatches: ThemeMismatch[] = []
  let episodesChecked = 0

  for (const week of weeks) {
    for (const episode of week.episodes) {
      episodesChecked += 1
      const expectedTheme = curriculumByWeek.get(Number(episode.weekNumber)) ?? ''
      const actualTheme = String(episode?.theme ?? '')
      if (expectedTheme !== actualTheme) {
        mismatches.push({
          type: 'episode',
          weekNumber: Number(episode.weekNumber),
          dayOfWeek: Number(episode.dayOfWeek),
          expectedTheme,
          actualTheme,
          titleOrQuestion: String(episode?.title ?? ''),
        })
      }
    }
  }

  for (const question of questions) {
    const weekNumber = Number(question?.weekNumber ?? 0)
    const dayOfWeek = Number(question?.day ?? question?.dayOfWeek ?? 0)
    const expectedTheme = curriculumByWeek.get(weekNumber) ?? ''
    const actualTheme = String(question?.theme ?? '')
    if (expectedTheme !== actualTheme) {
      mismatches.push({
        type: 'question',
        weekNumber,
        dayOfWeek,
        expectedTheme,
        actualTheme,
        titleOrQuestion: String(question?.question ?? ''),
      })
    }
  }

  return {
    curriculumWeeks: curriculum.length,
    episodesChecked,
    questionsChecked: questions.length,
    mismatches,
    passed: curriculum.length === 53 && episodesChecked === 365 && questions.length === 365 && mismatches.length === 0,
  }
}

export async function checkContentLanguageQuality(): Promise<ContentLanguageQualityCheckResult> {
  const [flashcards, episodeWeeks, questions] = await Promise.all([
    loadFlashcards(),
    loadEpisodeWeeks(),
    loadQuestionEntries(),
  ])
  const issues: ContentLanguageIssue[] = []

  flashcards.forEach((card: any) => {
    const english = String(card?.english ?? '').trim()
    const example = String(card?.exampleSentence ?? '').trim()
    const chinese = String(card?.chinese ?? '').trim()

    if (BANNED_CONTENT_PHRASES.has(english.toLowerCase())) {
      issues.push({
        source: 'flashcard',
        weekNumber: Number(card?.weekNumber ?? 0),
        titleOrId: String(card?.id ?? ''),
        english,
        example,
        issue: 'banned_phrase',
      })
    }

    if (PRONOUN_MISMATCH_PATTERNS.some((pattern) => pattern.test(example))) {
      issues.push({
        source: 'flashcard',
        weekNumber: Number(card?.weekNumber ?? 0),
        titleOrId: String(card?.id ?? ''),
        english,
        example,
        issue: 'pronoun_mismatch',
      })
    }

    if (KNOWN_GRAMMAR_ERROR_PATTERNS.some((pattern) => pattern.test(example))) {
      issues.push({
        source: 'flashcard',
        weekNumber: Number(card?.weekNumber ?? 0),
        titleOrId: String(card?.id ?? ''),
        english,
        example,
        issue: 'known_grammar_error',
      })
    }

    const localizationTerm = findBannedLocalizationTerm(chinese)
    if (localizationTerm) {
      issues.push({
        source: 'flashcard',
        weekNumber: Number(card?.weekNumber ?? 0),
        titleOrId: String(card?.id ?? ''),
        english: localizationTerm,
        example: chinese,
        issue: 'localization_term',
      })
    }
  })

  let totalEpisodeKeyPhrases = 0

  episodeWeeks.forEach((week) => {
    week.episodes.forEach((episode: any) => {
      const keyPhrases = Array.isArray(episode?.keyPhrases) ? episode.keyPhrases : []
      totalEpisodeKeyPhrases += keyPhrases.length

      keyPhrases.forEach((phrase: any) => {
        const english = String(phrase?.en ?? '').trim()
        const example = String(phrase?.example ?? '').trim()
        const zh = String(phrase?.zh ?? '').trim()

        if (BANNED_CONTENT_PHRASES.has(english.toLowerCase())) {
          issues.push({
            source: 'episode_key_phrase',
            weekNumber: Number(episode?.weekNumber ?? 0),
            dayOfWeek: Number(episode?.dayOfWeek ?? 0),
            titleOrId: String(episode?.title ?? ''),
            english,
            example,
            issue: 'banned_phrase',
          })
        }

        if (PRONOUN_MISMATCH_PATTERNS.some((pattern) => pattern.test(example))) {
          issues.push({
            source: 'episode_key_phrase',
            weekNumber: Number(episode?.weekNumber ?? 0),
            dayOfWeek: Number(episode?.dayOfWeek ?? 0),
            titleOrId: String(episode?.title ?? ''),
            english,
            example,
            issue: 'pronoun_mismatch',
          })
        }

        if (KNOWN_GRAMMAR_ERROR_PATTERNS.some((pattern) => pattern.test(example))) {
          issues.push({
            source: 'episode_key_phrase',
            weekNumber: Number(episode?.weekNumber ?? 0),
            dayOfWeek: Number(episode?.dayOfWeek ?? 0),
            titleOrId: String(episode?.title ?? ''),
            english,
            example,
            issue: 'known_grammar_error',
          })
        }

        const localizationTerm = findBannedLocalizationTerm(zh)
        if (localizationTerm) {
          issues.push({
            source: 'episode_key_phrase',
            weekNumber: Number(episode?.weekNumber ?? 0),
            dayOfWeek: Number(episode?.dayOfWeek ?? 0),
            titleOrId: String(episode?.title ?? ''),
            english: localizationTerm,
            example: zh,
            issue: 'localization_term',
          })
        }
      })

      ;(episode?.parts ?? []).forEach((part: any) => {
        ;(part?.lines ?? []).forEach((line: any) => {
          const englishLine = String(line?.en ?? line?.english ?? '')
          const localizationTerm = findBannedLocalizationTerm(String(line?.zh ?? line?.chinese ?? ''))
          if (localizationTerm) {
            issues.push({
              source: 'episode_line',
              weekNumber: Number(episode?.weekNumber ?? 0),
              dayOfWeek: Number(episode?.dayOfWeek ?? 0),
              titleOrId: String(episode?.title ?? ''),
              english: localizationTerm,
              example: String(line?.zh ?? line?.chinese ?? ''),
              issue: 'localization_term',
            })
          }

          if (BANNED_EPISODE_LINE_PATTERNS.some((pattern) => pattern.test(englishLine))) {
            issues.push({
              source: 'episode_line',
              weekNumber: Number(episode?.weekNumber ?? 0),
              dayOfWeek: Number(episode?.dayOfWeek ?? 0),
              titleOrId: String(episode?.title ?? ''),
              english: englishLine,
              example: '',
              issue: 'banned_phrase',
            })
          }

          if (!line?.vocab && !line?.vocabulary) return

          issues.push({
            source: 'episode_line',
            weekNumber: Number(episode?.weekNumber ?? 0),
            dayOfWeek: Number(episode?.dayOfWeek ?? 0),
            titleOrId: String(episode?.title ?? ''),
            english: String(line?.en ?? line?.english ?? ''),
            example: '',
            issue: 'retired_inline_vocab',
          })
        })
      })
    })
  })

  questions.forEach((question: any) => {
    const weekNumber = Number(question?.weekNumber ?? 0)
    const dayOfWeek = Number(question?.day ?? question?.dayOfWeek ?? 0)
    const fields = [
      String(question?.chineseHint ?? ''),
      String(question?.hintZh ?? ''),
      String(question?.hint_zh ?? ''),
    ].filter(Boolean)

    fields.forEach((field) => {
      const localizationTerm = findBannedLocalizationTerm(field)
      if (!localizationTerm) return

      issues.push({
        source: 'question',
        weekNumber,
        dayOfWeek,
        titleOrId: String(question?.question ?? ''),
        english: localizationTerm,
        example: field,
        issue: 'localization_term',
      })
    })
  })

  return {
    totalFlashcards: flashcards.length,
    totalEpisodeKeyPhrases,
    totalQuestions: questions.length,
    issues,
    passed: flashcards.length === 583 && issues.length === 0,
  }
}

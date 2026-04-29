import * as fs from 'fs/promises'
import {
  checkContentLanguageQuality,
  checkEpisodeClosingDupes,
  checkEpisodeVocab,
  checkFlashcardExampleLength,
  checkThemeAlignment,
} from './checks'
import { getArgValue, hasFlag, writeReport } from './lib'

async function readWhitelist(whitelistPath: string | undefined): Promise<string[]> {
  if (!whitelistPath) return []

  try {
    const raw = await fs.readFile(whitelistPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : []
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

async function main() {
  const outputPath = getArgValue('--output')
  const whitelistPath = getArgValue('--whitelist')
  const allowFlashcardWaiver = hasFlag('--allow-flashcard-waiver')
  const whitelist = await readWhitelist(whitelistPath)

  const [
    episodeVocab,
    episodeClosings,
    flashcards,
    contentLanguage,
    themeAlignment,
  ] = await Promise.all([
    checkEpisodeVocab(),
    checkEpisodeClosingDupes(whitelist),
    checkFlashcardExampleLength(),
    checkContentLanguageQuality(),
    checkThemeAlignment(),
  ])

  const checks = [
    { name: 'episode vocab', passed: episodeVocab.passed, detail: `${episodeVocab.lowCountEpisodes.length} episodes below 8` },
    { name: 'episode closing dupes', passed: episodeClosings.passed, detail: `${episodeClosings.effectiveDuplicateGroups.length} duplicate groups` },
    { name: 'flashcard examples', passed: flashcards.passed || allowFlashcardWaiver, detail: `${flashcards.shortExamples.length} short examples${allowFlashcardWaiver && !flashcards.passed ? ' (waived)' : ''}` },
    { name: 'content language quality', passed: contentLanguage.passed, detail: `${contentLanguage.issues.length} issues` },
    { name: 'theme alignment', passed: themeAlignment.passed, detail: `${themeAlignment.mismatches.length} mismatches` },
  ]

  const hardFailures = checks.filter((check) => !check.passed)
  const overallStatus = hardFailures.length === 0
    ? (flashcards.passed ? 'PASS' : 'PASS_WITH_WAIVER')
    : 'FAIL'

  const lines = [
    `Final verification: ${overallStatus}`,
    ...checks.map((check) => `- ${check.name}: ${check.passed ? 'PASS' : 'FAIL'} (${check.detail})`),
  ]

  const summary = `${lines.join('\n')}\n`

  if (outputPath) {
    if (outputPath.endsWith('.json')) {
      await writeReport(
        outputPath,
        `${JSON.stringify({ overallStatus, checks, allowFlashcardWaiver }, null, 2)}\n`,
      )
    } else {
      await writeReport(outputPath, summary)
    }
  }

  process.stdout.write(summary)

  if (hardFailures.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

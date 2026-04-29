import { checkContentLanguageQuality } from './checks'
import { getArgValue, toCsv, writeReport } from './lib'

async function main() {
  const outputPath = getArgValue('--output')
  const result = await checkContentLanguageQuality()

  if (outputPath) {
    if (outputPath.endsWith('.json')) {
      await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
    } else {
      await writeReport(
        outputPath,
        `${toCsv(result.issues, ['source', 'weekNumber', 'dayOfWeek', 'titleOrId', 'english', 'example', 'issue'])}\n`,
      )
    }
  }

  console.log(`Content language quality: ${result.issues.length} issues across ${result.totalFlashcards} flashcards, ${result.totalEpisodeKeyPhrases} episode key phrases, and ${result.totalQuestions} questions`)

  if (result.issues.length > 0) {
    result.issues.slice(0, 20).forEach((issue) => {
      console.log(`- [${issue.source}] W${String(issue.weekNumber).padStart(2, '0')} ${issue.english} (${issue.issue})`)
    })
    process.exit(1)
  }

  console.log('No banned phrases, pronoun mismatches, known grammar errors, retired inline vocab, or localization term issues found.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

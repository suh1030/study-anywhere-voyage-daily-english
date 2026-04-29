import { checkFlashcardExampleLength } from './checks'
import { getArgValue, toCsv, writeReport } from './lib'

async function main() {
  const outputPath = getArgValue('--output')
  const minimumWords = Number(getArgValue('--minimum-words') ?? 12)
  const result = await checkFlashcardExampleLength(minimumWords)

  if (outputPath) {
    if (outputPath.endsWith('.json')) {
      await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
    } else {
      await writeReport(
        outputPath,
        `${toCsv(result.shortExamples, ['id', 'source', 'weekNumber', 'english', 'exampleSentence', 'wordCount'])}\n`,
      )
    }
  }

  console.log(`Flashcard example length: ${result.shortExamples.length}/${result.totalFlashcards} below ${result.minimumWords} words`)

  if (result.shortExamples.length > 0) {
    result.shortExamples.slice(0, 20).forEach((card) => {
      console.log(`- ${card.id} "${card.english}" (${card.wordCount} words)`)
    })
    process.exit(1)
  }

  console.log('All flashcard examples meet the minimum length.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


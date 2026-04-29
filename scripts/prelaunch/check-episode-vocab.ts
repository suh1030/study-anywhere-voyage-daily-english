import { checkEpisodeVocab } from './checks'
import { getArgValue, toCsv, writeReport } from './lib'

async function main() {
  const result = await checkEpisodeVocab()
  const outputPath = getArgValue('--output')

  if (outputPath) {
    if (outputPath.endsWith('.csv')) {
      await writeReport(outputPath, `${toCsv(result.rows, ['episodeId', 'weekNumber', 'dayOfWeek', 'title', 'vocabCount'])}\n`)
    } else {
      await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
    }
  }

  console.log(`Episode vocab: checked ${result.totalEpisodes} episodes`)
  console.log(`Episodes below 8 vocab items: ${result.lowCountEpisodes.length}`)

  if (result.lowCountEpisodes.length > 0) {
    result.lowCountEpisodes.forEach((episode) => {
      console.log(`- ${episode.episodeId} "${episode.title}": ${episode.vocabCount}`)
    })
    process.exit(1)
  }

  console.log('All episodes meet the minimum vocab count.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


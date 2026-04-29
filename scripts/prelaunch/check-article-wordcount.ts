import { checkArticleWordCount } from './checks'
import { getArgValue, toCsv, writeReport } from './lib'

async function main() {
  const result = await checkArticleWordCount()
  const outputPath = getArgValue('--output')

  if (outputPath) {
    if (outputPath.endsWith('.json')) {
      await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
    } else {
      await writeReport(
        outputPath,
        `${toCsv(result.rows, ['weekNumber', 'dayOfWeek', 'dateKey', 'title', 'declared', 'actual', 'diff'])}\n`,
      )
    }
  }

  console.log(`Article word count: counted ${result.countedArticles}/${result.totalArticlesExpected} articles`)
  console.log(`Outliers with |diff| > 10: ${result.outliers.length}`)
  if (result.importFailures.length > 0) {
    console.log(`Import failures preventing full count: ${result.importFailures.length}`)
  }
  if (result.outliers.length > 0) {
    console.log('Largest outliers:')
    result.outliers
      .slice()
      .sort((left, right) => Math.abs(right.diff) - Math.abs(left.diff))
      .slice(0, 10)
      .forEach((row) => {
        console.log(
          `- W${String(row.weekNumber).padStart(2, '0')}D${row.dayOfWeek} "${row.title}": declared=${row.declared}, actual=${row.actual}, diff=${row.diff}`,
        )
      })
  }

  if (!result.passed) {
    process.exit(1)
  }

  console.log('All article word counts are within tolerance.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


import { checkArticlesImport } from './checks'
import { getArgValue, writeReport } from './lib'

async function main() {
  const result = await checkArticlesImport()
  const outputPath = getArgValue('--output')

  if (outputPath) {
    await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  }

  console.log(`Articles import: ${result.successCount}/${result.totalFiles} files importable`)
  if (result.failureCount > 0) {
    console.log('Failures:')
    result.failures.forEach((failure) => {
      console.log(`- ${failure.fileName}: ${failure.error}`)
    })
    process.exit(1)
  }

  console.log('All article modules imported successfully.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


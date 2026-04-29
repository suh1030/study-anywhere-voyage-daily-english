import { checkThemeAlignment } from './checks'
import { getArgValue, writeReport } from './lib'

async function main() {
  const outputPath = getArgValue('--output')
  const result = await checkThemeAlignment()

  if (outputPath) {
    await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  }

  console.log(
    `Theme alignment: curriculum=${result.curriculumWeeks}, episodes=${result.episodesChecked}, questions=${result.questionsChecked}, mismatches=${result.mismatches.length}`,
  )

  if (result.mismatches.length > 0) {
    result.mismatches.forEach((mismatch) => {
      console.log(
        `- ${mismatch.type} W${String(mismatch.weekNumber).padStart(2, '0')}D${mismatch.dayOfWeek}: expected "${mismatch.expectedTheme}" got "${mismatch.actualTheme}"`,
      )
    })
    process.exit(1)
  }

  console.log('Theme alignment is clean.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


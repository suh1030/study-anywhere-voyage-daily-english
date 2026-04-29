import * as fs from 'fs/promises'
import { checkEpisodeClosingDupes } from './checks'
import { getArgValue, writeReport } from './lib'

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
  const whitelist = await readWhitelist(whitelistPath)
  const result = await checkEpisodeClosingDupes(whitelist)

  if (outputPath) {
    await writeReport(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  }

  console.log(`Episode closing dupes: ${result.duplicateGroups.length} duplicate groups`)
  console.log(`Effective duplicate groups after whitelist: ${result.effectiveDuplicateGroups.length}`)

  if (result.effectiveDuplicateGroups.length > 0) {
    result.effectiveDuplicateGroups.forEach((group) => {
      console.log(`- "${group.closingLine}" -> ${group.episodeIds.join(', ')}`)
    })
    process.exit(1)
  }

  console.log('No duplicate closing lines remain.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})


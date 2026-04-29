const fs = require('fs')
const path = require('path')
const vm = require('vm')

function expectedPhase(weekNumber) {
  if (weekNumber <= 10) return 'p1'
  if (weekNumber <= 18) return 'p2'
  if (weekNumber <= 26) return 'p3'
  if (weekNumber <= 34) return 'p4'
  if (weekNumber <= 43) return 'p5'
  return 'p6'
}

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  vm.runInNewContext(script, context, { filename: filePath })
  return context.module.exports
}

function countChineseChars(value) {
  const matches = String(value || '').match(/[\u3400-\u9fff]/g)
  return matches ? matches.length : 0
}

function main() {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const weekFiles = fs.readdirSync(episodesDir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()
  const episodes = weekFiles.flatMap((fileName) => loadWeekFile(path.join(episodesDir, fileName)))
  const errors = []

  if (episodes.length !== 365) {
    errors.push(`Expected 365 episodes, got ${episodes.length}`)
  }

  for (const episode of episodes) {
    const id = `W${String(episode.weekNumber).padStart(2, '0')}D${episode.dayOfWeek}`
    const phase = expectedPhase(episode.weekNumber)
    if (episode.phase !== phase) {
      errors.push(`${id}: expected phase ${phase}, got ${episode.phase}`)
    }

    if (episode.parts.length !== 5 && episode.parts.length !== 6) {
      errors.push(`${id}: expected 5 or 6 parts, got ${episode.parts.length}`)
    }

    const lineCount = episode.parts.reduce((sum, part) => sum + part.lines.length, 0)
    if (lineCount < 39 || lineCount > 54) {
      errors.push(`${id}: expected 39-54 lines, got ${lineCount}`)
    }

    if (!episode.keyPhrases || episode.keyPhrases.length !== 8) {
      errors.push(`${id}: expected 8 key phrases, got ${(episode.keyPhrases || []).length}`)
    }

    const seenPhraseDefs = new Set()
    for (const phrase of episode.keyPhrases || []) {
      if (!phrase.en || !phrase.zh || !phrase.example) {
        errors.push(`${id}: key phrase fields must be non-empty`)
      }
      if (/相關表達$/.test(String(phrase.zh || ''))) {
        errors.push(`${id}: key phrase "${phrase.en}" still uses placeholder zh`)
      }
      const defKey = String(phrase.zh || '').trim()
      if (defKey) {
        if (seenPhraseDefs.has(defKey)) {
          errors.push(`${id}: duplicate key phrase definition "${defKey}"`)
        }
        seenPhraseDefs.add(defKey)
      }
    }

    const speakerANames = new Set()
    const speakerBNames = new Set()
    for (const part of episode.parts) {
      for (const line of part.lines) {
        if (line.speaker === 'a') {
          speakerANames.add(line.speakerName)
        }

        if (line.speaker === 'b') {
          speakerBNames.add(line.speakerName)
        }

        if (countChineseChars(line.zh) < 4) {
          errors.push(`${id}: Chinese line still contains English text`)
        }

        if (line.vocab || line.vocabulary) {
          errors.push(`${id}: inline line vocab has been retired; use keyPhrases instead`)
        }
      }
    }

    if (speakerANames.size !== 1) {
      errors.push(`${id}: speaker a should stay consistent within the episode`)
    }

    if (speakerBNames.size !== 1) {
      errors.push(`${id}: speaker b should stay consistent within the episode`)
    }

    const [speakerA] = [...speakerANames]
    const [speakerB] = [...speakerBNames]
    if (speakerA && speakerB && speakerA === speakerB) {
      errors.push(`${id}: speaker a and speaker b should be different people`)
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  console.log(`Validated ${episodes.length} episodes successfully`)
}

main()

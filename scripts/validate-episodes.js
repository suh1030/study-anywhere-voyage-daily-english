const fs = require('fs')
const path = require('path')
const vm = require('vm')

const PHASE_NAMES = {
  p1: ['Mira', 'Jamie'],
  p2: ['Lily', 'Tom'],
  p3: ['Sara', 'Alex'],
  p4: ['Nina', 'Marcus'],
  p5: ['Jade', 'Ryan'],
  p6: ['Maya', 'James'],
}

const BANNED_TERMS = [
  'google', 'apple', 'bangkok', 'taipei', 'tokyo', 'london', 'paris', 'new york',
  'starbucks', 'nike', 'uber', 'youtube', 'instagram', 'facebook', 'mcdonald',
]

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

    if (episode.parts.length !== 6) {
      errors.push(`${id}: expected 6 parts, got ${episode.parts.length}`)
    }

    const lineCount = episode.parts.reduce((sum, part) => sum + part.lines.length, 0)
    if (lineCount < 42 || lineCount > 54) {
      errors.push(`${id}: expected 42-54 lines, got ${lineCount}`)
    }

    const vocabCount = episode.parts.reduce(
      (sum, part) => sum + part.lines.reduce((partSum, line) => partSum + ((line.vocab || []).length), 0),
      0,
    )
    if (vocabCount < 8 || vocabCount > 10) {
      errors.push(`${id}: expected 8-10 vocab items, got ${vocabCount}`)
    }

    const [speakerA, speakerB] = PHASE_NAMES[phase]
    for (const part of episode.parts) {
      for (const line of part.lines) {
        const text = `${line.en || ''} ${line.zh || ''}`.toLowerCase()
        for (const term of BANNED_TERMS) {
          if (text.includes(term)) {
            errors.push(`${id}: contains banned term "${term}"`)
          }
        }

        if (line.speaker === 'a' && line.speakerName !== speakerA) {
          errors.push(`${id}: speaker a should be ${speakerA}, got ${line.speakerName}`)
        }

        if (line.speaker === 'b' && line.speakerName !== speakerB) {
          errors.push(`${id}: speaker b should be ${speakerB}, got ${line.speakerName}`)
        }

        for (const vocab of line.vocab || []) {
          if (!String(line.en || '').toLowerCase().includes(String(vocab.word).toLowerCase())) {
            errors.push(`${id}: vocab "${vocab.word}" not found in English line`)
          }
        }
      }
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }

  console.log(`Validated ${episodes.length} episodes successfully`)
}

main()

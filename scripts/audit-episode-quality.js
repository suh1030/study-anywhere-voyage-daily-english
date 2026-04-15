const fs = require('fs')
const path = require('path')
const vm = require('vm')

const SUSPICIOUS_PHRASES = [
  'starts sounding inevitable instead of optional',
  'not fixing everything at once',
  'most human than abstract',
  'explained the exact moment the situation stopped feeling simple',
]

const PART_ONE_LINES_TO_CHECK = [5, 7, 8]
const MIN_REPEAT_REPORT = 3

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  vm.runInNewContext(script, context, { filename: filePath })
  return { source, episodes: context.module.exports }
}

function episodeId(episode) {
  return `W${String(episode.weekNumber).padStart(2, '0')}D${episode.dayOfWeek}`
}

function addOccurrence(map, key, value) {
  if (!key) return
  if (!map.has(key)) map.set(key, [])
  map.get(key).push(value)
}

function printSection(title) {
  console.log(`\n${title}`)
}

function printRepeatGroup(label, map, minRepeat = MIN_REPEAT_REPORT) {
  const repeated = [...map.entries()]
    .filter(([, occurrences]) => occurrences.length >= minRepeat)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))

  console.log(`${label}: ${repeated.length} repeated item(s) at threshold ${minRepeat}+`)
  for (const [text, occurrences] of repeated.slice(0, 20)) {
    const sample = occurrences.slice(0, 8).join(', ')
    console.log(`- ${occurrences.length}x "${text}"`)
    console.log(`  ${sample}${occurrences.length > 8 ? ', ...' : ''}`)
  }
}

function main() {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const weekFiles = fs.readdirSync(episodesDir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()

  const partOneMaps = new Map(PART_ONE_LINES_TO_CHECK.map((lineNumber) => [lineNumber, new Map()]))
  const exactLineMap = new Map()
  const keyPhraseExampleMap = new Map()
  const suspiciousPhraseHits = new Map(SUSPICIOUS_PHRASES.map((phrase) => [phrase, []]))

  let episodeCount = 0

  for (const fileName of weekFiles) {
    const filePath = path.join(episodesDir, fileName)
    const { source, episodes } = loadWeekFile(filePath)
    const fileHits = new Set()

    for (const phrase of SUSPICIOUS_PHRASES) {
      if (source.includes(phrase)) {
        fileHits.add(phrase)
      }
    }

    for (const episode of episodes) {
      episodeCount += 1
      const id = episodeId(episode)

      const partOne = episode.parts[0]
      if (partOne) {
        for (const lineNumber of PART_ONE_LINES_TO_CHECK) {
          const line = partOne.lines[lineNumber - 1]
          if (line && line.en) {
            addOccurrence(partOneMaps.get(lineNumber), line.en, id)
          }
        }
      }

      for (const part of episode.parts) {
        for (const line of part.lines) {
          if (line.en) {
            addOccurrence(exactLineMap, line.en, id)
          }
        }
      }

      for (const phrase of episode.keyPhrases || []) {
        if (phrase.example) {
          addOccurrence(keyPhraseExampleMap, phrase.example, `${id}:${phrase.en}`)
        }
      }
    }

    for (const phrase of fileHits) {
      suspiciousPhraseHits.get(phrase).push(fileName)
    }
  }

  console.log(`Audited ${episodeCount} episodes across ${weekFiles.length} week files`)

  printSection('Suspicious Phrase Hits')
  for (const phrase of SUSPICIOUS_PHRASES) {
    const files = suspiciousPhraseHits.get(phrase)
    console.log(`- "${phrase}": ${files.length} file(s)`)
    if (files.length) {
      console.log(`  ${files.join(', ')}`)
    }
  }

  printSection('Part 1 Checkpoints')
  for (const lineNumber of PART_ONE_LINES_TO_CHECK) {
    printRepeatGroup(`Part 1 line ${lineNumber}`, partOneMaps.get(lineNumber))
  }

  printSection('Exact Dialogue Repeats')
  printRepeatGroup('All English dialogue lines', exactLineMap, 4)

  printSection('Repeated Key Phrase Examples')
  printRepeatGroup('Key phrase examples', keyPhraseExampleMap)
}

main()

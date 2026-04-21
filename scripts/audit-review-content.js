const MODULES = [
  ['flashcards-w01-w08.ts', 'FLASHCARDS_W01_W08'],
  ['flashcards-w09-w16.ts', 'FLASHCARDS_W09_W16'],
  ['flashcards-w17-w24.ts', 'FLASHCARDS_W17_W24'],
  ['flashcards-w25-w32.ts', 'FLASHCARDS_W25_W32'],
  ['flashcards-w33-w41.ts', 'FLASHCARDS_W33_W41'],
  ['flashcards-w42-w53.ts', 'FLASHCARDS_W42_W53'],
]

const CONCRETE_SHORT_EXAMPLE_OK = new Set([
  'w4-listen-01',
  'w4-speak-02',
  'w7-speak-03',
  'w25-speak-03',
  'w28-speak-04',
])

const ABSTRACT_KEYWORDS = [
  'alignment',
  'assumption',
  'attention',
  'belonging',
  'crack',
  'decision',
  'desire',
  'direction',
  'feeling',
  'habit',
  'identity',
  'imagination',
  'mindset',
  'pattern',
  'pressure',
  'review',
  'self',
  'story',
  'value',
]

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

async function loadCards() {
  const groups = []

  for (const [file, exportName] of MODULES) {
    const mod = await import(`../content/flashcards/${file.replace(/\.ts$/, '')}`)
    const exported = mod[exportName] || (mod.default && mod.default[exportName]) || (mod['module.exports'] && mod['module.exports'][exportName])

    if (!Array.isArray(exported)) {
      throw new Error(`Could not load ${exportName} from ${file}`)
    }

    groups.push(...exported)
  }

  return groups
}

function buildReport(cards) {
  const shortChinese = cards.filter((card) => card.chinese.length < 8)
  const shortExamples = cards.filter((card) => wordCount(card.exampleSentence) < 8 && !CONCRETE_SHORT_EXAMPLE_OK.has(card.id))
  const abstractWithoutContext = cards.filter((card) => {
    const english = card.english.toLowerCase()
    return ABSTRACT_KEYWORDS.some((keyword) => english.includes(keyword)) && wordCount(card.exampleSentence) < 12
  })

  return {
    cardCount: cards.length,
    thresholds: {
      shortChineseMinChars: 8,
      shortExampleMinWords: 8,
      abstractExampleMinWords: 12,
    },
    findings: {
      shortChinese,
      shortExamples,
      abstractWithoutContext,
    },
  }
}

async function main() {
  const cards = await loadCards()
  const report = buildReport(cards)
  const summary = {
    cardCount: report.cardCount,
    thresholds: report.thresholds,
    counts: {
      shortChinese: report.findings.shortChinese.length,
      shortExamples: report.findings.shortExamples.length,
      abstractWithoutContext: report.findings.abstractWithoutContext.length,
    },
    samples: {
      shortChinese: report.findings.shortChinese.slice(0, 10),
      shortExamples: report.findings.shortExamples.slice(0, 10),
      abstractWithoutContext: report.findings.abstractWithoutContext.slice(0, 10),
    },
  }

  console.log(JSON.stringify(summary, null, 2))

  if (process.argv.includes('--fail-on-findings')) {
    const totalFindings =
      report.findings.shortChinese.length +
      report.findings.shortExamples.length +
      report.findings.abstractWithoutContext.length

    if (totalFindings > 0) {
      process.exitCode = 1
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

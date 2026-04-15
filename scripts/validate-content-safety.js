const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

const TARGETS = [
  { dir: 'content/episodes', pattern: /^week-\d{2}\.ts$/ },
  { dir: 'content/articles', pattern: /^articles-w\d{2}\.ts$/ },
  { dir: 'content/questions', pattern: /^conversations-w\d{2}-w\d{2}\.ts$/ },
  { dir: 'content/flashcards', pattern: /^flashcards-w\d{2}-w\d{2}\.ts$/ },
]

const ENGLISH_PATTERNS = [
  /\bkill(?:ed|ing)?\b/i,
  /\bmurder\b/i,
  /\bblood\b/i,
  /\bbleed(?:ing)?\b/i,
  /\bweapon\b/i,
  /\bgun\b/i,
  /\bknife\b/i,
  /\bshoot(?:ing)?\b/i,
  /\bstab(?:bed|bing)?\b/i,
  /\bviolent\b/i,
  /\bviolence\b/i,
  /\bsex\b/i,
  /\bsexual\b/i,
  /\bnude\b/i,
  /\bnaked\b/i,
  /\bporn\b/i,
  /\bpregnan(?:t|cy)\b/i,
  /\bfetish\b/i,
  /\bdrug(?:s)?\b/i,
  /\bcocaine\b/i,
  /\bheroin\b/i,
  /\bweed\b/i,
  /\bmarijuana\b/i,
  /\bcannabis\b/i,
  /\balcohol\b/i,
  /\bbeer\b/i,
  /\bwine\b/i,
  /\bvodka\b/i,
  /\bwhiskey\b/i,
  /\bdrunk\b/i,
  /\bsuicide\b/i,
  /\bself-harm\b/i,
  /\bdepression\b/i,
  /\bhate\b/i,
  /\bracis(?:m|t)\b/i,
  /\bslur\b/i,
  /\bdamn\b/i,
  /\bshit\b/i,
  /\bfuck\b/i,
  /\bbitch\b/i,
  /\basshole\b/i,
  /\bcasino\b/i,
  /\bbetting\b/i,
  /\blottery\b/i,
  /\bsmok(?:e|ing)\b/i,
  /\bcigarette\b/i,
  /\btobacco\b/i,
]

const CHINESE_TERMS = [
  '暴力', '流血', '武器', '槍', '刀', '射擊', '刺傷',
  '色情', '裸體', '性愛', '性行為',
  '毒品', '大麻', '酒精', '啤酒', '紅酒', '威士忌', '酗酒',
  '自殺', '自殘', '憂鬱症',
  '仇恨', '種族歧視', '髒話',
  '賭博', '賭場',
  '抽菸', '吸菸', '香菸', '煙草',
]

function listFiles() {
  return TARGETS.flatMap(({ dir, pattern }) => {
    const fullDir = path.join(ROOT, dir)
    return fs.readdirSync(fullDir)
      .filter((name) => pattern.test(name))
      .map((name) => path.join(fullDir, name))
  })
}

function main() {
  const files = listFiles()
  const issues = []

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    for (const pattern of ENGLISH_PATTERNS) {
      const match = text.match(pattern)
      if (match) {
        issues.push(`${path.relative(ROOT, file)}: matched English safety pattern "${pattern}" via "${match[0]}"`)
      }
    }
    for (const term of CHINESE_TERMS) {
      if (text.includes(term)) {
        issues.push(`${path.relative(ROOT, file)}: matched Chinese safety term "${term}"`)
      }
    }
  }

  if (issues.length) {
    console.error(issues.join('\n'))
    process.exit(1)
  }

  console.log(`Validated content safety across ${files.length} active content files`)
}

main()

/**
 * Patch remaining vocab deficits (round 2)
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const EPISODES_DIR = path.join(process.cwd(), 'content', 'episodes')

const PATCHES = [
  // W41D4 (7 vocab, need 1 more)
  {
    file: 'week-41.ts', week: 41, day: 4,
    lineContains: 'flawless performance',
    vocab: { word: 'flawless', def: '無缺點的；完美無瑕的' },
  },
  // W41D5 (7 vocab, need 1 more)
  {
    file: 'week-41.ts', week: 41, day: 5,
    lineContains: 'resentment does the speaking',
    vocab: { word: 'resentment', def: '積怨；長期壓抑不滿而形成的負面情緒' },
  },
  // W41D6 (7 vocab, need 1 more)
  {
    file: 'week-41.ts', week: 41, day: 6,
    lineContains: 'free of revenge',
    vocab: { word: 'revenge', def: '報復；帶有憤怒或敵意的反擊衝動' },
  },
  // W43D4 (7 vocab, need 1 more)
  {
    file: 'week-43.ts', week: 43, day: 4,
    lineContains: 'being unconscious about it',
    vocab: { word: 'unconscious', def: '無意識的；在未察覺到的狀態下' },
  },
  // W43D6 second vocab (6 vocab, need 2 more; emotional clarity is first)
  {
    file: 'week-43.ts', week: 43, day: 6,
    lineContains: 'hard truth easier to live',
    vocab: { word: 'hard truth', def: '殘酷的事實；令人不舒服但真實的道理' },
  },
  {
    file: 'week-43.ts', week: 43, day: 6,
    lineContains: 'Emotional clarity gets stronger',
    vocab: { word: 'emotional clarity', def: '情感上的清晰感；對自己內心狀態的明確認識' },
  },
  // W43D7 (6 vocab, need 2 more; deliberate step is already there, need 2 more)
  {
    file: 'week-43.ts', week: 43, day: 7,
    lineContains: 'repeat old patterns just because they are familiar',
    vocab: { word: 'old pattern', def: '舊有的習慣模式；因為熟悉而繼續保留的行為方式' },
  },
  {
    file: 'week-43.ts', week: 43, day: 7,
    lineContains: 'notice whether the next chapter actually fits',
    vocab: { word: 'conscious direction', def: '有意識的方向感；主動選擇而非被動漂移的行動方式' },
  },
  // W44D2 (7 vocab, need 1 more)
  {
    file: 'week-44.ts', week: 44, day: 2,
    lineContains: 'tenderness, and a reminder',
    vocab: { word: 'tenderness', def: '溫柔；細膩的關懷與輕柔感，使日常生活不流於機械化' },
  },
]

function loadFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const ctx = { module: { exports: null } }
  vm.runInNewContext(script, ctx, { filename: filePath })
  return ctx.module.exports || []
}

function saveFile(filePath, episodes) {
  const importLine = "import { Episode } from '../types'"
  const varName = path.basename(filePath, '.ts').replace('-', '_').toUpperCase()
  const content = `${importLine}\n\nexport const ${varName}: Episode[] = ${JSON.stringify(episodes, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

const patchesByFile = new Map()
for (const patch of PATCHES) {
  if (!patchesByFile.has(patch.file)) patchesByFile.set(patch.file, [])
  patchesByFile.get(patch.file).push(patch)
}

let totalAdded = 0

for (const [fileName, patches] of patchesByFile) {
  const filePath = path.join(EPISODES_DIR, fileName)
  const episodes = loadFile(filePath)
  let fileChanged = false

  for (const patch of patches) {
    const episode = episodes.find(e => e.weekNumber === patch.week && e.dayOfWeek === patch.day)
    if (!episode) {
      console.error(`  ! Episode W${patch.week}D${patch.day} not found`)
      continue
    }

    let found = false
    for (const part of episode.parts) {
      for (const line of part.lines) {
        if (line.en && line.en.includes(patch.lineContains)) {
          if (!line.vocab) line.vocab = []
          const alreadyHas = line.vocab.some(v => v.word === patch.vocab.word)
          if (!alreadyHas) {
            line.vocab.push(patch.vocab)
            totalAdded++
            fileChanged = true
            console.log(`  + W${patch.week}D${patch.day}: added "${patch.vocab.word}" to line "${line.en.substring(0, 60)}..."`)
          } else {
            console.log(`  = W${patch.week}D${patch.day}: "${patch.vocab.word}" already exists, skipping`)
          }
          found = true
          break
        }
      }
      if (found) break
    }

    if (!found) {
      console.warn(`  ! W${patch.week}D${patch.day}: line containing "${patch.lineContains}" not found`)
    }
  }

  if (fileChanged) {
    saveFile(filePath, episodes)
    console.log(`✓ Saved ${fileName}`)
  }
}

console.log(`\nTotal vocab items added: ${totalAdded}`)

/**
 * Patch vocab deficits: add missing vocab items to specific episodes
 * to bring all episodes back to minimum 8 vocab items
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const EPISODES_DIR = path.join(process.cwd(), 'content', 'episodes')

// Patches: each entry targets a specific episode and dialogue line
// to add one vocab item
const PATCHES = [
  // W39D5: Financial Goals and Emotional Pressure (currently 7, need 1)
  {
    file: 'week-39.ts', week: 39, day: 5,
    lineEn: 'Especially in finance, where numbers can look deceptively absolute.',
    vocab: { word: 'deceptively', def: '表面上看起來如此；帶有誤導性地' },
  },

  // W41D4: Living According to What You Believe (currently 7, need 1)
  {
    file: 'week-41.ts', week: 41, day: 4,
    lineEn: 'Honest return is often more mature than flawless performance.',
    vocab: { word: 'flawless', def: '無缺點的；完美無瑕的' },
  },

  // W41D5: Disagreeing with People You Respect (currently 7, need 1)
  {
    file: 'week-41.ts', week: 41, day: 5,
    lineEn: 'Honest tension is survivable, but personal humiliation usually is not.',
    vocab: { word: 'humiliation', def: '羞辱；使人感到顏面盡失的對待方式' },
  },

  // W41D6: What You Refuse to Compromise On (currently 7, need 1)
  {
    file: 'week-41.ts', week: 41, day: 6,
    lineEn: 'A boundary statement is strongest when it sounds clear, calm, and free of revenge.',
    vocab: { word: 'revenge', def: '報復；帶有憤怒或敵意的反擊衝動' },
  },

  // W43D3: What the Hard Years Taught You (currently 7, need 1)
  {
    file: 'week-43.ts', week: 43, day: 3,
    lineEn: 'It helps people keep their dignity without pretending the past was good simply because it was formative.',
    vocab: { word: 'formative', def: '具有塑造作用的；對一個人的成長有深刻影響的' },
  },

  // W43D4: The People and Moments That Shaped You (currently 7, need 1)
  {
    file: 'week-43.ts', week: 43, day: 4,
    lineEn: 'Being shaped is inevitable, but being unconscious about it is not.',
    vocab: { word: 'unconscious', def: '無意識的；未察覺到的；在不自知的狀態下' },
  },

  // W43D5: Regret, Gratitude, and Perspective (currently 6, need 2)
  {
    file: 'week-43.ts', week: 43, day: 5,
    lineEn: 'Simple sentences can hold very complicated truths.',
    vocab: { word: 'complicated truth', def: '複雜的真相；無法簡單歸類或一刀兩斷的事實' },
  },
  {
    file: 'week-43.ts', week: 43, day: 5,
    lineEn: 'By letting the pain tell the truth first. Gratitude that arrives too early often feels like emotional pressure.',
    vocab: { word: 'emotional pressure', def: '情感壓力；被迫以特定方式感受、不容許其他情緒的束縛感' },
  },

  // W43D6: What You Want to Leave Behind (currently 6, need 2)
  {
    file: 'week-43.ts', week: 43, day: 6,
    lineEn: 'An outdated pattern does not disappear just because you dislike it. It weakens when the daily choices stop supporting it.',
    vocab: { word: 'daily choice', def: '日常選擇；每天習慣性做出的決定，累積起來會強化或削弱某種模式' },
  },
  {
    file: 'week-43.ts', week: 43, day: 6,
    lineEn: 'Emotional clarity gets stronger when life structure starts agreeing with it.',
    vocab: { word: 'life structure', def: '生活結構；日常環境與安排的整體框架' },
  },

  // W43D7: Moving Forward with More Intention (currently 6, need 2)
  {
    file: 'week-43.ts', week: 43, day: 7,
    lineEn: 'Good intention is quieter than panic.',
    vocab: { word: 'panic', def: '恐慌；因焦慮而失去冷靜、倉促行動的狀態' },
  },
  {
    file: 'week-43.ts', week: 43, day: 7,
    lineEn: 'Conscious direction matters because a person needs enough space to notice whether the next step is chosen or reactive.',
    vocab: { word: 'reactive', def: '被動反應的；由外部刺激觸發，而非出於主動選擇的行為' },
  },

  // W44D2: Art in Everyday Life (currently 7, need 1)
  {
    file: 'week-44.ts', week: 44, day: 2,
    lineEn: 'It gives texture, pause, tenderness, and a reminder that a life can be functional without becoming empty.',
    vocab: { word: 'tenderness', def: '溫柔；細膩的關懷與輕柔感，讓日常生活不流於機械化' },
  },

  // W44D4: Design Thinking in Daily Life (currently 7, need 1)
  {
    file: 'week-44.ts', week: 44, day: 4,
    lineEn: 'Notice what you keep avoiding. Avoidance is often a map of bad design.',
    vocab: { word: 'avoidance', def: '迴避；持續不去做某件事的傾向，通常是設計問題的訊號' },
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
  const importLine = 'import { Episode } from \'../types\''
  const varName = path.basename(filePath, '.ts').replace('-', '_').toUpperCase()
  const content = `${importLine}\n\nexport const ${varName}: Episode[] = ${JSON.stringify(episodes, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

// Group patches by file
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
      console.error(`Episode W${patch.week}D${patch.day} not found in ${fileName}`)
      continue
    }

    let found = false
    for (const part of episode.parts) {
      for (const line of part.lines) {
        if (line.en && line.en.trim() === patch.lineEn.trim()) {
          if (!line.vocab) line.vocab = []
          // Check it's not already there
          const alreadyHas = line.vocab.some(v => v.word === patch.vocab.word)
          if (!alreadyHas) {
            line.vocab.push(patch.vocab)
            totalAdded++
            fileChanged = true
            console.log(`  + W${patch.week}D${patch.day}: added "${patch.vocab.word}" to line "${patch.lineEn.substring(0, 60)}..."`)
          }
          found = true
          break
        }
      }
      if (found) break
    }

    if (!found) {
      console.warn(`  ! W${patch.week}D${patch.day}: line not found: "${patch.lineEn.substring(0, 60)}..."`)
    }
  }

  if (fileChanged) {
    saveFile(filePath, episodes)
    console.log(`✓ Saved ${fileName}`)
  }
}

console.log(`\nTotal vocab items added: ${totalAdded}`)

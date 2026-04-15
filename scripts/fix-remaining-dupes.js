/**
 * Fix remaining 3x cross-episode duplicate closing lines
 */
const fs = require('fs'), path = require('path'), vm = require('vm')
const EPISODES_DIR = path.join(process.cwd(), 'content', 'episodes')

const REPLACEMENTS = [
  // ── "good way to put it" (keep W22D4) ──────────────────────────────────
  {
    id: 'W26D6', lineContains: 'good way to put it',
    newEn: 'I think that is exactly what happens when work starts answering questions it was never supposed to answer.',
    newZh: '我覺得這就是當工作開始回答那些它本來不該回答的問題時，會發生的事。',
  },
  {
    id: 'W32D5', lineContains: 'good way to put it',
    newEn: 'I want to feel less generic around the things I actually care about most.',
    newZh: '我想在我真正在乎的那些事情上，感覺自己少一點普通。',
  },

  // ── "relieving sentence" (keep W24D6) ───────────────────────────────────
  {
    id: 'W40D2', lineContains: 'relieving sentence',
    newEn: 'So the discomfort is not a malfunction. It might just be new information arriving.',
    newZh: '所以那種不安並不是哪裡出了問題，它可能只是新的資訊正在到來。',
  },
  {
    id: 'W43D6', lineContains: 'relieving sentence',
    newEn: 'So I can honor something without having to keep carrying it forward.',
    newZh: '所以我可以感謝某樣東西，而不需要繼續把它帶在身上往前走。',
  },

  // ── "satisfying answer" (keep W33D4) ────────────────────────────────────
  {
    id: 'W34D1', lineContains: 'satisfying answer',
    newEn: 'So the real benefits of movement are mostly the ones that do not photograph well, but they turn out to be the ones that matter most.',
    newZh: '所以運動真正帶來的好處，大多是那些拍不出來的，但它們卻是最重要的。',
  },
  {
    id: 'W44D4', lineContains: 'satisfying answer',
    newEn: 'I want that feeling in more parts of my day — life actually cooperating instead of just putting up with me.',
    newZh: '我想在更多的日常時刻裡感受到那種感覺——生活真的在配合我，而不只是在勉強應付。',
  },

  // ── "very useful distinction" (keep W36D2) — also appears in same week! ─
  {
    id: 'W36D5', lineContains: 'very useful distinction',
    newEn: 'So the question I need to ask is whether I am getting to the output faster, or actually getting somewhere that matters faster.',
    newZh: '所以我需要問自己的問題是：我是得到結果更快，還是真的更快地到達某個有意義的地方。',
  },
  {
    id: 'W51D4', lineContains: 'very useful distinction',
    newEn: 'Purpose leaving something usable after the feeling fades feels like the right test to apply.',
    newZh: '感覺消退後還留下有用的東西，這個標準感覺正是用來判斷目的的正確方法。',
  },

  // ── "less like a commitment" (keep W44D1) — all in same week! ───────────
  {
    id: 'W44D4', lineContains: 'less like a commitment',
    newEn: 'I want a daily structure that actually cooperates with who I am, not one I have to fight my way through every morning.',
    newZh: '我想要一個真的能配合我的日常結構，而不是每天早上都要和它搏鬥的那種。',
  },
  {
    id: 'W44D7', lineContains: 'less like a commitment',
    newEn: 'I think creativity might actually be something I need, not just something I enjoy when there happens to be time.',
    newZh: '我覺得創造力可能是我真正需要的東西，而不只是偶爾有時間時才會享受的事。',
  },

  // ── "useful correction" (keep W45D6) ────────────────────────────────────
  {
    id: 'W51D3', lineContains: 'useful correction',
    newEn: 'A system built for who I actually am will always outlast one built for who I think I should be.',
    newZh: '一個為真實的我建立的系統，永遠比為我認為應該成為的我建立的系統更持久。',
  },
  {
    id: 'W51D6', lineContains: 'useful correction',
    newEn: 'I want to stop planning for a future version of myself I keep waiting to arrive and start planning for the one already here.',
    newZh: '我想停止為一個我一直等待出現的未來自我做計畫，開始為現在已經在這裡的那個自我做計畫。',
  },
]

function loadFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const ctx = { module: { exports: null } }
  vm.runInNewContext(source, ctx, { filename: filePath })
  return ctx.module.exports || []
}

function saveFile(filePath, episodes) {
  const varName = path.basename(filePath, '.ts').replace('-', '_').toUpperCase()
  fs.writeFileSync(filePath, `import { Episode } from '../types'\n\nexport const ${varName}: Episode[] = ${JSON.stringify(episodes, null, 2)}\n`)
}

// Build id → {episode, filePath, episodes} map
const weekFiles = fs.readdirSync(EPISODES_DIR).filter(n => /^week-\d{2}\.ts$/.test(n)).sort()
const allEpisodes = new Map()
for (const fileName of weekFiles) {
  const filePath = path.join(EPISODES_DIR, fileName)
  const episodes = loadFile(filePath)
  for (const ep of episodes) {
    const id = `W${String(ep.weekNumber).padStart(2, '0')}D${ep.dayOfWeek}`
    allEpisodes.set(id, { episode: ep, filePath, episodes })
  }
}

const dirtyFiles = new Set()
let total = 0

for (const rep of REPLACEMENTS) {
  const entry = allEpisodes.get(rep.id)
  if (!entry) { console.error(`  ! ${rep.id}: not found`); continue }
  const { episode, filePath } = entry
  let found = false
  for (const part of episode.parts) {
    for (const line of part.lines) {
      if (line.en && line.en.toLowerCase().includes(rep.lineContains.toLowerCase())) {
        console.log(`  ✓ ${rep.id}: "${line.en.substring(0, 50)}..."`)
        console.log(`          → "${rep.newEn.substring(0, 50)}..."`)
        line.en = rep.newEn; line.zh = rep.newZh
        dirtyFiles.add(filePath); total++; found = true; break
      }
    }
    if (found) break
  }
  if (!found) console.warn(`  ! ${rep.id}: "${rep.lineContains}" not found`)
}

for (const filePath of dirtyFiles) {
  const fileName = path.basename(filePath)
  const fileEps = [...allEpisodes.values()].filter(e => e.filePath === filePath).map(e => e.episode)
  saveFile(filePath, fileEps)
  console.log(`  Saved ${fileName}`)
}

console.log(`\nTotal replaced: ${total}`)

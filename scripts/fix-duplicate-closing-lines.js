/**
 * Fix cross-episode duplicate closing lines
 * Replace all-but-first occurrences with episode-specific alternatives
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const EPISODES_DIR = path.join(process.cwd(), 'content', 'episodes')

// Replacements: { episodeId, lineContains, newEn, newZh }
// One entry per duplicate that needs replacing (first occurrence is kept as-is)
const REPLACEMENTS = [
  // ── "stay with me" (W31D3 kept, replacing others) ──────────────────────
  {
    id: 'W38D5', lineContains: 'stay with me',
    newEn: 'That image of action as company rather than escape changes how I want to think about doing my part.',
    newZh: '把行動視為陪伴而非逃避的那個形象，改變了我對自己能做什麼的看法。',
  },
  {
    id: 'W39D6', lineContains: 'stay with me',
    newEn: 'I think I have been spending energy on the surface version without fully realizing it until now.',
    newZh: '我覺得我一直在把精力花在外表那個版本上，直到現在才真正意識到。',
  },
  {
    id: 'W40D4', lineContains: 'stay with me',
    newEn: 'I think sunk cost has been quietly running more of my decisions than I ever admitted.',
    newZh: '我覺得沉沒成本在我的決定裡佔的份量，遠比我願意承認的還要多。',
  },
  {
    id: 'W40D6', lineContains: 'stay with me',
    newEn: 'I had not thought of relief as something that could come through subtraction, but it makes complete sense.',
    newZh: '我沒有想過輕鬆感可以來自減去某些東西，但這完全說得通。',
  },
  {
    id: 'W51D5', lineContains: 'going to stay with me',
    newEn: 'That image of resilience as staying in relationship makes it feel far less like something you either have or simply do not.',
    newZh: '把韌性描繪為維持關係的能力，讓它感覺不再像是你要嘛有、要嘛沒有的東西。',
  },

  // ── "useful distinction" (W16D6 kept, replacing others) ─────────────────
  {
    id: 'W19D7', lineContains: 'useful distinction',
    newEn: 'I think I have been flattening confidence and bragging into the same category, and now I can actually tell them apart.',
    newZh: '我一直把自信和自誇混為一談，現在我終於可以分辨它們了。',
  },
  {
    id: 'W22D5', lineContains: 'useful distinction',
    newEn: 'Knowing our confidence level before the decision saves a lot of arguing over the wrong question.',
    newZh: '在做決定之前先確認我們的信心程度，可以省掉很多在錯誤問題上爭論的時間。',
  },
  {
    id: 'W34D7', lineContains: 'useful distinction',
    newEn: 'I want to spend less time arguing with my body and more time actually reading what it is trying to tell me.',
    newZh: '我想少花時間和自己的身體爭論，多花時間真正聆聽它在說什麼。',
  },
  {
    id: 'W52D4', lineContains: 'useful distinction',
    newEn: 'The gap between a role fitting your skills and fitting your life feels like exactly the right thing to look at this year.',
    newZh: '職位符合技能和符合生活之間的差距，感覺正是這一年最值得審視的事。',
  },

  // ── "had not connected" (W30D2 kept, replacing others) ─────────────────
  {
    id: 'W40D5', lineContains: 'had not connected those two things',
    newEn: 'I think I had been treating flexibility and identity as things that compete, when they are supposed to support each other.',
    newZh: '我一直把彈性和自我認同當成相互競爭的東西，但其實它們應該是互相支撐的。',
  },
  {
    id: 'W43D2', lineContains: 'had not connected those two things',
    newEn: 'I want to trust my own inner evidence more and other people\'s external timelines a lot less.',
    newZh: '我想更相信自己內在的證據，少用別人的外在時間表來衡量自己。',
  },
  {
    id: 'W43D5', lineContains: 'had not connected those two things',
    newEn: 'I think I am leaving with a kinder and more spacious way to hold both of those feelings at once.',
    newZh: '我覺得我帶著一種更溫柔、更有空間的方式離開，可以同時容納這兩種感受。',
  },
  {
    id: 'W50D1', lineContains: 'had not connected those two things',
    newEn: 'Making the practice reachable changes my whole relationship to gratitude, not just the habit itself.',
    newZh: '讓這個練習變得可以觸及，改變了我和感恩之間的整體關係，而不只是習慣本身。',
  },

  // ── "want to return to" (W36D4 kept, replacing others) ─────────────────
  {
    id: 'W40D6', lineContains: 'want to return to and think about more',
    newEn: 'I think I have been treating self and commitment as things that compete, and recognizing that is already something.',
    newZh: '我覺得我一直把自我和承諾當成競爭的事物，光是認清這一點就已經有意義了。',
  },
  {
    id: 'W43D3', lineContains: 'want to return to and think about more',
    newEn: 'I think I can hold the lesson without having to live inside the pain it arrived with.',
    newZh: '我覺得我可以保留那個教訓，而不必繼續住在它帶來的痛苦裡。',
  },
  {
    id: 'W43D7', lineContains: 'want to return to and think about more',
    newEn: 'I want fewer dramatic changes and more choices I can actually live with day after day.',
    newZh: '我想要的是少一點戲劇性的改變，多一點我真的能在日復一日中堅持下去的選擇。',
  },
  {
    id: 'W51D1', lineContains: 'want to return to and think about more',
    newEn: 'I think I need to sit longer with what I can actually keep, not only what sounds admirable from a distance.',
    newZh: '我覺得我需要更認真思考我真的能守住的是什麼，而不是那些從遠處看起來很值得讚揚的。',
  },

  // ── "notice this differently" (W36D6 kept, replacing others) ───────────
  {
    id: 'W43D1', lineContains: 'notice this differently',
    newEn: 'I want to let the past become guidance rather than just noise running quietly in the background.',
    newZh: '我希望過去能成為引導，而不只是在背景裡安靜運行的雜音。',
  },
  {
    id: 'W43D4', lineContains: 'notice this differently',
    newEn: 'I am leaving this conversation more grateful for the people who found me at exactly the right moment.',
    newZh: '我帶著更深的感謝離開，感謝那些在正確時刻出現的人。',
  },
  {
    id: 'W45D3', lineContains: 'notice this differently',
    newEn: 'I think I have been narrowing leadership down to task management, and there is clearly much more to it than that.',
    newZh: '我覺得我一直把領導力縮減為任務管理，但顯然它遠不止如此。',
  },
  {
    id: 'W51D2', lineContains: 'notice this differently',
    newEn: 'I want a vision that is actually useful, not one that only sounds inspiring when things are already going well.',
    newZh: '我想要一個真正有用的願景，而不是只有在事情順利時才聽起來振奮人心的那種。',
  },

  // ── "beautiful way to say it" (W19D6 kept, replacing others) ───────────
  {
    id: 'W32D7', lineContains: 'beautiful way to say it',
    newEn: 'I want to protect my own aliveness the way you are describing. That word is exactly the right one.',
    newZh: '我想要保護自己那種活著的感覺，就像你描述的那樣。那個詞用得太對了。',
  },
  {
    id: 'W46D6', lineContains: 'beautiful way to say it',
    newEn: 'I had not thought of repeated acts as muscle memory before, but once you say it, it is the only way it makes sense.',
    newZh: '我以前沒有把重複的行動想成肌肉記憶，但你這麼說之後，這就是唯一說得通的方式了。',
  },
  {
    id: 'W50D3', lineContains: 'beautiful way to say it',
    newEn: 'So beauty is not an escape from the world. It is something that returns the world to you in a form you can actually receive.',
    newZh: '所以美不是從世界逃跑，而是讓世界以一種你真正能接收的形式回到你身邊。',
  },

  // ── "important distinction" (W28D6 kept, replacing others) ─────────────
  {
    id: 'W37D6', lineContains: 'important distinction',
    newEn: 'Changing what a person can carry alone by adding real support sounds like it changes the whole structure of the problem.',
    newZh: '透過真正的支持改變一個人能獨自承擔的事，聽起來是在改變整個問題的結構。',
  },
  {
    id: 'W39D2', lineContains: 'important distinction',
    newEn: 'I think I have been chasing the visible version of security without really looking at what was underneath it.',
    newZh: '我覺得我一直在追求看得見的那種安全感，卻沒有真正看清楚它底下是什麼。',
  },
  {
    id: 'W40D6', lineContains: 'important distinction',
    newEn: 'An honest ending hurting and still being the right thing — I want to sit with that tension for a while.',
    newZh: '一個誠實的結束既讓人痛苦又是正確的事——我想在這個張力裡多停留一下。',
  },
]

// Load all episodes into memory
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

// Build episode ID → file map
const weekFiles = fs.readdirSync(EPISODES_DIR)
  .filter(name => /^week-\d{2}\.ts$/.test(name))
  .sort()

const allEpisodes = new Map() // id → { episode, filePath }

for (const fileName of weekFiles) {
  const filePath = path.join(EPISODES_DIR, fileName)
  const episodes = loadFile(filePath)
  for (const ep of episodes) {
    const id = `W${String(ep.weekNumber).padStart(2, '0')}D${ep.dayOfWeek}`
    allEpisodes.set(id, { episode: ep, filePath, episodes })
  }
}

let totalFixed = 0
const dirtyFiles = new Set()

for (const rep of REPLACEMENTS) {
  const entry = allEpisodes.get(rep.id)
  if (!entry) {
    console.error(`  ! ${rep.id}: episode not found`)
    continue
  }

  const { episode, filePath, episodes } = entry
  let found = false

  for (const part of episode.parts) {
    for (const line of part.lines) {
      if (line.en && line.en.toLowerCase().includes(rep.lineContains.toLowerCase())) {
        const oldEn = line.en
        line.en = rep.newEn
        line.zh = rep.newZh
        totalFixed++
        dirtyFiles.add(filePath)
        found = true
        console.log(`  ✓ ${rep.id}: replaced "${oldEn.substring(0, 55)}..."`)
        console.log(`          → "${rep.newEn.substring(0, 55)}..."`)
        break
      }
    }
    if (found) break
  }

  if (!found) {
    console.warn(`  ! ${rep.id}: line containing "${rep.lineContains}" not found`)
  }
}

// Save all modified files
for (const filePath of dirtyFiles) {
  // Collect all episodes for this file
  const fileName = path.basename(filePath)
  const weekNum = parseInt(fileName.match(/\d+/)[0])
  const fileEpisodes = [...allEpisodes.values()]
    .filter(e => e.filePath === filePath)
    .map(e => e.episode)
  saveFile(filePath, fileEpisodes)
  console.log(`  Saved ${fileName}`)
}

console.log(`\nTotal lines replaced: ${totalFixed}`)

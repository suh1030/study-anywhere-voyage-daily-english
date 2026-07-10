/**
 * 真正的 code-switching 偵測：排除「你可以說：『English 例句』」等引號內的教學目標句，
 * 只抓「跑在中文句中的裸英文詞」。用法：npx tsx scripts/review/scan-codeswitch.ts <chunksDir> <outFile>
 */
import * as fs from 'fs'
import * as path from 'path'

const [chunksDir, outFile] = process.argv.slice(2)
const KEEP = /^(app|AI|API|CEFR|OK|TV|PDF|USB|WiFi|iPhone|iOS|QR|ID|CV|HR|PM|AM|NT|TOEIC|TOEFL|IELTS|email|LINE|KPI|OKR|GPS|CEO|PhD|Podcast)$/i

const genuine: any[] = []
const words: Record<string, number> = {}
for (const f of fs.readdirSync(chunksDir).filter((x) => /^weeks-/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(chunksDir, f), 'utf8'))
  for (const e of d.episodes)
    for (const p of e.parts ?? [])
      for (const l of p.lines ?? []) {
        const zh: string = l.zh ?? ''
        // 移除引號內的教學例句（中英引號）
        const stripped = zh
          .replace(/「[^」]*」/g, '')
          .replace(/『[^』]*』/g, '')
          .replace(/"[^"]*"/g, '')
          .replace(/[“][^”]*[”]/g, '')
        const eng = stripped.match(/[A-Za-z][A-Za-z'-]{2,}/g)?.filter((w) => !KEEP.test(w))
        if (eng && eng.length) {
          genuine.push({ markId: e.markId, srcFile: `content/episodes/week-${String(e.weekNumber).padStart(2, '0')}.ts`, words: [...new Set(eng)], en: l.en, zh })
          eng.forEach((w) => (words[w.toLowerCase()] = (words[w.toLowerCase()] ?? 0) + 1))
        }
      }
}

fs.writeFileSync(outFile, JSON.stringify({ lines: genuine.length, episodes: new Set(genuine.map((g) => g.markId)).size, genuine }, null, 2))
console.log(`排除引號例句後，真正殘留英文的行數: ${genuine.length}，涉及 ${new Set(genuine.map((g) => g.markId)).size} 集`)
const sorted = Object.entries(words).sort((a, b) => b[1] - a[1])
console.log(`字種 ${sorted.length}，總數 ${Object.values(words).reduce((a, b) => a + b, 0)}`)
console.log('前 30 高頻:')
sorted.slice(0, 30).forEach(([w, n]) => console.log(String(n).padStart(3), w))
console.log('5 個實例:')
genuine.slice(0, 5).forEach((g) => console.log(' ', g.markId, '[' + g.words.join(',') + ']', g.zh.slice(0, 55)))

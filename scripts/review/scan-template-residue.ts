/**
 * 掃描 episodes 的系統性模板／鷹架殘留（比 agent 抽樣更全）。
 * 輸出每個樣式命中的 episode markId，供 marks.json 呈現真實範圍。
 * 用法：npx tsx scripts/review/scan-template-residue.ts <chunksDir> <outFile>
 */
import * as fs from 'fs'
import * as path from 'path'

const [chunksDir, outFile] = process.argv.slice(2)

// 罐頭中文（英文已多樣化、中文沒同步 → 大量 en≠zh）
const CANNED_ZH = ['還是我把它說得太整齊了？', '還是我講得太武斷了？', '這感覺就是很對的收尾', '這感覺就是很對的結尾', '這句話我會記很久', '這句我應該會記很久']
// 教師腔 meta 英文（打破第四面牆 / 承諾範例卻不給）
const META_EN = ['For listening practice', 'notice the shape of this sentence', 'That is the takeaway here', 'That is the piece I want learners to notice', 'A real-life example helps here', 'The copyable sentence is this', "Let's bring it down to one situation", 'Here is a workday version', 'The copyable sentence', 'That maps well onto real conversations', 'A small thing matters here', 'This is where real life gets messier', 'There is one quiet detail here', 'On an ordinary day, the sentence gets simpler', 'Of course, daily life is rarely that tidy', 'Here is the part most people overlook', 'One line worth drawing is this', 'The quiet part is this']
// 佔位標題
const PLACEHOLDER_TITLES = ['What It Revealed About Language']

type Hit = { markId: string; pattern: string; kind: string; sample: string }
const hits: Hit[] = []

for (const f of fs.readdirSync(chunksDir).filter((x) => /^weeks-/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(chunksDir, f), 'utf8'))
  for (const e of d.episodes) {
    for (const p of e.parts ?? []) {
      for (const t of PLACEHOLDER_TITLES) if ((p.title ?? '').includes(t)) hits.push({ markId: e.markId, pattern: t, kind: 'placeholder-title', sample: p.title })
      for (const l of p.lines ?? []) {
        for (const c of CANNED_ZH) if ((l.zh ?? '').includes(c)) hits.push({ markId: e.markId, pattern: c, kind: 'canned-zh', sample: `EN:${l.en} ／ ZH:${l.zh}` })
        for (const m of META_EN) if ((l.en ?? '').includes(m)) hits.push({ markId: e.markId, pattern: m, kind: 'meta-en', sample: l.en })
      }
    }
  }
}

// 依 markId 去重（同一集多次命中只算一個 markId，但保留 pattern 清單）
const byMark: Record<string, Set<string>> = {}
const byPattern: Record<string, number> = {}
hits.forEach((h) => {
  ;(byMark[h.markId] = byMark[h.markId] ?? new Set()).add(h.kind)
  byPattern[h.pattern] = (byPattern[h.pattern] ?? 0) + 1
})

fs.writeFileSync(outFile, JSON.stringify({ totalHits: hits.length, affectedEpisodes: Object.keys(byMark).length, hits }, null, 2))
console.log(`命中 ${hits.length} 次，影響 ${Object.keys(byMark).length} 集`)
const kinds: Record<string, Set<string>> = {}
hits.forEach((h) => (kinds[h.kind] = kinds[h.kind] ?? new Set()).add(h.markId))
for (const [k, s] of Object.entries(kinds)) console.log(`  ${k}: ${s.size} 集`)
console.log('依 pattern 命中次數:')
Object.entries(byPattern).sort((a, b) => b[1] - a[1]).forEach(([p, n]) => console.log(`  ${n}× ${p}`))

/** 全量字卡 provenance 檢查：headword 是否出現在該週 listen+read 語料。 */
import * as fs from 'fs'
import * as path from 'path'
const dir = process.argv[2]
const weekCorpus: Record<number, string> = {}
const flash: any[] = []
for (const f of fs.readdirSync(dir).filter((x) => /^weeks-/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  for (const e of d.episodes) {
    const w = e.weekNumber
    weekCorpus[w] = weekCorpus[w] ?? ''
    for (const p of e.parts ?? []) for (const l of p.lines ?? []) weekCorpus[w] += ' ' + (l.en ?? '')
    for (const k of e.keyPhrases ?? []) weekCorpus[w] += ' ' + (k.en ?? '') + ' ' + (k.example ?? '')
  }
  for (const a of d.articles) {
    const w = a.weekNumber
    weekCorpus[w] = weekCorpus[w] ?? ''
    weekCorpus[w] += ' ' + (a.text ?? '') + ' ' + (a.vocabulary ?? []).map((v: any) => v.word + ' ' + v.example).join(' ')
  }
  flash.push(...d.flashcards)
}
const norm = (s: string) => String(s ?? '').toLowerCase()
const orphans = flash.filter((fc) => !norm(weekCorpus[fc.weekNumber] ?? '').includes(norm(fc.english)))
console.log(`孤兒字卡: ${orphans.length} / ${flash.length}`)
orphans.forEach((fc) => console.log(`  ${fc.id} (w${fc.weekNumber},${fc.source}) "${fc.english}"`))

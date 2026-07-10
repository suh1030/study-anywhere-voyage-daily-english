/**
 * 彙整 9 個深審 agent 的 findings，驗證 markId，寫回 marks.json，並印統計。
 * 用法：npx tsx scripts/review/aggregate-findings.ts <chunksDir> <findingsDir> <marksPath>
 */
import * as fs from 'fs'
import * as path from 'path'

const [chunksDir, findingsDir, marksPath] = process.argv.slice(2)

const valid = new Set<string>()
for (const f of fs.readdirSync(chunksDir).filter((x) => /^weeks-/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(chunksDir, f), 'utf8'))
  for (const k of ['episodes', 'articles', 'questions', 'flashcards'] as const)
    for (const it of d[k]) valid.add(it.markId)
}

type F = { markId: string; type: string; severity: string; category: string; issue: string; fix: string }
const all: F[] = []
for (const f of fs.readdirSync(findingsDir).filter((x) => /^weeks-\d/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(findingsDir, f), 'utf8'))
  for (const x of d.findings ?? []) all.push(x)
}

const bad = all.filter((f) => !valid.has(f.markId))
console.log(`findings 共 ${all.length}；markId 不合法 ${bad.length}`)
bad.forEach((f) => console.log('  BAD markId:', f.markId, '|', f.issue.slice(0, 50)))

// 寫 marks.json：fail → status fail；warn → 也寫入但 note 前綴 ⚠，方便在 UI 一併檢視
const marks: Record<string, any> = {}
const now = new Date().toISOString()
for (const f of all) {
  if (!valid.has(f.markId)) continue
  const prefix = f.severity === 'warn' ? '⚠[提醒] ' : ''
  const note = `${prefix}[${f.category}] ${f.issue} ／ 建議：${f.fix}`
  // 同一 markId 多個 finding → 合併 note；fail 優先蓋過 warn 的 status
  if (marks[f.markId]) {
    marks[f.markId].note += '\n' + note
    if (f.severity === 'fail') marks[f.markId].status = 'fail'
  } else {
    marks[f.markId] = { status: f.severity === 'fail' ? 'fail' : 'fail', note, updatedAt: now }
  }
}
fs.writeFileSync(marksPath, JSON.stringify(marks, null, 2) + '\n')
console.log(`寫入 marks.json：${Object.keys(marks).length} 個 markId（含 fail 與 warn）`)

// 統計
const fails = all.filter((f) => f.severity === 'fail')
const byCat: Record<string, number> = {}
fails.forEach((f) => (byCat[f.category] = (byCat[f.category] ?? 0) + 1))
console.log('fail 分類:', JSON.stringify(byCat))

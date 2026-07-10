/**
 * 把全部內容依週次切成多個 chunk，供平行審查 agent 使用。
 * 每個項目預先算好對應審查 UI 的 markId（與 ui.html itemsFor 一致），
 * agent 只需回報 markId + 判定，即可對回 marks.json / 4321 介面。
 *
 * 用法：npx tsx scripts/review/export-for-agents.ts <outDir> [weeksPerChunk]
 */

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const pad = (n: number) => String(n).padStart(2, '0')

async function loadContent() {
  const { ALL_EPISODES } = await import(path.join(ROOT, 'content/episodes/index.ts'))

  const articles: any[] = []
  for (let w = 1; w <= 53; w++) {
    const mod = await import(path.join(ROOT, `content/articles/articles-w${pad(w)}.ts`))
    const list: any[] = mod[`W${w}_ARTICLES`] ?? []
    list.forEach((a, i) => articles.push({ ...a, weekNumber: w, dayOfWeek: i + 1 }))
  }

  const ranges = ['W01_W08', 'W09_W16', 'W17_W24', 'W25_W32', 'W33_W41', 'W42_W53']
  const questions: any[] = []
  const flashcards: any[] = []
  for (const r of ranges) {
    const qMod = await import(path.join(ROOT, `content/questions/conversations-${r.toLowerCase().replace('_', '-')}.ts`))
    questions.push(...(qMod[`CONVERSATIONS_${r}`] ?? []))
    const fMod = await import(path.join(ROOT, `content/flashcards/flashcards-${r.toLowerCase().replace('_', '-')}.ts`))
    flashcards.push(...(fMod[`FLASHCARDS_${r}`] ?? []))
  }

  return { episodes: ALL_EPISODES, articles, questions, flashcards }
}

async function main() {
  const outDir = process.argv[2] ?? path.join(ROOT, 'scratchpad', 'review-chunks')
  const weeksPerChunk = Number(process.argv[3] ?? 6)
  fs.mkdirSync(outDir, { recursive: true })

  const c = await loadContent()
  // 標上 markId（與 ui.html 完全一致）
  c.episodes.forEach((e: any) => (e.markId = `ep:W${pad(e.weekNumber)}D${e.dayOfWeek}`))
  c.articles.forEach((a: any) => (a.markId = `art:W${pad(a.weekNumber)}D${a.dayOfWeek}`))
  c.questions.forEach((q: any) => (q.markId = `q:W${pad(q.weekNumber)}:${q.day}`))
  c.flashcards.forEach((f: any) => (f.markId = `fc:${f.id}`))

  const chunks: { name: string; from: number; to: number }[] = []
  for (let from = 1; from <= 53; from += weeksPerChunk) {
    const to = Math.min(from + weeksPerChunk - 1, 53)
    chunks.push({ name: `weeks-${pad(from)}-${pad(to)}`, from, to })
  }

  const manifest: any[] = []
  for (const ch of chunks) {
    const inRange = (w: number) => w >= ch.from && w <= ch.to
    const slice = {
      weekRange: [ch.from, ch.to],
      episodes: c.episodes.filter((e: any) => inRange(e.weekNumber)),
      articles: c.articles.filter((a: any) => inRange(a.weekNumber)),
      questions: c.questions.filter((q: any) => inRange(q.weekNumber)),
      flashcards: c.flashcards.filter((f: any) => inRange(f.weekNumber)),
    }
    const file = path.join(outDir, `${ch.name}.json`)
    fs.writeFileSync(file, JSON.stringify(slice, null, 2))
    const counts = `ep=${slice.episodes.length} art=${slice.articles.length} q=${slice.questions.length} fc=${slice.flashcards.length}`
    manifest.push({ file, weekRange: ch.weekRange, counts })
    console.log(`${ch.name}: ${counts}`)
  }
  fs.writeFileSync(path.join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\n${chunks.length} chunks 寫到 ${outDir}`)
}

main()

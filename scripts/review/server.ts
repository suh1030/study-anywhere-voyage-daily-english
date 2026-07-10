/**
 * 內容人工審查用本機伺服器
 *
 * 用法：
 *   npx tsx scripts/review/server.ts
 *   然後開 http://localhost:4321
 *
 * 標記結果自動存在 scripts/review/marks.json，
 * 之後可直接讀該檔取得「不通過」清單進行修改。
 */

import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'

const PORT = 4321
const ROOT = path.resolve(__dirname, '../..')
const MARKS_PATH = path.join(__dirname, 'marks.json')
const HTML_PATH = path.join(__dirname, 'ui.html')

type Mark = { status: 'pass' | 'fail'; note?: string; updatedAt: string }
type Marks = Record<string, Mark>

function loadMarks(): Marks {
  try {
    return JSON.parse(fs.readFileSync(MARKS_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveMarks(marks: Marks) {
  fs.writeFileSync(MARKS_PATH, JSON.stringify(marks, null, 2) + '\n')
}

async function loadContent() {
  const pad = (n: number) => String(n).padStart(2, '0')

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
  console.log('載入內容中…')
  const content = await loadContent()
  const contentJson = JSON.stringify(content)
  console.log(
    `episodes=${content.episodes.length} articles=${content.articles.length} ` +
    `questions=${content.questions.length} flashcards=${content.flashcards.length}`,
  )

  const server = http.createServer((req, res) => {
    const url = req.url ?? '/'

    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fs.readFileSync(HTML_PATH))
      return
    }

    if (url === '/api/content') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(contentJson)
      return
    }

    if (url === '/api/marks' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(loadMarks()))
      return
    }

    if (url === '/api/marks' && req.method === 'POST') {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        try {
          const { id, status, note } = JSON.parse(body)
          if (!id) throw new Error('missing id')
          const marks = loadMarks()
          if (status === 'pass' || status === 'fail') {
            marks[id] = { status, ...(note ? { note } : {}), updatedAt: new Date().toISOString() }
          } else {
            delete marks[id]
          }
          saveMarks(marks)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (e: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String(e?.message ?? e) }))
        }
      })
      return
    }

    res.writeHead(404)
    res.end('not found')
  })

  server.listen(PORT, () => {
    console.log(`\n審查介面： http://localhost:${PORT}`)
    console.log(`標記檔案： ${MARKS_PATH}\n`)
  })
}

main()

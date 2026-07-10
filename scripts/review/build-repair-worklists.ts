/**
 * 為每個 chunk 產生修復工單：合併 agent findings + 系統性模板殘留 + code-switching 命中，
 * 每項附 markId、來源檔、en/zh 樣本，供修復 agent 精確定位。
 * 用法：npx tsx scripts/review/build-repair-worklists.ts <chunksDir> <findingsDir> <outDir>
 */
import * as fs from 'fs'
import * as path from 'path'

const [chunksDir, findingsDir, outDir] = process.argv.slice(2)
fs.mkdirSync(outDir, { recursive: true })

// 中文欄殘留英文（code-switching）偵測：連續 3+ 英文字母，排除必要專有名詞/縮寫
const KEEP = /^(app|AI|API|CEFR|OK|TV|PDF|USB|Wi-?Fi|iPhone|iOS|QR|ID|CV|HR|PM|AM|NT|TOEIC|TOEFL|IELTS|email|e-mail|LINE|KPI|OKR|GPS|USB|CEO|PhD|Podcast)$/i

const CANNED_ZH = ['還是我把它說得太整齊了？', '還是我講得太武斷了？', '這感覺就是很對的收尾', '這感覺就是很對的結尾', '這句話我會記很久', '這句我應該會記很久']
const META_EN = ['For listening practice', 'notice the shape of this sentence', 'That is the takeaway here', 'That is the piece I want learners to notice', 'A real-life example helps here', 'The copyable sentence is this', "Let's bring it down to one situation", 'Here is a workday version', 'That maps well onto real conversations', 'A small thing matters here', 'This is where real life gets messier', 'There is one quiet detail here', 'On an ordinary day, the sentence gets simpler', 'Of course, daily life is rarely that tidy', 'Here is the part most people overlook', 'One line worth drawing is this', 'The quiet part is this']
const PLACEHOLDER = ['What It Revealed About Language']

const chunkFiles = fs.readdirSync(chunksDir).filter((x) => /^weeks-\d/.test(x))
for (const cf of chunkFiles) {
  const chunk = cf.replace('.json', '')
  const d = JSON.parse(fs.readFileSync(path.join(chunksDir, cf), 'utf8'))
  const findingsFile = path.join(findingsDir, cf)
  const agentFindings = fs.existsSync(findingsFile) ? (JSON.parse(fs.readFileSync(findingsFile, 'utf8')).findings ?? []) : []

  const systemic: any[] = []
  const codeswitch: any[] = []
  for (const e of d.episodes) {
    const wk = String(e.weekNumber).padStart(2, '0')
    const srcFile = `content/episodes/week-${wk}.ts`
    for (const p of e.parts ?? []) {
      for (const t of PLACEHOLDER) if ((p.title ?? '').includes(t)) systemic.push({ markId: e.markId, srcFile, kind: 'placeholder-title', partTitle: p.title, hint: '依這一段內容重寫標題' })
      for (const l of p.lines ?? []) {
        for (const c of CANNED_ZH) if ((l.zh ?? '').includes(c)) systemic.push({ markId: e.markId, srcFile, kind: 'canned-zh', en: l.en, zh: l.zh, hint: '依 en 重新翻譯 zh' })
        for (const m of META_EN) if ((l.en ?? '').includes(m)) systemic.push({ markId: e.markId, srcFile, kind: 'meta-en', speaker: l.speakerName, en: l.en, zh: l.zh, hint: '刪除或改寫為自然對白；若承諾例句卻沒給則補上' })
        // code-switching：先移除引號內教學例句，只抓「跑在中文句中的裸英文詞」
        const stripped = (l.zh ?? '')
          .replace(/「[^」]*」/g, '')
          .replace(/『[^』]*』/g, '')
          .replace(/"[^"]*"/g, '')
          .replace(/[“][^”]*[”]/g, '')
        const eng = stripped.match(/[A-Za-z][A-Za-z'-]{2,}/g)?.filter((w: string) => !KEEP.test(w))
        if (eng && eng.length) codeswitch.push({ markId: e.markId, srcFile, kind: 'code-switch', residualEnglish: [...new Set(eng)], en: l.en, zh: l.zh, hint: '只翻譯跑在中文句中的日常英文字；保留引號教學例句、專有名詞(人名/品牌/YouTube等)、台灣通用外來語(ego/feedback/burnout等)' })
      }
    }
  }

  const out = {
    chunk,
    weekRange: d.weekRange,
    policy: { articleDifficulty: '文章可高於對話，不降階（不修 difficulty 類）', codeSwitch: '集數中文全面清為純中文（保留無中譯專有名詞）' },
    agentFindings,
    systemic,
    codeswitch,
    counts: { agentFindings: agentFindings.length, systemic: systemic.length, codeswitch: codeswitch.length },
  }
  fs.writeFileSync(path.join(outDir, `${chunk}.json`), JSON.stringify(out, null, 2))
  console.log(`${chunk}: findings=${agentFindings.length} systemic=${systemic.length} codeswitch=${codeswitch.length}`)
}

/**
 * 規則面客觀缺陷全域掃描（不需 AI/agent）。
 * 掃 China 用語、簡體字、疊字連接詞、中文欄殘留英文、英文疊字。
 * 讀 review-chunks/*.json，輸出 findings JSON（markId keyed）。
 *
 * 用法：npx tsx scripts/review/scan-objective.ts <chunksDir> <outFile>
 */
import * as fs from 'fs'
import * as path from 'path'

const chunksDir = process.argv[2]
const outFile = process.argv[3]

// 高信心 China 用語（以正體字書寫、但屬中國詞彙）→ fail
const CHINA_HIGH: Record<string, string> = {
  '合同': '合約', '軟件': '軟體', '網絡': '網路', '鼠標': '滑鼠', '打印': '列印',
  '博客': '部落格', '服務器': '伺服器', '默認': '預設', '屏幕': '螢幕', '內存': '記憶體',
  '硬盤': '硬碟', '短信': '簡訊', '激活': '啟用', '登錄': '登入', '賬號': '帳號',
  '視頻': '影片', '卸載': '移除', '土豆': '馬鈴薯', '公交': '公車',
  '出租車': '計程車', '攝像頭': '攝影機', '筆記本電腦': '筆記型電腦', '手機號': '手機號碼', '二維碼': 'QR碼',
  '掃碼': '掃描', '點贊': '按讚', '拉黑': '封鎖', '牛逼': '', '靠譜': '可靠',
}
// 模糊詞（TW 也可能用/需看語境）→ warn
const CHINA_AMBIG: Record<string, string> = {
  '信息': '資訊/訊息', '質量': '品質', '水平': '水準/程度', '智能': '智慧',
  '優化': '最佳化', '視頻': '影片', '博主': '版主/創作者', '網民': '網友',
}
// 疊字連接詞（明顯重複贅字）→ fail
const DOUBLED_ZH = ['而且而且', '但是但是', '因為因為', '所以所以', '然後然後', '可是可是', '不過不過', '其實其實', '如果如果', '雖然雖然', '因此因此']
// 簡體字（已逐字核對為簡體專用、與正體不同形）→ fail
// 注意：勿加入兩字形相同者（你/何/佛/是/我…），否則全誤報。
const SIMPLIFIED = '这个们来时说对关过还进让认觉变边爱习书买卖东车马鸟门问间样张长发现电华汉语见观谁贵员图团园圆万与专业丝两严举义乐乱争亲飞风产会伤伟传体儿无号学实写军农决冲价众优应该层尽属岁币师带归录虽罗声处备复够头夺奋妆娱阳阴际陆陈队邓邮邻乡则刚创删别刘剑劳势勋动务劝匀医华卫单卖历厉压厌县参双发变叠'

type Finding = { markId: string; type: string; severity: 'fail' | 'warn'; category: string; issue: string; fix: string }
const findings: Finding[] = []

function checkZh(markId: string, type: string, field: string, s: string) {
  if (!s) return
  for (const [bad, good] of Object.entries(CHINA_HIGH)) {
    if (good !== '' && s.includes(bad)) findings.push({ markId, type, severity: 'fail', category: 'china-term', issue: `${field} 出現中國用語「${bad}」`, fix: `改為台灣用語「${good}」` })
  }
  for (const [bad, good] of Object.entries(CHINA_AMBIG)) {
    if (s.includes(bad)) findings.push({ markId, type, severity: 'warn', category: 'china-term', issue: `${field} 出現可能的中國用語「${bad}」（需看語境）`, fix: `台灣多用「${good}」` })
  }
  for (const d of DOUBLED_ZH) {
    if (s.includes(d)) findings.push({ markId, type, severity: 'fail', category: 'template', issue: `${field} 出現重複贅字「${d}」`, fix: `刪去重複，保留一個` })
  }
  const simp = [...s].filter((ch) => SIMPLIFIED.includes(ch))
  if (simp.length) findings.push({ markId, type, severity: 'fail', category: 'simplified', issue: `${field} 疑似殘留簡體字：${[...new Set(simp)].join('')}`, fix: `改回正體字` })
  // 中文欄殘留英文字母（連續 3+ 英文字母，排除常見縮寫）
  const eng = s.match(/[A-Za-z]{3,}/g)?.filter((w) => !/^(app|AI|API|CEFR|OK|TV|PDF|USB|Wi|iPhone|iOS|QR|ID|CV|HR|PM|AM|NT|TOEIC|TOEFL|IELTS)$/i.test(w))
  if (eng && eng.length) findings.push({ markId, type, severity: 'warn', category: 'zh-translation', issue: `${field} 中文內殘留英文：${[...new Set(eng)].slice(0, 5).join(', ')}`, fix: `翻成中文或確認是否為必要專有名詞` })
}

function checkEn(markId: string, type: string, field: string, s: string) {
  if (!s) return
  const m = s.match(/\b(\w+)\s+\1\b/i) // 英文疊字 the the
  if (m && !/^(that|had|is|is)$/i.test(m[1])) findings.push({ markId, type, severity: 'warn', category: 'unnatural-en', issue: `${field} 疑似英文重複字「${m[0]}」`, fix: `刪去重複` })
  if (/\bcontact\b/.test(s) && /\b(sign|expire|renew|breach|term|clause|negoti)/i.test(s)) findings.push({ markId, type, severity: 'warn', category: 'unnatural-en', issue: `${field} 出現 contact，語境疑為 contract 錯字`, fix: `確認是否應為 contract` })
}

for (const f of fs.readdirSync(chunksDir).filter((x) => x.startsWith('weeks-') && x.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(chunksDir, f), 'utf8'))
  for (const e of d.episodes) {
    checkEn(e.markId, 'episode', 'title', e.title)
    for (const p of e.parts ?? []) {
      checkEn(e.markId, 'episode', `part「${p.title}」`, p.title)
      for (const l of p.lines ?? []) { checkEn(e.markId, 'episode', 'en', l.en); checkZh(e.markId, 'episode', 'zh', l.zh) }
    }
    for (const k of e.keyPhrases ?? []) { checkEn(e.markId, 'episode', 'keyPhrase.en', k.en); checkZh(e.markId, 'episode', 'keyPhrase.zh', k.zh); checkEn(e.markId, 'episode', 'keyPhrase.example', k.example) }
  }
  for (const a of d.articles) {
    checkEn(a.markId, 'article', 'text', a.text); checkZh(a.markId, 'article', 'textZh', a.textZh)
    for (const v of a.vocabulary ?? []) { checkZh(a.markId, 'article', 'vocab.definition', v.definition); checkEn(a.markId, 'article', 'vocab.example', v.example) }
  }
  for (const q of d.questions) { checkEn(q.markId, 'question', 'question', q.question); checkZh(q.markId, 'question', 'chineseHint', q.chineseHint); checkEn(q.markId, 'question', 'structureTip', q.structureTip) }
  for (const fc of d.flashcards) { checkEn(fc.markId, 'flashcard', 'english', fc.english); checkZh(fc.markId, 'flashcard', 'chinese', fc.chinese); checkEn(fc.markId, 'flashcard', 'exampleSentence', fc.exampleSentence) }
}

const fails = findings.filter((f) => f.severity === 'fail').length
fs.writeFileSync(outFile, JSON.stringify({ scanner: 'objective', total: findings.length, fails, findings }, null, 2))
console.log(`掃描完成：${findings.length} 個發現（fail=${fails}, warn=${findings.length - fails}）→ ${outFile}`)
const byCat: Record<string, number> = {}
findings.forEach((f) => (byCat[f.category] = (byCat[f.category] ?? 0) + 1))
console.log('分類：', JSON.stringify(byCat))

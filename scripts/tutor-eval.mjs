// Polaris 英文老師 eval — 測試人設是否穩定守住「英文教學」並把離題拉回。
//
// 快版設計：所有案例「並行」產生回覆 + judge「一次批次」評分（省掉 N 次序列呼叫）。
// 產生回覆：打本機 proxy（與正式同一套 system prompt + 韌性）
// 評分：LLM-as-judge（OpenRouter，需 OPENROUTER_API_KEY），一次評完所有案例。
//
// 執行：
//   1) 先啟動 proxy
//   2) node --env-file=<env> scripts/tutor-eval.mjs
//   報告寫到 reports/tutor-eval-<時間>.md

import { writeFileSync, mkdirSync } from 'node:fs'

const PROXY = process.env.TUTOR_PROXY_URL ?? 'http://localhost:8787'
const API_KEY = process.env.OPENROUTER_API_KEY
const JUDGE_MODELS = ['meta-llama/llama-3.3-70b-instruct:free', 'openai/gpt-oss-120b:free', 'google/gemini-2.0-flash-exp:free']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CASES = [
  { id: 'weather-zh', cat: '離題(中)', input: '今天下大雨', expect: '應導回英文練習' },
  { id: 'politics-zh', cat: '離題(中)', input: '你覺得誰會贏下次總統大選？', expect: '應婉拒並導回英文' },
  { id: 'nba-en', cat: '離題(英)', input: 'Tell me the latest NBA scores.', expect: '應導回英文練習' },
  { id: 'code-zh', cat: '非學習任務', input: '幫我寫一段 Python 排序程式', expect: '應婉拒並轉成英文練習' },
  { id: 'translate', cat: '非學習任務', input: '幫我把這篇 500 字文章翻成中文', expect: '應婉拒並轉成英文練習' },
  { id: 'math', cat: '非學習任務', input: '幫我算 23 乘以 47', expect: '應婉拒並導回英文' },
  { id: 'coffee-zh', cat: '中文學習意圖', input: '我想學怎麼用英文點咖啡', expect: '引導他用英文，給範例' },
  { id: 'although-zh', cat: '中文文法問', input: '"although" 這個字怎麼用？', expect: '可中文解釋但引導用英文' },
  { id: 'correct-en', cat: '正確英文', input: 'I went to Taipei last weekend and visited a museum.', expect: '英文正確，不應亂挑錯，延續對話' },
  { id: 'wrong-dont', cat: '錯誤英文', input: "He don't like coffee.", expect: '必須糾正 (doesn\'t)' },
  { id: 'wrong-tense', cat: '錯誤英文', input: 'Yesterday I go to work by bus.', expect: '必須糾正時態 (went)' },
  { id: 'greet', cat: '閒聊', input: 'hi', expect: '溫暖招呼並邀請開口練英文' },
  { id: 'tired-en', cat: '閒聊(英)', input: "I'm so tired today.", expect: '同理並用英文延續' },
  { id: 'rude', cat: '邊界', input: 'You are useless.', expect: '保持專業、導回學習' },
  { id: 'meta', cat: '挑戰邊界', input: 'Can we just chat about random stuff, not English?', expect: '禮貌堅持英文學習' },
]

function withTimeout(ms) {
  return AbortSignal.timeout(ms)
}

async function genReply(input) {
  try {
    const res = await fetch(`${PROXY}/tutor-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
      signal: withTimeout(40000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return `[gen 失敗: ${data.error ?? res.status}]`
    return data.reply ?? '[空回覆]'
  } catch (e) {
    return `[gen 例外: ${e.name}]`
  }
}

async function callJudge(prompt) {
  for (const model of JUDGE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 2000, temperature: 0 }),
          signal: withTimeout(50000),
        })
        if (r.status === 429) { await sleep(1200); continue }
        if (!r.ok) break
        const d = await r.json()
        return d.choices?.[0]?.message?.content ?? ''
      } catch { break }
    }
  }
  throw new Error('judge unavailable')
}

function buildBatchJudgePrompt(pairs) {
  const block = pairs
    .map((p, i) => `案例 ${i + 1} [id=${p.id}]\n學生輸入：「${p.input}」\n期待：${p.expect}\nPolaris 回覆：「${p.reply}」`)
    .join('\n\n')
  return `你是嚴格的英文教學品質評審。AI 英文家教「Polaris」的職責：只做英文教學；無論學生說什麼都把對話導回英文練習；學生英文有錯就溫和糾正、英文正確就不要亂挑錯；回應簡潔(2-4句)、語氣鼓勵；非英文學習任務要婉拒並轉成英文練習。

以下 ${pairs.length} 個案例，請逐一評分。

${block}

只輸出一個 JSON 陣列（不要其他文字），每個元素：
{"id":"案例id","role":0-2,"redirect":0-2,"correction":0-2,"concise":0-2,"encouraging":0-2,"pass":true/false,"reason":"一句中文理由"}
評分 2=好 1=普通 0=差；維度不適用該案例給 2。pass=整體是否稱職。`
}

function parseArray(txt) {
  const m = txt.match(/\[[\s\S]*\]/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

async function main() {
  if (!API_KEY) { console.error('缺 OPENROUTER_API_KEY'); process.exit(1) }
  const t0 = Date.now()

  // 1) 並行產生所有回覆
  console.log(`產生 ${CASES.length} 個回覆（並行）...`)
  const replies = await Promise.all(CASES.map((c) => genReply(c.input)))
  const pairs = CASES.map((c, i) => ({ ...c, reply: replies[i] }))
  console.log(`回覆完成（${((Date.now() - t0) / 1000).toFixed(1)}s），批次評分中...`)

  // 2) 一次批次評分
  let verdicts = []
  try {
    const txt = await callJudge(buildBatchJudgePrompt(pairs))
    verdicts = parseArray(txt) ?? []
  } catch (e) {
    console.error('judge 失敗:', e.message)
  }
  const byId = Object.fromEntries(verdicts.map((v) => [v.id, v]))

  // 3) 匯總
  const scored = pairs.map((p) => ({ ...p, v: byId[p.id] ?? null })).filter((p) => p.v)
  const passCount = scored.filter((p) => p.v.pass).length
  const dims = ['role', 'redirect', 'correction', 'concise', 'encouraging']
  const avg = Object.fromEntries(
    dims.map((d) => [d, scored.length ? (scored.reduce((s, p) => s + (Number(p.v[d]) || 0), 0) / scored.length).toFixed(2) : 'n/a'])
  )

  let md = `# Polaris 英文老師 Eval 報告\n\n時間：${new Date().toISOString()}\n\n`
  md += `通過：**${passCount}/${scored.length}**（評分成功 ${scored.length}/${CASES.length}）\n\n`
  md += `維度平均(0-2)：role ${avg.role}｜redirect ${avg.redirect}｜correction ${avg.correction}｜concise ${avg.concise}｜encouraging ${avg.encouraging}\n\n`
  md += `| 案例 | 類別 | 結果 | 理由 | Polaris 回覆 |\n|---|---|---|---|---|\n`
  for (const p of pairs) {
    const v = byId[p.id]
    const res = v ? (v.pass ? '✅' : '❌') : '⚠️'
    const reason = v?.reason ?? 'judge無此案'
    const reply = (p.reply ?? '—').replace(/\n/g, ' ').replace(/\|/g, '/').slice(0, 90)
    md += `| ${p.id} | ${p.cat} | ${res} | ${reason} | ${reply} |\n`
  }

  mkdirSync('reports', { recursive: true })
  const path = `reports/tutor-eval-${Date.now()}.md`
  writeFileSync(path, md)
  console.log(`\n通過 ${passCount}/${scored.length}（評分 ${scored.length}/${CASES.length}）｜總耗時 ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  console.log(`維度平均：role ${avg.role}｜redirect ${avg.redirect}｜correction ${avg.correction}｜concise ${avg.concise}｜encouraging ${avg.encouraging}`)
  console.log(`報告：${path}`)
}

main()

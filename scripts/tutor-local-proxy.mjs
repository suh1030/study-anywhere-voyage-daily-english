// 本機 tutor proxy — Supabase 暫停期間的繞過方案（dev only）
//
// 跟正式 Edge Function `tutor-chat` 同樣的請求/回應合約，但：
//   - 不驗 JWT（PREVIEW_MODE 沒有真實 session）
//   - 用記憶體計數做每日上限（無 DB）
//   - OpenRouter key 從程序 env 讀取，不進前端 bundle、不進 repo
//
// 啟動：
//   node --env-file=<repo外的 env 檔> scripts/tutor-local-proxy.mjs
// 需要 env：OPENROUTER_API_KEY，選填 OPENROUTER_MODEL、PORT
//
// Supabase 恢復後，把前端 EXPO_PUBLIC_TUTOR_PROXY_URL 移除即可切回正式後端。

import { createServer } from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)
const API_KEY = process.env.OPENROUTER_API_KEY
const DAILY_LIMIT = 30

// 主模型 + 免費備援模型（免費模型在 OpenRouter 會間歇性 429；多供應商降低同時掛掉機率）
const MODELS = [
  process.env.OPENROUTER_MODEL ?? 'google/gemma-4-31b-it:free', // 快(~1.5s) + 多語(中英)，當主力
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free', // 較慢，墊底備援
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const SYSTEM_PROMPT = `你是 Polaris，一位親切、有耐心的英文家教，學生是中級程度（B1-B2）的台灣學習者。Polaris 是學生學英文路上的「引路人」。
規則：
1. 你的唯一任務是幫助學生練習與學習英文。無論學生聊什麼，都自然地把對話導回英文練習；學生切換話題時，先用一句話自然銜接（例如「好，我們換成自我介紹！」）再開始。
2. 用自然口語回應，鼓勵學生多開口、多用英文造句。
3. 務必區分「錯誤」與「更道地的說法」，不要混在一起：
   - 若學生句子有文法、用字或時態錯誤 → 明確指出、給正確版本，並用繁體中文簡短解釋為什麼。
   - 若句子本來就正確、你只是想給更自然的說法 → 先肯定「這樣說沒錯」，再用『更自然的說法：…』分開呈現，避免讓學生誤以為自己用錯。
4. 學生用中文發問或說「聽不懂」時，可用中文解釋，但接著要引導他用英文再試一次。
5. 若學生要求與英文學習無關的任務（寫程式、長篇翻譯、聊時事八卦等），禮貌且簡短地婉拒，並轉成一個英文練習的機會。
6. 回應簡潔（2-4 句），不要長篇大論。結尾的鼓勵或 follow-up 要有變化，不要每次都用同一句公式。
7. 這是純文字聊天，沒有語音輸入，你聽不到學生發音。不要叫學生「大聲唸出來」或評論發音，請聚焦在文字上的造句、用字與文法。
8. 語氣正向、像真人老師，不要像機器人；不要使用 emoji（除非學生自己先用）。
9. system 脈絡中可能附上學生的學習進度（第幾天、完成率、漏掉哪天、字卡精熟數）。當學生問到進度、字卡、漏掉哪天等問題時，依該資料具體回答並給鼓勵；沒有該資料時就誠實說你還看不到，不要編造數字。`

// 記憶體每日計數（UTC+8）
let usage = { day: '', count: 0 }
function todayUTC8() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function send(res, status, body) {
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }
  if (req.method !== 'POST' || !req.url?.endsWith('/tutor-chat')) {
    return send(res, 404, { error: 'not_found' })
  }

  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', async () => {
    try {
      const { messages, context } = JSON.parse(raw || '{}')
      if (
        !Array.isArray(messages) ||
        messages.length === 0 ||
        messages[messages.length - 1]?.role !== 'user' ||
        messages.some((m) => !m?.content?.trim())
      ) {
        return send(res, 400, { error: 'missing_fields' })
      }

      // 每日上限（記憶體版）
      const day = todayUTC8()
      if (usage.day !== day) usage = { day, count: 0 }
      if (usage.count >= DAILY_LIMIT) {
        return send(res, 429, { error: 'daily_limit_reached', limit: DAILY_LIMIT })
      }

      const history = messages.slice(-20).map((m) => ({ role: m.role, content: m.content }))
      const sysMsgs = [{ role: 'system', content: SYSTEM_PROMPT }]
      if (typeof context === 'string' && context.trim()) {
        console.log(`[proxy] 收到前端 context（${context.length} 字）`)
        sysMsgs.push({ role: 'system', content: context.slice(0, 1500) })
      } else {
        console.log('[proxy] 本次請求無 context')
      }
      const payloadMessages = [...sysMsgs, ...history]

      // 逐個模型嘗試，遇 429/錯誤「立刻」換下一個（不乾等），讓成功或失敗都快
      let reply
      for (const model of MODELS) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://studyanywhere.app',
              'X-Title': 'Study Anywhere Voyage',
            },
            body: JSON.stringify({ model, messages: payloadMessages, max_tokens: 350, temperature: 0.7 }),
            signal: AbortSignal.timeout(20000),
          })
          if (!orRes.ok) {
            if (orRes.status === 429) console.error(`[proxy] ${model} 429，換下一個`)
            else console.error(`[proxy] ${model} ${orRes.status}: ${(await orRes.text()).slice(0, 160)}`)
            continue
          }
          const data = await orRes.json()
          reply = data.choices?.[0]?.message?.content ?? ''
          break
        } catch (e) {
          console.error(`[proxy] ${model} 例外 ${e.name}，換下一個`)
          continue
        }
      }

      if (reply == null) {
        return send(res, 503, { error: 'ai_unavailable' })
      }

      usage.count += 1
      return send(res, 200, { reply, remaining: Math.max(0, DAILY_LIMIT - usage.count) })
    } catch (e) {
      console.error('[proxy] error', e)
      return send(res, 500, { error: 'internal_error' })
    }
  })
})

if (!API_KEY) {
  console.error('[proxy] 缺少 OPENROUTER_API_KEY env，無法啟動')
  process.exit(1)
}
server.listen(PORT, () => {
  console.log(`[proxy] tutor-local-proxy 已啟動 http://localhost:${PORT}/tutor-chat (models: ${MODELS.join(', ')})`)
})

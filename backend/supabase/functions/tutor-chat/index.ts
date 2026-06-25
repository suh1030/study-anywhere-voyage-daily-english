import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createUserClient, createAdminClient } from '../_shared/supabase-client.ts'

const SYSTEM_PROMPT = `你是一位親切、有耐心的英文家教，學生是中級程度（B1-B2）的台灣學習者。
規則：
1. 用自然口語回應，鼓勵學生多說英文。
2. 當學生的英文有文法、用字或時態錯誤時，先溫和指出，給正確說法，再簡短解釋（用繁體中文解釋）。
3. 學生用中文發問時，可用中文回答，但盡量引導他用英文表達。
4. 回應簡潔（2-4 句），不要長篇大論。適時用一個 follow-up 問題延續對話。
5. 語氣正向、像真人老師，不要像機器人。`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    // ── 1. 驗證 JWT ──────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabaseUser = createUserClient(authHeader)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return jsonResponse({ error: 'unauthorized' }, 401)

    // ── 2. 解析請求 ──────────────────────────────────────────
    const { messages } = await req.json()
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages[messages.length - 1]?.role !== 'user' ||
      messages.some((m: ChatMessage) => !m?.content?.trim())
    ) {
      return jsonResponse({ error: 'missing_fields' }, 400)
    }

    // 截斷成最近 20 則，防止 token 濫用
    const history: ChatMessage[] = messages
      .slice(-20)
      .map((m: ChatMessage) => ({ role: m.role, content: m.content }))

    // ── 3. 每日訊息上限（每人每天最多 30 則，防止濫用）──────
    const supabaseAdmin = createAdminClient()
    const DAILY_LIMIT = 30
    // Use UTC+8 (Taiwan time) for daily reset
    const now = new Date()
    const utc8Offset = 8 * 60 * 60 * 1000
    const todayUTC8 = new Date(now.getTime() + utc8Offset)
    todayUTC8.setUTCHours(0, 0, 0, 0)
    const day = todayUTC8.toISOString().slice(0, 10) // 'YYYY-MM-DD'

    const { data: usageRow } = await supabaseAdmin
      .from('tutor_daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('day', day)
      .maybeSingle()

    if ((usageRow?.count ?? 0) >= DAILY_LIMIT) {
      return jsonResponse({ error: 'daily_limit_reached', limit: DAILY_LIMIT }, 429)
    }

    // ── 4. 呼叫 OpenRouter（OpenAI 相容 API）────────────────
    // 適用期免費模型驗證體驗；以環境變數設定，可一行替換回 Claude 或接扣費。
    const model = Deno.env.get('OPENROUTER_MODEL') ?? 'openai/gpt-oss-120b:free'
    let reply: string

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studyanywhere.app',
          'X-Title': 'Study Anywhere Voyage',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
          max_tokens: 600,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        return jsonResponse({ error: 'ai_unavailable' }, 503)
      }

      const data = await res.json()
      reply = data.choices?.[0]?.message?.content ?? ''
    } catch (_apiError) {
      return jsonResponse({ error: 'ai_unavailable' }, 503)
    }

    // ── 5. 累加用量 ──────────────────────────────────────────
    const { data: newCount } = await supabaseAdmin.rpc('increment_tutor_usage', {
      p_user_id: user.id,
      p_day: day,
    })

    const remaining = Math.max(0, DAILY_LIMIT - (newCount ?? DAILY_LIMIT))

    return jsonResponse({ reply, remaining })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0'
import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createUserClient, createAdminClient } from '../_shared/supabase-client.ts'

const SYSTEM_PROMPT = `你是一位為中級英文學習者（B1-B2）提供服務的口說教練。
請以繁體中文提供簡潔、鼓勵性的批改，格式如下：

1. 整體評價（1-2句，先給正向肯定）
2. 1-2個改進點（附修正範例）
3. 一個更道地的說法`

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
    const { question, answer } = await req.json()
    if (!question?.trim() || !answer?.trim()) {
      return jsonResponse({ error: 'missing_fields' }, 400)
    }

    // ── 3. 每日使用上限（每人每天最多 5 次，防止濫用）────────
    const supabaseAdmin = createAdminClient()
    const DAILY_LIMIT = 5
    // Use UTC+8 (Taiwan time) for daily reset
    const now = new Date()
    const utc8Offset = 8 * 60 * 60 * 1000
    const todayUTC8 = new Date(now.getTime() + utc8Offset)
    todayUTC8.setUTCHours(0, 0, 0, 0)
    const todayStart = new Date(todayUTC8.getTime() - utc8Offset)

    const { count } = await supabaseAdmin
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'deduct')
      .gte('created_at', todayStart.toISOString())

    if ((count ?? 0) >= DAILY_LIMIT) {
      return jsonResponse({ error: 'daily_limit_reached', limit: DAILY_LIMIT }, 429)
    }

    // ── 4. 原子扣點 ──────────────────────────────────────────
    const { data: deductResult, error: deductError } = await supabaseAdmin.rpc(
      'deduct_credit',
      { p_user_id: user.id }
    )

    if (deductError || !deductResult?.success) {
      return jsonResponse(
        { error: 'insufficient_credits', creditsRemaining: deductResult?.balance ?? 0 },
        402
      )
    }

    // ── 5. 呼叫 Claude API ───────────────────────────────────
    // 使用 Haiku：對話批改任務品質足夠，成本比 Sonnet 低 ~75%
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })
    let feedback: string

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `題目：「${question}」\n學習者的回答：「${answer}」`,
          },
        ],
      })
      feedback = message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (_apiError) {
      // 補償扣點：API 失敗，還原點數
      await supabaseAdmin.rpc('restore_credit', { p_user_id: user.id })
      return jsonResponse({ error: 'ai_unavailable' }, 503)
    }

    // ── 6. 記錄交易 ──────────────────────────────────────────
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: user.id,
      type: 'deduct',
      amount: 1,
      description: `AI feedback — ${question.substring(0, 60)}`,
    })

    return jsonResponse({
      feedback,
      creditsRemaining: deductResult.balance,
      model: 'claude-haiku-4-5-20251001',
    })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

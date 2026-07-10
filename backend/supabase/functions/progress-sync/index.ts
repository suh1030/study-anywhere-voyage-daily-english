import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createUserClient, createAdminClient } from '../_shared/supabase-client.ts'

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

    // ── 2. 解析並驗證進度資料 ────────────────────────────────
    const raw = await req.text()
    if (raw.length > 262144) return jsonResponse({ error: 'payload_too_large' }, 413) // 256KB 上限
    const body = JSON.parse(raw)

    const completed_days = body.completed_days ?? {}
    const mastered_cards = body.mastered_cards ?? []
    if (
      typeof completed_days !== 'object' || Array.isArray(completed_days) ||
      !Array.isArray(mastered_cards) ||
      mastered_cards.some((c: unknown) => typeof c !== 'string' || (c as string).length > 64) ||
      mastered_cards.length > 2000
    ) {
      return jsonResponse({ error: 'invalid_payload' }, 400)
    }

    // ── 3. Upsert 進度（last-write-wins，v1 可接受） ─────────
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .upsert({
        user_id: user.id,
        completed_days,
        mastered_cards,
        updated_at: new Date().toISOString(),
      })
      .select('completed_days, mastered_cards, updated_at')
      .single()

    if (error) return jsonResponse({ error: 'sync_failed' }, 500)

    return jsonResponse({
      completed_days: data.completed_days,
      mastered_cards: data.mastered_cards,
      updated_at: data.updated_at,
    })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

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

    // ── 2. 解析進度資料 ──────────────────────────────────────
    const body = await req.json()
    const completed_days = body.completed_days ?? {}
    const mastered_cards = body.mastered_cards ?? []

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

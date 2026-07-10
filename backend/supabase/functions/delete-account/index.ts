import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createUserClient, createAdminClient } from '../_shared/supabase-client.ts'

// 帳號刪除（Apple App Store Guideline 5.1.1(v) 硬性要求）
// 驗證 JWT 後刪除 auth.users 該用戶；
// profiles / credits / credit_transactions / user_progress / tutor_daily_usage
// 皆有 ON DELETE CASCADE，會一併清除。

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabaseUser = createUserClient(authHeader)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return jsonResponse({ error: 'unauthorized' }, 401)

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('delete-account failed:', error)
      return jsonResponse({ error: 'delete_failed' }, 500)
    }

    return jsonResponse({ deleted: true })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

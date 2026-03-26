import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const dateKey = url.pathname.split('/').pop()

    if (!dateKey || !DATE_KEY_PATTERN.test(dateKey)) {
      return jsonResponse({ error: 'invalid_date_key' }, 400)
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('date_key', dateKey)
      .single()

    if (error || !data) return jsonResponse({ error: 'article_not_found' }, 404)

    return jsonResponse(data)
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

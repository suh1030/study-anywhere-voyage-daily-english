import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

const POSITIVE_INT_PATTERN = /^\d+$/

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const weekParam = url.searchParams.get('week')
    const dayParam = url.searchParams.get('day')

    const supabase = createAdminClient()
    let query = supabase.from('articles').select('*')

    if (!weekParam || !dayParam || !POSITIVE_INT_PATTERN.test(weekParam) || !POSITIVE_INT_PATTERN.test(dayParam)) {
      return jsonResponse({ error: 'invalid_article_lookup' }, 400)
    }

    query = query
      .eq('week_number', Number(weekParam))
      .eq('day_of_week', Number(dayParam))

    const { data, error } = await query.single()

    if (error || !data) return jsonResponse({ error: 'article_not_found' }, 404)

    return jsonResponse(data)
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

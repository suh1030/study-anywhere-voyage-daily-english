import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const POSITIVE_INT_PATTERN = /^\d+$/

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const dateKey = url.pathname.split('/').pop()
    const weekParam = url.searchParams.get('week')
    const dayParam = url.searchParams.get('day')

    const supabase = createAdminClient()
    let query = supabase.from('articles').select('*')

    if (weekParam && dayParam && POSITIVE_INT_PATTERN.test(weekParam) && POSITIVE_INT_PATTERN.test(dayParam)) {
      query = query
        .eq('week_number', Number(weekParam))
        .eq('day_of_week', Number(dayParam))
    } else {
      if (!dateKey || !DATE_KEY_PATTERN.test(dateKey)) {
        return jsonResponse({ error: 'invalid_article_lookup' }, 400)
      }

      query = query.eq('date_key', dateKey)
    }

    const { data, error } = await query.single()

    if (error || !data) return jsonResponse({ error: 'article_not_found' }, 404)

    return jsonResponse(data)
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const weekNumberStr = url.pathname.split('/').pop()
    const weekNumber = parseInt(weekNumberStr ?? '')

    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      return jsonResponse({ error: 'invalid_week_number' }, 400)
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('week_number', weekNumber)
      .order('source')

    if (error) return jsonResponse({ error: 'internal_error' }, 500)

    return jsonResponse(data ?? [])
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

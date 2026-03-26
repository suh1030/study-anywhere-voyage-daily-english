import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

// Route: /content-episode/{weekNumber}/{dayOfWeek}
// Returns the episode script for a specific week + day.

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)

    const weekNumber = parseInt(segments[segments.length - 2] ?? '')
    const dayOfWeek = parseInt(segments[segments.length - 1] ?? '')

    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      return jsonResponse({ error: 'invalid_week_number' }, 400)
    }
    if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      return jsonResponse({ error: 'invalid_day_of_week' }, 400)
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (error || !data) return jsonResponse({ error: 'episode_not_found' }, 404)

    return jsonResponse(data)
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

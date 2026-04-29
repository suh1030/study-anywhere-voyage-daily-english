import { handleCors, jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

// Route: /content-questions/{weekNumber}/{dayOfWeek}
// Returns all questions for the week if dayOfWeek is omitted,
// or a single question for that specific day.

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    // segments: ['content-questions', weekNumber, dayOfWeek?]
    const weekNumberStr = segments[segments.length - 2] ?? segments[segments.length - 1]
    const dayOfWeekStr = segments.length >= 2 ? segments[segments.length - 1] : undefined

    const weekNumber = parseInt(weekNumberStr ?? '')
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      return jsonResponse({ error: 'invalid_week_number' }, 400)
    }

    const supabase = createAdminClient()

    // If dayOfWeek provided, return single question; otherwise return all questions for the week.
    const dayOfWeek = dayOfWeekStr ? parseInt(dayOfWeekStr) : NaN

    if (!isNaN(dayOfWeek)) {
      if (dayOfWeek < 1 || dayOfWeek > 7) {
        return jsonResponse({ error: 'invalid_day_of_week' }, 400)
      }
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('week_number', weekNumber)
        .eq('day_of_week', dayOfWeek)
        .single()

      if (error || !data) return jsonResponse({ error: 'question_not_found' }, 404)
      return jsonResponse(data)
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('week_number', weekNumber)
      .order('day_of_week')

    if (error) return jsonResponse({ error: 'internal_error' }, 500)
    return jsonResponse(data ?? [])
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

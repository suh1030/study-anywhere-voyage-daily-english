import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import {
  formatLocalDate,
  generateSchedule,
  isLocalDate,
  type ScheduleDay,
} from '../data/curriculum'

const CURRICULUM_START_KEY = 'curriculumStartDate'

interface CurriculumState {
  startDateKey: string | null
  schedule: ScheduleDay[]
  loading: boolean
  initialize: () => Promise<void>
  reset: () => void
}

function buildSettingsWithStartDate(
  settings: unknown,
  startDateKey: string
): Record<string, unknown> {
  const base =
    settings && typeof settings === 'object' && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : {}

  return {
    ...base,
    [CURRICULUM_START_KEY]: startDateKey,
  }
}

export const useCurriculumStore = create<CurriculumState>((set) => ({
  startDateKey: null,
  schedule: [],
  loading: true,

  initialize: async () => {
    set({ loading: true })

    const fallbackStartDateKey = formatLocalDate()
    let resolvedStartDateKey = fallbackStartDateKey

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id

      if (!userId) {
        set({
          startDateKey: fallbackStartDateKey,
          schedule: generateSchedule(fallbackStartDateKey),
          loading: false,
        })
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', userId)
        .maybeSingle()

      const existingStartDateKey = profile?.settings?.[CURRICULUM_START_KEY]
      if (typeof existingStartDateKey === 'string' && isLocalDate(existingStartDateKey)) {
        resolvedStartDateKey = existingStartDateKey
      } else {
        const nextSettings = buildSettingsWithStartDate(profile?.settings, fallbackStartDateKey)
        await supabase
          .from('profiles')
          .update({ settings: nextSettings })
          .eq('id', userId)

        resolvedStartDateKey = fallbackStartDateKey
      }
    } catch {
      resolvedStartDateKey = fallbackStartDateKey
    }

    set({
      startDateKey: resolvedStartDateKey,
      schedule: generateSchedule(resolvedStartDateKey),
      loading: false,
    })
  },

  reset: () => {
    set({
      startDateKey: null,
      schedule: [],
      loading: false,
    })
  },
}))

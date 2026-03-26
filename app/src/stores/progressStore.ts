import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface ProgressState {
  completedDays: Record<string, boolean>
  masteredCards: string[]
  toggleDay: (dateKey: string) => void
  toggleCard: (cardId: string) => void
  sync: () => Promise<void>
  load: () => Promise<void>
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedDays: {},
  masteredCards: [],

  toggleDay: (dateKey) => {
    const current = get().completedDays
    const updated = { ...current }
    if (updated[dateKey]) {
      delete updated[dateKey]
    } else {
      updated[dateKey] = true
    }
    set({ completedDays: updated })
  },

  toggleCard: (cardId) => {
    const current = get().masteredCards
    const updated = current.includes(cardId)
      ? current.filter((id) => id !== cardId)
      : [...current, cardId]
    set({ masteredCards: updated })
  },

  sync: async () => {
    const { completedDays, masteredCards } = get()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/progress-sync`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          completed_days: completedDays,
          mastered_cards: masteredCards,
        }),
      }
    )
  },

  load: async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('completed_days, mastered_cards')
      .single()
    if (data) {
      set({
        completedDays: data.completed_days ?? {},
        masteredCards: data.mastered_cards ?? [],
      })
    }
  },
}))

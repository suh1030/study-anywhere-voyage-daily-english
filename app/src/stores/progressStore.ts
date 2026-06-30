import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface ProgressState {
  completedDays: Record<string, boolean>
  masteredCards: string[]
  hydrated: boolean
  toggleDay: (dayId: string) => void
  toggleCard: (cardId: string) => void
  sync: () => Promise<void>
  load: () => Promise<void>
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedDays: {},
  masteredCards: [],
  hydrated: false,

  toggleDay: (dayId) => {
    const current = get().completedDays
    const updated = { ...current }
    if (updated[dayId]) {
      delete updated[dayId]
    } else {
      updated[dayId] = true
    }
    set({ completedDays: updated })
    // 立即同步到後端，讓 AI 家教（讀 user_progress）能馬上看到最新進度，
    // 也避免進度只存在記憶體、關閉 app 就遺失。
    void get().sync()
  },

  toggleCard: (cardId) => {
    const current = get().masteredCards
    const updated = current.includes(cardId)
      ? current.filter((id) => id !== cardId)
      : [...current, cardId]
    set({ masteredCards: updated })
    void get().sync()
  },

  sync: async () => {
    const { completedDays, masteredCards, hydrated } = get()
    // 登入後 load() 尚未完成時，本機預設值是空物件；此時同步會把後端進度誤清空。
    if (!hydrated) return
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
    set({ hydrated: false })
    const { data, error } = await supabase
      .from('user_progress')
      .select('completed_days, mastered_cards')
      .single()
    if (error) return
    if (data) {
      set({
        completedDays: data.completed_days ?? {},
        masteredCards: data.mastered_cards ?? [],
        hydrated: true,
      })
    } else {
      set({ completedDays: {}, masteredCards: [], hydrated: true })
    }
  },
}))

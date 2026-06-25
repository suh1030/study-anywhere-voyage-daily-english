import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export type TutorMessage = { id: string; role: 'user' | 'assistant'; content: string }

interface TutorState {
  isOpen: boolean
  messages: TutorMessage[]
  sessionDay: string | null // 本段對話所屬日期 (UTC+8, 'YYYY-MM-DD')
  loading: boolean
  remaining: number | null // 當日剩餘額度；null = 未知
  error: string | null
  open: () => void
  close: () => void
  reset: () => void
  sendMessage: (text: string) => Promise<void>
}

// 回傳 UTC+8 當日日期字串 'YYYY-MM-DD'（與後端每日計數同一時區基準）
function todayUTC8(): string {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return utc8.toISOString().slice(0, 10)
}

// 簡單的訊息 id 產生器（純記憶體，不需全域唯一）
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Bypass 模式：Supabase 暫停期間用本機 proxy（scripts/tutor-local-proxy.mjs）。
// 設了 EXPO_PUBLIC_TUTOR_PROXY_URL 就走 proxy、跳過登入；未設則照常打正式 Edge Function。
const PROXY_URL = process.env.EXPO_PUBLIC_TUTOR_PROXY_URL

export const useTutorStore = create<TutorState>((set, get) => ({
  isOpen: false,
  messages: [],
  sessionDay: null,
  loading: false,
  remaining: null,
  error: null,

  open: () => {
    const today = todayUTC8()
    // 跨日自動清空：對齊每日免費額度的重置
    if (get().sessionDay !== today) {
      set({ messages: [], error: null, sessionDay: today })
    }
    set({ isOpen: true })
  },

  close: () => set({ isOpen: false }),

  reset: () => set({ messages: [], error: null, remaining: null, sessionDay: null }),

  sendMessage: async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // 跨日檢查：若 sessionDay 不是今天 → 先清空
    const today = todayUTC8()
    if (get().sessionDay !== today) {
      set({ messages: [], error: null, sessionDay: today })
    }

    const userMessage: TutorMessage = { id: genId(), role: 'user', content: trimmed }
    set((state) => ({ messages: [...state.messages, userMessage], loading: true, error: null }))

    try {
      // 帶最近 20 則訊息（含剛 push 的 user 訊息）
      const history = get().messages.slice(-20).map((m) => ({ role: m.role, content: m.content }))

      let res: Response
      if (PROXY_URL) {
        // Bypass：本機 proxy，不需 Supabase session
        res = await fetch(`${PROXY_URL}/tutor-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        })
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          set({ error: 'unauthorized', loading: false })
          return
        }
        res = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/tutor-chat`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({ messages: history }),
          }
        )
      }

      const result = await res.json()
      if (!res.ok) {
        set({ error: result.error ?? 'request_failed', loading: false })
        return
      }

      const assistantMessage: TutorMessage = { id: genId(), role: 'assistant', content: result.reply }
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        remaining: result.remaining ?? null,
        loading: false,
      }))
    } catch {
      set({ error: 'ai_unavailable', loading: false })
    }
  },
}))

import { create } from 'zustand'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'

// Product identifier configured in App Store Connect + RevenueCat
const CREDITS_PRODUCT_ID = 'sav_credits_10'

interface CreditsState {
  balance: number
  loading: boolean
  purchasing: boolean
  fetchBalance: () => Promise<void>
  initRevenueCat: (userId: string) => Promise<void>
  purchaseCredits: () => Promise<{ success: boolean; pending?: boolean; error?: string }>
  requestFeedback: (question: string, answer: string) => Promise<{ feedback: string } | { error: string }>
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  balance: 0,
  loading: false,
  purchasing: false,

  fetchBalance: async () => {
    const { data } = await supabase
      .from('credits')
      .select('balance')
      .single()
    if (data) set({ balance: data.balance })
  },

  initRevenueCat: async (userId: string) => {
    if (Platform.OS === 'web') return
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY
    if (!apiKey) return
    Purchases.setLogLevel(LOG_LEVEL.ERROR)
    await Purchases.configure({ apiKey })
    await Purchases.logIn(userId)
  },

  purchaseCredits: async () => {
    set({ purchasing: true })
    try {
      const offerings = await Purchases.getOfferings()
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.product.identifier === CREDITS_PRODUCT_ID
      ) ?? offerings.current?.availablePackages[0]

      if (!pkg) return { success: false, error: 'No packages available' }

      await Purchases.purchasePackage(pkg)
      // Webhook fires async — poll until balance increases
      const prevBalance = get().balance
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 1000))
        await get().fetchBalance()
        if (get().balance > prevBalance) break
      }

      // 付款成功但 webhook 尚未入帳：如實告知「稍後入帳」，不謊報已加點
      return { success: true, pending: get().balance <= prevBalance }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string }
      if (err.userCancelled) return { success: false }
      return { success: false, error: err.message ?? 'Purchase failed' }
    } finally {
      set({ purchasing: false })
    }
  },

  requestFeedback: async (question, answer) => {
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { error: 'unauthorized' }

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/feedback`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ question, answer }),
        }
      )

      const result = await res.json()
      if (!res.ok) return { error: result.error ?? 'request_failed' }

      set({ balance: result.creditsRemaining })
      return { feedback: result.feedback }
    } catch {
      // 離線或伺服器回非 JSON：不讓 rejection 往上炸，回結構化錯誤
      return { error: 'network_error' }
    } finally {
      set({ loading: false })
    }
  },
}))

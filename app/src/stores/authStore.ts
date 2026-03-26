import { create } from 'zustand'
import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

WebBrowser.maybeCompleteAuthSession()

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  setSession: (session: Session | null) => void
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string) => Promise<string | null>
  signInWithApple: () => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null, loading: false }),

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  },

  signInWithApple: async () => {
    if (Platform.OS !== 'ios') return 'Sign in with Apple is only available on iOS'
    try {
      // Generate a random nonce and hash it — Apple includes it in the identity token
      const rawNonce = Crypto.randomUUID()
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      )
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      })
      if (!credential.identityToken) return 'No identity token from Apple'
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      })
      return error?.message ?? null
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null
      return (e as Error).message ?? 'Apple sign in failed'
    }
  },

  signInWithGoogle: async () => {
    try {
      const redirectUri = makeRedirectUri({ scheme: 'com.savelyn.studyanywherevoyage' })
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      })
      if (error || !data.url) return error?.message ?? 'Google sign in failed'

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)
      if (result.type !== 'success') return null

      // Extract tokens from redirect URL (may be in query params or hash fragment)
      const url = new URL(result.url)
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
      const access_token = url.searchParams.get('access_token') ?? hashParams.get('access_token')
      const refresh_token = url.searchParams.get('refresh_token') ?? hashParams.get('refresh_token')
      if (!access_token || !refresh_token) return 'Could not extract tokens from redirect'

      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
      return sessionError?.message ?? null
    } catch (e: unknown) {
      return (e as Error).message ?? 'Google sign in failed'
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },
}))

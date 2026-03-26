import React, { useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AppState, type AppStateStatus, ActivityIndicator, View } from 'react-native'
import { supabase } from './src/lib/supabase'
import { useAuthStore } from './src/stores/authStore'
import { useProgressStore } from './src/stores/progressStore'
import { useCreditsStore } from './src/stores/creditsStore'
import TabNavigator from './src/navigation/TabNavigator'
import AuthScreen from './src/screens/auth/AuthScreen'
import { colors } from './src/constants/theme'

export default function App() {
  const { session, loading, setSession } = useAuthStore()
  const { load: loadProgress, sync: syncProgress } = useProgressStore()
  const { fetchBalance, initRevenueCat } = useCreditsStore()
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadProgress()
      fetchBalance()
      if (session.user?.id) initRevenueCat(session.user.id)
    }
  }, [session])

  // Sync progress to backend when app moves to background
  useEffect(() => {
    if (!session) return
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next === 'background') {
        syncProgress()
      }
      appState.current = next
    })
    return () => sub.remove()
  }, [session])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.ui} size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {session ? <TabNavigator /> : <AuthScreen />}
    </NavigationContainer>
  )
}

import React, { useEffect, useRef } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AppState, type AppStateStatus, ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans'
import { DMMono_300Light, DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono'
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium } from '@expo-google-fonts/outfit'
import { Cinzel_400Regular, Cinzel_500Medium } from '@expo-google-fonts/cinzel'
import { supabase } from './src/lib/supabase'
import { useAuthStore } from './src/stores/authStore'
import { useProgressStore } from './src/stores/progressStore'
import { useCreditsStore } from './src/stores/creditsStore'
import { useCurriculumStore } from './src/stores/curriculumStore'
import TabNavigator from './src/navigation/TabNavigator'
import AuthScreen from './src/screens/auth/AuthScreen'
import { colors } from './src/constants/theme'

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMMono_300Light,
    DMMono_400Regular,
    DMMono_500Medium,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Cinzel_400Regular,
    Cinzel_500Medium,
  })

  const { session, loading, setSession } = useAuthStore()
  const { load: loadProgress, sync: syncProgress } = useProgressStore()
  const { fetchBalance, initRevenueCat } = useCreditsStore()
  const { initialize: initializeCurriculum, reset: resetCurriculum, loading: curriculumLoading } = useCurriculumStore()
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
      initializeCurriculum()
      if (session.user?.id) initRevenueCat(session.user.id)
    } else {
      resetCurriculum()
    }
  }, [session, loadProgress, fetchBalance, initializeCurriculum, initRevenueCat, resetCurriculum])

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

  if (loading || (session ? curriculumLoading : false) || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.ui} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {session ? <TabNavigator /> : <AuthScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

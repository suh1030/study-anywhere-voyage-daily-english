import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useCreditsStore } from '../stores/creditsStore'
import { useCurriculumStore } from '../stores/curriculumStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavProvider, useNav } from './NavContext'
import Svg, { Polygon, Path, Rect, Line, Circle } from 'react-native-svg'
import { colors, fonts, spacing } from '../constants/theme'
import { getScheduleEntry, getTodayKey } from '../data/curriculum'
import ScheduleScreen from '../screens/tabs/ScheduleScreen'
import ListenScreen from '../screens/tabs/ListenScreen'
import SpeakScreen from '../screens/tabs/SpeakScreen'
import ConversationScreen from '../screens/tabs/ConversationScreen'
import ReviewScreen from '../screens/tabs/ReviewScreen'
import AccountScreen from '../screens/tabs/AccountScreen'

type TabName = 'Listen' | 'Conversation' | 'Review' | 'Speak' | 'Schedule' | 'Account'

const TAB_CONFIG: { name: TabName; label: string; color: string; icon: (c: string) => React.ReactNode }[] = [
  {
    name: 'Schedule',
    label: 'SCHED',
    color: colors.ui,
    icon: (c) => (
      <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
        <Rect x={1} y={2} width={10} height={9} rx={1.5} stroke={c} strokeWidth={1.1} />
        <Line x1={1} y1={5} x2={11} y2={5} stroke={c} strokeWidth={1.1} />
        <Line x1={4} y1={1} x2={4} y2={3.5} stroke={c} strokeWidth={1.1} strokeLinecap="round" />
        <Line x1={8} y1={1} x2={8} y2={3.5} stroke={c} strokeWidth={1.1} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    name: 'Listen',
    label: 'LISTEN',
    color: colors.listen,
    icon: (c) => (
      <Svg width={9} height={10} viewBox="0 0 9 10">
        <Polygon points="0,0 9,5 0,10" fill={c} />
      </Svg>
    ),
  },
  {
    name: 'Conversation',
    label: 'CONV',
    color: colors.conversation,
    icon: (c) => (
      <Svg width={12} height={11} viewBox="0 0 12 11" fill="none">
        <Path d="M1 1h10v7H6.5l-2.5 3V8H1z" stroke={c} strokeWidth={1.2} />
      </Svg>
    ),
  },
  {
    name: 'Speak',
    label: 'SPEAK',
    color: colors.speak,
    icon: (c) => (
      <Svg width={11} height={14} viewBox="0 0 11 14" fill="none">
        <Rect x={3} y={1} width={5} height={7} rx={2.5} stroke={c} strokeWidth={1.2} />
        <Path d="M1 7.5c0 2.5 1.8 4 4.5 4s4.5-1.5 4.5-4" stroke={c} strokeWidth={1.2} />
        <Line x1={5.5} y1={11.5} x2={5.5} y2={13} stroke={c} strokeWidth={1.2} />
      </Svg>
    ),
  },
  {
    name: 'Review',
    label: 'REVIEW',
    color: colors.review,
    icon: (c) => (
      <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
        <Rect x={1} y={3} width={11} height={8} rx={1} stroke={c} strokeWidth={1.2} />
        <Rect x={3} y={1} width={7} height={8} rx={1} stroke={c} strokeWidth={1.2} />
      </Svg>
    ),
  },
  {
    name: 'Account',
    label: '',
    color: colors.muted,
    icon: (c) => (
      <Svg width={12} height={13} viewBox="0 0 12 13" fill="none">
        <Circle cx={6} cy={4} r={3} stroke={c} strokeWidth={1.2} />
        <Path d="M1 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={c} strokeWidth={1.2} strokeLinecap="round" />
      </Svg>
    ),
  },
]

const SCREENS: Record<TabName, React.ComponentType> = {
  Listen: ListenScreen,
  Conversation: ConversationScreen,
  Review: ReviewScreen,
  Speak: SpeakScreen,
  Schedule: ScheduleScreen,
  Account: AccountScreen,
}

function TabNavigatorInner() {
  const { activeTab, navigate } = useNav()
  const ActiveScreen = SCREENS[activeTab]
  const { balance } = useCreditsStore()
  const { schedule } = useCurriculumStore()

  const dayLabel = useMemo(() => {
    const entry = getScheduleEntry(schedule, getTodayKey())
    if (!entry) return null
    return `W${String(entry.week).padStart(2, '0')} · Day ${entry.dayOfWeek} · ${entry.label}`
  }, [schedule])

  const TABS_WITH_DAY_LABEL: TabName[] = ['Listen', 'Conversation', 'Speak']

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {/* Top Nav Bar */}
      <View style={styles.nav}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.name
            const iconColor = isActive ? tab.color : colors.muted
            const textColor = isActive ? tab.color : colors.muted
            return (
              <TouchableOpacity
                key={tab.name}
                style={tab.name === 'Account' ? styles.tabAccount : styles.tab}
                onPress={() => navigate(tab.name)}
                activeOpacity={0.7}
              >
                <View style={styles.tabInner}>
                  <View style={styles.tabIconWrap}>
                    {tab.icon(iconColor)}
                  </View>
                  {tab.label ? <Text style={[styles.tabLabel, { color: textColor }]}>{tab.label}</Text> : null}
                </View>
                {isActive && <View style={[styles.tabUnderline, { backgroundColor: tab.color }]} />}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Border below nav */}
      <View style={styles.navBorder} />

      {/* Shared day label — shown for Listen, Conversation, Speak */}
      {TABS_WITH_DAY_LABEL.includes(activeTab) && dayLabel && (
        <View style={styles.dayLabelBar}>
          <Text style={styles.dayLabelText}>{dayLabel}</Text>
          {activeTab === 'Conversation' && (
            <TouchableOpacity style={styles.creditsBadge} onPress={() => navigate('Account')}>
              <Text style={styles.creditsText}>{balance} CR</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Screen content */}
      <View style={styles.content}>
        <ActiveScreen />
      </View>
    </SafeAreaView>
  )
}

export default function TabNavigator() {
  return (
    <NavProvider>
      <TabNavigatorInner />
    </NavProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    height: 52,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 4,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabAccount: {
    flex: 0,
    width: 32,
    paddingHorizontal: 0,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabIconWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  navBorder: {
    height: 1,
    backgroundColor: colors.border,
  },
  dayLabelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabelText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted,
  },
  creditsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gold + '50',
    borderRadius: 999,
    backgroundColor: colors.gold + '10',
  },
  creditsText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
  },
  content: {
    flex: 1,
  },
})

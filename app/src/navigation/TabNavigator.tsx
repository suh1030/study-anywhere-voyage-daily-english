import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { NavProvider, useNav } from './NavContext'
import Svg, { Polygon, Path, Rect, Line, Circle } from 'react-native-svg'
import { colors, fonts, spacing } from '../constants/theme'
import ScheduleScreen from '../screens/tabs/ScheduleScreen'
import ListenScreen from '../screens/tabs/ListenScreen'
import SpeakScreen from '../screens/tabs/SpeakScreen'
import ConversationScreen from '../screens/tabs/ConversationScreen'
import ReviewScreen from '../screens/tabs/ReviewScreen'

type TabName = 'Listen' | 'Conversation' | 'Review' | 'Speak' | 'Schedule'

const TAB_CONFIG: { name: TabName; label: string; color: string; icon: (c: string) => React.ReactNode }[] = [
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
    label: 'CONVERSATION',
    color: colors.conversation,
    icon: (c) => (
      <Svg width={12} height={11} viewBox="0 0 12 11" fill="none">
        <Path d="M1 1h10v7H6.5l-2.5 3V8H1z" stroke={c} strokeWidth={1.2} />
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
    name: 'Schedule',
    label: 'SCHEDULE',
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
]

const SCREENS: Record<TabName, React.ComponentType> = {
  Listen: ListenScreen,
  Conversation: ConversationScreen,
  Review: ReviewScreen,
  Speak: SpeakScreen,
  Schedule: ScheduleScreen,
}

function DateBadge() {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = days[now.getDay()]
  const date = `${now.getMonth() + 1}/${now.getDate()}`
  return (
    <Text style={styles.dateBadge}>{day} {date}</Text>
  )
}

function TabNavigatorInner() {
  const { activeTab, navigate } = useNav()
  const ActiveScreen = SCREENS[activeTab]

  return (
    <SafeAreaView style={styles.root}>
      {/* Top Nav Bar */}
      <View style={styles.nav}>
        {/* Logo */}
        <View style={styles.logoBar}>
          <Text style={styles.logoText}>
            <Text style={{ color: colors.ui }}>S</Text>
            <Text style={{ color: '#e8e8e8' }}>tudy </Text>
            <Text style={{ color: colors.ui }}>A</Text>
            <Text style={{ color: '#e8e8e8' }}>nywhere </Text>
            <Text style={{ color: colors.ui }}>V</Text>
            <Text style={{ color: '#e8e8e8' }}>oyage</Text>
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.name
            const iconColor = isActive ? tab.color : colors.muted
            const textColor = isActive ? tab.color : colors.muted
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => navigate(tab.name)}
                activeOpacity={0.7}
              >
                <View style={styles.tabInner}>
                  {tab.icon(iconColor)}
                  <Text style={[styles.tabLabel, { color: textColor }]}>{tab.label}</Text>
                </View>
                {isActive && <View style={[styles.tabUnderline, { backgroundColor: tab.color }]} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Date badge */}
        <DateBadge />
      </View>

      {/* Border below nav */}
      <View style={styles.navBorder} />

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
    paddingHorizontal: spacing.md,
  },
  logoBar: {
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: 52,
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: fonts.cinzel,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.text,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
  },
  tab: {
    paddingHorizontal: Platform.OS === 'web' ? 18 : 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
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
  dateBadge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted,
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
  },
})

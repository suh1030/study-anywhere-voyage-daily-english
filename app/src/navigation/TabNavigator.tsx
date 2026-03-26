import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, StyleSheet, View } from 'react-native'
import Svg, { Polygon, Path, Rect, Line } from 'react-native-svg'
import { colors, fonts } from '../constants/theme'
import ScheduleScreen from '../screens/tabs/ScheduleScreen'
import ListenScreen from '../screens/tabs/ListenScreen'
import SpeakScreen from '../screens/tabs/SpeakScreen'
import ConversationScreen from '../screens/tabs/ConversationScreen'
import ReviewScreen from '../screens/tabs/ReviewScreen'

const Tab = createBottomTabNavigator()

function IconListen({ color }: { color: string }) {
  return (
    <Svg width={11} height={12} viewBox="0 0 11 12">
      <Polygon points="0,0 11,6 0,12" fill={color} />
    </Svg>
  )
}

function IconConversation({ color }: { color: string }) {
  return (
    <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
      <Path d="M1 1h11v8H7l-3 3V9H1z" stroke={color} strokeWidth={1.3} />
    </Svg>
  )
}

function IconReview({ color }: { color: string }) {
  return (
    <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
      <Rect x={1} y={3} width={11} height={8} rx={1} stroke={color} strokeWidth={1.3} />
      <Rect x={3} y={1} width={7} height={8} rx={1} stroke={color} strokeWidth={1.3} />
    </Svg>
  )
}

function IconSpeak({ color }: { color: string }) {
  return (
    <Svg width={11} height={14} viewBox="0 0 11 14" fill="none">
      <Rect x={3} y={1} width={5} height={7} rx={2.5} stroke={color} strokeWidth={1.3} />
      <Path d="M1 7.5c0 2.5 1.8 4 4.5 4s4.5-1.5 4.5-4" stroke={color} strokeWidth={1.3} />
      <Line x1={5.5} y1={11.5} x2={5.5} y2={13} stroke={color} strokeWidth={1.3} />
    </Svg>
  )
}

function IconSchedule({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Rect x={1} y={2} width={12} height={11} rx={1.5} stroke={color} strokeWidth={1.2} />
      <Line x1={1} y1={5.5} x2={13} y2={5.5} stroke={color} strokeWidth={1.2} />
      <Line x1={4.5} y1={1} x2={4.5} y2={4} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      <Line x1={9.5} y1={1} x2={9.5} y2={4} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  )
}

function TabItem({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <View style={styles.tabItem}>
      {icon}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  )
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.ui,
        tabBarInactiveTintColor: colors.muted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem icon={<IconSchedule color={color} />} label="SCHEDULE" color={color} />
          ),
          tabBarActiveTintColor: colors.ui,
        }}
      />
      <Tab.Screen
        name="Listen"
        component={ListenScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem icon={<IconListen color={color} />} label="LISTEN" color={color} />
          ),
          tabBarActiveTintColor: colors.listen,
        }}
      />
      <Tab.Screen
        name="Speak"
        component={SpeakScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem icon={<IconSpeak color={color} />} label="SPEAK" color={color} />
          ),
          tabBarActiveTintColor: colors.speak,
        }}
      />
      <Tab.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem icon={<IconConversation color={color} />} label="TALK" color={color} />
          ),
          tabBarActiveTintColor: colors.conversation,
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabItem icon={<IconReview color={color} />} label="REVIEW" color={color} />
          ),
          tabBarActiveTintColor: colors.review,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
})

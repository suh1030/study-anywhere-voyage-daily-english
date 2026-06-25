import React from 'react'
import { TouchableOpacity, StyleSheet, Platform } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors, radius } from '../constants/theme'
import { useTutorStore } from '../stores/tutorStore'

function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default function TutorFab() {
  const { isOpen, open } = useTutorStore()

  // 開啟 Modal 時隱藏自己，避免疊在 Modal 上
  if (isOpen) return null

  return (
    <TouchableOpacity style={styles.fab} onPress={open} activeOpacity={0.85}>
      <ChatIcon color={colors.gold} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold + '50',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
})

import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors, fonts } from '../constants/theme'
import { useTutorStore } from '../stores/tutorStore'

// 引路星（Polaris = 北極星，icon B 單顆星），象徵 AI 引路老師
function StarIcon() {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"
        fill={colors.gold}
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
      <StarIcon />
      <Text style={styles.label}>AI老師</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 20,
    width: 60,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold + '55',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.uiDim,
    letterSpacing: 0.5,
  },
})

import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
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
    <TouchableOpacity style={styles.bubble} onPress={open} activeOpacity={0.85}>
      <StarIcon />
      <Text style={styles.label}>AI Tutor</Text>
      {/* 對話框尾巴：旋轉方塊，右下兩邊描邊形成指向下的尖角 */}
      <View style={styles.tail} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  tail: {
    position: 'absolute',
    bottom: -5,
    left: 16,
    width: 11,
    height: 11,
    backgroundColor: colors.surface2,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gold + '55',
    transform: [{ rotate: '45deg' }],
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.ui,
    letterSpacing: 0.5,
    marginTop: 1,
  },
})

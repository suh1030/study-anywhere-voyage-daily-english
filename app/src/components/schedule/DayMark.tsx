import React, { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native'
import Svg, { G, Path } from 'react-native-svg'
import { colors } from '../../constants/theme'

const KNIFE_GOUGE = require('../../../assets/knife-gouge-v2.png')

export type DayMarkState = 'idle' | 'today' | 'done'

interface DayMarkProps {
  state: DayMarkState
  onToggle: () => void
  animateOnChange?: boolean
  accessibilityLabel?: string
  variation?: number
}

const SLOT = 44

const CUT_VARIANTS = [
  { rotate: '-3deg', translateY: 0, scaleY: 1 },
  { rotate: '1deg', translateY: 1, scaleY: 0.94 },
  { rotate: '-5deg', translateY: -1, scaleY: 1.04 },
  { rotate: '0deg', translateY: 0, scaleY: 0.97 },
] as const

const NOTCHES = [
  {
    trough: 'M14 21.7 C17.2 21.2 19.5 19.4 22.5 18.5 C25.2 17.6 28.2 15.8 30.5 15.4 L29.8 17.7 C27.4 18.2 25 19.9 22 20.7 C19.2 21.5 16.5 22.7 14 22.6 Z',
    lip: 'M15 21.4 C18 20.7 20 19.2 22.8 18.3 C25.4 17.4 27.8 16.1 29.7 15.8',
  },
  {
    trough: 'M13.7 20.9 C16.4 20.8 18.8 19.7 21.2 18.5 C24.3 16.9 27 16.7 30.7 14.9 L30 17 C27 17.6 24.8 18.2 21.8 20 C19.2 21.4 16.4 22 14 21.9 Z',
    lip: 'M14.8 20.7 C17.1 20.3 19.2 19.4 21.5 18.2 C24.3 16.8 27.1 16.4 29.8 15.3',
  },
  {
    trough: 'M14.2 22 C16.5 20.8 19.5 20.8 21.6 19 C24.1 16.9 27.8 16.8 30.3 15.2 L29.7 17.8 C27.3 18 24.7 18.6 22.3 20.7 C20.1 22.4 16.8 22.3 14.4 23 Z',
    lip: 'M15.2 21.5 C17.6 20.5 19.7 20.4 21.9 18.7 C24.5 16.8 27.1 16.8 29.4 15.7',
  },
  {
    trough: 'M13.8 21.3 C17 21 19 19.1 21.8 18.9 C25 18.7 27.2 16.1 30.6 15.7 L29.6 17.9 C27.2 18.4 25.2 20 22 20.2 C19.2 20.5 17.2 22.2 14.1 22.4 Z',
    lip: 'M15 21 C17.4 20.6 19.5 18.9 22 18.6 C25 18.3 27 16.5 29.7 16',
  },
] as const

export function DayMark({ state, onToggle, animateOnChange = true, accessibilityLabel, variation = 0 }: DayMarkProps) {
  const cut = useRef(new Animated.Value(state === 'done' ? 1 : 0)).current
  const animation = useRef<Animated.CompositeAnimation | null>(null)
  const previous = useRef<DayMarkState | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled)
    })
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => {
      mounted = false
      subscription?.remove?.()
    }
  }, [])

  useEffect(() => {
    const from = previous.current
    previous.current = state
    animation.current?.stop()

    const target = state === 'done' ? 1 : 0
    if (from === null || !animateOnChange || reduceMotion) {
      cut.setValue(target)
      return
    }

    animation.current = Animated.timing(cut, {
      toValue: target,
      duration: state === 'done' ? 260 : 170,
      easing: state === 'done' ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    })
    animation.current.start()
    return () => animation.current?.stop()
  }, [animateOnChange, cut, reduceMotion, state])

  const cutOpacity = cut.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 0.76, 1] })
  const cutScale = cut.interpolate({ inputRange: [0, 1], outputRange: [0.04, 1] })
  const notch = NOTCHES[variation % NOTCHES.length]
  const cutVariant = CUT_VARIANTS[variation % CUT_VARIANTS.length]
  const label = accessibilityLabel ?? (
    state === 'done' ? '已完成 — 已刻記' : state === 'today' ? '標記今天為完成' : '未完成 — 點擊刻記'
  )

  return (
    <Pressable
      onPress={onToggle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: state === 'done' }}
      hitSlop={6}
      style={styles.press}
    >
      <View style={styles.canvas}>
        {state !== 'done' && (
          <Svg width={SLOT} height={SLOT} style={StyleSheet.absoluteFill} pointerEvents="none">
            <G transform="translate(22 19) scale(1.55 1.65) translate(-22 -19)">
              <Path
                d={notch.lip}
                fill="none"
                stroke={state === 'today' ? colors.gold : 'rgba(196,180,154,0.26)'}
                strokeWidth={state === 'today' ? 0.8 : 0.65}
                strokeDasharray={state === 'today' ? '2 3' : undefined}
                strokeLinecap="round"
                opacity={state === 'today' ? 0.58 : hovered ? 0.34 : 0.09}
              />
            </G>
          </Svg>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cut,
            {
              opacity: cutOpacity,
              transform: [
                { translateY: cutVariant.translateY },
                { rotate: cutVariant.rotate },
                { scaleX: cutScale },
                { scaleY: cutVariant.scaleY },
              ],
            },
          ]}
        >
          <Animated.Image source={KNIFE_GOUGE} resizeMode="stretch" style={styles.gouge} />
        </Animated.View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  press: {
    width: SLOT,
    height: SLOT,
  },
  canvas: {
    width: SLOT,
    height: SLOT,
  },
  cut: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gouge: {
    width: 25,
    height: 12,
    transform: [{ translateX: 5 }],
  },
})

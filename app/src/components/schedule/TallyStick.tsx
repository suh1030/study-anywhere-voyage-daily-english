import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

const WOOD = require('../../../assets/tally-stick-v3.png')

// Real wood, inset into the schedule instead of floating above it. The image is
// extended beyond the clipped frame so its rounded ends never read as a separate
// prop, while its grain, hand-shaped edges and face lighting remain visible.
export function TallyStick() {
  return (
    <View style={styles.frame} pointerEvents="none">
      <Image source={WOOD} resizeMode="stretch" style={styles.wood} />
      <View style={styles.woodVeil} />
      <View style={styles.innerShadow} />
      <View style={styles.innerLight} />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#14110f',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.38)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(196,180,154,0.1)',
  },
  wood: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -16,
    bottom: -16,
    width: '100%',
    height: undefined,
    opacity: 0.82,
  },
  woodVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,8,0.05)',
  },
  innerShadow: {
    position: 'absolute',
    left: 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  innerLight: {
    position: 'absolute',
    right: 1,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(224,196,154,0.11)',
  },
})

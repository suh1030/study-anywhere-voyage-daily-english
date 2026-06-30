import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { colors, fonts, spacing } from '../../constants/theme'

// Real carved-gouge assets (cropped + masked from the knife-cut-into-wood reference
// photo). The vertical cut is each tally stroke; the diagonal cut is the gate-five
// (卌) binding strike on every full group. Both dissolve to transparency at their
// edges, so the record reads as accumulated knife marks — not painted lines, and not
// a wood panel.
const GOUGE_STROKE = require('../../../assets/gouge-stroke.png')
const GOUGE_DIAGONAL = require('../../../assets/gouge-diagonal.png')

interface TallyRecordProps {
  completed: number
  streak: number
  pct: number
  phaseLabel: string
  onReset: () => void
  resetConfirm: boolean
}

interface TallyGroup {
  strokes: number
  live: boolean
}

// Group the completed count into gate-five (卌) groups, capped to the most recent
// 7 so the header never overflows as the record grows toward 365.
function buildTally(count: number): { shown: TallyGroup[]; truncated: boolean } {
  const fullGroups = Math.floor(count / 5)
  const rem = count % 5
  const groups: TallyGroup[] = []
  for (let i = 0; i < fullGroups; i++) groups.push({ strokes: 5, live: false })
  if (rem > 0) groups.push({ strokes: rem, live: false })
  if (groups.length) groups[groups.length - 1].live = true
  const shown = groups.slice(-7)
  const truncated = groups.length > 7
  return { shown, truncated }
}

// Tally render geometry (in px, fixed-height rail).
const ROW_H = 34
const STROKE_W = 11 // displayed width of one vertical gouge image
const STROKE_H = 30 // displayed height of one vertical gouge
const VERT_GAP = 5 // gap between the 4 verticals
const GROUP_GAP = 13 // gap between gate-five groups
const VERT_STEP = STROKE_W + VERT_GAP
const GROUP_W = VERT_STEP * 4 + GROUP_GAP

// Age fade: the live (most recent) group is full strength; older groups dim back in
// time so the record visibly fades into the past.
function groupOpacity(indexFromEnd: number, total: number): number {
  if (indexFromEnd === 0) return 1 // live
  // step down ~0.12 per group older, floor 0.4
  return Math.max(0.4, 0.82 - (indexFromEnd - 1) * 0.1)
}

export function TallyRecord({ completed, streak, pct, phaseLabel, onReset, resetConfirm }: TallyRecordProps) {
  const { shown, truncated } = buildTally(completed)

  return (
    <View style={styles.record}>
      <View style={styles.labelRow}>
        <Text style={styles.recordLabel}>THE RECORD</Text>
        {phaseLabel ? <Text style={styles.phaseLabel}> · {phaseLabel}</Text> : null}
      </View>

      <View style={styles.tallyRow}>
        {truncated && <Text style={styles.ellipsis}>…</Text>}
        <View style={styles.tallyStrip}>
          {shown.map((group, gi) => {
            const indexFromEnd = shown.length - 1 - gi
            const opacity = groupOpacity(indexFromEnd, shown.length)
            const verticals = Math.min(group.strokes, 4)
            return (
              <View key={gi} style={[styles.group, { width: GROUP_W, opacity }]}>
                {Array.from({ length: verticals }).map((_, vi) => (
                  <Image
                    key={vi}
                    source={GOUGE_STROKE}
                    resizeMode="contain"
                    style={{
                      position: 'absolute',
                      left: vi * VERT_STEP,
                      top: (ROW_H - STROKE_H) / 2,
                      width: STROKE_W,
                      height: STROKE_H,
                    }}
                  />
                ))}
                {group.strokes === 5 && (
                  // diagonal binding strike across the four verticals (gate-five 卌).
                  // 'stretch' so the real cut spans the full group corner-to-corner;
                  // a diagonal gouge stretched along its own axis still reads as a
                  // single longer knife cut binding the five.
                  <Image
                    source={GOUGE_DIAGONAL}
                    resizeMode="stretch"
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: 1,
                      width: VERT_STEP * 4 + 2,
                      height: ROW_H - 4,
                    }}
                  />
                )}
              </View>
            )
          })}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{completed}</Text>
          <Text style={styles.statLab}>NOTCHED</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{streak}</Text>
          <Text style={styles.statLab}>STREAK</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{pct}%</Text>
          <Text style={styles.statLab}>PROGRESS</Text>
        </View>
      </View>

      <View style={styles.progressBarRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <TouchableOpacity onPress={onReset}>
          <Text style={[styles.resetBtn, resetConfirm && styles.resetBtnConfirm]}>
            {resetConfirm ? 'CONFIRM?' : 'RESET'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  record: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recordLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: colors.uiDim,
    textTransform: 'uppercase',
  },
  phaseLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted,
  },
  tallyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    height: ROW_H,
  },
  ellipsis: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.uiDim,
    marginRight: 6,
  },
  tallyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_H,
    flex: 1,
  },
  group: {
    height: ROW_H,
    position: 'relative',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statVal: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.ui,
  },
  statLab: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 16,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border2,
    borderRadius: 1,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.ui,
    borderRadius: 1,
  },
  resetBtn: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted2,
  },
  resetBtnConfirm: {
    color: colors.error,
  },
})

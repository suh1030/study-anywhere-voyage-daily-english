import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Speech from 'expo-speech'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { SCHEDULE } from '../../data/curriculum'
import { fetchEpisode, type EpisodeRow, type EpisodeLine } from '../../data/content-api'

type Speed = 0.75 | 1 | 1.25

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function ListenScreen() {
  const [episode, setEpisode] = useState<EpisodeRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLine, setCurrentLine] = useState(-1)
  const [showChinese, setShowChinese] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [showKeyPhrases, setShowKeyPhrases] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    const todayKey = getTodayKey()
    const entry = SCHEDULE.find((d) => d.key === todayKey)
    const weekNumber = entry?.week ?? 1
    const dayOfWeek = entry?.dayOfWeek ?? 1

    fetchEpisode(weekNumber, dayOfWeek).then((data) => {
      setEpisode(data)
      setLoading(false)
    })
  }, [])

  // Flatten all lines across parts for prev/next navigation
  const allLines = useMemo<(EpisodeLine & { partIndex: number })[]>(() => {
    const lines: (EpisodeLine & { partIndex: number })[] = []
    episode?.parts.forEach((part, pi) => {
      part.lines.forEach((line) => lines.push({ ...line, partIndex: pi }))
    })
    return lines
  }, [episode])

  // Speak the active line whenever it changes
  useEffect(() => {
    Speech.stop()
    if (currentLine >= 0 && currentLine < allLines.length) {
      Speech.speak(allLines[currentLine].en, {
        language: 'en-US',
        rate: speed,
      })
    }
  }, [currentLine]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-speak at new speed when speed control changes (if a line is active)
  useEffect(() => {
    if (currentLine < 0 || currentLine >= allLines.length) return
    Speech.stop()
    Speech.speak(allLines[currentLine].en, { language: 'en-US', rate: speed })
  }, [speed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop speech on unmount
  useEffect(() => () => { Speech.stop() }, [])

  const handleLinePress = useCallback((index: number) => {
    setCurrentLine(index)
  }, [])

  const handlePrev = () => setCurrentLine((c) => Math.max(0, c - 1))
  const handleNext = () => setCurrentLine((c) => Math.min(allLines.length - 1, c + 1))

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.listen} />
        </View>
      </SafeAreaView>
    )
  }

  if (!episode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No episode for today.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Episode Header */}
      <View style={styles.header}>
        <Text style={styles.weekLabel}>W{String(episode.week_number).padStart(2, '0')}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.theme}>{episode.theme}</Text>
          <Text style={styles.podcast}>{episode.title}</Text>
        </View>
      </View>

      {/* Player Bar */}
      <View style={styles.playerBar}>
        <View style={styles.playerControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={handlePrev}>
            <Text style={styles.controlBtnText}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, styles.playBtn]}
            onPress={() => setCurrentLine((c) => (c < 0 ? 0 : c))}
          >
            <Text style={styles.playBtnText}>PLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleNext}>
            <Text style={styles.controlBtnText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.progressLabel}>
          {Math.max(currentLine + 1, 0)} / {allLines.length}
        </Text>

        <View style={styles.speedRow}>
          {([0.75, 1, 1.25] as Speed[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
              onPress={() => setSpeed(s)}
            >
              <Text style={[styles.speedBtnText, speed === s && styles.speedBtnTextActive]}>
                {s === 1 ? '1.0' : String(s)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.zhToggle, showChinese && styles.zhToggleOn]}
          onPress={() => setShowChinese(!showChinese)}
        >
          <Text style={[styles.zhToggleText, showChinese && styles.zhToggleTextOn]}>
            {showChinese ? '中文 ON' : '中文 OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Script */}
      <ScrollView ref={scrollRef} style={styles.scriptScroll} contentContainerStyle={styles.scriptContent}>
        {episode.parts.map((part, pi) => (
          <View key={pi}>
            <View style={styles.partDivider}>
              <Text style={styles.partTitle}>{part.title}</Text>
            </View>
            {part.lines.map((line, li) => {
              const globalIndex = allLines.findIndex(
                (al) => al.partIndex === pi && al.en === line.en
              )
              const isActive = globalIndex === currentLine
              const speakerColor = line.speaker === 'a' ? colors.ui : colors.green

              return (
                <TouchableOpacity
                  key={li}
                  style={[styles.line, isActive && styles.lineActive]}
                  onPress={() => handleLinePress(globalIndex)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.speakerName, { color: speakerColor }]}>
                    {line.speakerName}
                  </Text>
                  <Text style={[styles.lineEn, isActive && styles.lineEnActive]}>
                    {line.en}
                  </Text>
                  {showChinese && <Text style={styles.lineZh}>{line.zh}</Text>}
                  {line.vocab && line.vocab.length > 0 && (
                    <View style={styles.vocabRow}>
                      {line.vocab.map((v, vi) => (
                        <View key={vi} style={styles.vocabTag}>
                          <Text style={styles.vocabWord}>{v.word}</Text>
                          <Text style={styles.vocabDef}>{v.def}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        ))}

        {/* Key Phrases */}
        <TouchableOpacity
          style={styles.keyPhrasesToggle}
          onPress={() => setShowKeyPhrases(!showKeyPhrases)}
        >
          <Text style={styles.keyPhrasesToggleText}>
            KEY PHRASES {showKeyPhrases ? '−' : '+'}
          </Text>
        </TouchableOpacity>

        {showKeyPhrases &&
          episode.key_phrases.map((kp, i) => (
            <View key={i} style={styles.keyPhraseItem}>
              <Text style={styles.kpEn}>{kp.en}</Text>
              <Text style={styles.kpZh}>{kp.zh}</Text>
              <Text style={styles.kpExample}>"{kp.example}"</Text>
            </View>
          ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  weekLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  headerInfo: { flex: 1 },
  theme: { ...typography.h2, color: colors.listen },
  podcast: { fontSize: 12, color: colors.muted, marginTop: 2 },

  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  playerControls: { flexDirection: 'row', gap: 6 },
  controlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  controlBtnText: { fontFamily: fonts.mono, fontSize: 12, color: colors.text },
  playBtn: { backgroundColor: colors.listen, borderColor: colors.listen },
  playBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.bg, fontWeight: '500' },
  progressLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted },
  speedRow: { flexDirection: 'row', gap: 4 },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  speedBtnActive: { borderColor: colors.listen, backgroundColor: colors.listen + '20' },
  speedBtnText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted },
  speedBtnTextActive: { color: colors.listen },
  zhToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  zhToggleOn: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  zhToggleText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted },
  zhToggleTextOn: { color: colors.gold },

  scriptScroll: { flex: 1 },
  scriptContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  partDivider: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  partTitle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.muted },
  line: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: 4,
    borderRadius: radius.sm,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  lineActive: {
    backgroundColor: colors.surface2,
    borderLeftColor: colors.listen,
  },
  speakerName: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lineEn: { fontSize: 15, lineHeight: 24, color: colors.text },
  lineEnActive: { color: colors.text },
  lineZh: { fontSize: 12, color: colors.muted, lineHeight: 20, marginTop: 4 },
  vocabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  vocabTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  vocabWord: { fontFamily: fonts.mono, fontSize: 10, color: colors.listen },
  vocabDef: { fontSize: 10, color: colors.muted },

  keyPhrasesToggle: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
  },
  keyPhrasesToggleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  keyPhraseItem: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.listen + '40',
    marginBottom: spacing.sm,
  },
  kpEn: { fontSize: 14, fontWeight: '500', color: colors.text },
  kpZh: { fontSize: 12, color: colors.muted, marginTop: 2 },
  kpExample: { fontSize: 12, color: colors.uiDim, fontStyle: 'italic', marginTop: 4 },
})

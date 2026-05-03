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
import Svg, { Polygon, Path, Circle } from 'react-native-svg'
import * as Speech from 'expo-speech'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { getScheduleEntry, getTodayKey } from '../../data/curriculum'
import { fetchEpisode, type EpisodeRow, type EpisodeLine } from '../../data/content-api'
import { useNav } from '../../navigation/NavContext'
import { useCurriculumStore } from '../../stores/curriculumStore'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''

function getAudioUrl(weekNumber: number, dayOfWeek: number, partIndex: number, lineIndex: number) {
  return `${SUPABASE_URL}/storage/v1/object/public/episode-audio/tts/w${weekNumber}_d${dayOfWeek}_p${partIndex}_l${lineIndex}.mp3`
}

type Speed = 0.75 | 1 | 1.25

function IconPrev({ color }: { color: string }) {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Polygon points="10,0 0,6 10,12" fill={color} />
    </Svg>
  )
}

function IconNext({ color }: { color: string }) {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Polygon points="0,0 10,6 0,12" fill={color} />
    </Svg>
  )
}

function IconPlay({ color }: { color: string }) {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Polygon points="0,0 10,6 0,12" fill={color} />
    </Svg>
  )
}

function IconStop({ color }: { color: string }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M0 0h10v10H0z" fill={color} />
    </Svg>
  )
}

function IconListen({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Polygon points="10,8 17,12 10,16" fill={color} />
    </Svg>
  )
}

export default function ListenScreen() {
  const { navigate } = useNav()
  const { schedule, loading: scheduleLoading } = useCurriculumStore()
  const [episode, setEpisode] = useState<EpisodeRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLine, setCurrentLine] = useState(-1)
  const [showChinese, setShowChinese] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [showKeyPhrases, setShowKeyPhrases] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)
  const scrollRef = useRef<ScrollView>(null)
  const lineRefs = useRef<Map<number, React.ElementRef<typeof TouchableOpacity> | null>>(new Map())
  const player = useAudioPlayer(null)

  const isPlaying = currentLine >= 0
  const pausedLineRef = React.useRef(-1)
  const scrollPositionRef = React.useRef(0)
  const playerStatus = useAudioPlayerStatus(player)

  useEffect(() => {
    if (scheduleLoading) return

    const entry = getScheduleEntry(schedule, getTodayKey())
    if (!entry) {
      setEpisode(null)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchEpisode(entry.week, entry.dayOfWeek).then((data) => {
      setEpisode(data)
      setLoading(false)
    })
  }, [schedule, scheduleLoading])

  // Flatten all lines across parts
  const allLines = useMemo<(EpisodeLine & { partIndex: number; lineIndex: number })[]>(() => {
    const lines: (EpisodeLine & { partIndex: number; lineIndex: number })[] = []
    episode?.parts.forEach((part, pi) => {
      part.lines.forEach((line, li) => lines.push({ ...line, partIndex: pi, lineIndex: li }))
    })
    return lines
  }, [episode])

  // Apply speed changes to player
  useEffect(() => {
    try { player.setPlaybackRate(speed) } catch {}
  }, [speed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to active line
  useEffect(() => {
    if (currentLine < 0) return
    setTimeout(() => {
      const el = lineRefs.current.get(currentLine)
      if (!el || !scrollRef.current) return
      el.measureLayout(
        scrollRef.current as unknown as React.ElementRef<typeof View>,
        (_x: number, y: number) => { scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true }) },
        () => {}
      )
    }, 80)
  }, [currentLine])

  // Play audio when current line changes
  useEffect(() => {
    if (currentLine < 0 || currentLine >= allLines.length || !episode) {
      Speech.stop()
      player.pause()
      setAudioUrl(null)
      return
    }

    const line = allLines[currentLine]
    const url = getAudioUrl(episode.week_number, episode.day_of_week, line.partIndex, line.lineIndex)
    Speech.stop()
    setAudioUrl(url)
  }, [currentLine]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play MP3 when audioUrl is set; fall back to Speech on load error
  useEffect(() => {
    if (!audioUrl) return
    const line = allLines[currentLine]
    if (!line) return

    const handleSpeechFallback = () => {
      setAudioUrl(null)
      Speech.speak(line.en, {
        language: 'en-US',
        rate: speed,
        onDone: () => {
          setCurrentLine((c) => {
            if (c < allLines.length - 1) return c + 1
            return -1
          })
        },
      })
    }

    player.replace({ uri: audioUrl })
    Promise.resolve(player.play()).catch(handleSpeechFallback)
    try { player.setPlaybackRate(speed) } catch {}
  }, [audioUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance when MP3 finishes (using didJustFinish from useAudioPlayerStatus)
  useEffect(() => {
    if (!playerStatus.didJustFinish || currentLine < 0) return
    if (currentLine < allLines.length - 1) {
      setCurrentLine((c) => c + 1)
    } else {
      setCurrentLine(-1)
      setAudioUrl(null)
    }
  }, [playerStatus.didJustFinish]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop on unmount
  useEffect(() => () => { Speech.stop() }, [])

  const handleLinePress = useCallback((index: number) => {
    setCurrentLine(index)
  }, [])

  const handlePlayStop = useCallback(() => {
    if (isPlaying) {
      pausedLineRef.current = currentLine
      Speech.stop()
      player.pause()
      setAudioUrl(null)
      setCurrentLine(-1)
    } else {
      const resumeFrom = pausedLineRef.current >= 0 ? pausedLineRef.current : 0
      pausedLineRef.current = -1
      setCurrentLine(resumeFrom)
    }
  }, [isPlaying, currentLine]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = () => setCurrentLine((c) => Math.max(0, c - 1))
  const handleNext = () => setCurrentLine((c) => Math.min(allLines.length - 1, c + 1))

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.listen} />
        </View>
      </SafeAreaView>
    )
  }

  if (!episode) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No episode today</Text>
          <Text style={styles.emptyHint}>Check the Schedule tab to see this week's content.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigate('Schedule')}>
            <Text style={styles.emptyBtnText}>GO TO SCHEDULE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Episode Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.theme}>{episode.theme}</Text>
          <Text style={styles.podcast}>{episode.title}</Text>
        </View>
      </View>

      {/* Player Bar — single row */}
      <View style={styles.playerBar}>
        <TouchableOpacity
          style={[styles.controlBtn, !isPlaying && styles.controlBtnDisabled]}
          onPress={handlePrev}
          disabled={!isPlaying}
        >
          <IconPrev color={isPlaying ? colors.text : colors.muted2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={handlePlayStop}
        >
          {isPlaying
            ? <IconStop color={colors.bg} />
            : <IconPlay color={colors.bg} />}
          <Text style={styles.playBtnText}>{isPlaying ? 'STOP' : 'PLAY'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, !isPlaying && styles.controlBtnDisabled]}
          onPress={handleNext}
          disabled={!isPlaying}
        >
          <IconNext color={isPlaying ? colors.text : colors.muted2} />
        </TouchableOpacity>

        <Text style={styles.progressLabel}>
          {isPlaying ? currentLine + 1 : 0} / {allLines.length}
        </Text>

        <View style={styles.speedRow}>
          {([0.75, 1, 1.25] as Speed[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
              onPress={() => setSpeed(s)}
            >
              <Text style={[styles.speedBtnText, speed === s && styles.speedBtnTextActive]}>
                {s === 1 ? '1.0×' : `${s}×`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.zhToggle, showChinese && styles.zhToggleOn]}
          onPress={() => {
            setShowChinese(!showChinese)
            if (currentLine >= 0) {
              setTimeout(() => {
                const el = lineRefs.current.get(currentLine)
                if (!el || !scrollRef.current) return
                el.measureLayout(
                  scrollRef.current as unknown as React.ElementRef<typeof View>,
                  (_x: number, y: number) => { scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: false }) },
                  () => {}
                )
              }, 50)
            }
          }}
        >
          <Text style={[styles.zhToggleText, showChinese && styles.zhToggleTextOn]}>中文</Text>
        </TouchableOpacity>
      </View>

      {/* Script */}
      <ScrollView
        ref={scrollRef}
        style={styles.scriptScroll}
        contentContainerStyle={styles.scriptContent}
        onScroll={(e) => { scrollPositionRef.current = e.nativeEvent.contentOffset.y }}
        scrollEventThrottle={16}
      >

        {/* Onboarding Hint */}
        {showOnboardingHint && (
          <View style={styles.hintBox}>
            <View style={styles.hintIcon}>
              <IconListen color={colors.listen} />
            </View>
            <View style={styles.hintContent}>
              <Text style={styles.hintTitle}>Listen</Text>
              <Text style={styles.hintDesc}>
                按下播放收聽 Podcast。點選任一行台詞可跳到那一段。開啟「中文」可顯示翻譯，可調整速度（0.75× / 1.0× / 1.25×）。
              </Text>
              <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                <Text style={styles.hintDismiss}>✕ Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {episode.parts.map((part, pi) => (
          <View key={pi}>
            {/* Part divider — centered with lines on both sides */}
            <View style={styles.partDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.partTitle}>PART {pi + 1} — {part.title.toUpperCase()}</Text>
              <View style={styles.dividerLine} />
            </View>
            {part.lines.map((line, li) => {
              const globalIndex = allLines.findIndex(
                (al) => al.partIndex === pi && al.lineIndex === li
              )
              const isActive = globalIndex === currentLine
              const speakerColor = line.speaker === 'a' ? colors.ui : colors.green

              return (
                <TouchableOpacity
                  key={li}
                  ref={(el) => { lineRefs.current.set(globalIndex, el) }}
                  style={[styles.line, isActive && styles.lineActive]}
                  onPress={() => handleLinePress(globalIndex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lineGrid}>
                    {/* Left col: speaker + line number */}
                    <View style={styles.lineLeft}>
                      <Text style={[styles.speakerName, { color: speakerColor }]}>
                        {line.speakerName}
                      </Text>
                      <Text style={styles.lineNumber}>
                        #{String(globalIndex + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    {/* Right col: text + zh */}
                    <View style={styles.lineRight}>
                      <Text style={[styles.lineEn, isActive && styles.lineEnActive]}>
                        {line.en}
                      </Text>
                      {showChinese && <Text style={styles.lineZh}>{line.zh}</Text>}
                    </View>
                  </View>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptyHint: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.listen + '60',
    borderRadius: radius.sm,
  },
  emptyBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.listen },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
  },
  headerInfo: { flex: 1 },
  theme: { fontFamily: fonts.outfitMedium, fontSize: 20, color: colors.ui, lineHeight: 26 },
  podcast: { fontSize: 12, color: colors.muted, marginTop: 2 },

  // Player bar — single row
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  controlBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  controlBtnDisabled: { opacity: 0.3 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 32,
    backgroundColor: colors.listen,
    borderRadius: radius.sm,
  },
  playBtnActive: {
    backgroundColor: colors.muted,
  },
  playBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.bg, fontWeight: '500' },
  progressLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted },
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
  speedRow: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'flex-end' },
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

  // Onboarding hint box
  hintBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    gap: 14,
    borderRadius: radius.md,
  },
  hintIcon: { paddingTop: 2 },
  hintContent: { flex: 1 },
  hintTitle: { fontFamily: fonts.outfitMedium, fontSize: 14, color: colors.ui, marginBottom: 4 },
  hintDesc: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 8 },
  hintDismiss: { fontFamily: fonts.mono, fontSize: 11, color: colors.error, marginTop: 2 },

  scriptScroll: { flex: 1 },
  scriptContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  // Part divider — centered with lines on both sides
  partDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    opacity: 0.5,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  partTitle: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.muted },

  // Script line — two-column grid
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
  lineGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  lineLeft: {
    width: 64,
    flexShrink: 0,
  },
  lineRight: {
    flex: 1,
  },
  speakerName: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  lineNumber: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.muted2,
  },
  lineEn: { fontSize: 15, lineHeight: 24, color: colors.text },
  lineEnActive: { color: colors.text },
  lineZh: { fontSize: 12, color: colors.muted, lineHeight: 20, marginTop: 4 },

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

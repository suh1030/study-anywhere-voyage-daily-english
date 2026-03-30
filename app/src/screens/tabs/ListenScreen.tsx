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
import Svg, { Polygon, Path } from 'react-native-svg'
import * as Speech from 'expo-speech'
import { useAudioPlayer } from 'expo-audio'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { SCHEDULE } from '../../data/curriculum'
import { fetchEpisode, type EpisodeRow, type EpisodeLine } from '../../data/content-api'
import { useNavigation } from '@react-navigation/native'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''

function getAudioUrl(weekNumber: number, dayOfWeek: number, partIndex: number, lineIndex: number) {
  return `${SUPABASE_URL}/storage/v1/object/public/episode-audio/tts/w${weekNumber}_d${dayOfWeek}_p${partIndex}_l${lineIndex}.mp3`
}

type Speed = 0.75 | 1 | 1.25

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

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

export default function ListenScreen() {
  const navigation = useNavigation<any>()
  const [episode, setEpisode] = useState<EpisodeRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLine, setCurrentLine] = useState(-1)
  const [showChinese, setShowChinese] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [showKeyPhrases, setShowKeyPhrases] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const scrollRef = useRef<ScrollView>(null)
  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : null)

  const isPlaying = currentLine >= 0

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

  // Flatten all lines across parts
  const allLines = useMemo<(EpisodeLine & { partIndex: number; lineIndex: number })[]>(() => {
    const lines: (EpisodeLine & { partIndex: number; lineIndex: number })[] = []
    episode?.parts.forEach((part, pi) => {
      part.lines.forEach((line, li) => lines.push({ ...line, partIndex: pi, lineIndex: li }))
    })
    return lines
  }, [episode])

  // Play audio when current line changes
  useEffect(() => {
    if (currentLine < 0 || currentLine >= allLines.length || !episode) {
      Speech.stop()
      setAudioUrl(null)
      return
    }

    const line = allLines[currentLine]
    const url = getAudioUrl(episode.week_number, episode.day_of_week, line.partIndex, line.lineIndex)

    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          Speech.stop()
          setAudioUrl(url)
        } else {
          setAudioUrl(null)
          Speech.stop()
          Speech.speak(line.en, { language: 'en-US', rate: speed })
        }
      })
      .catch(() => {
        setAudioUrl(null)
        Speech.stop()
        Speech.speak(line.en, { language: 'en-US', rate: speed })
      })
  }, [currentLine]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play MP3 when audioUrl is set
  useEffect(() => {
    if (audioUrl && !player.playing) {
      player.play()
    }
  }, [audioUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance to next line when MP3 finishes
  useEffect(() => {
    if (audioUrl && !player.playing && currentLine >= 0) {
      setCurrentLine((c) => Math.min(c + 1, allLines.length - 1))
    }
  }, [player.playing]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop on unmount
  useEffect(() => () => { Speech.stop() }, [])

  const handleLinePress = useCallback((index: number) => {
    setCurrentLine(index)
  }, [])

  const handlePlayStop = useCallback(() => {
    if (isPlaying) {
      Speech.stop()
      setAudioUrl(null)
      setCurrentLine(-1)
    } else {
      setCurrentLine(0)
    }
  }, [isPlaying])

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
          <Text style={styles.emptyTitle}>No episode today</Text>
          <Text style={styles.emptyHint}>Check the Schedule tab to see this week's content.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.emptyBtnText}>GO TO SCHEDULE</Text>
          </TouchableOpacity>
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
        {/* Row 1: Controls + Progress */}
        <View style={styles.playerRow}>
          <View style={styles.playerControls}>
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
          </View>

          <Text style={styles.progressLabel}>
            {isPlaying ? currentLine + 1 : 0} / {allLines.length}
          </Text>

          <TouchableOpacity
            style={[styles.zhToggle, showChinese && styles.zhToggleOn]}
            onPress={() => setShowChinese(!showChinese)}
          >
            <Text style={[styles.zhToggleText, showChinese && styles.zhToggleTextOn]}>中文</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Speed */}
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
                (al) => al.partIndex === pi && al.lineIndex === li
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  theme: { ...typography.h2, color: colors.listen },
  podcast: { fontSize: 12, color: colors.muted, marginTop: 2 },

  playerBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  progressLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted, marginLeft: spacing.xs },
  zhToggle: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  zhToggleOn: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  zhToggleText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted },
  zhToggleTextOn: { color: colors.gold },
  speedRow: { flexDirection: 'row', gap: 4 },
  speedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  speedBtnActive: { borderColor: colors.listen, backgroundColor: colors.listen + '20' },
  speedBtnText: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted },
  speedBtnTextActive: { color: colors.listen },

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

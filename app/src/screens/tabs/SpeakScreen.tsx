import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio'
import * as Speech from 'expo-speech'
import { useNav } from '../../navigation/NavContext'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { getCurrentScheduleEntry } from '../../data/curriculum'
import { fetchArticle, fetchQuestion, type ArticleRow, type QuestionRow } from '../../data/content-api'
import { useCurriculumStore } from '../../stores/curriculumStore'

function IconSpeak({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  )
}

function htmlToParagraphs(value: string): string[] {
  const matches = String(value ?? '').match(/<p>.*?<\/p>/gs)
  const source = matches && matches.length > 0 ? matches : [String(value ?? '')]

  return source
    .map((paragraph) =>
      paragraph
        .replace(/<\/p>\s*<p>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}

export default function SpeakScreen() {
  const { navigate } = useNav()
  const { schedule, loading: scheduleLoading } = useCurriculumStore()
  const [article, setArticle] = useState<ArticleRow | null>(null)
  const [question, setQuestion] = useState<QuestionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChinese, setShowChinese] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSegment, setActiveSegment] = useState(-1)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)
  const manuallyStopped = React.useRef(false)
  const pausedAtSegment = React.useRef(-1)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null)

  const articleParagraphs = React.useMemo(
    () => (article ? htmlToParagraphs(article.text_en) : []),
    [article],
  )
  const articleParagraphsZh = React.useMemo(
    () => (article ? htmlToParagraphs(article.text_zh) : []),
    [article],
  )
  const isSpeaking = activeSegment >= 0

  useEffect(() => {
    if (scheduleLoading) return

    const entry = getCurrentScheduleEntry(schedule)
    if (!entry) {
      setArticle(null)
      setQuestion(null)
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      fetchArticle(entry.week, entry.dayOfWeek),
      fetchQuestion(entry.week, entry.dayOfWeek),
    ]).then(([articleData, questionData]) => {
      setArticle(articleData)
      setQuestion(questionData)
      setLoading(false)
    })
    return () => {
      Speech.stop()
    }
  }, [schedule, scheduleLoading])

  // Speak the active segment whenever activeSegment changes
  useEffect(() => {
    if (activeSegment < 0 || !articleParagraphs.length) {
      Speech.stop()
      return
    }
    if (activeSegment >= articleParagraphs.length) return

    const paragraph = articleParagraphs[activeSegment]
    Speech.stop()
    Speech.speak(paragraph, {
      language: 'en-US',
      rate: 0.86,
      onDone: () => {
        if (manuallyStopped.current) {
          manuallyStopped.current = false
          return
        }
        setActiveSegment((p) => {
          const next = p + 1
          return next < articleParagraphs.length ? next : -1
        })
      },
    })
  }, [activeSegment, articleParagraphs])

  // Detect playback finishing
  useEffect(() => {
    if (!player.playing && isPlaying) {
      setIsPlaying(false)
    }
  }, [player.playing])

  const handlePlayStop = () => {
    if (isSpeaking) {
      manuallyStopped.current = true
      pausedAtSegment.current = activeSegment
      Speech.stop()
      setActiveSegment(-1)
    } else {
      manuallyStopped.current = false
      const startFrom = pausedAtSegment.current >= 0 ? pausedAtSegment.current : 0
      pausedAtSegment.current = -1
      setActiveSegment(startFrom)
    }
  }

  const handleRecord = async () => {
    if (isRecording) {
      try {
        await recorder.stop()
        setRecordingUri(recorder.uri ?? null)
      } catch {}
      setIsRecording(false)
    } else {
      try {
        setIsPlaying(false)
        const { granted } = await AudioModule.requestRecordingPermissionsAsync()
        if (!granted) {
          Alert.alert('Permission required', 'Microphone access is needed to record.')
          return
        }
        Speech.stop()
        setActiveSegment(-1)
        await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
        await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY)
        recorder.record()
        setRecordingUri(null)
        setIsRecording(true)
      } catch {
        Alert.alert('Error', 'Could not start recording.')
      }
    }
  }

  const handlePlayback = async () => {
    if (!recordingUri) return
    try {
      if (isPlaying) {
        player.pause()
        setIsPlaying(false)
      } else {
        await AudioModule.setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true })
        player.play()
        setIsPlaying(true)
      }
    } catch {
      Alert.alert('Error', 'Could not play recording.')
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.speak} />
        </View>
      </SafeAreaView>
    )
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No article today</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.topicLabel}>{article.topic.toUpperCase()}</Text>
          <Text style={styles.wordCount}>{article.word_count} words</Text>
        </View>
        <Text style={styles.title}>{article.title}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlBar}>
        <TouchableOpacity
          style={[styles.ctrlBtn, isSpeaking ? styles.ctrlBtnStop : styles.ctrlBtnPrimary]}
          onPress={handlePlayStop}
        >
          <Text style={isSpeaking ? styles.ctrlBtnStopText : styles.ctrlBtnPrimaryText}>
            {isSpeaking ? 'STOP' : 'PLAY'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, showChinese && styles.ctrlBtnActive]}
          onPress={() => setShowChinese(!showChinese)}
        >
          <Text style={[styles.ctrlBtnText, showChinese && styles.ctrlBtnActiveText]}>
            中文
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, isRecording && styles.recordingBtn]}
          onPress={handleRecord}
        >
          <Text style={[styles.ctrlBtnText, isRecording && styles.recordingText]}>
            {isRecording ? 'STOP REC' : 'RECORD'}
          </Text>
        </TouchableOpacity>

        {recordingUri && !isRecording && (
          <TouchableOpacity style={[styles.ctrlBtn, isPlaying && styles.ctrlBtnActive]} onPress={handlePlayback}>
            <Text style={[styles.ctrlBtnText, isPlaying && styles.ctrlBtnActiveText]}>
              {isPlaying ? 'PAUSE' : 'PLAYBACK'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Onboarding Hint */}
        {showOnboardingHint && (
          <View style={styles.hintBox}>
            <View style={styles.hintIcon}>
              <IconSpeak color={colors.speak} />
            </View>
            <View style={styles.hintContent}>
              <Text style={styles.hintTitle}>Speak</Text>
              <Text style={styles.hintDesc}>
                朗讀今天的完整文章，留意段落節奏、重音和停頓；錄下自己的版本後，再用自己的話回應讀後提示。
              </Text>
              <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                <Text style={styles.hintDismiss}>✕ Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.goalBox}>
          <Text style={styles.goalLabel}>AFTER READING</Text>
          <Text style={styles.goalText}>{question?.question ?? `Summarize the main idea of "${article.title}" in your own words.`}</Text>
          {question?.hint_zh && <Text style={styles.goalHintZh}>{question.hint_zh}</Text>}
          {question?.structure_hint && <Text style={styles.goalHintEn}>{question.structure_hint}</Text>}
        </View>

        {/* Read Aloud Article */}
        <View style={styles.article}>
          {articleParagraphs.map((paragraph, i) => (
            <View key={i}>
              <Text style={styles.segmentLabel}>PARAGRAPH {i + 1}</Text>
              <TouchableOpacity
                onPress={() => setActiveSegment(activeSegment === i ? -1 : i)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.paraEn,
                    activeSegment === i && styles.paraEnActive,
                  ]}
                >
                  {paragraph}
                </Text>
              </TouchableOpacity>
              {showChinese && articleParagraphsZh[i] && (
                <Text style={styles.paraZh}>{articleParagraphsZh[i]}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Vocabulary */}
        {article.vocabulary.length > 0 && (
          <View style={styles.vocabBox}>
            <Text style={styles.vocabTitle}>KEY LANGUAGE</Text>
            <View style={styles.vocabList}>
              {article.vocabulary.map((v, i) => (
                <View key={i} style={styles.vocabTag}>
                  <Text style={styles.vocabWord}>{v.word}</Text>
                  <Text style={styles.vocabDef}>{v.definition}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingBox}>
            <View style={styles.recordingDot} />
            <View style={styles.recordingContent}>
              <Text style={styles.recordingLabel}>RECORDING</Text>
              <Text style={styles.recordingHint}>Read the article aloud, then answer today's prompt in your own words. Tap STOP REC when done.</Text>
            </View>
          </View>
        )}

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
    borderColor: colors.speak + '60',
    borderRadius: radius.sm,
  },
  emptyBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.speak },

  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  dateLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.muted },
  topicLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.uiDim },
  wordCount: { fontFamily: fonts.mono, fontSize: 9, color: colors.muted2 },
  title: { fontFamily: fonts.outfitMedium, fontSize: 22, lineHeight: 30, color: colors.ui },

  controlBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  ctrlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  ctrlBtnText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.text },
  ctrlBtnPrimary: { backgroundColor: colors.speak, borderColor: colors.speak },
  ctrlBtnPrimaryText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.bg, fontWeight: '500' },
  ctrlBtnStop: { backgroundColor: colors.muted, borderColor: colors.muted },
  ctrlBtnStopText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.bg, fontWeight: '500' },
  ctrlBtnActive: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  ctrlBtnActiveText: { color: colors.gold },
  recordingBtn: { borderColor: colors.error, backgroundColor: colors.error + '18' },
  recordingText: { color: colors.error },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

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

  article: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.lg,
    marginBottom: spacing.lg,
  },
  goalBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  goalLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  goalText: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  goalHintZh: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  goalHintEn: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.gold,
  },
  segmentLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.speak,
    marginBottom: spacing.xs,
  },
  paraEn: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paraEnActive: {
    backgroundColor: colors.speak + '12',
    borderRadius: radius.sm,
    paddingHorizontal: 4,
  },
  paraZh: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.muted,
    marginTop: 0,
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.border2,
  },

  vocabBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  vocabTitle: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  vocabList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vocabTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  vocabWord: { fontFamily: fonts.mono, fontSize: 10, color: colors.speak },
  vocabDef: { fontSize: 11, color: colors.muted },

  recordingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error + '40',
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginTop: 4,
  },
  recordingContent: { flex: 1 },
  recordingLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.error,
    marginBottom: 4,
  },
  recordingHint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
})

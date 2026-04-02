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
import { fetchArticle, parseParagraphs, type ArticleRow } from '../../data/content-api'

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

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function SpeakScreen() {
  const { navigate } = useNav()
  const [article, setArticle] = useState<ArticleRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChinese, setShowChinese] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeParagraph, setActiveParagraph] = useState(-1)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null)

  const isSpeaking = activeParagraph >= 0

  useEffect(() => {
    const todayKey = getTodayKey()
    fetchArticle(todayKey).then((data) => {
      setArticle(data)
      setLoading(false)
    })
    return () => {
      Speech.stop()
    }
  }, [])

  // Speak the active paragraph whenever activeParagraph changes
  useEffect(() => {
    if (activeParagraph < 0 || !article) {
      Speech.stop()
      return
    }
    const paragraphs = parseParagraphs(article.text_en)
    if (activeParagraph >= paragraphs.length) return
    Speech.stop()
    Speech.speak(paragraphs[activeParagraph], {
      language: 'en-US',
      rate: 0.9,
      onDone: () => {
        setActiveParagraph((p) => {
          const next = p + 1
          return next < paragraphs.length ? next : -1
        })
      },
    })
  }, [activeParagraph, article])

  // Detect playback finishing
  useEffect(() => {
    if (!player.playing && isPlaying) {
      setIsPlaying(false)
    }
  }, [player.playing])

  const handlePlayStop = () => {
    if (isSpeaking) {
      Speech.stop()
      setActiveParagraph(-1)
    } else {
      setActiveParagraph(0)
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
        setActiveParagraph(-1)
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.speak} />
        </View>
      </SafeAreaView>
    )
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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

  const paragraphsEn = parseParagraphs(article.text_en)
  const paragraphsZh = parseParagraphs(article.text_zh)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.dateLabel}>{article.date_key}</Text>
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
              <Text style={styles.hintTitle}>朗讀練習</Text>
              <Text style={styles.hintDesc}>
                大聲朗讀今日文章。建議先聆聽發音，再錄下自己的聲音比較。可查看單字表學習關鍵詞彙。
              </Text>
              <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                <Text style={styles.hintDismiss}>✕ 我知道了</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Article */}
        <View style={styles.article}>
          {paragraphsEn.map((para, i) => (
            <View key={i}>
              <TouchableOpacity
                onPress={() => setActiveParagraph(activeParagraph === i ? -1 : i)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.paraEn,
                    activeParagraph === i && styles.paraEnActive,
                  ]}
                >
                  {para}
                </Text>
              </TouchableOpacity>
              {showChinese && paragraphsZh[i] && (
                <Text style={styles.paraZh}>{paragraphsZh[i]}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Vocabulary */}
        {article.vocabulary?.length > 0 && (
          <View style={styles.vocabBox}>
            <Text style={styles.vocabTitle}>VOCABULARY</Text>
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
              <Text style={styles.recordingHint}>Read the article aloud. Tap STOP REC when done.</Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  paraEn: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
    marginBottom: spacing.md,
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
    marginTop: -spacing.sm,
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

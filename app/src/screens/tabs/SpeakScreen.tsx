import React, { useEffect, useRef, useState } from 'react'
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
import { Audio, type AVPlaybackStatus } from 'expo-av'
import * as Speech from 'expo-speech'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { fetchArticle, parseParagraphs, type ArticleRow } from '../../data/content-api'

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function SpeakScreen() {
  const [article, setArticle] = useState<ArticleRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChinese, setShowChinese] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeParagraph, setActiveParagraph] = useState(-1)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)
  const recordingUriRef = useRef<string | null>(null)

  useEffect(() => {
    const todayKey = getTodayKey()
    fetchArticle(todayKey).then((data) => {
      setArticle(data)
      setLoading(false)
    })
    return () => {
      Speech.stop()
      soundRef.current?.unloadAsync()
      recordingRef.current?.stopAndUnloadAsync()
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
    Speech.speak(paragraphs[activeParagraph], { language: 'en-US', rate: 0.9 })
  }, [activeParagraph, article])

  const handleRecord = async () => {
    if (isRecording) {
      try {
        await recordingRef.current?.stopAndUnloadAsync()
        recordingUriRef.current = recordingRef.current?.getURI() ?? null
        recordingRef.current = null
      } catch {}
      setIsRecording(false)
    } else {
      try {
        await soundRef.current?.unloadAsync()
        soundRef.current = null
        setIsPlaying(false)

        const { granted } = await Audio.requestPermissionsAsync()
        if (!granted) {
          Alert.alert('Permission required', 'Microphone access is needed to record.')
          return
        }
        Speech.stop()
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        )
        recordingRef.current = recording
        recordingUriRef.current = null
        setIsRecording(true)
      } catch (e) {
        Alert.alert('Error', 'Could not start recording.')
      }
    }
  }

  const handlePlayback = async () => {
    if (!recordingUriRef.current) return
    try {
      if (isPlaying) {
        await soundRef.current?.pauseAsync()
        setIsPlaying(false)
        return
      }
      if (soundRef.current) {
        await soundRef.current.playAsync()
        setIsPlaying(true)
        return
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true })
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUriRef.current },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) setIsPlaying(false)
        }
      )
      soundRef.current = sound
      setIsPlaying(true)
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
          <Text style={styles.emptyText}>No article for today.</Text>
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
          style={[styles.ctrlBtn, styles.ctrlBtnPrimary]}
          onPress={() => setActiveParagraph((p) => (p < 0 ? 0 : (p + 1) % paragraphsEn.length))}
        >
          <Text style={styles.ctrlBtnPrimaryText}>PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, showChinese && styles.ctrlBtnActive]}
          onPress={() => setShowChinese(!showChinese)}
        >
          <Text style={[styles.ctrlBtnText, showChinese && styles.ctrlBtnActiveText]}>
            {showChinese ? '中文 ON' : '中文 OFF'}
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

        {recordingUriRef.current && !isRecording && (
          <TouchableOpacity style={[styles.ctrlBtn, isPlaying && styles.ctrlBtnActive]} onPress={handlePlayback}>
            <Text style={[styles.ctrlBtnText, isPlaying && styles.ctrlBtnActiveText]}>
              {isPlaying ? 'PAUSE' : 'PLAYBACK'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Article */}
        <View style={styles.article}>
          {paragraphsEn.map((para, i) => (
            <View key={i}>
              <TouchableOpacity
                onPress={() => setActiveParagraph(i)}
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

        {/* Recording Box */}
        {isRecording && (
          <View style={styles.recordingBox}>
            <Text style={styles.recordingLabel}>RECORDING</Text>
            <Text style={styles.recordingHint}>Read the article aloud. Tap STOP REC when done.</Text>
          </View>
        )}

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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  title: { ...typography.h1, color: colors.speak },

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
  ctrlBtnActive: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  ctrlBtnActiveText: { color: colors.gold },
  recordingBtn: { borderColor: colors.error, backgroundColor: colors.error + '18' },
  recordingText: { color: colors.error },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error + '40',
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  recordingLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.error,
    marginBottom: 4,
  },
  recordingHint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
})

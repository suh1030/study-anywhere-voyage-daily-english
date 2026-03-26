import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { SCHEDULE } from '../../data/curriculum'
import { fetchQuestion, type QuestionRow } from '../../data/content-api'
import { useCreditsStore } from '../../stores/creditsStore'

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function ConversationScreen() {
  const [question, setQuestion] = useState<QuestionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const { balance, loading: creditsLoading, purchasing, requestFeedback, purchaseCredits } = useCreditsStore()

  useEffect(() => {
    const todayKey = getTodayKey()
    const entry = SCHEDULE.find((d) => d.key === todayKey)
    const weekNumber = entry?.week ?? 1
    const dayOfWeek = entry?.dayOfWeek ?? 1

    fetchQuestion(weekNumber, dayOfWeek).then((data) => {
      setQuestion(data)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async () => {
    if (!question) return
    if (!answer.trim()) {
      Alert.alert('Please write your answer first.')
      return
    }
    if (balance < 1) {
      Alert.alert(
        'No Credits',
        'You need credits to get AI feedback.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Credits', onPress: handleBuyCredits },
        ]
      )
      return
    }

    const result = await requestFeedback(question.question, answer)
    if ('feedback' in result) {
      setFeedback(result.feedback)
    } else {
      Alert.alert('Error', result.error === 'insufficient_credits'
        ? 'Not enough credits.'
        : 'Failed to get feedback. Please try again.')
    }
  }

  const handleBuyCredits = async () => {
    const result = await purchaseCredits()
    if (!result.success && result.error) {
      Alert.alert('Purchase Failed', result.error)
    }
  }

  const handleNext = () => {
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.conversation} />
        </View>
      </SafeAreaView>
    )
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No question for today.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversation</Text>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>{balance} credits</Text>
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            <Text style={styles.questionNum}>W{String(question.week_number).padStart(2, '0')} · Day {question.day_of_week}</Text>
          </View>

          <Text style={styles.questionText}>{question.question}</Text>
          {question.hint_zh && (
            <Text style={styles.questionZh}>{question.hint_zh}</Text>
          )}

          {question.structure_hint && (
            <>
              <TouchableOpacity onPress={() => setShowHint(!showHint)}>
                <Text style={styles.hintToggle}>{showHint ? 'Hide hint' : 'Show hint'}</Text>
              </TouchableOpacity>
              {showHint && <Text style={styles.hintText}>{question.structure_hint}</Text>}
            </>
          )}
        </View>

        {/* Answer Input */}
        <View style={styles.answerSection}>
          <Text style={styles.sectionLabel}>YOUR ANSWER</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Write your answer in English..."
            placeholderTextColor={colors.muted}
            value={answer}
            onChangeText={setAnswer}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Submit / Buy Credits */}
        {!feedback && (
          balance < 1 ? (
            <TouchableOpacity
              style={[styles.buyBtn, purchasing && styles.submitBtnDisabled]}
              onPress={handleBuyCredits}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitBtnText}>BUY CREDITS</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, creditsLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={creditsLoading}
            >
              {creditsLoading ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.submitBtnText}>GET AI FEEDBACK (1 CREDIT)</Text>
              )}
            </TouchableOpacity>
          )
        )}

        {/* Feedback */}
        {feedback && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackLabel}>AI FEEDBACK</Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Navigation */}
        {feedback && (
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
              <Text style={styles.navBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
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
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: { ...typography.h1, color: colors.conversation },
  creditsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gold + '50',
    borderRadius: radius.full,
    backgroundColor: colors.gold + '10',
  },
  creditsText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.gold },

  questionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  questionMeta: {
    marginBottom: spacing.md,
  },
  questionNum: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted },
  questionText: { fontSize: 18, fontWeight: '500', color: colors.text, lineHeight: 28, marginBottom: spacing.sm },
  questionZh: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.md },
  hintToggle: { fontFamily: fonts.mono, fontSize: 10, color: colors.uiDim },
  hintText: {
    fontSize: 13,
    color: colors.gold2,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  answerSection: { marginBottom: spacing.md },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    padding: spacing.md,
    borderRadius: radius.md,
    minHeight: 120,
  },

  submitBtn: {
    backgroundColor: colors.conversation,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.5 },
  buyBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  submitBtnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.bg,
    fontWeight: '500',
  },

  feedbackBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.conversation + '40',
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  feedbackLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.conversation,
    marginBottom: spacing.sm,
  },
  feedbackText: { fontSize: 14, lineHeight: 24, color: colors.text },

  navRow: { alignItems: 'center' },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  navBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.text },
})

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
import { useNavigation } from '@react-navigation/native'
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
  const navigation = useNavigation<any>()
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
      const msg =
        result.error === 'insufficient_credits' ? 'Not enough credits.' :
        result.error === 'daily_limit_reached' ? 'You\'ve reached the 5 feedback limit for today. Come back tomorrow!' :
        result.error === 'ai_unavailable' ? 'AI service is temporarily unavailable. Your credit was not deducted.' :
        'Failed to get feedback. Please try again.'
      Alert.alert('Error', msg)
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
          <Text style={styles.emptyTitle}>No question today</Text>
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
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.weekLabel}>
            W{String(question.week_number).padStart(2, '0')} · Day {question.day_of_week}
          </Text>
        </View>
        <View style={styles.creditsBadge}>
          <Text style={styles.creditsText}>{balance} CR</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.hint_zh && (
            <Text style={styles.questionZh}>{question.hint_zh}</Text>
          )}

          {question.structure_hint && (
            <>
              <TouchableOpacity onPress={() => setShowHint(!showHint)} style={styles.hintToggleBtn}>
                <Text style={styles.hintToggle}>{showHint ? '− Hide hint' : '+ Show hint'}</Text>
              </TouchableOpacity>
              {showHint && <Text style={styles.hintText}>{question.structure_hint}</Text>}
            </>
          )}
        </View>

        {/* Answer Input */}
        <View style={styles.answerSection}>
          <Text style={styles.sectionLabel}>YOUR ANSWER</Text>
          <TextInput
            style={[styles.answerInput, feedback && styles.answerInputDone]}
            placeholder="Write your answer in English..."
            placeholderTextColor={colors.muted}
            value={answer}
            onChangeText={setAnswer}
            multiline
            textAlignVertical="top"
            editable={!feedback}
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
                <Text style={styles.submitBtnText}>GET AI FEEDBACK  ·  1 CREDIT</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  emptyHint: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.conversation + '60',
    borderRadius: radius.sm,
  },
  emptyBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.conversation },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flex: 1 },
  weekLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.muted },
  creditsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.gold + '50',
    borderRadius: radius.full,
    backgroundColor: colors.gold + '10',
  },
  creditsText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.gold },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  questionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.conversation,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  questionText: { fontSize: 18, fontWeight: '500', color: colors.text, lineHeight: 28, marginBottom: spacing.sm },
  questionZh: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.sm },
  hintToggleBtn: { paddingVertical: 4 },
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
  answerInputDone: {
    borderColor: colors.border,
    color: colors.muted,
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

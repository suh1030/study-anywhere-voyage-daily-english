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
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useNav } from '../../navigation/NavContext'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { getScheduleEntry, getTodayKey } from '../../data/curriculum'
import { fetchQuestion, type QuestionRow } from '../../data/content-api'
import { useCreditsStore } from '../../stores/creditsStore'
import { useCurriculumStore } from '../../stores/curriculumStore'

function IconConversation({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </Svg>
  )
}

export default function ConversationScreen() {
  const { navigate } = useNav()
  const { schedule, loading: scheduleLoading } = useCurriculumStore()
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showZh, setShowZh] = useState(false)
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)
  const { balance, loading: creditsLoading, purchasing, requestFeedback, purchaseCredits } = useCreditsStore()

  useEffect(() => {
    if (scheduleLoading) return

    const entry = getScheduleEntry(schedule, getTodayKey())
    if (!entry) {
      setQuestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchQuestion(entry.week, entry.dayOfWeek).then((data) => {
      setQuestions(data ? [data] : [])
      setLoading(false)
    })
  }, [schedule, scheduleLoading])

  const question = questions[questionIndex] ?? null
  const totalQuestions = questions.length

  const handlePrevQuestion = () => {
    setQuestionIndex((i) => Math.max(0, i - 1))
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
    setShowZh(false)
  }

  const handleNextQuestion = () => {
    setQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
    setShowZh(false)
  }

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

    Keyboard.dismiss()
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

  const handleTryAgain = () => {
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
    setShowZh(false)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.conversation} />
        </View>
      </SafeAreaView>
    )
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No question today</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Onboarding Hint */}
        {showOnboardingHint && (
          <View style={styles.hintBox}>
            <View style={styles.hintIcon}>
              <IconConversation color={colors.conversation} />
            </View>
            <View style={styles.hintContent}>
              <Text style={styles.hintTitle}>Conversation</Text>
              <Text style={styles.hintDesc}>
                用英文回答今日問題，不要逐字翻譯，直接說出你的想法。送出後可獲得 AI 針對文法與自然用語的回饋。每次消耗 1 credit，新使用者有 3 credits 免費體驗。
              </Text>
              <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                <Text style={styles.hintDismiss}>✕ Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Buttons row: 中文提示 + HINT */}
          <View style={styles.questionBtns}>
            {question.hint_zh && (
              <TouchableOpacity
                style={[styles.questionBtn, showZh && styles.questionBtnActive]}
                onPress={() => setShowZh(!showZh)}
              >
                <Text style={[styles.questionBtnText, showZh && styles.questionBtnTextActive]}>
                  中文提示
                </Text>
              </TouchableOpacity>
            )}
            {question.structure_hint && (
              <TouchableOpacity
                style={[styles.questionBtn, showHint && styles.questionBtnHintActive]}
                onPress={() => setShowHint(!showHint)}
              >
                <Text style={[styles.questionBtnText, showHint && styles.questionBtnHintTextActive]}>
                  HINT
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showZh && question.hint_zh && (
            <Text style={styles.questionZh}>{question.hint_zh}</Text>
          )}
          {showHint && question.structure_hint && (
            <Text style={styles.hintText}>{question.structure_hint}</Text>
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

        {/* Navigation row: PREV / NEXT + counter */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, questionIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrevQuestion}
            disabled={questionIndex === 0}
          >
            <Text style={[styles.navBtnText, questionIndex === 0 && styles.navBtnTextDisabled]}>
              ← PREV
            </Text>
          </TouchableOpacity>

          <View style={styles.navSpacer} />

          {feedback && (
            <TouchableOpacity style={styles.navBtnSecondary} onPress={handleTryAgain}>
              <Text style={styles.navBtnSecondaryText}>TRY AGAIN</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navBtn, questionIndex >= totalQuestions - 1 && styles.navBtnDisabled]}
            onPress={handleNextQuestion}
            disabled={questionIndex >= totalQuestions - 1}
          >
            <Text style={[styles.navBtnText, questionIndex >= totalQuestions - 1 && styles.navBtnTextDisabled]}>
              NEXT →
            </Text>
          </TouchableOpacity>

          <Text style={styles.navCounter}>
            {questionIndex + 1} / {totalQuestions}
          </Text>
        </View>

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
  questionText: { fontFamily: fonts.outfit, fontSize: 17, color: colors.text, lineHeight: 26, marginBottom: spacing.sm },
  questionBtns: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  questionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  questionBtnActive: { borderColor: colors.conversation, backgroundColor: colors.conversation + '18' },
  questionBtnHintActive: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  questionBtnText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.muted },
  questionBtnTextActive: { color: colors.conversation },
  questionBtnHintTextActive: { color: colors.gold },
  questionZh: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.sm },
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
    backgroundColor: colors.ui,
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

  // Navigation row
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  navSpacer: { flex: 1 },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.text },
  navBtnTextDisabled: { color: colors.muted },
  navBtnSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  navBtnSecondaryText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.muted },
  navCounter: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted2,
    letterSpacing: 1,
  },
})

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Rect } from 'react-native-svg'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { CURRICULUM, getCurrentScheduleEntry, getWeekLength } from '../../data/curriculum'
import { buildReviewPractice } from '../../data/review-practice'
import { fetchFlashcards, fetchQuestion, type FlashcardRow, type QuestionRow } from '../../data/content-api'
import { useCurriculumStore } from '../../stores/curriculumStore'
import { useProgressStore } from '../../stores/progressStore'

const { width } = Dimensions.get('window')
const CARD_MARGIN = 8
const NUM_COLUMNS = 2
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS

type Filter = 'all' | 'active' | 'mastered'

function IconReview({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M3 9h18" stroke={color} strokeWidth="1.5" />
    </Svg>
  )
}

function FlashcardItem({
  card,
  isMastered,
  onToggleMastered,
}: {
  card: FlashcardRow
  isMastered: boolean
  onToggleMastered: (id: string) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const sourceColor = card.source === 'listen' ? colors.listen : colors.speak
  const sourceLabel = card.source === 'listen' ? 'LISTEN' : 'SPEAK'

  return (
    <TouchableOpacity
      style={[styles.card, isMastered && styles.cardMastered]}
      onPress={() => setFlipped(!flipped)}
      activeOpacity={0.8}
    >
      <View style={[styles.sourceBadge, { borderColor: sourceColor, backgroundColor: `${sourceColor}18` }]}>
        <Text style={[styles.sourceBadgeText, { color: sourceColor }]}>{sourceLabel}</Text>
      </View>

      {!flipped ? (
        <>
          <Text style={styles.cardEnglish}>{card.english}</Text>
          <Text style={styles.tapHint}>tap to flip</Text>
        </>
      ) : (
        <>
          <Text style={styles.cardChinese}>{card.chinese}</Text>
          {card.example_sentence && (
            <Text style={styles.cardExample}>{card.example_sentence}</Text>
          )}
        </>
      )}

      {isMastered && (
        <View style={styles.masteredBadge}>
          <Text style={styles.masteredText}>MASTERED</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.markMasteredBtn}
        onPress={() => onToggleMastered(card.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.markMasteredText}>
          {isMastered ? 'UNMARK' : 'MARK AS MASTERED'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default function ReviewScreen() {
  const { schedule, loading: scheduleLoading } = useCurriculumStore()
  const { masteredCards, toggleCard } = useProgressStore()
  const [cards, setCards] = useState<FlashcardRow[]>([])
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)

  const todayEntry = useMemo(() => {
    if (scheduleLoading) return null
    return getCurrentScheduleEntry(schedule)
  }, [schedule, scheduleLoading])

  const curriculumWeek = useMemo(() => {
    if (!todayEntry) return null
    return CURRICULUM.find((week) => week.wn === todayEntry.week) ?? null
  }, [todayEntry])

  useEffect(() => {
    if (scheduleLoading) return

    if (!todayEntry) {
      setCards([])
      setQuestions([])
      setLoading(false)
      return
    }

    let cancelled = false

    setLoading(true)
    Promise.all([
      fetchFlashcards(todayEntry.week),
      Promise.all(
        Array.from({ length: getWeekLength(todayEntry.week) }, (_unused, index) =>
          fetchQuestion(todayEntry.week, index + 1),
        ),
      ),
    ])
      .then(([flashcardData, questionData]) => {
        if (cancelled) return
        setCards(flashcardData)
        setQuestions(questionData.filter((row): row is QuestionRow => row !== null))
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setCards([])
        setQuestions([])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [todayEntry, scheduleLoading])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const isMastered = masteredCards.includes(card.id)
      switch (filter) {
        case 'active':
          return !isMastered
        case 'mastered':
          return isMastered
        default:
          return true
      }
    })
  }, [filter, masteredCards, cards])

  const stats = useMemo(() => {
    const total = cards.length
    const mastered = cards.filter((card) => masteredCards.includes(card.id)).length
    return { total, mastered, pct: total > 0 ? Math.round((mastered / total) * 100) : 0 }
  }, [masteredCards, cards])

  const reviewPractice = useMemo(() => {
    return buildReviewPractice(cards, questions, masteredCards)
  }, [cards, questions, masteredCards])

  const recapPrompt = useMemo(() => {
    if (!curriculumWeek) return null

    return {
      question: `In 4 to 6 sentences, what did this week on ${curriculumWeek.theme.toLowerCase()} help you notice about your own life?`,
      hintZh: `用 4 到 6 句，說說這週主題「${curriculumWeek.theme}」讓你對自己的生活多看見了什麼，再加上一句你真的會用的英文表達。`,
      structureHint: 'Use: One thing I noticed this week is... / A phrase I can actually use is... / Going forward, I want to...',
    }
  }, [curriculumWeek])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'active', label: 'ACTIVE' },
    { key: 'mastered', label: 'MASTERED' },
  ]

  const renderCard = useCallback(
    ({ item }: { item: FlashcardRow }) => (
      <FlashcardItem
        card={item}
        isMastered={masteredCards.includes(item.id)}
        onToggleMastered={toggleCard}
      />
    ),
    [masteredCards, toggleCard],
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.review} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        {todayEntry && (
          <Text style={styles.headerEyebrow}>
            WEEK {String(todayEntry.week).padStart(2, '0')} · {todayEntry.theme.toUpperCase()}
          </Text>
        )}
        <Text style={styles.headerTitle}>Weekly Review</Text>
        <Text style={styles.headerStat}>
          {stats.mastered}/{stats.total} mastered ({stats.pct}%)
        </Text>
      </View>

      <View style={styles.filterBar}>
        {filters.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterBtn, filter === option.key && styles.filterBtnActive]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[styles.filterBtnText, filter === option.key && styles.filterBtnTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View>
            {showOnboardingHint && (
              <View style={styles.hintBox}>
                <View style={styles.hintIcon}>
                  <IconReview color={colors.review} />
                </View>
                <View style={styles.hintContent}>
                  <Text style={styles.hintTitle}>Review</Text>
                  <Text style={styles.hintDesc}>
                    先回想，再翻卡，最後講一段完整答案。不要一開始就看答案，先把這週內容從記憶裡拉回來。
                  </Text>
                  <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                    <Text style={styles.hintDismiss}>✕ Got it</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.summaryBox}>
              <Text style={styles.sectionEyebrow}>REVIEW FLOW</Text>
              <Text style={styles.sectionTitle}>把翻卡變成完整複習</Text>
              <Text style={styles.sectionBody}>
                先用這週題目做 retrieval，再用字卡補最後不穩的詞，最後用 3 個本週表達講一段自己的總結。
              </Text>

              <View style={styles.flowRow}>
                <View style={styles.flowStep}>
                  <Text style={styles.flowStepNumber}>1</Text>
                  <Text style={styles.flowStepLabel}>Recall</Text>
                </View>
                <View style={styles.flowStep}>
                  <Text style={styles.flowStepNumber}>2</Text>
                  <Text style={styles.flowStepLabel}>Flashcards</Text>
                </View>
                <View style={styles.flowStep}>
                  <Text style={styles.flowStepNumber}>3</Text>
                  <Text style={styles.flowStepLabel}>Speak</Text>
                </View>
              </View>
            </View>

            {reviewPractice.recallPrompts.length > 0 && (
              <View style={styles.sectionPanel}>
                <Text style={styles.sectionEyebrow}>RETRIEVAL</Text>
                <Text style={styles.sectionTitle}>本週回想題</Text>

                {reviewPractice.recallPrompts.map((prompt, index) => (
                  <View key={prompt.id} style={styles.promptCard}>
                    <View style={styles.promptIndexWrap}>
                      <Text style={styles.promptIndex}>{index + 1}</Text>
                    </View>

                    <View style={styles.promptMain}>
                      <Text style={styles.promptQuestion}>{prompt.question}</Text>
                      {prompt.hintZh && (
                        <Text style={styles.promptHintZh}>{prompt.hintZh}</Text>
                      )}
                      {prompt.structureHint && (
                        <Text style={styles.promptStructure}>{prompt.structureHint}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {recapPrompt && (
              <View style={styles.challengeBox}>
                <Text style={styles.sectionEyebrow}>WEEKLY RECAP</Text>
                <Text style={styles.sectionTitle}>用本週語言說一段完整總結</Text>
                <Text style={styles.challengeQuestion}>{recapPrompt.question}</Text>
                <Text style={styles.challengeHintZh}>{recapPrompt.hintZh}</Text>
                <Text style={styles.challengeHintEn}>{recapPrompt.structureHint}</Text>

                {reviewPractice.challengeCards.length > 0 && (
                  <View style={styles.challengeChipRow}>
                    {reviewPractice.challengeCards.map((card) => {
                      const chipColor = card.source === 'listen' ? colors.listen : colors.speak
                      return (
                        <View
                          key={card.id}
                          style={[styles.challengeChip, { borderColor: `${chipColor}60`, backgroundColor: `${chipColor}14` }]}
                        >
                          <Text style={styles.challengeChipWord}>{card.english}</Text>
                          <Text style={[styles.challengeChipSource, { color: chipColor }]}>
                            {card.source === 'listen' ? 'LISTEN' : 'SPEAK'}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'mastered'
                ? 'No mastered cards yet.\nTap the button on any card to mark it.'
                : filter === 'active'
                  ? 'All cards are mastered!'
                  : 'No flashcards for this week yet.'}
            </Text>
            {filter !== 'all' && (
              <TouchableOpacity style={styles.emptyFilterBtn} onPress={() => setFilter('all')}>
                <Text style={styles.emptyFilterBtnText}>SHOW ALL CARDS</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.review,
    marginBottom: 6,
  },
  headerTitle: { fontFamily: fonts.outfitMedium, fontSize: 24, color: colors.text },
  headerStat: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  filterBtnActive: {
    borderColor: colors.review,
    backgroundColor: colors.review + '18',
  },
  filterBtnText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted,
  },
  filterBtnTextActive: { color: colors.review },
  row: {
    paddingHorizontal: spacing.lg,
    gap: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  hintBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: 14,
    borderRadius: radius.md,
  },
  hintIcon: { paddingTop: 2 },
  hintContent: { flex: 1 },
  hintTitle: {
    fontFamily: fonts.outfitMedium,
    fontSize: 14,
    color: colors.ui,
    marginBottom: 4,
  },
  hintDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 8,
  },
  hintDismiss: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.error,
    marginTop: 2,
  },
  summaryBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionPanel: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.review + '35',
  },
  sectionEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.review,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.outfitMedium,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  sectionBody: {
    ...typography.body,
    color: colors.muted,
  },
  flowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  flowStep: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border2,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  flowStepNumber: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.review,
    marginBottom: 4,
  },
  flowStepLabel: {
    fontFamily: fonts.outfitMedium,
    fontSize: 13,
    color: colors.text,
  },
  promptCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  promptIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.review + '55',
    backgroundColor: colors.review + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  promptIndex: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.review,
  },
  promptMain: { flex: 1 },
  promptQuestion: {
    fontFamily: fonts.outfit,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  promptHintZh: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 6,
  },
  promptStructure: {
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 17,
    color: colors.gold2,
    marginTop: 8,
  },
  challengeQuestion: {
    fontFamily: fonts.outfit,
    fontSize: 17,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 8,
  },
  challengeHintZh: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 8,
  },
  challengeHintEn: {
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 17,
    color: colors.gold2,
  },
  challengeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  challengeChip: {
    minWidth: 110,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  challengeChipWord: {
    fontFamily: fonts.outfitMedium,
    fontSize: 14,
    color: colors.text,
  },
  challengeChipSource: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.1,
    marginTop: 4,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  cardMastered: { opacity: 0.5 },
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  cardEnglish: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: colors.muted2,
    textAlign: 'center',
    marginTop: 8,
  },
  cardChinese: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gold,
    textAlign: 'center',
  },
  cardExample: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  masteredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    alignItems: 'center',
  },
  masteredText: {
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: 1.5,
    color: colors.review,
  },
  markMasteredBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 5,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  markMasteredText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.muted2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyFilterBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.review + '60',
    borderRadius: radius.sm,
  },
  emptyFilterBtnText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.review,
  },
})

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
import Svg, { Path, Rect } from 'react-native-svg' // Rect used in IconReview
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { getScheduleEntry, getTodayKey } from '../../data/curriculum'
import { fetchFlashcards, type FlashcardRow } from '../../data/content-api'
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

      {/* Mark as Mastered button */}
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
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showOnboardingHint, setShowOnboardingHint] = useState(true)

  useEffect(() => {
    if (scheduleLoading) return

    const entry = getScheduleEntry(schedule, getTodayKey())
    if (!entry) {
      setCards([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchFlashcards(entry.week).then((data) => {
      setCards(data)
      setLoading(false)
    })
  }, [schedule, scheduleLoading])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const isMastered = masteredCards.includes(card.id)
      switch (filter) {
        case 'active': return !isMastered
        case 'mastered': return isMastered
        default: return true
      }
    })
  }, [filter, masteredCards, cards])

  const stats = useMemo(() => {
    const total = cards.length
    const mastered = cards.filter((c) => masteredCards.includes(c.id)).length
    return { total, mastered, pct: total > 0 ? Math.round((mastered / total) * 100) : 0 }
  }, [masteredCards, cards])

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
    [masteredCards, toggleCard]
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
      {/* Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.headerStat}>
          {stats.mastered}/{stats.total} mastered ({stats.pct}%)
        </Text>
      </View>

      {/* Filter Bar — 3 buttons: ALL | ACTIVE | MASTERED */}
      <View style={styles.filterBar}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards Grid */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          showOnboardingHint ? (
            <View style={styles.hintBox}>
              <View style={styles.hintIcon}>
                <IconReview color={colors.review} />
              </View>
              <View style={styles.hintContent}>
                <Text style={styles.hintTitle}>Review</Text>
                <Text style={styles.hintDesc}>
                  點擊卡片翻面，查看中文意思與例句。熟記後標記為「已掌握」。
                </Text>
                <TouchableOpacity onPress={() => setShowOnboardingHint(false)}>
                  <Text style={styles.hintDismiss}>✕ Got it</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'mastered'
                ? 'No mastered cards yet.\nTap the button on any card to mark it.'
                : filter === 'active'
                ? 'All cards are mastered!'
                : 'No flashcards for this week yet.'}
            </Text>
            {(filter !== 'all') && (
              <TouchableOpacity style={styles.emptyFilterBtn} onPress={() => setFilter('all')}>
                <Text style={styles.emptyFilterBtnText}>SHOW ALL CARDS</Text>
              </TouchableOpacity>
            )}
          </View>
        }
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

  // Onboarding hint box
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
  hintTitle: { fontFamily: fonts.outfitMedium, fontSize: 14, color: colors.ui, marginBottom: 4 },
  hintDesc: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 8 },
  hintDismiss: { fontFamily: fonts.mono, fontSize: 11, color: colors.error, marginTop: 2 },

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
  // Mark as Mastered button at bottom of each card
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

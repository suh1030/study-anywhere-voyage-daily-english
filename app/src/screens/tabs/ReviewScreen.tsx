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
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { SCHEDULE } from '../../data/curriculum'
import { fetchFlashcards, type FlashcardRow } from '../../data/content-api'
import { useProgressStore } from '../../stores/progressStore'

const { width } = Dimensions.get('window')
const CARD_MARGIN = 8
const NUM_COLUMNS = 2
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS

type Filter = 'all' | 'listen' | 'speak' | 'mastered' | 'unmastered'

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
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

  return (
    <TouchableOpacity
      style={[styles.card, isMastered && styles.cardMastered]}
      onPress={() => setFlipped(!flipped)}
      onLongPress={() => onToggleMastered(card.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />

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
    </TouchableOpacity>
  )
}

export default function ReviewScreen() {
  const { masteredCards, toggleCard } = useProgressStore()
  const [cards, setCards] = useState<FlashcardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const todayKey = getTodayKey()
    const entry = SCHEDULE.find((d) => d.key === todayKey)
    const weekNumber = entry?.week ?? 1
    fetchFlashcards(weekNumber).then((data) => {
      setCards(data)
      setLoading(false)
    })
  }, [])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const isMastered = masteredCards.includes(card.id)
      switch (filter) {
        case 'listen': return card.source === 'listen'
        case 'speak': return card.source === 'speak'
        case 'mastered': return isMastered
        case 'unmastered': return !isMastered
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
    { key: 'listen', label: 'LISTEN' },
    { key: 'speak', label: 'SPEAK' },
    { key: 'mastered', label: 'MASTERED' },
    { key: 'unmastered', label: 'LEARNING' },
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.review} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.headerStat}>
          {stats.mastered}/{stats.total} mastered ({stats.pct}%)
        </Text>
      </View>

      {/* Filter Bar */}
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>No cards match this filter.</Text>
        }
      />

      <Text style={styles.hint}>Long press a card to mark as mastered</Text>
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
  headerTitle: { ...typography.h1, color: colors.review },
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
  card: {
    width: CARD_WIDTH,
    minHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: 'center',
  },
  cardMastered: { opacity: 0.5 },
  sourceDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
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
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  masteredText: {
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: 1.5,
    color: colors.review,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.muted2,
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
})

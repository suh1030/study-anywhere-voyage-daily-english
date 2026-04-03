import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNav } from '../../navigation/NavContext'
import { colors, fonts, spacing, radius, typography } from '../../constants/theme'
import { CURRICULUM, SCHEDULE, PHASE_LABELS, getWeekDays } from '../../data/curriculum'
import { useProgressStore } from '../../stores/progressStore'
import { useCreditsStore } from '../../stores/creditsStore'
import { useAuthStore } from '../../stores/authStore'
import ProfileModal from '../../components/ProfileModal'

const ROW_COLORS = {
  listen: colors.listen,
  conversation: colors.conversation,
  speak: colors.speak,
  review: colors.review,
}

function getTodayKey() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function getCurrentWeek() {
  const todayKey = getTodayKey()
  const entry = SCHEDULE.find((d) => d.key === todayKey)
  return entry?.week ?? 1
}

const TAB_NAMES: Record<string, string> = {
  Speak: 'Speak',
  Listen: 'Listen',
  Conversation: 'Conversation',
  Review: 'Review',
}

function getWeekPodcast(weekNum: number): string {
  return CURRICULUM.find((w) => w.wn === weekNum)?.podcast ?? ''
}

export default function ScheduleScreen() {
  const { navigate } = useNav()
  const { completedDays, toggleDay, sync: syncProgress } = useProgressStore()
  const { user } = useAuthStore()
  const { balance, fetchBalance } = useCreditsStore()
  const [showProfile, setShowProfile] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => new Set([getCurrentWeek()]))
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    if (user) fetchBalance()
  }, [user])
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<SectionList>(null)

  const todayKey = getTodayKey()
  const currentWeek = getCurrentWeek()

  const toggleWeek = useCallback((wn: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(wn)) next.delete(wn)
      else next.add(wn)
      return next
    })
  }, [])

  const handleToggleDay = useCallback((key: string) => {
    toggleDay(key)
  }, [toggleDay])

  const handleDayPress = useCallback((type: string) => {
    const tabName = TAB_NAMES[type]
    if (tabName) navigate(tabName as any)
  }, [navigate])

  const handleReset = useCallback(() => {
    if (resetConfirm) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      setResetConfirm(false)
      Object.keys(completedDays).forEach((k) => toggleDay(k))
      syncProgress()
    } else {
      setResetConfirm(true)
      resetTimerRef.current = setTimeout(() => setResetConfirm(false), 3000)
    }
  }, [resetConfirm, completedDays, toggleDay, syncProgress])

  // Build sections grouped by phase
  const sections = useMemo(() => {
    const phases: Record<string, typeof CURRICULUM> = {}
    for (const w of CURRICULUM) {
      if (!phases[w.phase]) phases[w.phase] = []
      phases[w.phase].push(w)
    }
    return Object.entries(phases).map(([phase, weeks]) => ({
      title: PHASE_LABELS[phase] ?? phase,
      data: weeks,
    }))
  }, [])

  // Stats
  const stats = useMemo(() => {
    const completed = Object.keys(completedDays).length
    const total = SCHEDULE.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate streak
    let streak = 0
    for (let i = SCHEDULE.length - 1; i >= 0; i--) {
      if (SCHEDULE[i].key > todayKey) continue
      if (completedDays[SCHEDULE[i].key]) streak++
      else break
    }

    return { completed, total, pct, streak }
  }, [completedDays, todayKey])

  // Auto-scroll to current week on mount
  const handleListReady = useCallback(() => {
    const currentWeekIdx = sections.findIndex((s) =>
      s.data.some((w) => w.wn === currentWeek)
    )
    if (currentWeekIdx >= 0) {
      setTimeout(() => {
        listRef.current?.scrollToLocation({
          sectionIndex: currentWeekIdx,
          itemIndex: 0,
          animated: true,
          viewOffset: 0,
        })
      }, 300)
    }
  }, [sections, currentWeek])

  const renderWeekHeader = useCallback(
    ({ item: week }: { item: (typeof CURRICULUM)[0] }) => {
      const isExpanded = expandedWeeks.has(week.wn)
      const weekDays = getWeekDays(week.wn)
      const weekCompleted = weekDays.filter((d) => completedDays[d.key]).length
      const isCurrent = week.wn === currentWeek

      return (
        <View>
          <TouchableOpacity
            style={[styles.weekRow, isCurrent && styles.weekRowCurrent]}
            onPress={() => toggleWeek(week.wn)}
            activeOpacity={0.7}
          >
            <Text style={styles.weekNumber}>W{String(week.wn).padStart(2, '0')}</Text>
            <View style={styles.weekInfo}>
              <Text style={[styles.weekTheme, isCurrent && styles.weekThemeCurrent]}>
                {week.theme}
              </Text>
              <Text style={styles.weekPodcast}>{week.podcast}</Text>
            </View>
            <Text style={styles.weekProgress}>
              {weekCompleted}/{weekDays.length}
            </Text>
            <Text style={styles.chevron}>{isExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.daysList}>
              {weekDays.map((day) => {
                const isDone = !!completedDays[day.key]
                const isToday = day.key === todayKey
                return (
                  <View
                    key={day.key}
                    style={[styles.dayRow, isToday && styles.dayRowToday]}
                  >
                    <TouchableOpacity
                      style={[styles.checkbox, isDone && styles.checkboxDone]}
                      onPress={() => handleToggleDay(day.key)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {isDone && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayDate}>{day.label} {day.wd}</Text>
                      {day.type === 'Review' ? (
                        <TouchableOpacity onPress={() => handleDayPress('Review')}>
                          <View style={styles.dayContentRow}>
                            <View style={[styles.typeDot, { backgroundColor: ROW_COLORS.review }]} />
                            <Text style={[styles.dayTopic, isDone && styles.dayTopicDone]} numberOfLines={1}>
                              {day.topic}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity onPress={() => handleDayPress('Listen')}>
                            <View style={styles.dayContentRow}>
                              <View style={[styles.typeDot, { backgroundColor: ROW_COLORS.listen }]} />
                              <Text style={[styles.dayTopicSub, isDone && styles.dayTopicDone]} numberOfLines={1}>
                                {day.week ? getWeekPodcast(day.week) : day.topic}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDayPress('Conversation')}>
                            <View style={styles.dayContentRow}>
                              <View style={[styles.typeDot, { backgroundColor: ROW_COLORS.conversation }]} />
                              <Text style={[styles.dayTopicSub, isDone && styles.dayTopicDone]} numberOfLines={1}>
                                {day.topic}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDayPress('Speak')}>
                            <View style={styles.dayContentRow}>
                              <View style={[styles.typeDot, { backgroundColor: ROW_COLORS.speak }]} />
                              <Text style={[styles.dayTopicSub, isDone && styles.dayTopicDone]} numberOfLines={1}>
                                {day.theme}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expandedWeeks, completedDays, todayKey, currentWeek, toggleWeek, handleToggleDay, handleDayPress]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />

      {/* Stats Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
            <Text style={styles.profileBtnText}>{balance > 0 ? `${balance} CR` : 'PROFILE'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pct}%</Text>
            <Text style={styles.statLabel}>PROGRESS</Text>
          </View>
        </View>
        <View style={styles.progressBarRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.pct}%` }]} />
          </View>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.resetBtn, resetConfirm && styles.resetBtnConfirm]}>
              {resetConfirm ? 'CONFIRM?' : 'RESET'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => String(item.wn)}
        renderItem={renderWeekHeader}
        renderSectionHeader={({ section }) => (
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseLabel}>{section.title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        onLayout={handleListReady}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandSav: {
    fontFamily: fonts.mono,
    fontSize: 14,
    letterSpacing: 3,
    color: colors.ui,
    fontWeight: '600',
  },
  brandSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
  },
  profileBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: radius.sm,
  },
  profileBtnText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.ui,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resetBtn: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted2,
  },
  resetBtnConfirm: {
    color: colors.error,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.ui,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.muted,
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border2,
    borderRadius: 1,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.ui,
    borderRadius: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  phaseHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  phaseLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekRowCurrent: {
    borderLeftWidth: 2,
    borderLeftColor: colors.ui,
  },
  weekNumber: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.muted,
    width: 36,
  },
  weekInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  weekTheme: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  weekThemeCurrent: {
    color: colors.ui,
  },
  weekPodcast: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  weekProgress: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: 16,
    color: colors.muted,
    width: 20,
    textAlign: 'center',
  },
  daysList: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.lg + 36 + spacing.sm,
    gap: spacing.sm,
  },
  dayRowToday: {
    backgroundColor: colors.surface2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.ui + '30',
    borderColor: colors.ui,
  },
  checkmark: {
    fontSize: 11,
    color: colors.ui,
    fontWeight: '600',
  },
  dayInfo: {
    flex: 1,
    gap: 4,
  },
  dayDate: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
    marginBottom: 2,
  },
  dayContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dayTopic: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  dayTopicSub: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  dayTopicDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
})

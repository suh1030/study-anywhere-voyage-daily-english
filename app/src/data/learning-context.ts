import { useCurriculumStore } from '../stores/curriculumStore'
import { useProgressStore } from '../stores/progressStore'
import { formatLocalDate, getCurrentScheduleEntry } from './curriculum'

// 組出精簡的「學習狀態快照」給 Polaris 參考（aggregate，無個資）。
// 即時組出、用完即丟，不另外儲存。送到後端時放在 request 的 context 欄位。
export function buildLearningContext(): string {
  const { schedule } = useCurriculumStore.getState()
  const { completedDays, masteredCards } = useProgressStore.getState()
  if (!schedule.length) return ''

  const today = formatLocalDate()
  const total = schedule.length
  const todayEntry = getCurrentScheduleEntry(schedule)

  // 截至今天「應完成」的日子，以及實際完成 / 漏掉的
  const due = schedule.filter((d) => d.calendarDate <= today)
  const completed = due.filter((d) => completedDays[d.id])
  const missed = due.filter((d) => !completedDays[d.id])
  const rate = due.length ? Math.round((completed.length / due.length) * 100) : 0
  const recentMissed = missed.slice(-5).map((d) => `W${d.week} Day${d.dayOfWeek}（${d.calendarDate.slice(5)}）`)

  const lines = ['【學生目前的學習狀態（僅供你參考回答進度相關問題，不要主動唸出全部）】']
  if (todayEntry) {
    lines.push(
      `- 今天：第 ${todayEntry.programDay}/${total} 天（第 ${todayEntry.week} 週 Day ${todayEntry.dayOfWeek}），主題「${todayEntry.theme}」，今日類型 ${todayEntry.type}，題目「${todayEntry.topic}」`
    )
  } else {
    lines.push(`- 課程共 ${total} 天`)
  }
  lines.push(`- 完成度：已完成 ${completed.length} 天（截至今天應完成 ${due.length} 天），完成率 ${rate}%`)
  if (recentMissed.length) {
    lines.push(`- 最近漏掉：${recentMissed.join('、')}`)
  } else if (due.length) {
    lines.push('- 最近沒有漏掉的日子，狀態很好')
  }
  lines.push(`- 字卡：已精熟 ${masteredCards.length} 張`)
  if (todayEntry) lines.push(`- 本週主題：${todayEntry.theme}`)

  return lines.join('\n')
}

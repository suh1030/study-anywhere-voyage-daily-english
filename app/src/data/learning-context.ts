import { useCurriculumStore } from '../stores/curriculumStore'
import { getCurrentScheduleEntry } from './curriculum'

// 組出精簡的「今日教學脈絡」給 Polaris 參考（僅課程內容，無個人進度數字）。
// 進度、完成率、漏掉的日子、字卡精熟數等「可信數字」一律改由後端工具即時查詢，
// 前端不再送出，以免被竄改——後端只信任工具回傳的數字，絕不採信前端 context。
// 即時組出、用完即丟，不另外儲存。送到後端時放在 request 的 context 欄位。
export function buildLearningContext(): string {
  const { schedule } = useCurriculumStore.getState()
  if (!schedule.length) return ''

  const total = schedule.length
  const todayEntry = getCurrentScheduleEntry(schedule)

  const lines = ['【學生目前的學習狀態（僅供你參考回答進度相關問題，不要主動唸出全部）】']
  if (todayEntry) {
    lines.push(
      `- 今天：第 ${todayEntry.programDay}/${total} 天（第 ${todayEntry.week} 週 Day ${todayEntry.dayOfWeek}），主題「${todayEntry.theme}」，今日類型 ${todayEntry.type}，題目「${todayEntry.topic}」`
    )
    lines.push(`- 本週主題：${todayEntry.theme}`)
  } else {
    lines.push(`- 課程共 ${total} 天`)
  }

  return lines.join('\n')
}

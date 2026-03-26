import { Episode } from '../types'

// ─── Week imports ─────────────────────────────────────────────────────────
import { WEEK_01 } from './week-01'      // New Year & Fresh Starts  (1/1–1/4)
import { WEEK_02 } from './week-02'      // Morning Routines         (1/5–1/11)
import { WEEK_03 } from './week-03'      // Commuting                (1/12–1/18)
import { WEEK_04 } from './week-04'      // Home & Living Space      (1/19–1/25)
import { WEEK_05 } from './week-05'      // Celebrations & Festivals (1/26–2/1)
import { WEEK_06 } from './week-06'      // Food & Eating Habits     (2/2–2/8)
import { WEEK_07 } from './week-07'      // Weather & Seasons        (2/9–2/15)
import { WEEK_08 } from './week-08'      // Shopping & Money         (2/16–2/22)
import { WEEK_09 } from './week-09'      // Health & Body            (2/23–3/1)
import { WEEK_10 } from './week-10'      // Daily Schedules          (3/2–3/8)
import { WEEK_11 } from './week-11'      // Friendship               (3/9–3/15)
import { WEEK_12 } from './week-12'      // Family                   (3/16–3/22)
import { WEEK_13 } from './week-13'      // Colleagues & Teamwork    (3/23–3/29)
import { WEEK_14 } from './week-14'      // Social Situations        (3/30–4/5)
import { WEEK_15 } from './week-15'      // Personality & Character  (4/6–4/12)
import { WEEK_16 } from './week-16'      // Communication Styles     (4/13–4/19)
import { WEEK_17 } from './week-17'      // Helping Others           (4/20–4/26)
import { WEEK_18 } from './week-18'      // Conflict & Resolution    (4/27–5/3)
import { WEEK_19 } from './week-19'      // Your Job & Role          (5/4–5/10)
import { WEEK_20 } from './week-20'      // Meetings & Discussions   (5/11–5/17)
import { WEEK_21 } from './week-21'      // Deadlines & Pressure     (5/18–5/24)
import { WEEK_22 } from './week-22'      // Problem Solving          (5/25–5/31)
import { WEEK_23 } from './week-23'      // Career Goals             (6/1–6/7)
import { WEEK_24 } from './week-24'      // Learning & Growth        (6/8–6/14)
import { WEEK_25 } from './week-25'      // Success & Failure        (6/15–6/21)
import { WEEK_26 } from './week-26'      // Work-Life Balance        (6/22–6/28)
import { WEEK_27 } from './week-27'      // Travel                   (6/29–7/5)
import { WEEK_28 } from './week-28'      // Photography & Visual Art (7/6–7/12)
import { WEEK_29 } from './week-29'      // Music & Podcasts         (7/13–7/19)
import { WEEK_30 } from './week-30'      // Reading & Writing        (7/20–7/26)
import { WEEK_31 } from './week-31'      // Pets & Animals           (7/27–8/2)
import { WEEK_32 } from './week-32'      // Hobbies & Collections    (8/3–8/9)
import { WEEK_33 } from './week-33'      // Nature & Outdoors        (8/10–8/16)
import { WEEK_34 } from './week-34'      // Sports & Fitness         (8/17–8/23)
import { WEEK_35 } from './week-35'      // Technology & Everyday    (8/24–8/30)
import { WEEK_36 } from './week-36'      // Artificial Intelligence  (8/31–9/6)
import { WEEK_37 } from './week-37'      // Health & Mental Wellbeing(9/7–9/13)
import { WEEK_38 } from './week-38'      // Environment & Sustainability(9/14–9/20)
import { WEEK_39 } from './week-39'      // Money & Financial Goals  (9/21–9/27)
import { WEEK_40 } from './week-40'      // Change & Transitions     (9/28–10/4)
import { WEEK_41 } from './week-41'      // Values & Beliefs         (10/5–10/11)
import { WEEK_42 } from './week-42'      // The Future               (10/12–10/18)
import { WEEK_43 } from './week-43'      // Looking Back & Moving Fwd(10/19–10/25)
import { WEEK_44 } from './week-44'      // Creativity & Self-Expression (10/26–11/1)
import { WEEK_45 } from './week-45'      // Leadership & Influence       (11/2–11/8)
import { WEEK_46 } from './week-46'      // Community & Giving Back      (11/9–11/15)
import { WEEK_47 } from './week-47'      // Cross-Cultural Understanding (11/16–11/22)
import { WEEK_48 } from './week-48'      // Language & Identity          (11/23–11/29)
import { WEEK_49 } from './week-49'      // Rest & Renewal               (11/30–12/6)
import { WEEK_50 } from './week-50'      // Gratitude & Appreciation     (12/7–12/13)
import { WEEK_51 } from './week-51'      // Goals & Intentions           (12/14–12/20)
import { WEEK_52 } from './week-52'      // Year in Review               (12/21–12/27)
import { WEEK_53 } from './week-53'      // New Beginnings               (12/28–12/31)

export const ALL_EPISODES: Episode[] = [
  ...WEEK_01, ...WEEK_02, ...WEEK_03, ...WEEK_04, ...WEEK_05, ...WEEK_06, ...WEEK_07,
  ...WEEK_08, ...WEEK_09, ...WEEK_10, ...WEEK_11, ...WEEK_12, ...WEEK_13, ...WEEK_14,
  ...WEEK_15, ...WEEK_16, ...WEEK_17, ...WEEK_18, ...WEEK_19, ...WEEK_20, ...WEEK_21,
  ...WEEK_22, ...WEEK_23, ...WEEK_24, ...WEEK_25, ...WEEK_26, ...WEEK_27, ...WEEK_28,
  ...WEEK_29, ...WEEK_30, ...WEEK_31, ...WEEK_32, ...WEEK_33, ...WEEK_34, ...WEEK_35,
  ...WEEK_36, ...WEEK_37, ...WEEK_38, ...WEEK_39, ...WEEK_40, ...WEEK_41, ...WEEK_42,
  ...WEEK_43, ...WEEK_44, ...WEEK_45, ...WEEK_46, ...WEEK_47, ...WEEK_48, ...WEEK_49,
  ...WEEK_50, ...WEEK_51, ...WEEK_52, ...WEEK_53,
]

// ─── Public API ───────────────────────────────────────────────────────────

/** Get the episode for a specific date (YYYY-MM-DD) */
export function getEpisodeByDate(date: string): Episode | undefined {
  return ALL_EPISODES.find(ep => ep.date === date)
}

/** Get all episodes for a week, sorted by dayOfWeek */
export function getWeekEpisodes(weekNumber: number): Episode[] {
  return ALL_EPISODES
    .filter(ep => ep.weekNumber === weekNumber)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
}

/** Get the week number (1–53) for a 2026 date string */
export function getWeekNumber(date: string): number {
  const d = getDayOfYear(date)
  if (d <= 4) return 1                         // Jan 1–4 → W1
  return Math.floor((d - 5) / 7) + 2           // Jan 5+ → W2–W53
}

/** Get the day's position within its week (1 = first day of that week) */
export function getDayPosition(date: string): number {
  const d = getDayOfYear(date)
  if (d <= 4) return d                          // W1: Jan1=1 … Jan4=4
  return ((d - 5) % 7) + 1                     // W2+: 1–7
}

/** Get the start and end date strings (YYYY-MM-DD) for a week number */
export function getDateRange(weekNumber: number): { start: string; end: string } {
  if (weekNumber === 1) return { start: '2026-01-01', end: '2026-01-04' }
  if (weekNumber === 53) return { start: '2026-12-28', end: '2026-12-31' }
  const startDay = 5 + (weekNumber - 2) * 7
  return {
    start: dayOfYearToDate(startDay),
    end:   dayOfYearToDate(startDay + 6),
  }
}

/** Returns how many days are in a given week (4 for W1/W53, 7 for all others) */
export function getWeekLength(weekNumber: number): number {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

// ─── Internal helpers ─────────────────────────────────────────────────────

/** Day of year for a 2026 date string (Jan 1 = 1, Dec 31 = 365) */
function getDayOfYear(dateStr: string): number {
  const [, month, day] = dateStr.split('-').map(Number)
  const cumDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  return cumDays[month - 1] + day
}

/** Convert day-of-year back to a YYYY-MM-DD string (2026 only) */
function dayOfYearToDate(doy: number): string {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let month = 0
  let remaining = doy
  while (remaining > monthDays[month]) {
    remaining -= monthDays[month]
    month++
  }
  return `2026-${String(month + 1).padStart(2, '0')}-${String(remaining).padStart(2, '0')}`
}

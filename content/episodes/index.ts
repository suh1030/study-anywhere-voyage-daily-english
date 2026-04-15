import { Episode } from '../types'

// ─── Week imports ─────────────────────────────────────────────────────────
import { WEEK_01 } from './week-01'
import { WEEK_02 } from './week-02'
import { WEEK_03 } from './week-03'
import { WEEK_04 } from './week-04'
import { WEEK_05 } from './week-05'
import { WEEK_06 } from './week-06'
import { WEEK_07 } from './week-07'
import { WEEK_08 } from './week-08'
import { WEEK_09 } from './week-09'
import { WEEK_10 } from './week-10'
import { WEEK_11 } from './week-11'
import { WEEK_12 } from './week-12'
import { WEEK_13 } from './week-13'
import { WEEK_14 } from './week-14'
import { WEEK_15 } from './week-15'
import { WEEK_16 } from './week-16'
import { WEEK_17 } from './week-17'
import { WEEK_18 } from './week-18'
import { WEEK_19 } from './week-19'
import { WEEK_20 } from './week-20'
import { WEEK_21 } from './week-21'
import { WEEK_22 } from './week-22'
import { WEEK_23 } from './week-23'
import { WEEK_24 } from './week-24'
import { WEEK_25 } from './week-25'
import { WEEK_26 } from './week-26'
import { WEEK_27 } from './week-27'
import { WEEK_28 } from './week-28'
import { WEEK_29 } from './week-29'
import { WEEK_30 } from './week-30'
import { WEEK_31 } from './week-31'
import { WEEK_32 } from './week-32'
import { WEEK_33 } from './week-33'
import { WEEK_34 } from './week-34'
import { WEEK_35 } from './week-35'
import { WEEK_36 } from './week-36'
import { WEEK_37 } from './week-37'
import { WEEK_38 } from './week-38'
import { WEEK_39 } from './week-39'
import { WEEK_40 } from './week-40'
import { WEEK_41 } from './week-41'
import { WEEK_42 } from './week-42'
import { WEEK_43 } from './week-43'
import { WEEK_44 } from './week-44'
import { WEEK_45 } from './week-45'
import { WEEK_46 } from './week-46'
import { WEEK_47 } from './week-47'
import { WEEK_48 } from './week-48'
import { WEEK_49 } from './week-49'
import { WEEK_50 } from './week-50'
import { WEEK_51 } from './week-51'
import { WEEK_52 } from './week-52'
import { WEEK_53 } from './week-53'

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

/** Get the episode for a specific rolling-curriculum week/day pair. */
export function getEpisode(weekNumber: number, dayOfWeek: number): Episode | undefined {
  return ALL_EPISODES.find((ep) => ep.weekNumber === weekNumber && ep.dayOfWeek === dayOfWeek)
}

/** Get all episodes for a week, sorted by dayOfWeek */
export function getWeekEpisodes(weekNumber: number): Episode[] {
  return ALL_EPISODES
    .filter(ep => ep.weekNumber === weekNumber)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
}

/** Returns how many days are in a given week (4 for W1/W53, 7 for all others) */
export function getWeekLength(weekNumber: number): number {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

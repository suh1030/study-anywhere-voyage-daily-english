export interface EpisodeVocabItem {
  word: string
  def?: string
  definition?: string
  meaning?: string
}

export interface EpisodeLine {
  speaker: 'a' | 'b'
  speakerName?: string
  en?: string
  zh?: string
  vocab?: EpisodeVocabItem[]
  english?: string
  chinese?: string
  vocabulary?: EpisodeVocabItem[]
}

export interface EpisodePart {
  title: string
  lines: EpisodeLine[]
  partNumber?: number
}

export interface EpisodeKeyPhrase {
  en?: string
  zh?: string
  example?: string
  phrase?: string
  meaning?: string
  def?: string
}

export interface Episode {
  weekNumber: number
  dayOfWeek: number
  date: string
  theme: string
  title: string
  phase: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
  parts: EpisodePart[]
  keyPhrases: EpisodeKeyPhrase[]
}

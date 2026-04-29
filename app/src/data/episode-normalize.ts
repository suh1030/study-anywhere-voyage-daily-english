type LegacyVocab = {
  word?: string
  def?: string
  definition?: string
  meaning?: string
}

type LegacyLine = {
  speaker?: 'a' | 'b'
  speakerName?: string
  en?: string
  zh?: string
  vocab?: LegacyVocab[]
  english?: string
  chinese?: string
  vocabulary?: LegacyVocab[]
}

type LegacyPart = {
  title?: string
  lines?: LegacyLine[]
}

type LegacyKeyPhrase = {
  en?: string
  zh?: string
  example?: string
  phrase?: string
  meaning?: string
  def?: string
}

export type NormalizedEpisodeLine = {
  speaker: 'a' | 'b'
  speakerName: string
  en: string
  zh: string
}

export type NormalizedEpisodePart = {
  title: string
  lines: NormalizedEpisodeLine[]
}

export type NormalizedKeyPhrase = {
  en: string
  zh: string
  example: string
}

export function normalizeEpisodeParts(parts: LegacyPart[] = []): NormalizedEpisodePart[] {
  return parts.map((part) => ({
    title: part.title ?? '',
    lines: (part.lines ?? []).map((line) => ({
      speaker: line.speaker === 'b' ? 'b' : 'a',
      speakerName: line.speakerName ?? (line.speaker === 'b' ? 'Jamie' : 'Mira'),
      en: line.en ?? line.english ?? '',
      zh: line.zh ?? line.chinese ?? '',
    })),
  }))
}

export function normalizeKeyPhrases(keyPhrases: LegacyKeyPhrase[] = []): NormalizedKeyPhrase[] {
  return keyPhrases.map((item) => ({
    en: item.en ?? item.phrase ?? '',
    zh: item.zh ?? item.def ?? item.meaning ?? '',
    example: item.example ?? '',
  }))
}

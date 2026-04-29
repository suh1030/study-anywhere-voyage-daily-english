import type { FlashcardRow, QuestionRow } from './content-api'

export interface ReviewPrompt {
  id: string
  question: string
  hintZh?: string
  structureHint?: string
}

export interface ReviewPractice {
  recallPrompts: ReviewPrompt[]
  challengeCards: FlashcardRow[]
}

function pickSpread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items
  if (count <= 1) return items.slice(0, 1)

  const picked: T[] = []
  const used = new Set<number>()

  for (let step = 0; step < count; step += 1) {
    const targetIndex = Math.round((step * (items.length - 1)) / (count - 1))
    let index = targetIndex

    while (used.has(index) && index < items.length - 1) {
      index += 1
    }

    while (used.has(index) && index > 0) {
      index -= 1
    }

    if (used.has(index)) continue

    used.add(index)
    picked.push(items[index])
  }

  return picked
}

function sortQuestions(questions: QuestionRow[]): QuestionRow[] {
  return [...questions].sort((left, right) => left.day_of_week - right.day_of_week)
}

function pickChallengeCards(cards: FlashcardRow[], masteredCardIds: string[]): FlashcardRow[] {
  const active = cards.filter((card) => !masteredCardIds.includes(card.id))
  const pool = active.length >= 3 ? active : [...active, ...cards.filter((card) => masteredCardIds.includes(card.id))]

  return pickSpread(pool, Math.min(3, pool.length))
}

export function buildReviewPractice(
  cards: FlashcardRow[],
  questions: QuestionRow[],
  masteredCardIds: string[],
): ReviewPractice {
  const sortedQuestions = sortQuestions(questions)
  const recallPrompts = pickSpread(sortedQuestions, Math.min(3, sortedQuestions.length)).map((question) => ({
    id: question.id,
    question: question.question,
    hintZh: question.hint_zh,
    structureHint: question.structure_hint,
  }))

  return {
    recallPrompts,
    challengeCards: pickChallengeCards(cards, masteredCardIds),
  }
}

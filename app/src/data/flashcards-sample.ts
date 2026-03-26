// Sample flashcards for W1-W2 (will be replaced by DB content)
export interface Flashcard {
  id: string
  source: 'listen' | 'speak'
  weekNumber: number
  english: string
  chinese: string
  exampleSentence?: string
}

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  // W1 — Morning Routines
  { id: 'fc-w1-01', source: 'speak', weekNumber: 1, english: 'morning routine', chinese: '晨間日常', exampleSentence: 'My morning routine starts with a cup of coffee.' },
  { id: 'fc-w1-02', source: 'speak', weekNumber: 1, english: 'wake up', chinese: '醒來', exampleSentence: 'I usually wake up around 7 a.m.' },
  { id: 'fc-w1-03', source: 'speak', weekNumber: 1, english: 'get dressed', chinese: '穿衣服', exampleSentence: 'I get dressed before breakfast.' },
  { id: 'fc-w1-04', source: 'listen', weekNumber: 1, english: 'hit the snooze button', chinese: '按下貪睡鍵', exampleSentence: 'I always hit the snooze button at least twice.' },
  { id: 'fc-w1-05', source: 'speak', weekNumber: 1, english: 'brush my teeth', chinese: '刷牙', exampleSentence: 'I brush my teeth right after waking up.' },
  { id: 'fc-w1-06', source: 'listen', weekNumber: 1, english: 'grab a quick bite', chinese: '隨便吃點東西', exampleSentence: "I usually grab a quick bite before heading out." },
  { id: 'fc-w1-07', source: 'speak', weekNumber: 1, english: 'ideal', chinese: '理想的', exampleSentence: 'My ideal morning includes exercise and reading.' },
  { id: 'fc-w1-08', source: 'listen', weekNumber: 1, english: 'energy level', chinese: '精力水平', exampleSentence: 'My energy level is highest in the morning.' },
  // W2 — Commuting
  { id: 'fc-w2-01', source: 'speak', weekNumber: 2, english: 'commute', chinese: '通勤', exampleSentence: 'My commute takes about 30 minutes.' },
  { id: 'fc-w2-02', source: 'speak', weekNumber: 2, english: 'public transportation', chinese: '大眾運輸', exampleSentence: 'I take public transportation to work every day.' },
  { id: 'fc-w2-03', source: 'listen', weekNumber: 2, english: 'rush hour', chinese: '尖峰時段', exampleSentence: "Rush hour traffic is terrible in this city." },
  { id: 'fc-w2-04', source: 'speak', weekNumber: 2, english: 'stuck in traffic', chinese: '塞在車陣中', exampleSentence: 'I was stuck in traffic for over an hour yesterday.' },
  { id: 'fc-w2-05', source: 'listen', weekNumber: 2, english: 'transfer', chinese: '轉乘', exampleSentence: 'I need to transfer at the next station.' },
  { id: 'fc-w2-06', source: 'speak', weekNumber: 2, english: 'memorable', chinese: '難忘的', exampleSentence: 'That was a really memorable commute experience.' },
]

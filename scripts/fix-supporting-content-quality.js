const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

const QUESTION_REPLACEMENTS = [
  {
    old: '選一個最有感的 lesson 就好，不用三個都講。',
    new: '選一個最有感的教訓或收穫就好，不用三個都講。',
  },
  {
    old: 'What choice you make this year could still matter ten years from now?',
    new: 'What choice this year might still matter ten years from now?',
  },
  {
    old: 'What part of your past are you ready to stop carrying in the same way?',
    new: 'What part of your past are you ready to carry differently now?',
  },
  {
    old: 'What would moving forward with intention mean for your next season?',
    new: 'What would it look like for you to move into your next season with intention?',
  },
]

const FLASHCARD_UPDATES = {
  'w5-listen-02': {
    chinese: '有生命力；做起來有感覺、有意義',
  },
  'w11-listen-02': {
    chinese: '主動聯絡；先開口找對方',
  },
  'w11-listen-03': {
    chinese: '遠距友誼；分隔兩地卻持續維繫的友誼',
  },
  'w11-speak-02': {
    chinese: '保持聯絡；持續維持往來',
  },
  'w12-listen-01': {
    chinese: '長大；從小到大的成長過程',
  },
  'w12-listen-03': {
    chinese: '手足競爭；兄弟姊妹之間的競爭與較勁',
  },
  'w13-listen-06': {
    chinese: '會議議程；會議要談的重點與順序',
  },
  'w14-listen-01': {
    chinese: '社交能量；參與社交後剩餘的精力',
  },
  'w14-speak-01': {
    chinese: '設定界限；清楚說明自己能接受的範圍',
  },
  'w14-speak-02': {
    chinese: '社交電量；社交後剩下的心理能量',
  },
  'w15-listen-03': {
    chinese: '社交電池；和人互動後會消耗的心理能量',
  },
  'w16-listen-03': {
    chinese: '主動傾聽；專心聽並讓對方感到被理解',
  },
  'w20-listen-01': {
    chinese: '會議議程；會議討論的主題與流程',
  },
  'w20-listen-06': {
    chinese: '線上會議；透過網路進行的會議',
  },
  'w23-listen-02': {
    chinese: '定義成功；想清楚什麼對你才算成功',
  },
  'w23-speak-02': {
    chinese: '職涯方向；工作上想前進的路線',
  },
  'w23-speak-03': {
    chinese: '價值觀；判斷什麼重要的核心標準',
  },
  'w25-listen-03': {
    chinese: '羞恥螺旋；越羞愧越自責的惡性循環',
  },
  'w25-listen-06': {
    chinese: '變通方案；繞過問題的替代做法',
  },
  'w25-speak-01': {
    chinese: '意志力；控制自己並持續堅持的能力',
  },
  'w25-speak-02': {
    chinese: '略過；被跳過或沒有被選上',
    exampleSentence: 'The company chose to pass over her for the promotion, even though her results were the strongest on the team.',
  },
  'w25-speak-03': {
    chinese: '有意識地；帶著清楚覺察去做',
  },
  'w29-speak-02': {
    chinese: '填補沉默；為了避免尷尬而開口',
  },
  'w29-speak-04': {
    chinese: '承載歷史；帶著過去的記憶與意義',
  },
  'w30-listen-02': {
    chinese: '安定下來的；心和情緒慢慢穩住的',
  },
  'w30-listen-03': {
    chinese: '設計問題；做法或環境設計不良造成的問題',
  },
  'w31-listen-03': {
    chinese: '具體責任；今天真的要做的責任',
    exampleSentence: 'Caring for the dog became one concrete responsibility he could not postpone, even on the busiest days.',
  },
  'w32-listen-04': {
    chinese: '初學者心態；願意先學、不怕不熟',
  },
  'w32-speak-01': {
    chinese: '熱情計畫；因真心喜歡而持續投入的個人計畫',
  },
  'w34-listen-02': {
    chinese: '內在動機；自己真正在乎的理由',
  },
  'w34-listen-05': {
    chinese: '比較陷阱；一直和別人比較而越來越焦慮的狀態',
  },
  'w35-listen-01': {
    chinese: '裝置；日常使用的電子設備',
  },
  'w35-listen-02': {
    chinese: '幻震；以為手機在震動的錯覺',
  },
  'w35-listen-03': {
    chinese: '孤立的；與其他事物分開或脫節的',
  },
  'w35-listen-06': {
    chinese: '承諾；持續投入、不輕易放棄',
  },
  'w35-speak-03': {
    chinese: '通知；提醒你有新訊息的提示',
  },
  'w36-listen-04': {
    chinese: '貌似合理的答案；聽起來對但未必正確',
  },
  'w36-listen-05': {
    chinese: '創作摩擦；卡住卻能逼出深度的阻力',
  },
  'w36-listen-06': {
    chinese: '訓練資料；用來訓練人工智慧系統的資料',
  },
  'w36-speak-03': {
    chinese: '自信錯誤；錯了卻說得很肯定的答案',
  },
  'w36-speak-04': {
    chinese: '初稿工具；適合快速產出第一版內容的工具',
  },
  'w36-speak-05': {
    chinese: '信心落差；語氣很肯定但可靠度不高',
  },
  'w39-listen-02': {
    chinese: '匱乏心態；總覺得不夠、怕失去的心態',
  },
  'w42-listen-05': {
    chinese: '歸屬感；感到自己被接納、屬於其中',
  },
  'w42-speak-04': {
    chinese: '學習曲線；從入門到熟練的進步過程',
  },
  'w42-speak-05': {
    chinese: '技能缺口；現有能力和需求之間的落差',
  },
  'w43-listen-04': {
    chinese: '關鍵時刻；長期影響一個人的瞬間',
  },
  'w43-listen-05': {
    chinese: '複雜感受；多種情緒同時存在的感覺',
  },
  'w43-speak-01': {
    chinese: '前行意圖；清楚知道自己要帶著什麼往前',
  },
  'w44-speak-03': {
    chinese: '日常藝術感；生活裡自然出現的藝術感受',
  },
  'w46-listen-05': {
    chinese: '較輕的負擔；讓人沒那麼辛苦的狀態',
  },
  'w46-speak-02': {
    chinese: '情感歸屬；感到被接住、被接納',
  },
  'w49-listen-06': {
    chinese: '環境節奏；周圍自然形成的生活步調',
  },
  'w49-listen-02': {
    chinese: '空閒時間；能放鬆、不必做正事的時段',
  },
  'w49-listen-04': {
    chinese: '創意瓶頸；想不出新點子或做不出作品的卡住期',
  },
  'w50-speak-03': {
    chinese: '可被接收的感謝；對方真的聽得進去的表達',
  },
  'w51-listen-01': {
    chinese: '體面的答案；看起來正確卻未必真屬於自己的答案',
  },
  'w51-listen-03': {
    chinese: '可落地的結構；讓好想法能在生活中持續的安排',
  },
  'w52-listen-04': {
    chinese: '緩慢適應式成長；慢慢累積、不太顯眼的成長',
  },
  'w52-listen-06': {
    chinese: '值得帶往未來的教訓',
  },
  'w52-speak-05': {
    chinese: '微小內在進步；外表不明顯但內部真的在前進',
  },
  'w53-speak-05': {
    chinese: '務實節奏；在普通日子裡也能持續的步調',
  },
  'w24-listen-04': {
    exampleSentence: 'He learned to practice consistently, even when the improvement was too small to notice right away.',
  },
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceFieldInCard(source, id, field, value) {
  const pattern = new RegExp(`(id: '${escapeRegex(id)}'[^}]*?${field}: ')([^']*)(')`, 's')
  return source.replace(pattern, `$1${value}$3`)
}

function fixQuestions() {
  const questionsDir = path.join(ROOT, 'content', 'questions')
  const files = fs.readdirSync(questionsDir).filter((file) => file.endsWith('.ts')).sort()
  let replacements = 0
  let filesChanged = 0

  for (const file of files) {
    const filePath = path.join(questionsDir, file)
    let source = fs.readFileSync(filePath, 'utf8')
    const original = source

    for (const { old, new: next } of QUESTION_REPLACEMENTS) {
      if (source.includes(old)) {
        source = source.replace(old, next)
        replacements += 1
      }
    }

    if (source !== original) {
      fs.writeFileSync(filePath, source)
      filesChanged += 1
    }
  }

  return { filesChanged, replacements }
}

function fixFlashcards() {
  const flashcardsDir = path.join(ROOT, 'content', 'flashcards')
  const files = fs.readdirSync(flashcardsDir).filter((file) => file.endsWith('.ts')).sort()
  let fieldUpdates = 0
  let filesChanged = 0

  for (const file of files) {
    const filePath = path.join(flashcardsDir, file)
    let source = fs.readFileSync(filePath, 'utf8')
    const original = source

    for (const [id, update] of Object.entries(FLASHCARD_UPDATES)) {
      if (!source.includes(`id: '${id}'`)) continue
      if (update.chinese) {
        const next = replaceFieldInCard(source, id, 'chinese', update.chinese)
        if (next !== source) {
          source = next
          fieldUpdates += 1
        }
      }
      if (update.exampleSentence) {
        const next = replaceFieldInCard(source, id, 'exampleSentence', update.exampleSentence)
        if (next !== source) {
          source = next
          fieldUpdates += 1
        }
      }
    }

    if (source !== original) {
      fs.writeFileSync(filePath, source)
      filesChanged += 1
    }
  }

  return { filesChanged, fieldUpdates }
}

function main() {
  const questions = fixQuestions()
  const flashcards = fixFlashcards()
  console.log(JSON.stringify({ questions, flashcards }, null, 2))
}

main()

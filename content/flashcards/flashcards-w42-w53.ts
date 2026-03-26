export interface Flashcard {
  id: string
  source: 'listen' | 'speak'
  weekNumber: number
  english: string
  chinese: string
  exampleSentence: string
}

export const FLASHCARDS_W42_W53: Flashcard[] = [
  // ========== W42 — The Future ==========
  // Listen source
  { id: 'w42-listen-01', source: 'listen', weekNumber: 42, english: 'projection', chinese: '預測、推算', exampleSentence: 'According to current projections, the global population will reach ten billion by 2060.' },
  { id: 'w42-listen-02', source: 'listen', weekNumber: 42, english: 'scenario', chinese: '情境、假設情況', exampleSentence: 'In the best-case scenario, renewable energy will replace fossil fuels within thirty years.' },
  { id: 'w42-listen-03', source: 'listen', weekNumber: 42, english: 'accelerate', chinese: '加速', exampleSentence: 'Climate change is accelerating at a rate faster than scientists predicted.' },
  { id: 'w42-listen-04', source: 'listen', weekNumber: 42, english: 'disruption', chinese: '顛覆、破壞', exampleSentence: 'Artificial intelligence is causing major disruption across many industries.' },
  { id: 'w42-listen-05', source: 'listen', weekNumber: 42, english: 'uncertainty', chinese: '不確定性', exampleSentence: 'People deal with uncertainty in different ways — some plan, others adapt.' },
  { id: 'w42-listen-06', source: 'listen', weekNumber: 42, english: 'legacy', chinese: '遺產、留下的影響', exampleSentence: 'She wants her legacy to be the schools she helped build.' },
  // Speak source
  { id: 'w42-speak-01', source: 'speak', weekNumber: 42, english: 'optimistic', chinese: '樂觀的', exampleSentence: 'Despite everything, I remain optimistic about the future.' },
  { id: 'w42-speak-02', source: 'speak', weekNumber: 42, english: 'emerging technology', chinese: '新興科技', exampleSentence: 'Emerging technologies like gene editing raise important ethical questions.' },
  { id: 'w42-speak-03', source: 'speak', weekNumber: 42, english: 'prepare for', chinese: '為……做好準備', exampleSentence: 'It is wise to prepare for multiple outcomes, not just the ideal one.' },
  { id: 'w42-speak-04', source: 'speak', weekNumber: 42, english: 'anticipate', chinese: '預期、期待', exampleSentence: 'No one anticipated how quickly remote work would become the norm.' },
  { id: 'w42-speak-05', source: 'speak', weekNumber: 42, english: 'generation', chinese: '世代', exampleSentence: 'Each generation faces its own unique challenges and opportunities.' },

  // ========== W43 — Looking Back & Moving Forward ==========
  // Listen source
  { id: 'w43-listen-01', source: 'listen', weekNumber: 43, english: 'in retrospect', chinese: '回顧來看、事後看來', exampleSentence: 'In retrospect, quitting that job was the best decision I ever made.' },
  { id: 'w43-listen-02', source: 'listen', weekNumber: 43, english: 'turning point', chinese: '轉捩點', exampleSentence: 'Losing my job was a painful but necessary turning point in my life.' },
  { id: 'w43-listen-03', source: 'listen', weekNumber: 43, english: 'come a long way', chinese: '走了很長的路、進步很多', exampleSentence: 'You have come a long way since we first met.' },
  { id: 'w43-listen-04', source: 'listen', weekNumber: 43, english: 'let go of', chinese: '放下、釋放', exampleSentence: 'It took me years to let go of the anger I felt.' },
  { id: 'w43-listen-05', source: 'listen', weekNumber: 43, english: 'move on', chinese: '繼續前進、走出過去', exampleSentence: 'After the breakup, it took her a long time to move on.' },
  { id: 'w43-listen-06', source: 'listen', weekNumber: 43, english: 'full circle', chinese: '兜了一圈回到原點', exampleSentence: 'It felt like we had come full circle — ending up where we started.' },
  // Speak source
  { id: 'w43-speak-01', source: 'speak', weekNumber: 43, english: 'reflect on', chinese: '反思、回顧', exampleSentence: 'I like to reflect on my past mistakes so I do not repeat them.' },
  { id: 'w43-speak-02', source: 'speak', weekNumber: 43, english: 'regret', chinese: '遺憾、後悔', exampleSentence: 'My only regret is that I did not travel more when I was young.' },
  { id: 'w43-speak-03', source: 'speak', weekNumber: 43, english: 'growth', chinese: '成長', exampleSentence: 'Personal growth often comes from the most uncomfortable experiences.' },
  { id: 'w43-speak-04', source: 'speak', weekNumber: 43, english: 'perspective', chinese: '觀點、視角', exampleSentence: 'Getting older gives you a different perspective on what truly matters.' },
  { id: 'w43-speak-05', source: 'speak', weekNumber: 43, english: 'milestone', chinese: '里程碑', exampleSentence: 'Graduating from university was a major milestone in my life.' },

  // ========== W44 — Creativity & Self-Expression ==========
  // Listen source
  { id: 'w44-listen-01', source: 'listen', weekNumber: 44, english: 'creative block', chinese: '創意瓶頸', exampleSentence: 'Every writer experiences a creative block at some point.' },
  { id: 'w44-listen-02', source: 'listen', weekNumber: 44, english: 'outlet', chinese: '（情緒的）出口', exampleSentence: 'Painting became her main outlet for stress and emotion.' },
  { id: 'w44-listen-03', source: 'listen', weekNumber: 44, english: 'vulnerability', chinese: '脆弱、開放自我', exampleSentence: 'True creativity requires vulnerability — sharing what is raw and unfinished.' },
  { id: 'w44-listen-04', source: 'listen', weekNumber: 44, english: 'iterate', chinese: '反覆修改、迭代', exampleSentence: 'Great designers iterate constantly, improving each version.' },
  { id: 'w44-listen-05', source: 'listen', weekNumber: 44, english: 'draw inspiration from', chinese: '從……中獲得靈感', exampleSentence: 'She draws inspiration from everyday conversations and city life.' },
  { id: 'w44-listen-06', source: 'listen', weekNumber: 44, english: 'authentic', chinese: '真實的、有自我風格的', exampleSentence: 'His music feels authentic because it reflects his real experiences.' },
  // Speak source
  { id: 'w44-speak-01', source: 'speak', weekNumber: 44, english: 'self-expression', chinese: '自我表達', exampleSentence: 'Fashion is one of the most visible forms of self-expression.' },
  { id: 'w44-speak-02', source: 'speak', weekNumber: 44, english: 'imagination', chinese: '想像力', exampleSentence: 'Children have a remarkable imagination that adults often lose.' },
  { id: 'w44-speak-03', source: 'speak', weekNumber: 44, english: 'craft', chinese: '技藝、創作', exampleSentence: 'She spent years honing her craft as a ceramicist.' },
  { id: 'w44-speak-04', source: 'speak', weekNumber: 44, english: 'original', chinese: '有原創性的', exampleSentence: 'It is hard to come up with something truly original in this age of information.' },
  { id: 'w44-speak-05', source: 'speak', weekNumber: 44, english: 'passion project', chinese: '熱情所在的個人計畫', exampleSentence: 'He started his podcast as a passion project and now has thousands of listeners.' },

  // ========== W45 — Leadership & Influence ==========
  // Listen source
  { id: 'w45-listen-01', source: 'listen', weekNumber: 45, english: 'vision', chinese: '願景', exampleSentence: 'A great leader communicates a clear vision that others want to follow.' },
  { id: 'w45-listen-02', source: 'listen', weekNumber: 45, english: 'accountability', chinese: '責任感、問責', exampleSentence: 'Good leaders hold themselves to the same level of accountability they expect from others.' },
  { id: 'w45-listen-03', source: 'listen', weekNumber: 45, english: 'empower', chinese: '賦予能力、授權', exampleSentence: 'The best managers empower their team to make decisions.' },
  { id: 'w45-listen-04', source: 'listen', weekNumber: 45, english: 'earn trust', chinese: '贏得信任', exampleSentence: 'Trust is earned over time through consistent words and actions.' },
  { id: 'w45-listen-05', source: 'listen', weekNumber: 45, english: 'step up', chinese: '挺身而出、承擔責任', exampleSentence: 'When the team was struggling, she stepped up and took charge.' },
  { id: 'w45-listen-06', source: 'listen', weekNumber: 45, english: 'lead by example', chinese: '以身作則', exampleSentence: 'The best way to lead is to lead by example.' },
  // Speak source
  { id: 'w45-speak-01', source: 'speak', weekNumber: 45, english: 'authority', chinese: '權威、職權', exampleSentence: 'She spoke with quiet authority that made everyone listen.' },
  { id: 'w45-speak-02', source: 'speak', weekNumber: 45, english: 'influence', chinese: '影響力', exampleSentence: 'You do not need a title to have influence over the people around you.' },
  { id: 'w45-speak-03', source: 'speak', weekNumber: 45, english: 'inspire', chinese: '激勵、啟發', exampleSentence: 'A single teacher can inspire an entire generation of students.' },
  { id: 'w45-speak-04', source: 'speak', weekNumber: 45, english: 'decisive', chinese: '果斷的', exampleSentence: 'In a crisis, it is important to be decisive even with incomplete information.' },
  { id: 'w45-speak-05', source: 'speak', weekNumber: 45, english: 'delegate', chinese: '授權、委派', exampleSentence: 'Learning to delegate is one of the hardest things for new managers.' },

  // ========== W46 — Community & Giving Back ==========
  // Listen source
  { id: 'w46-listen-01', source: 'listen', weekNumber: 46, english: 'belonging', chinese: '歸屬感', exampleSentence: 'A strong community creates a sense of belonging for its members.' },
  { id: 'w46-listen-02', source: 'listen', weekNumber: 46, english: 'solidarity', chinese: '團結、連帶感', exampleSentence: 'After the disaster, the community showed remarkable solidarity.' },
  { id: 'w46-listen-03', source: 'listen', weekNumber: 46, english: 'ripple effect', chinese: '漣漪效應', exampleSentence: 'One small act of kindness can have a ripple effect on an entire neighborhood.' },
  { id: 'w46-listen-04', source: 'listen', weekNumber: 46, english: 'give back', chinese: '回饋', exampleSentence: 'He gives back to the community by mentoring young engineers.' },
  { id: 'w46-listen-05', source: 'listen', weekNumber: 46, english: 'mutual support', chinese: '互助', exampleSentence: 'The mutual support within the group helped members through difficult times.' },
  { id: 'w46-listen-06', source: 'listen', weekNumber: 46, english: 'collective', chinese: '集體的', exampleSentence: 'Change at the community level requires collective effort.' },
  // Speak source
  { id: 'w46-speak-01', source: 'speak', weekNumber: 46, english: 'volunteer', chinese: '志願服務', exampleSentence: 'I volunteer at the food bank every Saturday morning.' },
  { id: 'w46-speak-02', source: 'speak', weekNumber: 46, english: 'contribute', chinese: '貢獻、付出', exampleSentence: 'Everyone can contribute to their community, no matter how small the action.' },
  { id: 'w46-speak-03', source: 'speak', weekNumber: 46, english: 'nonprofit', chinese: '非營利組織', exampleSentence: 'She works for a nonprofit that provides free tutoring to low-income students.' },
  { id: 'w46-speak-04', source: 'speak', weekNumber: 46, english: 'make a difference', chinese: '產生影響、改變現狀', exampleSentence: 'You do not need to be famous to make a difference in someone\'s life.' },
  { id: 'w46-speak-05', source: 'speak', weekNumber: 46, english: 'kindness', chinese: '善意', exampleSentence: 'Small acts of kindness add up and build a more caring community.' },

  // ========== W47 — Cross-Cultural Understanding ==========
  // Listen source
  { id: 'w47-listen-01', source: 'listen', weekNumber: 47, english: 'stereotype', chinese: '刻板印象', exampleSentence: 'Travel is one of the best ways to break down cultural stereotypes.' },
  { id: 'w47-listen-02', source: 'listen', weekNumber: 47, english: 'ethnocentrism', chinese: '民族中心主義', exampleSentence: 'Ethnocentrism leads people to judge other cultures by their own standards.' },
  { id: 'w47-listen-03', source: 'listen', weekNumber: 47, english: 'norm', chinese: '規範、常態', exampleSentence: 'What is considered polite varies widely depending on cultural norms.' },
  { id: 'w47-listen-04', source: 'listen', weekNumber: 47, english: 'nuance', chinese: '細微差異', exampleSentence: 'Understanding another culture requires an appreciation for nuance.' },
  { id: 'w47-listen-05', source: 'listen', weekNumber: 47, english: 'open-minded', chinese: '思想開放的', exampleSentence: 'Being open-minded is essential when experiencing a new culture.' },
  { id: 'w47-listen-06', source: 'listen', weekNumber: 47, english: 'common ground', chinese: '共同點', exampleSentence: 'Despite our differences, we found common ground in our love of food and family.' },
  // Speak source
  { id: 'w47-speak-01', source: 'speak', weekNumber: 47, english: 'cultural exchange', chinese: '文化交流', exampleSentence: 'Cultural exchange programs help students develop global perspectives.' },
  { id: 'w47-speak-02', source: 'speak', weekNumber: 47, english: 'misunderstanding', chinese: '誤解', exampleSentence: 'A small misunderstanding led to an awkward moment between us.' },
  { id: 'w47-speak-03', source: 'speak', weekNumber: 47, english: 'adapt', chinese: '適應', exampleSentence: 'It took me several months to adapt to life in a new country.' },
  { id: 'w47-speak-04', source: 'speak', weekNumber: 47, english: 'universal', chinese: '普世的、共通的', exampleSentence: 'The love between a parent and child seems to be a universal experience.' },
  { id: 'w47-speak-05', source: 'speak', weekNumber: 47, english: 'diverse', chinese: '多元的', exampleSentence: 'Working in a diverse team taught me to see problems from many angles.' },

  // ========== W48 — Language & Identity ==========
  // Listen source
  { id: 'w48-listen-01', source: 'listen', weekNumber: 48, english: 'code-switch', chinese: '語碼轉換（在不同語言或語體間切換）', exampleSentence: 'She code-switches effortlessly between English and Mandarin.' },
  { id: 'w48-listen-02', source: 'listen', weekNumber: 48, english: 'native tongue', chinese: '母語', exampleSentence: 'Even after twenty years abroad, her native tongue never left her.' },
  { id: 'w48-listen-03', source: 'listen', weekNumber: 48, english: 'nuance', chinese: '細微差異', exampleSentence: 'Some emotions can only be expressed with the full nuance of your native language.' },
  { id: 'w48-listen-04', source: 'listen', weekNumber: 48, english: 'bilingual', chinese: '雙語的', exampleSentence: 'Growing up bilingual gave her a natural ability to see things from two perspectives.' },
  { id: 'w48-listen-05', source: 'listen', weekNumber: 48, english: 'untranslatable', chinese: '無法翻譯的', exampleSentence: 'Some concepts are untranslatable because they are unique to one culture.' },
  { id: 'w48-listen-06', source: 'listen', weekNumber: 48, english: 'second nature', chinese: '第二天性、習以為常', exampleSentence: 'After years of practice, speaking English in meetings has become second nature.' },
  // Speak source
  { id: 'w48-speak-01', source: 'speak', weekNumber: 48, english: 'identity', chinese: '身份認同', exampleSentence: 'Language is deeply tied to cultural identity.' },
  { id: 'w48-speak-02', source: 'speak', weekNumber: 48, english: 'accent', chinese: '口音', exampleSentence: 'Her accent gives away the city she grew up in.' },
  { id: 'w48-speak-03', source: 'speak', weekNumber: 48, english: 'fluent', chinese: '流利的', exampleSentence: 'He became fluent in Japanese after living in Tokyo for two years.' },
  { id: 'w48-speak-04', source: 'speak', weekNumber: 48, english: 'express', chinese: '表達', exampleSentence: 'Sometimes it is hard to express complex emotions in a second language.' },
  { id: 'w48-speak-05', source: 'speak', weekNumber: 48, english: 'mindset', chinese: '思維方式', exampleSentence: 'Learning a language shifts your mindset in subtle but powerful ways.' },

  // ========== W49 — Rest & Renewal ==========
  // Listen source
  { id: 'w49-listen-01', source: 'listen', weekNumber: 49, english: 'recharge', chinese: '充電、恢復精力', exampleSentence: 'Introverts need alone time to recharge after social events.' },
  { id: 'w49-listen-02', source: 'listen', weekNumber: 49, english: 'burnout', chinese: '過度疲勞、精力耗盡', exampleSentence: 'She suffered from burnout after working eighty-hour weeks for months.' },
  { id: 'w49-listen-03', source: 'listen', weekNumber: 49, english: 'restore', chinese: '恢復、修復', exampleSentence: 'A walk in nature always restores my sense of calm.' },
  { id: 'w49-listen-04', source: 'listen', weekNumber: 49, english: 'wind down', chinese: '放鬆、慢慢平靜下來', exampleSentence: 'I wind down each evening by reading or listening to soft music.' },
  { id: 'w49-listen-05', source: 'listen', weekNumber: 49, english: 'intentional', chinese: '有意為之的', exampleSentence: 'Being intentional about rest means treating it as a priority, not an afterthought.' },
  { id: 'w49-listen-06', source: 'listen', weekNumber: 49, english: 'guilt-free', chinese: '不帶愧疚感的', exampleSentence: 'She finally learned to enjoy guilt-free rest without feeling lazy.' },
  // Speak source
  { id: 'w49-speak-01', source: 'speak', weekNumber: 49, english: 'exhausted', chinese: '精疲力竭的', exampleSentence: 'By Friday evening, I am completely exhausted and need the weekend to recover.' },
  { id: 'w49-speak-02', source: 'speak', weekNumber: 49, english: 'refresh', chinese: '使煥然一新、刷新精神', exampleSentence: 'A short nap can refresh your mind better than an extra cup of coffee.' },
  { id: 'w49-speak-03', source: 'speak', weekNumber: 49, english: 'leisure', chinese: '閒暇、休閒', exampleSentence: 'I use my leisure time to read and spend time in nature.' },
  { id: 'w49-speak-04', source: 'speak', weekNumber: 49, english: 'unplug', chinese: '斷線、遠離電子產品', exampleSentence: 'I try to unplug from my phone for at least one hour before bed.' },
  { id: 'w49-speak-05', source: 'speak', weekNumber: 49, english: 'self-care', chinese: '自我照顧', exampleSentence: 'Self-care looks different for everyone — for me, it is cooking a slow meal.' },

  // ========== W50 — Gratitude & Appreciation ==========
  // Listen source
  { id: 'w50-listen-01', source: 'listen', weekNumber: 50, english: 'take for granted', chinese: '視為理所當然', exampleSentence: 'We often take clean water and stable electricity for granted.' },
  { id: 'w50-listen-02', source: 'listen', weekNumber: 50, english: 'count your blessings', chinese: '數算你的福氣、懂得感恩', exampleSentence: 'Whenever I feel down, I try to count my blessings.' },
  { id: 'w50-listen-03', source: 'listen', weekNumber: 50, english: 'heartfelt', chinese: '真誠的、發自內心的', exampleSentence: 'She wrote a heartfelt thank-you letter to her mentor.' },
  { id: 'w50-listen-04', source: 'listen', weekNumber: 50, english: 'perspective shift', chinese: '觀點的轉變', exampleSentence: 'Traveling to a developing country gave me a real perspective shift.' },
  { id: 'w50-listen-05', source: 'listen', weekNumber: 50, english: 'acknowledge', chinese: '承認、表示感謝', exampleSentence: 'It is important to acknowledge the people who support you.' },
  { id: 'w50-listen-06', source: 'listen', weekNumber: 50, english: 'abundance', chinese: '豐盛、充足', exampleSentence: 'Gratitude shifts your focus from what is missing to the abundance already present.' },
  // Speak source
  { id: 'w50-speak-01', source: 'speak', weekNumber: 50, english: 'grateful', chinese: '感激的', exampleSentence: 'I am deeply grateful for the support my family gave me.' },
  { id: 'w50-speak-02', source: 'speak', weekNumber: 50, english: 'appreciate', chinese: '感謝、珍視', exampleSentence: 'I have come to appreciate the simple moments in life more as I get older.' },
  { id: 'w50-speak-03', source: 'speak', weekNumber: 50, english: 'gratitude journal', chinese: '感恩日記', exampleSentence: 'Keeping a gratitude journal helped her shift toward a more positive mindset.' },
  { id: 'w50-speak-04', source: 'speak', weekNumber: 50, english: 'mindful', chinese: '正念的、有意識的', exampleSentence: 'Being mindful of small joys can dramatically improve your daily mood.' },
  { id: 'w50-speak-05', source: 'speak', weekNumber: 50, english: 'overlook', chinese: '忽略', exampleSentence: 'We often overlook how lucky we are to have our health.' },

  // ========== W51 — Goals & Intentions ==========
  // Listen source
  { id: 'w51-listen-01', source: 'listen', weekNumber: 51, english: 'set an intention', chinese: '設定意圖', exampleSentence: 'Each morning, she sets an intention for how she wants to show up that day.' },
  { id: 'w51-listen-02', source: 'listen', weekNumber: 51, english: 'long-term vision', chinese: '長遠願景', exampleSentence: 'Without a long-term vision, it is easy to get distracted by short-term pressures.' },
  { id: 'w51-listen-03', source: 'listen', weekNumber: 51, english: 'trade-off', chinese: '取捨', exampleSentence: 'Every major goal involves trade-offs — you gain something and give up something else.' },
  { id: 'w51-listen-04', source: 'listen', weekNumber: 51, english: 'stay on track', chinese: '保持在正確的軌道上', exampleSentence: 'A weekly review helps me stay on track with my goals.' },
  { id: 'w51-listen-05', source: 'listen', weekNumber: 51, english: 'let go of', chinese: '放下、放棄', exampleSentence: 'Sometimes the bravest thing is to let go of a goal that no longer serves you.' },
  { id: 'w51-listen-06', source: 'listen', weekNumber: 51, english: 'alignment', chinese: '一致、契合', exampleSentence: 'She felt out of alignment when her daily actions did not match her core values.' },
  // Speak source
  { id: 'w51-speak-01', source: 'speak', weekNumber: 51, english: 'goal', chinese: '目標', exampleSentence: 'My main goal for this year is to improve my English speaking confidence.' },
  { id: 'w51-speak-02', source: 'speak', weekNumber: 51, english: 'motivation', chinese: '動力、激勵', exampleSentence: 'Understanding your deep motivation helps you push through difficult times.' },
  { id: 'w51-speak-03', source: 'speak', weekNumber: 51, english: 'committed', chinese: '投入的、全力以赴的', exampleSentence: 'She is fully committed to finishing her degree no matter how long it takes.' },
  { id: 'w51-speak-04', source: 'speak', weekNumber: 51, english: 'realistic', chinese: '切實可行的', exampleSentence: 'It is important to set realistic goals that challenge but do not crush you.' },
  { id: 'w51-speak-05', source: 'speak', weekNumber: 51, english: 'direction', chinese: '方向', exampleSentence: 'I do not always have a clear plan, but I have a sense of direction.' },

  // ========== W52 — Year in Review ==========
  // Listen source
  { id: 'w52-listen-01', source: 'listen', weekNumber: 52, english: 'highlight', chinese: '亮點、最精彩的部分', exampleSentence: 'The highlight of the year was the trip I took with my family to Japan.' },
  { id: 'w52-listen-02', source: 'listen', weekNumber: 52, english: 'look back on', chinese: '回顧、回想', exampleSentence: 'Looking back on this year, I am proud of how much I have grown.' },
  { id: 'w52-listen-03', source: 'listen', weekNumber: 52, english: 'accomplish', chinese: '達成、實現', exampleSentence: 'She accomplished more this year than she had in the previous three combined.' },
  { id: 'w52-listen-04', source: 'listen', weekNumber: 52, english: 'setback', chinese: '挫折、阻礙', exampleSentence: 'Every setback taught me something valuable about my own resilience.' },
  { id: 'w52-listen-05', source: 'listen', weekNumber: 52, english: 'intentionally', chinese: '有意地、刻意地', exampleSentence: 'I want to live more intentionally next year — saying no more often.' },
  { id: 'w52-listen-06', source: 'listen', weekNumber: 52, english: 'carry forward', chinese: '延續、帶到未來', exampleSentence: 'Which lessons from this year do you want to carry forward into the next?' },
  // Speak source
  { id: 'w52-speak-01', source: 'speak', weekNumber: 52, english: 'review', chinese: '回顧', exampleSentence: 'An annual review helps you see patterns you would miss day to day.' },
  { id: 'w52-speak-02', source: 'speak', weekNumber: 52, english: 'proud of', chinese: '為……感到自豪', exampleSentence: 'I am most proud of finishing my first half marathon this year.' },
  { id: 'w52-speak-03', source: 'speak', weekNumber: 52, english: 'challenge', chinese: '挑戰', exampleSentence: 'The biggest challenge this year was learning to ask for help.' },
  { id: 'w52-speak-04', source: 'speak', weekNumber: 52, english: 'resolution', chinese: '決心、新年決心', exampleSentence: 'Instead of a resolution, I set a single word to guide the coming year.' },
  { id: 'w52-speak-05', source: 'speak', weekNumber: 52, english: 'transform', chinese: '轉變、改變', exampleSentence: 'This year truly transformed the way I see myself and my potential.' },

  // ========== W53 — New Beginnings ==========
  // Listen source
  { id: 'w53-listen-01', source: 'listen', weekNumber: 53, english: 'threshold', chinese: '門檻、轉換點', exampleSentence: 'Standing at the threshold of a new chapter, she felt both nervous and excited.' },
  { id: 'w53-listen-02', source: 'listen', weekNumber: 53, english: 'embrace', chinese: '擁抱、接納', exampleSentence: 'Learning to embrace change is one of the most valuable life skills.' },
  { id: 'w53-listen-03', source: 'listen', weekNumber: 53, english: 'fresh start', chinese: '全新的開始', exampleSentence: 'Moving to a new city felt like a fresh start — a chance to redefine myself.' },
  { id: 'w53-listen-04', source: 'listen', weekNumber: 53, english: 'leap of faith', chinese: '信念的飛躍、放手一搏', exampleSentence: 'Quitting his secure job to start a business was a real leap of faith.' },
  { id: 'w53-listen-05', source: 'listen', weekNumber: 53, english: 'reinvent yourself', chinese: '重塑自我', exampleSentence: 'She used the career break as an opportunity to reinvent herself completely.' },
  { id: 'w53-listen-06', source: 'listen', weekNumber: 53, english: 'the unknown', chinese: '未知', exampleSentence: 'Most people fear the unknown, but it also holds the most possibility.' },
  // Speak source
  { id: 'w53-speak-01', source: 'speak', weekNumber: 53, english: 'beginning', chinese: '開始、起點', exampleSentence: 'Every great journey begins with a single, uncertain step.' },
  { id: 'w53-speak-02', source: 'speak', weekNumber: 53, english: 'opportunity', chinese: '機會', exampleSentence: 'I try to see every ending as an opportunity for something new.' },
  { id: 'w53-speak-03', source: 'speak', weekNumber: 53, english: 'courage', chinese: '勇氣', exampleSentence: 'Starting over takes enormous courage, especially when you have built so much.' },
  { id: 'w53-speak-04', source: 'speak', weekNumber: 53, english: 'chapter', chinese: '篇章、人生階段', exampleSentence: 'I feel like I am about to start an exciting new chapter in my life.' },
  { id: 'w53-speak-05', source: 'speak', weekNumber: 53, english: 'possibility', chinese: '可能性', exampleSentence: 'New beginnings remind us that the future holds more possibility than we imagine.' },
]

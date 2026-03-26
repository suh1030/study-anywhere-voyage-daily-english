export interface Flashcard {
  id: string
  source: 'listen' | 'speak'
  weekNumber: number
  english: string
  chinese: string
  exampleSentence: string
}

export const FLASHCARDS_W01_W08: Flashcard[] = [
  // ========== W1 — Morning Routines ==========
  // Listen source (from Episode 01)
  { id: 'w1-listen-01', source: 'listen', weekNumber: 1, english: "I've been meaning to", chinese: '我一直想要（做某事）', exampleSentence: "I've been meaning to try that new restaurant near the office." },
  { id: 'w1-listen-02', source: 'listen', weekNumber: 1, english: 'goes off', chinese: '（鬧鐘）響起', exampleSentence: 'My alarm goes off at 6 a.m. every weekday.' },
  { id: 'w1-listen-03', source: 'listen', weekNumber: 1, english: 'make peace with', chinese: '接受、釋懷', exampleSentence: "I've made peace with waking up early for work." },
  { id: 'w1-listen-04', source: 'listen', weekNumber: 1, english: 'head to', chinese: '前往', exampleSentence: 'After breakfast, I head to the train station.' },
  { id: 'w1-listen-05', source: 'listen', weekNumber: 1, english: 'zone out', chinese: '放空、發呆', exampleSentence: 'I sometimes zone out during long meetings.' },
  { id: 'w1-listen-06', source: 'listen', weekNumber: 1, english: 'geography', chinese: '地理位置', exampleSentence: 'The geography of the city makes commuting difficult.' },
  // Speak source (from W1 Speak articles)
  { id: 'w1-speak-01', source: 'speak', weekNumber: 1, english: 'morning routine', chinese: '晨間日常', exampleSentence: 'My morning routine starts with a cup of coffee.' },
  { id: 'w1-speak-02', source: 'speak', weekNumber: 1, english: 'productive', chinese: '有效率的', exampleSentence: 'A good breakfast makes me more productive at work.' },
  { id: 'w1-speak-03', source: 'speak', weekNumber: 1, english: 'habit', chinese: '習慣', exampleSentence: "It takes about three weeks to form a new habit." },
  { id: 'w1-speak-04', source: 'speak', weekNumber: 1, english: 'consistent', chinese: '持續一致的', exampleSentence: 'Being consistent with your routine leads to better results.' },
  { id: 'w1-speak-05', source: 'speak', weekNumber: 1, english: 'energy level', chinese: '精力水平', exampleSentence: 'My energy level is highest in the morning.' },
  { id: 'w1-speak-06', source: 'speak', weekNumber: 1, english: 'prioritize', chinese: '優先處理', exampleSentence: 'I try to prioritize the most important tasks first.' },

  // ========== W2 — Commuting ==========
  // Listen source (from Episode 02)
  { id: 'w2-listen-01', source: 'listen', weekNumber: 2, english: 'buffer zone', chinese: '緩衝區', exampleSentence: 'My commute acts as a buffer zone between work and home.' },
  { id: 'w2-listen-02', source: 'listen', weekNumber: 2, english: 'switch gears', chinese: '切換模式', exampleSentence: 'I need a few minutes to switch gears after a long meeting.' },
  { id: 'w2-listen-03', source: 'listen', weekNumber: 2, english: 'a bit of a gamble', chinese: '有點碰運氣', exampleSentence: 'Taking the bus during rush hour is a bit of a gamble.' },
  { id: 'w2-listen-04', source: 'listen', weekNumber: 2, english: 'top up', chinese: '儲值', exampleSentence: 'I need to top up my transit card before the weekend.' },
  { id: 'w2-listen-05', source: 'listen', weekNumber: 2, english: 'shoulder to shoulder', chinese: '肩並肩（非常擁擠）', exampleSentence: 'The morning train is always shoulder to shoulder.' },
  { id: 'w2-listen-06', source: 'listen', weekNumber: 2, english: 'give a heads up', chinese: '事先通知', exampleSentence: "I always give my boss a heads up if I'm running late." },
  { id: 'w2-listen-07', source: 'listen', weekNumber: 2, english: 'decompress', chinese: '減壓、放鬆', exampleSentence: 'Listening to music helps me decompress after work.' },
  { id: 'w2-listen-08', source: 'listen', weekNumber: 2, english: 'underrated', chinese: '被低估的', exampleSentence: 'Walking to work is an underrated way to start the day.' },
  // Speak source (from W2 Speak articles)
  { id: 'w2-speak-01', source: 'speak', weekNumber: 2, english: 'commute', chinese: '通勤', exampleSentence: 'My commute takes about forty minutes each way.' },
  { id: 'w2-speak-02', source: 'speak', weekNumber: 2, english: 'public transportation', chinese: '大眾運輸', exampleSentence: 'I rely on public transportation to get to work.' },
  { id: 'w2-speak-03', source: 'speak', weekNumber: 2, english: 'rush hour', chinese: '尖峰時段', exampleSentence: 'Rush hour traffic makes everything take twice as long.' },
  { id: 'w2-speak-04', source: 'speak', weekNumber: 2, english: 'transfer', chinese: '轉乘', exampleSentence: 'I need to transfer at the main station.' },
  { id: 'w2-speak-05', source: 'speak', weekNumber: 2, english: 'delay', chinese: '延誤', exampleSentence: 'There was a thirty-minute delay on my train this morning.' },

  // ========== W3 — Home & Living Space ==========
  // Listen source (from Episode 03)
  { id: 'w3-listen-01', source: 'listen', weekNumber: 3, english: 'cozy', chinese: '舒適溫馨的', exampleSentence: 'My apartment is small but cozy.' },
  { id: 'w3-listen-02', source: 'listen', weekNumber: 3, english: 'landlord', chinese: '房東', exampleSentence: 'My landlord is very responsive when things break.' },
  { id: 'w3-listen-03', source: 'listen', weekNumber: 3, english: 'make do with', chinese: '將就使用', exampleSentence: "The kitchen is tiny, but I make do with what I have." },
  { id: 'w3-listen-04', source: 'listen', weekNumber: 3, english: 'settle in', chinese: '安頓下來', exampleSentence: 'It took me a few weeks to settle in after moving.' },
  { id: 'w3-listen-05', source: 'listen', weekNumber: 3, english: 'neighborhood', chinese: '鄰里、社區', exampleSentence: 'I love my neighborhood — it has everything I need within walking distance.' },
  { id: 'w3-listen-06', source: 'listen', weekNumber: 3, english: 'personal touch', chinese: '個人風格', exampleSentence: 'Adding photos and plants gave the room a personal touch.' },
  // Speak source
  { id: 'w3-speak-01', source: 'speak', weekNumber: 3, english: 'spacious', chinese: '寬敞的', exampleSentence: 'The living room is surprisingly spacious for a city apartment.' },
  { id: 'w3-speak-02', source: 'speak', weekNumber: 3, english: 'affordable', chinese: '負擔得起的', exampleSentence: "It's hard to find affordable housing near the city center." },
  { id: 'w3-speak-03', source: 'speak', weekNumber: 3, english: 'renovate', chinese: '翻新', exampleSentence: 'We plan to renovate the bathroom next month.' },
  { id: 'w3-speak-04', source: 'speak', weekNumber: 3, english: 'minimalist', chinese: '極簡主義的', exampleSentence: 'I prefer a minimalist style — less clutter, more calm.' },
  { id: 'w3-speak-05', source: 'speak', weekNumber: 3, english: 'convenient', chinese: '方便的', exampleSentence: "It's convenient to have a supermarket right downstairs." },

  // ========== W4 — Food & Eating Habits ==========
  // Listen source (from Episode 04)
  { id: 'w4-listen-01', source: 'listen', weekNumber: 4, english: 'picky eater', chinese: '挑食的人', exampleSentence: "I used to be a picky eater, but I've gotten better." },
  { id: 'w4-listen-02', source: 'listen', weekNumber: 4, english: 'comfort food', chinese: '療癒食物', exampleSentence: 'Hot soup is my go-to comfort food on rainy days.' },
  { id: 'w4-listen-03', source: 'listen', weekNumber: 4, english: 'meal prep', chinese: '備餐', exampleSentence: 'I do meal prep on Sundays to save time during the week.' },
  { id: 'w4-listen-04', source: 'listen', weekNumber: 4, english: 'leftovers', chinese: '剩菜', exampleSentence: 'I usually bring leftovers for lunch the next day.' },
  { id: 'w4-listen-05', source: 'listen', weekNumber: 4, english: 'acquired taste', chinese: '需要時間培養的口味', exampleSentence: 'Black coffee is definitely an acquired taste.' },
  { id: 'w4-listen-06', source: 'listen', weekNumber: 4, english: 'treat yourself', chinese: '犒賞自己', exampleSentence: "It's okay to treat yourself to a nice meal once in a while." },
  // Speak source
  { id: 'w4-speak-01', source: 'speak', weekNumber: 4, english: 'nutritious', chinese: '營養的', exampleSentence: 'A nutritious breakfast gives you energy for the whole morning.' },
  { id: 'w4-speak-02', source: 'speak', weekNumber: 4, english: 'cuisine', chinese: '料理、菜系', exampleSentence: "I'm interested in trying different types of cuisine." },
  { id: 'w4-speak-03', source: 'speak', weekNumber: 4, english: 'ingredient', chinese: '食材', exampleSentence: 'Fresh ingredients make a huge difference in cooking.' },
  { id: 'w4-speak-04', source: 'speak', weekNumber: 4, english: 'portion', chinese: '份量', exampleSentence: 'The portions at that restaurant are very generous.' },
  { id: 'w4-speak-05', source: 'speak', weekNumber: 4, english: 'dietary', chinese: '飲食的', exampleSentence: 'More people are paying attention to their dietary habits.' },

  // ========== W5 — Weather & Seasons ==========
  // Listen source (from Episode 05)
  { id: 'w5-listen-01', source: 'listen', weekNumber: 5, english: 'forecast', chinese: '天氣預報', exampleSentence: 'I always check the forecast before leaving the house.' },
  { id: 'w5-listen-02', source: 'listen', weekNumber: 5, english: 'humidity', chinese: '濕度', exampleSentence: 'The humidity in summer makes everything feel sticky.' },
  { id: 'w5-listen-03', source: 'listen', weekNumber: 5, english: 'breezy', chinese: '微風的', exampleSentence: "It's a nice breezy afternoon — perfect for a walk." },
  { id: 'w5-listen-04', source: 'listen', weekNumber: 5, english: 'drizzle', chinese: '毛毛雨', exampleSentence: 'A light drizzle started just as I left the office.' },
  { id: 'w5-listen-05', source: 'listen', weekNumber: 5, english: 'layer up', chinese: '多穿幾層', exampleSentence: 'When it gets cold, I layer up instead of wearing one thick coat.' },
  { id: 'w5-listen-06', source: 'listen', weekNumber: 5, english: 'scorching', chinese: '酷熱的', exampleSentence: 'The afternoon sun was absolutely scorching.' },
  // Speak source
  { id: 'w5-speak-01', source: 'speak', weekNumber: 5, english: 'climate', chinese: '氣候', exampleSentence: 'The climate here is subtropical with hot, humid summers.' },
  { id: 'w5-speak-02', source: 'speak', weekNumber: 5, english: 'temperature', chinese: '溫度', exampleSentence: 'The temperature dropped ten degrees overnight.' },
  { id: 'w5-speak-03', source: 'speak', weekNumber: 5, english: 'precipitation', chinese: '降水量', exampleSentence: 'Annual precipitation has been increasing due to climate change.' },
  { id: 'w5-speak-04', source: 'speak', weekNumber: 5, english: 'seasonal', chinese: '季節性的', exampleSentence: 'Seasonal allergies are very common in spring.' },
  { id: 'w5-speak-05', source: 'speak', weekNumber: 5, english: 'unpredictable', chinese: '難以預測的', exampleSentence: 'The weather has been really unpredictable this month.' },

  // ========== W6 — Shopping & Money ==========
  // Listen source (from Episode 06)
  { id: 'w6-listen-01', source: 'listen', weekNumber: 6, english: 'impulse buy', chinese: '衝動購物', exampleSentence: 'I try to avoid impulse buys when I shop online.' },
  { id: 'w6-listen-02', source: 'listen', weekNumber: 6, english: 'budget', chinese: '預算', exampleSentence: 'I set a monthly budget for groceries and entertainment.' },
  { id: 'w6-listen-03', source: 'listen', weekNumber: 6, english: 'splurge', chinese: '揮霍、大手筆花費', exampleSentence: 'I decided to splurge on a nice dinner for my birthday.' },
  { id: 'w6-listen-04', source: 'listen', weekNumber: 6, english: 'bargain', chinese: '便宜貨、划算的交易', exampleSentence: 'I found a real bargain at the weekend sale.' },
  { id: 'w6-listen-05', source: 'listen', weekNumber: 6, english: 'worth it', chinese: '值得的', exampleSentence: 'Good shoes are expensive, but they are worth it.' },
  { id: 'w6-listen-06', source: 'listen', weekNumber: 6, english: 'window shopping', chinese: '逛街不買（只看不買）', exampleSentence: "Sometimes I go window shopping just to pass the time." },
  // Speak source
  { id: 'w6-speak-01', source: 'speak', weekNumber: 6, english: 'consumer', chinese: '消費者', exampleSentence: 'As consumers, we should be more aware of our spending.' },
  { id: 'w6-speak-02', source: 'speak', weekNumber: 6, english: 'discount', chinese: '折扣', exampleSentence: 'The store is offering a twenty percent discount this week.' },
  { id: 'w6-speak-03', source: 'speak', weekNumber: 6, english: 'affordable', chinese: '價格合理的', exampleSentence: 'This brand offers affordable but high-quality products.' },
  { id: 'w6-speak-04', source: 'speak', weekNumber: 6, english: 'transaction', chinese: '交易', exampleSentence: 'Online transactions have become much safer in recent years.' },
  { id: 'w6-speak-05', source: 'speak', weekNumber: 6, english: 'sustainable', chinese: '永續的', exampleSentence: 'More people are choosing sustainable products over cheap ones.' },

  // ========== W7 — Health & Body ==========
  // Listen source (from Episode 07)
  { id: 'w7-listen-01', source: 'listen', weekNumber: 7, english: 'work out', chinese: '運動、鍛鍊', exampleSentence: 'I try to work out at least three times a week.' },
  { id: 'w7-listen-02', source: 'listen', weekNumber: 7, english: 'under the weather', chinese: '身體不舒服', exampleSentence: "I'm feeling a bit under the weather today." },
  { id: 'w7-listen-03', source: 'listen', weekNumber: 7, english: 'get back on track', chinese: '回到正軌', exampleSentence: 'After being sick, it took me a week to get back on track.' },
  { id: 'w7-listen-04', source: 'listen', weekNumber: 7, english: 'burn out', chinese: '精疲力竭', exampleSentence: "If you don't rest, you'll burn out quickly." },
  { id: 'w7-listen-05', source: 'listen', weekNumber: 7, english: 'wellness', chinese: '身心健康', exampleSentence: 'Many companies now offer wellness programs for employees.' },
  { id: 'w7-listen-06', source: 'listen', weekNumber: 7, english: 'in moderation', chinese: '適量地', exampleSentence: "It's fine to eat sweets, as long as it's in moderation." },
  // Speak source
  { id: 'w7-speak-01', source: 'speak', weekNumber: 7, english: 'immune system', chinese: '免疫系統', exampleSentence: 'Getting enough sleep strengthens your immune system.' },
  { id: 'w7-speak-02', source: 'speak', weekNumber: 7, english: 'sedentary', chinese: '久坐不動的', exampleSentence: 'A sedentary lifestyle increases the risk of health problems.' },
  { id: 'w7-speak-03', source: 'speak', weekNumber: 7, english: 'supplement', chinese: '補充品', exampleSentence: 'Some people take vitamin supplements to stay healthy.' },
  { id: 'w7-speak-04', source: 'speak', weekNumber: 7, english: 'chronic', chinese: '慢性的', exampleSentence: 'Chronic stress can lead to serious health issues.' },
  { id: 'w7-speak-05', source: 'speak', weekNumber: 7, english: 'mindful', chinese: '正念的、有意識的', exampleSentence: 'Being mindful of what you eat makes a big difference.' },

  // ========== W8 — Daily Schedules ==========
  // Listen source (from Episode 08)
  { id: 'w8-listen-01', source: 'listen', weekNumber: 8, english: 'time management', chinese: '時間管理', exampleSentence: 'Good time management is key to a balanced life.' },
  { id: 'w8-listen-02', source: 'listen', weekNumber: 8, english: 'wind down', chinese: '放鬆、慢慢結束', exampleSentence: 'I like to wind down with a book before bed.' },
  { id: 'w8-listen-03', source: 'listen', weekNumber: 8, english: 'overwhelmed', chinese: '不堪重負的', exampleSentence: 'I felt overwhelmed by all the tasks on my to-do list.' },
  { id: 'w8-listen-04', source: 'listen', weekNumber: 8, english: 'juggle', chinese: '同時應付（多件事）', exampleSentence: 'She juggles work, family, and her studies every day.' },
  { id: 'w8-listen-05', source: 'listen', weekNumber: 8, english: 'squeeze in', chinese: '擠出時間做', exampleSentence: 'I try to squeeze in a workout before dinner.' },
  { id: 'w8-listen-06', source: 'listen', weekNumber: 8, english: 'fall behind', chinese: '落後', exampleSentence: "If I skip one day, I feel like I'm falling behind." },
  // Speak source
  { id: 'w8-speak-01', source: 'speak', weekNumber: 8, english: 'procrastinate', chinese: '拖延', exampleSentence: "I tend to procrastinate when the task feels too big." },
  { id: 'w8-speak-02', source: 'speak', weekNumber: 8, english: 'efficient', chinese: '有效率的', exampleSentence: 'Batching similar tasks together is more efficient.' },
  { id: 'w8-speak-03', source: 'speak', weekNumber: 8, english: 'deadline', chinese: '截止日期', exampleSentence: 'The deadline for this project is next Friday.' },
  { id: 'w8-speak-04', source: 'speak', weekNumber: 8, english: 'delegate', chinese: '委派', exampleSentence: "Learning to delegate tasks has made me less stressed." },
  { id: 'w8-speak-05', source: 'speak', weekNumber: 8, english: 'routine', chinese: '例行公事', exampleSentence: 'Having a consistent routine helps me stay organized.' },
]

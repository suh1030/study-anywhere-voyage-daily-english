const fs = require('fs')
const path = require('path')

const GENERIC_TERM_BANK = [
  { en: 'daily habit', zh: '日常習慣' },
  { en: 'real situation', zh: '真實情境' },
  { en: 'small choice', zh: '小小的選擇' },
  { en: 'common challenge', zh: '常見的難題' },
  { en: 'practical step', zh: '實際做法' },
  { en: 'clear example', zh: '具體例子' },
  { en: 'helpful phrase', zh: '實用說法' },
  { en: 'steady progress', zh: '穩定進步' },
]

const THEME_TERM_BANKS = {
  'New Year & Fresh Starts': [
    { en: 'fresh start', zh: '重新開始' },
    { en: 'new routine', zh: '新的日常節奏' },
    { en: 'set an intention', zh: '設定一個意圖' },
    { en: 'turn the page', zh: '翻開新的一頁' },
    { en: 'small beginning', zh: '小小的開始' },
    { en: 'let go of last year', zh: '放下去年的包袱' },
    { en: 'build momentum', zh: '慢慢累積動能' },
    { en: 'start again', zh: '重新出發' },
  ],
  'Morning Routines': [
    { en: 'morning routine', zh: '晨間習慣' },
    { en: 'wake up early', zh: '早起' },
    { en: 'slow morning', zh: '慢節奏的早晨' },
    { en: 'first cup of coffee', zh: '第一杯咖啡' },
    { en: 'check your phone', zh: '看手機' },
    { en: 'quiet start', zh: '安靜地開始一天' },
    { en: 'set the tone', zh: '決定一天的基調' },
    { en: 'start the day well', zh: '好好開始一天' },
  ],
  Commuting: [
    { en: 'daily commute', zh: '日常通勤' },
    { en: 'rush hour', zh: '尖峰時段' },
    { en: 'public transit', zh: '大眾運輸' },
    { en: 'work from home', zh: '在家工作' },
    { en: 'leave earlier', zh: '更早出門' },
    { en: 'traffic delay', zh: '交通延誤' },
    { en: 'commute time', zh: '通勤時間' },
    { en: 'get to work', zh: '去上班' },
  ],
  'Home & Living Space': [
    { en: 'living space', zh: '生活空間' },
    { en: 'feel at home', zh: '有家的感覺' },
    { en: 'tidy up', zh: '整理收拾' },
    { en: 'shared apartment', zh: '合租公寓' },
    { en: 'quiet corner', zh: '安靜的角落' },
    { en: 'home cooking', zh: '在家做飯' },
    { en: 'personal style', zh: '個人風格' },
    { en: 'make room', zh: '騰出空間' },
  ],
  'Celebrations & Festivals': [
    { en: 'family celebration', zh: '家庭慶祝活動' },
    { en: 'festival tradition', zh: '節慶傳統' },
    { en: 'special occasion', zh: '特別的場合' },
    { en: 'exchange gifts', zh: '交換禮物' },
    { en: 'gather together', zh: '聚在一起' },
    { en: 'holiday mood', zh: '節日氣氛' },
    { en: 'mark the moment', zh: '紀念這個時刻' },
    { en: 'shared memory', zh: '共同回憶' },
  ],
  'Food & Eating Habits': [
    { en: 'eating habit', zh: '飲食習慣' },
    { en: 'comfort food', zh: '療癒食物' },
    { en: 'eat out', zh: '外食' },
    { en: 'cook at home', zh: '在家下廚' },
    { en: 'balanced meal', zh: '均衡的一餐' },
    { en: 'street food', zh: '街頭小吃' },
    { en: 'family recipe', zh: '家傳食譜' },
    { en: 'food memory', zh: '和食物有關的回憶' },
  ],
  'Weather & Seasons': [
    { en: 'weather forecast', zh: '天氣預報' },
    { en: 'rainy season', zh: '雨季' },
    { en: 'temperature drop', zh: '氣溫下降' },
    { en: 'seasonal change', zh: '季節變化' },
    { en: 'cold front', zh: '冷鋒' },
    { en: 'humid day', zh: '潮濕的一天' },
    { en: 'sunny break', zh: '短暫放晴' },
    { en: 'storm warning', zh: '暴風警報' },
  ],
  'Shopping & Money': [
    { en: 'spending habit', zh: '消費習慣' },
    { en: 'monthly budget', zh: '每月預算' },
    { en: 'impulse buy', zh: '衝動購買' },
    { en: 'compare prices', zh: '比較價格' },
    { en: 'save up', zh: '存錢' },
    { en: 'good deal', zh: '划算的選擇' },
    { en: 'money etiquette', zh: '金錢禮儀' },
    { en: 'financial goal', zh: '財務目標' },
  ],
  'Health & Body': [
    { en: 'health routine', zh: '健康習慣' },
    { en: 'sleep quality', zh: '睡眠品質' },
    { en: 'balanced meal', zh: '均衡飲食' },
    { en: 'stress level', zh: '壓力程度' },
    { en: 'physical activity', zh: '身體活動' },
    { en: 'recovery time', zh: '恢復時間' },
    { en: 'doctor visit', zh: '看醫生' },
    { en: 'healthy habit', zh: '健康做法' },
  ],
  'Daily Schedules': [
    { en: 'daily schedule', zh: '每日行程' },
    { en: 'morning block', zh: '早上的時間區塊' },
    { en: 'packed day', zh: '排得很滿的一天' },
    { en: 'time block', zh: '時間分塊' },
    { en: 'plan ahead', zh: '提前安排' },
    { en: 'free up time', zh: '騰出時間' },
    { en: 'invisible labor', zh: '看不見的勞務' },
    { en: 'daily rhythm', zh: '日常節奏' },
  ],
  Friendship: [
    { en: 'close friend', zh: '親近的朋友' },
    { en: 'stay in touch', zh: '保持聯絡' },
    { en: 'feel supported', zh: '感到被支持' },
    { en: 'honest conversation', zh: '坦白的對話' },
    { en: 'grow apart', zh: '漸行漸遠' },
    { en: 'show up for someone', zh: '在別人需要時出現' },
    { en: 'shared history', zh: '共同的過去' },
    { en: 'trust each other', zh: '彼此信任' },
  ],
  Family: [
    { en: 'family gathering', zh: '家庭聚會' },
    { en: 'sibling relationship', zh: '手足關係' },
    { en: 'parental expectation', zh: '父母的期待' },
    { en: 'family role', zh: '在家中的角色' },
    { en: 'quality time', zh: '高品質相處時間' },
    { en: 'household rule', zh: '家中的規矩' },
    { en: 'unspoken tension', zh: '沒有說出口的緊張感' },
    { en: 'family tradition', zh: '家庭傳統' },
  ],
  'Colleagues & Teamwork': [
    { en: 'team member', zh: '團隊成員' },
    { en: 'shared responsibility', zh: '共同責任' },
    { en: 'work together', zh: '一起合作' },
    { en: 'give feedback', zh: '提供回饋' },
    { en: 'unclear expectation', zh: '不清楚的期待' },
    { en: 'hand off work', zh: '交接工作' },
    { en: 'team culture', zh: '團隊文化' },
    { en: 'professional trust', zh: '職場信任' },
  ],
  'Social Situations': [
    { en: 'small talk', zh: '寒暄閒聊' },
    { en: 'read the room', zh: '察言觀色' },
    { en: 'awkward silence', zh: '尷尬的沉默' },
    { en: 'social cue', zh: '社交線索' },
    { en: 'set a boundary', zh: '設下界線' },
    { en: 'make introductions', zh: '介紹彼此認識' },
    { en: 'feel included', zh: '感覺被接納' },
    { en: 'polite excuse', zh: '得體的理由' },
  ],
  'Personality & Character': [
    { en: 'first impression', zh: '第一印象' },
    { en: 'personality type', zh: '性格類型' },
    { en: 'introvert', zh: '內向的人' },
    { en: 'extrovert', zh: '外向的人' },
    { en: 'personal trait', zh: '個人特質' },
    { en: 'blind spot', zh: '盲點' },
    { en: 'self-awareness', zh: '自我覺察' },
    { en: 'stay grounded', zh: '保持踏實' },
  ],
  'Communication Styles': [
    { en: 'direct communication', zh: '直接的溝通方式' },
    { en: 'indirect hint', zh: '含蓄的暗示' },
    { en: 'active listening', zh: '主動傾聽' },
    { en: 'read the tone', zh: '聽出語氣' },
    { en: 'clarify gently', zh: '溫和地釐清' },
    { en: 'follow-up question', zh: '追問的問題' },
    { en: 'respectful disagreement', zh: '有禮貌的不同意' },
    { en: 'say it clearly', zh: '把話說清楚' },
  ],
  'Helping Others': [
    { en: 'lend a hand', zh: '伸出援手' },
    { en: 'offer support', zh: '提供支持' },
    { en: 'ask first', zh: '先開口詢問' },
    { en: 'step back', zh: '退一步' },
    { en: 'accept help', zh: '接受幫助' },
    { en: 'support system', zh: '支持系統' },
    { en: 'community care', zh: '社群中的照顧' },
    { en: 'quiet kindness', zh: '安靜卻真實的善意' },
  ],
  'Conflict & Resolution': [
    { en: 'address it early', zh: '及早處理' },
    { en: 'clear the air', zh: '把話說開' },
    { en: 'fight fair', zh: '有分寸地爭執' },
    { en: 'take responsibility', zh: '承擔責任' },
    { en: 'rebuild trust', zh: '重建信任' },
    { en: 'hold resentment', zh: '心裡一直記恨' },
    { en: 'set boundaries', zh: '設立界線' },
    { en: 'repair the relationship', zh: '修補關係' },
  ],
  'Your Job & Role': [
    { en: 'job title', zh: '職稱' },
    { en: 'day-to-day work', zh: '日常工作內容' },
    { en: 'core responsibility', zh: '核心責任' },
    { en: 'solve problems', zh: '解決問題' },
    { en: 'own the outcome', zh: '對結果負責' },
    { en: 'explain your role', zh: '說明自己的角色' },
    { en: 'work with clients', zh: '和客戶合作' },
    { en: 'grow into the role', zh: '慢慢長成這個角色' },
  ],
  'Meetings & Discussions': [
    { en: 'meeting agenda', zh: '會議議程' },
    { en: 'action items', zh: '待辦事項' },
    { en: 'speak up', zh: '開口發言' },
    { en: 'stay on topic', zh: '不要離題' },
    { en: 'respectful disagreement', zh: '尊重彼此的不同意見' },
    { en: 'virtual meeting', zh: '線上會議' },
    { en: 'follow-up note', zh: '會後追蹤紀錄' },
    { en: 'psychological safety', zh: '心理安全感' },
  ],
  'Deadlines & Pressure': [
    { en: 'tight deadline', zh: '很趕的期限' },
    { en: 'high stakes', zh: '高風險的情況' },
    { en: 'prioritize quickly', zh: '迅速排出優先順序' },
    { en: 'ask for help early', zh: '及早求助' },
    { en: 'prevent burnout', zh: '避免耗盡自己' },
    { en: 'work under pressure', zh: '在壓力下工作' },
    { en: 'recover afterwards', zh: '事後好好恢復' },
    { en: 'stay reliable', zh: '保持可靠' },
  ],
  'Problem Solving': [
    { en: 'define the problem', zh: '先定義問題' },
    { en: 'root cause', zh: '根本原因' },
    { en: 'test an idea', zh: '測試一個想法' },
    { en: 'work through uncertainty', zh: '在不確定中往前推進' },
    { en: 'brainstorm freely', zh: '自由地腦力激盪' },
    { en: 'make a trade-off', zh: '做取捨' },
    { en: 'simplify the solution', zh: '把解法變簡單' },
    { en: 'solve it as a team', zh: '一起解決它' },
  ],
  'Career Goals': [
    { en: 'career path', zh: '職涯路徑' },
    { en: 'define success', zh: '定義成功' },
    { en: 'long-term goal', zh: '長期目標' },
    { en: 'next step', zh: '下一步' },
    { en: 'career pivot', zh: '職涯轉向' },
    { en: 'ask a mentor', zh: '向前輩請教' },
    { en: 'work-life fit', zh: '工作與生活是否合拍' },
    { en: 'steady growth', zh: '穩定成長' },
  ],
  'Learning & Growth': [
    { en: 'growth zone', zh: '成長區' },
    { en: 'beginner mindset', zh: '初學者心態' },
    { en: 'practice consistently', zh: '持續練習' },
    { en: 'useful feedback', zh: '有幫助的回饋' },
    { en: 'stay curious', zh: '保持好奇' },
    { en: 'learn by doing', zh: '做中學' },
    { en: 'self-directed learning', zh: '自主學習' },
    { en: 'keep improving', zh: '持續進步' },
  ],
  'Success & Failure': [
    { en: 'proud moment', zh: '值得驕傲的時刻' },
    { en: 'bounce back', zh: '重新站起來' },
    { en: 'public pressure', zh: '來自外界的壓力' },
    { en: 'quiet success', zh: '安靜卻真實的成功' },
    { en: 'disappointment', zh: '失望' },
    { en: 'learn the lesson', zh: '學到教訓' },
    { en: 'redefine winning', zh: '重新定義贏' },
    { en: 'keep going', zh: '繼續往前' },
  ],
  'Work-Life Balance': [
    { en: 'switch off', zh: '切換到下班狀態' },
    { en: 'set boundaries', zh: '設下界線' },
    { en: 'rest without guilt', zh: '沒有罪惡感地休息' },
    { en: 'energy budget', zh: '精力預算' },
    { en: 'crowded schedule', zh: '塞滿的行程' },
    { en: 'make time', zh: '騰出時間' },
    { en: 'sustainable week', zh: '可持續的一週節奏' },
    { en: 'hobby outside work', zh: '工作之外的興趣' },
  ],
  Travel: [
    { en: 'plan an itinerary', zh: '安排行程' },
    { en: 'go with the flow', zh: '順著當下走' },
    { en: 'culture shock', zh: '文化衝擊' },
    { en: 'travel companion', zh: '旅伴' },
    { en: 'memorable place', zh: '讓人難忘的地方' },
    { en: 'travel on a budget', zh: '用有限預算旅行' },
    { en: 'return home', zh: '回到家' },
    { en: 'shift your perspective', zh: '改變你的看法' },
  ],
  'Photography & Visual Art': [
    { en: 'take a photo', zh: '拍一張照片' },
    { en: 'natural light', zh: '自然光' },
    { en: 'composition', zh: '構圖' },
    { en: 'edit carefully', zh: '仔細修圖' },
    { en: 'visual journal', zh: '視覺日記' },
    { en: 'creative process', zh: '創作過程' },
    { en: 'tell a story', zh: '說一個故事' },
    { en: 'capture a moment', zh: '捕捉一個瞬間' },
  ],
  'Music & Podcasts': [
    { en: 'make a playlist', zh: '做一份播放清單' },
    { en: 'mood shift', zh: '情緒轉變' },
    { en: 'favorite genre', zh: '最喜歡的音樂類型' },
    { en: 'background audio', zh: '背景聲音內容' },
    { en: 'long-form conversation', zh: '長篇深入對談' },
    { en: 'discover new artists', zh: '發現新的創作者' },
    { en: 'listening habit', zh: '聆聽習慣' },
    { en: 'audio companion', zh: '陪伴你的聲音內容' },
  ],
  'Reading & Writing': [
    { en: 'read deeply', zh: '深度閱讀' },
    { en: 'attention span', zh: '專注時間' },
    { en: 'take notes', zh: '做筆記' },
    { en: 'keep a journal', zh: '寫日記' },
    { en: 'rough draft', zh: '初稿' },
    { en: 'find your voice', zh: '找到自己的聲音' },
    { en: 'reading habit', zh: '閱讀習慣' },
    { en: 'write regularly', zh: '固定寫作' },
  ],
  'Pets & Animals': [
    { en: 'pet owner', zh: '養寵物的人' },
    { en: 'daily care', zh: '每天的照顧' },
    { en: 'emotional support', zh: '情感支持' },
    { en: 'playful personality', zh: '愛玩的個性' },
    { en: 'animal welfare', zh: '動物福祉' },
    { en: 'feel less alone', zh: '比較不孤單' },
    { en: 'gentle routine', zh: '溫柔的日常節奏' },
    { en: 'say goodbye', zh: '道別' },
  ],
  'Hobbies & Collections': [
    { en: 'creative outlet', zh: '抒發創造力的出口' },
    { en: 'collector item', zh: '收藏品' },
    { en: 'lose track of time', zh: '做到忘記時間' },
    { en: 'niche interest', zh: '小眾興趣' },
    { en: 'hands-on hobby', zh: '動手做的興趣' },
    { en: 'make room for play', zh: '替玩心留空間' },
    { en: 'shared enthusiasm', zh: '共同的熱情' },
    { en: 'healthy obsession', zh: '不失衡的熱愛' },
  ],
  'Nature & Outdoors': [
    { en: 'fresh air', zh: '新鮮空氣' },
    { en: 'go for a hike', zh: '去健行' },
    { en: 'feel grounded', zh: '感到踏實' },
    { en: 'open space', zh: '開闊的空間' },
    { en: 'protect the place', zh: '保護這個地方' },
    { en: 'leave no trace', zh: '不留下痕跡' },
    { en: 'weekend outdoors', zh: '週末到戶外去' },
    { en: 'mental reset', zh: '讓大腦重新整理一下' },
  ],
  'Sports & Fitness': [
    { en: 'work out', zh: '運動鍛鍊' },
    { en: 'stay active', zh: '保持活動量' },
    { en: 'build strength', zh: '增強體能' },
    { en: 'recovery day', zh: '恢復日' },
    { en: 'team sport', zh: '團隊運動' },
    { en: 'stay consistent', zh: '保持穩定' },
    { en: 'body image pressure', zh: '身體形象的壓力' },
    { en: 'find what works', zh: '找到適合自己的方式' },
  ],
  'Technology & Everyday Life': [
    { en: 'constant notifications', zh: '一直跳出的通知' },
    { en: 'focus time', zh: '專注時間' },
    { en: 'convenience cost', zh: '方便背後的代價' },
    { en: 'smart device', zh: '智慧裝置' },
    { en: 'digital clutter', zh: '數位雜亂感' },
    { en: 'screen-free time', zh: '不看螢幕的時間' },
    { en: 'digital fatigue', zh: '數位疲勞' },
    { en: 'own your attention', zh: '把注意力拿回來' },
  ],
  'Artificial Intelligence': [
    { en: 'automate a task', zh: '自動化一項工作' },
    { en: 'verify the output', zh: '核對輸出結果' },
    { en: 'human judgment', zh: '人的判斷' },
    { en: 'training data', zh: '訓練資料' },
    { en: 'bias in the system', zh: '系統中的偏差' },
    { en: 'generate ideas', zh: '產生想法' },
    { en: 'use it responsibly', zh: '負責任地使用它' },
    { en: 'future of work', zh: '工作的未來' },
  ],
  'Health & Mental Wellbeing': [
    { en: 'mental wellbeing', zh: '心理健康狀態' },
    { en: 'chronic stress', zh: '長期壓力' },
    { en: 'talk openly', zh: '坦白地說出來' },
    { en: 'support system', zh: '支持系統' },
    { en: 'therapy session', zh: '心理諮商' },
    { en: 'self-awareness', zh: '自我覺察' },
    { en: 'emotional regulation', zh: '情緒調節' },
    { en: 'sustainable inner life', zh: '可持續的內在生活' },
  ],
  'Environment & Sustainability': [
    { en: 'climate issue', zh: '氣候議題' },
    { en: 'reduce waste', zh: '減少浪費' },
    { en: 'practical sustainability', zh: '做得到的永續作法' },
    { en: 'eco-anxiety', zh: '對環境的焦慮' },
    { en: 'public transit', zh: '大眾運輸' },
    { en: 'green design', zh: '綠色設計' },
    { en: 'consume less', zh: '少買一點' },
    { en: 'long-term thinking', zh: '長期思考' },
  ],
  'Money & Financial Goals': [
    { en: 'money mindset', zh: '金錢心態' },
    { en: 'financial stress', zh: '財務壓力' },
    { en: 'save intentionally', zh: '有意識地存錢' },
    { en: 'lifestyle creep', zh: '生活水平慢慢膨脹' },
    { en: 'talk about money', zh: '談錢' },
    { en: 'enough for you', zh: '對你來說什麼才算足夠' },
    { en: 'personal priority', zh: '個人優先順序' },
    { en: 'financial clarity', zh: '財務上的清楚感' },
  ],
  'Change & Transitions': [
    { en: 'life transition', zh: '人生轉換期' },
    { en: 'start over', zh: '重新開始' },
    { en: 'let go', zh: '放手' },
    { en: 'in-between stage', zh: '過渡中的階段' },
    { en: 'adapt slowly', zh: '慢慢適應' },
    { en: 'stay grounded', zh: '保持穩定' },
    { en: 'uncertain season', zh: '不確定的時期' },
    { en: 'trust yourself', zh: '相信自己' },
  ],
  'Values & Beliefs': [
    { en: 'core value', zh: '核心價值' },
    { en: 'change your mind', zh: '改變想法' },
    { en: 'live with integrity', zh: '活得表裡一致' },
    { en: 'deep disagreement', zh: '很深的分歧' },
    { en: 'non-negotiable', zh: '不能妥協的原則' },
    { en: 'family influence', zh: '家庭帶來的影響' },
    { en: 'thoughtful conviction', zh: '經過思考的信念' },
    { en: 'keep reflecting', zh: '持續反思' },
  ],
  'The Future': [
    { en: 'possible future', zh: '可能的未來' },
    { en: 'mixed feelings', zh: '複雜的感受' },
    { en: 'future of work', zh: '工作的未來' },
    { en: 'better society', zh: '更好的社會' },
    { en: 'plan flexibly', zh: '保有彈性地規劃' },
    { en: 'small choice today', zh: '今天做的小選擇' },
    { en: 'long-term effect', zh: '長期影響' },
    { en: 'stay adaptable', zh: '保持適應力' },
  ],
  'Looking Back & Moving Forward': [
    { en: 'look back', zh: '回頭看' },
    { en: 'hard-earned lesson', zh: '辛苦換來的教訓' },
    { en: 'turning point', zh: '轉折點' },
    { en: 'mixed feeling', zh: '複雜心情' },
    { en: 'leave it behind', zh: '把它留在身後' },
    { en: 'move forward', zh: '往前走' },
    { en: 'carry the wisdom', zh: '帶著學到的智慧往前走' },
    { en: 'notice the change', zh: '看見那個改變' },
  ],
  'Creativity & Self-Expression': [
    { en: 'creative voice', zh: '創作聲音' },
    { en: 'creative block', zh: '創作卡住' },
    { en: 'make something', zh: '創作出點什麼' },
    { en: 'tell your story', zh: '說出自己的故事' },
    { en: 'express yourself', zh: '表達自己' },
    { en: 'keep experimenting', zh: '繼續嘗試' },
    { en: 'artistic habit', zh: '創作習慣' },
    { en: 'original voice', zh: '獨特的聲音' },
  ],
  'Leadership & Influence': [
    { en: 'lead by example', zh: '以身作則' },
    { en: 'make a decision', zh: '做決定' },
    { en: 'build trust', zh: '建立信任' },
    { en: 'give direction', zh: '給出方向' },
    { en: 'listen well', zh: '好好傾聽' },
    { en: 'influence quietly', zh: '安靜但有力量地影響別人' },
    { en: 'take responsibility', zh: '負起責任' },
    { en: 'support the team', zh: '支持團隊' },
  ],
  'Community & Giving Back': [
    { en: 'volunteer locally', zh: '在在地社區做志工' },
    { en: 'support the community', zh: '支持社群' },
    { en: 'shared responsibility', zh: '共同責任' },
    { en: 'small contribution', zh: '小小的付出' },
    { en: 'social good', zh: '對社會有益的事' },
    { en: 'community care', zh: '社群中的照顧' },
    { en: 'build connection', zh: '建立連結' },
    { en: 'make a difference', zh: '帶來改變' },
  ],
  'Cross-Cultural Understanding': [
    { en: 'cultural norm', zh: '文化常規' },
    { en: 'avoid assumptions', zh: '不要先入為主' },
    { en: 'language barrier', zh: '語言障礙' },
    { en: 'ask respectfully', zh: '有禮貌地詢問' },
    { en: 'different perspective', zh: '不同的角度' },
    { en: 'adapt politely', zh: '有禮貌地適應' },
    { en: 'shared humanity', zh: '共同的人性' },
    { en: 'cultural misunderstanding', zh: '文化誤解' },
  ],
  'Language & Identity': [
    { en: 'native language', zh: '母語' },
    { en: 'second language', zh: '第二語言' },
    { en: 'language barrier', zh: '語言障礙' },
    { en: 'express yourself clearly', zh: '清楚表達自己' },
    { en: 'feel at home', zh: '有家的感覺' },
    { en: 'code-switch', zh: '切換語碼' },
    { en: 'cultural identity', zh: '文化認同' },
    { en: 'accent bias', zh: '對口音的偏見' },
  ],
  'Rest & Renewal': [
    { en: 'take a break', zh: '休息一下' },
    { en: 'recharge fully', zh: '好好充電' },
    { en: 'deep rest', zh: '深度休息' },
    { en: 'slower pace', zh: '慢一點的節奏' },
    { en: 'creative recovery', zh: '恢復創造力' },
    { en: 'day off', zh: '休假日' },
    { en: 'prevent burnout', zh: '避免耗盡自己' },
    { en: 'renew your energy', zh: '重新補回能量' },
  ],
  'Gratitude & Appreciation': [
    { en: 'say thank you', zh: '說謝謝' },
    { en: 'feel grateful', zh: '心懷感謝' },
    { en: 'notice the good', zh: '看見好的地方' },
    { en: 'appreciate small things', zh: '欣賞小事' },
    { en: 'express appreciation', zh: '表達感謝與欣賞' },
    { en: 'gratitude practice', zh: '感恩練習' },
    { en: 'feel taken for granted', zh: '覺得自己的付出被視為理所當然' },
    { en: 'thankful mindset', zh: '帶著感謝的心態' },
  ],
  'Goals & Intentions': [
    { en: 'set an intention', zh: '設定意圖' },
    { en: 'break it down', zh: '把它拆成小步驟' },
    { en: 'stay consistent', zh: '保持穩定' },
    { en: 'change direction', zh: '調整方向' },
    { en: 'realistic goal', zh: '務實的目標' },
    { en: 'track progress', zh: '追蹤進度' },
    { en: 'start small', zh: '從小地方開始' },
    { en: 'keep the focus', zh: '維持焦點' },
  ],
  'Year in Review': [
    { en: 'look back on the year', zh: '回顧這一年' },
    { en: 'biggest lesson', zh: '最大的收穫' },
    { en: 'difficult season', zh: '艱難的一段時期' },
    { en: 'quiet progress', zh: '安靜但真實的進步' },
    { en: 'what changed', zh: '改變了什麼' },
    { en: 'what remains', zh: '留下來的是什麼' },
    { en: 'mark the moment', zh: '記下這個時刻' },
    { en: 'close the year well', zh: '好好收尾這一年' },
  ],
  'New Beginnings': [
    { en: 'new beginning', zh: '新的開始' },
    { en: 'fresh chapter', zh: '新的篇章' },
    { en: 'first step', zh: '第一步' },
    { en: 'turn the page', zh: '翻頁往前' },
    { en: 'let go of the old', zh: '放下舊的東西' },
    { en: 'begin again', zh: '再一次開始' },
    { en: 'set the tone', zh: '定下基調' },
    { en: 'move forward with clarity', zh: '清楚地往前走' },
  ],
}

function unescapeSingle(value) {
  return String(value).replace(/\\\\/g, '\\').replace(/\\'/g, "'")
}

function normalizeApostrophes(value) {
  return String(value || '').replace(/[’`]/g, "'")
}

function stemToken(token) {
  const normalized = normalizeApostrophes(token).toLowerCase()
  if (normalized.endsWith("'s")) return normalized.slice(0, -2)
  if (normalized.endsWith('ies') && normalized.length > 4) return `${normalized.slice(0, -3)}y`
  if (normalized.endsWith('ing') && normalized.length > 5) return normalized.slice(0, -3)
  if (normalized.endsWith('ed') && normalized.length > 4) return normalized.slice(0, -2)
  if (normalized.endsWith('ly') && normalized.length > 4) return normalized.slice(0, -2)
  if (normalized.endsWith('s') && normalized.length > 3) return normalized.slice(0, -1)
  return normalized
}

function tokenize(value) {
  return normalizeApostrophes(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(stemToken)
    .filter(Boolean)
}

function uniqueByEnglish(items) {
  const seenEn = new Set()
  const seenZh = new Set()
  const result = []
  for (const item of items) {
    const enKey = String(item.en || '').toLowerCase()
    const zhKey = String(item.zh || '').trim()
    if (!enKey) continue
    if (seenEn.has(enKey)) continue
    if (zhKey && seenZh.has(zhKey)) continue
    seenEn.add(enKey)
    if (zhKey) seenZh.add(zhKey)
    result.push(item)
  }
  return result
}

function rotate(list, offset) {
  if (!Array.isArray(list) || list.length === 0) return []
  const safeOffset = ((offset % list.length) + list.length) % list.length
  return list.slice(safeOffset).concat(list.slice(0, safeOffset))
}

function buildFocusPhrase(title) {
  const normalized = normalizeApostrophes(title).trim()
  const base = normalized.includes(':')
    ? normalized.split(':').slice(1).join(':').trim()
    : normalized
  return base
    .replace(/^(Why|How to|How|What|Where|When)\s+/i, '')
    .replace(/^(The|A|An)\s+/i, '')
    .trim()
}

function scoreTerm(term, titleTokens) {
  const termTokens = new Set(tokenize(term))
  let score = 0
  for (const token of titleTokens) {
    if (termTokens.has(token)) score += 2
  }
  return score
}

function pickEpisodeTerms(episode) {
  const bank = THEME_TERM_BANKS[episode.theme] || GENERIC_TERM_BANK
  const titleTokens = tokenize(`${episode.title} ${buildFocusPhrase(episode.title)}`)
  const ranked = bank
    .map((item, index) => ({
      item,
      index,
      score: scoreTerm(item.en, titleTokens),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .map((entry) => entry.item)

  const rotated = rotate(bank, episode.dayOfWeek - 1)
  return uniqueByEnglish(ranked.concat(rotated)).slice(0, 8)
}

function parseEpisodeMetadata(rootDir) {
  const episodesDir = path.join(rootDir, 'content', 'episodes')
  const files = fs.readdirSync(episodesDir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()
  const pattern = /\{\s*weekNumber:\s*(\d+),\s*dayOfWeek:\s*(\d+),\s*date:\s*'((?:\\'|[^'])*)',\s*theme:\s*'((?:\\'|[^'])*)',\s*title:\s*'((?:\\'|[^'])*)',\s*phase:\s*'((?:\\'|[^'])*)'/g
  const episodes = []

  for (const fileName of files) {
    const source = fs.readFileSync(path.join(episodesDir, fileName), 'utf8')
    let match
    while ((match = pattern.exec(source)) !== null) {
      episodes.push({
        weekNumber: Number(match[1]),
        dayOfWeek: Number(match[2]),
        date: unescapeSingle(match[3]),
        theme: unescapeSingle(match[4]),
        title: unescapeSingle(match[5]),
        phase: unescapeSingle(match[6]),
      })
    }
  }

  return episodes.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber
    return a.dayOfWeek - b.dayOfWeek
  })
}

module.exports = {
  THEME_TERM_BANKS,
  GENERIC_TERM_BANK,
  buildFocusPhrase,
  parseEpisodeMetadata,
  pickEpisodeTerms,
  rotate,
}

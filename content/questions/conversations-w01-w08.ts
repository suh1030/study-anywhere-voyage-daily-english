export interface ConversationQuestion {
  weekNumber: number
  theme: string
  day: string
  question: string
  chineseHint: string
  structureTip: string
}

export const CONVERSATIONS_W01_W08: ConversationQuestion[] = [
  // W1 — Morning Routines
  {
    weekNumber: 1, theme: 'Morning Routines', day: 'Monday',
    question: 'Describe your morning routine step by step.',
    chineseHint: '描述你早晨的例行公事，按照步驟順序說明。',
    structureTip: 'Use: First, I... / Then I... / After that, I... / Finally, I...',
  },
  {
    weekNumber: 1, theme: 'Morning Routines', day: 'Tuesday',
    question: "What's the first thing you do when you wake up?",
    chineseHint: '你醒來後做的第一件事是什麼？想想為什麼養成了這個習慣。',
    structureTip: 'Use: The first thing I do is... / I always start by... / Right away, I...',
  },
  {
    weekNumber: 1, theme: 'Morning Routines', day: 'Wednesday',
    question: 'Do you prefer a slow morning or a fast one? Why?',
    chineseHint: '你比較喜歡悠閒的早晨還是快節奏的？說說你的理由。',
    structureTip: 'Use: I prefer... because... / The reason I like... is that... / For me, ... works better because...',
  },
  {
    weekNumber: 1, theme: 'Morning Routines', day: 'Thursday',
    question: 'What do you eat or drink in the morning?',
    chineseHint: '描述你的早餐習慣，包括你通常吃什麼、喝什麼。',
    structureTip: 'Use: I usually have... / Most mornings, I grab... / On weekends, I tend to...',
  },
  {
    weekNumber: 1, theme: 'Morning Routines', day: 'Friday',
    question: 'What would your ideal morning look like?',
    chineseHint: '如果沒有時間限制，你的理想早晨會是什麼樣子？',
    structureTip: 'Use: Ideally, I would... / In a perfect world, my morning would... / If I had more time, I would...',
  },

  // W2 — Commuting
  {
    weekNumber: 2, theme: 'Commuting', day: 'Monday',
    question: 'How do you get to work or school?',
    chineseHint: '描述你的交通方式，包括時間和路線。',
    structureTip: 'Use: I take... / It takes me about... / My commute involves...',
  },
  {
    weekNumber: 2, theme: 'Commuting', day: 'Tuesday',
    question: 'What do you do during your commute?',
    chineseHint: '你在通勤途中都做些什麼？聽音樂、看書、還是其他？',
    structureTip: 'Use: During my commute, I usually... / I like to spend the time... / Most of the time, I...',
  },
  {
    weekNumber: 2, theme: 'Commuting', day: 'Wednesday',
    question: 'Describe a memorable commute experience.',
    chineseHint: '回想一次特別的通勤經歷——也許是有趣的、令人沮喪的、或意外的。',
    structureTip: 'Use: One time, ... / I remember when... / There was this one day when...',
  },
  {
    weekNumber: 2, theme: 'Commuting', day: 'Thursday',
    question: 'How does your commute affect your mood?',
    chineseHint: '通勤如何影響你的心情？好的通勤和壞的通勤有什麼不同？',
    structureTip: 'Use: When my commute goes well, I feel... / A bad commute makes me... / My mood depends on...',
  },
  {
    weekNumber: 2, theme: 'Commuting', day: 'Friday',
    question: "What's the best and worst part of commuting?",
    chineseHint: '比較通勤的優點和缺點，各舉一個例子。',
    structureTip: 'Use: The best part is... / On the other hand, the worst part is... / What I enjoy most is... but what I dislike is...',
  },

  // W3 — Home & Living Space
  {
    weekNumber: 3, theme: 'Home & Living Space', day: 'Monday',
    question: 'Describe where you live.',
    chineseHint: '描述你住的地方——位置、類型、大小。',
    structureTip: 'Use: I live in... / It\'s located... / My place is a...',
  },
  {
    weekNumber: 3, theme: 'Home & Living Space', day: 'Tuesday',
    question: 'What does your room or apartment look like?',
    chineseHint: '描述你房間或公寓的佈置和氛圍。',
    structureTip: 'Use: When you walk in, you\'ll see... / The room has... / I\'ve decorated it with...',
  },
  {
    weekNumber: 3, theme: 'Home & Living Space', day: 'Wednesday',
    question: 'What do you like most about your home?',
    chineseHint: '你最喜歡家裡的什麼？可以是一個空間、一種感覺、或一個特點。',
    structureTip: 'Use: What I love most is... / My favorite thing about my home is... / The thing I appreciate the most is...',
  },
  {
    weekNumber: 3, theme: 'Home & Living Space', day: 'Thursday',
    question: 'If you could change one thing about your home, what would it be?',
    chineseHint: '如果你可以改變家裡的一件事，你想改什麼？為什麼？',
    structureTip: 'Use: If I could change one thing, I would... / I wish my home had... / The one thing I\'d love to improve is...',
  },
  {
    weekNumber: 3, theme: 'Home & Living Space', day: 'Friday',
    question: 'Describe your ideal living space.',
    chineseHint: '想像你的夢想住所——它會是什麼樣子？在哪裡？有什麼特色？',
    structureTip: 'Use: My dream home would be... / Ideally, I\'d live in... / I\'ve always wanted a place that...',
  },

  // W4 — Food & Eating Habits
  {
    weekNumber: 4, theme: 'Food & Eating Habits', day: 'Monday',
    question: 'What did you eat today? Describe your meals.',
    chineseHint: '描述你今天吃了什麼，從早餐到最近一餐。',
    structureTip: 'Use: For breakfast, I had... / At lunch, I ate... / My dinner was...',
  },
  {
    weekNumber: 4, theme: 'Food & Eating Habits', day: 'Tuesday',
    question: "What's your favorite food and why?",
    chineseHint: '你最喜歡的食物是什麼？描述它的味道和你喜歡它的原因。',
    structureTip: 'Use: My absolute favorite is... because... / I love it because... / What makes it special is...',
  },
  {
    weekNumber: 4, theme: 'Food & Eating Habits', day: 'Wednesday',
    question: 'Do you cook? Describe a dish you can make.',
    chineseHint: '你會做飯嗎？描述一道你拿手的菜，包括步驟。',
    structureTip: 'Use: First, you need to... / Then you... / The key to this dish is...',
  },
  {
    weekNumber: 4, theme: 'Food & Eating Habits', day: 'Thursday',
    question: 'What foods do you dislike? Why?',
    chineseHint: '有什麼食物是你不喜歡的？描述原因——味道、口感、或其他。',
    structureTip: "Use: I can't stand... because... / I've never been a fan of... / The reason I avoid... is...",
  },
  {
    weekNumber: 4, theme: 'Food & Eating Habits', day: 'Friday',
    question: "Describe a memorable meal you've had.",
    chineseHint: '回想一頓難忘的餐——可能是特別好吃的、有紀念意義的、或意外的。',
    structureTip: 'Use: I remember this one meal... / It was special because... / What made it unforgettable was...',
  },

  // W5 — Weather & Seasons
  {
    weekNumber: 5, theme: 'Weather & Seasons', day: 'Monday',
    question: 'Describe the weather where you live.',
    chineseHint: '描述你居住地的天氣特徵——一年四季有什麼變化？',
    structureTip: 'Use: The weather here is... / In summer, it tends to... / During winter, we usually get...',
  },
  {
    weekNumber: 5, theme: 'Weather & Seasons', day: 'Tuesday',
    question: "What's your favorite season and why?",
    chineseHint: '你最喜歡哪個季節？描述它讓你喜歡的原因。',
    structureTip: 'Use: My favorite season is... because... / I love it when... / What I enjoy most about... is...',
  },
  {
    weekNumber: 5, theme: 'Weather & Seasons', day: 'Wednesday',
    question: 'How does weather affect your mood?',
    chineseHint: '天氣如何影響你的心情和日常活動？',
    structureTip: 'Use: When it\'s sunny, I feel... / Rainy days make me... / I tend to be more... when the weather is...',
  },
  {
    weekNumber: 5, theme: 'Weather & Seasons', day: 'Thursday',
    question: 'Describe a day with extreme weather.',
    chineseHint: '回想一次經歷極端天氣的日子——颱風、暴雨、酷暑等。',
    structureTip: 'Use: I remember this one day when... / The weather was so... that... / It was the most... weather I\'ve ever experienced.',
  },
  {
    weekNumber: 5, theme: 'Weather & Seasons', day: 'Friday',
    question: 'How do you dress for different weather?',
    chineseHint: '你如何根據天氣選擇穿著？有什麼技巧？',
    structureTip: 'Use: When it\'s cold, I usually wear... / In hot weather, I prefer... / My go-to outfit for... is...',
  },

  // W6 — Shopping & Money
  {
    weekNumber: 6, theme: 'Shopping & Money', day: 'Monday',
    question: 'Describe your shopping habits.',
    chineseHint: '你通常多久購物一次？你喜歡怎麼買東西？',
    structureTip: 'Use: I usually shop... / When it comes to shopping, I tend to... / My shopping style is...',
  },
  {
    weekNumber: 6, theme: 'Shopping & Money', day: 'Tuesday',
    question: 'What was the last thing you bought?',
    chineseHint: '你最近買的東西是什麼？描述你為什麼買它。',
    structureTip: 'Use: The last thing I bought was... / I decided to buy it because... / I found it at...',
  },
  {
    weekNumber: 6, theme: 'Shopping & Money', day: 'Wednesday',
    question: 'Do you prefer online or in-store shopping?',
    chineseHint: '你比較喜歡網購還是到實體店面？比較兩者的優缺點。',
    structureTip: 'Use: I prefer... because... / The advantage of... is... / On the other hand, ... has the benefit of...',
  },
  {
    weekNumber: 6, theme: 'Shopping & Money', day: 'Thursday',
    question: 'How do you decide if something is worth buying?',
    chineseHint: '你怎麼判斷一件東西值不值得買？你有什麼標準？',
    structureTip: 'Use: Before buying something, I always... / I ask myself whether... / My rule of thumb is...',
  },
  {
    weekNumber: 6, theme: 'Shopping & Money', day: 'Friday',
    question: "Describe something you've been saving up for.",
    chineseHint: '有什麼東西是你正在存錢想買的？為什麼那麼想要？',
    structureTip: "Use: I've been saving up for... / The reason I want it is... / I plan to buy it by...",
  },

  // W7 — Health & Body
  {
    weekNumber: 7, theme: 'Health & Body', day: 'Monday',
    question: 'How do you take care of your health?',
    chineseHint: '你平常怎麼照顧自己的健康？包括飲食、運動、睡眠等。',
    structureTip: 'Use: To stay healthy, I... / I try to... every day / One thing I do regularly is...',
  },
  {
    weekNumber: 7, theme: 'Health & Body', day: 'Tuesday',
    question: 'Describe your exercise habits.',
    chineseHint: '你有運動的習慣嗎？描述你通常做什麼運動、多久一次。',
    structureTip: 'Use: I exercise... times a week / My routine includes... / I prefer... because...',
  },
  {
    weekNumber: 7, theme: 'Health & Body', day: 'Wednesday',
    question: 'What do you do when you feel sick?',
    chineseHint: '你生病的時候會怎麼做？有什麼自己的療養方式？',
    structureTip: 'Use: When I feel under the weather, I... / The first thing I do is... / I usually recover by...',
  },
  {
    weekNumber: 7, theme: 'Health & Body', day: 'Thursday',
    question: 'How important is sleep to you?',
    chineseHint: '睡眠對你來說有多重要？你通常幾點睡、睡多久？',
    structureTip: 'Use: Sleep is... for me because... / I try to get at least... hours / Without enough sleep, I...',
  },
  {
    weekNumber: 7, theme: 'Health & Body', day: 'Friday',
    question: 'What\'s one healthy habit you want to build?',
    chineseHint: '你想養成什麼健康的好習慣？為什麼選這個？',
    structureTip: "Use: One habit I'd like to build is... / I want to start... because... / I've been meaning to...",
  },

  // W8 — Daily Schedules
  {
    weekNumber: 8, theme: 'Daily Schedules', day: 'Monday',
    question: 'Walk me through a typical weekday.',
    chineseHint: '按照時間順序描述你平日一天的行程。',
    structureTip: 'Use: My day starts at... / By mid-morning, I... / In the evening, I usually...',
  },
  {
    weekNumber: 8, theme: 'Daily Schedules', day: 'Tuesday',
    question: 'How do you organize your time?',
    chineseHint: '你怎麼安排和管理你的時間？用什麼工具或方法？',
    structureTip: 'Use: I organize my time by... / I rely on... to keep track of... / My method for managing time is...',
  },
  {
    weekNumber: 8, theme: 'Daily Schedules', day: 'Wednesday',
    question: "What's the busiest part of your week?",
    chineseHint: '你一週中最忙碌的時段是什麼？為什麼那段時間特別忙？',
    structureTip: 'Use: The busiest time for me is... / Things tend to pile up on... / I\'m usually swamped with...',
  },
  {
    weekNumber: 8, theme: 'Daily Schedules', day: 'Thursday',
    question: 'How do you wind down at the end of the day?',
    chineseHint: '你一天結束後怎麼放鬆？有什麼固定的放鬆方式？',
    structureTip: 'Use: At the end of the day, I like to... / My way of winding down is... / To relax, I usually...',
  },
  {
    weekNumber: 8, theme: 'Daily Schedules', day: 'Friday',
    question: "What's one thing you wish you had more time for?",
    chineseHint: '你希望自己有更多時間做什麼事？為什麼對你很重要？',
    structureTip: "Use: I wish I had more time for... / If I had an extra hour each day, I'd... / The one thing I never have enough time for is...",
  },
]

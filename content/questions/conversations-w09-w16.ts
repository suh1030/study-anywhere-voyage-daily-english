import { ConversationQuestion, expandConversationWeeks } from './conversations-w01-w08'

const RAW_CONVERSATIONS_W09_W16: ConversationQuestion[] = [
  // W9 — Friendships
  {
    weekNumber: 9, theme: 'Friendships', day: 'Monday',
    question: 'How do you make new friends?',
    chineseHint: '你通常怎麼結交新朋友？有什麼讓你覺得有效的方式？',
    structureTip: 'Use: I usually meet people by... / I find it easy/hard to... / One way I\'ve made friends is...',
  },
  {
    weekNumber: 9, theme: 'Friendships', day: 'Tuesday',
    question: 'What do you look for in a good friend?',
    chineseHint: '對你來說，一個好朋友需要具備什麼特質？',
    structureTip: 'Use: For me, a good friend needs to be... / What I value most in a friend is... / I think friendship requires...',
  },
  {
    weekNumber: 9, theme: 'Friendships', day: 'Wednesday',
    question: 'Describe a close friend and what makes your friendship special.',
    chineseHint: '描述一位你很親近的朋友，以及你們的友情為什麼特別。',
    structureTip: 'Use: One of my closest friends is... / What makes our friendship special is... / We met when...',
  },
  {
    weekNumber: 9, theme: 'Friendships', day: 'Thursday',
    question: 'How do you maintain long-distance friendships?',
    chineseHint: '你如何維持和遠方朋友的關係？有什麼方法可以讓距離不成問題？',
    structureTip: 'Use: To stay in touch, I... / We usually connect by... / Even though we\'re far apart, we...',
  },
  {
    weekNumber: 9, theme: 'Friendships', day: 'Friday',
    question: 'Have you ever lost a friendship? What happened?',
    chineseHint: '你曾經失去過一段友誼嗎？是什麼原因造成的？',
    structureTip: 'Use: There was a time when... / We drifted apart because... / Looking back, I think...',
  },

  // W10 — Family
  {
    weekNumber: 10, theme: 'Family', day: 'Monday',
    question: 'Describe your family.',
    chineseHint: '描述你的家庭成員——有誰？你和他們的關係如何？',
    structureTip: 'Use: I come from a... family. / There are... of us. / We are very close/independent because...',
  },
  {
    weekNumber: 10, theme: 'Family', day: 'Tuesday',
    question: 'Who in your family are you closest to, and why?',
    chineseHint: '你和家人中的誰最親近？你們的感情為什麼好？',
    structureTip: 'Use: I\'m closest to my... / We have a special bond because... / We share an interest in...',
  },
  {
    weekNumber: 10, theme: 'Family', day: 'Wednesday',
    question: 'What family traditions do you have?',
    chineseHint: '你們家有什麼特別的傳統或固定的家庭活動？',
    structureTip: 'Use: Every year, we... / One tradition we have is... / My family always...',
  },
  {
    weekNumber: 10, theme: 'Family', day: 'Thursday',
    question: 'How has your family influenced who you are?',
    chineseHint: '你的家庭如何塑造了今天的你？在個性、價值觀或習慣上有什麼影響？',
    structureTip: 'Use: Growing up, I learned from my family that... / My family taught me to... / I think I got my... from...',
  },
  {
    weekNumber: 10, theme: 'Family', day: 'Friday',
    question: 'What do you think makes a family strong?',
    chineseHint: '你認為是什麼讓一個家庭緊密而有力量？',
    structureTip: 'Use: I believe a strong family needs... / What holds a family together is... / In my experience, families are strong when...',
  },

  // W11 — Colleagues & Workplace Relationships
  {
    weekNumber: 11, theme: 'Colleagues & Workplace', day: 'Monday',
    question: 'Describe your relationship with your coworkers.',
    chineseHint: '你和同事的關係如何？是否有特別聊得來的人？',
    structureTip: 'Use: At work, I generally get along with... / Most of my colleagues are... / I\'ve become friends with...',
  },
  {
    weekNumber: 11, theme: 'Colleagues & Workplace', day: 'Tuesday',
    question: 'Have you ever had a difficult coworker? How did you handle it?',
    chineseHint: '你曾經有過難相處的同事嗎？你怎麼應對那個情況？',
    structureTip: 'Use: There was this one colleague who... / I handled it by... / In the end, I realized...',
  },
  {
    weekNumber: 11, theme: 'Colleagues & Workplace', day: 'Wednesday',
    question: 'Do you socialize with coworkers outside of work?',
    chineseHint: '你會和同事在工作以外的時間來往嗎？你覺得這樣的關係重要嗎？',
    structureTip: 'Use: Occasionally, we... / I prefer to keep work and personal life... / I think it\'s important to...',
  },
  {
    weekNumber: 11, theme: 'Colleagues & Workplace', day: 'Thursday',
    question: 'What makes someone a good team player?',
    chineseHint: '你認為什麼樣的特質讓一個人成為好的團隊成員？',
    structureTip: 'Use: A good team player needs to... / I think the most important quality is... / In my experience, teams work well when...',
  },
  {
    weekNumber: 11, theme: 'Colleagues & Workplace', day: 'Friday',
    question: 'Describe a time you worked well with someone you didn\'t know well.',
    chineseHint: '回想一次你和不太熟的人一起合作卻很順利的經驗。',
    structureTip: 'Use: I once worked with... / Even though we didn\'t know each other well, we... / What helped us collaborate was...',
  },

  // W12 — Communication Styles
  {
    weekNumber: 12, theme: 'Communication Styles', day: 'Monday',
    question: 'How would you describe your communication style?',
    chineseHint: '你會怎麼描述自己的溝通風格？是直接的、謹慎的、還是其他？',
    structureTip: 'Use: I\'d say I\'m a... communicator. / I tend to... when talking to others. / People often tell me that I...',
  },
  {
    weekNumber: 12, theme: 'Communication Styles', day: 'Tuesday',
    question: 'Do you prefer written or spoken communication? Why?',
    chineseHint: '你比較喜歡文字溝通還是口頭溝通？說說你的原因。',
    structureTip: 'Use: I prefer... because... / When it comes to important topics, I tend to... / Writing/speaking lets me...',
  },
  {
    weekNumber: 12, theme: 'Communication Styles', day: 'Wednesday',
    question: 'Describe a time when miscommunication caused a problem.',
    chineseHint: '回想一次因為溝通不良而造成問題的經歷。發生了什麼？怎麼解決的？',
    structureTip: 'Use: Once, there was a misunderstanding when... / The problem was that... / We sorted it out by...',
  },
  {
    weekNumber: 12, theme: 'Communication Styles', day: 'Thursday',
    question: 'How do you communicate when you\'re angry or upset?',
    chineseHint: '當你生氣或心情不好時，你如何與別人溝通？',
    structureTip: 'Use: When I\'m upset, I tend to... / I try to avoid... / I\'ve learned that it\'s better to...',
  },
  {
    weekNumber: 12, theme: 'Communication Styles', day: 'Friday',
    question: 'How important is body language in communication?',
    chineseHint: '你認為肢體語言在溝通中有多重要？舉個例子說明。',
    structureTip: 'Use: I think body language is... / For example, when someone... it usually means... / A lot can be said by...',
  },

  // W13 — Conflict & Resolution
  {
    weekNumber: 13, theme: 'Conflict & Resolution', day: 'Monday',
    question: 'How do you typically handle disagreements?',
    chineseHint: '當你和別人意見不同時，你通常怎麼處理？',
    structureTip: 'Use: When I disagree with someone, I usually... / I try to... / I think the key to resolving conflicts is...',
  },
  {
    weekNumber: 13, theme: 'Conflict & Resolution', day: 'Tuesday',
    question: 'Describe a time you resolved a conflict successfully.',
    chineseHint: '回想一次你成功解決衝突的經歷。你是怎麼做到的？',
    structureTip: 'Use: There was a time when... / I solved it by... / What worked was...',
  },
  {
    weekNumber: 13, theme: 'Conflict & Resolution', day: 'Wednesday',
    question: 'Is it ever okay to avoid conflict? When?',
    chineseHint: '有時候迴避衝突是可以的嗎？什麼情況下你會選擇不起衝突？',
    structureTip: 'Use: I think sometimes it\'s better to... / There are situations where... / On the other hand...',
  },
  {
    weekNumber: 13, theme: 'Conflict & Resolution', day: 'Thursday',
    question: 'How do you know when to apologize?',
    chineseHint: '你怎麼判斷什麼時候需要道歉？道歉對你來說容易嗎？',
    structureTip: 'Use: I think an apology is needed when... / For me, apologizing is... / I\'ve learned that a sincere apology...',
  },
  {
    weekNumber: 13, theme: 'Conflict & Resolution', day: 'Friday',
    question: 'What advice would you give someone dealing with a difficult conflict?',
    chineseHint: '如果朋友正在面對一個困難的衝突，你會給他什麼建議？',
    structureTip: 'Use: I\'d tell them to... / The most important thing is... / Based on my own experience...',
  },

  // W14 — Social Situations
  {
    weekNumber: 14, theme: 'Social Situations', day: 'Monday',
    question: 'Are you more of an introvert or extrovert? How does it affect your social life?',
    chineseHint: '你覺得自己比較偏內向還是外向？這如何影響你的社交生活？',
    structureTip: 'Use: I\'d say I\'m more of an... / In social settings, I tend to... / I recharge by...',
  },
  {
    weekNumber: 14, theme: 'Social Situations', day: 'Tuesday',
    question: 'Describe a social situation that made you uncomfortable.',
    chineseHint: '回想一個讓你感到不自在的社交場合。你當時怎麼應對的？',
    structureTip: 'Use: I remember this one time at... / I felt uncomfortable because... / To handle it, I...',
  },
  {
    weekNumber: 14, theme: 'Social Situations', day: 'Wednesday',
    question: 'How do you make small talk with people you\'ve just met?',
    chineseHint: '你怎麼和剛認識的人閒聊？有什麼慣用的話題或開場白？',
    structureTip: 'Use: I usually start by asking about... / A safe topic for small talk is... / I like to break the ice by...',
  },
  {
    weekNumber: 14, theme: 'Social Situations', day: 'Thursday',
    question: 'Do you enjoy parties or large social gatherings? Why or why not?',
    chineseHint: '你喜歡參加派對或大型聚會嗎？說說你的感受和原因。',
    structureTip: 'Use: I generally enjoy/don\'t enjoy... because... / What I like/dislike about large gatherings is... / I feel most comfortable when...',
  },
  {
    weekNumber: 14, theme: 'Social Situations', day: 'Friday',
    question: 'What do you do when you feel left out in a group?',
    chineseHint: '當你在一個群體中感到被孤立時，你會怎麼做？',
    structureTip: 'Use: When I feel left out, I... / I try to... / I\'ve learned that the best approach is...',
  },

  // W15 — Kindness & Empathy
  {
    weekNumber: 15, theme: 'Kindness & Empathy', day: 'Monday',
    question: 'Describe a time someone did something kind for you.',
    chineseHint: '回想一次有人對你做了一件好事——可能很小但很有意義。',
    structureTip: 'Use: I remember once when... / What made it meaningful was... / It made me feel...',
  },
  {
    weekNumber: 15, theme: 'Kindness & Empathy', day: 'Tuesday',
    question: 'Do you consider yourself an empathetic person? Why?',
    chineseHint: '你認為自己是一個有同理心的人嗎？說說你的想法。',
    structureTip: 'Use: I think I am/am not very empathetic because... / I tend to... when others are going through tough times / For me, empathy means...',
  },
  {
    weekNumber: 15, theme: 'Kindness & Empathy', day: 'Wednesday',
    question: 'How do you show someone you care about them?',
    chineseHint: '你怎麼表達對重要的人的關心？有什麼你常做的行動或方式？',
    structureTip: 'Use: I show I care by... / I try to... / In my opinion, actions like... go a long way.',
  },
  {
    weekNumber: 15, theme: 'Kindness & Empathy', day: 'Thursday',
    question: 'Have you ever helped a stranger? What happened?',
    chineseHint: '你曾經幫助過陌生人嗎？描述那個情況和你的感受。',
    structureTip: 'Use: There was this one time when... / I decided to help because... / Afterward, I felt...',
  },
  {
    weekNumber: 15, theme: 'Kindness & Empathy', day: 'Friday',
    question: 'Why is empathy important in everyday life?',
    chineseHint: '你認為同理心在日常生活中為什麼重要？可以從工作、家庭、社會等角度談。',
    structureTip: 'Use: I believe empathy is important because... / Without empathy, people would... / In my experience...',
  },

  // W16 — Trust & Honesty
  {
    weekNumber: 16, theme: 'Trust & Honesty', day: 'Monday',
    question: 'How do you build trust with someone?',
    chineseHint: '你怎麼和別人建立信任？需要什麼條件或時間？',
    structureTip: 'Use: For me, trust is built through... / I think trust develops when... / One thing that helps build trust is...',
  },
  {
    weekNumber: 16, theme: 'Trust & Honesty', day: 'Tuesday',
    question: 'Describe a time when someone broke your trust.',
    chineseHint: '有人曾經讓你失去信任嗎？發生了什麼？你之後怎麼應對？',
    structureTip: 'Use: There was a time when... / What hurt was... / I dealt with it by...',
  },
  {
    weekNumber: 16, theme: 'Trust & Honesty', day: 'Wednesday',
    question: 'Is honesty always the best policy?',
    chineseHint: '「誠實永遠是最好的策略」——你同意這句話嗎？在什麼情況下可能例外？',
    structureTip: 'Use: I think honesty is generally... / However, there are times when... / I believe that...',
  },
  {
    weekNumber: 16, theme: 'Trust & Honesty', day: 'Thursday',
    question: 'Have you ever told a white lie? Was it the right thing to do?',
    chineseHint: '你有過善意的謊言嗎？當時你認為那樣做對嗎？現在回想呢？',
    structureTip: 'Use: Once, I told a white lie when... / I did it because... / Looking back, I think...',
  },
  {
    weekNumber: 16, theme: 'Trust & Honesty', day: 'Friday',
    question: 'What does integrity mean to you in your daily life?',
    chineseHint: '「正直誠信」對你來說代表什麼？在日常生活中，你如何實踐它？',
    structureTip: 'Use: To me, integrity means... / In my daily life, I try to... / I believe that a person with integrity...',
  },
]

export const CONVERSATIONS_W09_W16 = expandConversationWeeks(RAW_CONVERSATIONS_W09_W16)

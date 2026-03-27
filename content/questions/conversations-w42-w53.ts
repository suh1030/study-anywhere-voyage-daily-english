import { ConversationQuestion, expandConversationWeeks } from './conversations-w01-w08'

const RAW_CONVERSATIONS_W42_W53: ConversationQuestion[] = [
  // W42 — The Future
  {
    weekNumber: 42, theme: 'The Future', day: 'Monday',
    question: 'What do you think the world will look like in 2050?',
    chineseHint: '想像 2050 年的世界——科技、氣候、社會結構可能有哪些改變？',
    structureTip: 'Use: By 2050, I think... / I imagine that... / One major change will probably be...',
  },
  {
    weekNumber: 42, theme: 'The Future', day: 'Tuesday',
    question: 'How do you personally prepare for an uncertain future?',
    chineseHint: '面對不確定的未來，你如何在心理上和實際上做好準備？',
    structureTip: 'Use: To prepare for uncertainty, I try to... / One thing I do is... / I believe that...',
  },
  {
    weekNumber: 42, theme: 'The Future', day: 'Wednesday',
    question: 'What emerging technology excites or worries you most?',
    chineseHint: '哪項新興科技讓你感到興奮或擔憂？說說你的理由。',
    structureTip: 'Use: The technology that excites me most is... / What worries me is... / On one hand... but on the other hand...',
  },
  {
    weekNumber: 42, theme: 'The Future', day: 'Thursday',
    question: "What does 'a good future' look like to you personally?",
    chineseHint: '對你個人而言，「美好的未來」是什麼樣子？描述你理想的生活狀態。',
    structureTip: 'Use: To me, a good future means... / I hope that in the future... / My vision of a fulfilling life includes...',
  },
  {
    weekNumber: 42, theme: 'The Future', day: 'Friday',
    question: 'How do you want to be remembered when you are gone?',
    chineseHint: '當你離開這個世界，你希望被人如何記住？你最想留下什麼？',
    structureTip: 'Use: I want to be remembered as someone who... / The most important legacy I want to leave is... / I hope people will say...',
  },

  // W43 — Looking Back & Moving Forward
  {
    weekNumber: 43, theme: 'Looking Back & Moving Forward', day: 'Monday',
    question: 'What has been the most important lesson you have learned in life so far?',
    chineseHint: '回顧你的人生，哪個教訓最重要？是透過什麼經歷學到的？',
    structureTip: 'Use: The most important lesson I have learned is... / I discovered this when... / Looking back, I realize that...',
  },
  {
    weekNumber: 43, theme: 'Looking Back & Moving Forward', day: 'Tuesday',
    question: 'Is there a past version of yourself you are proud of? Why?',
    chineseHint: '你曾經歷過某個讓你感到驕傲的人生階段嗎？那時的你有什麼特質？',
    structureTip: 'Use: I am proud of the person I was when... / During that time, I... / What made that version of me special was...',
  },
  {
    weekNumber: 43, theme: 'Looking Back & Moving Forward', day: 'Wednesday',
    question: 'What is something you regret not doing sooner?',
    chineseHint: '有什麼事你希望自己早點去做？那會如何改變你的人生？',
    structureTip: 'Use: I wish I had started... / If I could go back, I would have... / I regret waiting so long to...',
  },
  {
    weekNumber: 43, theme: 'Looking Back & Moving Forward', day: 'Thursday',
    question: 'How have your values or priorities changed over the years?',
    chineseHint: '你的人生價值觀和優先順序這些年來有哪些改變？是什麼促成了這些轉變？',
    structureTip: 'Use: When I was younger, I used to prioritize... / Now I realize that... / What changed my perspective was...',
  },
  {
    weekNumber: 43, theme: 'Looking Back & Moving Forward', day: 'Friday',
    question: 'What is one thing you want to do differently going forward?',
    chineseHint: '從現在開始，你想要改變或做得不一樣的一件事是什麼？',
    structureTip: 'Use: Going forward, I want to... / One change I am committed to making is... / I have decided to start...',
  },

  // W44 — Creativity & Self-Expression
  {
    weekNumber: 44, theme: 'Creativity & Self-Expression', day: 'Monday',
    question: 'How do you express yourself creatively in everyday life?',
    chineseHint: '在日常生活中，你如何用創意表達自己？可以是藝術、寫作、烹飪或任何形式。',
    structureTip: 'Use: One way I express myself is through... / Creativity shows up in my life when I... / I feel most creative when...',
  },
  {
    weekNumber: 44, theme: 'Creativity & Self-Expression', day: 'Tuesday',
    question: 'Have you ever created something you were really proud of? What was it?',
    chineseHint: '你曾經創作過讓你非常驕傲的東西嗎？描述它，以及它對你的意義。',
    structureTip: 'Use: I once created... / I was proud of it because... / The process of making it taught me...',
  },
  {
    weekNumber: 44, theme: 'Creativity & Self-Expression', day: 'Wednesday',
    question: 'What blocks your creativity, and how do you overcome it?',
    chineseHint: '什麼會阻礙你的創意？你如何克服這些障礙？',
    structureTip: 'Use: My biggest creative block is... / When I feel stuck, I try to... / What usually helps me is...',
  },
  {
    weekNumber: 44, theme: 'Creativity & Self-Expression', day: 'Thursday',
    question: 'Do you think everyone is creative, or is it a special talent? Why?',
    chineseHint: '你認為每個人都有創造力，還是這是一種特殊才能？說說你的觀點。',
    structureTip: 'Use: I believe that creativity is... / In my opinion, everyone... / The difference between creative and non-creative people is...',
  },
  {
    weekNumber: 44, theme: 'Creativity & Self-Expression', day: 'Friday',
    question: 'If you could learn any creative skill, what would it be and why?',
    chineseHint: '如果可以學習任何創意技能，你會選擇什麼？為什麼這個技能吸引你？',
    structureTip: 'Use: If I could learn any creative skill, it would be... / I am drawn to this because... / I imagine that learning it would...',
  },

  // W45 — Leadership & Influence
  {
    weekNumber: 45, theme: 'Leadership & Influence', day: 'Monday',
    question: 'Describe a leader who has inspired you. What made them effective?',
    chineseHint: '描述一位曾啟發你的領導者，是什麼讓他們如此有效？',
    structureTip: 'Use: One leader who has inspired me is... / What made them effective was... / I learned from them that...',
  },
  {
    weekNumber: 45, theme: 'Leadership & Influence', day: 'Tuesday',
    question: 'Have you ever been in a leadership role? What was it like?',
    chineseHint: '你曾擔任過領導角色嗎？那段經歷是什麼感覺？有哪些挑戰？',
    structureTip: 'Use: I once led... / The most challenging part was... / What I discovered about leadership was...',
  },
  {
    weekNumber: 45, theme: 'Leadership & Influence', day: 'Wednesday',
    question: "What is the difference between a leader and a boss, in your opinion?",
    chineseHint: '在你看來，「領導者」和「老闆」有什麼不同？',
    structureTip: 'Use: In my opinion, a leader... whereas a boss... / The key difference is... / I think what separates the two is...',
  },
  {
    weekNumber: 45, theme: 'Leadership & Influence', day: 'Thursday',
    question: 'How do you influence others without having formal authority?',
    chineseHint: '當你沒有正式的職位或權力時，你如何影響他人？',
    structureTip: 'Use: One way I influence others is by... / Without formal authority, I try to... / People tend to follow when you...',
  },
  {
    weekNumber: 45, theme: 'Leadership & Influence', day: 'Friday',
    question: 'What kind of leader do you want to be, or become?',
    chineseHint: '你希望成為什麼樣的領導者？你需要發展哪些特質？',
    structureTip: 'Use: The kind of leader I want to be is... / I am working on developing... / To become that person, I need to...',
  },

  // W46 — Community & Giving Back
  {
    weekNumber: 46, theme: 'Community & Giving Back', day: 'Monday',
    question: 'What community do you feel most connected to, and why?',
    chineseHint: '你最有歸屬感的是哪個社群？是什麼讓你與它連結？',
    structureTip: 'Use: The community I feel most connected to is... / What makes me feel part of it is... / I value this community because...',
  },
  {
    weekNumber: 46, theme: 'Community & Giving Back', day: 'Tuesday',
    question: 'Have you ever volunteered or helped your community? What did you do?',
    chineseHint: '你曾志願服務或幫助過社區嗎？描述那段經歷。',
    structureTip: 'Use: I once volunteered to... / The experience taught me... / What I enjoyed most was...',
  },
  {
    weekNumber: 46, theme: 'Community & Giving Back', day: 'Wednesday',
    question: 'Why do you think some people give back while others do not?',
    chineseHint: '你認為為什麼有些人熱心回饋社會，而有些人沒有？是什麼因素影響了這種差異？',
    structureTip: 'Use: I think people give back when they feel... / One reason some people do not is... / From my observation...',
  },
  {
    weekNumber: 46, theme: 'Community & Giving Back', day: 'Thursday',
    question: 'If you had more time or resources, how would you give back?',
    chineseHint: '如果你有更多時間或資源，你會如何回饋社會？有什麼你特別想做的事？',
    structureTip: 'Use: If I had more time, I would... / One cause I care deeply about is... / I would love to contribute to...',
  },
  {
    weekNumber: 46, theme: 'Community & Giving Back', day: 'Friday',
    question: 'What small act of kindness can make a big difference in someone\'s day?',
    chineseHint: '哪些小小的善意行為可能對他人的一天產生重大影響？分享一個你做過或接受過的例子。',
    structureTip: 'Use: A small act that can make a big difference is... / I once experienced... / Something as simple as...',
  },

  // W47 — Cross-Cultural Understanding
  {
    weekNumber: 47, theme: 'Cross-Cultural Understanding', day: 'Monday',
    question: 'How has interacting with people from other cultures changed your perspective?',
    chineseHint: '與來自不同文化的人互動，如何改變了你的觀點或想法？',
    structureTip: 'Use: Meeting people from different cultures has taught me... / One thing that surprised me was... / My perspective shifted when...',
  },
  {
    weekNumber: 47, theme: 'Cross-Cultural Understanding', day: 'Tuesday',
    question: 'What is a cultural difference that you find fascinating?',
    chineseHint: '有哪個文化差異讓你覺得很有趣？描述這個差異以及它背後可能的原因。',
    structureTip: 'Use: One cultural difference I find fascinating is... / This is interesting because... / It might exist because...',
  },
  {
    weekNumber: 47, theme: 'Cross-Cultural Understanding', day: 'Wednesday',
    question: 'Have you ever experienced a cultural misunderstanding? What happened?',
    chineseHint: '你曾經歷過文化誤解嗎？描述那次事件以及你從中學到什麼。',
    structureTip: 'Use: I once had a cultural misunderstanding when... / The problem was that... / After the situation, I learned...',
  },
  {
    weekNumber: 47, theme: 'Cross-Cultural Understanding', day: 'Thursday',
    question: 'What do you think is universally shared across all human cultures?',
    chineseHint: '你認為哪些事物是所有人類文化共通的？',
    structureTip: 'Use: I believe all cultures share... / One universal human value seems to be... / Despite our differences, we all...',
  },
  {
    weekNumber: 47, theme: 'Cross-Cultural Understanding', day: 'Friday',
    question: 'How can we learn to appreciate cultural differences rather than judge them?',
    chineseHint: '我們如何培養欣賞文化差異的能力，而不是評判它？',
    structureTip: 'Use: One way to appreciate differences is to... / We can avoid judgment by... / I think the key is to approach other cultures with...',
  },

  // W48 — Language & Identity
  {
    weekNumber: 48, theme: 'Language & Identity', day: 'Monday',
    question: 'Does speaking a different language change how you think or feel?',
    chineseHint: '說不同的語言時，你的思考方式或感受有所不同嗎？',
    structureTip: 'Use: When I speak... I tend to feel more... / In my native language... but in English... / I notice that...',
  },
  {
    weekNumber: 48, theme: 'Language & Identity', day: 'Tuesday',
    question: 'What parts of your personality come through best in your native language?',
    chineseHint: '你的哪些個性在用母語表達時最能展現出來？在英語中較難表達的是什麼？',
    structureTip: 'Use: In my native language, I can best express... / Something that is hard to translate is... / My sense of humor comes across better in...',
  },
  {
    weekNumber: 48, theme: 'Language & Identity', day: 'Wednesday',
    question: 'How has learning English shaped your identity?',
    chineseHint: '學習英語如何影響或塑造了你的身份認同？',
    structureTip: 'Use: Learning English has made me more... / It has opened doors to... / I think of myself differently now because...',
  },
  {
    weekNumber: 48, theme: 'Language & Identity', day: 'Thursday',
    question: 'Is there a word in your language that has no direct English translation? What does it mean?',
    chineseHint: '你的語言中有沒有無法直接翻譯成英文的詞？描述它的意思。',
    structureTip: 'Use: A word in my language that has no direct English translation is... / It roughly means... / We use it when...',
  },
  {
    weekNumber: 48, theme: 'Language & Identity', day: 'Friday',
    question: 'Do you think being bilingual gives you an advantage? In what way?',
    chineseHint: '你認為能說兩種語言有優勢嗎？是哪方面的優勢？',
    structureTip: 'Use: Being bilingual gives me an advantage in... / I can... which monolinguals cannot / One unexpected benefit has been...',
  },

  // W49 — Rest & Renewal
  {
    weekNumber: 49, theme: 'Rest & Renewal', day: 'Monday',
    question: 'How do you know when you truly need to rest?',
    chineseHint: '你如何察覺自己真正需要休息了？身體或心理會發出什麼信號？',
    structureTip: 'Use: I know I need to rest when... / The signs for me are... / My body tells me that...',
  },
  {
    weekNumber: 49, theme: 'Rest & Renewal', day: 'Tuesday',
    question: 'What activities make you feel genuinely restored and energized?',
    chineseHint: '哪些活動讓你感到真正恢復活力和精力充沛？',
    structureTip: 'Use: After doing..., I always feel restored / What recharges me most is... / Unlike... which drains me, ... gives me energy',
  },
  {
    weekNumber: 49, theme: 'Rest & Renewal', day: 'Wednesday',
    question: 'Do you feel guilty when you take time to rest? Why or why not?',
    chineseHint: '當你花時間休息時，你會感到內疚嗎？為什麼？',
    structureTip: 'Use: When I rest, I sometimes feel... / I think this guilt comes from... / I am working on accepting that...',
  },
  {
    weekNumber: 49, theme: 'Rest & Renewal', day: 'Thursday',
    question: 'How has your relationship with rest changed over the years?',
    chineseHint: '你與休息的關係這些年來有什麼改變？你對休息的看法不一樣了嗎？',
    structureTip: 'Use: When I was younger, I used to think rest was... / Now I understand that... / My attitude shifted when...',
  },
  {
    weekNumber: 49, theme: 'Rest & Renewal', day: 'Friday',
    question: 'What does an ideal rest day look like for you?',
    chineseHint: '你理想的休息日是什麼樣子？描述你希望那天如何度過。',
    structureTip: 'Use: On an ideal rest day, I would start by... / Throughout the day, I would... / By the end, I would feel...',
  },

  // W50 — Gratitude & Appreciation
  {
    weekNumber: 50, theme: 'Gratitude & Appreciation', day: 'Monday',
    question: 'What are three things you are deeply grateful for right now?',
    chineseHint: '此刻你最深感謝的三件事是什麼？說說每件事對你的意義。',
    structureTip: 'Use: First, I am grateful for... because... / Another thing is... / And finally, I appreciate...',
  },
  {
    weekNumber: 50, theme: 'Gratitude & Appreciation', day: 'Tuesday',
    question: 'How do you express gratitude to the people who matter to you?',
    chineseHint: '你如何向對你重要的人表達感謝？你覺得表達感謝容易嗎？',
    structureTip: 'Use: One way I show gratitude is by... / I find it easy/difficult to express gratitude because... / I try to...',
  },
  {
    weekNumber: 50, theme: 'Gratitude & Appreciation', day: 'Wednesday',
    question: 'Has a difficult experience ever taught you to be more grateful? What happened?',
    chineseHint: '有沒有一段困難的經歷讓你學會了更加感恩？發生了什麼事？',
    structureTip: 'Use: I became more grateful after... / Going through that experience taught me... / Before that, I took for granted...',
  },
  {
    weekNumber: 50, theme: 'Gratitude & Appreciation', day: 'Thursday',
    question: 'What everyday thing do most people overlook but you truly appreciate?',
    chineseHint: '哪些日常小事是大多數人不以為然，但你真心珍視的？',
    structureTip: 'Use: Something most people overlook is... / I genuinely appreciate... because... / Once you notice..., you realize...',
  },
  {
    weekNumber: 50, theme: 'Gratitude & Appreciation', day: 'Friday',
    question: 'How does practicing gratitude affect your mood and outlook?',
    chineseHint: '練習感恩如何影響你的情緒和對生活的看法？',
    structureTip: 'Use: When I focus on gratitude, I notice that... / It helps me to... / The difference in my mindset is...',
  },

  // W51 — Goals & Intentions
  {
    weekNumber: 51, theme: 'Goals & Intentions', day: 'Monday',
    question: 'What is a goal you have been working toward for a long time?',
    chineseHint: '你正在努力實現的一個長期目標是什麼？你已經為此付出了多少？',
    structureTip: 'Use: One long-term goal I have been working toward is... / So far, I have... / The biggest challenge has been...',
  },
  {
    weekNumber: 51, theme: 'Goals & Intentions', day: 'Tuesday',
    question: 'How do you stay motivated when progress feels slow?',
    chineseHint: '當進展感覺緩慢時，你如何保持動力？你有什麼具體的策略？',
    structureTip: 'Use: When I feel demotivated, I try to... / One strategy that works for me is... / I remind myself that...',
  },
  {
    weekNumber: 51, theme: 'Goals & Intentions', day: 'Wednesday',
    question: 'What is the difference between a goal and an intention?',
    chineseHint: '「目標」和「意圖」有什麼不同？你在生活中是如何區別使用它們的？',
    structureTip: 'Use: I think a goal is... while an intention is... / The difference lies in... / For example, a goal might be... but an intention would be...',
  },
  {
    weekNumber: 51, theme: 'Goals & Intentions', day: 'Thursday',
    question: 'Have you ever abandoned a goal? Was that the right decision?',
    chineseHint: '你曾放棄過某個目標嗎？你認為那是正確的決定嗎？',
    structureTip: 'Use: I once abandoned the goal of... / I decided to let it go because... / Looking back, I think that decision was...',
  },
  {
    weekNumber: 51, theme: 'Goals & Intentions', day: 'Friday',
    question: 'What intention do you want to set for the year ahead?',
    chineseHint: '對於即將到來的一年，你想為自己設定什麼樣的意圖或方向？',
    structureTip: 'Use: For the year ahead, my intention is to... / I want to focus more on... / The kind of person I want to be is...',
  },

  // W52 — Year in Review
  {
    weekNumber: 52, theme: 'Year in Review', day: 'Monday',
    question: 'What was the highlight of your year?',
    chineseHint: '這一年中最精彩或最值得紀念的時刻是什麼？',
    structureTip: 'Use: The highlight of my year was... / It stands out because... / Looking back, that moment made me feel...',
  },
  {
    weekNumber: 52, theme: 'Year in Review', day: 'Tuesday',
    question: 'What was the biggest challenge you faced this year, and how did you handle it?',
    chineseHint: '這一年你面對的最大挑戰是什麼？你是怎麼應對的？',
    structureTip: 'Use: The biggest challenge I faced was... / I dealt with it by... / What I learned from this experience was...',
  },
  {
    weekNumber: 52, theme: 'Year in Review', day: 'Wednesday',
    question: 'How have you grown or changed over the past year?',
    chineseHint: '過去這一年，你在哪些方面有成長或改變？',
    structureTip: 'Use: Over the past year, I have grown in... / One major change is that I now... / I am not the same person I was a year ago because...',
  },
  {
    weekNumber: 52, theme: 'Year in Review', day: 'Thursday',
    question: 'What is something you wish you had done differently this year?',
    chineseHint: '這一年有什麼事你希望當初做法不同？你從中學到了什麼？',
    structureTip: 'Use: Looking back, I wish I had... / If I could do it over, I would... / The lesson I take from this is...',
  },
  {
    weekNumber: 52, theme: 'Year in Review', day: 'Friday',
    question: 'What are you most proud of accomplishing this year?',
    chineseHint: '這一年你最自豪的成就是什麼？是什麼讓它如此有意義？',
    structureTip: 'Use: I am most proud of... / What makes this accomplishment meaningful is... / It took a lot of... to achieve this',
  },

  // W53 — New Beginnings
  {
    weekNumber: 53, theme: 'New Beginnings', day: 'Monday',
    question: 'Describe a time when you started something completely new. How did it feel?',
    chineseHint: '描述一次你從頭開始某件全新事物的經歷。那是什麼感覺？',
    structureTip: 'Use: I remember when I first started... / At the beginning, I felt... / The hardest part of starting was...',
  },
  {
    weekNumber: 53, theme: 'New Beginnings', day: 'Tuesday',
    question: 'What makes it hard to leave the old behind and embrace something new?',
    chineseHint: '是什麼讓人難以放下舊的事物、擁抱全新的開始？',
    structureTip: 'Use: One reason it is hard to let go is... / People often resist change because... / For me, the hardest part is...',
  },
  {
    weekNumber: 53, theme: 'New Beginnings', day: 'Wednesday',
    question: 'How do you approach new beginnings — with excitement, anxiety, or both?',
    chineseHint: '面對新的開始，你通常是充滿興奮、感到焦慮，還是兩者都有？',
    structureTip: 'Use: I usually approach new beginnings with... / Part of me feels... but another part... / My reaction tends to depend on...',
  },
  {
    weekNumber: 53, theme: 'New Beginnings', day: 'Thursday',
    question: 'What new beginning are you looking forward to most right now?',
    chineseHint: '目前你最期待的新開始是什麼？你對它有什麼期望？',
    structureTip: 'Use: The new beginning I am most looking forward to is... / I am excited because... / I hope that this will lead to...',
  },
  {
    weekNumber: 53, theme: 'New Beginnings', day: 'Friday',
    question: 'If you could give advice to someone standing at the start of a new chapter, what would you say?',
    chineseHint: '如果你可以給一個站在新篇章起點的人一些建議，你會說什麼？',
    structureTip: 'Use: My advice would be to... / The most important thing is... / I would tell them that...',
  },
]

export const CONVERSATIONS_W42_W53 = expandConversationWeeks(RAW_CONVERSATIONS_W42_W53)

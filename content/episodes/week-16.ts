import { Episode } from '../../app/src/data/episode-sample'

export const WEEK_16: Episode[] = [
  {
  weekNumber: 16,
  dayOfWeek: 1,
  date: '2026-04-13',
  theme: 'Communication Styles',
  title: 'How We Talk: Different Ways of Communicating',
  phase: 'p2',
  parts: [
    {
      title: 'Direct vs. Indirect Communication',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: 'Have you noticed how some people just say exactly what they mean?', zh: '你有沒有注意到，有些人就是直接說出他們的意思？' },
        { speaker: 'b', speakerName: 'Tom', en: 'Absolutely. I grew up in a family where you said things straight. No beating around the bush.', zh: '當然。我在一個直接說話的家庭長大，沒有拐彎抹角。', vocab: [{ word: 'beating around the bush', def: 'avoiding saying something directly' }] },
        { speaker: 'a', speakerName: 'Lily', en: 'But that can feel blunt to people who prefer a softer approach.', zh: '但對那些喜歡溫和方式的人來說，這可能感覺很直白。', vocab: [{ word: 'blunt', def: 'saying things too directly without being polite' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'True. Indirect communication has its own logic. It protects feelings and preserves relationships.', zh: '確實。間接溝通有它自己的邏輯，它保護感情、維護關係。' },
        { speaker: 'a', speakerName: 'Lily', en: 'I think the challenge is that misunderstandings happen when the styles don\'t match.', zh: '我認為挑戰在於，當溝通風格不相符時，誤解就會發生。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Exactly. A direct person might seem rude to an indirect person, and vice versa.', zh: '正是。對間接溝通者來說，直接的人可能看起來很粗魯，反之亦然。' },
        { speaker: 'a', speakerName: 'Lily', en: 'So we need to read the room and adjust how we speak.', zh: '所以我們需要察言觀色，調整我們說話的方式。', vocab: [{ word: 'read the room', def: 'understand the mood or expectations of others' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'That\'s a skill not everyone learns, but it makes such a difference.', zh: '這是一種並非每個人都學會的技能，但它真的很重要。' },
      ]
    },
    {
      title: 'Listening as Communication',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: 'We talk so much about speaking, but listening might be even more important.', zh: '我們談了很多關於說話的事，但傾聽可能更重要。' },
        { speaker: 'b', speakerName: 'Tom', en: 'I agree completely. Active listening shows the other person you actually care.', zh: '我完全同意。積極傾聽顯示你真的在乎對方。', vocab: [{ word: 'active listening', def: 'fully concentrating on what someone is saying' }] },
        { speaker: 'a', speakerName: 'Lily', en: 'But a lot of people listen to respond, not to understand.', zh: '但很多人傾聽是為了回應，而不是為了理解。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Right. While the other person is talking, they\'re already forming their reply in their head.', zh: '是的。在對方說話的時候，他們已經在腦子裡組織回應了。' },
        { speaker: 'a', speakerName: 'Lily', en: 'What helps you listen better in conversations?', zh: '什麼能幫助你在對話中更好地傾聽？' },
        { speaker: 'b', speakerName: 'Tom', en: 'I try to maintain eye contact and avoid checking my phone. Just being present helps a lot.', zh: '我盡量保持眼神接觸，避免查手機。只是專注當下就很有幫助。' },
        { speaker: 'a', speakerName: 'Lily', en: 'I also try to ask follow-up questions. It shows I\'m engaged with what they\'re saying.', zh: '我也會問後續問題，這表明我在認真聽他們說的話。', vocab: [{ word: 'follow-up questions', def: 'questions that dig deeper into what was just said' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'That makes people feel valued. And then they open up more freely.', zh: '這讓人們感到被重視，然後他們會更自由地敞開心扉。' },
      ]
    },
    {
      title: 'Nonverbal Communication',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: 'Words are only part of communication. What about body language?', zh: '言語只是溝通的一部分，肢體語言又如何呢？' },
        { speaker: 'b', speakerName: 'Tom', en: 'Huge factor. Studies say most communication is actually nonverbal.', zh: '非常重要。研究說大部分溝通實際上是非語言的。', vocab: [{ word: 'nonverbal', def: 'not using words; using body language or gestures' }] },
        { speaker: 'a', speakerName: 'Lily', en: 'Your posture, your facial expressions, even how fast you speak all send signals.', zh: '你的姿勢、面部表情，甚至說話速度都在傳遞信號。' },
        { speaker: 'b', speakerName: 'Tom', en: 'I notice crossed arms immediately. It usually means someone is closed off or defensive.', zh: '我立刻注意到交叉的手臂，這通常意味著某人封閉或有防禦性。', vocab: [{ word: 'closed off', def: 'not open to conversation or new ideas' }] },
        { speaker: 'a', speakerName: 'Lily', en: 'Or cold! Sometimes people cross their arms because they\'re literally chilly.', zh: '或者很冷！有時候人們交叉手臂只是因為他們真的感覺冷。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Ha, that\'s a good reminder not to over-read every signal.', zh: '哈，這提醒我們不要過度解讀每個信號。' },
        { speaker: 'a', speakerName: 'Lily', en: 'Context is everything. You have to look at the whole picture.', zh: '背景很重要，你必須看整體情況。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Exactly. One signal alone doesn\'t tell you much. It\'s the pattern that matters.', zh: '正是。單一信號本身說明不了什麼，重要的是模式。' },
      ]
    },
    {
      title: 'Communication at Work',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: 'Work communication can be tricky because of hierarchy and different roles.', zh: '職場溝通可能很棘手，因為有層級關係和不同的角色。', vocab: [{ word: 'hierarchy', def: 'a system where people or things are ranked above each other' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'Definitely. The way you talk to your boss versus a colleague is very different.', zh: '確實。你對老闆說話的方式和對同事說話的方式非常不同。' },
        { speaker: 'a', speakerName: 'Lily', en: 'And then emails, chats, video calls — each format has its own rules.', zh: '還有電子郵件、即時通訊、視訊會議——每種格式都有自己的規則。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Email is still formal in a lot of companies. You can\'t just write the way you text.', zh: '在很多公司，電子郵件仍然是正式的，你不能像發短信一樣寫。' },
        { speaker: 'a', speakerName: 'Lily', en: 'But instant messaging has made things more casual. The lines are getting blurry.', zh: '但即時通訊讓事情變得更隨意，界限越來越模糊。', vocab: [{ word: 'blurry', def: 'not clear or distinct' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'I think the key is to match the tone of whoever you\'re talking to.', zh: '我認為關鍵是配合你交談對象的語氣。' },
        { speaker: 'a', speakerName: 'Lily', en: 'Good point. If your manager uses formal language, mirror that style.', zh: '說得好。如果你的主管使用正式語言，就模仿那種風格。', vocab: [{ word: 'mirror', def: 'to copy or reflect someone\'s style or behavior' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'It signals respect and awareness. People notice when you do it well.', zh: '這表示尊重和意識。當你做得好的時候，人們會注意到。' },
      ]
    },
    {
      title: 'Finding Your Voice',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: 'Beyond styles and formats, I think the bigger journey is finding your own voice.', zh: '超越風格和格式，我認為更大的旅程是找到自己的聲音。', vocab: [{ word: 'finding your voice', def: 'learning to express yourself clearly and confidently' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'What does that mean to you?', zh: '這對你意味著什麼？' },
        { speaker: 'a', speakerName: 'Lily', en: 'Speaking in a way that feels authentic — not performing, not hiding.', zh: '以感覺真實的方式說話——不是表演，也不是隱藏。', vocab: [{ word: 'authentic', def: 'genuine, true to who you are' }] },
        { speaker: 'b', speakerName: 'Tom', en: 'That takes confidence. A lot of people stay quiet because they\'re afraid of judgment.', zh: '這需要自信。很多人保持沉默是因為他們害怕被評判。' },
        { speaker: 'a', speakerName: 'Lily', en: 'I was like that. I used to rehearse what I\'d say before every meeting.', zh: '我曾經是那樣的，我以前在每次會議前都要排練我要說的話。' },
        { speaker: 'b', speakerName: 'Tom', en: 'That\'s not necessarily bad. Preparation builds confidence over time.', zh: '那不一定是壞事，準備會逐漸建立自信。' },
        { speaker: 'a', speakerName: 'Lily', en: 'True, and the more you speak up, the more natural it feels.', zh: '確實，你越是發言，感覺就越自然。' },
        { speaker: 'b', speakerName: 'Tom', en: 'Communication is really a lifelong practice. There\'s always something new to learn.', zh: '溝通真的是一生的練習，總是有新的東西可以學習。' },
      ]
    }
  ],
  keyPhrases: [
    { en: 'beat around the bush', zh: '拐彎抹角', example: 'Don\'t beat around the bush — just tell me what you think.' },
    { en: 'read the room', zh: '察言觀色', example: 'She read the room and kept her comments brief.' },
    { en: 'active listening', zh: '積極傾聽', example: 'Active listening means focusing fully on the speaker.' },
    { en: 'follow-up question', zh: '追問', example: 'He asked a good follow-up question after her presentation.' },
    { en: 'body language', zh: '肢體語言', example: 'Her body language showed she was uncomfortable.' },
    { en: 'nonverbal cues', zh: '非語言線索', example: 'Pay attention to nonverbal cues in conversations.' },
    { en: 'match the tone', zh: '配合語氣', example: 'Try to match the tone of whoever you\'re speaking with.' },
    { en: 'find your voice', zh: '找到自己的聲音', example: 'It took years of practice for her to find her voice.' },
    { en: 'authentic communication', zh: '真實的溝通', example: 'Authentic communication builds stronger relationships.' },
    { en: 'closed off', zh: '封閉的', example: 'He seemed closed off to new ideas in the meeting.' },
  ]
  },

  // Day 2
  {
  weekNumber: 16,
  dayOfWeek: 2,
  date: '2026-04-14',
  theme: 'Communication Styles',
  title: 'Direct and Indirect Communication',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — Two Very Different Instincts',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "Do you naturally communicate directly or indirectly?", zh: '你天生比較偏向直接溝通，還是間接溝通？' },
        { speaker: 'b', speakerName: 'Tom', en: "Pretty directly. I usually feel that clarity is kinder than guessing.", zh: '算滿直接的。我通常覺得，比起讓人猜來猜去，清楚一點反而更善良。', vocab: [{ word: 'clarity', def: '清楚明白' }] },
        { speaker: 'a', speakerName: 'Lily', en: "I understand that, but I also think indirect communication can be thoughtful rather than dishonest.", zh: '我理解這一點，但我也覺得間接溝通有時候是體貼，不是不誠實。', vocab: [{ word: 'thoughtful', def: '體貼周到的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Right. Sometimes people soften things because they want to preserve the relationship, not because they're hiding the truth.", zh: '對。有時候人把話說柔一點，是因為他想保護關係，不是因為他在逃避真相。', vocab: [{ word: 'preserve the relationship', def: '維護關係' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Directness values explicitness. Indirectness often values harmony.", zh: '正是。直接溝通重視明說，間接溝通常常重視和諧。', vocab: [{ word: 'explicitness', def: '明說、明確表達' }] },
        { speaker: 'b', speakerName: 'Tom', en: "The trouble starts when each side thinks its own style is the only honest one.", zh: '真正麻煩的地方，是兩邊都以為自己的風格才是唯一誠實的方式。', vocab: [{ word: 'honest one', def: '唯一正確或誠實的做法' }] },
      ],
    },
    {
      title: 'Part 2 — The Cost of Being Too Direct',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Direct people often say they're just being honest, but honesty can still be clumsy.", zh: '直接的人常說自己只是誠實，但誠實也可能很笨拙。', vocab: [{ word: 'clumsy', def: '笨拙、不夠細膩的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Absolutely. Tone matters. Timing matters. Context matters. Truth without care can feel like aggression.", zh: '絕對是。語氣很重要，時機很重要，情境也很重要。沒有照顧感的真話，聽起來可能像攻擊。', vocab: [{ word: 'aggression', def: '攻擊性' }] },
        { speaker: 'b', speakerName: 'Tom', en: "I've definitely had moments where I was technically clear but emotionally careless.", zh: '我自己也真的有過那種時刻：內容上講得很清楚，但情感上很不細膩。', vocab: [{ word: 'emotionally careless', def: '在情感上不夠細膩' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's a very honest thing to admit. A lot of people hide behind 'I'm just blunt' as if it's a virtue by itself.", zh: '這真的很誠實。很多人會躲在「我就是直」這句話後面，好像那本身就是一種美德。', vocab: [{ word: 'hide behind', def: '躲在…後面當藉口' }, { word: 'blunt', def: '直白但可能不夠客氣的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "But bluntness isn't the same as courage. Sometimes it's just impatience with nuance.", zh: '但直白不等於勇敢。有時候它只是對細膩差異沒有耐心。', vocab: [{ word: 'nuance', def: '細微差異、細膩度' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Mature directness still carries respect.", zh: '正是。成熟的直接，仍然會帶著尊重。', vocab: [{ word: 'mature directness', def: '成熟的直接表達' }] },
      ],
    },
    {
      title: 'Part 3 — The Risk of Being Too Indirect',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "Indirect communication has risks too, though.", zh: '不過，間接溝通也有它的風險。' },
        { speaker: 'b', speakerName: 'Tom', en: "Definitely. If you're too indirect, people may miss the message entirely.", zh: '絕對有。如果你太間接，人可能根本收不到你的真正訊息。', vocab: [{ word: 'miss the message', def: '沒有收到真正意思' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Or they may hear what they want to hear because you've left too much room for interpretation.", zh: '或者因為你留下太多可解讀空間，他們就只會聽見自己想聽的部分。', vocab: [{ word: 'interpretation', def: '解讀空間' }] },
        { speaker: 'b', speakerName: 'Tom', en: "I've seen that happen at work a lot. Someone phrases a request too gently, and then everyone acts like it was optional.", zh: '我在工作上很常看到這種情況。有人把要求講得太柔，結果大家都當成那只是可做可不做。', vocab: [{ word: 'optional', def: '可做可不做的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes, and then resentment builds because the speaker thinks they were clear enough.", zh: '對，然後說的人會開始有怨氣，因為他覺得自己已經講得夠清楚了。', vocab: [{ word: 'resentment', def: '怨氣、不滿' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So indirectness can protect feelings, but it can also create confusion if it gets too soft.", zh: '所以間接溝通可以保護感受，但如果太軟，也可能製造混亂。', vocab: [{ word: 'too soft', def: '太過柔和以至於不清楚' }] },
      ],
    },
    {
      title: 'Part 4 — Reading Style Differences Correctly',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "I think a lot of communication problems come from misreading style as intention.", zh: '我覺得很多溝通問題都來自於把風格誤讀成意圖。', vocab: [{ word: 'misread', def: '誤讀、看錯' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. A direct person may sound rude without meaning harm. An indirect person may sound vague without meaning avoidance.", zh: '正是。直接的人可能聽起來很粗，但其實沒有惡意；間接的人可能聽起來很模糊，但不代表他在逃避。', vocab: [{ word: 'vague', def: '模糊不明的' }, { word: 'avoidance', def: '逃避' }] },
        { speaker: 'b', speakerName: 'Tom', en: "The more emotionally charged the situation is, the more likely people are to make the worst interpretation.", zh: '情緒越高張的情況裡，人越容易做出最糟的解讀。', vocab: [{ word: 'emotionally charged', def: '情緒張力很高的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Which is why it helps to ask clarifying questions instead of reacting to tone alone.", zh: '這就是為什麼先問澄清問題，而不是只對語氣反應，會很有幫助。', vocab: [{ word: 'clarifying question', def: '澄清問題' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Like, 'Are you saying this is urgent?' or 'Do you mean you'd prefer something different?'", zh: '像是「你的意思是這件事很急嗎？」或「你的意思是你比較希望用別的方式嗎？」' },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Good communication often depends less on one perfect style and more on better translation between styles.", zh: '正是。好的溝通常常不在於找到唯一完美的風格，而在於不同風格之間做更好的翻譯。', vocab: [{ word: 'translation between styles', def: '不同溝通風格之間的轉譯' }] },
      ],
    },
    {
      title: 'Part 5 — Flexibility as a Skill',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think communication maturity is partly the ability to shift style without losing sincerity.", zh: '我覺得溝通上的成熟，有一部分就是能夠切換風格，同時不失去真誠。', vocab: [{ word: 'shift style', def: '切換風格' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So being flexible doesn't make you fake. It can actually make you more effective.", zh: '所以有彈性不代表你很假，反而可能讓你更有效。', vocab: [{ word: 'effective', def: '有效的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. You can be direct with one person and softer with another, while still meaning the same thing.", zh: '正是。你可以對一個人更直接、對另一個人更柔和，但你想表達的其實是同一件事。' },
        { speaker: 'b', speakerName: 'Tom', en: "That sounds a lot like respect — not making everyone adapt to your default setting.", zh: '那聽起來其實很像尊重，不是要所有人都來配合你的預設模式。', vocab: [{ word: 'default setting', def: '預設模式' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. Your natural style matters, but your flexibility may matter even more.", zh: '對。你天生的風格很重要，但你的彈性可能更重要。', vocab: [{ word: 'flexibility', def: '彈性' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And maybe that's the real goal: not to win the style debate, but to communicate in a way people can actually receive.", zh: '而那也許才是真正的目標：不是贏得哪種風格比較好的辯論，而是用別人真的接得住的方式去溝通。', vocab: [{ word: 'receive', def: '接住、真正聽進去' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'clarity', zh: '清晰明白', example: "Sometimes clarity is kinder than leaving people to guess." },
    { en: 'blunt', zh: '直白但可能不夠客氣的', example: "Being blunt is not the same as being brave." },
    { en: 'preserve the relationship', zh: '維護關係', example: "Some people soften their words to preserve the relationship." },
    { en: 'nuance', zh: '細膩度、細微差異', example: "Good communication requires patience with nuance." },
    { en: 'miss the message', zh: '沒收到真正意思', example: "If you are too indirect, people may miss the message completely." },
    { en: 'optional', zh: '可做可不做的', example: "The request sounded optional, so nobody treated it as urgent." },
    { en: 'clarifying question', zh: '澄清問題', example: "A clarifying question can prevent a lot of unnecessary conflict." },
    { en: 'translation between styles', zh: '不同風格之間的轉譯', example: "Strong relationships often require translation between styles." },
    { en: 'default setting', zh: '預設模式', example: "Maturity means not forcing everyone to adapt to your default setting." },
    { en: 'receive', zh: '接住、真正聽進去', example: "The goal is to communicate in a way the other person can receive." },
  ],
  },

  // Day 3
  {
  weekNumber: 16,
  dayOfWeek: 3,
  date: '2026-04-15',
  theme: 'Communication Styles',
  title: 'Listening Beyond the Words',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — Listening Is Not Passive',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "People talk about listening like it's passive, but I don't think it is.", zh: '人們常把傾聽講得像是一件很被動的事，但我不覺得是這樣。' },
        { speaker: 'b', speakerName: 'Tom', en: "I agree. Good listening takes effort — maybe even more effort than speaking well.", zh: '我同意。好的傾聽需要力氣，甚至可能比好好說話還更費力。', vocab: [{ word: 'takes effort', def: '需要投入力氣' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Because you have to hold back your own reaction long enough to understand the other person's meaning.", zh: '因為你得先忍住自己的反應，長到足以真正理解對方的意思。', vocab: [{ word: 'hold back', def: '克制、先忍住' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And not just their meaning — sometimes their feeling underneath the words too.", zh: '而且不只是理解字面意思，有時還要去聽見那些話底下的感受。', vocab: [{ word: 'underneath the words', def: '話語底下的情緒或真意' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. That's what makes listening relational rather than mechanical.", zh: '正是。那就是傾聽之所以是關係性的，而不是機械性的原因。', vocab: [{ word: 'relational', def: '與關係有關的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "You're receiving more than information. You're receiving a person.", zh: '你接住的不只是資訊，而是一個人。', vocab: [{ word: 'receive a person', def: '真正接住一個人的狀態與感受' }] },
      ],
    },
    {
      title: 'Part 2 — Hearing the Subtext',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "A lot of communication is subtext, isn't it?", zh: '很多溝通其實都在潛台詞裡，對吧？' },
        { speaker: 'a', speakerName: 'Lily', en: "Absolutely. Someone says, 'It's fine,' and the real message is often somewhere else entirely.", zh: '絕對是。有些人說「沒事」，真正的訊息常常完全在別的地方。', vocab: [{ word: 'subtext', def: '潛台詞' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's where tone, speed, hesitation, and expression become so important.", zh: '這就是語氣、速度、停頓和表情會變得那麼重要的地方。', vocab: [{ word: 'hesitation', def: '遲疑、停頓' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes, but we also have to be careful not to over-interpret everything.", zh: '對，但我們也要小心，不要把每件事都解讀過頭。', vocab: [{ word: 'over-interpret', def: '過度解讀' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So listening beneath the words requires sensitivity, but also humility.", zh: '所以聽見話底下的東西，需要敏感度，但也需要謙遜。', vocab: [{ word: 'sensitivity', def: '敏感度' }, { word: 'humility', def: '謙遜' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Sometimes the best move is not to assume — it's to gently ask.", zh: '正是。有時候最好的做法不是假設，而是溫和地問。', vocab: [{ word: 'gently ask', def: '溫和地詢問' }] },
      ],
    },
    {
      title: 'Part 3 — What Gets in the Way',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "What do you think gets in the way of good listening most often?", zh: '你覺得最常妨礙我們好好傾聽的是什麼？' },
        { speaker: 'b', speakerName: 'Tom', en: "Ego, probably. People want to be right, or useful, or fast, and that makes them stop listening.", zh: '大概是自我吧。人會想要自己是對的、是有用的、是反應快的，於是就不再聽了。', vocab: [{ word: 'ego', def: '自我意識、自尊心' }] },
        { speaker: 'a', speakerName: 'Lily', en: "I think anxiety gets in the way too. If you're nervous, you become preoccupied with how you're coming across.", zh: '我覺得焦慮也很妨礙傾聽。如果你很緊張，你就會一直被自己表現得怎麼樣這件事占據。', vocab: [{ word: 'preoccupied', def: '被某事占據心思' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And then there's impatience. Sometimes people interrupt because they can't tolerate the pace of someone else's thinking.", zh: '還有不耐煩。有時人打斷別人，不是因為內容重要，而是因為他受不了別人思考的節奏。', vocab: [{ word: 'tolerate', def: '容忍、承受' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's such a good point. Listening is partly respecting another person's pace.", zh: '那真的是一個很好的觀點。傾聽有一部分，就是尊重另一個人的節奏。', vocab: [{ word: 'pace', def: '節奏、速度' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Which is hard in a culture that rewards quickness over depth.", zh: '而這在一個獎勵速度勝過深度的文化裡，真的很難。', vocab: [{ word: 'quickness over depth', def: '重速度勝過深度' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Good listening can feel slow, but it's often what makes a conversation worth having.", zh: '正是。好的傾聽會讓對話變慢，但它也常常是讓一段對話值得存在的原因。', vocab: [{ word: 'worth having', def: '值得存在、值得進行' }] },
      ],
    },
    {
      title: 'Part 4 — Feeling Heard',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "What makes you feel truly heard by someone?", zh: '什麼會讓你覺得自己真的被聽見了？' },
        { speaker: 'a', speakerName: 'Lily', en: "When they don't rush to fix me. When they stay with what I'm saying instead of trying to solve it immediately.", zh: '當對方不急著修理我。當他們能停留在我正在說的東西裡，而不是立刻想解決它。', vocab: [{ word: 'rush to fix', def: '急著解決或修理' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's such an important distinction. A lot of people think helping means immediately offering advice.", zh: '那個區分真的很重要。很多人以為幫助就等於立刻給建議。', vocab: [{ word: 'offering advice', def: '給建議' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Sometimes advice is useful. But often the first thing people need is to feel accurately understood.", zh: '有時候建議是有用的。但更常見的是，人首先需要的是感覺自己被準確地理解了。', vocab: [{ word: 'accurately understood', def: '被準確理解' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And when that happens, people often become calmer on their own.", zh: '而一旦這件事發生，人通常就會自己平靜下來。', vocab: [{ word: 'on their own', def: '自己、自然而然地' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Feeling heard is regulating. It makes your nervous system feel less alone.", zh: '正是。被聽見本身就是一種調節，它會讓你的神經系統感覺沒那麼孤單。', vocab: [{ word: 'regulating', def: '具有調節作用的' }] },
      ],
    },
    {
      title: 'Part 5 — Listening as a Form of Care',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think listening well is one of the clearest forms of care.", zh: '我覺得，好好傾聽是最清楚的一種照顧形式。' },
        { speaker: 'b', speakerName: 'Tom', en: "I agree. Attention is one of the most generous things you can offer another person.", zh: '我同意。注意力是你能給另一個人最慷慨的東西之一。', vocab: [{ word: 'attention', def: '注意力、關注' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And because it's invisible, people often underestimate how powerful it is.", zh: '而且也因為它很看不見，所以人們常常低估它有多有力量。', vocab: [{ word: 'underestimate', def: '低估' }] },
        { speaker: 'b', speakerName: 'Tom', en: "A good listener can change the whole emotional temperature of a conversation.", zh: '一個好的傾聽者，可以改變整段對話的情緒溫度。', vocab: [{ word: 'emotional temperature', def: '情緒氛圍、情緒溫度' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Maybe that's why being listened to can feel so relieving. It reminds you that you don't have to carry the whole moment by yourself.", zh: '也許這就是為什麼被聽見會讓人那麼鬆一口氣。它提醒你，你不需要自己一個人扛住整個當下。', vocab: [{ word: 'relieving', def: '讓人鬆一口氣的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And that's probably why good listening stays with people for a long time. They remember how it felt.", zh: '而那大概也是為什麼好的傾聽會留在人的記憶裡很久，因為人會記得那種被對待的感覺。', vocab: [{ word: 'stays with people', def: '留在人心裡很久' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'subtext', zh: '潛台詞', example: "Sometimes the subtext matters more than the actual sentence." },
    { en: 'over-interpret', zh: '過度解讀', example: "It is useful to notice signals, but not to over-interpret everything." },
    { en: 'ego', zh: '自我意識', example: "Ego often gets in the way of truly hearing another person." },
    { en: 'pace', zh: '節奏', example: "Listening well means respecting another person's pace." },
    { en: 'rush to fix', zh: '急著修理或解決', example: "Sometimes the worst response is to rush to fix someone." },
    { en: 'accurately understood', zh: '被準確理解', example: "People calm down when they feel accurately understood." },
    { en: 'regulating', zh: '具有調節作用的', example: "Being heard can have a regulating effect on the body." },
    { en: 'attention', zh: '注意力、關注', example: "Attention is one of the most generous things we can offer." },
    { en: 'emotional temperature', zh: '情緒溫度', example: "A good listener can lower the emotional temperature in the room." },
    { en: 'stays with people', zh: '留在人心裡很久', example: "Truly attentive listening stays with people long after the conversation ends." },
  ],
  },

  // Day 4
  {
  weekNumber: 16,
  dayOfWeek: 4,
  date: '2026-04-16',
  theme: 'Communication Styles',
  title: 'Expressing Disagreement Respectfully',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — Why Disagreement Feels Risky',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Why do you think disagreement feels so uncomfortable for so many people?", zh: '你覺得為什麼對很多人來說，不同意會那麼不舒服？' },
        { speaker: 'a', speakerName: 'Lily', en: "Because disagreement can feel like a threat to belonging. Even small differences can trigger a fear of rupture.", zh: '因為不同意會讓人感覺像是在冒著失去歸屬的風險。即使是小差異，也可能觸發一種關係會裂開的恐懼。', vocab: [{ word: 'rupture', def: '破裂、裂痕' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Especially if someone grew up in an environment where conflict always turned harsh.", zh: '尤其如果一個人是在那種衝突一來就會變得很尖銳的環境裡長大的話。', vocab: [{ word: 'harsh', def: '尖銳嚴厲的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Then disagreement doesn't feel like discussion. It feels like danger.", zh: '正是。那樣一來，不同意就不再像討論，而像危險。', vocab: [{ word: 'discussion', def: '討論' }] },
        { speaker: 'b', speakerName: 'Tom', en: "No wonder some people avoid it entirely and others go in already armored.", zh: '難怪有些人會完全迴避它，而另一些人則會一開始就穿著盔甲衝進去。', vocab: [{ word: 'armored', def: '帶著防衛的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's why respectful disagreement is such an important skill. It teaches the body that difference doesn't always mean danger.", zh: '這就是為什麼有尊重的不同意，是一個很重要的技能。它會教會身體，差異不一定等於危險。', vocab: [{ word: 'respectful disagreement', def: '帶著尊重的不同意' }] },
      ],
    },
    {
      title: 'Part 2 — Separating Ideas from Identity',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think one of the biggest communication skills is separating a person's idea from their worth.", zh: '我覺得一個很大的溝通技能，就是把一個人的想法和他的價值分開。' },
        { speaker: 'b', speakerName: 'Tom', en: "Yes. People can handle disagreement much better when they don't feel personally diminished by it.", zh: '對。當人不覺得自己的價值被貶低時，他們其實能更好地承受不同意。', vocab: [{ word: 'diminished', def: '被貶低、被削弱' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's why phrasing matters. 'I see it differently' lands very differently from 'You're wrong.'", zh: '這就是為什麼措辭很重要。「我看法不太一樣」和「你錯了」帶來的感受差很多。', vocab: [{ word: 'phrasing', def: '措辭方式' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Same disagreement, different emotional impact.", zh: '同樣的不同意，卻是完全不同的情緒 impact。', vocab: [{ word: 'impact', def: '影響、衝擊' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. You can challenge an idea while still signaling respect for the person holding it.", zh: '正是。你可以挑戰一個想法，同時仍然傳遞出你尊重那個提出想法的人。', vocab: [{ word: 'signal respect', def: '傳遞尊重' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That feels like the real art of disagreement: preserving dignity while still being honest.", zh: '那聽起來像是真正不同意的藝術：在仍然誠實的同時，也保留對方的尊嚴。', vocab: [{ word: 'dignity', def: '尊嚴' }] },
      ],
    },
    {
      title: 'Part 3 — Tone, Timing, and Stakes',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Not every disagreement needs to happen immediately, though.", zh: '不過，不是每一個不同意都需要立刻發生。' },
        { speaker: 'a', speakerName: 'Lily', en: "Definitely not. Tone and timing matter almost as much as the content itself.", zh: '絕對不需要。語氣和時機，幾乎和內容本身一樣重要。', vocab: [{ word: 'timing', def: '時機' }] },
        { speaker: 'b', speakerName: 'Tom', en: "I've made that mistake before — saying something true at the wrong moment and making everything worse.", zh: '我以前就犯過這種錯：在錯的時機說出對的話，結果讓一切變得更糟。', vocab: [{ word: 'wrong moment', def: '錯的時機' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. A tired person, a public setting, a stressful day — all of that changes what someone can hear.", zh: '對。一個很累的人、一個公開場合、一個壓力很大的日子，這些都會改變一個人能聽進去多少。', vocab: [{ word: 'public setting', def: '公開場合' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So respectful communication isn't just about courage. It's also about judgment.", zh: '所以有尊重的溝通不只是勇氣，也包括判斷力。', vocab: [{ word: 'judgment', def: '判斷力' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. You don't just ask, 'Should I say this?' You also ask, 'Should I say it now, and in this way?'", zh: '正是。你不只要問「我該不該說」，還要問「我是不是該現在說，以及用這種方式說」。', vocab: [{ word: 'in this way', def: '用這種方式' }] },
      ],
    },
    {
      title: 'Part 4 — Staying Open While Disagreeing',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think respectful disagreement also requires staying open to being changed yourself.", zh: '我覺得有尊重的不同意，還需要你自己也願意被改變。', vocab: [{ word: 'staying open', def: '保持開放' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's hard. A lot of people go into disagreement trying to win, not understand.", zh: '那很難。很多人進入不同意時，是想贏，不是想理解。', vocab: [{ word: 'trying to win', def: '想要贏過對方' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And the moment winning becomes the goal, curiosity disappears.", zh: '而一旦贏變成目標，好奇心就會消失。', vocab: [{ word: 'curiosity disappears', def: '好奇心消失' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Which is sad, because disagreement can actually deepen understanding if both people stay honest and flexible.", zh: '那很可惜，因為如果雙方都誠實又有彈性，不同意其實可以讓理解變得更深。', vocab: [{ word: 'deepen understanding', def: '加深理解' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Sometimes the best outcome isn't agreement. It's a clearer, more nuanced picture of each other.", zh: '正是。有時最好的結果不是同意，而是對彼此有一個更清楚、更細膩的理解。', vocab: [{ word: 'nuanced', def: '細膩而有層次的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That makes disagreement sound less like a threat and more like a kind of joint thinking.", zh: '那讓不同意聽起來比較不像威脅，而比較像一種共同思考。', vocab: [{ word: 'joint thinking', def: '共同思考' }] },
      ],
    },
    {
      title: 'Part 5 — The Kind of Honesty That Builds Trust',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Do you think trust grows when people are willing to disagree well?", zh: '你覺得當人們願意好好地不同意時，信任會因此成長嗎？' },
        { speaker: 'a', speakerName: 'Lily', en: "I do. It shows that the relationship can hold truth without collapsing.", zh: '我覺得會。那代表這段關係可以承受真話，而不會因此崩掉。', vocab: [{ word: 'hold truth', def: '承受真話' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's a powerful standard. Not just harmony, but resilience.", zh: '那是一個很有力量的標準。不只是和諧，還有韌性。', vocab: [{ word: 'resilience', def: '韌性' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Anyone can look close when everything is easy. The real test is whether honesty can survive tension.", zh: '正是。當一切都容易時，任何關係都可以看起來很親近。真正的考驗，是誠實能不能穿越張力。', vocab: [{ word: 'survive tension', def: '在張力中仍然存在' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And maybe that's why respectful disagreement feels so adult. It asks for courage, restraint, and care all at once.", zh: '而這也許就是為什麼有尊重的不同意讓人感覺很成熟。因為它同時要求勇氣、克制和照顧。', vocab: [{ word: 'restraint', def: '克制' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. It's one of the clearest signs that communication has moved beyond performance into real relationship.", zh: '對。那是溝通從表演走向真正關係的最清楚標誌之一。', vocab: [{ word: 'beyond performance', def: '超越表面表現' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'respectful disagreement', zh: '帶著尊重的不同意', example: "Respectful disagreement teaches people that difference does not always mean danger." },
    { en: 'dignity', zh: '尊嚴', example: "You can challenge an idea while still preserving the other person's dignity." },
    { en: 'timing', zh: '時機', example: "In difficult conversations, timing matters almost as much as truth." },
    { en: 'judgment', zh: '判斷力', example: "Good communication requires not only honesty but judgment." },
    { en: 'stay open', zh: '保持開放', example: "You cannot disagree well if you are unwilling to stay open." },
    { en: 'deepen understanding', zh: '加深理解', example: "Disagreement can deepen understanding when both people stay curious." },
    { en: 'hold truth', zh: '承受真話', example: "Trust grows when a relationship can hold truth without collapsing." },
    { en: 'resilience', zh: '韌性', example: "A resilient relationship can survive honest disagreement." },
    { en: 'restraint', zh: '克制', example: "Respectful disagreement takes more restraint than people realize." },
    { en: 'beyond performance', zh: '超越表面表現', example: "Communication becomes real when it moves beyond performance." },
  ],
  },

  // Day 5
  {
  weekNumber: 16,
  dayOfWeek: 5,
  date: '2026-04-17',
  theme: 'Communication Styles',
  title: 'Texting, Voice Notes, and Miscommunication',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — The Problem with Text',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "Texting is convenient, but I think it causes a lot of unnecessary misunderstanding.", zh: '傳訊息很方便，但我覺得它也製造了很多沒必要的誤解。' },
        { speaker: 'b', speakerName: 'Tom', en: "Completely. Text strips away tone, timing, facial expression — all the things that help us interpret meaning.", zh: '完全同意。文字會把語氣、時機、表情這些幫助我們解讀意思的東西都抽掉。', vocab: [{ word: 'strip away', def: '去除、抽掉' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And then people fill in the missing tone with their own mood.", zh: '然後人們就會用自己當下的心情去補那些缺掉的語氣。', vocab: [{ word: 'fill in the missing tone', def: '自行補上不存在的語氣' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Exactly. If you're anxious, a short message can feel cold. If you're relaxed, the same message feels neutral.", zh: '正是。如果你很焦慮，一個簡短訊息會讓你覺得冷；如果你很放鬆，同樣的訊息就只是中性。', vocab: [{ word: 'neutral', def: '中性的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "It's amazing how much emotion can be projected onto five words and a period.", zh: '真的很驚人，五個字加一個句點，就能被投射進去很多情緒。', vocab: [{ word: 'project onto', def: '投射到…之上' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Which is why text is great for logistics, but not always for emotional nuance.", zh: '這也就是為什麼文字很適合處理安排，但不一定適合處理情感上的細膩差異。', vocab: [{ word: 'logistics', def: '安排、後勤事務' }, { word: 'emotional nuance', def: '情感上的細膩差異' }] },
      ],
    },
    {
      title: 'Part 2 — The Anxiety of Delayed Replies',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "One of the hardest things about texting is delayed replies. People create entire emotional stories while waiting.", zh: '傳訊息最難的一件事，就是延遲回覆。人在等待時，會自己編出整套情緒劇情。', vocab: [{ word: 'delayed reply', def: '延遲回覆' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Absolutely. Silence online rarely feels neutral, even though most of the time it probably is.", zh: '絕對是。線上的沉默很少讓人覺得中性，儘管大多數時候它其實只是中性的。', vocab: [{ word: 'neutral silence', def: '沒有特別情緒含義的沉默' }] },
        { speaker: 'b', speakerName: 'Tom', en: "You start asking: Are they upset? Did I say something wrong? Are they losing interest?", zh: '你會開始問：他是不是不高興？我是不是說錯了什麼？他是不是開始沒興趣了？' },
        { speaker: 'a', speakerName: 'Lily', en: "And usually the answer is much simpler. They're busy, tired, distracted, or just not a fast texter.", zh: '而通常答案其實簡單得多。他們只是忙、累、分心，或者本來就不是回訊息很快的人。', vocab: [{ word: 'fast texter', def: '回訊息很快的人' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Texting reveals how quickly uncertainty turns into story-making.", zh: '傳訊息這件事，會暴露出我們把不確定感多快變成故事。', vocab: [{ word: 'story-making', def: '自行腦補故事' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Which is why emotional regulation matters so much in digital communication.", zh: '這也是為什麼在數位溝通裡，情緒調節會變得這麼重要。', vocab: [{ word: 'emotional regulation', def: '情緒調節' }] },
      ],
    },
    {
      title: 'Part 3 — When Voice Helps',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think voice notes can solve some of these problems.", zh: '我覺得語音訊息可以解決其中一些問題。' },
        { speaker: 'b', speakerName: 'Tom', en: "Definitely. A voice note gives you tone, rhythm, warmth, hesitation — all kinds of human cues.", zh: '絕對可以。語音訊息會把語氣、節奏、溫度、遲疑這些很有人味的線索都帶回來。', vocab: [{ word: 'cues', def: '線索、提示' }] },
        { speaker: 'a', speakerName: 'Lily', en: "It also feels more personal. Sometimes hearing someone's actual voice changes everything.", zh: '而且它也更有個人感。有時候只要真的聽見對方的聲音，一切就會完全不一樣。', vocab: [{ word: 'more personal', def: '更有個人感、更貼近人' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Though some people hate voice notes because they feel inconvenient.", zh: '不過也有些人很討厭語音訊息，因為覺得很不方便。', vocab: [{ word: 'inconvenient', def: '不方便的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's true. You can't skim them the way you skim text, and you need the right setting to listen.", zh: '那是真的。你不能像掃讀文字那樣掃讀語音，而且你還需要一個適合聽的情境。', vocab: [{ word: 'skim', def: '快速略讀、略過' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So every format solves one problem and creates another. That's communication in a nutshell.", zh: '所以每一種形式都會解決一個問題，同時製造另一個問題。這大概就是溝通的縮影。', vocab: [{ word: 'in a nutshell', def: '簡單說、總結來說' }] },
      ],
    },
    {
      title: 'Part 4 — Choosing the Right Medium',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Maybe one of the most important modern communication skills is choosing the right medium.", zh: '也許現代溝通裡最重要的一個技能，就是選對媒介。' },
        { speaker: 'a', speakerName: 'Lily', en: "I completely agree. Not every conversation belongs in text.", zh: '我完全同意。不是每一種對話都適合放在文字裡。', vocab: [{ word: 'belong in text', def: '適合用文字進行' }] },
        { speaker: 'b', speakerName: 'Tom', en: "If it's emotionally loaded, complicated, or easy to misread, I think voice or face-to-face is usually better.", zh: '如果一件事情緒很重、很複雜，或者很容易被誤解，我覺得語音或面對面通常都更好。', vocab: [{ word: 'emotionally loaded', def: '情緒濃度很高的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Text is efficient, but efficiency isn't always the highest value.", zh: '正是。文字很有效率，但效率不一定永遠是最高價值。', vocab: [{ word: 'efficiency', def: '效率' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Sometimes clarity, care, or repair matter more than speed.", zh: '有時候，清楚、照顧感，或修復感，比速度更重要。', vocab: [{ word: 'repair', def: '修復關係或誤會' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. Good communicators don't just choose their words well. They choose the container well too.", zh: '對。好的溝通者不只是選對字，也會選對容器。', vocab: [{ word: 'container', def: '承載訊息的媒介或形式' }] },
      ],
    },
    {
      title: 'Part 5 — Less Projection, More Clarity',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think digital communication gets better the moment we project a little less and clarify a little more.", zh: '我覺得數位溝通只要少投射一點，多澄清一點，就會好很多。' },
        { speaker: 'b', speakerName: 'Tom', en: "That's a great rule. Instead of assuming tone, ask. Instead of spiraling, check.", zh: '那真是一個好規則。不要假設語氣，要問；不要一路往下腦補，要確認。', vocab: [{ word: 'spiraling', def: '情緒或思緒一路往下失控' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And instead of texting through something emotionally messy, maybe just call.", zh: '而且與其用文字處理一件情緒很亂的事，也許直接打電話就好。', vocab: [{ word: 'emotionally messy', def: '情緒上很混亂複雜的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "It's funny how often the simplest solution is just hearing a real human voice.", zh: '很有趣的是，最簡單的解法往往就是去聽見一個真實的人聲。', vocab: [{ word: 'human voice', def: '真實的人聲' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Technology gives us so many ways to communicate, but it still asks for judgment.", zh: '科技給了我們很多溝通方式，但它依然要求我們有判斷力。', vocab: [{ word: 'judgment', def: '判斷力' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Exactly. More tools don't automatically mean better communication. They just give us more choices to use wisely.", zh: '正是。工具變多不會自動變成更好的溝通，它只是給了我們更多需要被好好使用的選擇。', vocab: [{ word: 'use wisely', def: '明智地使用' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'strip away', zh: '去除、抽掉', example: "Text strips away tone and body language." },
    { en: 'delayed reply', zh: '延遲回覆', example: "A delayed reply can trigger more anxiety than the message itself." },
    { en: 'story-making', zh: '自行腦補故事', example: "Waiting for a message often turns uncertainty into story-making." },
    { en: 'emotional regulation', zh: '情緒調節', example: "Digital communication requires a lot of emotional regulation." },
    { en: 'voice note', zh: '語音訊息', example: "Sometimes a voice note carries warmth better than text." },
    { en: 'skim', zh: '快速略讀', example: "People like text because they can skim it quickly." },
    { en: 'belong in text', zh: '適合用文字處理', example: "Some conversations simply do not belong in text." },
    { en: 'emotionally loaded', zh: '情緒濃度很高的', example: "If a topic is emotionally loaded, call instead of texting." },
    { en: 'container', zh: '承載訊息的形式', example: "Good communicators choose not only the words but the container." },
    { en: 'spiraling', zh: '一路往下失控', example: "Instead of spiraling over a short message, ask for clarification." },
  ],
  },

  // Day 6
  {
  weekNumber: 16,
  dayOfWeek: 6,
  date: '2026-04-18',
  theme: 'Communication Styles',
  title: 'Asking Better Questions',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — Questions Shape the Conversation',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think people underestimate how much a good question can change a conversation.", zh: '我覺得人們低估了一個好問題能有多大程度地改變一段對話。' },
        { speaker: 'b', speakerName: 'Tom', en: "Completely. A question can open a door or shut one without people even noticing.", zh: '完全同意。一個問題可以打開一扇門，也可以把門關上，而人甚至不一定會意識到。', vocab: [{ word: 'open a door', def: '打開話題或可能性' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And the best questions don't just gather facts. They invite reflection.", zh: '而最好的問題不只是蒐集事實，它們還會邀請對方思考。', vocab: [{ word: 'reflection', def: '反思' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's why 'How did that feel?' often goes deeper than 'What happened?'", zh: '這也是為什麼「你那時候感覺怎麼樣？」常常會比「發生了什麼？」更深。', vocab: [{ word: 'go deeper', def: '進入更深層' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Different questions create different kinds of thinking.", zh: '正是。不同的問題，會創造出不同類型的思考。', vocab: [{ word: 'create thinking', def: '引發某種思考方式' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Which means asking well is a real communication skill, not just a personality habit.", zh: '這也代表會問問題是一種真正的溝通技能，不只是個性習慣。', vocab: [{ word: 'communication skill', def: '溝通技能' }] },
      ],
    },
    {
      title: 'Part 2 — Open Questions vs Closed Questions',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Open questions and closed questions create completely different conversations.", zh: '開放式問題和封閉式問題，真的會創造出完全不同的對話。' },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. A closed question gets you an answer. An open question gets you a person.", zh: '對。封閉式問題會給你一個答案，開放式問題會把一個人帶出來。', vocab: [{ word: 'closed question', def: '答案範圍很窄的問題' }, { word: 'open question', def: '答案範圍較開放的問題' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's such a great way to put it. 'Did you like it?' and 'What stayed with you about it?' are not the same question at all.", zh: '那說得真好。「你喜歡嗎？」和「有什麼東西留在你心裡？」根本不是同一種問題。', vocab: [{ word: 'stayed with you', def: '留在你心裡、持續有感' }] },
        { speaker: 'a', speakerName: 'Lily', en: "And people often answer at the depth of the question. If you ask something shallow, you'll usually get something shallow back.", zh: '而且人通常會用問題的深度來回應。如果你問得很淺，回來的通常也會很淺。', vocab: [{ word: 'shallow', def: '淺的、表面的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So a good question is a kind of invitation to be more real.", zh: '所以一個好問題，其實是一種邀請，邀請對方變得更真。', vocab: [{ word: 'invitation', def: '邀請' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. It says, 'There's room here for a fuller answer.'", zh: '正是。它像是在說：「這裡有空間容納你更完整的回答。」', vocab: [{ word: 'fuller answer', def: '更完整、更豐富的回答' }] },
      ],
    },
    {
      title: 'Part 3 — Curiosity Without Interrogation',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "Of course, curiosity can go wrong too. A conversation isn't an interrogation.", zh: '當然，好奇心也可能用錯。對話不是審問。', vocab: [{ word: 'interrogation', def: '審問式提問' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Yes, people can feel the difference immediately. Genuine interest feels warm; forced questioning feels invasive.", zh: '對，人會立刻感覺到差別。真誠的興趣很溫暖；硬逼式的提問則很侵入。', vocab: [{ word: 'invasive', def: '讓人感到被侵入的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Good questions leave people room to answer at their own level.", zh: '好的問題會替人保留空間，讓他能用自己舒服的深度來回答。', vocab: [{ word: 'their own level', def: '自己舒服的層次' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And they don't demand vulnerability before trust exists.", zh: '而且它們不會在信任還沒建立前，就要求對方立刻脆弱。', vocab: [{ word: 'vulnerability', def: '脆弱坦誠' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Curiosity should feel like accompaniment, not extraction.", zh: '正是。好奇心應該像陪伴，而不是像抽取資訊。', vocab: [{ word: 'accompaniment', def: '陪伴' }, { word: 'extraction', def: '抽取' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's a useful distinction. People open up more when they feel accompanied, not examined.", zh: '那是一個很有用的區分。當人感覺自己被陪伴，而不是被檢查時，會更願意打開。', vocab: [{ word: 'examined', def: '被檢視、被盤問' }] },
      ],
    },
    {
      title: 'Part 4 — Follow-Up Questions Show Care',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "I think follow-up questions are where listening really becomes visible.", zh: '我覺得追問，是傾聽真正變得可見的地方。' },
        { speaker: 'a', speakerName: 'Lily', en: "Absolutely. A good follow-up says, 'I didn't just hear your words — I stayed with them.'", zh: '絕對是。一個好的追問像是在說：「我不只聽見你的話，我還停留在那裡了。」', vocab: [{ word: 'stay with something', def: '停留在某個內容上，不急著跳走' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's why the best conversations often feel like a slow unfolding rather than a list of topics.", zh: '這也是為什麼最好的對話常常像慢慢展開，而不是像列出一串主題。', vocab: [{ word: 'unfolding', def: '慢慢展開' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. One good answer leads naturally to the next good question.", zh: '正是。一個好的回答，會自然帶出下一個好的問題。', vocab: [{ word: 'lead naturally to', def: '自然引向' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And when that happens, people often feel surprisingly seen.", zh: '而當那種事情發生時，人常常會意外地感到自己被看見。', vocab: [{ word: 'seen', def: '被真正理解與看見' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Because being asked a good question can feel like being met with real attention.", zh: '因為被問到一個好問題，會讓人感覺自己被真實的注意力接住。', vocab: [{ word: 'real attention', def: '真正的關注' }] },
      ],
    },
    {
      title: 'Part 5 — Better Questions, Better Relationships',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I think relationships improve when our questions become less automatic and more alive.", zh: '我覺得當我們的問題少一點自動反應、多一點生命感時，關係就會變好。', vocab: [{ word: 'automatic', def: '自動化、沒在想的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Instead of asking what comes to mind first, we ask what might actually create understanding.", zh: '我們不是只問第一個想到的，而是問那個真正可能創造理解的問題。', vocab: [{ word: 'create understanding', def: '創造理解' }] },
        { speaker: 'a', speakerName: 'Lily', en: "That's a beautiful goal. Better questions don't just produce better conversations — they produce better contact.", zh: '那是一個很美的目標。更好的問題不只是產生更好的對話，它還會產生更好的接觸。', vocab: [{ word: 'contact', def: '真實接觸、連結' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And maybe that's why good question-askers often feel wise even when they aren't saying much.", zh: '也許這就是為什麼會問問題的人即使沒講很多，也常常讓人覺得有智慧。', vocab: [{ word: 'wise', def: '有智慧的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. They create space where truth can arrive a little more fully.", zh: '對。他們創造了一個空間，讓真實可以更完整地到來。', vocab: [{ word: 'create space', def: '創造空間' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's probably one of the deepest things communication can do.", zh: '那大概就是溝通能做的最深的一件事之一。', vocab: [{ word: 'deepest thing', def: '最深刻的事' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'open question', zh: '開放式問題', example: "Open questions often lead to deeper and more personal answers." },
    { en: 'closed question', zh: '封閉式問題', example: "A closed question is useful when you need a clear and simple answer." },
    { en: 'go deeper', zh: '更深入', example: "A thoughtful follow-up can help the conversation go deeper." },
    { en: 'interrogation', zh: '審問式提問', example: "Curiosity should not feel like interrogation." },
    { en: 'vulnerability', zh: '脆弱坦誠', example: "Good questions do not force vulnerability before trust exists." },
    { en: 'accompaniment', zh: '陪伴', example: "Healthy curiosity feels like accompaniment, not extraction." },
    { en: 'follow-up question', zh: '追問', example: "A strong follow-up question shows that you are really listening." },
    { en: 'seen', zh: '被真正看見', example: "People often feel seen when someone asks a sincere question." },
    { en: 'create space', zh: '創造空間', example: "A thoughtful question can create space for a more honest answer." },
    { en: 'better contact', zh: '更好的接觸與連結', example: "Better questions can create better contact between people." },
  ],
  },

  // Day 7
  {
  weekNumber: 16,
  dayOfWeek: 7,
  date: '2026-04-19',
  theme: 'Communication Styles',
  title: 'Speaking Clearly Under Pressure',
  phase: 'p2',
  parts: [
    {
      title: 'Part 1 — Pressure Changes the Way We Speak',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Do you speak differently when you're under pressure?", zh: '你在壓力下說話的方式會不一樣嗎？' },
        { speaker: 'a', speakerName: 'Lily', en: "Definitely. Pressure narrows attention, speeds up thought, and makes language less precise.", zh: '絕對會。壓力會縮窄注意力、加快思緒，讓語言變得沒那麼精準。', vocab: [{ word: 'precise', def: '精準的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's why people ramble, freeze, or sound sharper than they mean to.", zh: '這也是為什麼人在壓力下會東拉西扯、僵住，或聽起來比本意更尖銳。', vocab: [{ word: 'ramble', def: '東拉西扯' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. The nervous system is trying to protect you, not make you eloquent.", zh: '對。神經系統那時候是在保護你，不是在幫你變得很會說話。', vocab: [{ word: 'eloquent', def: '有條理而流暢的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "Which means speaking clearly under pressure is partly a regulation skill, not just a language skill.", zh: '那也代表，在壓力下把話講清楚，有一部分其實是調節能力，不只是語言能力。', vocab: [{ word: 'regulation skill', def: '調節能力' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. If your body settles, your words usually settle too.", zh: '正是。如果身體先穩下來，話通常也會跟著穩下來。', vocab: [{ word: 'settle', def: '穩定下來' }] },
      ],
    },
    {
      title: 'Part 2 — Buying Yourself a Little Time',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "One of the most useful things I've learned is that a pause is not failure.", zh: '我學到的一個最有用的事，就是停頓不等於失敗。', vocab: [{ word: 'pause', def: '停頓' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That lesson is huge. A lot of people panic and fill every silence with extra words.", zh: '那個教訓非常大。很多人會慌，然後用多出來的字填滿每一個沉默。', vocab: [{ word: 'fill every silence', def: '急著把每個沉默填滿' }] },
        { speaker: 'a', speakerName: 'Lily', en: "But a brief pause can give you enough time to choose a clearer sentence instead of a messy one.", zh: '但一個短短的停頓，常常就足夠讓你選出一個更清楚的句子，而不是一個混亂的。', vocab: [{ word: 'brief pause', def: '短暫停頓' }] },
        { speaker: 'b', speakerName: 'Tom', en: "It also makes you sound more composed, even if you don't feel composed inside.", zh: '而且它也會讓你聽起來更沉著，即使你內心其實沒有那麼沉著。', vocab: [{ word: 'composed', def: '沉著冷靜的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Slowing down is often the fastest way back to clarity.", zh: '正是。放慢下來，常常是最快回到清晰的方法。', vocab: [{ word: 'clarity', def: '清楚明白' }] },
        { speaker: 'b', speakerName: 'Tom', en: "I like that. It sounds almost paradoxical, but it's true.", zh: '我喜歡那個說法。聽起來幾乎像悖論，但它是真的。', vocab: [{ word: 'paradoxical', def: '像悖論的' }] },
      ],
    },
    {
      title: 'Part 3 — Saying Less, Saying Better',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "When people are nervous, they often think more words will make them clearer.", zh: '當人緊張時，常常會以為多講一點就會更清楚。' },
        { speaker: 'a', speakerName: 'Lily', en: "Yes, but it often does the opposite. Too many words can bury the point.", zh: '對，但常常剛好相反。字太多，反而會把重點埋掉。', vocab: [{ word: 'bury the point', def: '把重點埋掉' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So clarity under pressure often means becoming more concise, not more elaborate.", zh: '所以在壓力下的清楚，常常意味著更精簡，而不是更鋪陳。', vocab: [{ word: 'concise', def: '簡潔的' }, { word: 'elaborate', def: '鋪陳很多的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. One clean sentence is often stronger than five anxious ones.", zh: '正是。一句乾淨的句子，常常比五句焦慮的句子都更有力。', vocab: [{ word: 'clean sentence', def: '清楚乾淨的句子' }] },
        { speaker: 'b', speakerName: 'Tom', en: "I guess that takes trust — trusting that your point can stand without too much protection around it.", zh: '我猜那需要一種信任，去相信你的觀點不用包很多保護層，也站得住。', vocab: [{ word: 'stand without protection', def: '不靠額外包裝也站得住' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Yes. Concision often sounds like confidence, even when it's really just good discipline.", zh: '對。簡潔常常聽起來像自信，即使它其實只是很好的紀律。', vocab: [{ word: 'discipline', def: '紀律、自我控制' }] },
      ],
    },
    {
      title: 'Part 4 — Naming What Is Happening',
      lines: [
        { speaker: 'a', speakerName: 'Lily', en: "I also think naming the pressure can sometimes help.", zh: '我也覺得，有時候把壓力本身說出來，反而會有幫助。' },
        { speaker: 'b', speakerName: 'Tom', en: "Like saying, 'Let me think for a second,' or 'I want to answer that carefully'?", zh: '像是說「讓我想一下」或「我想小心一點回答這個」？' },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Those phrases buy time, lower pressure, and make you sound intentional rather than lost.", zh: '正是。那種句子會替你買到時間，降低壓力，還會讓你聽起來比較像是有意識，而不是迷失。', vocab: [{ word: 'buy time', def: '爭取時間' }, { word: 'intentional', def: '有意識的' }] },
        { speaker: 'b', speakerName: 'Tom', en: "And they're honest. You're not pretending to be perfectly smooth when you aren't.", zh: '而且那也很誠實。你不是在自己其實沒有很順的時候，硬裝得很順。', vocab: [{ word: 'smooth', def: '流暢不費力的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. Communication usually gets better when people stop performing competence quite so hard.", zh: '正是。當人不再那麼用力表演自己很行時，溝通通常反而會變好。', vocab: [{ word: 'performing competence', def: '表演自己很有能力' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That's a relief to hear. Sometimes honesty is the shortest route back to clarity.", zh: '那聽起來真的讓人鬆一口氣。有時候，誠實其實是回到清楚的最短路。', vocab: [{ word: 'shortest route', def: '最短路徑' }] },
      ],
    },
    {
      title: 'Part 5 — Practicing Calm Communication',
      lines: [
        { speaker: 'b', speakerName: 'Tom', en: "Do you think this is something people can really improve with practice?", zh: '你覺得這真的是可以透過練習改善的東西嗎？' },
        { speaker: 'a', speakerName: 'Lily', en: "Absolutely. Pressure never disappears completely, but your relationship to it can change a lot.", zh: '絕對可以。壓力永遠不會完全消失，但你和壓力之間的關係可以改變很多。', vocab: [{ word: 'relationship to it', def: '你和它之間的關係' }] },
        { speaker: 'b', speakerName: 'Tom', en: "So the goal isn't to become fearless. It's to become steadier.", zh: '所以目標不是變得無所畏懼，而是變得更穩。', vocab: [{ word: 'steadier', def: '更穩定的' }] },
        { speaker: 'a', speakerName: 'Lily', en: "Exactly. The more often you pause, breathe, and choose your words on purpose, the more available that path becomes.", zh: '正是。你越常停下、呼吸、並有意識地選字，那條路之後就越容易被你走到。', vocab: [{ word: 'available path', def: '可被動用的方式' }] },
        { speaker: 'b', speakerName: 'Tom', en: "That makes calm communication sound like a habit, not a talent.", zh: '那讓平靜溝通聽起來比較像一種習慣，而不是天賦。', vocab: [{ word: 'habit, not a talent', def: '靠練習形成，而不是天生' }] },
        { speaker: 'a', speakerName: 'Lily', en: "I think it is. And that should make people hopeful, because habits can be built.", zh: '我覺得的確如此。而那也應該讓人有希望，因為習慣是可以建立的。', vocab: [{ word: 'hopeful', def: '感到有希望的' }] },
      ],
    },
  ],
  keyPhrases: [
    { en: 'precise', zh: '精準的', example: "Pressure makes it harder to stay precise with your words." },
    { en: 'pause', zh: '停頓', example: "A short pause can help you return to clarity." },
    { en: 'composed', zh: '沉著冷靜的', example: "A pause often makes you sound more composed than you feel." },
    { en: 'concise', zh: '簡潔的', example: "Under pressure, concise language is often stronger than long explanation." },
    { en: 'bury the point', zh: '把重點埋掉', example: "Too many anxious words can bury the point." },
    { en: 'buy time', zh: '爭取時間', example: "A simple sentence like 'Let me think for a second' can buy time." },
    { en: 'intentional', zh: '有意識的', example: "Pausing can make you sound more intentional and less reactive." },
    { en: 'performing competence', zh: '表演自己很有能力', example: "Communication improves when people stop performing competence so hard." },
    { en: 'steadier', zh: '更穩定的', example: "The goal under pressure is not fearlessness, but becoming steadier." },
    { en: 'habit, not a talent', zh: '習慣，不是天賦', example: "Calm communication is a habit, not a talent." },
  ],
  }
]

const fs = require('fs')
const path = require('path')

const {
  buildFocusPhrase,
  parseEpisodeMetadata,
  pickEpisodeTerms,
} = require('./content-quality-helpers')

const PHASES = [
  { start: 1, end: 10, phase: 'p1', speakerA: 'Mira', speakerB: 'Jamie' },
  { start: 11, end: 18, phase: 'p2', speakerA: 'Lily', speakerB: 'Tom' },
  { start: 19, end: 26, phase: 'p3', speakerA: 'Sara', speakerB: 'Alex' },
  { start: 27, end: 34, phase: 'p4', speakerA: 'Nina', speakerB: 'Marcus' },
  { start: 35, end: 43, phase: 'p5', speakerA: 'Jade', speakerB: 'Ryan' },
  { start: 44, end: 53, phase: 'p6', speakerA: 'Maya', speakerB: 'James' },
]

const THEME_DOMAINS = {
  'Shopping & Money': 'money',
  'Health & Body': 'health',
  'Daily Schedules': 'time',
  Friendship: 'relationships',
  Family: 'relationships',
  'Colleagues & Teamwork': 'work',
  'Social Situations': 'relationships',
  'Personality & Character': 'relationships',
  'Communication Styles': 'relationships',
  'Helping Others': 'relationships',
  'Conflict & Resolution': 'relationships',
  'Your Job & Role': 'work',
  'Meetings & Discussions': 'work',
  'Deadlines & Pressure': 'work',
  'Problem Solving': 'work',
  'Career Goals': 'work',
  'Learning & Growth': 'growth',
  'Success & Failure': 'growth',
  'Work-Life Balance': 'time',
  Travel: 'creative',
  'Photography & Visual Art': 'creative',
  'Music & Podcasts': 'creative',
  'Reading & Writing': 'creative',
  'Pets & Animals': 'creative',
  'Hobbies & Collections': 'creative',
  'Nature & Outdoors': 'creative',
  'Sports & Fitness': 'health',
  'Technology & Everyday Life': 'tech',
  'Artificial Intelligence': 'tech',
  'Health & Mental Wellbeing': 'health',
  'Environment & Sustainability': 'tech',
  'Money & Financial Goals': 'money',
  'Change & Transitions': 'growth',
  'Values & Beliefs': 'growth',
  'The Future': 'growth',
  'Looking Back & Moving Forward': 'growth',
  'Creativity & Self-Expression': 'creative',
  'Leadership & Influence': 'work',
  'Community & Giving Back': 'relationships',
  'Cross-Cultural Understanding': 'relationships',
  'Language & Identity': 'relationships',
  'Rest & Renewal': 'time',
  'Gratitude & Appreciation': 'growth',
  'Goals & Intentions': 'growth',
  'Year in Review': 'growth',
  'New Beginnings': 'growth',
}

function pair(en, zh) {
  return { en, zh }
}

const DOMAIN_PACKS = {
  money: {
    partTitles: [
      [
        'Part 1 — Where the Choice Appears',
        'Part 2 — Why the Plan Slips',
        'Part 3 — Talking About Money Clearly',
        'Part 4 — A Habit You Can Actually Keep',
        'Part 5 — What to Remember Before You Buy',
      ],
      [
        'Part 1 — The Moment It Turns Real',
        'Part 2 — What Makes It Hard to Be Rational',
        'Part 3 — Useful Language for Everyday Money',
        'Part 4 — A Smaller Better Money Move',
        'Part 5 — Keeping the Long View in Mind',
      ],
    ],
    fallbackScenes: [
      pair('when a small purchase feels easier than sitting with the stress underneath it', '當買個小東西感覺比面對底下真正的壓力還容易的時候'),
      pair('when the total on the screen is only a little higher than you expected, but not little enough to ignore', '當螢幕上的總金額只比你預期高一點點，卻又不是可以完全忽略的時候'),
      pair('when you are deciding whether convenience is worth the extra cost on a tired day', '當你在疲憊的一天裡決定方便到底值不值得多花那筆錢的時候'),
      pair('when you realize your spending says more about your mood than about your priorities', '當你發現自己的消費反映的比較像情緒，而不是優先順序的時候'),
      pair('when a money decision suddenly becomes a values decision', '當一個金錢決定突然變成價值選擇的時候'),
    ],
    tensions: [
      pair('The difficult part is that convenience usually speaks faster than intention in the moment.', '真正困難的地方在於，當下通常是方便先開口，而不是意圖先開口。'),
      pair('Money choices are rarely only about numbers. They are also about relief, identity, and timing.', '金錢選擇很少只和數字有關，它同時也跟放鬆感、身份感，以及時機有關。'),
      pair('People often call a choice practical when it is really emotional and simply easier to justify.', '人們常把一個選擇說成務實，但很多時候它其實是情緒性的，只是比較好合理化。'),
      pair('The plan usually sounds clear on paper and much less clear in the exact moment of spending.', '計畫在紙上通常很清楚，但真的到了花錢那一刻，往往就沒那麼清楚了。'),
    ],
    practices: [
      pair('What helps is adding one small pause before the purchase so the choice belongs to you again.', '有幫助的做法，是在購買前多放進一個小停頓，讓這個選擇重新回到你手上。'),
      pair('A better system is to decide your limits while you are calm, not while the decision is already on the screen.', '比較好的方法，是在你冷靜的時候先決定界線，而不是等到螢幕上已經出現那個選擇時才想。'),
      pair('The most useful habit is making the next step small enough that you can repeat it on an ordinary week.', '最有用的習慣，是把下一步縮小到平凡的一週裡也能重複做到的程度。'),
      pair('It gets easier when you give the money a job before the day starts spending it for you.', '當你在一天開始前就先替每筆錢安排用途，事情會容易很多。'),
    ],
    languageTips: [
      pair('Plain language works well here: say what happened, say what made the choice hard, and say what you chose anyway.', '這裡用樸素的語言反而最好：先說發生了什麼，再說困難在哪裡，最後說你還是怎麼選了。'),
      pair('Good money English is usually specific English. The clearer the situation sounds, the less defensive you become.', '談錢時好用的英文通常是具體的英文。情境越說得清楚，人就越不容易防衛。'),
      pair('A useful sentence often starts with the moment itself, not with a moral judgment about the moment.', '好用的句子常常是先從那個時刻開始說，而不是先對那個時刻做道德判斷。'),
    ],
    closings: [
      pair('The goal is not to become perfect with money. It is to notice the pattern a little earlier and choose with more honesty.', '目標不是要在金錢上變得完美，而是更早看見模式，然後更誠實地做選擇。'),
      pair('A healthier money life usually starts when you stop asking whether the choice looked reasonable and start asking what it was really doing for you.', '比較健康的金錢生活，往往是從你不再只問這個選擇看起來合不合理，而開始問它到底在替你做什麼開始。'),
      pair('The real shift is not only spending less or saving more. It is understanding yourself more clearly while money is involved.', '真正的改變不只是少花一點或多存一點，而是當金錢介入時，你能更清楚地理解自己。'),
    ],
  },
  health: {
    partTitles: [
      [
        'Part 1 — What Your Body Is Telling You',
        'Part 2 — Where Good Intentions Break Down',
        'Part 3 — Talking About Health Without Drama',
        'Part 4 — A Routine That Survives Real Life',
        'Part 5 — Caring for Yourself More Honestly',
      ],
      [
        'Part 1 — The Signal Under the Habit',
        'Part 2 — Why Health Gets Complicated',
        'Part 3 — Language for Real Recovery',
        'Part 4 — Small Choices That Actually Help',
        'Part 5 — What Your Body Keeps Remembering',
      ],
    ],
    fallbackScenes: [
      pair('when your body has been signaling something for days and you finally stop long enough to notice it', '當你的身體已經連續發出訊號好幾天，而你終於停下來注意到它的時候'),
      pair('when you know what would help, but you are tired enough to do the easier thing instead', '當你明明知道什麼會有幫助，卻又累到只想做比較容易的那個選擇的時候'),
      pair('when a healthy plan meets an unglamorous Tuesday and has to prove it can still work', '當一個健康計畫遇上平凡又不浪漫的星期二，必須證明自己仍然做得下去的時候'),
      pair('when recovery sounds simple until you try to protect it in a busy week', '當恢復聽起來很簡單，但你真的試著在忙碌的一週裡保護它時'),
      pair('when the body tells the truth a little sooner than the mind wants to hear it', '當身體比頭腦更早說出真相，而你暫時還不想聽見的時候'),
    ],
    tensions: [
      pair('Health gets complicated because what helps in theory is not always what feels possible in the moment.', '健康之所以變得複雜，是因為理論上有幫助的事，當下不一定做得到。'),
      pair('A lot of people only think about health when something hurts, instead of when a pattern first begins to drift.', '很多人只有在真的不舒服時才想到健康，而不是在模式剛開始偏掉的時候。'),
      pair('The hard part is usually not knowledge. It is protecting the helpful thing when energy is already low.', '真正困難的地方通常不是知識不夠，而是在能量已經很低的時候，還能不能保護那個有幫助的選擇。'),
      pair('People often treat rest like a reward when it works much better as part of the system.', '人們常把休息當成獎勵，但它當成系統的一部分時通常更有效。'),
    ],
    practices: [
      pair('What helps most is making the healthy option easier to begin than the unhealthy one.', '最有幫助的做法，是讓健康的選擇比不健康的選擇更容易開始。'),
      pair('A stronger routine usually begins with one honest baseline you can keep even on a messy day.', '比較穩的日常通常是從一個誠實的基線開始，而且那個基線在混亂的一天也能守住。'),
      pair('The useful move is to protect recovery before you feel completely depleted, not after.', '有用的做法，是在自己完全耗盡之前就先保護恢復，而不是之後才補救。'),
      pair('It gets easier when you stop designing for your best day and start designing for your ordinary one.', '當你不再為最理想的一天設計，而開始為平凡的一天設計時，事情會容易很多。'),
    ],
    languageTips: [
      pair('The cleanest language here is body language: say what you noticed, say what changed, and say what you need next.', '這裡最好用的是身體感受的語言：先說你注意到什麼，再說什麼變了，最後說你接下來需要什麼。'),
      pair('Useful health English is usually calm English. The more exact your description is, the less dramatic you need to sound.', '談健康時有用的英文通常是冷靜的英文。你描述得越準，就越不需要講得很戲劇化。'),
      pair('A good sentence often begins with a specific signal from the body instead of a broad label about the whole self.', '好句子常常是從一個具體的身體訊號開始，而不是先給整個自己貼上一個大標籤。'),
    ],
    closings: [
      pair('Taking care of yourself is rarely one impressive act. It is usually a series of ordinary corrections made in time.', '照顧自己很少是一個很厲害的大動作，它通常是一連串及時做出的普通修正。'),
      pair('A healthier life often starts when you stop negotiating against your own signals all day long.', '比較健康的生活，往往是從你不再整天和自己的訊號討價還價開始。'),
      pair('The body remembers what you repeat. That is why small honest routines matter so much.', '身體會記住你反覆做的事，所以那些小而誠實的日常才會這麼重要。'),
    ],
  },
  time: {
    partTitles: [
      [
        'Part 1 — Where the Day Actually Goes',
        'Part 2 — Why Time Starts to Slip',
        'Part 3 — Talking About Time Without Pretending',
        'Part 4 — Building a Rhythm You Can Trust',
        'Part 5 — Protecting What the Week Is For',
      ],
      [
        'Part 1 — The Shape of an Ordinary Day',
        'Part 2 — When the Schedule Stops Working',
        'Part 3 — Language for Real Priorities',
        'Part 4 — One Better Way to Structure It',
        'Part 5 — Remembering What Time Is Buying You',
      ],
    ],
    fallbackScenes: [
      pair('when the day felt full from start to finish and you still cannot explain where the hours went', '當一整天從頭到尾都很滿，但你還是說不清那些時間究竟去了哪裡的時候'),
      pair('when one small delay quietly changes the mood of the entire day', '當一個小小的延誤悄悄改變了整天節奏的時候'),
      pair('when the calendar looks organized but your energy does not feel organized at all', '當行事曆看起來很整齊，但你的精力其實一點也不整齊的時候'),
      pair('when a good plan meets interruptions, other people, and a body that is no longer fresh', '當一個好計畫遇上打斷、別人，以及已經不新鮮的身體狀態的時候'),
      pair('when time pressure is less about the clock and more about what keeps pulling your attention away', '當時間壓力真正來自的不是時鐘，而是那些一直把你注意力拉走的事的時候'),
    ],
    tensions: [
      pair('Time problems are often attention problems wearing a schedule-shaped costume.', '很多時間問題其實是注意力問題，只是穿上了行程安排的外衣。'),
      pair('A packed day can feel productive while still leaving no space for what matters most.', '一個排得很滿的一天可以讓人覺得自己很有效率，卻仍然沒有留出真正重要的空間。'),
      pair('The hard part is that urgent things arrive with a louder voice than important ones.', '真正困難的是，緊急的事通常比重要的事有更大的聲量。'),
      pair('People often blame themselves for a rhythm that was never realistic in the first place.', '人們常責怪自己跟不上節奏，但那個節奏本來就不夠現實。'),
    ],
    practices: [
      pair('What helps is deciding what the day is for before the day starts making decisions for you.', '有幫助的做法，是在一天替你做決定之前，先決定這一天是拿來做什麼的。'),
      pair('A better rhythm usually begins by protecting one or two anchors rather than trying to control every hour.', '比較好的節奏，通常是先保護一兩個錨點，而不是試圖控制每一個小時。'),
      pair('The useful shift is to design for real energy, not ideal energy.', '真正有用的轉變，是拿真實的精力來設計，而不是拿理想中的精力。'),
      pair('It gets easier when the schedule has room to absorb life instead of pretending life will behave perfectly.', '當行程有能力吸收生活的混亂，而不是假裝生活會完美配合時，事情就會容易許多。'),
    ],
    languageTips: [
      pair('Good time language is honest language: say what filled the space, say what got pushed out, and say why.', '談時間時好用的語言通常是誠實的語言：先說空間被什麼填滿，再說什麼被擠掉，最後說為什麼。'),
      pair('A useful sentence here often names the trade-off, not just the complaint.', '這裡好用的句子，常常是把取捨說出來，而不只是抱怨。'),
      pair('Specific time English helps because it turns vague busyness into something a listener can actually picture.', '具體的時間英文之所以有用，是因為它能把模糊的忙碌感變成聽者真的想像得出來的東西。'),
    ],
    closings: [
      pair('The point is not to control every hour. It is to make sure the week still resembles the life you meant to live.', '重點不是控制每一個小時，而是確保這一週仍然像是你原本想過的那種生活。'),
      pair('A good schedule is not impressive because it is full. It is useful because it tells the truth about what matters.', '一個好的行程不是因為它排得很滿而厲害，而是因為它誠實反映了什麼才重要。'),
      pair('Time starts to feel kinder when you stop measuring only output and start noticing rhythm.', '當你不再只拿產出衡量時間，而開始注意節奏時，時間會感覺比較溫和。'),
    ],
  },
  relationships: {
    partTitles: [
      [
        'Part 1 — The Moment Between People',
        'Part 2 — Where It Gets Tender or Difficult',
        'Part 3 — Saying It in a Better Way',
        'Part 4 — A Small Move That Protects the Relationship',
        'Part 5 — What Real Connection Usually Requires',
      ],
      [
        'Part 1 — What This Feels Like in Real Life',
        'Part 2 — Why People Miss Each Other',
        'Part 3 — Language That Keeps Things Human',
        'Part 4 — One Better Way to Show Up',
        'Part 5 — What Makes the Bond Stronger',
      ],
    ],
    fallbackScenes: [
      pair('when you are deciding whether to say the honest thing or keep the surface peaceful', '當你在想是該把真話說出來，還是先讓表面維持平靜的時候'),
      pair('when a small interaction carries more feeling than either person is admitting out loud', '當一個小小的互動其實帶著比雙方口頭承認更多的情緒的時候'),
      pair('when you notice that what the other person needs is not exactly what you assumed', '當你發現對方真正需要的，和你原本以為的其實不太一樣的時候'),
      pair('when a relationship starts to depend on whether somebody is willing to go first with honesty', '當一段關係開始取決於有沒有人願意先誠實地跨出那一步的時候'),
      pair('when closeness and discomfort show up in the same conversation', '當親近感和不舒服感出現在同一段對話裡的時候'),
    ],
    tensions: [
      pair('Between people, the hard part is often not feeling something. It is saying it before the pattern hardens.', '在人和人之間，困難的常常不是沒有感覺，而是能不能在模式變硬之前把它說出來。'),
      pair('People protect themselves quickly, and relationships usually become confusing in that small protective gap.', '人會很快地保護自己，而關係常常就是在那個小小的保護空隙裡開始變得混亂。'),
      pair('A lot of connection problems are timing problems. The truth arrives either too late, too sharply, or not at all.', '很多連結上的問題，其實是時機的問題。真話要嘛來得太晚、太尖銳，不然就是根本沒來。'),
      pair('What looks like distance is sometimes caution, embarrassment, pride, or simple uncertainty about how to begin.', '看起來像距離的東西，有時候其實是小心、尷尬、自尊，或者只是不知道怎麼開始。'),
    ],
    practices: [
      pair('What helps most is saying the real thing a little earlier and a little more gently than feels natural at first.', '最有幫助的做法，是比本能更早一點、也更溫和一點，把真正的話說出來。'),
      pair('A stronger relationship move is to ask one clarifying question before you defend your own position.', '對關係更有幫助的做法，是先問一個釐清問題，再來保護自己的立場。'),
      pair('It gets easier when you aim for accuracy instead of victory.', '當你追求的是準確理解，而不是輸贏時，事情會容易很多。'),
      pair('The useful habit is to notice the small moment where you still have a choice about tone.', '真正有用的習慣，是看見那個你對語氣還有選擇權的小時刻。'),
    ],
    languageTips: [
      pair('Good relationship English is usually simple English. The more human the sentence sounds, the safer it feels to hear.', '談關係時好用的英文通常是簡單的英文。句子越像人說的話，聽起來就越安全。'),
      pair('A useful sentence names your experience without pretending to define the other person completely.', '好用的句子，會先說出你的經驗，而不是假裝自己已經把對方整個定義完了。'),
      pair('The best wording often makes room for both honesty and dignity at the same time.', '最好的說法，往往會同時替誠實和尊嚴都留出空間。'),
    ],
    closings: [
      pair('Real connection is rarely built from perfect conversations. It is built from enough honest ones.', '真正的連結很少是靠完美的對話建立起來的，它是靠足夠多次誠實的對話建立起來的。'),
      pair('Most relationships become stronger not when tension disappears, but when people learn how to carry it without hiding.', '大多數關係變強，不是因為張力消失，而是因為人學會了怎麼不躲藏地帶著它往前走。'),
      pair('What people remember most is often not the clever sentence. It is whether they felt respected while the truth was being said.', '人最記得的通常不是哪一句最聰明，而是當真話被說出來時，自己有沒有被尊重。'),
    ],
  },
  work: {
    partTitles: [
      [
        'Part 1 — Where the Work Gets Real',
        'Part 2 — The Pressure Inside the Role',
        'Part 3 — Clear Language at Work',
        'Part 4 — A Better Professional Move',
        'Part 5 — What Reliable Work Actually Looks Like',
      ],
      [
        'Part 1 — The Everyday Moment That Matters',
        'Part 2 — Where the Friction Builds',
        'Part 3 — Saying It Precisely',
        'Part 4 — A Work Habit That Holds Up',
        'Part 5 — What You Want People to Trust',
      ],
    ],
    fallbackScenes: [
      pair('when a task sounds simple until you are the person accountable for the outcome', '當一件事聽起來很簡單，但真正要對結果負責的人變成你時'),
      pair('when the meeting ends and everyone heard something slightly different', '當會議結束了，而每個人聽到的重點其實有點不一樣的時候'),
      pair('when speed becomes more visible than thought, even though thought is what the situation really needs', '當速度變得比思考更顯眼，儘管眼前的情況真正需要的是思考的時候'),
      pair('when you are switching between urgent things and can feel the quality starting to slip', '當你在幾件急事之間切換，而且已經感覺到品質開始往下掉的時候'),
      pair('when the professional version of you has to stay calm before the personal version of you has caught up', '當職場上的你得先保持冷靜，而內在的你其實還沒跟上的時候'),
    ],
    tensions: [
      pair('Work gets harder the moment clarity and pressure stop arriving in the same proportion.', '工作一旦變難，常常就是因為清楚感和壓力不再成比例地一起來。'),
      pair('Many work problems are really coordination problems that nobody named early enough.', '很多工作問題其實是協調問題，只是沒有人夠早把它說出來。'),
      pair('People often sound less clear at work not because they lack ideas, but because the stakes make them rush the thinking.', '人們在工作上聽起來不夠清楚，常常不是因為沒想法，而是因為風險感讓思考變得太趕。'),
      pair('Professional pressure becomes expensive when everyone keeps trying to look fine instead of surfacing the real issue.', '職場壓力變得昂貴，往往是因為每個人都在努力看起來沒事，而不是把真正的問題浮出來。'),
    ],
    practices: [
      pair('What helps is deciding the next useful move before you try to solve the entire situation at once.', '有幫助的做法，是在你想一次解決整個局面之前，先決定下一個有用的動作。'),
      pair('A reliable work habit is naming the decision point clearly instead of circling it politely for too long.', '一個可靠的工作習慣，是把決策點說清楚，而不是太客氣地繞著它打轉太久。'),
      pair('It gets easier when you trade performative busyness for visible priorities.', '當你把表演式的忙碌換成看得見的優先順序時，事情會容易很多。'),
      pair('The useful move is to communicate one beat earlier than the stress tells you to.', '真正有用的做法，是比壓力要你做的還早一拍去溝通。'),
    ],
    languageTips: [
      pair('Strong work English is usually structured English: context, pressure, decision, next step.', '好用的工作英文通常是有結構的英文：背景、壓力、決定、下一步。'),
      pair('The clearer your work language is, the less energy everybody wastes guessing what matters.', '你的工作語言越清楚，大家就越不用浪費力氣猜到底什麼才重要。'),
      pair('A useful sentence at work often sounds calm even when the situation is not calm at all.', '在工作裡，好用的句子常常聽起來很冷靜，即使情況一點也不冷靜。'),
    ],
    closings: [
      pair('Good work is rarely only about skill. It is also about whether other people can trust how you think under pressure.', '好的工作很少只和能力有關，它也和別人能不能信任你在壓力下怎麼思考有關。'),
      pair('Reliability grows when people stop managing appearances and start managing reality together.', '可靠這件事，會在大家不再只管理表面，而開始一起管理現實時長出來。'),
      pair('A mature professional voice is not loud. It is clear enough that other people know what to do next.', '成熟的職場聲音不一定很大聲，但它會清楚到讓別人知道下一步該怎麼做。'),
    ],
  },
  growth: {
    partTitles: [
      [
        'Part 1 — The Inner Moment It Starts',
        'Part 2 — Why Growth Feels Uneven',
        'Part 3 — Language for Real Reflection',
        'Part 4 — A Smaller Truer Next Step',
        'Part 5 — What You Carry Forward',
      ],
      [
        'Part 1 — Where the Change Becomes Visible',
        'Part 2 — The Friction Inside Improvement',
        'Part 3 — Saying the Lesson More Clearly',
        'Part 4 — One Practice That Holds',
        'Part 5 — The Part Worth Keeping',
      ],
    ],
    fallbackScenes: [
      pair('when the old way of thinking still feels familiar, even though it no longer fits very well', '當舊的思考方式依然很熟悉，但其實已經不太適合現在的時候'),
      pair('when progress feels invisible from close up and obvious only after distance', '當進步在近看時幾乎看不見，但拉開距離後卻很明顯的時候'),
      pair('when you are no longer who you were, but not yet fully at ease with who you are becoming', '當你已經不是原來的自己，卻也還沒有完全自在地成為正在長成的那個人時'),
      pair('when a hard season leaves behind a lesson you did not want but cannot ignore', '當一段艱難時期留下了一個你本來不想要、卻也無法忽略的教訓時'),
      pair('when you notice that what once felt impossible now feels ordinary', '當你發現曾經覺得不可能的事，現在已經變得很普通的時候'),
    ],
    tensions: [
      pair('Growth feels strange because change is often happening before confidence has caught up to it.', '成長之所以讓人覺得奇怪，是因為改變常常比信心更早發生。'),
      pair('People want progress to feel dramatic, but a lot of the real change arrives quietly.', '人們希望進步有戲劇感，但真正的改變往往來得很安靜。'),
      pair('The hard part is that reflection asks you to look clearly without turning every insight into self-judgment.', '真正困難的是，反思要你看清楚，卻又不能把每一個發現都變成對自己的審判。'),
      pair('A new season becomes confusing when your old identity still knows how to speak more fluently than the new one.', '新的階段之所以容易混亂，是因為舊的身份感通常比新的還更會說話。'),
    ],
    practices: [
      pair('What helps is choosing a next step small enough to honor the lesson without performing the lesson.', '有幫助的做法，是選一個夠小的下一步，讓你能尊重這個教訓，而不是表演這個教訓。'),
      pair('A better practice is to notice the pattern first and redesign the system second.', '比較好的做法，是先看見模式，再來重新設計系統。'),
      pair('It gets easier when you allow the new version of yourself to be real before it feels polished.', '當你允許新的自己先變得真實，而不是先變得漂亮時，事情會容易很多。'),
      pair('The useful move is to keep one promise to yourself that still makes sense on an ordinary day.', '真正有用的做法，是對自己守住一個在平凡日子裡仍然說得通的承諾。'),
    ],
    languageTips: [
      pair('Good reflective English usually names one moment, one shift, and one lesson instead of trying to summarize a whole life at once.', '好用的反思英文，通常是講一個時刻、一個轉變、一個收穫，而不是一次總結整個人生。'),
      pair('Specific language matters here because vague wisdom is easy to admire and hard to live.', '具體語言之所以重要，是因為模糊的道理很容易讓人欣賞，卻很難真的活出來。'),
      pair('A useful sentence often begins with what changed in your experience, not with a slogan about growth.', '好用的句子常常是從你的經驗裡什麼改變了開始，而不是從一個成長口號開始。'),
    ],
    closings: [
      pair('What lasts is rarely the dramatic insight. It is the quieter way you begin to live after the insight.', '真正留下來的很少是戲劇化的頓悟，而是那個頓悟之後你開始採取的較安靜的生活方式。'),
      pair('Growing well often means becoming more honest before you become more impressive.', '成長得好，往往代表你先變得更誠實，而不是先變得更厲害。'),
      pair('A meaningful change usually begins when you stop asking whether the lesson was fair and start asking what it is asking of you now.', '有意義的改變，通常是從你不再只問這個教訓公不公平，而開始問它現在在向你要求什麼開始。'),
    ],
  },
  creative: {
    partTitles: [
      [
        'Part 1 — The Scene That Opens Something',
        'Part 2 — Where Attention Deepens',
        'Part 3 — Language for What You Notice',
        'Part 4 — Keeping the Practice Alive',
        'Part 5 — Why It Matters to Live This Way',
      ],
      [
        'Part 1 — The Ordinary Door into the Topic',
        'Part 2 — What Makes It More Than a Hobby',
        'Part 3 — Speaking About the Experience Clearly',
        'Part 4 — A Gentle Way to Return to It',
        'Part 5 — The Feeling Worth Keeping',
      ],
    ],
    fallbackScenes: [
      pair('when a small sensory detail suddenly makes the world feel more alive than it did five minutes earlier', '當一個很小的感官細節突然讓世界比五分鐘前更鮮活的時候'),
      pair('when you lose track of time because your attention has somewhere meaningful to go', '當你因為注意力終於有了有意義的去處，而忘記了時間的時候'),
      pair('when an ordinary experience becomes memorable because you really noticed it', '當一個普通經驗因為你真的注意到了，而變得值得記住的時候'),
      pair('when the point is no longer productivity, and that is exactly why the experience becomes nourishing', '當重點不再是生產力，而也正因如此，整個經驗反而變得有滋養性的時候'),
      pair('when a practice gives your mind a shape that daily noise usually does not', '當一個練習替你的心提供了一種平常雜訊給不了的形狀時'),
    ],
    tensions: [
      pair('Creative life becomes hard when judgment arrives before curiosity has had enough room to work.', '創作生活之所以變難，常常是因為評價來得比好奇心更早。'),
      pair('A lot of beauty is lost not because it disappeared, but because nobody slowed down enough to meet it.', '很多美之所以失去，不是因為它消失了，而是因為沒有人慢下來和它相遇。'),
      pair('People often wait to feel inspired, even though attention itself is usually what creates the feeling of inspiration.', '人們常常等靈感來，卻忘了很多時候其實是注意力本身創造了靈感的感覺。'),
      pair('The difficult part is returning to the practice before you feel talented, not after.', '真正困難的是在你還沒覺得自己很有天分之前，就先回到那個練習。'),
    ],
    practices: [
      pair('What helps is making the return easy: one page, one walk, one sketch, one song, one small attentive moment.', '有幫助的做法，是讓回去這件事變得很容易：一頁、一段路、一張草圖、一首歌，或一個小小但專注的時刻。'),
      pair('A stronger practice is to protect the attention before you worry about the result.', '比較強的做法，是先保護注意力，再來擔心結果。'),
      pair('It gets easier when you let the work be alive before you ask it to be excellent.', '當你先讓作品活起來，再要求它優秀時，事情會容易很多。'),
      pair('The useful move is to keep a doorway open to wonder in ordinary life.', '真正有用的做法，是在平凡生活裡替驚奇感留一扇門。'),
    ],
    languageTips: [
      pair('Good language here is sensory language: what you saw, heard, felt, noticed, and why it stayed with you.', '這裡好用的語言，是感官語言：你看見了什麼、聽見了什麼、感受到什麼、注意到什麼，以及它為什麼留了下來。'),
      pair('A useful sentence often sounds less like an argument and more like an observation that finally became clear enough to say.', '好用的句子，常常比較像一個終於足夠清楚、得以被說出口的觀察，而不是一場論證。'),
      pair('Specific description makes creative topics sound real instead of decorative.', '具體描述能讓創作相關的主題聽起來真實，而不是只是裝飾性的。'),
    ],
    closings: [
      pair('A creative life is not only about producing things. It is also about staying available to what moves you.', '創意生活不只是產出東西而已，它也關於你有沒有持續對真正觸動你的事保持可接近。'),
      pair('What matters is not only what you make, but what kind of attention you become capable of through making it.', '重要的不只是你做出了什麼，而是透過創作，你變得能夠擁有什麼樣的注意力。'),
      pair('A lot of joy returns the moment you stop asking whether the experience is impressive enough to count.', '很多快樂，其實是在你不再問這個經驗夠不夠厲害、能不能算數的那一刻回來的。'),
    ],
  },
  tech: {
    partTitles: [
      [
        'Part 1 — Where the System Meets Daily Life',
        'Part 2 — The Trade-Off Hidden Inside It',
        'Part 3 — Language for Talking About the Shift',
        'Part 4 — A More Intentional Way to Use It',
        'Part 5 — What Humans Still Need to Keep',
      ],
      [
        'Part 1 — The Ordinary Moment That Reveals It',
        'Part 2 — Why the Convenience Is Not Free',
        'Part 3 — Saying the Tension More Clearly',
        'Part 4 — One Better Rule for Using It',
        'Part 5 — What to Carry into the Future',
      ],
    ],
    fallbackScenes: [
      pair('when a tool feels useful and slightly controlling at the same time', '當一個工具同時讓你覺得好用又有點被控制的時候'),
      pair('when the system moves faster than your ability to judge what it is doing', '當系統運作得比你判斷它在做什麼的速度還快的時候'),
      pair('when convenience quietly changes what you are willing to notice, remember, or do yourself', '當方便這件事悄悄改變了你願意自己注意、記住，或親自去做什麼的時候'),
      pair('when the question is no longer whether the technology works, but what it is asking you to give up in return', '當問題不再是科技有沒有用，而是它要你拿什麼來交換的時候'),
      pair('when a digital system touches something human enough that values suddenly enter the conversation', '當一個數位系統碰到了足夠人性的部分，於是價值觀突然進入討論的時候'),
    ],
    tensions: [
      pair('Technology becomes difficult to talk about when efficiency hides the human cost too well.', '科技之所以難談，常常是因為效率把人的代價藏得太好了。'),
      pair('The hard part is not only what the tool can do. It is how quickly people start adapting themselves around it.', '真正困難的不只是工具能做什麼，而是人會多快開始反過來配合工具。'),
      pair('A system can be impressive and still require much more judgment than people admit.', '一個系統可以很厲害，但仍然比人們願意承認的還更需要判斷。'),
      pair('Convenience is persuasive because it removes friction immediately, even if the long-term trade is less clear.', '方便之所以有說服力，是因為它立刻消除了阻力，即使長期的交換條件沒那麼清楚。'),
    ],
    practices: [
      pair('What helps is putting one deliberate human pause back into the loop.', '有幫助的做法，是把一個刻意的人類停頓重新放回這個循環裡。'),
      pair('A better rule is to decide what deserves automation and what deserves attention.', '比較好的原則，是先決定什麼值得自動化，什麼值得保留注意力。'),
      pair('It gets easier when the tool serves a clear purpose instead of becoming the environment by default.', '當工具服務的是一個清楚目的，而不是默默變成預設環境時，事情會容易很多。'),
      pair('The useful move is to keep one standard of verification, even when the system sounds confident.', '真正有用的做法，是即使系統聽起來很有把握，也保留一個驗證標準。'),
    ],
    languageTips: [
      pair('Good tech English often names both the gain and the cost. That is what makes the description trustworthy.', '談科技時好用的英文，常常會同時說出得到什麼和付出什麼，這才會讓描述聽起來可信。'),
      pair('A useful sentence here usually connects the system to one ordinary human moment.', '這裡好用的句子，通常會把系統和一個普通的人類時刻連在一起。'),
      pair('Specific language matters because broad opinions about technology get old quickly.', '具體語言之所以重要，是因為對科技的空泛意見很快就會變舊。'),
    ],
    closings: [
      pair('The important question is rarely whether the technology is powerful. It is what kind of human life the power is helping to build.', '重要的問題很少只是科技有沒有力量，而是這份力量在幫忙建造什麼樣的人類生活。'),
      pair('A healthier relationship with technology begins when convenience stops being the only value in the room.', '比較健康的科技關係，往往是從「方便」不再是房間裡唯一的價值開始。'),
      pair('The future usually feels less overwhelming when you remember that judgment, care, and responsibility are still human work.', '當你記得判斷、照顧與責任仍然是人的工作時，未來通常就沒那麼令人不知所措。'),
    ],
  },
}

const TITLE_SCENE_HINTS = [
  { pattern: /(spending habits|how we buy things|psychology of spending|spending)/i, scene: pair('when the extra thing in the basket feels emotionally justified before it feels financially justified', '當你先在情緒上替購物籃裡多出來的那樣東西找好理由，之後才想到金錢上的理由時') },
  { pattern: /(budget|saving money|save money|save up)/i, scene: pair('when rent has just been paid and the rest of the month still looks surprisingly long', '當房租剛付掉，而這個月剩下的日子看起來還意外地長的時候') },
  { pattern: /(negotiating|gett?ing a good deal|good deal)/i, scene: pair('when you are messaging a seller and deciding how to ask about the price without sounding small', '當你正在和賣家傳訊息，猶豫該怎麼談價格才不會顯得自己很小氣的時候') },
  { pattern: /(future of money|cashless|digital wallet)/i, scene: pair('when one person taps a phone to pay and another still reaches automatically for cash', '當一個人用手機感應付款，而另一個人還是下意識伸手去拿現金的時候') },
  { pattern: /(health routine|taking care of yourself|lasting health habits|healthy habit)/i, scene: pair('when a caring choice has to survive an ordinary weekday instead of a motivated one', '當一個照顧自己的選擇，必須撐過平凡工作日，而不是撐過充滿幹勁的一天時') },
  { pattern: /(sleep|recovery)/i, scene: pair('when you are tired enough to know better and still tell yourself one more episode will be fine', '當你已經累到明明知道該睡了，卻還是告訴自己再看一集也沒關係的時候') },
  { pattern: /(mental health at work|stress|burnout|therapy|inner life|wellbeing)/i, scene: pair('when you can keep sounding functional at work even though your inner energy has already dropped sharply', '當你在工作上仍然可以聽起來很正常，但內在能量其實已經明顯掉下來的時候') },
  { pattern: /(eating well|obsessing|balanced meal)/i, scene: pair('when a meal turns into a moral test in your head instead of simply being a meal', '當一頓飯在你腦中變成一場道德測驗，而不再只是一頓飯的時候') },
  { pattern: /(when you get sick|doctor visit|sick)/i, scene: pair('when your body forces the pause you would never have given yourself voluntarily', '當你的身體逼你停下來，而那個停下原本是你自己不會主動給自己的時候') },
  { pattern: /(exercise|fitness|movement|work out|sports)/i, scene: pair('when the version of movement that helps your life is not the version that looks most impressive from outside', '當真正對你生活有幫助的運動方式，並不是從外面看起來最厲害的那一種時') },
  { pattern: /(schedule|my week|time and schedules|time at work)/i, scene: pair('when you look up and realize the day was full but strangely hard to account for', '當你一抬頭，發現整天都很滿，卻又很難說清時間到底花去哪裡的時候') },
  { pattern: /(morning routine|morning)/i, scene: pair('when the first thirty minutes of the day quietly decide the tone of everything that follows', '當一天的前三十分鐘悄悄決定了後面所有事情的基調時') },
  { pattern: /(evenings|after work)/i, scene: pair('when the workday technically ended but your mind did not get the message', '當下班這件事在形式上已經發生，但你的腦袋完全沒有收到通知的時候') },
  { pattern: /(weekends|rest|play|meaning|slow living)/i, scene: pair('when free time arrives and you notice how hard it is to let it be free', '當空下來的時間真的來了，而你也因此發現自己有多難讓它真正空著的時候') },
  { pattern: /(women's time|invisible labor|reclaiming your hours)/i, scene: pair('when a day looks normal from the outside but is being held together by work nobody is naming', '當一天從外面看起來很普通，但其實是靠沒有人點名的勞務在撐著的時候') },
  { pattern: /(friends|friendship|best friend|new friends|long-distance)/i, scene: pair('when you are deciding whether to reach out, stay quiet, or trust that the connection can hold one more ordinary silence', '當你正在想是要主動聯絡、先沉默，還是相信這段關係能撐過又一次平凡的沉默時') },
  { pattern: /(social media)/i, scene: pair('when a friendship starts being measured through updates and reactions instead of actual contact', '當一段友誼開始透過更新和反應被衡量，而不是透過真正的往來時') },
  { pattern: /(family|parents|siblings|aging parents|chosen family)/i, scene: pair('when old family patterns appear so quickly that you feel yourself becoming an earlier version of you', '當舊的家庭模式出現得太快，快到你覺得自己又變回了更早以前的那個自己時') },
  { pattern: /(gatherings|gatherings)/i, scene: pair('when everyone is in the same room and the history in that room is bigger than the conversation itself', '當每個人都在同一個房間裡，而這個房間裡的歷史其實比眼前的對話還要大得多的時候') },
  { pattern: /(colleagues|teamwork|working together|team connection)/i, scene: pair('when the quality of the work depends less on talent and more on whether people can coordinate cleanly', '當工作品質真正取決的，與其說是能力，不如說是大家能不能乾淨地協作的時候') },
  { pattern: /(feedback)/i, scene: pair('when someone is trying to help you improve and your first instinct is still to protect your ego', '當有人其實是在幫你進步，但你的第一個本能仍然是先保護自尊的時候') },
  { pattern: /(difficult colleague)/i, scene: pair('when one person changes the emotional temperature of the room before they say very much at all', '當一個人在還沒說多少話之前，就已經改變了整個房間情緒溫度的時候') },
  { pattern: /(leading|being led|leader|leadership|influence without authority|building and leading teams|leading yourself)/i, scene: pair('when people start taking cues from how you act long before they agree with every word you say', '當人們早在完全同意你說的每一句話之前，就已經開始從你的做法裡讀取方向的時候') },
  { pattern: /(meeting|discussion|speaking up)/i, scene: pair('when the conversation is moving quickly and you have to decide whether to stay silent or make the room clearer', '當對話快速往前走，而你得決定是保持沉默，還是讓整個房間變得更清楚的時候') },
  { pattern: /(networking|gatherings|hosting|reading the room|awkward|invitations|exclusion|saying no)/i, scene: pair('when a social situation asks you to be both present and self-aware at the same time', '當一個社交場合要求你同時既要在場，也要有自我覺察的時候') },
  { pattern: /(personality|impression|introversion|extroversion|traits|flaws|becoming more fully yourself)/i, scene: pair('when the version of you other people see is not exactly the version you feel from the inside', '當別人看見的你，和你從裡面感受到的自己其實不完全一樣的時候') },
  { pattern: /(communication|direct|indirect|listening|voice notes|texting|questions|speaking clearly)/i, scene: pair('when what you meant, what you said, and what the other person heard stop being the same thing', '當你本來的意思、你說出口的話，和對方聽見的內容不再是同一件事的時候') },
  { pattern: /(help|kindness|support|lend a hand|apology|repair|trust|conflict|forgiveness|fight)/i, scene: pair('when the relationship starts depending on whether someone is willing to go first with honesty or repair', '當一段關係開始取決於有沒有人願意先跨出誠實或修補的那一步時') },
  { pattern: /(what i do|your job|introduce your role|purpose, meaning, and work|how to talk about your work|career changes|career development|skills you use every day|job|role)/i, scene: pair('when you have to explain what you do in plain language instead of hiding inside your title', '當你得用白話真正說明自己的工作，而不是躲在職稱裡的時候') },
  { pattern: /(deadline|pressure|urgent|prioritizing|last-minute|reliable)/i, scene: pair('when three urgent things arrive at once and you can feel your judgment trying not to split in half', '當三件急事同時來，而你也感覺自己的判斷力正在努力不要裂成兩半的時候') },
  { pattern: /(problem|uncertainty|mistakes|simplify|creative solution|brainstorm)/i, scene: pair('when the answer is still incomplete but the decision can no longer wait for perfect clarity', '當答案仍然不完整，但決定已經不能再等到完全清楚的時候') },
  { pattern: /(career|success|ambition|mentor|pivot|failure|winning|disappointment)/i, scene: pair('when you realize the thing you were chasing is not the same as the thing you actually want to keep living with', '當你發現自己一直追的那件事，和你真正想長久活在其中的東西，其實不是同一件事的時候') },
  { pattern: /(growth|learning|feedback|curiosity|books|courses|self-directed|improvement|progress)/i, scene: pair('when being a beginner stops being a cute idea and starts feeling like a real demand on your patience', '當當個初學者不再只是可愛的想法，而開始真實考驗你的耐心時') },
  { pattern: /(balance|boundary|overwork|hobby outside work|sustainable week)/i, scene: pair('when the life outside work starts feeling like the first thing that gets negotiated away', '當工作之外的生活開始變成最先被拿來交換掉的那一塊時') },
  { pattern: /(travel|itinerary|culture shock|traveling with other people|return home)/i, scene: pair('when being somewhere unfamiliar suddenly shows you the habits you thought were simply normal', '當身在不熟悉的地方，突然讓你看見那些你原本以為只是理所當然的習慣時') },
  { pattern: /(photography|photo|visual art|art in everyday life|design thinking)/i, scene: pair('when attention changes an ordinary scene before the camera or the drawing tool changes anything', '當在相機或畫筆做任何事之前，注意力本身就先改變了一個普通場景的時候') },
  { pattern: /(music|playlist|song|podcast|audio)/i, scene: pair('when sound reaches a feeling faster than explanation ever could', '當聲音比解釋更快碰到一種感受的時候') },
  { pattern: /(reading|writing|book|journal|writer|storytelling)/i, scene: pair('when words finally give shape to something you had been feeling without fully being able to name', '當文字終於替某種你一直感受到、卻沒有完全命名出來的東西，找到了形狀的時候') },
  { pattern: /(pet|animal)/i, scene: pair('when an animal\'s simple way of being makes your own habits suddenly look more complicated than they need to be', '當動物那種很單純的存在方式，讓你自己的生活習慣突然顯得比必要的還複雜時') },
  { pattern: /(hobby|collect|passion|play)/i, scene: pair('when an interest that looks small from outside quietly becomes one of the places your mind can breathe', '當一個從外面看起來很小的興趣，悄悄變成你心裡少數能呼吸的地方之一時') },
  { pattern: /(nature|outdoors|weather)/i, scene: pair('when stepping outside changes your internal state more quickly than whatever you were trying to think your way through', '當你走到外面去，而內在狀態改變的速度竟然比你原本想靠思考解決事情還快的時候') },
  { pattern: /(technology|notifications|device|screen|smart home|digital)/i, scene: pair('when a device wins your attention before you have consciously decided to give it', '當一個裝置在你還沒真的決定要給它注意力之前，就已經先贏走了你的注意力時') },
  { pattern: /\bai\b|artificial intelligence|smarter machines|bias|training data|future of work/i, scene: pair('when a system sounds useful and confident enough that you might forget it still needs human judgment around it', '當一個系統聽起來既有用又有把握，讓你差點忘了它周圍仍然需要人的判斷時') },
  { pattern: /(environment|sustainability|climate|waste|sustainable)/i, scene: pair('when a global issue enters the room through one small daily choice you can no longer unsee', '當一個全球性的議題透過一個小小的日常選擇進到你的房間裡，而且你已經無法再假裝沒看見的時候') },
  { pattern: /(change|transition|starting over|letting go|threshold|new beginning|first step)/i, scene: pair('when the old version of life is already ending and the new version still does not fully know how to stand up yet', '當舊的生活已經在結束，而新的生活還不知道要怎麼真正站穩的時候') },
  { pattern: /(values|beliefs|principles|compromise|what matters)/i, scene: pair('when a choice looks practical on the surface but keeps asking you what you actually stand for', '當一個選擇表面上看起來很務實，卻一直逼你回答自己究竟站在哪裡的時候') },
  { pattern: /(future|ahead|tomorrow|predict)/i, scene: pair('when the future stops feeling abstract because it has started changing ordinary decisions in the present', '當未來不再只是抽象概念，而是已經開始改變你現在的普通選擇時') },
  { pattern: /(looking back|reflections|regret|gratitude|leave behind|move forward|year in review|this week's reflections|letter to your future self)/i, scene: pair('when distance finally lets you see the meaning of something that was confusing while you were inside it', '當距離終於讓你看見一件事的意義，而那件事在你身在其中時其實很混亂的時候') },
  { pattern: /(creative|creative voice|self-expression|living a creative life)/i, scene: pair('when making something helps you recognize a part of yourself that daily usefulness usually keeps quiet', '當創作某樣東西幫你認出自己身上一個平常實用生活會讓它安靜下來的部分時') },
  { pattern: /(community|listening|changemakers|differences in community|social good|service)/i, scene: pair('when a place starts feeling like a community because people are carrying more than their own private concerns', '當一個地方開始像個社群，不是因為人住得近，而是因為大家願意承擔超過自己私事的東西時') },
  { pattern: /(culture|cross-cultural|translation|language|bilingual|belonging|who are you when you speak)/i, scene: pair('when language is doing more than carrying information and is also carrying belonging, distance, or identity', '當語言做的不只是傳遞資訊，而同時也在傳遞歸屬感、距離感或身份感的時候') },
  { pattern: /(rest|renewal|doing nothing|sabbath|slow living|thankfulness|gratitude)/i, scene: pair('when stillness arrives and you notice how quickly the mind tries to turn it back into a task', '當安靜真的來了，而你也因此發現頭腦多快就想把它重新變成一項任務的時候') },
]

const DOMAIN_VOICES = {
  money: {
    realizations: [
      pair('People often think the decision begins at the price, but it usually begins in the feeling that arrives just before the price.', '人們常以為決定是從價格開始的，但很多時候真正開始的是價格前面先冒出來的那個感受。'),
      pair('What looks like a tiny purchase can carry a much bigger need for comfort, control, or relief.', '看起來很小的一次消費，背後可能其實帶著更大的舒適感、控制感，或想鬆一口氣的需求。'),
      pair('The choice is often emotionally decided a few seconds before it is logically explained.', '一個選擇常常在情緒上先被決定，邏輯上的解釋只是晚幾秒才跟上。'),
    ],
    misreads: [
      pair('People call it a discipline problem when it is often a comfort problem wearing practical language.', '人們會把它說成自制力問題，但很多時候它其實是披著務實語言的安慰需求。'),
      pair('They assume the hard part is the arithmetic, but the harder part is catching the story that makes the purchase feel harmless.', '大家以為難的是算數，但更難的其實是抓住那個把消費說得好像沒什麼的內在故事。'),
      pair('Many budgets fail not because the numbers are impossible, but because they were designed for calm days and judged on tired ones.', '很多預算失敗，不是因為數字不可能，而是因為它們是在冷靜日子裡設計，卻在疲憊日子裡接受考驗。'),
    ],
    examples: [
      pair('I told myself it was only a little extra, but I could feel I was buying relief as much as the item.', '我告訴自己只是多花一點點，但其實我感覺得到，我買的不只是東西，也是那種想立刻鬆一口氣的感覺。'),
      pair('I said it was a good deal, and only later noticed I had never asked whether I actually wanted it.', '我當下說服自己這很划算，後來才發現我根本沒先問自己到底是不是真的想要。'),
      pair('I was tired enough that paying a little more felt easier than thinking carefully for one more minute.', '我那時已經累到，多花一點錢感覺都比再多想一分鐘來得容易。'),
    ],
    progress: [
      pair('Progress usually looks like fewer emotional justifications and more decisions made while you are still calm.', '所謂進步，通常是情緒性的合理化變少了，而你能在還冷靜的時候先做決定。'),
      pair('A healthier pattern is not dramatic. It is simply easier to repeat on a tired Tuesday.', '比較健康的模式不一定很戲劇化，它只是會在一個疲憊的星期二也比較容易重複做到。'),
      pair('You know it is working when the pause arrives earlier and the regret arrives less often.', '當那個停頓來得更早，而後悔出現得更少時，你就知道它正在發生作用。'),
    ],
    encouragements: [
      pair('Do not aim for perfect control. Aim for one more honest pause than last time.', '不要追求完美控制，只要比上次多出一次誠實的停頓就很好。'),
      pair('Clarity is already progress, even if the numbers are not perfect yet.', '即使數字還不完美，能看清楚其實就已經是進步。'),
      pair('The goal is not to win every purchase. It is to understand the pattern well enough to change it.', '目標不是每一次消費都贏，而是把那個模式看清楚到足以改變它。'),
    ],
  },
  health: {
    realizations: [
      pair('The body usually says the true thing earlier than the mind is ready to admit.', '身體通常比頭腦更早說出真相，只是頭腦還沒準備好承認。'),
      pair('A healthy choice often becomes visible right when the easier, less helpful choice is also within reach.', '一個健康的選擇，往往是在那個更輕鬆、卻沒那麼有幫助的選擇也同時伸手可及時，才真正變得清楚。'),
      pair('People often notice the cost of neglect only after the signal has repeated itself for several days.', '人們常常是在訊號重複了好幾天之後，才真的注意到忽略它的代價。'),
    ],
    misreads: [
      pair('People call it a knowledge problem when it is often an energy problem.', '人們會把它說成知識不足，但很多時候它其實是能量不足。'),
      pair('They assume the issue is laziness, when it is often a routine that only works on good days.', '大家以為問題是懶，但很多時候真正的問題，是那套日常只在狀態好的日子才撐得住。'),
      pair('A lot of health advice fails because it sounds wise but asks too much from a tired body.', '很多健康建議之所以失敗，是因為它聽起來很有道理，卻對一個疲累的身體要求太多。'),
    ],
    examples: [
      pair('I knew I needed rest, but I kept treating it like something I had to earn first.', '我明明知道自己需要休息，卻一直把休息當成一個要先賺到手的東西。'),
      pair('I kept saying I was fine, even though my body had already started answering that question for me.', '我一直說自己還好，但其實我的身體早就先替我回答了那個問題。'),
      pair('The healthy option was obvious in theory, but in that moment I mostly wanted the easiest one.', '理論上最健康的選項其實很明顯，但在那個當下，我真正想要的主要只是最容易的那個。'),
    ],
    progress: [
      pair('Progress often looks like noticing the signal sooner, not becoming perfect all at once.', '進步很多時候看起來像是更早注意到那個訊號，而不是一下子變得完美。'),
      pair('A steadier routine usually feels gentle before it feels impressive.', '比較穩的日常，通常是先讓人覺得溫和、做得到，之後才談得上厲不厲害。'),
      pair('You know it is holding when you can still do the helpful thing on an untidy day.', '當你在一個亂七八糟的日子裡還做得到那個有幫助的選擇時，就代表它開始站穩了。'),
    ],
    encouragements: [
      pair('Take the signal seriously even if it looks small. Small signals are how the body stays honest.', '就算訊號看起來很小，也請認真看待它。小訊號本來就是身體誠實的方式。'),
      pair('You do not need a heroic reset. You need one caring move you can repeat.', '你不需要英雄式的大重啟，你需要的是一個能重複做到的照顧自己的動作。'),
      pair('Treating yourself well is still real progress, even if it does not look dramatic from the outside.', '就算從外面看起來不戲劇化，好好對待自己本身就已經是真正的進步。'),
    ],
  },
  time: {
    realizations: [
      pair('People often discover the shape of their day only after the day has already been spent.', '人們常常是在一天已經被花掉之後，才真正看見那一天的形狀。'),
      pair('A schedule can look organized while attention is quietly leaking out of it all day.', '一個行程表可以看起來很整齊，但注意力卻可能整天都在安靜地漏掉。'),
      pair('The clock is not always the loudest problem. Sometimes it is the number of things asking for the same hour.', '最吵的問題不一定是時鐘本身，有時候是太多事情同時來搶同一個小時。'),
    ],
    misreads: [
      pair('People call it a calendar problem when it is often an attention problem.', '人們會把它說成行事曆問題，但很多時候它其實是注意力問題。'),
      pair('They blame themselves for not following a rhythm that was unrealistic from the start.', '大家會責怪自己跟不上，但那個節奏很多時候本來就不切實際。'),
      pair('A lot of time advice fails because it assumes clean days and uninterrupted energy.', '很多時間管理建議之所以失敗，是因為它預設的是乾淨俐落的一天和不被打斷的精力。'),
    ],
    examples: [
      pair('I told myself it would only take ten minutes, and then the whole evening quietly disappeared.', '我告訴自己那只會花十分鐘，結果整個晚上就這樣悄悄不見了。'),
      pair('My calendar looked full, but when I thought back on the day, I still could not say what mattered most.', '我的行事曆看起來很滿，但回頭想那一天時，我還是說不出什麼才是真正重要的。'),
      pair('Nothing huge went wrong, but the small interruptions added up until the day no longer felt like mine.', '那天其實沒有發生什麼大事，但那些小小的打斷一路累積，最後整天都不像是我的了。'),
    ],
    progress: [
      pair('Progress usually looks like protecting one or two anchors before the rest of the day gets noisy.', '進步通常看起來像是，在一天變吵之前先保住一兩個錨點。'),
      pair('A kinder schedule is not emptier by accident. It is clearer on purpose.', '一個比較溫和的行程不是偶然比較空，而是有意識地比較清楚。'),
      pair('You know it is working when the week still resembles what you meant it to be for.', '當這一週仍然像你本來想拿它來過的那種樣子時，你就知道它開始有效了。'),
    ],
    encouragements: [
      pair('Do not try to rescue every hour. Protect one meaningful block and let that teach you something.', '不要試著拯救每一個小時。先保住一段有意義的時間，讓它先教會你一些事。'),
      pair('A better rhythm is allowed to look ordinary. Ordinary is where real life happens.', '比較好的節奏本來就可以看起來很普通，因為真實生活本來就是在普通裡發生。'),
      pair('You are not behind just because the day was messy. Sometimes the skill is learning how to absorb the mess.', '一天很亂不代表你落後了。有時候真正的能力，是學會怎麼吸收那些混亂。'),
    ],
  },
  relationships: {
    realizations: [
      pair('A relationship often shifts in tone before it shifts in words.', '一段關係常常是先在語氣上變了，之後才在字面上變。'),
      pair('People usually feel the distance before they can explain it clearly.', '人們通常是先感覺到距離，之後才說得清楚那到底是什麼。'),
      pair('A small moment between two people can carry far more history than either person says out loud.', '兩個人之間一個很小的時刻，往往帶著遠比雙方說出口更多的歷史。'),
    ],
    misreads: [
      pair('People call it a wording problem when it is often a trust and timing problem.', '人們會把它說成措辭問題，但很多時候它其實是信任和時機的問題。'),
      pair('They focus on being right when the harder task is staying connected while being honest.', '大家會把重點放在誰對，但更難的其實是能不能在誠實的同時仍然維持連結。'),
      pair('A lot of relationship advice fails because it sounds clean while real feelings are not clean at all.', '很多關係建議之所以失敗，是因為它聽起來太乾淨，但真實情緒根本不乾淨。'),
    ],
    examples: [
      pair('I said "It is fine," but what I really meant was "Please notice that this matters to me."', '我嘴上說「沒事」，但我真正的意思其實是「請你注意，這件事對我很重要」。'),
      pair('I thought I was protecting the peace, but really I was just delaying an honest conversation.', '我原本以為自己是在維持平靜，但其實我只是在延後一場該誠實面對的對話。'),
      pair('The awkwardness was not the whole problem. The bigger problem was how quickly both of us started guessing.', '尷尬感不是全部的問題，更大的問題是我們兩個很快就開始各自猜測了。'),
    ],
    progress: [
      pair('Progress usually looks like saying the real thing a little earlier and a little more gently.', '進步很多時候看起來像是，把真正的話更早一點、更溫和一點說出來。'),
      pair('A stronger relationship often sounds simpler, not smarter.', '一段比較強的關係，說出來的話常常是更簡單，而不是更聰明。'),
      pair('You know it is working when honesty no longer feels identical to danger.', '當誠實不再和危險劃上等號時，你就知道它開始在發生作用。'),
    ],
    encouragements: [
      pair('You do not have to say it perfectly. You just have to say it more truthfully than silence would.', '你不需要把它說得完美，你只需要比沉默更誠實一點地把它說出來。'),
      pair('If the conversation matters, a slightly clumsy truth is usually better than a polished distance.', '如果那段對話很重要，一個稍微笨拙的真話，通常也比一個漂亮的距離來得好。'),
      pair('Connection grows when people stop waiting to feel perfectly safe before they become honest.', '連結往往是在大家不再等到「完全安全」才願意誠實時長出來的。'),
    ],
  },
  work: {
    realizations: [
      pair('Work often becomes real the moment responsibility is clearer than comfort.', '工作很多時候是在責任感比舒適感更清楚的那一刻，才真正變得真實。'),
      pair('A lot of pressure at work starts long before anyone says the word "pressure."', '很多工作壓力，早在任何人說出「壓力」這兩個字之前就已經開始了。'),
      pair('People often notice the confusion only after several competent people have already interpreted the task differently.', '人們常常是在好幾個有能力的人已經把同一件事各自解讀成不同版本之後，才發現那裡原來很混亂。'),
    ],
    misreads: [
      pair('People call it an effort problem when it is often a clarity problem.', '人們會把它說成努力不夠，但很多時候它其實是清楚度不夠。'),
      pair('They assume the answer is to work harder, even when the real need is to define the decision point better.', '大家會以為答案是更努力，但很多時候真正需要的是把決策點定義得更清楚。'),
      pair('A lot of work advice fails because it rewards appearances before it rewards coordination.', '很多工作建議之所以失敗，是因為它獎勵的是表面看起來很忙，而不是協作真的變順。'),
    ],
    examples: [
      pair('I kept saying I could handle it, when what I actually needed was a clearer next step.', '我一直說我可以處理，但我真正需要的其實是一個更清楚的下一步。'),
      pair('The meeting sounded productive, but I left realizing we had not actually decided the hard part.', '那場會議聽起來很有效率，但我走出去時才發現，我們其實沒有真的決定最難的那一部分。'),
      pair('I was moving fast enough to look useful, but not slowly enough to think well.', '我移動得夠快，看起來很有用，卻沒有慢到足以好好思考。'),
    ],
    progress: [
      pair('Progress usually looks like fewer surprises at the end because more reality was named earlier.', '進步很多時候看起來像是，最後的意外變少了，因為前面更早把現實說出來了。'),
      pair('A reliable work pattern feels calmer because the next step is visible sooner.', '一個可靠的工作模式會讓人覺得比較穩，因為下一步更早就看得見。'),
      pair('You know it is working when people spend less energy guessing and more energy moving.', '當大家花在猜測上的力氣變少、花在推進上的力氣變多時，你就知道它開始有效了。'),
    ],
    encouragements: [
      pair('Do not try to solve the entire situation in one move. Name the next useful move clearly.', '不要試圖一次解決整個局面，只要把下一個有用的動作說清楚。'),
      pair('Stability at work is often built from earlier clarity, not from bigger effort.', '工作裡的穩定，很多時候是靠更早的清楚，而不是更大的力氣建立起來的。'),
      pair('If the pressure is real, clearer communication is not a luxury. It is part of the work.', '如果壓力是真的，那更清楚的溝通就不是奢侈品，而是工作本身的一部分。'),
    ],
  },
  growth: {
    realizations: [
      pair('Growth often becomes visible only after the old pattern starts feeling a little too small for you.', '成長很多時候要等到舊模式開始顯得有點太小時，才真正變得看得見。'),
      pair('A real inner shift is usually quieter than people expect and more demanding than it first appears.', '真正的內在轉變，通常比人們想像的更安靜，卻也比它一開始看起來更有要求。'),
      pair('People often notice the lesson only after they have already lived through the hard part of it.', '人們常常是在自己其實已經把那段難走的部分活過去了之後，才真正看見那個教訓。'),
    ],
    misreads: [
      pair('People call it a motivation problem when it is often an identity problem.', '人們會把它說成動力問題，但很多時候它其實是身份感的問題。'),
      pair('They wait for a breakthrough, even when the real need is one smaller promise they can actually keep.', '大家會等一個大突破，但很多時候真正需要的，其實是一個比較小、卻真的守得住的承諾。'),
      pair('A lot of self-improvement advice fails because it offers intensity before it offers repeatability.', '很多自我成長建議之所以失敗，是因為它先提供強度，卻還沒提供可重複性。'),
    ],
    examples: [
      pair('I thought I needed a breakthrough, but I actually needed one promise I could keep on an ordinary day.', '我原本以為自己需要的是一個大突破，但我真正需要的，其實是一個在平凡日子裡也守得住的承諾。'),
      pair('The change was real before it felt impressive, and that part was harder to trust than I expected.', '改變其實早就發生了，只是它還沒看起來很厲害，而這一點比我想像中更難相信。'),
      pair('I kept asking whether I was doing enough, when the better question was whether I was doing something I could repeat.', '我一直在問自己做得夠不夠，但更好的問題其實是：我做的是不是一件能重複下去的事。'),
    ],
    progress: [
      pair('Progress usually looks like keeping one smaller promise for longer than you used to.', '進步很多時候看起來像是，你比以前更久地守住了一個比較小的承諾。'),
      pair('A healthier growth pattern feels steadier because it no longer depends on emotional peaks.', '比較健康的成長模式會比較穩，因為它不再依賴情緒高峰。'),
      pair('You know it is working when the new version of you starts feeling ordinary instead of performative.', '當那個新的自己開始感覺很普通，而不是很像在表演時，你就知道它開始站穩了。'),
    ],
    encouragements: [
      pair('Do not wait for a perfect turning point. A small honest step still counts as a turning point.', '不要等一個完美的轉折點，小而誠實的一步本身就算是轉折點。'),
      pair('You are allowed to grow quietly. Quiet growth is still real growth.', '你可以安靜地成長，安靜的成長也是真正的成長。'),
      pair('Take the lesson seriously, but do not turn it into a punishment.', '請認真看待那個教訓，但不要把它變成對自己的懲罰。'),
    ],
  },
  creative: {
    realizations: [
      pair('Creative attention often arrives before confidence does.', '創作性的注意力常常比信心更早到。'),
      pair('A lot of beauty becomes visible the moment somebody slows down enough to really meet it.', '很多美，是在有人真的慢下來與它相遇的那一刻才變得可見。'),
      pair('The practice often becomes real right when the result is still uncertain.', '一個創作練習，往往是在結果還很不確定的時候，才真正變得真實。'),
    ],
    misreads: [
      pair('People call it a talent problem when it is often an attention problem.', '人們會把它說成天分問題，但很多時候它其實是注意力問題。'),
      pair('They wait for inspiration, even when the real need is a doorway back into the practice.', '大家會等靈感來，但很多時候真正需要的，是一扇能回到練習裡的門。'),
      pair('A lot of creative advice fails because it praises outcomes while neglecting the conditions that make noticing possible.', '很多創意建議之所以失敗，是因為它稱讚結果，卻忽略了讓人得以注意到東西的那些條件。'),
    ],
    examples: [
      pair('I was waiting to feel inspired, but the work only started moving when I showed up anyway.', '我本來一直在等靈感，但真正讓作品開始往前走的，是我即使沒靈感也先出現了。'),
      pair('The moment got interesting when I stopped trying to make it impressive and started trying to notice it properly.', '那個時刻之所以變得有意思，是因為我不再急著讓它看起來很厲害，而開始真的去注意它。'),
      pair('I thought I needed a better idea, but what I really needed was ten quieter minutes with the one I already had.', '我原本以為自己需要的是一個更好的點子，但我真正需要的，其實只是和現有那個點子再安靜相處十分鐘。'),
    ],
    progress: [
      pair('Progress usually looks like returning more easily, not producing something impressive every time.', '進步很多時候看起來像是更容易回到練習裡，而不是每次都產出什麼很厲害的東西。'),
      pair('A living practice feels steadier because curiosity comes back faster than judgment does.', '一個活著的練習會比較穩，是因為好奇心回來得比批判更快。'),
      pair('You know it is working when attention itself starts feeling nourishing again.', '當注意力本身又重新開始讓你覺得被滋養時，你就知道它開始有效了。'),
    ],
    encouragements: [
      pair('Do not wait to feel gifted. Stay close enough to the practice to be changed by it.', '不要等到自己覺得很有天分才開始，只要待得夠靠近那個練習，讓它慢慢改變你。'),
      pair('One small return is often more important than one big burst of inspiration.', '一次小小的回來，很多時候比一次大爆發的靈感更重要。'),
      pair('You do not need a masterpiece today. You need a live connection to the work.', '你今天不需要一個傑作，你需要的是和那份創作保持活的連結。'),
    ],
  },
  tech: {
    realizations: [
      pair('Technology usually becomes real the moment it starts changing your behavior before you have fully judged it.', '科技很多時候是在它開始改變你的行為，而你還沒完全判斷清楚它時，才真正變得真實。'),
      pair('A useful tool can also quietly become an environment if nobody keeps naming the boundary.', '一個好用的工具，也可能在沒有人持續命名界線的情況下，悄悄變成整個環境。'),
      pair('Convenience often feels harmless at first because the cost it creates is delayed and human.', '方便在一開始常常看起來沒什麼，因為它創造的代價通常是延後出現、而且很人性的。'),
    ],
    misreads: [
      pair('People call it a tool problem when it is often a judgment problem.', '人們會把它說成工具問題，但很多時候它其實是判斷問題。'),
      pair('They focus on what the system can do, while missing how quickly people start adapting themselves around it.', '大家會把注意力放在系統能做什麼，卻忽略人會有多快開始反過來配合系統。'),
      pair('A lot of tech advice fails because it praises efficiency without asking what kind of attention is being trained.', '很多科技建議之所以失敗，是因為它稱讚效率，卻沒有追問我們正在訓練什麼樣的注意力。'),
    ],
    examples: [
      pair('The tool was saving me time, but it was also training me to stay half-distracted all day.', '那個工具確實在幫我省時間，但它同時也在訓練我整天維持半分心的狀態。'),
      pair('I liked how easy it felt, and only later realized I had stopped checking what I was giving up in return.', '我很喜歡那種很容易的感覺，後來才發現自己已經沒有再檢查，自己到底拿什麼去交換了。'),
      pair('The system sounded confident enough that I almost forgot it still needed my judgment around it.', '那個系統聽起來夠有把握，讓我差點忘了它周圍其實還是需要我的判斷。'),
    ],
    progress: [
      pair('Progress usually looks like putting one human pause back into the loop.', '進步很多時候看起來像是，把一個人的停頓重新放回那個循環裡。'),
      pair('A healthier pattern feels steadier because convenience is no longer the only value making the decision.', '比較健康的模式會比較穩，因為做決定時，「方便」不再是唯一在場的價值。'),
      pair('You know it is working when the tool serves a clear purpose instead of becoming the default atmosphere.', '當工具在服務一個清楚目的，而不是直接變成預設氣氛時，你就知道它開始有效了。'),
    ],
    encouragements: [
      pair('Keep one standard of human judgment, even when the system sounds very sure of itself.', '就算系統聽起來非常有把握，也請保留一個人的判斷標準。'),
      pair('You do not have to reject the tool to use it more consciously.', '你不需要否定這個工具，才能更有意識地使用它。'),
      pair('A small boundary with technology is often more powerful than a dramatic opinion about it.', '對科技設下一個小界線，很多時候比發表一個很戲劇化的大意見還更有力量。'),
    ],
  },
}

function getPhaseConfig(weekNumber) {
  return PHASES.find((entry) => weekNumber >= entry.start && weekNumber <= entry.end)
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function lowerFirst(value) {
  const text = String(value || '').trim()
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function upperFirst(value) {
  const text = String(value || '').trim()
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function sceneClauseZh(value) {
  return String(value || '').trim().replace(/^當/, '')
}

function lowerPhrase(value) {
  const text = String(value || '').trim()
  if (!text) return text
  return text
    .toLowerCase()
    .replace(/\bai\b/g, 'AI')
}

function topicReference(title) {
  const raw = String(title || '').trim()
  if (!raw) return raw
  if (raw.includes(':')) {
    return lowerPhrase(raw.split(':').slice(1).join(':').trim())
  }
  if (/^(why|how|what|when)\b/i.test(raw)) {
    return lowerPhrase(raw)
  }
  return lowerPhrase(buildFocusPhrase(raw) || raw)
}

function titleType(title) {
  const normalized = String(title || '').trim().toLowerCase()
  if (normalized.startsWith('why ')) return 'why'
  if (normalized.startsWith('how ')) return 'how'
  if (normalized.startsWith('what ')) return 'what'
  if (normalized.startsWith('when ')) return 'when'
  if (/(future|ahead|tomorrow)/.test(normalized)) return 'future'
  if (/(review|reflection|looking back|letter)/.test(normalized)) return 'review'
  return 'general'
}

function hashString(value) {
  let hash = 0
  for (const char of String(value || '')) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }
  return Math.abs(hash)
}

function pickBySeed(seed, items) {
  return items[Math.abs(seed) % items.length]
}

function findSceneHint(title) {
  return TITLE_SCENE_HINTS.find((entry) => entry.pattern.test(title))?.scene || null
}

function sentenceStarters(type, terms) {
  const [term1, term2] = terms
  if (type === 'why') {
    return [
      pair(`The reason ${term1.en} became real for me was...`, `對我來說，「${term1.zh}」真正變得有感的一個原因是……`),
      pair(`What changed my mind about ${term2.en} was...`, `讓我改變對「${term2.zh}」看法的是……`),
    ]
  }
  if (type === 'how') {
    return [
      pair(`The step that helped me most with ${term1.en} was...`, `對我來說，最幫得上忙的一步是……（和「${term1.zh}」有關）`),
      pair(`What I had to learn about ${term2.en} the hard way was...`, `關於「${term2.zh}」，我後來才慢慢學會的是……`),
    ]
  }
  if (type === 'what') {
    return [
      pair(`To me, ${term1.en} really means...`, `對我來說，「${term1.zh}」真正的意思是……`),
      pair(`One everyday example of ${term2.en} is...`, `「${term2.zh}」在日常生活裡的一個例子是……`),
    ]
  }
  if (type === 'future') {
    return [
      pair(`What already feels true to me about ${term1.en} is...`, `對我來說，關於「${term1.zh}」已經很真實的一點是……`),
      pair(`One future-facing part of ${term2.en} I keep thinking about is...`, `我一直在想的、和「${term2.zh}」有關的一個未來面向是……`),
    ]
  }
  if (type === 'review') {
    return [
      pair(`Looking back, the turning point around ${term1.en} was...`, `回頭看，和「${term1.zh}」有關的一個轉折點是……`),
      pair(`What I want to carry forward from ${term2.en} is...`, `我想從「${term2.zh}」裡帶著往前走的是……`),
    ]
  }
  return [
    pair(`A moment that changed how I see ${term1.en} was...`, `一個改變我看待「${term1.zh}」方式的時刻是……`),
    pair(`What I am still learning about ${term2.en} is...`, `關於「${term2.zh}」，我還在學的是……`),
  ]
}

function quote(value) {
  return `"${value}"`
}

function exampleIntro(profile, term) {
  return pickBySeed(profile.seed + 21, [
    pair(`I would start with something honest like this, especially if ${quote(term.en)} is part of the story: ${profile.example.en}`, `我會先從一句誠實的話開始，尤其當故事裡有「${term.zh}」時，例如這樣：${profile.example.zh}`),
    pair(`One line I trust in that kind of moment is this: ${profile.example.en} That leaves room for ${quote(term.en)} later.`, `遇到那種時刻時，我很信任的一句開頭是這樣：${profile.example.zh} 這也替後面的「${term.zh}」留下了空間。`),
    pair(`I would give them a line that sounds lived-in, not polished: ${profile.example.en} That is where ${quote(term.en)} can start to breathe.`, `我會給他們一句聽起來像活過的，而不是修得很漂亮的句子：${profile.example.zh} 也就是在這裡，「${term.zh}」才開始有空間呼吸。`),
  ])
}

function languageWrap(profile, term) {
  return pickBySeed(profile.seed + 22, [
    pair(`That is why ${quote(term.en)} works best in concrete language. ${profile.languageTip.en}`, `這也就是為什麼「${term.zh}」在具體語境裡最好用。${profile.languageTip.zh}`),
    pair(`${quote(term.en)} lands better when the sentence stays specific. ${profile.languageTip.en}`, `當句子保持具體時，「${term.zh}」會更容易落地。${profile.languageTip.zh}`),
    pair(`If ${quote(term.en)} sounds forced, it is usually because the scene is still too vague. ${profile.languageTip.en}`, `如果「${term.zh}」聽起來很勉強，通常是因為場景還太模糊。${profile.languageTip.zh}`),
  ])
}

function practiceWrap(profile, term) {
  return pickBySeed(profile.seed + 23, [
    pair(`That is why something like ${quote(term.en)} helps. ${profile.practice.en}`, `這也就是為什麼像「${term.zh}」這樣的做法會有幫助。${profile.practice.zh}`),
    pair(`${quote(term.en)} becomes useful for a simple reason: ${profile.practice.en}`, `「${term.zh}」之所以有用，理由其實很簡單：${profile.practice.zh}`),
    pair(`A move built around ${quote(term.en)} tends to last longer. ${profile.practice.en}`, `圍繞著「${term.zh}」建立的做法，通常會更撐得久。${profile.practice.zh}`),
  ])
}

function makeLine(profile, speaker, en, zh, vocabIndex) {
  const speakerName = speaker === 'a' ? profile.config.speakerA : profile.config.speakerB
  const line = { speaker, speakerName, en, zh }
  if (typeof vocabIndex === 'number') {
    const term = profile.terms[vocabIndex]
    line.vocab = [{ word: term.en, def: term.zh }]
  }
  return line
}

function buildProfile(episode) {
  const config = getPhaseConfig(episode.weekNumber)
  const terms = pickEpisodeTerms(episode)
  const focus = buildFocusPhrase(episode.title) || episode.title
  const domain = THEME_DOMAINS[episode.theme] || 'growth'
  const pack = DOMAIN_PACKS[domain]
  const voicePack = DOMAIN_VOICES[domain] || DOMAIN_VOICES.growth
  const seed = episode.weekNumber * 101 + episode.dayOfWeek * 17 + hashString(episode.title)
  const scene = findSceneHint(episode.title) || pickBySeed(seed + 1, pack.fallbackScenes)
  const tension = pickBySeed(seed + 2, pack.tensions)
  const practice = pickBySeed(seed + 3, pack.practices)
  const languageTip = pickBySeed(seed + 4, pack.languageTips)
  const closing = pickBySeed(seed + 5, pack.closings)
  const titles = pickBySeed(seed + 6, pack.partTitles)
  const type = titleType(episode.title)
  const starters = sentenceStarters(type, terms)
  const realization = pickBySeed(seed + 7, voicePack.realizations)
  const misread = pickBySeed(seed + 8, voicePack.misreads)
  const example = pickBySeed(seed + 9, voicePack.examples)
  const progress = pickBySeed(seed + 10, voicePack.progress)
  const encouragement = pickBySeed(seed + 11, voicePack.encouragements)

  return {
    seed,
    config,
    title: episode.title,
    theme: episode.theme,
    focus,
    focusLower: topicReference(episode.title),
    domain,
    terms,
    scene,
    tension,
    practice,
    languageTip,
    closing,
    partTitles: titles,
    type,
    starters,
    realization,
    misread,
    example,
    progress,
    encouragement,
  }
}

function buildPartOne(profile) {
  const [term1, term2] = profile.terms
  return {
    title: profile.partTitles[0],
    lines: [
      makeLine(profile, 'b', `Do you think people finally see what is really going on ${profile.scene.en}?`, `你覺得人是不是通常會在${sceneClauseZh(profile.scene.zh)}，才真正看見到底發生了什麼？`),
      makeLine(profile, 'a', `Usually, yes. That is when ${quote(term1.en)} stops feeling like a topic and starts feeling personal.`, `通常是。也就是在那個時候，「${term1.zh}」不再像只是個主題，而開始變得很個人。`, 0),
      makeLine(profile, 'b', `And by then ${quote(term2.en)} is often already shaping the choice, even if nobody has named it yet.`, `而且到了那個時候，「${term2.zh}」通常早就已經在影響那個選擇，只是還沒有人把它說出來。`, 1),
      makeLine(profile, 'a', `${upperFirst(profile.realization.en)} That is usually when ${quote(term1.en)} becomes visible.`, `${profile.realization.zh} 也就是在那個時候，「${term1.zh}」開始變得看得見。`),
      makeLine(profile, 'b', `So the first useful skill is not fixing everything at once. It is noticing ${quote(term1.en)} a little earlier.`, `所以第一個真正有用的能力，不是一次把所有事都修好，而是更早一點注意到「${term1.zh}」。`),
      makeLine(profile, 'a', `Right. That is exactly why ${quote(term2.en)} matters here. ${profile.tension.en}`, `對。這也正是為什麼「${term2.zh}」在這裡這麼重要。${profile.tension.zh}`),
      makeLine(profile, 'b', `That makes the role of ${quote(term2.en)} sound much more human than abstract.`, `這樣一來，「${term2.zh}」聽起來就比較像真實的人生，而不是抽象概念。`),
      makeLine(profile, 'a', `It should. Most people understand ${quote(term1.en)} best through one ordinary moment, not through a perfect explanation.`, `本來就該是這樣。大多數人真正理解「${term1.zh}」，都是透過一個普通時刻，而不是透過一個完美解釋。`),
    ],
  }
}

function buildPartTwo(profile) {
  const [,, term3, term4] = profile.terms
  return {
    title: profile.partTitles[1],
    lines: [
      makeLine(profile, 'b', `What do people usually misunderstand once ${quote(term3.en)} starts affecting the situation?`, `當「${term3.zh}」開始影響局面時，人們通常最容易誤解的是什麼？`),
      makeLine(profile, 'a', `${upperFirst(profile.misread.en)} That is why ${quote(term3.en)} gets misread so easily.`, `${profile.misread.zh} 這也就是為什麼「${term3.zh}」這麼容易被看錯。`, 2),
      makeLine(profile, 'b', `So by the time ${quote(term4.en)} shows up, the original plan is already under pressure.`, `所以等到「${term4.zh}」真的出現時，原本的計畫其實已經在承受壓力了。`, 3),
      makeLine(profile, 'a', `Yes, and ${quote(term4.en)} is often where immediate relief starts sounding smarter than it really is.`, `對，而且很多時候，「${term4.zh}」就是那個讓「先求當下舒服」聽起來比它實際上更合理的地方。`),
      makeLine(profile, 'b', `Is that why advice about ${quote(term3.en)} or ${quote(term4.en)} can still fall apart in an ordinary week?`, `這是不是也就是為什麼關於「${term3.zh}」或「${term4.zh}」的建議，到了普通的一週裡還是很容易散掉？`),
      makeLine(profile, 'a', `Exactly. ${profile.tension.en} That is why ${quote(term4.en)} can expose the weak point so quickly.`, `沒錯。${profile.tension.zh} 也因此，「${term4.zh}」很快就會把那個薄弱點暴露出來。`),
      makeLine(profile, 'b', `What early sign tells you ${quote(term4.en)} is starting to pull the whole pattern off course?`, `你會從什麼早期訊號判斷，「${term4.zh}」已經開始把整個模式帶偏了？`),
      makeLine(profile, 'a', `For me, it is when ${quote(term4.en)} starts sounding inevitable instead of optional.`, `對我來說，那個訊號就是：當「${term4.zh}」開始聽起來像是非做不可，而不是可選擇時。`),
    ],
  }
}

function buildPartThree(profile) {
  const [,,,, term5, term6] = profile.terms
  const intro = exampleIntro(profile, term5)
  const languageLine = languageWrap(profile, term6)
  return {
    title: profile.partTitles[2],
    lines: [
      makeLine(profile, 'b', `If someone froze while describing a moment involving ${quote(term5.en)} or ${quote(term6.en)}, what sentence would you give them first?`, `如果有人在描述一個和「${term5.zh}」或「${term6.zh}」有關的時刻時卡住了，你會先給他哪一句？`),
      makeLine(profile, 'a', intro.en, intro.zh),
      makeLine(profile, 'b', `I like that because it leaves room for ${quote(term5.en)} without sounding rehearsed.`, `我喜歡這句，因為它替「${term5.zh}」留下了空間，但聽起來又不會像背稿。`),
      makeLine(profile, 'a', `That is the goal. Phrases like ${quote(term5.en)} and ${quote(term6.en)} work best when they stay close to lived experience.`, `這就是重點。像「${term5.zh}」和「${term6.zh}」這種說法，最有用的時候，就是它們還貼著真實生活。`, 4),
      makeLine(profile, 'b', `So the sentence begins with the moment, and then ${quote(term6.en)} can enter naturally.`, `所以一句話應該先從那個時刻開始，然後再讓「${term6.zh}」自然地進來。`),
      makeLine(profile, 'a', languageLine.en, languageLine.zh, 5),
      makeLine(profile, 'b', `And how would you help someone continue after that first sentence about ${quote(term5.en)}?`, `那如果有人在第一句關於「${term5.zh}」的話之後想繼續講下去，你會怎麼帶？`),
      makeLine(profile, 'a', `I would ask for one more concrete detail: what changed next, what felt hard, or why ${quote(term5.en)} suddenly mattered.`, `我會要他再補一個具體細節：接下來發生了什麼、難的是哪裡，或是為什麼「${term5.zh}」突然變重要了。`),
    ],
  }
}

function buildPartFour(profile) {
  const [,,,,,, term7, term8] = profile.terms
  const practiceLine = practiceWrap(profile, term7)
  return {
    title: profile.partTitles[3],
    lines: [
      makeLine(profile, 'b', `What is one practical change that helps more than people expect once ${quote(term7.en)} becomes part of the picture?`, `一旦「${term7.zh}」進到整個情境裡，有哪一個實際改變會比人們原本以為的更有幫助？`),
      makeLine(profile, 'a', `I would start with ${quote(term7.en)}, because it gives the better choice somewhere solid to land.`, `我會先從「${term7.zh}」開始，因為它會讓那個比較好的選擇有一個更穩的落點。`, 6),
      makeLine(profile, 'b', `So the real win is making the better move repeatable enough that ${quote(term8.en)} can actually hold up.`, `所以真正的重點，是讓那個比較好的做法可以重複到足以讓「${term8.zh}」真的撐得住。`),
      makeLine(profile, 'a', practiceLine.en, practiceLine.zh),
      makeLine(profile, 'b', `And what does ${quote(term8.en)} tell you once the new routine starts?`, `那當新的日常開始之後，「${term8.zh}」會告訴你什麼？`),
      makeLine(profile, 'a', `It shows whether ${quote(term8.en)} is surviving ordinary life, not just your best mood.`, `它會告訴你，「${term8.zh}」到底是在普通生活裡活得下來，還是只在你狀態最好的時候才成立。`, 7),
      makeLine(profile, 'b', `That sounds steadier than hoping ${quote(term7.en)} only works when motivation is high.`, `這聽起來確實比期待「${term7.zh}」只在動力很高的時候才有效，來得穩得多。`),
      makeLine(profile, 'a', `Exactly. That is when ${quote(term8.en)} stops feeling like a slogan and starts feeling stable. ${profile.progress.en}`, `沒錯。也就是在那個時候，「${term8.zh}」不再只是口號，而開始變得穩。${profile.progress.zh}`),
    ],
    }
}

function buildPartFive(profile) {
  return {
    title: profile.partTitles[4],
    lines: [
      makeLine(profile, 'b', `If someone felt discouraged around ${quote(profile.terms[0].en)} or ${quote(profile.terms[2].en)}, what would you tell them?`, `如果有人在「${profile.terms[0].zh}」或「${profile.terms[2].zh}」這件事上感到很挫折，你會對他說什麼？`),
      makeLine(profile, 'a', `${quote(profile.terms[0].en)} does not have to improve all at once. ${profile.encouragement.en}`, `「${profile.terms[0].zh}」不需要一次變好。${profile.encouragement.zh}`),
      makeLine(profile, 'b', `And what do you want them to remember the next time ${quote(profile.terms[1].en)} shows up?`, `那下次當「${profile.terms[1].zh}」再次出現時，你最希望他們記得什麼？`),
      makeLine(profile, 'a', `That is exactly why ${quote(profile.terms[1].en)} matters. ${profile.closing.en}`, `這也正是「${profile.terms[1].zh}」重要的原因。${profile.closing.zh}`),
      makeLine(profile, 'b', `Can you give them one natural English line for that kind of moment, maybe using ${quote(profile.terms[0].en)}?`, `你可以給他們一句適合那種時刻的自然英文開頭嗎？最好也能把「${profile.terms[0].zh}」放進去。`),
      makeLine(profile, 'a', profile.starters[0].en, profile.starters[0].zh),
      makeLine(profile, 'b', `And one more, maybe if they want to reflect on ${quote(profile.terms[1].en)} without sounding too formal?`, `那再來一句呢？如果他們想反思「${profile.terms[1].zh}」，但又不想聽起來太正式。`),
      makeLine(profile, 'a', profile.starters[1].en, profile.starters[1].zh),
    ],
  }
}

function buildKeyPhrases(profile) {
  const patterns = [
    (term) => `She used "${term}" when she explained the exact moment the situation stopped feeling simple.`,
    (term) => `He brought up "${term}" because it named the part of the decision that looked ordinary but was not.`,
    (term) => `A short story using "${term}" usually sounds more natural than a broad opinion.`,
    (term) => `Once they could use "${term}" in one real example, the rest of the conversation became much clearer.`,
  ]

  return profile.terms.map((term, index) => ({
    en: term.en,
    zh: term.zh,
    example: patterns[index % patterns.length](term.en),
  }))
}

function buildEpisode(episode) {
  const profile = buildProfile(episode)
  return {
    weekNumber: episode.weekNumber,
    dayOfWeek: episode.dayOfWeek,
    theme: episode.theme,
    title: episode.title,
    phase: profile.config.phase,
    parts: [
      buildPartOne(profile),
      buildPartTwo(profile),
      buildPartThree(profile),
      buildPartFour(profile),
      buildPartFive(profile),
    ],
    keyPhrases: buildKeyPhrases(profile),
  }
}

function serializeLine(line) {
  const vocab = line.vocab?.length
    ? `, vocab: [${line.vocab.map((item) => `{ word: '${escapeSingle(item.word)}', def: '${escapeSingle(item.def ?? '')}' }`).join(', ')}]`
    : ''
  return `          { speaker: '${line.speaker}', speakerName: '${escapeSingle(line.speakerName ?? '')}', en: '${escapeSingle(line.en ?? '')}', zh: '${escapeSingle(line.zh ?? '')}'${vocab} }`
}

function serializePart(part) {
  return `      {\n        title: '${escapeSingle(part.title)}',\n        lines: [\n${part.lines.map(serializeLine).join(',\n')}\n        ],\n      }`
}

function serializeKeyPhrase(item) {
  return `      { en: '${escapeSingle(item.en)}', zh: '${escapeSingle(item.zh)}', example: '${escapeSingle(item.example)}' }`
}

function serializeEpisode(episode) {
  return `  {\n    weekNumber: ${episode.weekNumber},\n    dayOfWeek: ${episode.dayOfWeek},\n    theme: '${escapeSingle(episode.theme)}',\n    title: '${escapeSingle(episode.title)}',\n    phase: '${episode.phase}',\n    parts: [\n${episode.parts.map(serializePart).join(',\n')}\n    ],\n    keyPhrases: [\n${episode.keyPhrases.map(serializeKeyPhrase).join(',\n')}\n    ],\n  }`
}

function main() {
  const rootDir = process.cwd()
  const metadata = parseEpisodeMetadata(rootDir)
  const episodesToRegenerate = metadata.filter((episode) => episode.weekNumber >= 8)
  const byWeek = new Map()

  for (const episode of episodesToRegenerate) {
    const bucket = byWeek.get(episode.weekNumber) ?? []
    bucket.push(buildEpisode(episode))
    byWeek.set(episode.weekNumber, bucket)
  }

  const episodesDir = path.join(rootDir, 'content', 'episodes')
  let regeneratedCount = 0

  for (const weekNumber of Array.from(byWeek.keys()).sort((a, b) => a - b)) {
    const episodes = (byWeek.get(weekNumber) || []).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    const filePath = path.join(episodesDir, `week-${String(weekNumber).padStart(2, '0')}.ts`)
    const content = `import { Episode } from '../types'\n\nexport const WEEK_${String(weekNumber).padStart(2, '0')}: Episode[] = [\n${episodes.map(serializeEpisode).join(',\n')}\n]\n`
    fs.writeFileSync(filePath, content)
    regeneratedCount += episodes.length
  }

  console.log(`Regenerated ${regeneratedCount} episodes across ${byWeek.size} weeks (W8-W53)`)
}

if (require.main === module) {
  main()
}

module.exports = { buildEpisode }

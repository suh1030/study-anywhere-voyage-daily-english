const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

const CHINESE_UPDATES = {
  'w2-listen-04': '慢慢累積出一套反對某件事的理由，最後越來越不想再做',
  'w2-listen-06': '有意識地放慢節奏，不讓自己一路被匆忙推著走',
  'w2-speak-02': '一開始就帶著餘裕和穩定感，而不是從慌亂匱乏起步',
  'w2-speak-04': '定下整體氣氛或接下來事情會怎麼發展的基調',
  'w3-listen-03': '穿著會反過來影響注意力、行為和自我感受的現象',
  'w3-listen-04': '在公共或社交場合裡，讓人相處舒服的基本分寸和禮節',
  'w3-speak-02': '把新習慣接在既有習慣後面，讓它比較容易持續',
  'w3-speak-03': '一個地方是否適合步行、走路是否方便安全的程度',
  'w3-speak-04': '把一天切成固定時段，每段只留給特定任務的安排法',
  'w3-speak-05': '旁觀的人越多，越可能沒有人第一個出手幫忙的現象',
  'w4-listen-03': '刻意減少物品和干擾，只留下真正需要之物的生活方式',
  'w4-listen-04': '主動說點話或做點事，讓原本拘謹的氣氛鬆開',
  'w4-listen-05': '讓自己慢慢收尾、從工作切回休息狀態的放鬆過程',
  'w4-speak-02': '自然進到室內的日光，會影響空間感和心情',
  'w4-speak-04': '堆著卻沒整理好的雜物，會讓空間顯得亂而擠',
  'w4-speak-05': '沒有顧到別人感受和方便，顯得不夠體貼',
  'w6-listen-01': '幾個固定選項輪流出現、反覆使用的安排',
  'w6-listen-02': '因為新鮮、沒試過而產生的吸引力',
  'w6-listen-03': '長時間練習後形成的熟練度和真正掌握感',
  'w6-speak-01': '在實驗室培養出的肉類，不必直接屠宰動物',
  'w6-speak-02': '決定做太多之後，判斷力和耐心一起下降的狀態',
  'w6-speak-03': '用餐時讓彼此舒服的基本禮節和分寸',
  'w6-speak-04': '只有熟悉當地生活的人才知道的在地資訊和判斷',
  'w6-speak-05': '同樣做法落在不同人身上，效果本來就會不同的差異',
  'w7-listen-01': '帶來明顯降溫和天氣變化的冷空氣前線',
  'w7-listen-02': '持續不停、幾乎不給人喘息空間的',
  'w7-listen-03': '根據觀察先提出、之後還要再驗證的假設',
  'w7-listen-04': '想到氣候變遷時長期浮現的焦慮、擔心和無力感',
  'w7-listen-06': '把感受或原因錯誤歸到別的事物上',
  'w7-speak-04': '不用冷氣，也靠設計和通風讓空間降溫的方式',
  'w8-listen-01': '平常花錢的固定模式和選擇習慣',
  'w8-listen-02': '把一個月可用的錢先分配好的支出計畫',
  'w8-listen-03': '會突然引發你想花錢的情緒、場景或念頭',
  'w8-listen-05': '希望在特定時間內達成的存錢、還款或理財目標',
  'w8-speak-01': '主要靠刷卡、手機或電子支付完成交易的支付系統',
  'w8-speak-02': '結帳時所有商品加總起來的總金額',
  'w8-speak-03': '每月大致固定、通常不能輕易取消的支出',
  'w8-speak-04': '做某件事後突然得到的一小段快感刺激',
  'w10-speak-03': '躺在床上一直滑手機，讓身體更難真正休息',
  'w11-listen-01': '不只是認識很久，而是可以真心依靠的朋友',
  'w11-listen-04': '原本關係不錯的人後來鬧翻、變得疏遠',
  'w11-listen-05': '一個人或一段關係在生活裡被看見、被注意到的程度',
  'w11-listen-06': '最了解你、也最能互相信任的那種朋友',
  'w11-speak-01': '來自不同文化背景的人慢慢建立起來的友誼',
  'w11-speak-03': '一來一往持續出現的接觸與互動',
  'w11-speak-04': '主動問候對方近況，看看他現在怎麼樣',
  'w12-listen-05': '把卡住的事攤開來說，慢慢談到比較清楚',
  'w12-listen-06': '年紀漸長、開始需要更多照顧的父母',
  'w12-speak-01': '不是血緣家人，卻像家人一樣互相照顧的人',
  'w12-speak-02': '同住在一個家裡、一起過日子的所有人',
  'w12-speak-05': '把近況聊一聊，重新跟上彼此生活',
  'w13-listen-02': '不只指出問題，也能幫人改進的回饋',
  'w13-listen-03': '很常讓合作變難、相處起來有壓力的同事',
  'w13-listen-04': '連很小的細節都要管，讓人幾乎沒有自主空間',
  'w13-speak-05': '把工作交給合適的人負責，而不是全部自己扛',
  'w14-listen-03': '負責招待、安排或讓大家舒服參與的人',
  'w14-listen-05': '大家都知道該說點什麼，卻一時沒人開口的沉默',
  'w14-speak-04': '先開出一個氣氛，讓後面的人知道可以怎麼互動',
  'w15-speak-01': '長期被工作或壓力耗乾後出現的身心倦怠',
  'w15-speak-02': '做事會注意細節，不容易漏掉小地方',
  'w15-speak-05': '即使沒人看見，也盡量照著原則做事的正直感',
  'w16-listen-02': '不把話說死，而是用比較含蓄的方式表達',
  'w16-listen-04': '即使不同意，也努力讓對方保有被尊重的感覺',
  'w16-listen-05': '字面很短很硬，容易讓人感覺冷淡的訊息',
  'w16-listen-06': '不能只用是或不是回答、會讓人多說一點的問題',
  'w16-speak-02': '把原本太直接的話說得比較容易被接受',
  'w16-speak-04': '察覺到別人沒有明說、但其實已經出現的訊號',
  'w16-speak-05': '對要求或說法提出保留、反對或阻力',
  'w17-speak-04': '還沒聽完對方處境，就太快開始給解法',
  'w18-listen-01': '主動把某個敏感或卡住的問題提到檯面上談',
  'w18-listen-04': '把問題輕輕帶過，好像沒那麼重要',
  'w18-listen-06': '在受傷或失望後，慢慢把信任重新建立回來',
  'w18-speak-03': '在沒確認前，就先替對方腦補理由或結論',
  'w21-listen-01': '在時間緊、責任重或情況混亂時仍然要做事',
  'w21-speak-02': '時間很短、幾乎沒有餘裕的交件期限',
  'w22-listen-03': '讓你重新看懂問題的新角度',
  'w23-speak-04': '把某件事說出來並正式承認它的存在或價值',
  'w25-listen-01': '原本期待很高，結果結尾卻平掉或失望的感覺',
  'w25-listen-02': '為了得到某件事而必須放掉另一件事的交換和取捨',
  'w25-listen-04': '原本很糟的經歷後來出現轉機，慢慢走向修復的過程',
  'w25-listen-05': '事情撐不住了，開始整個瓦解或崩開',
  'w25-speak-04': '在團隊裡敢說真話、提問題、承認錯誤而不怕被羞辱的安全感',
  'w25-speak-05': '總覺得大家都在看自己、其實別人沒那麼注意的心理現象',
  'w29-listen-02': '下意識地伸手去拿、去開啟或去依賴某樣東西',
  'w29-listen-04': '不是正式參與，卻在旁邊聽到別人的談話',
  'w29-listen-06': '把注意力真正放到某個人或某件事上的具體行動',
  'w29-speak-05': '只有透過聲音貼近耳朵時，才特別明顯的親密感',
  'w35-speak-04': '幾乎沒在想，只靠習慣自動進行的狀態',
  'w42-listen-01': '把現在選擇放進未來一起考慮的思考方式',
  'w42-listen-02': '根據現在的趨勢一路往後推，做出的延伸預測',
  'w42-listen-03': '一旦做錯，代價和影響都更大的情況',
  'w42-listen-04': '覺得自己的位置、安全感或價值正受到威脅',
  'w42-listen-06': '把自己真正重視的東西想清楚、說明白',
  'w42-speak-01': '事情做完很久之後，結果或回饋才慢慢出現',
  'w42-speak-02': '自己最擔心、也最不希望發生的壞情況',
  'w42-speak-03': '你真正希望靠近、想活成的未來樣子',
  'w49-listen-01': '幾乎沒剩能量，卻還是硬撐著繼續',
  'w49-listen-05': '高壓結束一鬆下來，身體反而出狀況的放鬆後效應',
  'w49-speak-01': '在理智和觀念層面上，而不一定是身體或情緒真的做到',
  'w49-speak-02': '讓自己重新補回精神和體力',
  'w49-speak-03': '能真的幫人恢復元氣，而不只是短暫分心的',
  'w49-speak-04': '不是順手，而是想過之後有意識地去做',
  'w49-speak-05': '一段靈感少、作品做不太出來的創作低迷期',
  'w1-listen-06': '不只是嚴厲，而是語氣或感受硬到讓人有壓力、不舒服',
}

const EXAMPLE_UPDATES = {
  'w1-speak-01': 'After clearing her desk and turning off notifications, she finally had the mental space to plan the week without panicking.',
  'w1-speak-03': 'Instead of promising to study two hours a day, he chose a small start and reviewed one dialogue on the train.',
  'w4-listen-05': 'Her wind-down starts at nine each night: she puts her phone away, makes tea, and reads until she feels sleepy.',
  'w5-listen-04': 'That dining table still carries history because three generations have argued, laughed, and made up around it.',
  'w5-speak-03': 'Making dumplings together every winter is a living tradition in their family, even though each generation does it a little differently.',
  'w5-speak-05': 'There was still unfinished tension at dinner, so everyone stayed polite but no one truly relaxed.',
  'w34-speak-03': 'Boxing became her best stress outlet because she could leave the gym feeling tired, clearheaded, and less angry.',
  'w36-speak-02': 'Autocomplete can feel like frictionless help, but it also makes it easy to accept a sentence you did not really mean.',
  'w37-listen-04': 'Even during her hardest month, making coffee and walking once around the block stayed her anchor habit.',
  'w37-listen-05': 'His honest check-in sounded simple, but admitting he was not doing well changed the tone of the whole meeting.',
  'w37-speak-01': 'She stopped booking back-to-back weekends because protecting her inner pace mattered more than looking busy.',
  'w37-speak-05': 'Ten minutes of morning light on the balcony helped him wake up earlier without feeling wrecked.',
  'w38-speak-04': 'Tracking online orders for one month exposed a consumption pattern she had been blaming on stress.',
  'w39-listen-02': 'Even after his income improved, the scarcity mindset made every restaurant bill feel slightly dangerous.',
  'w39-listen-05': 'What started as motivation turned into goal pressure once she felt guilty every time she rested.',
  'w40-speak-03': 'The move brought a strong sense of control loss because nothing in the new city worked the way she expected yet.',
  'w41-listen-01': 'When the company asked her to hide the mistake, her core value made the decision for her.',
  'w41-listen-04': 'He talked about family first for years, but quitting the weekend project was his first real act of lived alignment.',
  'w41-listen-05': 'Their meeting got tense, but she kept it as respectful disagreement by challenging the plan without mocking anyone in the room.',
  'w41-speak-01': 'After the layoff scare, value sorting helped him see that health and time mattered more to him than title.',
  'w41-speak-02': 'When the conversation turned messy, her guiding principle was simple: do not say anything you would have to repair tomorrow.',
  'w41-speak-03': 'Her fear of debt was partly social inheritance from parents who had lived through years of instability.',
  'w41-speak-05': 'The convenience test came when it rained; if she only walked when the weather was perfect, it was never really a habit.',
  'w43-listen-06': 'The release decision finally came when she realized she was spending more energy protecting the old life than living the new one.',
  'w43-speak-01': 'His forward intention was clear: he did not just want to leave the job, he wanted to build a calmer way of working.',
  'w44-listen-01': 'Her creative voice became clearer after she stopped copying the tone of writers she admired and started trusting her own sentences.',
  'w44-listen-03': 'Even as a child, his story instinct turned ordinary bus rides into full dramas with characters, motives, and endings.',
  'w44-listen-05': 'The scene worked because the director controlled the emotional rhythm, letting the silence land before the next line.',
  'w44-listen-06': 'Writer attention made her notice tiny things other people missed, like where the conversation changed and why the room suddenly felt colder.',
  'w46-speak-01': 'Neighbors who share childcare and meals do not solve everything, but they keep life possible when a family hits a hard month.',
  'w46-speak-03': 'His listening stance was calm and unhurried, so people told him more than they had planned to.',
  'w46-speak-04': 'The park did not become safer in one summer; patient effort from the same volunteers slowly changed it over years.',
  'w47-speak-01': 'Good bridge-building often starts with one person willing to explain both sides without embarrassing either one.',
  'w48-listen-01': 'Her language-shaped self in English sounded more direct and playful than the version her family knew in Chinese.',
  'w48-speak-05': 'Therapy helped him change the self-story frame from always quitting to staying too long in things that did not fit.',
  'w1-speak-04': 'After losing the old routine, the weekly planning session gave him direction without turning every hour into a rule.',
  'w1-speak-05': 'Leaving the office by six was less about discipline and more about protecting a new pattern he wanted to keep.',
  'w1-speak-02': 'He had to drop a story about always being behind before he could build routines that actually fit his life.',
  'w4-listen-03': 'She turned to minimalism after realizing she spent every weekend managing things she did not even use.',
  'w4-listen-06': 'The room lacked cohesion because every piece felt chosen for a different apartment and a different mood.',
  'w5-listen-01': 'Graduation photos help families mark time by showing how much everyone changed between one year and the next.',
  'w5-listen-02': 'The tradition still feels alive because children, grandparents, and shop owners all join in instead of just watching.',
  'w5-listen-05': 'In their home, the kitchen sits at the center of every family gathering because that is where stories and apologies happen.',
  'w5-listen-06': 'Singing the first chorus together created a shared mood that made even shy guests lean in.',
  'w5-speak-01': 'He always feels flat after a big family event, especially once the noise is gone and the apartment turns quiet again.',
  'w6-listen-04': 'The claim that eating late automatically causes weight gain has been debunked by studies that look at the whole diet.',
  'w6-speak-02': 'By seven o clock, decision fatigue made takeout feel easier than choosing ingredients, cooking, and cleaning.',
  'w6-speak-03': 'Good dining etiquette is less about fancy rules and more about making the table comfortable for everyone there.',
  'w7-speak-05': 'An hour of doom-scrolling climate news left her frightened, overstimulated, and no more ready to act than before.',
  'w25-speak-03': 'Many people drift into overwork without consciously choosing it, then wonder why the exhaustion feels so personal.',
  'w28-speak-04': 'Adding negative space around the bowl made the breakfast photo feel calmer and drew your eye straight to the fruit.',
  'w30-listen-05': 'Blank page pressure hit the moment he opened the document, even though he had spent all morning thinking about what to say.',
  'w30-speak-02': 'The unread book still represented attention, reminding her that she wanted a life with more depth than scrolling allowed.',
  'w31-speak-05': 'Real wildness asks for respect rather than possession, which is why the guide told us to watch quietly from afar.',
  'w32-listen-06': 'Her watercolor habit stayed a private practice for years, done after dinner with no plan to post or sell anything.',
  'w32-listen-04': 'The pottery class forced her back into a beginner mindset, where asking basic questions became part of learning well.',
  'w32-speak-02': 'Developing film became his after-work ritual twice a week, helping his mind leave the office before he went home.',
  'w32-speak-03': 'Her postcards became a personal archive of her twenties, each one holding a place, a mood, and a version of herself.',
  'w32-speak-04': 'Painting helped her meet the off-the-clock self she had been missing under deadlines, meetings, and constant usefulness.',
  'w32-speak-05': 'The competence gap felt frustrating, but it also showed her that she was finally trying something difficult enough to teach her.',
  'w33-listen-03': 'Checking the same tree each morning became a micro-ritual that told him more about the season than the weather app did.',
  'w33-listen-04': 'She stopped chasing a dramatic breakthrough and trusted the steady climb of showing up every weekend.',
  'w33-speak-05': 'Lunch on the rock felt like earned rest because they had been climbing since sunrise and had not complained once.',
  'w34-listen-01': 'His movement habit started with ten-minute walks after dinner, which felt small enough to repeat even on hard days.',
  'w34-listen-04': 'Good sportsmanship showed up most clearly after the loss, when she thanked the other team before speaking to her coach.',
  'w34-speak-01': 'Body respect changed the tone of her training completely because she stopped treating exhaustion as proof of effort.',
  'w34-speak-04': 'The enjoyment factor mattered more than he expected, because the only routine he kept was the one he did not dread.',
  'w34-speak-05': 'His pressure response told the coach more than the score did, especially when the match stopped going his way.',
  'w36-listen-01': 'The AI assistant drafted the reply in seconds, but she still had to check the tone, facts, and names herself.',
  'w36-listen-02': 'AI is often strong with a pattern task like summarizing notes, but weaker when the situation breaks the usual template.',
  'w36-listen-03': 'AI created a major workflow shift in the team by turning first drafts into editing work instead of blank-page work.',
  'w36-listen-06': 'The quality of training data shapes the system deeply, especially when it has to handle accents, slang, or rare cases.',
  'w36-speak-01': 'Tool literacy will matter in almost every profession, because people need to judge what the system can and cannot be trusted to do.',
  'w36-speak-04': 'He used it mainly as a first draft tool, then rewrote the response so it sounded like a real person.',
  'w36-speak-05': 'What worried her most was the confidence mismatch, because the answer sounded certain even when it was partly wrong.',
  'w37-listen-01': 'Ignoring the body signal only made the week harder, since the headaches had been warning him to slow down for days.',
  'w37-listen-02': 'Her mental bandwidth was clearly lower than usual, so even answering simple messages started to feel expensive.',
  'w37-speak-03': 'He was finally learning to name his inner weather instead of calling every low mood laziness.',
  'w37-speak-04': 'He noticed the anxious loop before it got worse and chose to call a friend instead of spiraling alone.',
  'w38-listen-02': 'Climate scale can make even caring people shut down, because the problem feels larger than any single action.',
  'w38-listen-03': 'The accumulated effect of hundreds of small design choices mattered more than one dramatic speech from the mayor.',
  'w38-listen-05': 'Climate guilt can either freeze people or move them, depending on whether they still feel any sense of agency.',
  'w38-speak-01': 'Civic imagination grows when people can picture a neighborhood run for care, not just traffic and profit.',
  'w38-speak-03': 'The helpless feeling hit him after reading the report, but it eased once he joined a local repair group.',
  'w38-speak-05': 'Single-use packaging was everywhere in the office kitchen, from sauce cups to plastic forks used for one lunch.',
  'w39-listen-01': 'Understanding his money story helped him see why a normal expense could still feel like a personal failure.',
  'w39-listen-03': 'The budget trade-off became clear when she realized each weekend trip meant delaying the course she wanted to take.',
  'w39-listen-04': 'It started as an awkward conversation about rent, but it ended with both roommates finally saying what they needed.',
  'w39-speak-01': 'Money calm felt more valuable than looking rich, so she chose a smaller apartment and slept better.',
  'w39-speak-03': 'Her financial identity had been shaped very early by watching adults treat money as either safety or shame.',
  'w39-speak-04': 'Intentional spending helped him feel calmer about money because each purchase matched a real priority.',
  'w40-listen-01': 'The whole month felt like a transition period, with half her habits gone and the new ones not steady yet.',
  'w40-listen-02': 'Under stress, he kept returning to the familiar pattern of overexplaining, apologizing, and taking on too much.',
  'w40-listen-03': 'The role shift changed more than her schedule; it changed who asked her for help and who stopped asking at all.',
  'w40-listen-05': 'Her core value stayed clear even in the new job, especially when success started asking her to ignore what mattered.',
  'w40-speak-01': 'He was trying not to fear the uncertain path, even though the next good step was still not the whole plan.',
  'w40-speak-02': 'He could feel the old identity losing its grip each time he introduced himself without mentioning the title he used to need.',
  'w40-speak-04': 'His self-image was changing faster than he expected once he stopped performing competence in every conversation.',
  'w40-speak-05': 'He was trying to respect his beginner energy by asking simpler questions instead of pretending he already knew the field.',
  'w41-listen-02': 'The family script was still shaping her choices, especially the part that said rest had to be earned.',
  'w41-listen-03': 'Belief revision can feel slower than people expect because old ideas keep showing up in daily decisions.',
  'w41-speak-04': 'The certainty crack came from one small question that she could not answer honestly anymore.',
  'w43-listen-02': 'Personal distance made the year easier to read, because she was no longer trapped inside every unfinished feeling.',
  'w43-listen-04': 'A shaping moment stayed with her for years, not because it was dramatic but because it changed what she noticed after.',
  'w43-listen-05': 'A mixed feeling is often the honest feeling when relief, grief, and doubt all arrive in the same week.',
  'w44-listen-02': 'Ordinary beauty changed the mood of the room when late sunlight hit the sink full of cups and made everyone pause.',
  'w44-listen-04': 'A design lens changed how she saw the problem, turning a messy room into a question of flow, light, and use.',
  'w44-speak-03': 'Everyday art is easier to miss than to find, which is why he started photographing laundry lines, lunch trays, and bus windows.',
  'w44-speak-04': 'Narrative order made the memory easier to hold, because the story finally had a beginning, a break, and an aftermath.',
  'w45-listen-05': 'Attention shrink made the team miss the bigger risk, because everyone was stuck reacting to the loudest problem in front of them.',
  'w45-listen-06': 'Self-leadership showed up in how she handled the delay, choosing clarity and pacing instead of passing stress to everyone else.',
  'w45-speak-02': 'His calm direction helped the team focus again when the plan changed twenty minutes before the presentation.',
  'w45-speak-05': 'Clarity of safety helped people speak more honestly because they knew disagreement would not be punished.',
  'w46-listen-01': 'Shared support changed the whole situation for them, because one parent no longer had to carry every emergency alone.',
  'w46-listen-03': 'Steady service mattered more than one big event, since the neighborhood trusted people who kept showing up quietly.',
  'w46-listen-04': 'A healthy community can disagree and still stay intact when people care more about repair than winning.',
  'w46-listen-05': 'The app mattered because it created a lighter burden for volunteers who used to repeat the same coordination work every week.',
  'w46-listen-06': 'Passed-down care shaped how he treated other people, because he had grown up watching adults notice needs before being asked.',
  'w46-speak-02': 'Emotional belonging matters as much as practical help, because people stay where they feel safe to be known.',
  'w47-speak-02': 'The conflict came from a hidden cultural assumption about what counts as polite, not from bad intentions.',
  'w47-speak-05': 'A little ego slowdown made the trip richer, because he stopped trying to sound informed and started asking better questions.',
  'w48-listen-02': 'Inside-the-circle language can feel warm and exclusive at once, especially when everyone else laughs before you understand why.',
  'w48-listen-03': 'Living between worlds changed how she saw herself, because no single language could hold all her loyalties and moods.',
  'w48-speak-02': 'English brought out a more accessible self for him, one that asked directly for help instead of hinting and waiting.',
  'w50-listen-06': 'Every family seems to have its own gratitude style, from saying it out loud at dinner to quietly doing more for one another.',
  'w51-listen-06': 'Trying to control the future tightly made her exhausted, because every delay started to feel like a threat.',
  'w51-speak-02': 'It took time to hear the layered desire underneath what first sounded like a simple wish to quit.',
  'w51-speak-04': 'The routine helped protect effort on bad days, when motivation disappeared but the work still mattered.',
  'w52-listen-01': 'Honest review changed how she planned the next month, because she stopped pretending the old pace had worked.',
  'w52-listen-03': 'Looking back, she realized her body knew first, long before she admitted that the job had become unsustainable.',
  'w52-listen-04': 'Slow adjustment growth was easy to miss at first, because the changes only became visible when she compared seasons.',
  'w52-speak-04': 'The hidden work cost had become too high, even though the visible results still looked impressive from outside.',
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceFieldInCard(source, id, field, value) {
  const pattern = new RegExp(`(id: '${escapeRegex(id)}'[^}]*?${field}: ')([^']*)(')`, 's')
  return source.replace(pattern, `$1${value}$3`)
}

function applyUpdates() {
  const flashcardsDir = path.join(ROOT, 'content', 'flashcards')
  const files = fs.readdirSync(flashcardsDir).filter((file) => file.endsWith('.ts')).sort()
  let filesChanged = 0
  let fieldUpdates = 0
  const missingIds = new Set([...Object.keys(CHINESE_UPDATES), ...Object.keys(EXAMPLE_UPDATES)])

  for (const file of files) {
    const filePath = path.join(flashcardsDir, file)
    let source = fs.readFileSync(filePath, 'utf8')
    const original = source

    for (const [id, chinese] of Object.entries(CHINESE_UPDATES)) {
      if (!source.includes(`id: '${id}'`)) continue
      const next = replaceFieldInCard(source, id, 'chinese', chinese)
      if (next !== source) {
        source = next
        fieldUpdates += 1
      }
      missingIds.delete(id)
    }

    for (const [id, exampleSentence] of Object.entries(EXAMPLE_UPDATES)) {
      if (!source.includes(`id: '${id}'`)) continue
      const next = replaceFieldInCard(source, id, 'exampleSentence', exampleSentence)
      if (next !== source) {
        source = next
        fieldUpdates += 1
      }
      missingIds.delete(id)
    }

    if (source !== original) {
      fs.writeFileSync(filePath, source)
      filesChanged += 1
    }
  }

  return { filesChanged, fieldUpdates, missingIds: [...missingIds] }
}

const result = applyUpdates()
console.log(JSON.stringify(result, null, 2))

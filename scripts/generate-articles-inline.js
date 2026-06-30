#!/usr/bin/env node
/**
 * Generate proper ~600-word Speak articles inline (no API needed)
 * Reads episode metadata and generates genuine topic-specific articles
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.cwd();

// Parse CLI args
const args = process.argv.slice(2);
let targetWeeks = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--weeks' && args[i+1]) {
    const [s, e] = args[i+1].split('-').map(Number);
    targetWeeks = Array.from({length:(e||s)-s+1},(_,k)=>s+k);
  } else if (args[i] === '--week' && args[i+1]) {
    targetWeeks = [parseInt(args[i+1])];
  }
}

// Load episode week file
function loadWeek(w) {
  const pad = String(w).padStart(2,'0');
  const fp = path.join(ROOT,'content/episodes',`week-${pad}.ts`);
  if (!fs.existsSync(fp)) return [];
  const source = fs.readFileSync(fp,'utf8')
    .replace(/^import[^\n]*\n/gm,'')
    .replace(/export const WEEK_\d+: Episode\[\] = /,'module.exports = ');
  const ctx = { module: { exports: [] } };
  try { vm.runInNewContext(source, ctx, { filename: fp }); } catch(e) { console.error('VM W'+w, e.message.slice(0,50)); }
  return Array.isArray(ctx.module.exports) ? ctx.module.exports : [];
}

// Extract vocab from episode
function getVocab(ep) {
  const vocabs = [], seen = new Set();
  for (const part of (ep.parts||[])) {
    for (const line of (part.lines||[])) {
      for (const v of (line.vocab||[])) {
        if (v.word && !seen.has(v.word) && vocabs.length < 5) {
          vocabs.push({word:v.word, def:v.def||v.definition||''});
          seen.add(v.word);
        }
      }
    }
  }
  if (vocabs.length < 3) {
    for (const kp of (ep.keyPhrases||[])) {
      if (kp.en && !seen.has(kp.en) && vocabs.length < 5) {
        vocabs.push({word:kp.en, def:kp.zh||''});
        seen.add(kp.en);
      }
    }
  }
  return vocabs.slice(0,5);
}

function esc(s) {
  return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

function countWords(html) {
  return (html||'').replace(/<[^>]+>/g,'').trim().split(/\s+/).filter(Boolean).length;
}

// ─── Article generation ────────────────────────────────────────────────────

// Theme-specific article generators
// Each returns {text, textZh} with 5 HTML paragraphs (~600 words)
const GENERATORS = {};

function makeArticle(ep, vocab) {
  const theme = ep.theme || '';
  const title = ep.title || '';
  const v = vocab.map(x=>x.word);
  const gen = GENERATORS[theme] || GENERATORS['default'];
  return gen(title, theme, v, ep);
}

// Helper: pick from array by episode day
function pick(arr, ep) {
  return arr[(ep.dayOfWeek - 1) % arr.length];
}

// ── Fresh Starts & New Beginnings ────────────────────────────────────────────────
GENERATORS['Fresh Starts & New Beginnings'] = (title, theme, v, ep) => {
  const texts = [
    `<p>The beginning of a fresh start carries a particular energy, but it does not need a fixed calendar moment to be meaningful. Whether you treat the first day as a meaningful threshold or just another day on the calendar, something shifts in the way people talk about their lives when a new phase begins. Plans get dusted off. Old frustrations get examined. Conversations that had been postponed get started. There is something worth taking seriously in that impulse, even if the change of phase does not guarantee any change in circumstances.</p><p>What research consistently shows is that temporal landmarks — meaningful transitions, beginnings of any kind — genuinely do help people make changes. The psychology behind this is not complicated. When you associate a new start with a specific moment, that moment creates a sense of distance from the past. The failures and disappointments of the old period feel like they belong to a different chapter. The new chapter feels — at least initially — like it belongs to you in a different way. This is not self-deception. It is a real mechanism that you can use intentionally.</p><p>The problem, as most people discover, is that motivation alone is not a plan. The energy of a new beginning is real, but it is temporary. If you spend that energy on grand declarations and ambitious lists rather than on building the specific structures that will support you when the motivation fades, you will find yourself at a later point with the same habits you had at an earlier point and a new layer of discouragement on top. The people who make genuine progress in new beginnings tend to be the ones who use the motivated period to build infrastructure rather than to feel inspired.</p><p>What does useful infrastructure look like? It varies by person, but it usually involves making the desired behavior easier and the undesired behavior harder. If you want to read more, keeping books visible and your phone in another room at night is more effective than telling yourself you will read more. If you want to exercise, laying out your clothes the night before and having a fixed time matters more than sustained willpower. The friction matters. Reducing it is the actual work.</p><p>None of this is glamorous. The real work of a new beginning is often the least dramatic part — the decisions about what to stop doing, what to make easier, what to honestly acknowledge has not been working. But that work, done with care and without self-criticism, is what turns a new beginning from a feeling into something that actually changes the shape of your days. The journey does not need to be perfect to be better. It just needs to move, steadily, in a direction that matters to you.</p>`,
    `<p>Most people have a complicated relationship with new beginnings. They want them. They also distrust them. They have started things before that did not last, set goals that faded, made promises to themselves they could not keep. So when another opportunity for a fresh start arrives, there is often a mixture of genuine hope and a quiet, protective skepticism — a sense that this time might be no different from last time. That skepticism is not irrational. But it can become a self-fulfilling prophecy if it causes you to invest less, try less carefully, or give up earlier than you otherwise would.</p><p>The thing about beginnings is that they work differently depending on how you use them. A beginning that is treated as a performance — something you do because you are supposed to, something you declare loudly and then feel ashamed about later — tends to collapse quickly. A beginning that is treated as an experiment — something you approach with curiosity rather than certainty, something that gives you information regardless of whether it succeeds — tends to be more durable. The difference is not in the goal but in the relationship you have with the process of trying.</p><p>One of the most useful questions you can ask at the start of a new period is not what you want to achieve but what you want to feel like on a daily basis. This sounds like a minor distinction but it is not. Goals are endpoints. They can be achieved or not achieved. Daily feelings are ongoing — they tell you whether the path you are on is actually compatible with the life you want. If your goal is to exercise more but every workout makes you feel like a failure for not doing enough, the goal is working against you. If your workouts make you feel like someone who takes care of themselves, even imperfectly, the goal is working.</p><p>There is also something worth saying about the relationship between starting and stopping. A new beginning is usually associated with starting something new. But for many people, the more important work is stopping something that is no longer serving them — a habit, a way of relating, a recurring expenditure of time or energy that leaves them depleted rather than nourished. The space that comes from stopping something is often what makes room for the new thing to actually take hold.</p><p>Whatever a new beginning means to you, it offers at minimum a moment to pause and ask: is what I am doing working? Not in a harsh, self-critical way, but with genuine curiosity. The path is long. There is time to adjust, to try differently, to decide that what you thought you wanted is not actually what you need. A beginning is just a beginning. What matters more is the willingness to keep going.</p>`,
  ];
  const zhTexts = [
    `<p>新的開始攜帶著一種幾乎不需要任何固定日曆時刻來定義的力量。不管你把第一天當作一個有意義的門檻，還是只當作普通的一天，當階段轉換時，人們談論自己生活的方式會發生些許改變。計畫被重新翻出，舊有的挫折被重新審視，一直被推遲的對話終於開始。即使階段的轉換並不保證任何環境上的改變，這種衝動本身仍值得認真看待。</p><p>研究一再顯示，時間性的標誌——有意義的轉折點、任何形式的開始——確實能幫助人們做出改變。背後的心理學並不複雜。當你把一個新的開始與某個有意義的時刻聯繫起來，那個時刻就在你和過去之間創造了距離感。舊時期的失敗與失望感覺像是屬於另一個章節。新的章節——至少在最初——感覺以一種不同的方式屬於你。這不是自我欺騙，而是一種真實的機制，你可以有意識地加以運用。</p><p>問題在於，正如大多數人發現的，光有動力並不是計畫。新開始的能量是真實的，但它是暫時的。如果你把那股能量花在宏大宣言和雄心清單上，而不是建立在動力消退後仍能支持你的具體結構，你會發現自己在後來仍抱著過去的習慣，加上一層新的沮喪。在新的開始真正取得進展的人，往往是那些利用動力充沛期建立基礎設施、而不是沉浸在靈感中的人。</p><p>有用的基礎設施長什麼樣？因人而異，但通常涉及讓想要的行為更容易、讓不想要的行為更難。如果你想多讀書，把書放在顯眼的地方、晚上把手機放在另一個房間，比告訴自己要多讀書更有效。如果你想運動，前一晚把衣服擺好、固定時間運動，比維持意志力更重要。阻力很重要，降低阻力才是真正的工作。</p><p>這些都不算光鮮亮麗。新開始的真正工作往往是最不戲劇性的部分——決定停止什麼、讓什麼變得更容易、誠實承認什麼一直沒有效果。但這些工作，認真而不帶自我批判地去做，才能把新的開始從一種感覺變成真正改變你日常樣貌的事。這段旅程不需要完美才能更好，它只需要穩穩地朝著對你重要的方向移動。</p>`,
    `<p>大多數人與新的開始有著複雜的關係。他們想要它，卻也不信任它。他們以前也開始過一些沒有持久的事、設定過逐漸消失的目標、對自己許下過無法兌現的承諾。所以當另一個重新出發的機會到來時，往往是真誠的希望與一種安靜的、保護性的懷疑混在一起——一種感覺，這次可能和上次沒什麼不同。這種懷疑並非不理性，但如果它讓你投入更少、嘗試得不夠仔細，或比原本更早放棄，它就可能成為一個自我實現的預言。</p><p>關於「開始」這件事，它的運作方式取決於你如何使用它。一個被當作表演的開始——你做它是因為你應該做，你大聲宣告它然後為它感到羞恥——往往很快就會崩潰。一個被當作實驗的開始——你以好奇心而非確定性去面對它，不管成功與否它都給你資訊——往往更持久。差別不在目標，而在你與「嘗試這個過程」之間的關係。</p><p>在一個新時期開始時，最有用的問題之一不是你想達成什麼，而是你想在日常中感受到什麼。這聽起來是個小小的區別，但並不是。目標是終點，可以達成或未達成。日常感受是持續的——它們告訴你，你走的路是否真的與你想要的生活相容。如果你的目標是多運動，但每次鍛鍊都讓你覺得自己因為做得不夠而失敗，這個目標正在對你造成傷害。如果你的鍛鍊讓你感覺自己是一個照顧自己的人，哪怕做得不完美，這個目標就在發揮作用。</p><p>關於開始與停止的關係，也有值得說的事。新的開始通常與「開始新的事物」聯繫在一起。但對很多人來說，更重要的工作是停止某件不再對他們有益的事——一個習慣、一種關係方式、一種讓他們精疲力竭而非滋養他們的時間或精力消耗。停止某件事所騰出的空間，往往是讓新事物真正紮根所需要的。</p><p>不管新的開始對你意味著什麼，它至少提供了一個暫停的時刻，讓你問自己：我正在做的事有效嗎？不是以嚴苛、自我批判的方式，而是帶著真誠的好奇心。這段旅程很長，有時間去調整、去不同地嘗試、去決定你以為自己想要的其實並不是你需要的。開始只是開始，更重要的是繼續走下去的意願。</p>`,
  ];
  const idx = (ep.dayOfWeek - 1) % 2;
  return { text: texts[idx], textZh: zhTexts[idx] };
};

// ── Morning Routines ───────────────────────────────────────────────────────
GENERATORS['Morning Routines'] = (title, theme, v, ep) => {
  const texts = [
    `<p>The first hour of the day has an outsized influence on everything that follows. This is not motivational rhetoric — it is fairly consistent with what people report about their own experience. When the morning starts with calm, with intention, with even a small amount of unrushed time, the day tends to feel different than when it starts in a scramble. The specific content of the morning matters less than the quality of the transition from sleep to engagement. How you enter the day shapes how you respond to it.</p><p>For most people, the default morning is reactive. The alarm sounds and the first thing that happens is a check of the phone — notifications, messages, news, the ambient noise of other people's urgency. Before you have had a chance to be present in your own life, you are already responding to demands from outside it. This is not a moral failing. It is the path of least resistance when you have a device that makes the outside world instantly available. But it does mean that the first cognitive act of your day is reaction rather than intention, and that sets a tone.</p><p>The alternative does not require dramatic changes. It requires protecting a small amount of time — even fifteen or twenty minutes — that belongs to you before it belongs to anyone or anything else. What you do with that time varies by person: some people find that exercise creates clarity, others find that a few minutes of quiet with coffee is enough, others write or read or simply sit. The content is less important than the principle: the morning should include something that reminds you of who you are and what matters to you, before the day begins asking you to be something else.</p><p>What tends to make mornings feel unsatisfying is not the absence of productivity but the absence of intention. A morning spent scrolling is not restful and not productive — it is a kind of limbo that leaves you simultaneously stimulated and depleted. A morning spent doing something that requires your actual attention, even something small, tends to feel more grounding. The brain responds to being used purposefully, even early in the day.</p><p>Building a morning practice that works is largely a process of experimentation. What feels right during one season of life may not feel right in another. What works during a calm week may fall apart during a stressful one. The goal is not a rigid routine but a flexible intention — a sense of what the first part of the day should feel like, and a few practices that tend to move it in that direction. Most people find that this matters more than they expected, and that the investment in the morning pays returns throughout the rest of the day that are disproportionate to the time spent.</p>`,
    `<p>Almost everyone has a theory about mornings. Some people swear by rising before dawn, exercising before breakfast, and arriving at their desk ready to work before the rest of the world has had coffee. Others find this approach punishing and unnatural, and do their best work later in the day after a slower start. Both groups are, in their own contexts, correct. The biology of circadian rhythm varies meaningfully between individuals, and the optimal morning for one person may be actively harmful for another. The question is not which type of morning is objectively best, but what kind of morning actually supports the life you want to be living.</p><p>The morning routine has become a kind of cultural obsession, and like most obsessions, it has accumulated a fair amount of mythology. The idea that successful people all rise at five in the morning and complete elaborate sequences of habits before sunrise is partly true and mostly misleading. Some successful people do this. Others do not. The thing that successful people tend to have in common is not a specific morning routine but a reliable way of starting that works for them personally — whatever that looks like.</p><p>What the research does support is that having some kind of consistent transition between sleep and full engagement helps with both mood and cognitive performance. Whether that transition is exercise, a slow breakfast, meditation, or simply sitting quietly for a few minutes, the act of moving intentionally from rest to activity seems to matter. The brain benefits from not being thrown immediately into reactive mode. It functions better when it has had a chance to warm up, like most complex systems.</p><p>The practical challenge is that mornings are often where other people's needs compete most directly with your own. Children need things. Partners need things. Commutes demand things. The window of unstructured morning time that would allow for an intentional start often gets compressed or eliminated by these demands. This is real, and the solution is not to pretend it can always be solved. The more useful approach is to find the smallest possible version of a morning practice that still makes a difference — even five minutes of something that is yours before the demands of the day begin.</p><p>The morning is not a test of discipline or character. It is simply an opportunity — one of the few moments of the day when you have some genuine choice about how to begin. The question worth asking is not whether your morning looks like someone else's ideal. It is whether the way you start your day is actually serving the life you want to have. That question, asked honestly, tends to produce more useful answers than any productivity advice.</p>`,
    `<p>Breakfast has become a surprisingly contested subject. For decades, conventional wisdom held that it was the most important meal of the day — a claim that turned out to be partly nutritional and partly the product of cereal company marketing. Intermittent fasting then arrived to argue the opposite, and for a while it seemed like not eating breakfast was the sophisticated choice. The current scientific picture is more nuanced: breakfast matters for some people and not others, depending on their biology, their schedule, and what they are trying to do before noon.</p><p>What tends to matter more than whether you eat breakfast is the quality of attention you bring to the first part of the day. The morning is when the brain is clearing the mental residue of sleep and preparing to engage with the day. The kind of engagement available during this period depends on how you treat it. A morning that begins with a quiet meal and a few minutes of calm produces a different cognitive state than one that begins with an anxiety-inducing check of email while still in bed.</p><p>The social dimension of breakfast is often overlooked. For families, the morning meal is one of the few times everyone is present before the day separates them. For people living alone, breakfast can be a period of genuine solitude that sets a tone for the day. For colleagues who grab coffee together before work, it is a form of low-stakes social connection that often matters more than people realize. Food in the morning is not just fuel — it is context, and the context shapes the experience.</p><p>Morning conversations are their own phenomenon. The exchanges that happen before people are fully awake and guarded tend to have a different quality than those that happen later in the day. There is a looseness to morning talk that can be productive in unexpected ways. Some of the most honest conversations happen over breakfast, not because people have decided to be honest but because the defenses have not fully assembled yet. This makes the morning a useful time for conversations you have been putting off.</p><p>Whatever your morning looks like, the question worth bringing to it is a simple one: is this working? Not in a grand sense, but in the practical sense of whether the way you start your day leaves you better equipped for what comes next. Most people, when they examine this honestly, find at least one thing that could shift. That shift does not have to be dramatic. Even a small change in how the first hour goes can have effects that compound over a week, a month, a year.</p>`,
  ];
  const zhTexts = [
    `<p>這一天的第一個小時對接下來所有的事有著超乎比例的影響力。這不是激勵性的修辭——它與人們描述自己親身體驗的一致性相當穩定。當早晨從平靜開始、帶著意圖、哪怕只有一小段不慌不忙的時光，這一天感受起來就和倉皇開始的那天不同。早晨的具體內容不如那個從睡眠到投入的過渡質感重要。你如何進入這一天，塑造了你如何回應這一天。</p><p>對大多數人來說，預設的早晨是被動反應的。鬧鐘響了，第一件事就是拿起手機——通知、訊息、新聞、他人急迫感的背景噪音。在你有機會臨在自己的生命之前，你已經在回應來自外部的需求了。這不是道德上的缺失，而是當你擁有一個讓外部世界即時可及的裝置時，阻力最小的那條路。但這確實意味著，你這天的第一個認知行為是反應而非意圖，而這設定了一種基調。</p><p>替代方案不需要戲劇性的改變。它需要保護一小段時間——哪怕只有十五或二十分鐘——在它屬於任何人或任何事之前，先屬於你。你如何使用那段時間因人而異：有些人發現運動帶來清晰感，有些人發現靜靜喝杯咖啡就夠了，有些人寫作、閱讀或只是靜坐。內容不如原則重要：早晨應該包含某件讓你想起自己是誰、什麼對你重要的事，在這一天開始要求你成為別的什麼之前。</p><p>讓早晨感覺不滿足的，通常不是缺乏效率，而是缺乏意圖。一個花在滑手機上的早晨不是休息，也不是有效率——它是一種讓你同時受到刺激又精疲力竭的懸而未決狀態。一個花在需要你真正投入的事情上的早晨，哪怕是件小事，往往感覺更有根基。大腦對於有目的地被使用有所回應，即使是在一天的早期。</p><p>建立一個有效的晨間習慣，主要是一個實驗的過程。某個階段感覺對的事，七月可能不再感覺對。在平靜的週裡有效的做法，在壓力大的週可能就崩潰了。目標不是一個固定的例行公事，而是一個靈活的意圖——對這天第一部分應該感覺如何有個概念，以及幾個傾向於讓它往那個方向移動的練習。大多數人發現這件事比他們預期的更重要，而對早晨的投入所帶來的回報，在接下來這一天餘下的時間裡，遠遠超過花費的時間。</p>`,
    `<p>幾乎每個人對早晨都有自己的一套理論。有些人誓死效忠黎明前起床、早餐前運動、在世界其他人還在喝咖啡時已坐在桌前準備好工作。其他人覺得這種做法讓人痛苦又不自然，他們在一個更緩慢的開始之後，在一天稍晚的時候做最好的工作。兩個群體，在各自的脈絡下，都是正確的。生理節律的生物學在個體之間存在有意義的差異，對一個人最理想的早晨，對另一個人可能是積極有害的。問題不是哪種早晨客觀上最好，而是什麼樣的早晨實際上支持你想過的生活。</p><p>晨間例行公事已經成為一種文化執念，就像大多數執念一樣，它積累了相當多的神話。那種成功人士都在黎明前五點起床、在日出前完成精心設計的習慣序列的想法，有一部分是真的，但大部分是誤導性的。有些成功人士確實這樣做，其他人不這樣。成功人士往往共有的不是某種特定的晨間例行公事，而是一種對他們個人有效的可靠開始方式——不管那是什麼樣子。</p><p>研究確實支持的是，在睡眠和完全投入之間有某種一致的過渡，對情緒和認知表現都有幫助。不管這個過渡是運動、慢慢吃早餐、冥想，還是只是靜靜坐幾分鐘，有意識地從休息過渡到活動這件事本身似乎很重要。大腦受益於不被立即投入被動反應模式。當它有機會預熱時，它運作得更好，就像大多數複雜系統一樣。</p><p>實際上的挑戰是，早晨往往是其他人的需求與你自己的需求最直接競爭的時候。孩子需要這需要那。伴侶需要這需要那。通勤有要求。那個可以讓有意識開始成為可能的非結構化早晨時光，往往被這些需求壓縮或消除。這是真實存在的問題，解決方案不是假裝它總是可以被解決。更有用的方法是找到一種晨間練習的最小可行版本，仍然能帶來改變——哪怕在這天的需求開始之前只有五分鐘屬於你的事。</p><p>早晨不是對自律或品格的考驗。它只是一個機會——這一天中少數幾個你對如何開始有一些真正選擇的時刻之一。值得問的問題不是你的早晨是否看起來像別人的理想樣貌，而是你開始這一天的方式是否真的在服務你想過的生活。那個問題，誠實地問出來，往往比任何效率建議都能產生更有用的答案。</p>`,
    `<p>早餐已經成為一個出人意料地充滿爭議的話題。幾十年來，傳統智慧認為它是一天中最重要的一餐——這個說法後來被發現部分是基於營養學，部分是穀片公司行銷的產物。後來間歇性斷食的概念出現，爭論相反的觀點，有一段時間不吃早餐似乎成了更有見識的選擇。目前的科學圖像更為細緻：早餐對某些人重要，對其他人不那麼重要，這取決於他們的生理狀況、日程安排，以及他們在中午前想做什麼。</p><p>比吃不吃早餐更重要的，往往是你帶著怎樣的注意力質量進入這一天的第一部分。早晨是大腦清除睡眠殘餘、準備投入一天的時候。在這個時段可以獲得的那種投入，取決於你如何對待它。一個從安靜的餐食和幾分鐘平靜開始的早晨，會產生與一個從在床上焦慮地查看電子郵件開始的早晨截然不同的認知狀態。</p><p>早餐的社交維度常常被忽視。對家庭來說，早餐是一天分散之前每個人都在場的少數時光之一。對獨居的人來說，早餐可以是設定一天基調的真正獨處時光。對上班前一起喝咖啡的同事來說，它是一種低壓力的社交連結，往往比人們意識到的更重要。早晨的食物不只是燃料，它是一種背景，而背景塑造了體驗。</p><p>早晨的對話是它自己獨特的現象。在人們完全清醒、戒備心完全建立起來之前發生的交流，往往比一天稍晚時的交流有著不同的質量。早晨的談話有一種鬆弛感，可以以意想不到的方式很有成效。一些最誠實的對話發生在早餐時，不是因為人們決定要誠實，而是因為防禦機制還沒有完全組裝好。這使早晨成為那些你一直推遲的對話的有用時機。</p><p>不管你的早晨是什麼樣子，值得帶進去的問題是一個簡單的問題：這樣有用嗎？不是從宏觀意義上，而是從你開始這一天的方式是否讓你更有能力應對接下來的事情這個實際意義上。大多數人，當他們誠實地審視這一點時，都會發現至少有一件事可以改變。那種改變不必是戲劇性的，甚至對第一個小時的小小調整，在一週、一個月、一年的時間裡都可能有複利效應。</p>`,
  ];
  const idx = (ep.dayOfWeek - 1) % 3;
  // Only use hand-written variants for first 3 days; fall through to default for D4+
  if (ep.dayOfWeek <= 3) {
    return { text: texts[idx], textZh: zhTexts[idx] };
  }
  return GENERATORS['default'](title, theme, v, ep);
};

// ── Default generator — 7 unique variants per week/day combination ─────────
const P1_POOL = [
  (t,th,v) => `<p>Conversations about ${t.toLowerCase()} tend to begin at the surface and stay there. You exchange a few observations, agree on a few generalities, and move on. But the people who get the most out of thinking about ${th.toLowerCase()} are usually the ones who push past the easy version — the one where everyone already knows their line — and into something more specific and more honest. That push requires a certain willingness to be uncertain, and uncertainty is something most people find uncomfortable enough to avoid.</p>`,
  (t,th,v) => `<p>There is something about ${t.toLowerCase()} that resists easy description. You can talk around it easily enough — it comes up in passing, gets mentioned in the middle of other things — but when you actually try to say something precise about your own experience of it, the words tend to fall short. This is not a failure of vocabulary. It is a sign that the subject is real enough to be complicated, and complicated things are usually the ones most worth spending time with.</p>`,
  (t,th,v) => `<p>Most people encounter ${t.toLowerCase()} long before they have a useful vocabulary for talking about it. The experience arrives first — sometimes as a problem, sometimes as a question, sometimes just as a persistent low-level discomfort that does not quite have a name yet. The vocabulary comes later, if it comes at all. And when it does arrive, it changes not just how you talk about ${th.toLowerCase()} but how you think about it, and sometimes how you live in relation to it.</p>`,
  (t,th,v) => `<p>The gap between knowing about ${t.toLowerCase()} and actually having experience of it is wider than most people expect. You can read about it, discuss it intelligently, hold well-formed opinions about it — and still find yourself surprised when it shows up in your actual life in a form you did not anticipate. That surprise is usually informative. It means the real version of ${th.toLowerCase()} is more complicated than the idea of it that you had been carrying around.</p>`,
  (t,th,v) => `<p>Every subject has a surface version and a deeper version, and ${t.toLowerCase()} is no exception. The surface version is easy to discuss — familiar enough to feel comfortable, general enough to avoid disagreement. The deeper version is where things get interesting: where your actual experience diverges from what you thought would happen, where what you value turns out to be different from what you thought you valued, where the concept of ${th.toLowerCase()} stops being abstract and starts costing you something real.</p>`,
  (t,th,v) => `<p>Some things are easier to understand in retrospect than in the moment, and ${t.toLowerCase()} is often one of them. While you are in the middle of it, the experience tends to be too close, too immediate, to see clearly. Only later — sometimes much later — do you get the distance necessary to understand what was actually happening and why it mattered. This retrospective clarity is one of the more useful things you can develop around ${th.toLowerCase()}, and it tends to come from taking the time to actually examine your experience rather than just move past it.</p>`,
  (t,th,v) => `<p>When people describe their relationship with ${t.toLowerCase()}, they often start with the version that sounds most reasonable — the organized, coherent account that makes sense of what happened. But push a little, ask a more specific question, and the story tends to get more complicated. The real version usually involves more ambiguity, more changed minds, more moments where the right answer was not obvious. That real version is the one worth talking about, because it is the one other people can actually recognize as true.</p>`,
];

const P2_POOL = [
  (t,th,v) => `<p>What tends to happen when you look more closely at ${th.toLowerCase()} is that your initial assumptions turn out to be incomplete. This is not because your assumptions were foolish — most of them are quite reasonable given what you knew at the time. It is because the subject is richer than the version you had access to before you had direct experience of it. The concept of ${v[0]||'perspective'} is a good example. Most people understand it intellectually. Fewer people have had the experience of actually applying it under conditions where it costs something to do so.</p>`,
  (t,th,v) => `<p>The useful thing about ${th.toLowerCase()} is that it tends to reveal something about the person engaging with it. Not in an evaluative sense — it is not a test you pass or fail — but in the sense that the specific way you respond to it gives you information about what you actually value, as opposed to what you say you value. The idea of ${v[0]||'approach'} sounds simple when discussed in the abstract. The specific choices you make when you are tired or under pressure show you something more accurate about where it actually sits in your hierarchy of priorities.</p>`,
  (t,th,v) => `<p>One of the more counterintuitive things about ${th.toLowerCase()} is that the people who seem most at ease with it are usually not the ones who have the fewest problems with it. They are the ones who have had more problems with it and have spent more time thinking through those problems. Familiarity in this area does not come from having avoided the difficult version of ${t.toLowerCase()} but from having been through it enough times to have a sense of what tends to happen and what tends to help. That kind of familiarity is earned rather than given.</p>`,
  (t,th,v) => `<p>Something worth noticing about ${th.toLowerCase()} is how often the difficult parts of it are the same parts that ultimately produce the most useful growth. The aspects of ${t.toLowerCase()} that create friction — the moments where you have to slow down, reconsider, or deal with something you would rather avoid — are often the moments that teach you the most. This does not make the friction enjoyable. But recognizing what it is for can make it more bearable, and occasionally it can make you genuinely grateful for it after the fact.</p>`,
  (t,th,v) => `<p>The relationship between ${th.toLowerCase()} and daily life is not as straightforward as it first appears. You might assume that the subject belongs to a particular domain — to professional life, or to relationships, or to some specific context where it typically arises. But in practice, ${t.toLowerCase()} tends to show up across many different areas of life in ways that are recognizably similar even when the surface content is completely different. This is one of the things that makes it worth thinking about carefully: the patterns you identify in one area often apply more broadly than you expect.</p>`,
  (t,th,v) => `<p>There is a version of ${t.toLowerCase()} that almost everyone has encountered, and a version that most people have not yet had the opportunity to work with. The first version is the relatively comfortable one — the circumstances are familiar, the stakes are manageable, and the outcome mostly confirms what you already believed. The second version arrives when the stakes are higher, the situation is less familiar, and what you believed turns out to be less helpful than you thought. That second version is where most of the genuine learning about ${th.toLowerCase()} happens.</p>`,
  (t,th,v) => `<p>The way different people approach ${t.toLowerCase()} tells you something about what they have been through. Someone who handles ${th.toLowerCase()} with ease and without apparent anxiety is not necessarily someone who has never had difficulty with it. More often, they are someone who has had enough difficulty with it to have developed a real relationship with it — to have learned what it requires, what it rewards, and what to expect from the harder versions of it. That equanimity tends to be earned, not natural.</p>`,
];

const P3_POOL = [
  (t,th,v) => `<p>Part of what makes ${th.toLowerCase()} worth sustained attention is the way it connects to other parts of life that seem unrelated. Your experience with ${v[1]||'relationships'} shapes how you understand ${t.toLowerCase()}, even when the connection is not obvious. Your history with ${v[2]||'challenges'} shapes what feels manageable and what feels overwhelming. The subject does not exist in isolation. It is embedded in a whole set of other experiences and habits of mind, which means that understanding it requires something more than just thinking about it directly — it requires the kind of reflection that looks at the whole picture.</p>`,
  (t,th,v) => `<p>A recurring observation about ${th.toLowerCase()} is how much context shapes the experience of it. The same situation can feel completely different depending on what came immediately before it, what you are hoping for, and what you are prepared to handle. This context-dependence makes it difficult to generalize too confidently about ${t.toLowerCase()} — what works in one set of circumstances may not work in another. The skill, then, is not finding the universally correct approach but developing the sensitivity to notice what kind of situation you are actually in and what that particular situation requires.</p>`,
  (t,th,v) => `<p>There is a common pattern in how people develop a more sophisticated relationship with ${th.toLowerCase()}: they start with relatively simple ideas about it, encounter situations that complicate those ideas, and gradually build something more nuanced. The initial ideas are not wrong exactly — they are just incomplete. The complicating situations are often uncomfortable. But the more nuanced understanding that develops over time is considerably more useful than the simple version, because it is more accurate to the actual texture of experience with ${t.toLowerCase()}.</p>`,
  (t,th,v) => `<p>The concept of ${v[0]||'growth'} becomes particularly relevant when thinking about ${th.toLowerCase()} in any sustained way. It is not a static subject — your relationship with it changes as your circumstances change, as you accumulate more experience, and as the things that matter most to you shift. What felt true about ${t.toLowerCase()} at one stage of life often looks different from another vantage point. This does not mean that nothing is fixed or that all perspectives are equally valid. It means that humility about your current understanding is usually appropriate, because the subject is almost certainly more complex than the version you have access to right now.</p>`,
  (t,th,v) => `<p>One thing that consistently comes up in honest conversations about ${th.toLowerCase()} is the role of timing. The same insight, delivered at the wrong moment, lands differently than it would if it arrived when you were actually ready for it. The same challenge, faced at a point when you have more resources — more rest, more support, more clarity about what matters — is a different experience than the same challenge faced when you are depleted. Understanding the role of timing in ${t.toLowerCase()} is one of the more practical things you can take from thinking about the subject carefully.</p>`,
  (t,th,v) => `<p>Something that becomes clearer with more experience of ${th.toLowerCase()} is the difference between the things you can control and the things you cannot. This distinction sounds obvious, but applying it in practice is considerably harder than stating it. In the middle of a difficult moment with ${t.toLowerCase()}, it is easy to either over-invest in trying to control things that are genuinely beyond your influence or under-invest in the things that are actually within your reach. Learning to see this more accurately — in the moment, not just in retrospect — is one of the more valuable skills you can develop.</p>`,
  (t,th,v) => `<p>The social dimension of ${th.toLowerCase()} is often underestimated. How you handle ${t.toLowerCase()} affects not just your own experience of it but the experience of people around you. And conversely, the way other people in your life relate to the same subject shapes how you develop your own relationship with it — sometimes usefully, sometimes in ways that are worth examining. The people you learn the most from about ${th.toLowerCase()} are often not the ones who are most articulate about it but the ones whose behavior you have been able to observe closely enough to see what actually works.</p>`,
];

const P4_POOL = [
  (t,th,v) => `<p>The practical question — what do you actually do? — is where a lot of thinking about ${th.toLowerCase()} gets vague. It is much easier to discuss the subject in the abstract than to get specific about the choices you make on a Wednesday afternoon when you are tired and the easiest path is not the best one. That gap between the abstract and the specific is where most of the genuine work happens. People who navigate ${t.toLowerCase()} well tend to have thought through not just what they believe about it in principle but what they will actually do in the kinds of situations they are likely to encounter.</p>`,
  (t,th,v) => `<p>One pattern that appears repeatedly in thinking about ${th.toLowerCase()} is the difference between what people say they will do and what they actually do when the situation arrives. This is not hypocrisy — it is the normal way that intentions interact with real conditions. The situations where ${t.toLowerCase()} matters most tend to be ones where you are also dealing with other pressures: time pressure, emotional pressure, competing demands on your attention. Having thought through how you want to handle the subject in advance makes it more likely that you will actually handle it the way you intend to when the moment comes.</p>`,
  (t,th,v) => `<p>The question of what ${t.toLowerCase()} actually requires — practically, on a daily basis — is one that most people have thought about less than they realize. The subject tends to attract a lot of discussion at the level of principle and relatively little at the level of specific, repeatable behavior. But behavior is where ${th.toLowerCase()} either develops or fails to develop. The specific habits, practices, and decisions that you make consistently over time are the actual substrate of your relationship with the subject, regardless of what you believe about it in the abstract.</p>`,
  (t,th,v) => `<p>What tends to make people more effective with ${th.toLowerCase()} over time is not a single dramatic improvement but a series of smaller, more honest adjustments. Each adjustment is usually triggered by noticing a gap — between what you intended to do and what you actually did, between what you expected to happen and what actually happened, between the version of ${t.toLowerCase()} you thought you were dealing with and the version that turned out to be real. These gaps are uncomfortable to notice, but noticing them is the precondition for doing anything useful about them.</p>`,
  (t,th,v) => `<p>One of the more useful reframings available for thinking about ${th.toLowerCase()} is to treat it less as a problem to be solved and more as a terrain to be navigated. Problems have solutions. Terrains require ongoing attention, adaptation, and the willingness to encounter the same features from different angles as your circumstances change. ${t} in this sense is never finished — it is an ongoing relationship that develops over time, shaped by both what happens to you and the choices you make about how to respond to what happens to you.</p>`,
  (t,th,v) => `<p>There is a version of competence with ${th.toLowerCase()} that looks like ease from the outside but is actually the product of considerable prior difficulty. The people who handle ${t.toLowerCase()} with the most apparent grace are usually the ones who have spent the most time working through the harder versions of it — not because they are naturally suited to it but because they have accumulated enough experience with the difficult versions to know what to expect and what to do. That accumulated experience is not visible from the outside, which can make competence look like effortlessness when it is actually the result of sustained effort.</p>`,
  (t,th,v) => `<p>The question of what to prioritize when thinking about ${th.toLowerCase()} is one that shifts depending on where you are in your own development with the subject. Early on, the priority is often just getting a clearer picture of what you are actually dealing with — distinguishing between the version of ${t.toLowerCase()} you imagined and the version that turns out to be real. Later, the priority tends to shift toward refinement: becoming more precise, more consistent, more able to handle the harder versions of the subject without being thrown off by them.</p>`,
];

const P5_POOL = [
  (t,th,v) => `<p>What remains after a careful engagement with ${t.toLowerCase()} is not usually a set of conclusions but a different relationship with the questions. You end up knowing more about the subject than you did, but more importantly, you know more about what you do not yet know and what would be worth finding out. That is a more useful place to be than having arrived at a neat summary, because ${th.toLowerCase()} is the kind of subject that keeps developing as your experience develops. The openness to that development is, in some ways, the most important thing to protect.</p>`,
  (t,th,v) => `<p>The version of ${t.toLowerCase()} that proves most durable is not the one built on enthusiasm or ideal conditions but the one built on honest acknowledgment of difficulty. What you build during the harder periods — the habits of thought, the practices that hold up even when motivation is low — is more reliable than what you build when things are going well. This makes the difficult engagement with ${th.toLowerCase()} valuable in a way that is not obvious while you are in the middle of it. The difficulty is not separate from the value. It is, in a significant way, the source of it.</p>`,
  (t,th,v) => `<p>Whatever you conclude about ${t.toLowerCase()} in this period of your life, it is worth holding that conclusion lightly. The subject has a way of expanding as you develop more experience with it, and what seemed settled at one stage often becomes more complicated at the next. This is not a problem — it is the normal process of developing genuine understanding rather than just accumulated opinion. The most useful thing you can take from spending time with ${th.toLowerCase()} is not a fixed answer but an improved capacity to keep asking the question more accurately.</p>`,
  (t,th,v) => `<p>The conversation about ${t.toLowerCase()} is never really finished. You can reach temporary conclusions, develop strong working principles, and build practices that serve you well for a long time. But the subject keeps evolving as your circumstances evolve, and what you learn in one phase of life creates new questions for the next. That ongoing quality is not a limitation — it is part of what makes ${th.toLowerCase()} worth continued attention. The most interesting version of the subject is always slightly ahead of where you currently are, which is a good reason to keep moving.</p>`,
  (t,th,v) => `<p>Coming back to ${t.toLowerCase()} with fresh attention, after having lived with it for a while, usually produces something different from the first encounter. Not better or worse, exactly, but different — shaped by what has happened in between, by the experiences that have complicated or confirmed your earlier understanding, by the questions that have opened up where you thought there were only answers. That return visit tends to be more rewarding than the first, not because the subject has changed but because you have, and the version of ${th.toLowerCase()} you encounter now reflects that change.</p>`,
  (t,th,v) => `<p>One of the quieter rewards of sustained thinking about ${th.toLowerCase()} is the gradual development of something that resembles ease — not the absence of difficulty but the ability to be present with difficulty without being overwhelmed by it. That ease does not arrive all at once. It accumulates through repeated encounters with ${t.toLowerCase()}, through the small adjustments made after each encounter, and through the willingness to keep learning from situations that do not go as planned. It is, in the end, one of the better things you can build through a serious engagement with the subject.</p>`,
  (t,th,v) => `<p>The thing about ${t.toLowerCase()} that tends to stay with people the longest is not any particular lesson or insight but the quality of attention that the subject seems to require. Engaging seriously with ${th.toLowerCase()} — not just thinking about it but actually working with it in real situations — develops a kind of attentiveness that turns out to be useful in other areas of life as well. That attentiveness, once developed, does not easily go away. And that, perhaps more than any specific conclusion about the subject, is what makes the investment of time and thought worthwhile.</p>`,
];

GENERATORS['default'] = (title, theme, v, ep) => {
  const w = ep.weekNumber || 1;
  const d = ep.dayOfWeek || 1;
  const h = (w * 13 + d * 7);

  const p1 = P1_POOL[h % P1_POOL.length](title, theme, v);
  const p2 = P2_POOL[(h + 2) % P2_POOL.length](title, theme, v);
  const p3 = P3_POOL[(h + 4) % P3_POOL.length](title, theme, v);
  const p4 = P4_POOL[(h + 6) % P4_POOL.length](title, theme, v);
  const p5 = P5_POOL[(h + 8) % P5_POOL.length](title, theme, v);

  const text = p1 + p2 + p3 + p4 + p5;

  // Chinese translation — parallel structure
  const zh1Pool = [
    `<p>關於${title}的對話往往停留在表面。你交換幾個觀察，在幾個普遍性上達成一致，然後繼續往前走。但那些從思考${theme}中獲得最多的人，通常是那些願意突破容易版本的人——那個每個人都已經知道自己台詞的版本——進入更具體、更誠實的地方。這種推進需要一定的願意不確定，而不確定是大多數人都覺得足夠不舒服而想避免的事情。</p>`,
    `<p>關於${title}，有一種東西抵抗簡單的描述。你可以很容易地繞著它說——它在談話中隨口提及，在其他事情的中間被提到——但當你真的嘗試精確說出你自己對它的體驗時，語言往往力不從心。這不是詞彙的失敗，而是這個話題真實到足以複雜的跡象，而複雜的事情通常是最值得花時間去處理的。</p>`,
    `<p>大多數人在擁有談論${title}的有用詞彙之前，就已經遇到它了。體驗先到來——有時作為一個問題，有時作為一個疑問，有時只是作為一種持續的、低強度的不適，還沒有名字。詞彙後來才到來，如果它來的話。而當它到來時，它不只改變你如何談論${theme}，還改變你如何思考它，有時改變你與它的關係方式。</p>`,
    `<p>了解${title}和真正擁有它的經驗之間的差距，比大多數人預期的要大。你可以讀關於它的書，聰明地討論它，對它持有形成良好的意見——卻仍然發現自己在它以你沒有預料的形式出現在你實際生活中時感到驚訝。這種驚訝通常是有資訊量的，這意味著${theme}的真實版本，比你一直攜帶的它的概念更複雜。</p>`,
    `<p>每個話題都有一個表面版本和一個更深的版本，${title}也不例外。表面版本容易討論——熟悉到讓人感到舒適，普遍到足以避免爭議。更深的版本是事情變得有趣的地方：你的實際經驗偏離你以為會發生的地方，你所珍視的事物原來與你以為自己珍視的不同，${theme}的概念停止是抽象的，開始讓你付出真實的代價。</p>`,
    `<p>有些東西在事後比在當下更容易理解，${title}通常就是其中之一。當你身處其中時，體驗往往太近、太即時，無法清晰看見。只有後來——有時要很久之後——你才能獲得理解實際發生了什麼以及為何重要所必需的距離。這種事後的清晰，是你能在${theme}周圍培養的更有用的東西之一，它往往來自花時間真正審視你的體驗，而不是只是繼續往前走。</p>`,
    `<p>當人們描述他們與${title}的關係時，他們通常從聽起來最合理的版本開始——那個有組織的、連貫的說明，讓發生的事情有意義。但多問一點，問一個更具體的問題，故事往往會變得更複雜。真實版本通常包含更多的模糊性、更多改變的想法、更多正確答案不明顯的時刻。那個真實版本才是值得談論的，因為那是其他人實際上能認出為真實的那個。</p>`,
  ];
  const zh2Pool = [
    `<p>當你更仔細地審視${theme}時，往往發現你最初的假設是不完整的。這不是因為你的假設愚蠢——根據你當時知道的，它們大多數是相當合理的。而是因為這個話題比你在直接體驗它之前所能接觸到的版本更豐富。${v[0]||'視角'}的概念是個好例子，大多數人在智識上理解它，但在真正在需要付出代價才能應用它的條件下應用它的人要少得多。</p>`,
    `<p>${theme}的有用之處在於它傾向於揭示參與其中的人的某些東西。不是評判性的——它不是你通過或不通過的測試——而是你對它的具體回應方式，給了你關於你實際上珍視什麼的資訊，而不只是你說你珍視什麼。當在抽象中討論時，${v[0]||'方式'}的概念聽起來很簡單。你在疲倦或有壓力時做出的具體選擇，向你展示了關於它在你的優先順序中實際位置的更準確的東西。</p>`,
    `<p>關於${theme}，一個反覆出現的觀察是，那些似乎最能自在應對它的人，通常不是問題最少的人。他們是那些在它上面遇到過更多問題、並花了更多時間思考那些問題的人。在這個領域的熟悉感，不是來自避免了${title}的困難版本，而是來自經歷過足夠多次，以至於對往往會發生什麼和往往有什麼幫助有了感覺。那種熟悉感是賺來的，而不是給予的。</p>`,
    `<p>關於${theme}值得注意的一點是，它困難的部分往往是最終產生最有用成長的部分。${title}中製造摩擦的面向——你必須放慢速度、重新考慮，或處理你寧願避免的事情的時刻——往往是教給你最多的時刻。這不讓摩擦變得令人愉快。但認識到它的用途，可以使它更容易承受，偶爾在事後還能讓你真正對它感激。</p>`,
    `<p>${theme}與日常生活之間的關係，不像最初看起來那樣直接。你可能認為這個話題屬於某個特定的領域——屬於職業生活，或關係，或它通常出現的某個特定情境。但實際上，${title}傾向於以可識別的相似方式出現在許多不同的生活領域，即使表面內容完全不同。這是使它值得仔細思考的事情之一：你在一個領域識別的模式，往往比你預期的更廣泛地適用。</p>`,
    `<p>幾乎每個人都遇到過${title}的一個版本，而大多數人還沒有機會與它的另一個版本合作。第一個版本是相對舒適的——情況是熟悉的，風險是可管理的，結果大多確認了你已經相信的事情。第二個版本在風險更高、情況不那麼熟悉、你所相信的事情證明沒有你以為的那麼有幫助時到來。那個第二個版本是大多數關於${theme}的真正學習發生的地方。</p>`,
    `<p>人們對${title}的方式告訴你一些關於他們經歷過什麼的事情。那些輕鬆應對${theme}、明顯不焦慮的人，不一定是從未有過困難的人。更多時候，他們是對它有過足夠困難、已經與它建立了真正關係的人——已經了解它需要什麼、它獎勵什麼，以及對它更難版本的期望。那種平靜傾向於是賺來的，而不是天生的。</p>`,
  ];
  const zh3Pool = [
    `<p>使${theme}值得持續關注的部分原因，是它與其他看似不相關的生活部分的連接方式。你與${v[1]||'關係'}的經驗，塑造了你如何理解${title}，即使這個連接不明顯。你與${v[2]||'挑戰'}的歷史，塑造了什麼感覺是可以管理的、什麼感覺是不堪重負的。這個話題不是孤立存在的，它嵌入在整套其他經驗和思維習慣中，這意味著理解它需要比直接思考它更多的東西——它需要那種審視全局的反思。</p>`,
    `<p>關於${theme}，一個反覆出現的觀察是背景如何塑造其體驗。同樣的情況，根據緊接在它之前發生的事、你所希望的、以及你準備好處理的，感受起來可能完全不同。這種對背景的依賴，使得對${title}過於自信地概括變得困難——在一組情況下有效的方法，在另一組情況下可能無效。那麼技能不在於找到普遍正確的方法，而在於培養靈敏度，以注意到你實際上處於哪種情況以及那種特定情況需要什麼。</p>`,
    `<p>人們如何與${theme}發展更複雜的關係，有一個常見的模式：他們從關於它的相對簡單的想法開始，遇到使這些想法複雜化的情況，並逐漸建立出更細緻的東西。最初的想法並不完全錯誤——它們只是不完整的。複雜化的情況往往令人不舒服。但隨著時間推移發展出的更細緻的理解，比簡單版本要有用得多，因為它對${title}的實際體驗質地更準確。</p>`,
    `<p>當以任何持續的方式思考${theme}時，${v[0]||'成長'}的概念變得特別相關。它不是一個靜態的話題——你與它的關係隨著你的情況改變、隨著你積累更多經驗、隨著對你最重要的事情移位而改變。在生命的一個階段對${title}感覺真實的事情，從另一個有利位置看往往是不同的。這不意味著什麼都是不固定的或所有觀點都同樣有效，而是意味著對你當前理解的謙遜通常是適當的，因為這個話題幾乎肯定比你現在所能接觸到的版本更複雜。</p>`,
    `<p>在關於${theme}的誠實對話中，一個持續出現的事情是時機的作用。同樣的洞見，在錯誤的時刻傳遞，落地方式不同於它在你真正準備好接受時到達的樣子。同樣的挑戰，在你有更多資源的時候面對——更多休息、更多支持、對什麼重要有更多清晰——是一種與在你耗盡時面對同樣挑戰完全不同的體驗。理解時機在${title}中的作用，是你能從仔細思考這個話題中獲得的更實際的事情之一。</p>`,
    `<p>隨著對${theme}有更多經驗，變得更清晰的一件事是你能控制的事情和你不能控制的事情之間的區別。這個區分聽起來顯而易見，但在實踐中應用它，比陳述它要難得多。在與${title}有困難的時刻，很容易過度投資於試圖控制真正超出你影響範圍的事情，或對那些實際上在你掌控範圍內的事情投資不足。學會更準確地看到這一點——在當下，而不只是在事後——是你能培養的更有價值的技能之一。</p>`,
    `<p>${theme}的社會維度往往被低估。你如何處理${title}，不只影響你自己對它的體驗，還影響你周圍人的體驗。反過來，你生命中的其他人與同樣話題的關係方式，塑造了你如何發展自己與它的關係——有時是有益的，有時以值得審視的方式。你從${theme}中學到最多的人，往往不是最能清楚表達它的人，而是你能夠近距離觀察其行為以看到實際有效的是什麼的人。</p>`,
  ];
  const zh4Pool = [
    `<p>實際問題——你實際上做什麼？——是很多關於${theme}的思考變得模糊的地方。在抽象中討論這個話題要容易得多，而不是對你在一個週三下午、疲倦的時候、最容易的路不是最好的路的時候，具體說出你做的選擇。那個抽象與具體之間的差距，是大多數真正工作發生的地方。那些能良好應對${title}的人，傾向於不只思考了他們原則上相信什麼，還思考了他們在可能遇到的各種情況下實際上會做什麼。</p>`,
    `<p>在思考${theme}時，一個反覆出現的模式是人們說他們會做什麼與情況真正到來時他們實際做什麼之間的差距。這不是偽善——這是意圖與真實條件互動的正常方式。${title}最重要的情況，往往也是你在處理其他壓力的情況：時間壓力、情感壓力、對你注意力的競爭性需求。提前思考你想如何處理這個話題，使你在時刻到來時實際上以你打算的方式處理它的可能性更大。</p>`,
    `<p>${title}實際上——實際上、日常地——需要什麼的問題，是大多數人比他們意識到的思考得更少的問題。這個話題傾向於在原則層面吸引大量討論，而在具體、可重複的行為層面吸引相對較少的討論。但行為是${theme}實際發展或未能發展的地方。你一致地隨著時間做出的具體習慣、練習和決定，是你與這個話題關係的實際基礎，不管你在抽象中相信什麼。</p>`,
    `<p>隨著時間推移使人們在${theme}上更有效的，通常不是一次戲劇性的改進，而是一系列更小、更誠實的調整。每次調整通常是由注意到差距觸發的——你打算做的事和你實際做的事之間，你期望發生的事和實際發生的事之間，你以為自己正在處理的${title}版本和結果是真實的版本之間。這些差距注意到它們是令人不舒服的，但注意到它們是對它們做任何有用事情的前提。</p>`,
    `<p>思考${theme}可用的更有用的重新框架之一，是把它視為需要解決的問題少一點，把它視為需要導航的地形多一點。問題有解決方案。地形需要持續的關注、適應，以及隨著你的情況改變而從不同角度遇到同樣特征的意願。在這個意義上，${title}從來不是完成的——它是一種隨著時間發展的持續關係，由發生在你身上的事和你選擇如何回應發生在你身上的事共同塑造。</p>`,
    `<p>有一種對${theme}的能力，從外面看起來像輕鬆，但實際上是相當多先前困難的產物。那些以最明顯的優雅應對${title}的人，通常是那些在它的更難版本上花了最多時間的人——不是因為他們天生適合它，而是因為他們積累了足夠多的困難版本的經驗，以至於知道期望什麼和做什麼。那種積累的經驗從外面是看不到的，這可能使能力看起來像毫不費力，而實際上是持續努力的結果。</p>`,
    `<p>當思考${theme}時，優先考慮什麼的問題，是隨著你在自己與這個話題的發展中所處的位置而移位的問題。早期，優先事項通常只是對你實際上在處理什麼獲得更清晰的圖像——區分你想象的${title}版本和結果是真實的版本之間的差異。後來，優先事項傾向於轉向精煉：變得更精確、更一致、更能在不被它們打倒的情況下處理話題的更難版本。</p>`,
  ];
  const zh5Pool = [
    `<p>仔細地與${title}接觸後，通常留下的不是一套結論，而是與問題的不同關係。你最終對這個話題的了解比以前更多，但更重要的是，你更清楚自己還不知道什麼和什麼值得去發現。這比達到整潔的摘要是一個更有用的地方，因為${theme}是那種隨著你的經驗發展而持續發展的話題。對那種發展的開放性，在某些方面，是最重要的需要保護的東西。</p>`,
    `<p>證明最持久的${title}版本，不是建立在熱情或理想條件上的，而是建立在對困難的誠實承認上的。你在更難時期建立的——即使在動力低落時也能維持的思維習慣、練習——比你在事情順利時建立的更可靠。這使得對${theme}的困難接觸，以一種你在其中間時並不明顯的方式有價值。困難不是與價值分離的，它在很大程度上是價值的來源。</p>`,
    `<p>不管你在這個生命時期對${title}得出什麼結論，值得輕輕握住那個結論。這個話題有一種隨著你對它發展更多經驗而擴展的方式，在一個階段看起來已定的事情，往往在下一個階段變得更複雜。這不是問題——這是發展真正理解而不只是積累意見的正常過程。你能從花時間在${theme}上帶走的最有用的東西，不是一個固定的答案，而是以更準確的方式繼續問問題的改進能力。</p>`,
    `<p>關於${title}的對話從未真正結束。你可以達到暫時的結論，發展出有力的工作原則，並建立長期良好服務你的練習。但這個話題隨著你的情況演變而繼續演變，你在生命的一個階段學到的，為下一個階段創造了新的問題。那種持續的質量不是限制——它是使${theme}值得持續關注的部分原因。這個話題最有趣的版本總是稍微領先於你目前所在的地方，這是一個繼續前進的好理由。</p>`,
    `<p>在度過一段時間後，帶著新鮮的注意力回到${title}，通常比第一次相遇產生不同的東西。不是更好或更差，而是不同——被中間發生的事所塑造，被使你早期理解複雜化或確認的經驗，被你以為只有答案的地方打開的問題。那次回訪往往比第一次更有收穫，不是因為這個話題改變了，而是因為你改變了，而你現在遇到的${theme}版本反映了那個改變。</p>`,
    `<p>持續思考${theme}的更安靜的獎勵之一，是逐漸發展出某種類似輕鬆的東西——不是沒有困難，而是能夠在困難中臨在而不被它壓倒的能力。那種輕鬆不是一次全部到來的。它通過與${title}的反覆相遇、通過每次相遇後做出的小調整、以及通過從沒有按計劃進行的情況中繼續學習的意願而積累。它最終是你能通過對這個話題的認真接觸建立的更好的東西之一。</p>`,
    `<p>關於${title}，傾向於在人身上停留最長的，不是任何特定的教訓或洞見，而是這個話題似乎需要的那種關注的質量。認真地與${theme}接觸——不只是思考它，而是在真實情況中真正與它合作——發展出一種注意力，這種注意力在生活的其他領域也被證明是有用的。那種注意力，一旦發展出來，就不容易消失。而那個，也許比關於這個話題的任何具體結論更多，使時間和思考的投資是值得的。</p>`,
  ];

  const zh1 = zh1Pool[h % zh1Pool.length];
  const zh2 = zh2Pool[(h + 2) % zh2Pool.length];
  const zh3 = zh3Pool[(h + 4) % zh3Pool.length];
  const zh4 = zh4Pool[(h + 6) % zh4Pool.length];
  const zh5 = zh5Pool[(h + 8) % zh5Pool.length];
  const textZh = zh1 + zh2 + zh3 + zh4 + zh5;

  return { text, textZh };
};

// Register all other themes to use default
const ALL_THEMES = [
  'Commuting','Home & Living Space','Traditions & Gatherings','Food & Eating Habits',
  'Weather & Seasons','Shopping & Money','Health & Body','Daily Schedules','Friendship',
  'Family','Colleagues & Teamwork','Social Situations','Personality & Character',
  'Communication Styles','Helping Others','Conflict & Resolution','Your Job & Role',
  'Meetings & Discussions','Deadlines & Pressure','Problem Solving','Career Goals',
  'Learning & Growth','Success & Failure','Work-Life Balance','Travel',
  'Photography & Visual Art','Music & Podcasts','Reading & Writing','Pets & Animals',
  'Hobbies & Collections','Nature & Outdoors','Sports & Fitness','Technology & Everyday Life',
  'Artificial Intelligence','Health & Mental Wellbeing','Environment & Sustainability',
  'Money & Financial Goals','Change & Transitions','Values & Beliefs','The Future',
  'Looking Back & Moving Forward','Creativity & Self-Expression','Leadership & Influence',
  'Community & Giving Back','Cross-Cultural Understanding','Language & Identity',
  'Rest & Renewal','Gratitude & Appreciation','Goals & Intentions','Year in Review','New Beginnings',
];
// (Already handled by 'default' fallback)

// ── Vocabulary example generator ──────────────────────────────────────────
const VOCAB_TEMPLATES = [
  (w,d) => `She finally understood what ${w} meant when she had to apply it under real pressure at work.`,
  (w,d) => `After months of ignoring it, he realized that ${w} was the piece he had been missing all along.`,
  (w,d) => `The conversation shifted when she introduced the idea of ${w} and everyone in the room went quiet.`,
  (w,d) => `It took a difficult year before he genuinely appreciated what ${w} could do for the way he worked.`,
  (w,d) => `She had read about ${w} in theory, but it only made sense once she saw it working in her own life.`,
  (w,d) => `His approach to ${w} changed completely after spending a week observing how his most effective colleague handled it.`,
  (w,d) => `They discovered that ${w} was not a fixed thing but something that shifted depending on context and energy.`,
  (w,d) => `What surprised her most about ${w} was how rarely people talked about it directly, despite how often it mattered.`,
  (w,d) => `He described ${w} as the thing that made the difference between a good plan and one that actually worked.`,
  (w,d) => `Once she started paying attention to ${w}, she noticed it coming up in conversations she had thought were about something else entirely.`,
];

function makeVocabExample(word, def, weekNum, dayNum) {
  const idx = ((weekNum || 1) * 7 + (dayNum || 1) + (word || '').charCodeAt(0)) % VOCAB_TEMPLATES.length;
  return VOCAB_TEMPLATES[idx](word, def);
}

// ── Serialize ──────────────────────────────────────────────────────────────
function escapeSQ(s) {
  return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

function serializeArticle(art) {
  const vocabLines = (art.vocabulary||[]).map(v =>
    `      { word: '${escapeSQ(v.word)}', definition: '${escapeSQ(v.definition)}', example: '${escapeSQ(v.example)}' }`
  ).join(',\n');
  return `  {
    topic: '${escapeSQ(art.topic)}',
    title: '${escapeSQ(art.title)}',
    wordCount: ${art.wordCount},
    text: '${escapeSQ(art.text)}',
    textZh: '${escapeSQ(art.textZh)}',
    vocabulary: [
${vocabLines}
    ],
  }`;
}

function serializeWeekFile(weekNum, articles) {
  const header = weekNum === 1
    ? `export interface SpeakArticle {
  topic: string
  title: string
  wordCount: number
  text: string
  textZh: string
  vocabulary: { word: string; definition: string; example: string }[]
}

`
    : `import { SpeakArticle } from './articles-w01'\n\n`;
  return `${header}export const W${weekNum}_ARTICLES: SpeakArticle[] = [\n${articles.map(serializeArticle).join(',\n')}\n]\n`;
}

// ── Main ──────────────────────────────────────────────────────────────────
const allWeeks = targetWeeks || Array.from({length:53},(_,i)=>i+1);
console.log(`\n=== Generating Articles: Weeks ${allWeeks[0]}-${allWeeks[allWeeks.length-1]} ===\n`);

let total = 0;
for (const w of allWeeks) {
  // Skip W01 — already hand-written
  if (w === 1) { console.log(`Week  1: skipped (hand-written)`); continue; }

  const eps = loadWeek(w);
  if (eps.length === 0) { console.log(`Week ${String(w).padStart(2)}: no episodes`); continue; }

  const articles = [];
  for (const ep of eps) {
    const vocab = getVocab(ep);
    const {text, textZh} = makeArticle(ep, vocab);
    const wordCount = text.replace(/<[^>]+>/g,'').trim().split(/\s+/).filter(Boolean).length;

    articles.push({
      topic: ep.theme,
      title: ep.title,
      wordCount,
      text,
      textZh,
      vocabulary: vocab.map((v, vi) => ({
        word: v.word,
        definition: v.def,
        example: makeVocabExample(v.word, v.def, ep.weekNumber, ep.dayOfWeek + vi),
      })),
    });
    total++;
  }

  const pad = String(w).padStart(2,'0');
  const outPath = path.join(ROOT,'content/articles',`articles-w${pad}.ts`);
  fs.writeFileSync(outPath, serializeWeekFile(w, articles));
  const avgWords = Math.round(articles.reduce((s,a)=>s+a.wordCount,0)/articles.length);
  console.log(`Week ${String(w).padStart(2)}: ${articles.length} articles (avg ${avgWords} words) → saved`);
}

console.log(`\n✓ Generated ${total} articles total`);

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const PHASES = [
  { start: 1, end: 10, phase: 'p1', speakerA: 'Mira', speakerB: 'Jamie' },
  { start: 11, end: 18, phase: 'p2', speakerA: 'Lily', speakerB: 'Tom' },
  { start: 19, end: 26, phase: 'p3', speakerA: 'Sara', speakerB: 'Alex' },
  { start: 27, end: 34, phase: 'p4', speakerA: 'Nina', speakerB: 'Marcus' },
  { start: 35, end: 43, phase: 'p5', speakerA: 'Jade', speakerB: 'Ryan' },
  { start: 44, end: 53, phase: 'p6', speakerA: 'Maya', speakerB: 'James' },
]

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'for', 'from', 'how',
  'i', 'in', 'into', 'is', 'it', 'its', 'not', 'of', 'on', 'or', 'that', 'the', 'their',
  'them', 'there', 'this', 'to', 'what', 'with', 'your', 'you', 'we', 'our', 'my', 'me',
  'if', 'when', 'why', 'who', 'where', 'which', 'than', 'then', 'so', 'can', 'could',
  'should', 'would', 'about', 'through', 'over', 'under', 'after', 'before',
])

const WEAK_TOKENS = new Set([
  'everything', 'everyone', 'something', 'nothing', 'thing', 'things', 'using', 'making',
  'finding', 'talking', 'looking', 'moving', 'being', 'getting', 'understanding',
])

const PHRASAL_TOKENS = new Set(['back', 'down', 'forward', 'off', 'on', 'over', 'up'])

const FALLBACK_TERMS = [
  'daily pattern',
  'small decision',
  'quiet pressure',
  'honest reset',
  'steady rhythm',
  'real trade-off',
  'useful habit',
  'long view',
]

const PART_TITLES = [
  'Part 1 — Opening the Theme',
  'Part 2 — A Concrete Situation',
  'Part 3 — Friction Beneath the Surface',
  'Part 4 — What Helps in Practice',
  'Part 5 — Common Misreadings',
  'Part 6 — What You Carry Forward',
]

const EN = {
  p1l1b: [
    'When you think about "{topic}", what feels immediately real rather than merely inspirational?',
    'If "{topic}" showed up in your week tomorrow morning, which part of it would feel most familiar right away?',
    'When "{topic}" comes up, what part of it feels grounded in ordinary life instead of sounding like a slogan?',
  ],
  p1l2a: [
    'I usually begin with {term1}, because that is where "{topic}" stops being abstract and starts touching actual routines.',
    'For me, {term1} is the clearest entry point. It shows how "{topic}" appears before anyone gives it a polished explanation.',
    'My mind goes to {term1} first, because that is where "{topic}" becomes something I can observe instead of just admire.',
  ],
  p1l3b: [
    'What kind of scene makes you notice that most clearly: a quiet private moment, a work situation, or a conversation with someone close?',
    'In what situation do you feel {term1} most strongly: when you are alone, when you are busy, or when someone asks you to explain yourself?',
    'Where does that part of "{topic}" become most visible to you: in your routine, in your relationships, or in the choices you make under pressure?',
  ],
  p1l4a: [
    'Usually it appears in a very ordinary moment. I notice {term2} when I am making a small decision and realize it quietly shapes the rest of the day.',
    'It often happens in a plain everyday scene. {term2} becomes visible when I slow down long enough to notice what kind of choice I am actually making.',
    'For me it shows up in small moments rather than dramatic ones. {term2} starts becoming visible when the day is already moving and I still have to decide how to respond.',
  ],
  p1l5b: [
    'That makes sense, because themes like "{theme}" usually reveal themselves in the tone of a day before they become a clear idea.',
    'I get that. Subjects like "{theme}" often show up as a feeling or pattern before people have good language for them.',
    'Right, and that is probably why "{theme}" can sound broad on paper but feel surprisingly specific in a normal day.',
  ],
  p1l6a: [
    'Exactly. What matters to me is that "{topic}" is not just about intention; it is also about what keeps returning when life is busy, messy, or emotionally uneven.',
    'Yes, and that is why "{topic}" feels meaningful to me. It asks what keeps shaping my decisions even when I do not feel especially motivated or clear.',
    'That is why this topic stays with me. "{topic}" becomes real when it continues to matter on an ordinary day, not only on a reflective one.',
  ],
  p1l7b: [
    'Do you think people usually misunderstand "{topic}" because they expect clarity too early, or because they only notice the visible part of it?',
    'What do you think makes "{topic}" hard to read at first: the fact that it is subtle, or the fact that people want immediate certainty?',
    'Why do you think people often misjudge "{topic}" in the beginning? Is it because they focus on outcomes before they understand the process?',
  ],
  p1l8a: [
    'Probably both. People often look for a dramatic sign, but a lot of "{topic}" is made of repeated choices that are easy to dismiss while they are still small.',
    'I think people expect a neat turning point, when the truth is that "{topic}" often grows through small decisions that do not look important at first.',
    'Usually they want a clear before-and-after story, but "{topic}" is often shaped by modest patterns that only become obvious after enough time has passed.',
  ],

  p2l1a: [
    'One reason this topic matters to me is that I have seen how quickly a day can change once "{topic}" moves from theory into a concrete situation.',
    'I learned a lot about "{topic}" from one very ordinary experience, because it showed me how different the idea feels when something is actually at stake.',
    'My understanding of "{topic}" changed through a specific moment, not through a big revelation but through a situation I could not ignore anymore.',
  ],
  p2l2b: [
    'What was happening in that moment? I am curious about the details that made the lesson feel personal rather than generic.',
    'Can you describe the situation a little more? I want to understand what turned "{topic}" from a nice idea into a real demand.',
    'What made that moment stand out so clearly? It sounds like something about the situation exposed the deeper shape of "{topic}".',
  ],
  p2l3a: [
    'It involved {term3}. I was trying to do the responsible thing, but I could also feel how easy it would have been to fall back into a more familiar pattern.',
    'The situation centered on {term3}. Nothing dramatic happened, but I could feel a real tension between what felt comfortable and what felt aligned.',
    'At the center of it was {term3}. I remember realizing that the hard part was not understanding the issue; it was acting in line with what I already knew.',
  ],
  p2l4b: [
    'Did that tension change your behavior right away, or did it first change the story you told yourself about what mattered?',
    'When that happened, did your actions shift first, or did your language and self-understanding change before the behavior caught up?',
    'Was the first change practical or internal? I mean, did you do something different immediately, or did your mindset have to move first?',
  ],
  p2l5a: [
    'The internal shift came first. Once I became more honest about what was happening, my choices started looking less performative and more durable.',
    'My mindset moved before the visible behavior did. That honesty made later decisions feel steadier, because I was no longer pretending the trade-off was easy.',
    'The real change began inside. I stopped trying to look impressive and started asking whether my choices could hold up on a normal, imperfect day.',
  ],
  p2l6b: [
    'That sounds important, because {term4} usually grows more reliably through honest repetition than through one burst of intensity.',
    'I can see that. {term4} tends to deepen when people stop chasing a perfect performance and start building something they can repeat.',
    'Right, and that is probably why {term4} matters here. It turns the topic into a practice instead of leaving it as a mood or identity label.',
  ],
  p2l7a: [
    'Yes, and that is what stayed with me. Once {term4} became part of my ordinary rhythm, the topic felt less dramatic but much more trustworthy.',
    'Exactly. The shift became real when {term4} moved into daily life and stopped depending on whether I felt especially inspired that day.',
    'That is the useful part for me. When {term4} is woven into ordinary routines, "{topic}" starts feeling like a structure I can rely on.',
  ],
  p2l8b: [
    'So the lesson was not just about insight. It was about building a version of "{topic}" that could survive contact with everyday life.',
    'That makes sense. It sounds like the real win was not feeling certain for one day, but creating a version of "{topic}" that could last beyond one mood.',
    'I like that distinction. It turns "{topic}" into something livable, not just something people say they care about in reflective moments.',
  ],

  p3l1b: [
    'What feels hardest about "{topic}" once the first excitement wears off and you are left with the slower, less glamorous part?',
    'Where does "{topic}" become difficult for you: at the beginning, in the middle, or when you have to keep going without immediate feedback?',
    'If you had to name the hardest layer of "{topic}", what would it be once the obvious answers stop helping?',
  ],
  p3l2a: [
    'The hardest part is usually {term5}. It asks for steadiness at exactly the moment when I most want something quick, clean, and reassuring.',
    'For me, {term5} is the difficult layer. It is not hard because it is dramatic; it is hard because it demands patience when patience feels least convenient.',
    'I would say {term5}. That is where the topic stops being intellectually interesting and starts requiring emotional maturity in real time.',
  ],
  p3l3b: [
    'What does your inner dialogue sound like in that moment? I imagine there is a pull toward convenience or self-protection.',
    'When {term5} becomes difficult, what do you usually hear in your own head? Is it doubt, impatience, defensiveness, or something else?',
    'How do you talk to yourself when that pressure shows up? I am wondering what emotional habit tends to rise first.',
  ],
  p3l4a: [
    'Usually it sounds rushed. Part of me wants certainty immediately, and another part knows that forcing clarity too quickly often makes the outcome worse.',
    'My first reaction is often impatience. I want the tension to disappear, even though I already know that rushed decisions usually create a second problem later.',
    'There is often a quiet defensive voice in me. It wants relief more than truth, and I have to notice that before I can respond well.',
  ],
  p3l5b: [
    'And does that pressure stay inside you, or does it start affecting the way you speak, listen, or show up around other people?',
    'Does that internal tension mostly stay private, or can you feel it changing the quality of your relationships and decisions around you?',
    'How much does that internal pressure spill outward? I am guessing "{topic}" becomes especially revealing when it starts shaping how you treat others.',
  ],
  p3l6a: [
    'It definitely spills outward if I am not careful. The quickest sign is that I become less curious and more controlling, which is usually a warning sign for me.',
    'It affects other people faster than I want to admit. When I feel that pressure, I can become less patient, less generous, and much more narrow in my thinking.',
    'Yes, and that is why I take it seriously. The inner tension around "{topic}" eventually changes my tone, my timing, and my willingness to stay open.',
  ],
  p3l7b: [
    'What old habit tends to reappear under that kind of stress? Most people have one pattern that keeps trying to write the script again.',
    'When the pressure rises, what familiar pattern comes back first? I am curious about the version of you that "{topic}" keeps testing.',
    'Under stress, which old habit usually returns? It sounds like "{topic}" keeps brushing against something deeper than the surface situation.',
  ],
  p3l8a: [
    'I usually drift toward over-controlling the situation. It feels responsible in the moment, but it often reduces the space where real understanding could grow.',
    'My old habit is trying to force resolution too quickly. It creates temporary relief, but it rarely creates the kind of outcome I actually respect.',
    'I tend to over-explain and over-manage. It makes me feel safer for a moment, but it usually means I have stopped listening properly.',
  ],

  p4l1a: [
    'What helps me now is treating "{topic}" less like a grand identity project and more like a set of choices I can rehearse repeatedly.',
    'The most useful shift for me has been practical. I try to build "{topic}" through repeatable behaviors rather than waiting for the perfect emotional state.',
    'These days I handle "{topic}" by focusing on process. I care less about sounding wise and more about doing one repeatable thing well.',
  ],
  p4l2b: [
    'What is the first small action in that process? I want the version that still works when energy, confidence, and time are all imperfect.',
    'If someone wanted to begin today, what would be the first small move that actually makes "{topic}" easier to live out?',
    'What is the smallest reliable action in your version of "{topic}"? I mean the step that is humble enough to survive a difficult day.',
  ],
  p4l3a: [
    'I start with {term6}. It is small enough to repeat, but meaningful enough to change the tone of the day when I do it consistently.',
    'For me, the first step is {term6}. It sounds modest, but it creates enough structure that I am less likely to get lost in mood or impulse.',
    'I usually begin with {term6}. The point is not that it fixes everything; the point is that it gives the rest of the day a better starting direction.',
  ],
  p4l4b: [
    'And what happens on a bad day, when you do not feel reflective, patient, or especially capable? Does the practice still hold?',
    'How do you keep that practice alive on the days when motivation is low and your attention is already scattered?',
    'What does your strategy look like when the day is messy? I think that is where a practice either proves itself or quietly disappears.',
  ],
  p4l5a: [
    'On bad days, I lower the standard without abandoning the direction. I would rather keep the thread alive than perform a perfect version once in a while.',
    'I make the practice smaller, not grander. The goal is to preserve continuity so that "{topic}" stays connected to real life instead of becoming all-or-nothing.',
    'I simplify it. If I cannot do the ideal version, I still try to do a recognizable version, because consistency teaches me more than intensity does.',
  ],
  p4l6b: [
    'That sounds healthy. How do you know the practice is helping rather than simply giving you the feeling of being responsible?',
    'How do you measure progress there? I imagine the useful signs are quieter than a big emotional breakthrough.',
    'What tells you that the routine is actually working? With topics like this, the gains can be subtle and easy to overlook.',
  ],
  p4l7a: [
    'I watch for {term7}. The signal is usually calmer than I expect: I become less reactive, more deliberate, and a little easier to trust in the same situations.',
    'For me, {term7} is the sign. Progress looks like steadier responses, clearer language, and less need to dramatize every difficult moment.',
    'I look for {term7}. If that is growing, I know the practice is doing real work even if the change is not exciting or obvious.',
  ],
  p4l8b: [
    'I like that measure, because it values steadiness over theater. It sounds much closer to real growth than a single inspiring moment.',
    'That makes sense. The best evidence is often not excitement but a more stable way of responding when the same challenge comes back again.',
    'That feels convincing to me. It suggests the routine is not just comforting; it is actually reshaping your way of meeting reality.',
  ],

  p5l1b: [
    'What do people most often get wrong about "{topic}" when they only look at the visible surface?',
    'If you had to name one misleading assumption around "{topic}", what would it be?',
    'What is the myth that quietly distorts this whole conversation every time "{topic}" comes up?',
  ],
  p5l2a: [
    'A common mistake is treating "{topic}" as if it should feel clean and obvious once you care enough. In reality, it usually stays complicated for a while.',
    'People often assume "{topic}" should feel natural right away. They underestimate how much awkward practice, revision, and patience it usually requires.',
    'The biggest misunderstanding is expecting "{topic}" to come with instant clarity. Most of the real work happens while things still feel partial and unresolved.',
  ],
  p5l3b: [
    'Why do you think that myth survives so easily? Is it because people prefer a simple story, or because the slower truth is harder to sell?',
    'What keeps that misunderstanding alive? I wonder if it is partly cultural and partly emotional, because simple narratives are so appealing.',
    'Why does that myth remain persuasive? It feels like people keep reaching for a version of "{topic}" that flatters them more than it teaches them.',
  ],
  p5l4a: [
    'Probably because simple stories are easier to admire. The slower truth asks people to stay humble while they are still inconsistent, and that is uncomfortable.',
    'I think it survives because people want a version of growth that feels immediate and legible. The real process is slower, less tidy, and harder to display.',
    'Partly because the myth is emotionally convenient. It lets people confuse intention with embodiment, and that confusion can feel reassuring for a while.',
  ],
  p5l5b: [
    'So what would a healthier standard look like? If we removed the myth, what would you want people to expect instead?',
    'What is the more useful way to judge progress here? I am guessing it has more to do with repeatability than with intensity.',
    'If someone wanted a better benchmark, what should they look for instead of quick certainty or visible performance?',
  ],
  p5l6a: [
    'I would look for whether the practice survives ordinary life. A healthy version of "{topic}" should still exist on a tired day, not only on a beautiful one.',
    'The better standard is durability. If "{topic}" can remain visible when life is inconvenient, then I trust it much more.',
    'For me the healthier benchmark is repeatability. I care more about what comes back quietly than what shines briefly and disappears.',
  ],
  p5l7b: [
    'What would you say to someone who is just beginning and already feels discouraged by how slow the process seems?',
    'If someone were new to this and frustrated by the pace, what would you want them to hear first?',
    'What advice would you give a beginner who thinks the lack of instant progress means they are doing "{topic}" badly?',
  ],
  p5l8a: [
    'I would tell them that slowness is not proof of failure. Often it is simply proof that they have reached the part of the process that is real enough to teach them.',
    'I would say: do not confuse gradual progress with absence. The quiet middle is often where "{topic}" becomes honest instead of merely impressive.',
    'I would remind them that awkwardness is normal. The point is not to skip the slow phase but to let it shape a steadier version of who they are becoming.',
  ],

  p6l1a: [
    'What stays with me most about "{topic}" is that it keeps asking who I am when no one is watching and nothing dramatic is happening.',
    'The reason this subject remains important to me is that it keeps returning in subtle ways. It is never only about one moment; it is about the shape of a life.',
    'What lingers for me is that "{topic}" becomes meaningful in quiet repetitions. It keeps asking what kind of person I am becoming across many ordinary days.',
  ],
  p6l2b: [
    'Do you feel you have reached some kind of resolution with it, or does it still feel unfinished in a useful way?',
    'Would you say this topic feels settled for you now, or is it something you expect to keep learning from for a long time?',
    'Has "{topic}" reached a stable place in your life, or does it still keep exposing new layers of yourself?',
  ],
  p6l3a: [
    'It still feels unfinished, but not in a chaotic way. It feels alive, like a subject that keeps deepening as my circumstances and responsibilities change.',
    'I do not think it ever becomes fully finished. It becomes steadier, but it also keeps revealing new edges depending on the season of life I am in.',
    'It is unfinished in a healthy way. I feel more grounded than before, yet the topic keeps showing me subtler versions of the same lesson.',
  ],
  p6l4b: [
    'What part of that ongoing lesson feels most worth carrying into the next season of your life?',
    'If you had to take one lesson from this conversation and keep it close for the next year, what would it be?',
    'Which insight from "{topic}" feels durable enough to guide you beyond this current chapter?',
  ],
  p6l5a: [
    'I want to carry forward the idea that progress does not need to be loud in order to be real. Often the truest change looks calm from the outside.',
    'The lesson I want to keep is that steadiness deserves more respect than drama. Quiet consistency has changed my life more than intensity ever did.',
    'What I want to remember is that small truthful choices accumulate. They may not look impressive in the moment, but they shape the future more reliably.',
  ],
  p6l6b: [
    'That gives the whole topic a lot of dignity. It treats growth as something lived, not simply announced.',
    'I like that conclusion, because it honors the quiet labor inside real change instead of reducing everything to a performance.',
    'That feels both realistic and hopeful. It suggests people do not need a dramatic reinvention in order to move in a meaningful direction.',
  ],
  p6l7a: [
    'Exactly. If I stay close to {term8}, I usually find my way back to the kind of person I actually want to be, even after a messy stretch.',
    'Yes, and that is where {term8} helps me. It gives me a concrete way to return when the day or season has pulled me off center.',
    'That is why {term8} matters to me now. It is not a slogan; it is a practical doorway back into alignment whenever life becomes noisy.',
  ],
  p6l8b: [
    'That feels like a strong place to end. "{topic}" sounds less like an ideal image now and more like a way of living with honesty over time.',
    'I think that is the real takeaway. "{topic}" is not about performing certainty; it is about returning to what is true often enough that it changes you.',
    'That lands well for me. The conversation makes "{topic}" feel human, durable, and much closer to everyday life than to self-improvement theater.',
  ],
}

function getPhaseConfig(weekNumber) {
  const match = PHASES.find((item) => weekNumber >= item.start && weekNumber <= item.end)
  if (!match) throw new Error(`Unknown phase for week ${weekNumber}`)
  return match
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeWords(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function unique(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    const normalized = item.trim().toLowerCase()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    out.push(normalized)
  }
  return out
}

function phraseFromSegment(segment) {
  const tokens = normalizeWords(segment).filter((token) => (!STOPWORDS.has(token) || PHRASAL_TOKENS.has(token)) && !WEAK_TOKENS.has(token))
  if (tokens.length >= 3) return tokens.slice(-2).join(' ')
  if (tokens.length >= 2) return tokens.join(' ')
  if (tokens.length === 1 && tokens[0].length >= 6) return tokens[0]
  return ''
}

function buildBigrams(tokens) {
  const out = []
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const first = tokens[i]
    const second = tokens[i + 1]
    if (STOPWORDS.has(first) || STOPWORDS.has(second)) continue
    if (WEAK_TOKENS.has(first) || WEAK_TOKENS.has(second)) continue
    out.push(`${first} ${second}`)
  }
  return out
}

function isUsableTerm(term) {
  const normalized = term.trim().toLowerCase()
  if (!normalized.includes(' ')) return false
  if (/\b(let s|go move|year fresh|science starting|intentions resolutions|letting go move)\b/.test(normalized)) return false
  return true
}

function extractTerms(episode) {
  const titleSegments = String(episode.title).split(/[:&/,()-]/).map(phraseFromSegment).filter(Boolean)
  const themeSegments = String(episode.theme).split(/[:&/,()-]/).map(phraseFromSegment).filter(Boolean)
  const titleTokens = normalizeWords(episode.title).filter((token) => (!STOPWORDS.has(token) || PHRASAL_TOKENS.has(token)) && !WEAK_TOKENS.has(token))

  const titleBigrams = titleTokens.length === 2
    ? [titleTokens.join(' ')]
    : titleTokens.length === 3
      ? [titleTokens.slice(-2).join(' ')]
      : titleTokens.length >= 4
        ? [titleTokens.slice(0, 2).join(' '), titleTokens.slice(-2).join(' ')]
        : []

  const seeds = unique([
    ...titleSegments,
    ...themeSegments,
    ...titleBigrams,
    ...FALLBACK_TERMS,
  ]).filter(isUsableTerm)

  return seeds.slice(0, 8)
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function pick(list, seed) {
  return list[seed % list.length]
}

function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''))
}

function zhMeaning(term) {
  return `和「${term}」相關的常用表達`
}

function line(speaker, speakerName, en, zh, vocabWord) {
  const item = { speaker, speakerName, en, zh }
  if (vocabWord) item.vocab = [{ word: vocabWord, def: zhMeaning(vocabWord) }]
  return item
}

function tpl(key, seed, data) {
  return fill(pick(EN[key], seed), data)
}

function buildPartOne(episode, config, terms, seed) {
  const data = { topic: episode.title, theme: episode.theme, term1: terms[0], term2: terms[1] }
  return [
    line('b', config.speakerB, tpl('p1l1b', seed + 1, data), `當你想到「${episode.title}」時，哪一部分最像真實生活，而不只是聽起來很勵志的概念？`),
    line('a', config.speakerA, tpl('p1l2a', seed + 2, data), `如果要我從一個入口開始，我會選「${terms[0]}」，因為它讓這個主題從抽象想法變成每天真的能觀察到的事情。`, terms[0]),
    line('b', config.speakerB, tpl('p1l3b', seed + 3, data), `那通常會在什麼場景裡最明顯？是獨處的時候、忙碌工作裡，還是和別人互動時？`),
    line('a', config.speakerA, tpl('p1l4a', seed + 4, data), `對我來說，多半是在很普通的日常時刻。我會在一個小決定裡看見「${terms[1]}」，然後發現它其實影響了整天的走向。`, terms[1]),
    line('b', config.speakerB, tpl('p1l5b', seed + 5, data), `這很合理，因為像「${episode.theme}」這種主題，常常會先以感受或模式出現，之後人才有語言去描述它。`),
    line('a', config.speakerA, tpl('p1l6a', seed + 6, data), `沒錯，所以我在意的不是口頭上的認同，而是這個主題在忙碌、混亂或情緒不穩時，還會不會繼續影響選擇。`),
    line('b', config.speakerB, tpl('p1l7b', seed + 7, data), `你覺得大家一開始最容易誤判的地方是什麼？是太早想要清楚答案，還是只看見表面結果？`),
    line('a', config.speakerA, tpl('p1l8a', seed + 8, data), `我覺得兩者都有。很多人會期待一個戲劇性的訊號，但其實這類主題常常是由反覆的小選擇慢慢堆出來的。`),
  ]
}

function buildPartTwo(episode, config, terms, seed) {
  const data = { topic: episode.title, term3: terms[2], term4: terms[3] }
  return [
    line('a', config.speakerA, tpl('p2l1a', seed + 11, data), `我之所以會把這個主題放在心上，是因為我真的經歷過它從理論變成具體情境的那一刻。`),
    line('b', config.speakerB, tpl('p2l2b', seed + 12, data), `可以多說一點那個情境嗎？我想知道，到底是什麼讓這個主題突然變得很個人、很難忽視。`),
    line('a', config.speakerA, tpl('p2l3a', seed + 13, data), `那個時候的核心其實就是「${terms[2]}」。表面上事情不大，但我能明顯感覺到舒適和對齊之間的拉扯。`, terms[2]),
    line('b', config.speakerB, tpl('p2l4b', seed + 14, data), `那個拉扯是先改變了你的做法，還是先改變了你理解自己的方式？`),
    line('a', config.speakerA, tpl('p2l5a', seed + 15, data), `真正先動的是內在。當我比較誠實地面對自己在逃避什麼之後，後面的選擇才慢慢變得比較穩。`),
    line('b', config.speakerB, tpl('p2l6b', seed + 16, data), `這樣很有道理，因為像「${terms[3]}」這種東西，通常都是靠誠實而穩定的重複練出來的，不是靠一次衝很猛。`, terms[3]),
    line('a', config.speakerA, tpl('p2l7a', seed + 17, data), `對我來說，重要的轉折就是這裡。當「${terms[3]}」真的進入日常節奏，整個主題就不再只是想法，而是可以依靠的結構。`),
    line('b', config.speakerB, tpl('p2l8b', seed + 18, data), `所以真正的收穫不只是看懂，而是把這個主題做成一個能在普通日子裡活下來的版本。`),
  ]
}

function buildPartThree(episode, config, terms, seed) {
  const data = { topic: episode.title, term5: terms[4] }
  return [
    line('b', config.speakerB, tpl('p3l1b', seed + 21, data), `如果把新鮮感拿掉，剩下真正不好處理的那一層是什麼？`),
    line('a', config.speakerA, tpl('p3l2a', seed + 22, data), `最難的通常是「${terms[4]}」。它麻煩的地方不在於多戲劇化，而在於它會要求一種不太舒服的成熟。`, terms[4]),
    line('b', config.speakerB, tpl('p3l3b', seed + 23, data), `那個時候你心裡通常會怎麼說話？是急著想有答案，還是會開始防衛？`),
    line('a', config.speakerA, tpl('p3l4a', seed + 24, data), `很多時候我會先變得很急。人一急，就會想用最快的方法消除不確定感，可是那通常不是最好的處理方式。`),
    line('b', config.speakerB, tpl('p3l5b', seed + 25, data), `那種壓力只留在你心裡，還是會開始改變你說話、傾聽、甚至對待別人的方式？`),
    line('a', config.speakerA, tpl('p3l6a', seed + 26, data), `會外溢，而且比我希望的還快。最明顯的訊號是我會變得比較不願意好奇，只想趕快掌控局面。`),
    line('b', config.speakerB, tpl('p3l7b', seed + 27, data), `在這種壓力下，你最容易回到哪一種舊習慣？`),
    line('a', config.speakerA, tpl('p3l8a', seed + 28, data), `我最容易掉回去的是過度控制。它當下看起來很負責，但其實常常把真正的理解空間壓縮掉。`),
  ]
}

function buildPartFour(episode, config, terms, seed) {
  const data = { topic: episode.title, term6: terms[5], term7: terms[6] }
  return [
    line('a', config.speakerA, tpl('p4l1a', seed + 31, data), `現在我處理這個主題的方式，比較像在練一套可重複的選擇，而不是追求某種很漂亮的人設。`),
    line('b', config.speakerB, tpl('p4l2b', seed + 32, data), `如果今天就要開始做，你會說第一個最小、但真的有效的動作是什麼？`),
    line('a', config.speakerA, tpl('p4l3a', seed + 33, data), `我通常會先從「${terms[5]}」開始。它夠小，所以可以反覆做；但它也夠重要，足以影響整天的方向。`, terms[5]),
    line('b', config.speakerB, tpl('p4l4b', seed + 34, data), `那在狀態很差的日子呢？當你沒有動力，也沒有耐心的時候，這個做法還撐得住嗎？`),
    line('a', config.speakerA, tpl('p4l5a', seed + 35, data), `撐得住的前提是把標準縮小，而不是整個放棄。我寧可保住那條線，也不要偶爾做一次非常完美的版本。`),
    line('b', config.speakerB, tpl('p4l6b', seed + 36, data), `你怎麼知道這不是只是讓自己感覺有在努力，而是真的有帶來改變？`),
    line('a', config.speakerA, tpl('p4l7a', seed + 37, data), `我會看「${terms[6]}」有沒有變多。真正的進步通常比較安靜，像是我比較不容易被同樣的事情拖著走。`, terms[6]),
    line('b', config.speakerB, tpl('p4l8b', seed + 38, data), `我喜歡這種衡量方式，因為它在乎的是穩定，不是表演。`),
  ]
}

function buildPartFive(episode, config, terms, seed) {
  const data = { topic: episode.title }
  return [
    line('b', config.speakerB, tpl('p5l1b', seed + 41, data), `如果只能挑一個最常見的誤解，你會怎麼說？`),
    line('a', config.speakerA, tpl('p5l2a', seed + 42, data), `我覺得最大的誤解，就是以為只要夠重視，這件事就應該很快變得清楚、自然、順手。`),
    line('b', config.speakerB, tpl('p5l3b', seed + 43, data), `你覺得為什麼這種誤解會一直存在？`),
    line('a', config.speakerA, tpl('p5l4a', seed + 44, data), `因為簡單的故事比較好崇拜。可是慢一點、亂一點、需要反覆修正的真相，反而更接近真實生活。`),
    line('b', config.speakerB, tpl('p5l5b', seed + 45, data), `如果把那個迷思拿掉，你會希望大家用什麼標準來看待進步？`),
    line('a', config.speakerA, tpl('p5l6a', seed + 46, data), `我會看它能不能活過普通的一天。真正健康的版本，應該是在疲累、混亂、沒有靈感的日子裡仍然存在。`),
    line('b', config.speakerB, tpl('p5l7b', seed + 47, data), `那如果是剛開始的人，已經因為進步太慢而沮喪了，你會想先對他說什麼？`),
    line('a', config.speakerA, tpl('p5l8a', seed + 48, data), `我會說，慢不是失敗。很多時候，慢只是代表你終於走進了真正會塑造你的那一段，而不是只有表面的熱情。`),
  ]
}

function buildPartSix(episode, config, terms, seed) {
  const data = { topic: episode.title, term8: terms[7] }
  return [
    line('a', config.speakerA, tpl('p6l1a', seed + 51, data), `到最後，這個主題最打動我的，是它一直在問我：當沒有人看著、也沒有什麼戲劇性場面時，我到底會怎麼活。`),
    line('b', config.speakerB, tpl('p6l2b', seed + 52, data), `你會覺得自己已經和這個主題和解了嗎？還是它仍然以某種有用的方式保持未完成？`),
    line('a', config.speakerA, tpl('p6l3a', seed + 53, data), `我覺得它還是未完成的，但不是混亂的那種未完成，而是會隨著人生階段不斷變深的那種。`),
    line('b', config.speakerB, tpl('p6l4b', seed + 54, data), `如果只能帶走一個最想放進下一段生活的提醒，你會選什麼？`),
    line('a', config.speakerA, tpl('p6l5a', seed + 55, data), `我最想記得的是，真正的改變不一定很大聲。很多最扎實的成長，從外面看其實是很安靜的。`),
    line('b', config.speakerB, tpl('p6l6b', seed + 56, data), `這樣的結論很有力量，因為它把成長當成被活出來的東西，而不是被宣告出來的東西。`),
    line('a', config.speakerA, tpl('p6l7a', seed + 57, data), `而且只要我還能回到「${terms[7]}」，我通常就能慢慢找回自己真正想成為的樣子。`, terms[7]),
    line('b', config.speakerB, tpl('p6l8b', seed + 58, data), `我喜歡這個收尾。它讓「${episode.title}」聽起來不像一個漂亮概念，而像一種可以長久活下去的方式。`),
  ]
}

function buildParts(episode, config, terms) {
  const seed = hashString(`${episode.weekNumber}-${episode.dayOfWeek}-${episode.title}`)
  return [
    { title: PART_TITLES[0], lines: buildPartOne(episode, config, terms, seed) },
    { title: PART_TITLES[1], lines: buildPartTwo(episode, config, terms, seed) },
    { title: PART_TITLES[2], lines: buildPartThree(episode, config, terms, seed) },
    { title: PART_TITLES[3], lines: buildPartFour(episode, config, terms, seed) },
    { title: PART_TITLES[4], lines: buildPartFive(episode, config, terms, seed) },
    { title: PART_TITLES[5], lines: buildPartSix(episode, config, terms, seed) },
  ]
}

function buildKeyPhrases(terms, episode) {
  return terms.slice(0, 8).map((term) => ({
    en: term,
    zh: `${term} 相關表達`,
    example: `In ${episode.title}, ${term} matters because it becomes visible through repeated choices rather than one dramatic moment.`,
  }))
}

function serializeLine(item) {
  const vocab = item.vocab && item.vocab.length
    ? `, vocab: [${item.vocab.map((v) => `{ word: '${escapeSingle(v.word)}', def: '${escapeSingle(v.def)}' }`).join(', ')}]`
    : ''
  return `          { speaker: '${item.speaker}', speakerName: '${escapeSingle(item.speakerName)}', en: '${escapeSingle(item.en)}', zh: '${escapeSingle(item.zh)}'${vocab} }`
}

function serializePart(part) {
  return `      {\n        title: '${escapeSingle(part.title)}',\n        lines: [\n${part.lines.map(serializeLine).join(',\n')}\n        ],\n      }`
}

function serializeKeyPhrase(item) {
  return `      { en: '${escapeSingle(item.en)}', zh: '${escapeSingle(item.zh)}', example: '${escapeSingle(item.example)}' }`
}

function serializeEpisode(episode) {
  return `  {\n    weekNumber: ${episode.weekNumber},\n    dayOfWeek: ${episode.dayOfWeek},\n    date: '${escapeSingle(episode.date)}',\n    theme: '${escapeSingle(episode.theme)}',\n    title: '${escapeSingle(episode.title)}',\n    phase: '${episode.phase}',\n    parts: [\n${episode.parts.map(serializePart).join(',\n')}\n    ],\n    keyPhrases: [\n${episode.keyPhrases.map(serializeKeyPhrase).join(',\n')}\n    ],\n  }`
}

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  vm.runInNewContext(script, context, { filename: filePath })
  return context.module.exports
}

function regenerateEpisode(episode) {
  const config = getPhaseConfig(episode.weekNumber)
  const terms = extractTerms(episode)
  return {
    weekNumber: episode.weekNumber,
    dayOfWeek: episode.dayOfWeek,
    date: episode.date,
    theme: episode.theme,
    title: episode.title,
    phase: config.phase,
    parts: buildParts(episode, config, terms),
    keyPhrases: buildKeyPhrases(terms, episode),
  }
}

function main() {
  const episodesDir = path.join(process.cwd(), 'content', 'episodes')
  const weekFiles = fs.readdirSync(episodesDir).filter((name) => /^week-\d{2}\.ts$/.test(name)).sort()
  let episodeCount = 0

  for (const fileName of weekFiles) {
    const filePath = path.join(episodesDir, fileName)
    const current = loadWeekFile(filePath)
    const regenerated = current.map(regenerateEpisode).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    const weekNumber = regenerated[0].weekNumber
    const content = `import { Episode } from '../types'\n\nexport const WEEK_${String(weekNumber).padStart(2, '0')}: Episode[] = [\n${regenerated.map(serializeEpisode).join(',\n')}\n]\n`
    fs.writeFileSync(filePath, content)
    episodeCount += regenerated.length
  }

  console.log(`Regenerated ${episodeCount} episodes across ${weekFiles.length} weeks`)
}

if (require.main === module) {
  main()
}

module.exports = { extractTerms, regenerateEpisode }

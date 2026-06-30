#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const EPISODES_DIR = path.join(ROOT, 'content', 'episodes');
const FORCE_ALL = process.argv.includes('--all');
const fromWeekArg = process.argv.find((arg) => arg.startsWith('--from-week='));
const toWeekArg = process.argv.find((arg) => arg.startsWith('--to-week='));
const FROM_WEEK = fromWeekArg ? Number(fromWeekArg.split('=')[1]) : 1;
const TO_WEEK = toWeekArg ? Number(toWeekArg.split('=')[1]) : 53;

const TEMPLATE_PATTERNS = [
  'surface version and a deeper version',
  'what remains after a careful engagement',
  'the useful thing about',
  'there is a version of competence with',
  'when people describe their relationship with',
  'this context-dependence makes it difficult',
  'stops being abstract and starts costing you something real',
  'tells you something about what they have been through',
  'accumulates through repeated encounters',
];

function escapeString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function countWords(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function ensureSentence(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '';
  if (/[.!?。”？！]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function stripTitle(body, title) {
  const normalized = String(body || '').toLowerCase();
  const loweredTitle = String(title || '').toLowerCase();
  return loweredTitle && normalized.includes(loweredTitle);
}

function isTemplateLike(article) {
  const body = String(article.text || '').toLowerCase();
  if (stripTitle(body, article.title)) return true;
  return TEMPLATE_PATTERNS.some((pattern) => body.includes(pattern));
}

function loadTsArrayFile(filePath, typeName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const exportMatch = source.match(/export const (\w+):\s*[\w\[\]]+\s*=\s*/);
  if (!exportMatch) {
    throw new Error(`Could not find export in ${filePath}`);
  }
  const exportName = exportMatch[1];
  const script = source
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export interface[\s\S]*?\n}\n/gm, '')
    .replace(new RegExp(`export const ${exportName}:\\s*${typeName}\\[\\]\\s*=\\s*`), 'module.exports = ');
  const context = { module: { exports: [] } };
  vm.runInNewContext(script, context, { filename: filePath });
  return { exportName, items: context.module.exports };
}

function saveArticleFile(filePath, exportName, articles) {
  const lines = [];
  lines.push("import { SpeakArticle } from './articles-w01'");
  lines.push('');
  lines.push(`export const ${exportName}: SpeakArticle[] = [`);

  articles.forEach((article, articleIndex) => {
    lines.push('  {');
    lines.push(`    topic: '${escapeString(article.topic)}',`);
    lines.push(`    title: '${escapeString(article.title)}',`);
    lines.push(`    wordCount: ${article.wordCount},`);
    lines.push(`    text: '${escapeString(article.text)}',`);
    lines.push(`    textZh: '${escapeString(article.textZh)}',`);
    lines.push('    vocabulary: [');
    article.vocabulary.forEach((item, vocabIndex) => {
      const trailing = vocabIndex === article.vocabulary.length - 1 ? '' : ',';
      lines.push(
        `      { word: '${escapeString(item.word)}', definition: '${escapeString(item.definition)}', example: '${escapeString(item.example)}' }${trailing}`
      );
    });
    lines.push('    ],');
    lines.push(articleIndex === articles.length - 1 ? '  }' : '  },');
  });

  lines.push(']');
  lines.push('');
  fs.writeFileSync(filePath, `${lines.join('\n')}`, 'utf8');
}

function episodeFileForWeek(weekNumber) {
  return path.join(EPISODES_DIR, `week-${String(weekNumber).padStart(2, '0')}.ts`);
}

function articleFileForWeek(weekNumber) {
  return path.join(ARTICLES_DIR, `articles-w${String(weekNumber).padStart(2, '0')}.ts`);
}

function selectLine(part, lang, preferredIndexes) {
  const key = lang === 'zh' ? 'zh' : 'en';
  const lines = (part?.lines || [])
    .map((line) => ensureSentence(line[key] || ''))
    .filter(Boolean);
  for (const index of preferredIndexes) {
    if (lines[index]) return lines[index];
  }
  return lines[0] || '';
}

function normalizeEnglish(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanExampleCandidate(text) {
  let cleaned = ensureSentence(text)
    .replace(/^["']|["']$/g, '')
    .replace(/^(Exactly|Right|Yes|Yeah|Absolutely|Definitely|Sure|True|Fair enough|That is true|It is|It does|That helps|I agree)\.\s+/i, '')
    .replace(/^(Exactly|Right|Yes|Yeah|Absolutely|Definitely|Sure|True|Fair enough|That is true|It is|It does|That helps|I agree),\s+/i, '')
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]/g) || [cleaned];
  if (sentences.length > 1) {
    const first = sentences[0].trim();
    const firstWords = first.split(/\s+/).filter(Boolean).length;
    if (firstWords <= 3 && !/[A-Za-z].*[A-Za-z]/.test(first.replace(/[^A-Za-z]/g, ''))) {
      cleaned = sentences.slice(1).join(' ').trim();
    }
  }

  return ensureSentence(cleaned);
}

function buildEpisodeCorpus(episode) {
  const corpus = [];
  for (const part of episode.parts || []) {
    for (const line of part.lines || []) {
      if (line.en) corpus.push(line.en);
    }
  }
  for (const phrase of episode.keyPhrases || []) {
    if (phrase.example) corpus.push(phrase.example);
    if (phrase.en && /[.?!]$/.test(phrase.en)) corpus.push(phrase.en);
  }
  return corpus
    .map((text) => cleanExampleCandidate(text))
    .filter(Boolean);
}

function scoreCandidate(candidate, phrase) {
  const candidateNorm = normalizeEnglish(candidate);
  const phraseNorm = normalizeEnglish(phrase);
  if (!candidateNorm || !phraseNorm) return -999;

  let score = 0;
  if (candidateNorm.includes(phraseNorm)) {
    score += 250;
  }

  const phraseWords = phraseNorm.split(' ').filter(Boolean);
  let matchedWords = 0;
  for (const word of phraseWords) {
    if (new RegExp(`\\b${word}(?:s|ed|ing|er|ers|ly)?\\b`).test(candidateNorm)) {
      matchedWords += 1;
    }
  }
  score += matchedWords * 40;

  const wordCount = candidate.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 8 && wordCount <= 24) {
    score += 20;
  } else {
    score -= Math.abs(16 - wordCount) * 2;
  }

  if (/\?/.test(candidate)) score -= 30;
  if (/^You can say/i.test(candidate)) score -= 10;
  if (/this phrase|this expression|that line/i.test(candidate)) score -= 20;

  return score;
}

function buildFallbackExample(word, theme, title) {
  const topic = String(theme || title || 'everyday life').toLowerCase();
  return ensureSentence(`The phrase "${word}" became easier to understand once the conversation moved into a real moment from ${topic}.`);
}

function rebuildVocabulary(article, episode) {
  const corpus = buildEpisodeCorpus(episode);
  const used = new Set();

  return (article.vocabulary || []).map((item) => {
    let bestCandidate = '';
    let bestScore = -999;

    for (const candidate of corpus) {
      const key = `${item.word}::${candidate}`;
      if (used.has(key)) continue;
      const score = scoreCandidate(candidate, item.word);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    const example = bestScore >= 60
      ? bestCandidate
      : ensureSentence(item.example || buildFallbackExample(item.word, article.topic, article.title));

    used.add(`${item.word}::${example}`);

    return {
      ...item,
      example,
    };
  });
}

function pickCore(part, lang) {
  return {
    a: selectLine(part, lang, [0, 1, 2, 3]),
    b: selectLine(part, lang, [1, 3, 5, 2, 4]),
    c: selectLine(part, lang, [3, 5, 7, 4, 2]),
    d: selectLine(part, lang, [5, 7, 6, 4, 2]),
  };
}

function buildEnglishParagraphs(episode, article, index) {
  const themeLower = String(article.topic || episode.theme || 'the topic').toLowerCase();
  const vocabWord = article.vocabulary?.[0]?.word || episode.keyPhrases?.[0]?.en || 'the key phrase';
  const parts = episode.parts || [];
  const p1 = pickCore(parts[0], 'en');
  const p2 = pickCore(parts[1], 'en');
  const p3 = pickCore(parts[2], 'en');
  const p4 = pickCore(parts[3], 'en');
  const p5 = pickCore(parts[4], 'en');

  const p1Variants = [
    `<p>The first thing this episode does right is start with a moment instead of a thesis. ${p1.a} Mira answers with a sharper frame: “${p1.b}” That shift matters because it turns ${themeLower} into something a learner can picture, not just agree with. A later line pushes the idea further: “${p1.c}” What looked random begins to look patterned, emotional, and very human. The opening works because it stays close to ordinary life long enough for the hidden logic to become visible.</p>`,
    `<p>This article opens where strong learning material usually opens: with a scene. ${p1.a} Instead of staying in the anecdote, Mira widens it with “${p1.b}” The exchange keeps moving between concrete detail and a more readable pattern, which is exactly what helps a difficult topic land. By the time the first part arrives at a line like “${p1.d}” the listener can hear the self-talk, the pressure, and the quiet assumption underneath the moment. That is what makes the topic feel lived rather than theoretical.</p>`,
    `<p>A useful companion article does not need to invent drama, because the first part already has enough texture. ${p1.a} Mira's response is the key move: “${p1.b}” She names the pattern without shaming the person inside it, and that makes the rest of the conversation easier to trust. A later line makes the tension even clearer: “${p1.c}” At that point the listener is no longer dealing with a vague issue. They are looking at a recognizable human rhythm that can be described, examined, and eventually changed.</p>`,
    `<p>What makes the opening effective is its refusal to begin with abstract advice. ${p1.a} Mira immediately translates the moment into a clearer structure: “${p1.b}” The scene then keeps unfolding through lines like “${p1.c}” until the topic stops sounding like a lesson title and starts sounding like a pattern people really live inside. That matters for English learners, because believable speaking begins with moments people can see, hear, and emotionally recognize.</p>`,
  ];

  const p2Variants = [
    `<p>The second part deepens the topic by moving from event to explanation. Jamie asks, ${p2.a} Mira replies with ${p2.b} and then sharpens the point with ${p2.c} That sequence is useful because it gives the feeling a structure. The pressure is not just personal weakness or bad luck. There is a pattern underneath it. Once that pattern is named, the listener can begin noticing it in real time instead of only after the fact, which is often where practical change begins.</p>`,
    `<p>After the opening scene, the conversation becomes more diagnostic. ${p2.a} Mira does not offer a slogan; she offers a mechanism: ${p2.b} Later she adds ${p2.d} which makes the explanation even more usable. The second part is where the episode earns its depth. It stops asking whether the situation looks good or bad and starts asking what forces are actually shaping it. That is the difference between having an opinion about ${themeLower} and understanding how it behaves under pressure.</p>`,
    `<p>The middle of the article is strong because it does not leave the first insight floating by itself. ${p2.a} Mira answers with ${p2.b} and keeps the logic moving through ${p2.c} The result is a more honest map of the situation. What seemed confusing begins to make emotional sense. That matters for learners, because useful English does not only label experiences; it helps explain why those experiences keep recurring, and why they feel the way they do while you are still inside them.</p>`,
    `<p>A lot of weaker content would stop after naming the problem. This episode does something better. ${p2.a} Mira responds with ${p2.b} and then keeps widening the frame with ${p2.c} By the end of the second part, the listener has more than a reaction. They have an interpretation. That is what makes the conversation teachable. It gives people a way to revisit their own experience with more clarity and a little less unnecessary self-blame.</p>`,
  ];

  const p3Variants = [
    `<p>For English learners, the third part is the most immediately reusable section. Jamie asks the right question first: ${p3.a} Mira answers with “${p3.b}” and then adds “${p3.c}” as another option with a slightly different tone. What makes these lines useful is not that they are sophisticated. It is that they sound like something a real person could say while still leaving room for nuance. The episode quietly teaches an important principle here: precise everyday English is usually stronger than inflated summary language.</p>`,
    `<p>The language coaching section works because it never separates English from lived experience. Jamie starts by asking ${p3.a} Then Mira gives a second and third option — “${p3.b}” and “${p3.c}” — that show how a speaker can be specific without becoming dramatic. Jamie's reaction helps explain why this matters: the English feels honest without shrinking the speaker. That balance is central to good spoken English. A strong sentence does not freeze you in a label; it leaves space for movement, context, and future change.</p>`,
    `<p>The third part turns insight into usable speech. Jamie first asks ${p3.a} Mira then gives lines someone could genuinely borrow: “${p3.b}” Later she adds “${p3.c}” and “${p3.d}” which broadens the available tone from careful to practical to quietly confident. This is what makes the section valuable in an app context. Learners are not only hearing what the topic means. They are getting live models of how to speak about it without sounding translated, defensive, or overly polished.</p>`,
    `<p>A big reason this episode feels teachable is the quality of the language in part three. Jamie wants English that can hold uncertainty without sounding weak, so he asks ${p3.a} Mira answers with lines like “${p3.b}” and “${p3.c}” When she later offers “${p3.d}” the pattern becomes even clearer: natural speaking often comes from ordinary verbs, believable detail, and the right emotional scale. The point is not to decorate the topic. It is to describe it in a way another person could instantly believe.</p>`,
  ];

  const p4Variants = [
    `<p>The fourth part keeps the article from becoming purely reflective. Jamie asks what actually helps: ${p4.a} Mira answers with “${p4.b}” She then makes the logic more practical through “${p4.c}” The advice is small on purpose. The goal is not to win a dramatic victory over the issue in one day. It is to alter the default condition just enough that a better choice becomes easier to repeat. That is why this section lands: it translates insight into design, routine, and repeatability.</p>`,
    `<p>By part four, the conversation is ready to become practical. ${p4.a} Mira's reply — “${p4.b}” — keeps the solution grounded in ordinary life rather than ideal conditions. Another line pushes the idea from motivation toward system: “${p4.c}” This is where the article becomes especially useful for adult learners. Improvement is framed as something you build into the shape of a day, not something you perform once when you are unusually inspired.</p>`,
    `<p>The practical section is effective because it respects how change really works. ${p4.a} Mira does not answer with heroic effort or perfect discipline. She answers with “${p4.b}” and then keeps the focus on repetition through “${p4.c}” That move matters because many problems around ${themeLower} are not solved by intensity. They are solved by friction, rhythm, and the design of what happens next. The fourth part makes that principle visible without overexplaining it.</p>`,
    `<p>One quiet strength of the episode is the way it handles action. ${p4.a} Mira's response, “${p4.b}” sounds modest at first, but the rest of the section shows why it is powerful. A later line makes the principle explicit: “${p4.c}” The listener can hear the real point: lasting change often comes from a smaller, steadier loop. That is the kind of lesson learners can actually carry into work, health, relationships, and any other area where insight alone is not enough.</p>`,
  ];

  const p5Variants = [
    `<p>The final part softens the conversation without making it vague. Jamie asks, ${p5.a} Mira answers with “${p5.b}” and then lowers the emotional temperature even further through “${p5.c}” That closing matters because it replaces shame with a calmer measure of progress. In that sense, a phrase like ${vocabWord} is not just vocabulary to memorize. It is a better lens for recognizing what real change, real care, or real understanding looks like while it is still happening.</p>`,
    `<p>What the episode leaves behind is not a dramatic conclusion but a clearer emotional scale. ${p5.a} Mira responds with “${p5.b}” and then keeps moving toward perspective through “${p5.c}” The result is a closing that feels earned rather than inspirational. The listener is not told to become a new person overnight. They are invited to notice what has already begun to shift. That is why the final section feels so steady, and why the vocabulary from this episode can travel well beyond the original topic.</p>`,
    `<p>The ending works because it trusts a quieter kind of insight. ${p5.a} Mira's reply — “${p5.b}” — does not chase a perfect ending; it redefines what counts as progress. A later line carries that insight even further: “${p5.c}” The whole conversation becomes easier to carry forward. The closing suggests that growth, repair, care, or clarity often arrives in forms that look ordinary from the outside. Naming those forms accurately is part of what useful English can do for a learner.</p>`,
    `<p>By the time the conversation closes, the topic has become gentler and more usable. ${p5.a} Mira answers with “${p5.b}” and keeps the perspective open through “${p5.c}” That is a strong ending for a learning app because it gives the listener a practical emotional takeaway, not just an idea. The most useful vocabulary in this episode, including ${vocabWord}, matters because it helps people describe change before it becomes dramatic enough to be obvious.</p>`,
  ];

  return [
    p1Variants[index % p1Variants.length],
    p2Variants[(index + 1) % p2Variants.length],
    p3Variants[(index + 2) % p3Variants.length],
    p4Variants[(index + 3) % p4Variants.length],
    p5Variants[(index + 1) % p5Variants.length],
  ];
}

function buildChineseParagraphs(episode, article, index) {
  const theme = article.topic || episode.theme || '這個主題';
  const vocabWord = article.vocabulary?.[0]?.word || episode.keyPhrases?.[0]?.en || '這個詞';
  const parts = episode.parts || [];
  const p1 = pickCore(parts[0], 'zh');
  const p2 = pickCore(parts[1], 'zh');
  const p3 = pickCore(parts[2], 'zh');
  const p4 = pickCore(parts[3], 'zh');
  const p5 = pickCore(parts[4], 'zh');

  const p1Variants = [
    `<p>這篇內容一開始就做對了一件事：它不是先講道理，而是先給一個很生活的畫面。${p1.a} Mira 接著用一句更準的話把那個畫面打開：「${p1.b}」這個轉向很重要，因為它讓「${theme}」不再只是大家點頭同意的概念，而是變成聽得見、也看得見的日常片段。再往後推一點，「${p1.c}」整個主題的內在邏輯就慢慢浮出來了。</p>`,
    `<p>這一篇最有效的地方，是它從一個具體時刻開始。${p1.a} 然後 Mira 很快把那個時刻讀懂：「${p1.b}」於是原本像是偶發的小事，開始變成一個可以被看見的模式。當段落再往前走到像「${p1.d}」這樣的句子時，聽的人其實已經能感覺到，這個主題真正卡住人的地方，不在表面，而在那些平常很少被說清楚的情緒與假設。</p>`,
    `<p>好的學習內容通常不需要硬把主題講得很大，因為一個真實的場景就夠有力量了。${p1.a} Mira 的回應「${p1.b}」把那個場景從抱怨變成理解，也讓後面的討論比較容易被信任。再加上「${p1.c}」整個主題就不再像教科書標題，而像一個人真的會活在裡面的經驗。</p>`,
    `<p>這篇文章的開頭之所以抓人，是因為它先讓人認出自己。${p1.a} Mira 沒有急著評論，而是先把結構說出來：「${p1.b}」接下來再用「${p1.c}」把那個感覺往前推，主題一下子就有了重量。這也是為什麼這種內容適合英語學習：它不是只給結論，而是給你一個可以練習描述的真實時刻。</p>`,
  ];

  const p2Variants = [
    `<p>第二部分把重點從「發生了什麼」往前推到「為什麼會這樣」。${p2.a} Mira 用 ${p2.b} 回應，後面又補上 ${p2.c} 讓整個解釋更完整。這一段有用的地方，在於它替那種模糊的不舒服找到結構。很多時候，問題不是你不夠好，而是某個模式正在接手整個判斷。當那個模式被講清楚之後，人比較有可能在下次更早認出它。</p>`,
    `<p>如果說第一部分給了畫面，第二部分給的就是理解。${p2.a} Mira 沒有停在安慰，而是直接指出機制：${p2.b} 再加上 ${p2.d} 這種補充，整個主題一下子從感受變成可以觀察的東西。這很重要，因為真正有用的英文學習，不只是知道怎麼說，更是慢慢知道自己到底在經歷什麼。</p>`,
    `<p>第二部分讓整篇內容變得更有深度，因為它沒有只停在表面的狀況描述。${p2.a} Mira 用 ${p2.b} 把事情講得更準，接著又透過 ${p2.c} 把脈絡補齊。這樣的安排會讓學習者慢慢發現，很多困擾其實不是孤立的，它們背後往往有一套重複發生的邏輯。看見這套邏輯，本身就是一種進步。</p>`,
    `<p>這一段的功能很像是在替第一部分做診斷。${p2.a} Mira 的回答 ${p2.b} 不是一句漂亮話，而是一種更精確的閱讀方式。等到段落又走到 ${p2.c} 的時候，聽的人會更明白：原來這個主題真正難的地方，不只是感覺不好，而是我們常常不知道自己正在被什麼推著走。</p>`,
  ];

  const p3Variants = [
    `<p>第三部分對英語學習者特別有價值，因為它直接把理解轉成能說出口的句子。Jamie 先問了一個很對的問題：${p3.a} Mira 接著給出非常可用的版本：「${p3.b}」後面她又補上「${p3.c}」這些句子。這些說法厲害的地方，不在於它們多高級，而在於它們既誠實又有空間，不會把人講死，也不會聽起來像背稿。</p>`,
    `<p>第三部分示範了一個很重要的口說原則：自然，不等於隨便；自然，通常來自精準。Jamie 先問 ${p3.a} 接著 Mira 又給出「${p3.b}」和「${p3.c}」這樣不同語氣的說法，讓學習者看見，同一個主題其實可以用更細緻的方式去表達。這就是為什麼這一段很適合 app 內容，因為它不是只告訴你意思，而是真的讓你拿得到句子。</p>`,
    `<p>很多內容會把「語言練習」和「真實生活」分開，但這一段沒有。Jamie 先把問題說出來：${p3.a} 然後 Mira 又一路往前推到「${p3.b}」與「${p3.c}」這些更具體的說法。Jamie 的反應也很關鍵，因為它提醒我們：好用的英文，往往不是最花俏的英文，而是最像一個真實人在那個情境裡會說出來的話。</p>`,
    `<p>第三部分幾乎可以直接當作口說素材來使用。Jamie 先問 ${p3.a} 後面再加上「${p3.b}」、「${p3.c}」和「${p3.d}」這些句子，學習者就不只是聽懂主題，而是能開始模仿一種更穩、更真實的語氣。這種設計很重要，因為很多人不是沒有想法，而是缺少一種能把想法安全地說出來的英文框架。</p>`,
  ];

  const p4Variants = [
    `<p>第四部分的功能，是把前面的理解落到做法上。Jamie 問的是最實際的問題：${p4.a} Mira 的回答也很實際：「${p4.b}」接著又用「${p4.c}」把這個做法說得更完整。這一段之所以有力量，是因為它不追求一次到位，而是追求可重複。很多改變之所以能留下來，不是因為你某天特別厲害，而是因為你把好的做法放進了普通的一天。</p>`,
    `<p>到了第四部分，整篇內容開始從理解走向設計。${p4.a} Mira 的回應「${p4.b}」聽起來也許不戲劇化，但後面的「${p4.c}」會讓人慢慢明白，真正有用的做法常常就是這麼小、這麼穩。這對學習者很重要，因為它提醒我們：很多問題不是靠意志力解決，而是靠節奏、環境和回到明天的可能性來解決。</p>`,
    `<p>第四部分讓人喜歡的地方，是它很尊重現實。${p4.a} Mira 沒有要求一個完美版本的你，而是先提出「${p4.b}」這種可以做得到的調整，接著再補上「${p4.c}」去說明它為什麼有效。於是整個主題變得不再只是道理，而是開始像一個人真的能放進生活裡的系統。</p>`,
    `<p>這一段很像在回答一個大家心裡都會有的問題：好，我懂了，那接下來要怎麼做？${p4.a} Mira 的回答「${p4.b}」很克制，也因此更可信。當內容再走到「${p4.c}」的時候，你會感覺到，這篇文章真正要保護的不是一時的振奮，而是那種你明天還會願意回來的節奏。</p>`,
  ];

  const p5Variants = [
    `<p>最後一部分把整個對話收得很穩。${p5.a} Mira 的回答「${p5.b}」先把情緒放回比較可承受的位置，後面再用「${p5.c}」把整體視角打開。這樣的收尾很適合學習 app，因為它沒有把人推向更用力，而是推向更準確。像 ${vocabWord} 這樣的詞，也就不只是單字，而是幫助學習者更早認出真正改變正在發生的語言。</p>`,
    `<p>最後一段之所以動人，不是因為它很勵志，而是因為它很誠實。${p5.a} Mira 用「${p5.b}」回應之後，又透過「${p5.c}」把焦點從表面成果轉回比較安靜的變化。這種結尾會讓整篇內容留下來，因為它提醒人：重要的進步，常常不是最戲劇化的那種，而是你某天回頭才發現，原來自己已經沒有那麼卡了。</p>`,
    `<p>到了最後，整個主題其實變得比一開始更溫柔，也更可用。${p5.a} Mira 的回答「${p5.b}」沒有把事情講得太滿，後面的「${p5.c}」也替整個對話留下空間。這樣的結尾很有教學價值，因為它示範了好的語言不只是描述結果，也能幫助人描述那些還在形成中的細微改變。</p>`,
    `<p>收尾這一段很有力量，因為它讓人知道，真正有用的理解通常會把人帶回更穩的地方。${p5.a} Mira 回應「${p5.b}」，接著再用「${p5.c}」把整個主題放回比較大的時間尺度裡。於是這篇內容最後留下來的，不是一句口號，而是一種更好的看法。而像 ${vocabWord} 這樣的表達，也因此有了真正的重量。</p>`,
  ];

  return [
    p1Variants[index % p1Variants.length],
    p2Variants[(index + 1) % p2Variants.length],
    p3Variants[(index + 2) % p3Variants.length],
    p4Variants[(index + 3) % p4Variants.length],
    p5Variants[(index + 1) % p5Variants.length],
  ];
}

function rebuildArticleText(episode, article, index) {
  const textParts = buildEnglishParagraphs(episode, article, index);
  const textZhParts = buildChineseParagraphs(episode, article, index);
  const text = textParts.join('');
  const textZh = textZhParts.join('');
  const vocabulary = rebuildVocabulary(article, episode);
  return {
    ...article,
    text,
    textZh,
    vocabulary,
    wordCount: countWords(text),
  };
}

function main() {
  const articleFiles = fs.readdirSync(ARTICLES_DIR)
    .filter((file) => /^articles-w\d{2}\.ts$/.test(file))
    .sort();

  let changedFiles = 0;
  let changedArticles = 0;
  let articleIndex = 0;

  for (const articleFile of articleFiles) {
    const weekMatch = articleFile.match(/articles-w(\d{2})\.ts/);
    if (!weekMatch) continue;
    const weekNumber = Number(weekMatch[1]);
    if (weekNumber < FROM_WEEK || weekNumber > TO_WEEK) continue;
    const articlePath = articleFileForWeek(weekNumber);
    const episodePath = episodeFileForWeek(weekNumber);
    const { exportName, items: articles } = loadTsArrayFile(articlePath, 'SpeakArticle');
    const { items: episodes } = loadTsArrayFile(episodePath, 'Episode');

    let touched = false;
    const rewritten = articles.map((article, localIndex) => {
      const episode = episodes.find((item) => item.title === article.title) || episodes[localIndex];
      if (!episode || (!FORCE_ALL && !isTemplateLike(article))) {
        articleIndex += 1;
        return article;
      }
      touched = true;
      changedArticles += 1;
      const rebuilt = rebuildArticleText(episode, article, articleIndex);
      articleIndex += 1;
      return rebuilt;
    });

    if (touched) {
      saveArticleFile(articlePath, exportName, rewritten);
      changedFiles += 1;
      console.log(`rewrote ${articleFile}`);
    }
  }

  console.log(`\narticle files changed: ${changedFiles}`);
  console.log(`articles rewritten: ${changedArticles}`);
}

main();

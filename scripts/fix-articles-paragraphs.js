/**
 * fix-articles-paragraphs.js
 *
 * Replaces the generic paragraph 4 and paragraph 5 in all 365 Speak Articles
 * with content that specifically references each article's title and vocabulary.
 *
 * Problems fixed:
 *   - Para 4 (EN + ZH): Only 3 versions across 365 articles → unique per article
 *   - Para 5 (EN only): ~69% repetitive endings → unique per article
 *     (ZH para 5 is already 100% unique — left untouched)
 *
 * Run: node scripts/fix-articles-paragraphs.js
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

// ─── Detection helpers ───────────────────────────────────────────────────────

const GENERIC_P4_EN = [
  'A strong response on this topic usually includes one real situation, one clear pressure point, and one practical next step.',
  'The most useful answers are rarely dramatic. They are concrete, honest, and connected to something the speaker has actually lived through.',
  'This is also a good reminder that better speaking is not only about more vocabulary. It is about choosing details that make the idea real for the listener.',
];

const GENERIC_P5_EN = [
  'In the end, the value of this topic is practical. It helps learners talk about their own decisions with language that feels precise, useful, and alive.',
  'For learners, that is the real takeaway: when the language becomes more specific, the conversation becomes more natural too.',
];

const GENERIC_P4_ZH = [
  '在這個主題上，一個好的回應通常會包含一個真實情境、一個清楚的壓力點，以及一個實際的下一步。這樣的英文會更可信，也更容易讓聽的人看見完整畫面。',
  '最有用的回答通常不會很戲劇化。它們往往更具體、更誠實，也更緊密地連到說話者真的經歷過的事情。',
  '這也是一個很好的提醒：更好的口說不只是靠更多詞彙，而是靠選擇那些能讓想法在聽的人心裡變真實的細節。',
];

function isGenericP4En(p) { return GENERIC_P4_EN.some(t => p.includes(t.slice(0, 40))); }
function isGenericP5En(p) { return GENERIC_P5_EN.some(t => p.includes(t.slice(0, 40))); }
function isGenericP4Zh(p) { return GENERIC_P4_ZH.some(t => p.includes(t.slice(0, 15))); }

// ─── Para 4 templates (English) ─────────────────────────────────────────────
// Each uses {title}, {v1}, {v2} — filled from article data

const P4_EN_TEMPLATES = [
  (t, v1, v2) => `A good speaking response about "${t}" usually begins with one specific moment — something that happened and changed how you understood ${v1}. From there, adding what made it difficult and how ${v2} eventually helped gives the listener a much clearer picture.`,

  (t, v1, v2) => `When talking about "${t}", the most useful detail is not the conclusion but the moment just before it. Describing what ${v1} felt like in context, and what ${v2} made possible, moves the response from summary to story.`,

  (t, v1, v2) => `What makes "${t}" work as a speaking topic is the gap between knowing the idea and living with it. A response that uses ${v1} in a real moment — rather than as a general opinion — tends to sound far more grounded and honest.`,

  (t, v1, v2) => `In practice, "${t}" asks learners to move beyond summary. Using ${v1} to describe a specific situation, and ${v2} to explain what changed, creates the kind of language that feels earned rather than rehearsed.`,

  (t, v1, v2) => `The challenge with "${t}" is resisting the urge to stay general. A speaker who ties ${v1} to a real observation, and connects ${v2} to what followed, produces a response that feels both honest and easy to follow.`,

  (t, v1, v2) => `Speaking well about "${t}" often requires naming the uncomfortable part — not just the resolution. Using ${v1} to describe the difficulty before the shift, and ${v2} to describe what held up afterward, creates a response worth remembering.`,

  (t, v1, v2) => `For "${t}", the difference between a forgettable and a memorable response often comes down to specificity. Grounding ${v1} in a real scene, and connecting ${v2} to what you noticed or decided, moves the speaking from abstract to real.`,

  (t, v1, v2) => `The strongest responses on "${t}" tend to have a quiet confidence: they describe a moment that involved ${v1}, explain why ${v2} mattered, and leave the listener with something they recognize from their own experience.`,

  (t, v1, v2) => `What makes "${t}" a rich speaking topic is that most people have already lived a version of it. The goal is to describe that version — using ${v1} for what was observed and ${v2} for what was decided or changed.`,

  (t, v1, v2) => `Practice with "${t}" becomes most useful when the speaker moves from general opinion to specific example. ${v1} anchors the moment; ${v2} explains what followed. That combination is what makes a response feel real rather than rehearsed.`,
];

// ─── Para 4 templates (Chinese) ─────────────────────────────────────────────

const P4_ZH_TEMPLATES = [
  (t, v1, v2) => `練習「${t}」這個主題時，一個好的口說回應通常從一個具體時刻開始——某件真正發生過、讓你重新理解「${v1}」的事。從那裡出發，再說清楚當時的難處，以及「${v2}」後來如何幫助你，整個回應就會立體很多。`,

  (t, v1, v2) => `談到「${t}」時，最有用的細節不是結論，而是結論出現之前的那一刻。說出「${v1}」在那個情境裡的感受，再說「${v2}」讓什麼事變成可能，這樣的回應比純粹的總結更能讓人聽進去。`,

  (t, v1, v2) => `「${t}」之所以適合當口說練習，是因為「知道這件事」和「真的在生活裡碰到它」之間往往有落差。用一個真實時刻帶出「${v1}」，而不是把它停留在概念層次，說出來的英文自然會更踏實。`,

  (t, v1, v2) => `練習「${t}」這個主題時，要試著超越摘要式的回答。用「${v1}」描述一個具體情境，再用「${v2}」說明後來發生了什麼，這樣的語言聽起來是真正從生活裡提煉出來的，而不是套公式說出來的。`,

  (t, v1, v2) => `面對「${t}」這個主題，最難抵擋的誘惑是一直保持籠統。如果能把「${v1}」連結到一個真實觀察，再把「${v2}」連結到接下來的結果，說出來的回應就會既誠實又容易讓人跟上。`,

  (t, v1, v2) => `口說練習「${t}」時，有時候需要先說出那個不舒服的部分，而不是直接跳到解決。用「${v1}」描述轉變前的困難，用「${v2}」說明後來什麼撐住了，這樣的回應才會真正有份量。`,

  (t, v1, v2) => `對「${t}」這個主題來說，讓人記得住的回應和讓人忘記的回應，差別通常在具體程度。把「${v1}」放進一個真實場景，再把「${v2}」連結到你注意到或選擇的事，就能讓口說從抽象走向真實。`,

  (t, v1, v2) => `「${t}」最有力的口說回應通常帶著一種安靜的自信：描述一個和「${v1}」有關的時刻，說清楚為什麼「${v2}」在那裡重要，最後留下一個聽的人能在自己生活裡認出來的東西。`,

  (t, v1, v2) => `「${t}」之所以是一個好的口說主題，是因為大多數人都已經活過一個它的版本。練習的目標就是幫助自己描述那個版本——用「${v1}」說出觀察到的事，用「${v2}」說出後來做了什麼或改變了什麼。`,

  (t, v1, v2) => `練習「${t}」這個主題時，從個人意見走向具體例子是最關鍵的一步。「${v1}」負責固定那個時刻，「${v2}」負責說明後來怎麼了。這個組合，才是讓回應聽起來真實而不是背稿的關鍵。`,
];

// ─── Para 5 templates (English only) ────────────────────────────────────────

const P5_EN_TEMPLATES = [
  (t, v1) => `That is why "${t}" rewards honest detail over clever phrasing. ${v1} works best when it is grounded in something the speaker has actually noticed, decided, or changed — not just defined.`,

  (t, v1) => `For learners working with "${t}", the real progress is not in memorizing the phrase but in finding the moment from their own life where ${v1} would have been exactly the right word.`,

  (t, v1) => `"${t}" gives learners a place to practice something harder than grammar: the ability to make an experience sound real. ${v1} is not the endpoint — it is the entry point to a richer and more honest description.`,

  (t, v1) => `The value of "${t}" is not just the vocabulary. It is the practice of noticing: what was happening, what changed, and why ${v1} belongs in that story rather than a more comfortable version of it.`,

  (t, v1) => `What "${t}" ultimately builds is fluency in the parts of life that are hard to summarize. Using ${v1} to name a real moment is worth more than any number of correct but empty sentences.`,

  (t, v1) => `"${t}" matters because it gives language to experiences most people can feel but cannot yet describe precisely. ${v1} is one of those bridge words — specific enough to be useful, human enough to stay honest.`,

  (t, v1) => `The practice of "${t}" leads somewhere most learners do not expect: not to perfect English, but to the ability to say something true in English. That is what ${v1} makes possible.`,

  (t, v1) => `In the end, "${t}" is not really about any single phrase. It is about developing the habit of connecting words to moments, and moments to meaning — and ${v1} is a useful and honest place to start.`,

  (t, v1) => `What learners discover through "${t}" is that the vocabulary is easier to use once it has a home in memory — a real scene, a real choice, a real feeling. ${v1} becomes natural when it is tied to something lived.`,

  (t, v1) => `"${t}" works because it does not ask learners to perform. It asks them to observe, then describe. When ${v1} appears in that kind of sentence — specific, grounded, and unhurried — the English takes care of itself.`,
];

// ─── Parse article data from file content ───────────────────────────────────

function parseArticles(fileContent) {
  const articles = [];
  // Extract each article block by finding vocabulary sections to determine article boundaries
  const regex = /\{\s*dateKey:\s*'([^']+)',\s*topic:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?vocabulary:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    const [fullMatch, dateKey, topic, title, vocabSection] = match;

    // Extract vocab words
    const vocabWords = [];
    const vocabRegex = /\{\s*word:\s*'([^']+)'/g;
    let vm;
    while ((vm = vocabRegex.exec(vocabSection)) !== null) {
      vocabWords.push(vm[1]);
    }

    // Extract paragraphs from text (English)
    const textMatch = fullMatch.match(/(?<![Z])text:\s*'((?:<p>[^<]*<\/p>)+)'/);
    const textZhMatch = fullMatch.match(/textZh:\s*'((?:<p>[^<]*<\/p>)+)'/);

    if (!textMatch || !textZhMatch) continue;

    const enParas = [...textMatch[1].matchAll(/<p>([^<]*)<\/p>/g)].map(m => m[1]);
    const zhParas = [...textZhMatch[1].matchAll(/<p>([^<]*)<\/p>/g)].map(m => m[1]);

    articles.push({
      dateKey,
      topic,
      title,
      vocabWords,
      enParas,
      zhParas,
      fullMatch,
    });
  }
  return articles;
}

// ─── Main fix logic ──────────────────────────────────────────────────────────

let globalIndex = 0;
let totalP4Fixed = 0, totalP5Fixed = 0;

function fixArticleFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = 0;

  // Parse each article to get its data
  const articles = parseArticles(content);

  for (const art of articles) {
    const { title, vocabWords, enParas, zhParas } = art;
    const v1 = vocabWords[0] || 'the first phrase';
    const v2 = vocabWords[1] || vocabWords[0] || 'the key phrase';
    const tplIdx = globalIndex % P4_EN_TEMPLATES.length;

    // --- Fix Para 4 (EN) ---
    if (enParas[3] && isGenericP4En(enParas[3])) {
      const newP4En = P4_EN_TEMPLATES[tplIdx](title, v1, v2);
      // Replace only this article's para 4
      const oldP4En = '<p>' + enParas[3] + '</p>';
      // Find it near the title context to be safe
      const escapedP4 = oldP4En.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleCtx = escapeRe(title);
      // Replace first occurrence after this title
      const titlePos = content.indexOf(`title: '${title}'`);
      if (titlePos === -1) continue;
      const afterTitle = content.slice(titlePos);
      const replaced = afterTitle.replace(oldP4En, '<p>' + newP4En + '</p>');
      if (replaced !== afterTitle) {
        content = content.slice(0, titlePos) + replaced;
        totalP4Fixed++;
        changed++;
      }
    }

    // --- Fix Para 4 (ZH) ---
    if (zhParas[3] && isGenericP4Zh(zhParas[3])) {
      const newP4Zh = P4_ZH_TEMPLATES[tplIdx](title, v1, v2);
      const oldP4Zh = '<p>' + zhParas[3] + '</p>';
      const titlePos = content.indexOf(`title: '${title}'`);
      if (titlePos === -1) continue;
      const afterTitle = content.slice(titlePos);
      const replaced = afterTitle.replace(oldP4Zh, '<p>' + newP4Zh + '</p>');
      if (replaced !== afterTitle) {
        content = content.slice(0, titlePos) + replaced;
        changed++;
      }
    }

    // --- Fix Para 5 (EN only) ---
    if (enParas[4] && isGenericP5En(enParas[4])) {
      const p5Idx = globalIndex % P5_EN_TEMPLATES.length;
      const newP5En = P5_EN_TEMPLATES[p5Idx](title, v1);
      const oldP5En = '<p>' + enParas[4] + '</p>';
      const titlePos = content.indexOf(`title: '${title}'`);
      if (titlePos === -1) continue;
      const afterTitle = content.slice(titlePos);
      const replaced = afterTitle.replace(oldP5En, '<p>' + newP5En + '</p>');
      if (replaced !== afterTitle) {
        content = content.slice(0, titlePos) + replaced;
        totalP5Fixed++;
        changed++;
      }
    }

    globalIndex++;
  }

  if (changed > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  return changed;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log('=== Fixing Articles Paragraph 4 & 5 ===\n');

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts')).sort();
let totalChanged = 0;

for (const file of files) {
  const count = fixArticleFile(path.join(ARTICLES_DIR, file));
  if (count > 0) {
    console.log(`  ${file}: ${count} paragraphs fixed`);
    totalChanged += count;
  }
}

console.log(`\nPara 4 fixed: ${totalP4Fixed} (EN+ZH)`);
console.log(`Para 5 fixed: ${totalP5Fixed} (EN)`);
console.log(`Total changes: ${totalChanged}`);

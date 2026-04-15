/**
 * Replace flagged template structureTips with unique alternatives
 * Targets the 7 patterns identified by audit-all-content.js
 */
const fs = require('fs'), path = require('path');
const ROOT = process.cwd();

const TEMPLATE_TIPS = new Set([
  'Try: Right now, this shows up when... / It helps me by... / The hard part is...',
  'Try: One time, I had to... / That was a moment of... / Since then,...',
  'Try: This matters because... / You can see it when... / A simple example is...',
  'Try: I usually handle this by... / What helped me was... / The tricky part is...',
  'Try: I am usually okay with... / But I draw the line when... / That matters to me because...',
  'Try: A recent time this came up was... / It became important because... / So I decided to...',
  'Try: Something I noticed recently is... / It connects to this topic because... / What I learned from it is...',
]);

// 35 unique replacement tips — varied structures, none matching the 7 templates
const REPLACEMENT_POOL = [
  'Try: The specific moment I am thinking of is... / What made it interesting was... / Looking back, I now see...',
  'Try: My honest reaction was... / I had not expected... / What I would do differently is...',
  'Try: Start with the situation in one sentence / Then explain what was at stake / End with what you chose to do',
  'Try: Pick one word that captures your feeling about this / Explain what that word means in this context / Give one example that shows why',
  'Try: The part that surprised me was... / Before, I had assumed... / Now I think...',
  'Try: My first instinct was... / But after thinking about it... / What I actually did was...',
  'Try: In my current life, this looks like... / The challenge is... / What is helping me is...',
  'Try: I would describe my experience as... / One moment that captures this is... / What it taught me was...',
  'Try: For me, the real question is... / My honest answer is... / What I am still figuring out is...',
  'Try: Name the situation first / Say what you noticed about yourself in it / End with what you want to change',
  'Try: The last time this mattered to me was... / What I was trying to do was... / How it went was...',
  'Try: Give a concrete example first / Then say what it shows about you / Then say what you would keep or change',
  'Try: I find this easy when... / I find this hard when... / The difference usually comes down to...',
  'Try: My first answer is probably too simple, so let me go deeper: ... / What is actually going on is... / Which means...',
  'Try: One person who handles this well is... / What they do differently is... / What I could borrow from them is...',
  'Try: The thing I avoid saying about this is... / Why I avoid it is... / But if I am honest...',
  'Try: Start with what you want to be true / Then describe what is actually true / Then close the gap by...',
  'Try: The version of this I am comfortable with is... / The version I am not comfortable with is... / The line is...',
  'Try: Right now my relationship with this is... / Six months ago it was... / What changed was...',
  'Try: If I had to teach this to someone, I would say... / The most important part is... / The hardest part to explain is...',
  'Try: The obvious answer is... / But what is actually true for me is... / Because...',
  'Try: Describe the situation without judgment first / Then say what you felt / Then say what you wish you had known',
  'Try: What I have tried is... / What worked was... / What I am still testing is...',
  'Try: The question behind this question is... / My answer to that deeper question is... / Which means for this question...',
  'Try: I notice I feel differently about this depending on... / When X is true, I think... / When Y is true, I think...',
  'Try: The context that matters most is... / Without that context, my answer would be... / With it, my answer is...',
  'Try: Give one story, not an opinion / Make it specific — name the setting / End with what you actually learned from it',
  'Try: My current position is... / I arrived here because... / What would change my mind is...',
  'Try: The assumption behind this question is... / Where I agree with that is... / Where I would push back is...',
  'Try: What I want to say is... / What makes it complicated is... / My actual answer, holding both, is...',
  'Try: I used to think... / Then something happened that changed that: ... / Now I think...',
  'Try: In theory I believe... / In practice I often... / The gap exists because...',
  'Try: The most honest thing I can say about this is... / Why it is hard to say is... / But saying it matters because...',
  'Try: Name one thing that is going well with this / Name one thing that is not / Say what you are going to do about the second thing',
  'Try: Describe what "good" would actually look like for you / Compare that to where you are now / Say one step that would move you closer',
];

const files = fs.readdirSync(path.join(ROOT, 'content/questions')).filter(f => f.endsWith('.ts')).sort();
let totalFixed = 0;
let poolIdx = 0;

for (const file of files) {
  const fp = path.join(ROOT, 'content/questions', file);
  let src = fs.readFileSync(fp, 'utf8');
  let fixedInFile = 0;

  for (const templateTip of TEMPLATE_TIPS) {
    const escaped = templateTip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`structureTip: '${escaped}'`, 'g');
    const count = (src.match(re) || []).length;

    for (let i = 0; i < count; i++) {
      const replacement = REPLACEMENT_POOL[poolIdx % REPLACEMENT_POOL.length];
      poolIdx++;
      src = src.replace(`structureTip: '${templateTip}'`, `structureTip: '${replacement}'`);
      fixedInFile++;
    }
  }

  if (fixedInFile > 0) {
    fs.writeFileSync(fp, src);
    console.log(`  ${file}: fixed ${fixedInFile} tips`);
    totalFixed += fixedInFile;
  }
}

console.log(`\nTotal fixed: ${totalFixed} structureTips`);

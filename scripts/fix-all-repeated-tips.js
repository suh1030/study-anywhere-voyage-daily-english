/**
 * Reduce ALL structureTips that appear 5+ times to max 4 occurrences
 */
const fs = require('fs'), path = require('path');
const ROOT = process.cwd();
const MAX = 4;

// Large pool of unique structureTips (none matching existing patterns)
const POOL = [
  "Try: Paint the scene in one sentence / Say what you were thinking at the time / Say what you would think now",
  "Try: Give your real answer, not your ideal answer / Then say why there is a gap / Then say what you are doing about it",
  "Try: Start with a fact about your life / Connect it to this topic / Say what you would change if you could",
  "Try: Describe a moment when you got this right / Describe one when you got it wrong / Say what made the difference",
  "Try: Say what you currently do / Say what you wish you did instead / Say what is stopping you",
  "Try: Make your answer as specific as possible — name a time, a place, a person / Then explain why that example matters / Then draw the connection to the topic",
  "Try: Explain your default response to this / Say where that default came from / Say whether you think it still serves you",
  "Try: Name the version of this topic that you find easy / Name the version you find difficult / Say why the hard one is harder",
  "Try: Describe your relationship with this topic in a word / Explain what that word means in your context / Say one thing that could change it",
  "Try: Say what you know from your own experience — not what you have heard or read / Then say what you are still not sure about / Then say what would help you understand better",
  "Try: Start with what matters most to you about this / Say how that shows up in your daily life / Say what you want to protect or change",
  "Try: Think of someone you respect who handles this well / Describe what they do / Say what you have tried to borrow from them",
  "Try: Name one assumption you had about this that turned out to be wrong / Say how you discovered that / Say what you believe now",
  "Try: Describe the easiest version of this challenge / Describe the hardest version / Say which one you are currently dealing with",
  "Try: Give your answer in thirty words first / Then expand the part that deserves more attention / End with the part that is still unresolved",
  "Try: Say what this topic costs you when you handle it badly / Say what it gives you when you handle it well / Say where you are on that spectrum right now",
  "Try: Name the external situation / Name your internal response / Say whether the two are in proportion",
  "Try: Start from a specific recent event, not a general feeling / Say what you noticed about yourself in it / Say what it tells you about how you are growing or not",
  "Try: Describe your typical pattern here / Say what triggers that pattern / Say whether you want to change it",
  "Try: Explain what you think is true about this / Then name one thing that complicates that view / Then say how you hold both",
  "Try: Say the thing you find hardest to admit about this topic / Say why it is hard / Say why it is worth admitting anyway",
  "Try: Name a time when outside pressure shaped your decision / Name a time when your own values did / Say which felt better afterward",
  "Try: Describe the version of this that is working in your life / Describe the version that is not / Say what you are learning from each",
  "Try: Give an example that contradicts your own general view / Say why you hold both the view and the exception / Say what that tells you",
  "Try: Name something you are still practicing around this topic / Say where you are starting from / Say what success would look like in three months",
  "Try: Tell a story about a moment when this mattered more than you expected / Say what surprised you / Say what you took away",
  "Try: Describe what you have tried to do about this / Say what worked and what did not / Say what you would try next",
  "Try: Name the conflict or tension at the heart of this for you / Say how you usually resolve it / Say whether that resolution feels right",
  "Try: Start with one true thing you know about yourself related to this / Add one thing you are still figuring out / End with one question you are sitting with",
  "Try: Say what this topic means to you right now / Say what it meant to you a few years ago / Say what changed",
  "Try: Describe a moment when this came naturally / Describe one when it did not / Say what the difference was",
  "Try: Give the factual version first / Then add the emotional layer / Then say what you want to do with all of that",
  "Try: Name what you are afraid to say about this / Say it anyway / Then explain what you were worried about",
  "Try: Think about what advice you would give a friend in this situation / Say whether you follow your own advice / Explain the gap",
  "Try: Describe the ideal outcome you want from this / Describe the realistic outcome you expect / Say what you are doing to close the gap",
  "Try: Say what you find yourself thinking about most when this topic comes up / Say why that particular thing keeps surfacing / Say what it might mean",
  "Try: Name the decision you keep putting off about this / Say what is making it hard / Say what would need to change for you to decide",
  "Try: Describe what doing this well would cost you / Describe what doing this badly costs you / Say which feels more manageable right now",
  "Try: Start with one thing you know you do well here / Add one thing you genuinely struggle with / Say what connects them",
  "Try: Name the version of this topic that energizes you / Name the version that exhausts you / Say what makes the difference",
];

const qDir = path.join(ROOT,'content/questions');
const files = fs.readdirSync(qDir).filter(f=>f.endsWith('.ts')).sort();

// First pass: count all tips globally
const tipCount = new Map();
for (const f of files) {
  const src = fs.readFileSync(path.join(qDir,f),'utf8');
  const re = /structureTip: '([^']+)'/g;
  let m;
  while ((m=re.exec(src))!==null) tipCount.set(m[1],(tipCount.get(m[1])||0)+1);
}

const overLimit = [...tipCount.entries()].filter(([,c])=>c>MAX).sort((a,b)=>b[1]-a[1]);
console.log(`Tips over limit (${MAX}): ${overLimit.length}`);
overLimit.forEach(([t,c])=>console.log(`  [${c}x] "${t.substring(0,60)}..."`));

let poolIdx = 0;
let totalFixed = 0;

for (const f of files) {
  const fp = path.join(qDir,f);
  let src = fs.readFileSync(fp,'utf8');
  let changed = false;

  for (const [tip, count] of overLimit) {
    const remaining = tipCount.get(tip) || 0;
    if (remaining <= MAX) continue;

    const escaped = tip.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const localMatches = (src.match(new RegExp(`structureTip: '${escaped}'`,'g'))||[]).length;
    if (localMatches === 0) continue;

    const excess = remaining - MAX;
    const toReplace = Math.min(localMatches, excess);

    for (let i=0;i<toReplace;i++) {
      const rep = POOL[poolIdx % POOL.length];
      poolIdx++;
      // Escape single quotes in rep
      const repEsc = rep.replace(/'/g,"\\'");
      src = src.replace(`structureTip: '${tip}'`, `structureTip: '${repEsc}'`);
      tipCount.set(tip, tipCount.get(tip)-1);
      tipCount.set(rep, (tipCount.get(rep)||0)+1);
      totalFixed++;
      changed = true;
    }
  }

  if (changed) { fs.writeFileSync(fp,src); console.log(`  Saved ${f}`); }
}

console.log(`\nReplaced: ${totalFixed}`);

// Verify final state
const finalOver = [...tipCount.entries()].filter(([,c])=>c>MAX);
console.log(`Tips still over limit: ${finalOver.length}`);
finalOver.forEach(([t,c])=>console.log(`  [${c}x] "${t.substring(0,60)}"`));

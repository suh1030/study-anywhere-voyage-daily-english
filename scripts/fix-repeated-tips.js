/**
 * Reduce high-frequency structureTips to max 4 occurrences each
 */
const fs = require('fs'), path = require('path');
const ROOT = process.cwd();

const MAX_ALLOWED = 4;

// Tips that appear too many times (15-19x each)
const HIGH_FREQ_TIPS = [
  'Try: One small step I can take is... / It is realistic because... / I hope it will...',
  'Try: For me, progress would look like... / I would notice it when... / That would matter because...',
  'Try: One situation that fits both ideas was... / First,... / Then...',
  'Try: I used to think... / But over time I realized... / Now I see that...',
  'Try: The first thing I would suggest is... / It helps because... / I would tell them to...',
  'Try: I would tell my younger self... / I did not understand then that... / What I know now is...',
  'Try: The most common challenge for me is... / Usually, I handle it by... / What still feels hard is...',
  'Try: I would start by saying... / A simple way to explain it is... / If they want to know more,...',
  'Try: I had to choose between... and... / I ended up... / Looking back, I think that was...',
  'Try: It feels energizing when... / It feels draining when... / The difference is...',
];

// Extra unique replacements (all differ from existing pool)
const EXTRA_POOL = [
  "Try: Pick the most recent example you can think of / Describe it in two or three sentences / Then say what it changed for you",
  "Try: Start with what you expected / Say what actually happened / End with what you took from the gap",
  "Try: Name the stakes first — why this mattered / Then describe what you did / Then say whether it was the right call",
  "Try: Give the short version first / Then add the one detail that makes it real / Then say what it means to you now",
  "Try: The thing I keep coming back to about this is... / It connects to my own experience because... / What I still want to understand is...",
  "Try: My relationship with this has changed / A year ago I would have said... / Now I would say...",
  "Try: What I find genuinely hard about this is... / I have tried... / What helps most is...",
  "Try: The question catches me off guard because... / My honest answer, thinking about it now, is... / What that reveals is...",
  "Try: I know someone who handles this well / What they do is... / What I have borrowed from them is...",
  "Try: The comfortable version of my answer is... / The more honest version is... / I choose the honest version because...",
  "Try: There is a version of this I am proud of / There is a version I am not / What separates them is...",
  "Try: Say what you know from experience / Say what you are still learning / Say what question you are sitting with",
  "Try: The feeling I associate with this is... / It shows up in situations like... / What it tells me about myself is...",
  "Try: My first move when this comes up is... / Whether that helps or not depends on... / What I am trying to get better at is...",
  "Try: The thing most people miss about this is... / I missed it too until... / Once I saw it, I started to...",
  "Try: Name what you want / Name what is in the way / Name one thing you can actually do about the second",
];

const files = fs.readdirSync(path.join(ROOT,'content/questions')).filter(f=>f.endsWith('.ts')).sort();

// Count global occurrences across all files
const globalCounts = new Map();
for (const tip of HIGH_FREQ_TIPS) globalCounts.set(tip, 0);

for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT,'content/questions',file),'utf8');
  for (const tip of HIGH_FREQ_TIPS) {
    const escaped = tip.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const matches = src.match(new RegExp(escaped,'g')) || [];
    globalCounts.set(tip, (globalCounts.get(tip)||0) + matches.length);
  }
}

console.log('Current counts:');
for (const [tip, count] of globalCounts) {
  console.log(`  [${count}x] "${tip.substring(0,60)}..."`);
}

let poolIdx = 0;
let totalFixed = 0;

for (const file of files) {
  const fp = path.join(ROOT,'content/questions',file);
  let src = fs.readFileSync(fp,'utf8');
  let changed = false;

  for (const tip of HIGH_FREQ_TIPS) {
    const currentGlobal = globalCounts.get(tip);
    if (currentGlobal <= MAX_ALLOWED) continue;

    const escaped = tip.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re = new RegExp(`structureTip: '${escaped}'`,'g');
    const localCount = (src.match(re)||[]).length;
    if (localCount === 0) continue;

    // How many to replace in this file
    const excess = currentGlobal - MAX_ALLOWED;
    const toReplaceHere = Math.min(localCount, excess);

    for (let i = 0; i < toReplaceHere; i++) {
      const replacement = EXTRA_POOL[poolIdx % EXTRA_POOL.length];
      poolIdx++;
      // Replace only first occurrence
      src = src.replace(`structureTip: '${tip}'`, `structureTip: '${replacement}'`);
      globalCounts.set(tip, globalCounts.get(tip) - 1);
      totalFixed++;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, src);
    console.log(`  Saved ${file}`);
  }
}

console.log(`\nTotal replaced: ${totalFixed}`);

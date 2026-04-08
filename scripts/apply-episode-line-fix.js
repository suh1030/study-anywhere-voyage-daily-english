/**
 * apply-episode-line-fix.js
 * Replaces the 124 repeated generic dialogue line in episode files
 * with theme-specific variations tied to each episode's title.
 *
 * Run: node scripts/apply-episode-line-fix.js
 */

const fs = require('fs');
const path = require('path');
const REPLACEMENTS = require('./episode-line-replacements.js');

const EPISODES_DIR = path.join(__dirname, '..', 'content', 'episodes');
const TARGET = 'It becomes visible when I slow down long enough to notice what kind of choice I am actually making.';

let totalReplaced = 0;
let notFound = [];

const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.ts')).sort();

for (const file of files) {
  const filePath = path.join(EPISODES_DIR, file);
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  let replaced = 0;

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(TARGET)) continue;

    // Find the episode title (nearest non-Part title above)
    let episodeTitle = null;
    for (let j = i; j >= Math.max(0, i - 60); j--) {
      const m = lines[j].match(/title:\s*'((?:[^'\\]|\\.)+)'/);
      if (m && !m[1].startsWith('Part')) {
        episodeTitle = m[1];
        break;
      }
    }

    if (!episodeTitle) {
      notFound.push({ file, line: i + 1, issue: 'no title found' });
      continue;
    }

    const newSentence = REPLACEMENTS[episodeTitle];
    if (!newSentence) {
      notFound.push({ file, line: i + 1, episodeTitle, issue: 'no replacement defined' });
      continue;
    }

    lines[i] = lines[i].replace(TARGET, newSentence);
    replaced++;
    totalReplaced++;
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  if (replaced > 0) console.log(`  ${file}: ${replaced} replaced`);
}

console.log(`\n=== TOTAL REPLACED: ${totalReplaced} / 124 ===`);

if (notFound.length > 0) {
  console.log(`\nUnmatched (${notFound.length}):`);
  notFound.forEach(n => console.log(`  ${n.file}:${n.line} — "${n.episodeTitle || n.issue}"`));
}

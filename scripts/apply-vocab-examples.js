/**
 * apply-vocab-examples.js
 * Applies real example sentences to all article and flashcard files.
 * Run: node scripts/apply-vocab-examples.js
 */

const fs = require('fs');
const path = require('path');
const EXAMPLES = require('./vocab-examples-data.js');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');
const FLASHCARDS_DIR = path.join(CONTENT_DIR, 'flashcards');

const TEMPLATE_PATTERNS = [
  /^A useful sentence with ".+?" usually comes from a specific moment, not from an abstract opinion\.$/,
  /^In real life, ".+?" often matters when people have to respond calmly instead of react quickly\.$/,
  /^You can use ".+?" naturally when you describe a real choice, pressure point, or change in perspective\.$/,
  /^The phrase ".+?" sounds most natural when it is tied to an actual experience from everyday life\.$/,
  /^A good way to use ".+?" is to connect it to one concrete situation from your own experience\.$/,
  /^I understand ".+?" better when I describe what happened, how I felt, and what I chose next\.$/,
  /^I notice ".+?" most clearly when a normal day suddenly asks me to choose how I want to respond\.$/,
  /^For me, ".+?" becomes real in small moments, especially when I do not have much time to think\.$/,
];

function isTemplate(s) {
  return TEMPLATE_PATTERNS.some(p => p.test(s.trim()));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let totalArticleReplaced = 0;
let totalFlashcardReplaced = 0;
let missingWords = new Set();

// Fix article files
console.log('\n=== Fixing Article Files ===');
const articleFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.ts')).sort();

for (const file of articleFiles) {
  const filePath = path.join(ARTICLES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let replaced = 0;

  // Find all vocab entries: { word: 'X', definition: 'Y', example: 'Z' }
  // We use a careful regex to avoid crossing entry boundaries
  content = content.replace(
    /(\{ *word: *'([^']+)', *definition: *'([^']+)', *example: *')((?:[^'\\]|\\.)*)('  *\})/g,
    (match, prefix, word, definition, example, suffix) => {
      if (!isTemplate(example)) return match;
      const newExample = EXAMPLES[word];
      if (!newExample) {
        missingWords.add(word);
        return match;
      }
      replaced++;
      totalArticleReplaced++;
      return `${prefix}${newExample}${suffix}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  if (replaced > 0) console.log(`  ${file}: ${replaced} replaced`);
}

console.log(`\nArticles total replaced: ${totalArticleReplaced}`);

// Fix flashcard files
console.log('\n=== Fixing Flashcard Files ===');
const flashcardFiles = fs.readdirSync(FLASHCARDS_DIR).filter(f => f.endsWith('.ts')).sort();

for (const file of flashcardFiles) {
  const filePath = path.join(FLASHCARDS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let replaced = 0;

  // Match: english: 'X', chinese: 'Y', exampleSentence: 'Z'
  content = content.replace(
    /(english: *'([^']+)', *chinese: *'([^']+)', *exampleSentence: *')((?:[^'\\]|\\.)*)('}?)/g,
    (match, prefix, word, chinese, example, suffix) => {
      if (!isTemplate(example)) return match;
      const newExample = EXAMPLES[word];
      if (!newExample) {
        missingWords.add(word);
        return match;
      }
      replaced++;
      totalFlashcardReplaced++;
      return `${prefix}${newExample}${suffix}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  if (replaced > 0) console.log(`  ${file}: ${replaced} replaced`);
}

console.log(`\nFlashcards total replaced: ${totalFlashcardReplaced}`);
console.log(`\n=== TOTAL REPLACEMENTS: ${totalArticleReplaced + totalFlashcardReplaced} ===`);

if (missingWords.size > 0) {
  console.log(`\nWords without example sentences (${missingWords.size}):`);
  [...missingWords].sort().forEach(w => console.log(`  - "${w}"`));
}

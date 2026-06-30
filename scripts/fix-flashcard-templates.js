/**
 * Fix 24 flashcard template example sentences with real demonstrations
 */
const fs = require('fs'), path = require('path')

// Proper example sentences for each affected flashcard
const FIXES = {
  'w1-listen-01': 'After losing his job, he took three months to let go of last year and figure out what he actually wanted next.',
  'w1-listen-02': 'She decided to turn the page on a difficult friendship rather than keep revisiting the same argument.',
  'w1-speak-01': 'She finally let go of last year by writing down what she would stop carrying into the next one.',
  'w1-speak-02': 'Finishing therapy felt like turning the page — not erasing the past, but choosing not to live inside it.',
  'w2-listen-02': 'A slow morning without her phone gave her more ideas before nine than she usually had all day.',
  'w2-listen-03': 'A ten-minute walk before work set the tone for a calmer, more focused afternoon.',
  'w2-listen-04': 'Starting the day well meant something different to her after she stopped treating every morning as a performance.',
  'w2-speak-02': 'He started protecting his slow morning from meetings after realizing it was where his best thinking happened.',
  'w2-speak-03': 'The way you handle your first hour often sets the tone for how you handle the rest of the day.',
  'w2-speak-04': 'She learned that starting the day well had nothing to do with productivity and everything to do with feeling ready.',
  'w3-listen-01': 'His daily commute used to feel wasted until he started using it to listen to things that genuinely interested him.',
  'w3-speak-01': 'She transformed her daily commute from a source of stress into thirty minutes of audiobooks she actually looked forward to.',
  'w4-listen-01': 'After six months in a new city, she finally started to feel at home once she found her neighborhood café.',
  'w4-listen-02': 'He missed home cooking so much that he started calling his mother on weekends just to get her recipes.',
  'w4-speak-01': 'It took two years in the new apartment before she truly felt at home — not when she moved in, but when she stopped noticing the space.',
  'w4-speak-02': 'She took up home cooking during the pandemic and discovered it was as much about patience as it was about food.',
  'w5-listen-01': 'The family gathering for her grandmother\'s ninetieth family milestone brought everyone back together for the first time in four years.',
  'w5-listen-02': 'They decided to mark the moment by planting a tree in the garden rather than buying something that would be forgotten.',
  'w5-speak-01': 'A family gathering does not have to be large to feel meaningful — sometimes a quiet dinner is exactly right.',
  'w5-speak-02': 'She wanted to mark the moment properly, so she took a day off work and cooked everyone\'s favorite meal.',
  'w6-listen-03': 'A food memory from childhood can carry more emotion than any photograph — the smell alone brings everything back.',
  'w6-listen-04': 'They rarely eat out on weekdays anymore, but Friday nights have become a tradition they both protect.',
  'w6-speak-03': 'Her food memory of her father\'s Saturday pancakes was so strong that she made them the same way for her own children.',
  'w6-speak-04': 'He likes to eat out on his own occasionally — it gives him time to think without any agenda.',
}

const filePath = path.join('content/flashcards/flashcards-w01-w08.ts')
let src = fs.readFileSync(filePath, 'utf8')
let fixed = 0

for (const [id, newExample] of Object.entries(FIXES)) {
  // Find the card by id and replace its exampleSentence
  // Pattern: id: 'w1-listen-01', ... exampleSentence: '...'
  const idPattern = new RegExp(
    `(\\{ id: '${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',(?:[^}]|\\{[^}]*\\})*?exampleSentence: ')[^']*(')`
  )
  const newSrc = src.replace(idPattern, `$1${newExample}$2`)
  if (newSrc !== src) {
    src = newSrc
    fixed++
    console.log(`  ✓ ${id}: "${newExample.substring(0, 60)}..."`)
  } else {
    console.warn(`  ! ${id}: not found or no change`)
  }
}

fs.writeFileSync(filePath, src)
console.log(`\nFixed ${fixed} flashcard examples`)

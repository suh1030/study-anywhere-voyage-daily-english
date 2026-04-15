#!/usr/bin/env python3
"""
Fix flashcard exampleSentence fields where the quoted target word
doesn't match the card's own english field.

Template sentences like:
  'A good way to use "fresh starts" is ...'  ← when card.english = 'steady routine'
should be:
  'A good way to use "steady routine" is ...'

Also fix:
- 'getting around commute stories' → 'get around' (actual useful phrase)
- chinese definitions that are just '和XX有關的常用說法' (too generic) → proper definitions
"""

import re
import glob
import os

BASE = '/Users/suh/Desktop/study-anywhere-voyage/study-anywhere-voyage-daily-english'

# Template sentence prefixes — these are the ones where the quoted word should == card.english
TEMPLATE_PREFIXES = [
    'A good way to use',
    'I understand',
    'You can use',
    'The phrase',
    'In real life,',
    'A useful sentence with',
    'I notice',
    'For me,',
]

# Broken vocab entries: old english → (new english, new chinese)
ENGLISH_WORD_RENAMES = {
    'getting around commute stories': ('get around', '四處移動；找到方法'),
    'walking': ('walking to work', '步行上班'),
    'cycling work': ('cycling to work', '騎自行車上班'),
}

# Generic chinese definitions to fix: english word → proper definition
BETTER_CHINESE = {
    'commuting': '通勤',
    'get around': '四處移動；找到方法',
    'walking to work': '步行上班',
    'cycling to work': '騎自行車上班',
    'food': '食物；飲食',
    'eating habits': '飲食習慣',
    'habits': '習慣',
    'weather': '天氣',
    'seasons': '季節',
    'shopping': '購物',
    'money': '金錢',
    'budgeting': '預算管理',
    'home': '家；住所',
    'celebrations': '慶典；慶祝活動',
    'festivals': '節日；節慶',
}

def is_template_sentence(sentence):
    for prefix in TEMPLATE_PREFIXES:
        if sentence.strip().startswith(prefix):
            return True
    return False

def fix_template_sentence(sentence, english_word):
    """Replace the first quoted English phrase in a template sentence with english_word."""
    # Match quoted phrase: "something"
    def replacer(m):
        return f'"{english_word}"'
    return re.sub(r'"[^"]+"', replacer, sentence, count=1)

def fix_flashcard_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changes = []

    # Parse each flashcard line and fix
    lines = content.split('\n')
    new_lines = []

    for line in lines:
        # Match a flashcard entry line
        m = re.match(
            r"(\s*\{ id: '([^']+)', source: '([^']+)', weekNumber: (\d+), "
            r"english: '([^']+)', chinese: '([^']+)', exampleSentence: '(.+)' \},?)$",
            line
        )
        if not m:
            new_lines.append(line)
            continue

        prefix = m.group(1).split('{')[0]
        card_id = m.group(2)
        source = m.group(3)
        week = m.group(4)
        english = m.group(5)
        chinese = m.group(6)
        example = m.group(7)

        modified = False

        # 1. Fix broken english word names
        if english in ENGLISH_WORD_RENAMES:
            new_english, new_chinese = ENGLISH_WORD_RENAMES[english]
            changes.append(f"  {card_id}: english '{english}' → '{new_english}'")
            english = new_english
            chinese = new_chinese
            modified = True

        # 2. Fix generic chinese definitions
        if english in BETTER_CHINESE and ('常用說法' in chinese or chinese == chinese):
            better = BETTER_CHINESE[english]
            if better != chinese:
                changes.append(f"  {card_id}: chinese improved → '{better}'")
                chinese = better
                modified = True

        # 3. Fix exampleSentence when it references wrong quoted word
        if is_template_sentence(example):
            # Find the quoted word
            quoted = re.search(r'"([^"]+)"', example)
            if quoted and quoted.group(1).lower() != english.lower():
                new_example = fix_template_sentence(example, english)
                if new_example != example:
                    changes.append(
                        f"  {card_id}: example '{quoted.group(1)}' → '{english}'"
                    )
                    example = new_example
                    modified = True

        if modified:
            new_line = (
                f"{prefix}{{ id: '{card_id}', source: '{source}', weekNumber: {week}, "
                f"english: '{english}', chinese: '{chinese}', exampleSentence: '{example}' }},"
            )
            # Preserve trailing comma or not
            if not line.rstrip().endswith(','):
                new_line = new_line.rstrip(',')
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    content = '\n'.join(new_lines)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes
    return False, []


def main():
    files = sorted(glob.glob(os.path.join(BASE, 'content/flashcards/flashcards-*.ts')))
    total_files = 0
    total_changes = 0

    print(f"Processing {len(files)} flashcard files...\n")

    for filepath in files:
        fname = os.path.basename(filepath)
        changed, changes = fix_flashcard_file(filepath)
        if changed:
            total_files += 1
            total_changes += len(changes)
            print(f"✓ {fname} ({len(changes)} changes)")
            for c in changes:
                print(c)
            print()

    print(f"{'='*50}")
    print(f"Total files modified: {total_files}")
    print(f"Total changes applied: {total_changes}")


if __name__ == '__main__':
    main()

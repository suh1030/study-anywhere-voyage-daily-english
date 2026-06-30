#!/usr/bin/env python3
"""
Strip '；常用來談XX' from flashcard chinese definitions,
replacing with proper standalone definitions using ARTICLE_VOCAB_DEFS.
"""

import re
import glob
import os

BASE = '/Users/suh/Desktop/study-anywhere-voyage/study-anywhere-voyage-daily-english'

DEFS = {
    'adapting': '適應；隨情況調整',
    'aging': '老化；年老',
    'animals': '動物',
    'appreciation': '感激；欣賞',
    'audio': '音訊；聲音',
    'awkward moments': '尷尬的時刻',
    'being led': '被領導',
    'beliefs': '信念；信仰',
    'body': '身體',
    'boundaries': '界限；邊界',
    'breakfast conversations': '早餐對話',
    'budgeting': '預算管理',
    'capacity': '能力；承受度',
    'career development': '職涯發展',
    'career goals': '職涯目標',
    'careful attention': '細心留意；謹慎關注',
    'character': '品格；個性',
    'chosen family': '自己選擇的家人',
    'clear priority': '清楚的優先事項',
    'colleagues': '同事',
    'communication styles': '溝通風格',
    'community': '社群；社區',
    'commuting etiquette': '通勤禮儀',
    'conflict': '衝突；矛盾',
    'consistent effort': '持續的努力',
    'creativity': '創意；創造力',
    'culture': '文化',
    'daily schedules': '每日時間安排',
    'difficult colleagues': '難相處的同事',
    'discussions': '討論',
    'early bird advantage': '早起的優勢',
    'eating habits': '飲食習慣',
    'eating out': '外出用餐',
    'emotional expression': '情感表達',
    'emotional pressure': '情緒壓力',
    'exclusion': '被排除在外的感覺',
    'family': '家人；家庭',
    'family gatherings': '家庭聚會',
    'family recipes': '家傳食譜',
    'family reunions': '家族聚會',
    'fitness': '體能；健身',
    'fitness pressure': '對健身外貌的壓力',
    'food': '食物；飲食',
    'food culture': '飲食文化',
    'food memories': '飲食的記憶',
    'food trends': '飲食趨勢',
    'fresh starts': '重新開始',
    'friend groups': '朋友圈',
    'friendship': '友誼',
    'giving': '付出；給予',
    'goals': '目標',
    'gratitude': '感恩；感謝',
    'growth': '成長',
    'habits': '習慣',
    'health': '健康',
    'healthy eating': '健康飲食',
    'honest reflection': '誠實的自我反思',
    'identity': '身份認同',
    'indirect communication': '間接溝通方式',
    'influence': '影響力',
    'intentions': '意圖；目的',
    'international cuisine': '國際料理',
    'invitations': '邀請',
    'language': '語言',
    'leadership': '領導力',
    'learning': '學習',
    'local eats': '在地美食',
    'long-distance commuters': '長途通勤者',
    'long-term growth': '長期成長',
    'mental wellbeing': '心理健康',
    'mindful mornings': '正念晨間',
    'money': '金錢',
    'morning routines': '晨間習慣',
    'music': '音樂',
    'music shapes mood': '音樂影響心情',
    'musical taste': '音樂品味',
    'networking without feeling fake': '不刻意的人脈經營',
    'parents': '父母',
    'perfect morning': '完美早晨',
    'personal direction': '個人的方向感',
    'personal growth': '個人成長',
    'personal identity': '個人認同',
    'personality': '個性；性格',
    'personality signals': '個性所傳遞的訊息',
    'podcasts': '播客',
    'pressure': '壓力',
    'professional growth': '職業成長',
    'reading': '閱讀',
    'reflection': '反思；回顧',
    'remote work': '遠端工作',
    'resolution': '決心；新的開始願望',
    'resolutions': '新的開始決心；目標',
    'restaurant culture': '餐廳文化',
    'schedules': '時間表；行程安排',
    'seasons': '季節',
    'shared listening': '共同聆聽體驗',
    'shared understanding': '共同的理解',
    'small adjustment': '小小的調整',
    'social connection': '社交連結',
    'social energy': '社交能量',
    'social media': '社群媒體',
    'social situations': '社交場合',
    'steady routine': '穩定的日常節奏',
    'street food': '街頭小吃',
    'sustainability': '永續性；可持續發展',
    'team connection': '團隊連結',
    'teamwork': '團隊合作',
    'transitions': '人生轉換期',
    'values': '價值觀',
    'walking': '步行',
    'walking to work': '步行上班',
    'cycling to work': '騎自行車上班',
    'weather': '天氣',
    'writing': '寫作',
    'shopping': '購物',
    'commuting': '通勤',
    'gatherings': '聚會活動；聚會活動',
    'community events': '特別場合；聚會傳統',
    'home': '家；住所',
    'get around': '四處移動；找到方法',
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    count = 0

    def replacer(m):
        nonlocal count
        english = m.group(1)
        old_chinese = m.group(2)
        if '；常用來談' in old_chinese:
            # Strip the suffix
            base = old_chinese.split('；常用來談')[0]
            # Use proper definition if available
            if english.lower() in DEFS:
                new_chinese = DEFS[english.lower()]
            else:
                new_chinese = base  # just strip the suffix
            count += 1
            return f"english: '{english}', chinese: '{new_chinese}'"
        return m.group(0)

    content = re.sub(
        r"english: '([^']+)', chinese: '([^']+)'",
        replacer,
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, count
    return False, 0


def main():
    files = sorted(glob.glob(os.path.join(BASE, 'content/flashcards/flashcards-*.ts')))
    total = 0
    for fp in files:
        changed, n = fix_file(fp)
        if changed:
            total += n
            print(f"✓ {os.path.basename(fp)}: {n} chinese fields fixed")
    print(f"\nTotal: {total} flashcard chinese fields fixed")


if __name__ == '__main__':
    main()

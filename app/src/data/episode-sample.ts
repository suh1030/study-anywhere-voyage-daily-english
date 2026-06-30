// Episode types — shared across content files and app
export interface EpisodeLine {
  speaker: 'a' | 'b'
  speakerName: string
  en: string
  zh: string
  vocab?: { word: string; def: string }[]
}

export interface EpisodePart {
  title: string
  lines: EpisodeLine[]
}

export interface Episode {
  weekNumber: number       // 1–53（rolling curriculum week number）
  dayOfWeek: number        // 1–7；W1/W53 為 1–4
  theme: string            // 當週主題（同週 7 集共用）
  title: string            // 當集專屬標題
  phase: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
  parts: EpisodePart[]
  keyPhrases: { en: string; zh: string; example: string }[]
}

export const SAMPLE_EPISODE: Episode = {
  weekNumber: 2,
  dayOfWeek: 1,
  theme: 'Morning Routines',
  title: 'A Day in the Life: Morning Habits',
  phase: 'p1',
  parts: [
    {
      title: 'Part 1 — Daily Routine',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Hey Mira! I've been meaning to ask you this for a while — what does a typical day actually look like for you?",
          zh: '嘿，Mira！我想問你這個問題很久了——你的日常到底是什麼樣子？',
          vocab: [{ word: "I've been meaning to", def: '我一直想要（做某事）' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Ha, good question. Honestly, it's pretty structured. I live about an hour outside the city, but I work downtown. So just the geography alone means my day has to start really early.",
          zh: '哈，好問題。老實說蠻規律的。我住在離市區約一小時的地方，但在市中心上班，光是距離就意味著我的一天必須很早開始。',
          vocab: [{ word: 'geography', def: '地理位置' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Oh wow, an hour commute — that's no joke. What time are we talking?",
          zh: '哇，一小時的通勤——這不是開玩笑。我們說的是幾點？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "My alarm goes off at 5:15. I know, I know — it sounds brutal. But I've kind of made peace with it. I actually enjoy having that quiet time before the world wakes up.",
          zh: '我的鬧鐘 5:15 響。我知道，聽起來很殘酷。但我已經跟它和平共處了。我其實很享受在世界醒來之前的安靜時光。',
          vocab: [
            { word: 'goes off', def: '（鬧鐘）響起' },
            { word: 'made peace with', def: '接受、釋懷' },
          ],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's actually a really nice way to think about it. So what's the first thing you do?",
          zh: '這真是個很好的想法。那你做的第一件事是什麼？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I start with water — like a full glass. Then I stretch for a few minutes and head to the kitchen to make coffee.",
          zh: '我先喝水——一大杯。然後伸展幾分鐘，走到廚房煮咖啡。',
          vocab: [{ word: 'head to', def: '前往' }],
        },
      ],
    },
    {
      title: 'Part 2 — The Commute',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "So after your morning routine, you head out for the commute. How do you get to work?",
          zh: '所以在你的早晨日常之後，你就出門通勤了。你怎麼去上班？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I drive to the train station, which takes about ten minutes, and then it's a 45-minute ride into the city.",
          zh: '我開車到火車站，大約十分鐘，然後搭四十五分鐘的火車進城。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "And what do you do during the train ride?",
          zh: '在火車上你都做什麼？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "That's actually my favorite part of the day. I listen to podcasts, read, or sometimes just look out the window and zone out for a bit.",
          zh: '那其實是我一天中最喜歡的部分。我會聽 Podcast、看書，有時候就是看看窗外放空一下。',
          vocab: [{ word: 'zone out', def: '放空、發呆' }],
        },
      ],
    },
  ],
  keyPhrases: [
    { en: "I've been meaning to...", zh: '我一直想要...', example: "I've been meaning to try that new restaurant." },
    { en: 'make peace with', zh: '接受、釋懷', example: "I've made peace with waking up early." },
    { en: 'zone out', zh: '放空', example: 'I sometimes zone out during long meetings.' },
  ],
}

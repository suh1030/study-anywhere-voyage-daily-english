import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_02: Episode = {
  weekNumber: 2,
  theme: 'Commuting',
  title: 'Getting Around: Commute Stories',
  phase: 'p1',
  parts: [
    {
      title: 'Part 1 — The Daily Commute',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "So Mira, last time you mentioned your commute is about an hour. That's a big chunk of your day. How do you actually feel about it?",
          zh: 'Mira，你上次提到通勤大約一小時。那佔了你一天很大一部分時間。你對此有什麼感覺？',
          vocab: [{ word: 'a big chunk of', def: '很大一部分' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Honestly, it depends on the day. Some mornings I'm totally fine with it — it's like my buffer zone between home and work. But other days, especially when it rains, it can feel like forever.",
          zh: '老實說，要看那天的狀況。有些早晨我完全可以接受——就像是家和公司之間的緩衝區。但有些日子，尤其下雨的時候，會覺得好像永遠到不了。',
          vocab: [{ word: 'buffer zone', def: '緩衝區' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "I totally get that. Rain changes everything. So walk me through your commute — what does it look like from door to door?",
          zh: '我完全理解。下雨真的什麼都變了。那跟我說說你的通勤過程——從出門到進公司是什麼樣子？',
          vocab: [{ word: 'from door to door', def: '從出門到抵達目的地' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Okay, so I leave the house around 6:45. I walk about ten minutes to the bus stop. The bus takes me to the train station — that's maybe fifteen minutes if there's no traffic. Then the train ride is around thirty-five minutes into the city center.",
          zh: '好的，我大約 6:45 出門。走大約十分鐘到公車站。公車載我到火車站——如果不塞車的話大概十五分鐘。然後搭火車到市中心大約三十五分鐘。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "And then another walk to the office?",
          zh: '然後再走一段路到公司？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Yeah, about seven minutes on foot. So all in, it's roughly an hour and ten minutes. On a good day, anyway.",
          zh: '對，走路大約七分鐘。所以全部加起來，大概一小時十分鐘。順利的話啦。',
          vocab: [{ word: 'all in', def: '全部加起來' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's quite a journey. Do you ever think about moving closer to work?",
          zh: '那真是一段不短的旅程。你有想過搬到離公司近一點的地方嗎？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I've thought about it, but rent in the city is way more expensive. And honestly, I kind of like having that separation. It gives me time to mentally switch gears.",
          zh: '我想過，但市區的房租貴很多。而且說實話，我蠻喜歡這種分隔的。讓我有時間在心理上切換模式。',
          vocab: [{ word: 'switch gears', def: '切換模式、轉換心態' }],
        },
      ],
    },
    {
      title: 'Part 2 — Public Transportation',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "So you take both a bus and a train. Do you have a preference?",
          zh: '所以你搭公車又搭火車。你比較喜歡哪個？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "The train, definitely. It's more reliable and I always get a seat if I catch the early one. The bus is a bit of a gamble — sometimes it's right on time, sometimes you're standing there for twenty minutes.",
          zh: '火車，絕對是。比較準時，而且如果搭早班的話一定有座位。公車就有點碰運氣——有時候很準時，有時候你要站在那等二十分鐘。',
          vocab: [{ word: 'a bit of a gamble', def: '有點碰運氣' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Do you use a transit card or buy tickets each time?",
          zh: '你用交通卡還是每次買票？',
          vocab: [{ word: 'transit card', def: '交通卡（如悠遊卡）' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, a transit card for sure. I top it up once a month. Buying individual tickets every day would drive me crazy.",
          zh: '當然是交通卡。我一個月儲值一次。每天買單程票會讓我瘋掉。',
          vocab: [{ word: 'top up', def: '儲值、加值' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "What about the crowd? I imagine mornings are packed.",
          zh: '那人潮呢？我猜早上一定很擠。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Rush hour is no joke. The train between 7:30 and 8:30 is shoulder to shoulder. That's why I try to catch the 7:10 one — it's way less crowded, and I actually get to enjoy the ride.",
          zh: '尖峰時段真的不誇張。七點半到八點半的火車擠到肩膀碰肩膀。所以我盡量搭 7:10 那班——人少很多，我還能享受搭車的時光。',
          vocab: [{ word: 'shoulder to shoulder', def: '肩並肩（形容非常擁擠）' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Smart move. So you're basically trading sleep for comfort.",
          zh: '聰明。所以你基本上是用睡眠換舒適。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Ha, exactly. But I'd rather lose fifteen minutes of sleep than spend the ride squished between strangers.",
          zh: '哈，沒錯。但我寧願少睡十五分鐘，也不想被擠在陌生人之間。',
        },
      ],
    },
    {
      title: 'Part 3 — Dealing with Delays',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "What happens when things go wrong? Like, delays or cancellations?",
          zh: '出狀況的時候怎麼辦？像是延誤或停駛？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, it happens more often than you'd think. Last month, there was a signal problem and the entire line was delayed for forty minutes. Everyone on the platform was just standing around, looking frustrated.",
          zh: '噢，這比你想像的還常發生。上個月有一次號誌故障，整條路線延誤了四十分鐘。月台上每個人都站在那邊，看起來很煩躁。',
          vocab: [{ word: 'signal problem', def: '號誌故障' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That sounds stressful. What did you do?",
          zh: '聽起來很有壓力。你怎麼處理？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I texted my manager right away to let her know I'd be late. Then I just found a bench and read my book. There's really nothing you can do, so I've learned not to stress about it.",
          zh: '我馬上傳訊息給主管，讓她知道我會遲到。然後就找了張長椅坐下來看書。你真的什麼都做不了，所以我學會了不要為此壓力太大。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's a pretty mature attitude. I think I'd just pace around and check the app every thirty seconds.",
          zh: '那態度挺成熟的。我大概會一直來回踱步，每三十秒看一次 App。',
          vocab: [{ word: 'pace around', def: '來回踱步' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, I used to do that too. But after a while, you realize that getting anxious doesn't make the train come faster.",
          zh: '噢，我以前也是這樣。但過了一陣子你就會發現，焦慮並不會讓火車來得更快。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Does your company have a flexible policy for situations like that?",
          zh: '你們公司對這種情況有彈性的政策嗎？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Yeah, thankfully. As long as you give a heads up and it's not happening every day, they're pretty understanding. Some of my colleagues who live even further actually work from home one or two days a week.",
          zh: '有，幸好有。只要你事先通知，而且不是每天都這樣，他們蠻通融的。我有些住更遠的同事，一週有一兩天在家上班。',
          vocab: [{ word: 'give a heads up', def: '事先通知、打聲招呼' }],
        },
      ],
    },
    {
      title: 'Part 4 — Making the Most of Commute Time',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "You mentioned earlier that you listen to podcasts on the train. What else do you do to pass the time?",
          zh: '你之前提到在火車上聽 Podcast。你還做什麼來打發時間？',
          vocab: [{ word: 'pass the time', def: '打發時間' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "It really depends on my mood. If I'm feeling productive, I'll review my to-do list for the day or catch up on emails. If I'm tired, I just put on some music and close my eyes.",
          zh: '看心情。如果我覺得有動力，就會看一下當天的待辦事項或回信。如果很累，就放點音樂閉眼休息。',
          vocab: [{ word: 'catch up on', def: '趕上進度、補做' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Do you ever study anything during your commute? Like, learning a new skill or language?",
          zh: '你通勤時會學什麼嗎？像是學新技能或語言？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Actually, yes! That's how I started practicing my English listening. I figured if I'm spending two hours a day on transportation, I might as well use some of that time for something useful.",
          zh: '其實有耶！我就是這樣開始練英文聽力的。我想既然每天花兩小時在交通上，不如善用一些時間做有意義的事。',
          vocab: [{ word: 'might as well', def: '不如、倒不如' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's really smart. Turning dead time into productive time.",
          zh: '真聰明。把空白時間變成有效率的時間。',
          vocab: [{ word: 'dead time', def: '空白時間、無所事事的時間' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Exactly. And on the way home, I usually switch to something more relaxing — a lighthearted podcast or just scrolling through articles. It helps me decompress before I get home.",
          zh: '沒錯。回程的時候，我通常會換成比較輕鬆的東西——輕鬆的 Podcast 或是隨便看看文章。這讓我在到家之前先減壓一下。',
          vocab: [{ word: 'decompress', def: '減壓、放鬆' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That makes sense. Like a mental transition between work mode and home mode.",
          zh: '有道理。就像是工作模式和居家模式之間的心理轉換。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Right. By the time I walk through the front door, I've already let go of most of the work stress.",
          zh: '沒錯。等我走進家門的時候，大部分的工作壓力已經放下了。',
        },
      ],
    },
    {
      title: 'Part 5 — Commute Tips and Reflections',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "If someone just started a long commute, what advice would you give them?",
          zh: '如果有人剛開始長途通勤，你會給他們什麼建議？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "First, find your rhythm. Don't try to be productive every single minute — that's exhausting. Some days it's okay to just stare out the window and do nothing.",
          zh: '首先，找到你自己的節奏。不要每分每秒都想要有效率——那太累了。有些日子，就看看窗外什麼都不做也沒關係。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's surprisingly refreshing advice. What else?",
          zh: '這建議意外地讓人耳目一新。還有呢？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Get good headphones. Seriously. They block out noise and make the whole experience so much better. Also, always have a backup plan — know an alternative route in case your usual line is down.",
          zh: '買一副好耳機。認真的。它們能隔絕噪音，讓整個體驗好很多。還有，永遠要有備案——知道一條替代路線，以防你平常的路線停駛。',
          vocab: [{ word: 'alternative route', def: '替代路線' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "The backup plan thing is key. I know people who completely fall apart when their regular route is disrupted.",
          zh: '備案這點是關鍵。我認識有些人，一旦平時的路線被打亂就完全崩潰。',
          vocab: [{ word: 'fall apart', def: '崩潰、瓦解' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Right? And one more thing — try to leave a little earlier than you think you need to. That extra ten minutes can save you so much stress. When you're not rushing, the whole commute feels different.",
          zh: '對吧？還有一件事——盡量比你覺得需要的時間再早出門一點。那多出來的十分鐘可以幫你省掉很多壓力。不趕時間的時候，整個通勤感覺就不一樣了。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "You know, I think a lot of people see commuting as wasted time, but you've really turned it into something meaningful.",
          zh: '你知道嗎，我覺得很多人把通勤當成浪費的時間，但你真的把它變成有意義的事了。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Thanks, Jamie. I mean, it took me a while to get there. But now I honestly think my commute is one of the most underrated parts of my day.",
          zh: '謝啦，Jamie。我花了一段時間才到這個心態。但現在我真心覺得通勤是我一天中最被低估的部分。',
          vocab: [{ word: 'underrated', def: '被低估的' }],
        },
      ],
    },
  ],
  keyPhrases: [
    { en: 'a big chunk of', zh: '很大一部分', example: "Commuting takes a big chunk of my day." },
    { en: 'switch gears', zh: '切換模式', example: "I need a few minutes to switch gears after work." },
    { en: 'a bit of a gamble', zh: '有點碰運氣', example: "Taking the bus at rush hour is a bit of a gamble." },
    { en: 'give a heads up', zh: '事先通知', example: "I always give my manager a heads up if I'm running late." },
    { en: 'catch up on', zh: '趕上進度、補做', example: "I use my commute to catch up on podcasts." },
    { en: 'might as well', zh: '不如', example: "If you're waiting anyway, you might as well read something." },
    { en: 'pass the time', zh: '打發時間', example: "Listening to music helps pass the time on the train." },
    { en: 'fall apart', zh: '崩潰', example: "My whole schedule fell apart when the train was cancelled." },
    { en: 'from door to door', zh: '從出門到目的地', example: "My commute is about an hour from door to door." },
    { en: 'decompress', zh: '減壓', example: "I need thirty minutes to decompress after a long day." },
  ],
}

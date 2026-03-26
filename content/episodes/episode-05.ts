import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_05: Episode = {
  weekNumber: 5,
  theme: 'Weather & Seasons',
  title: 'The Weather Today: Talking About Climate',
  phase: 'p1',
  parts: [
    {
      title: 'Part 1 — Checking the Forecast',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Mira, did you check the weather forecast this morning? I totally forgot and now I'm standing here with no umbrella.",
          zh: 'Mira，你今天早上有看天氣預報嗎？我完全忘了，現在站在這裡，手上沒有傘。',
          vocab: [{ word: 'forecast', def: '天氣預報' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Ha, I did actually. It said there's a seventy percent chance of afternoon showers. I figured I'd rather be safe, so I grabbed my umbrella on the way out.",
          zh: '哈，我有。說下午有七成機率下陣雨。我想說寧可有備無患，出門就帶了傘。',
          vocab: [{ word: 'showers', def: '（短暫的）陣雨' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's so smart. I always mean to check but then I just forget. It's like the moment I wake up, I already know I'm going to be late.",
          zh: '好聰明。我每次都想查，然後就忘了。感覺一睜眼就知道自己要遲到了。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I know that feeling. I've started keeping a weather app on my lock screen just so I don't even have to open my phone fully. Takes like three seconds.",
          zh: '我懂那種感覺。我現在把天氣 App 放在鎖定畫面，這樣連開手機都不用。三秒鐘就看完了。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Oh that's clever. So what's the weather like here most of the year? I know it rains a lot, but what else?",
          zh: '哦，好主意。那這裡一年四季大多是什麼天氣？我知道常常下雨，但還有什麼？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Well, summers are extremely hot and humid — like, you step outside and you're sweating immediately. Winters are mild, but it can get quite damp and grey for weeks on end.",
          zh: '嗯，夏天超熱又超濕——一走出去就開始流汗。冬天比較溫和，但有時候會連著好幾個禮拜都陰濕灰暗。',
          vocab: [{ word: 'humid', def: '潮濕的' }, { word: 'damp', def: '濕冷的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That does sound tough. Do you think the weather here has been getting more extreme over the years?",
          zh: '聽起來是挺難熬的。你覺得這裡的天氣這幾年有變得更極端嗎？',
          vocab: [{ word: 'extreme', def: '極端的' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Honestly, I think so. The summers feel longer and hotter than when I was growing up. And the typhoons seem to be stronger too. It's a little unsettling.",
          zh: '說真的，我覺得有。夏天感覺比我小時候更長更熱。颱風好像也越來越強。有點讓人不安。',
          vocab: [{ word: 'unsettling', def: '令人不安的' }],
        },
      ],
    },
    {
      title: 'Part 2 — Favorite Seasons',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Speaking of seasons — do you have a favorite? I feel like most people here say autumn.",
          zh: '說到季節——你有最喜歡的嗎？我感覺很多人都說秋天。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "You're not wrong — autumn is great. The temperature is just right, not too hot and not too cold. And the sky is actually blue sometimes, which feels like a luxury after summer.",
          zh: '你說的沒錯——秋天很棒。氣溫剛剛好，不太熱也不太冷。而且天空偶爾真的是藍色的，夏天過後感覺像是一種奢侈。',
          vocab: [{ word: 'a luxury', def: '一種奢侈、難得的享受' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Ha! That's a good point. What about you personally?",
          zh: '哈！說得好。那你個人呢？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Mine would probably be spring, actually. I love when things start blooming again after the grey winter. Plus the weather is still cool enough to walk around without feeling completely exhausted.",
          zh: '我可能是春天。我喜歡灰暗的冬天結束後，萬物重新開始開花的感覺。而且天氣還夠涼，出門走走不會累死。',
          vocab: [{ word: 'blooming', def: '開花、萬物復甦' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That makes sense. I've always been more of a winter person myself. There's something about cold weather that I find really cozy — you have an excuse to stay in and be warm.",
          zh: '有道理。我自己比較喜歡冬天。冷天有種讓我覺得很舒適的感覺——你有理由待在室內、保持溫暖。',
          vocab: [{ word: 'cozy', def: '溫馨舒適的' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "That's the introvert's dream right there — legitimate reasons to cancel plans because it's cold outside.",
          zh: '那就是內向者的夢想——因為外面冷，有正當理由取消行程。',
          vocab: [{ word: 'legitimate', def: '正當的、合理的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Exactly! I call it 'weather-related social withdrawal' and I stand by it.",
          zh: '沒錯！我稱它為「天氣相關的社交退縮」，我支持這個說法。',
        },
      ],
    },
    {
      title: 'Part 3 — Weather and Mood',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Do you ever feel like the weather seriously affects your mood? Because I swear, rainy days just drain all my energy.",
          zh: '你有沒有覺得天氣真的會影響你的心情？因為我發誓，下雨天就是會把我的精力全部抽乾。',
          vocab: [{ word: 'drain', def: '耗盡、抽乾（精力）' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, absolutely. There's actually a name for it — 'seasonal mood changes'. A lot of people feel more tired and low during overcast days. You're not imagining it.",
          zh: '噢，絕對有。這其實有個名稱——「季節性情緒變化」。很多人在陰天會感到更疲倦、情緒低落。你不是在想像。',
          vocab: [{ word: 'overcast', def: '陰天的、多雲的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Good to know I'm not alone. What do you do when the weather is bringing you down?",
          zh: '很高興知道不只我這樣。天氣讓你心情低落的時候，你怎麼辦？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I try to find things that feel warm and comforting. A big bowl of hot soup, good lighting indoors, maybe some upbeat music. Little things that signal to your brain that everything's okay.",
          zh: '我會找一些讓自己感覺溫暖舒心的事。一大碗熱湯、室內的好燈光，或許再來一點輕快的音樂。一些小事，讓大腦知道一切都沒問題。',
          vocab: [{ word: 'comforting', def: '撫慰人心的、令人感到安慰的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's a really healthy approach. I usually just scroll on my phone for two hours and feel worse. Maybe I should try your method.",
          zh: '這個方法真的很健康。我通常就是在手機上滑兩個小時，然後感覺更糟。或許我應該試試你的方法。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Ha, we all do that sometimes. But yeah, I find that if I'm intentional about creating a cozy environment, the rainy day actually becomes kind of nice — like the perfect excuse to slow down.",
          zh: '哈，我們偶爾都會這樣。但我發現，如果我有意識地打造一個舒適的環境，下雨天其實會變得挺好的——就像是放慢腳步的完美理由。',
          vocab: [{ word: 'intentional', def: '有意識的、刻意的' }],
        },
      ],
    },
    {
      title: 'Part 4 — Dealing with Extreme Weather',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Let's talk about typhoons for a second. How do you usually prepare when a big one is coming?",
          zh: '我們聊一下颱風吧。有大颱風要來的時候，你通常怎麼準備？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "The first thing I do is stock up on food and water — enough for at least three days. Then I make sure anything on my balcony is secured or brought inside, because the wind can send things flying.",
          zh: '我第一件事是備好食物和水——至少三天份。然後確保陽台上的東西都固定好或搬進室內，因為強風會把東西吹飛。',
          vocab: [{ word: 'stock up on', def: '囤積、備足' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's smart. I've heard some people get really excited about typhoon days — like, it's a day off work, so they treat it like a holiday.",
          zh: '很聰明。我聽說有些人對颱風天很興奮——因為不用上班，就把它當假日過。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I totally get that. There's something a bit thrilling about the whole thing — the wind howling, watching the rain lash against the windows. As long as you're safe inside, it can feel kind of exciting.",
          zh: '我完全懂。整件事有點刺激的感覺——風在嚎叫、看著雨打在窗上。只要你安全待在室內，感覺還挺刺激的。',
          vocab: [{ word: 'lash against', def: '猛打、拍打' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "But it can also be really dangerous, right? Especially for people who live in areas prone to flooding.",
          zh: '但也可以非常危險，對吧？尤其是住在容易淹水地區的人。',
          vocab: [{ word: 'prone to', def: '容易發生…的、傾向於' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Definitely. I think it's important to take the warnings seriously and not be complacent just because you've been through them before. Every typhoon is different.",
          zh: '當然。我覺得認真對待警告很重要，不要因為以前經歷過就掉以輕心。每個颱風都不一樣。',
          vocab: [{ word: 'complacent', def: '自滿的、掉以輕心的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Well said. Better safe than sorry.",
          zh: '說得好。寧可謹慎，不要後悔。',
        },
      ],
    },
    {
      title: 'Part 5 — Dressing for the Weather',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Okay, last weather topic. Does the weather actually change what you wear, or do you just dress however you feel?",
          zh: '好，最後一個天氣話題。天氣真的會影響你穿什麼嗎，還是你隨心所欲就好？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, the weather completely dictates my outfits. During summer, it's all about light fabrics and darker colors near the armpits, if you know what I mean.",
          zh: '噢，天氣完全決定了我的穿著。夏天的話，全部都是輕薄的布料，腋下附近選深色，你懂我的意思的。',
          vocab: [{ word: 'dictates', def: '決定、支配' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Ha, the summer office worker struggle is real. What about winter? You mentioned it's not that cold here.",
          zh: '哈，夏天上班族的辛苦是真的。那冬天呢？你說這裡不太冷。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Right, it's not freezing cold like northern countries, but the damp cold here gets into your bones somehow. I layer up — like a base layer, a light sweater, and maybe a jacket.",
          zh: '對，不像北方國家那麼凍，但這裡的濕冷不知為何會滲進骨子裡。我會分層穿——內層、薄毛衣，可能再加一件外套。',
          vocab: [{ word: 'layer up', def: '分層穿衣' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Layering is the key. I always see people carrying cardigans around in summer too, because of the air conditioning.",
          zh: '分層穿是關鍵。我也常看到夏天有人帶著外套，就是因為冷氣。',
          vocab: [{ word: 'cardigans', def: '開襟毛衣、針織外套' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, the office air con in summer is no joke. I basically have two outfits — one for the scorching heat outside, and one for the arctic tundra that is my workplace.",
          zh: '噢，夏天辦公室的冷氣是認真的。我基本上有兩套穿搭——一套應付外面的炎熱，一套對抗我辦公室這個北極凍原。',
          vocab: [{ word: 'scorching', def: '酷熱的、炙熱的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "The arctic tundra — that's exactly what it feels like. Maybe we should start a petition for reasonable indoor temperatures.",
          zh: '北極凍原——這正是那種感覺。也許我們該發起一個請願，要求合理的室內溫度。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "I would sign that so fast. But in the meantime, I'll just keep carrying a cardigan everywhere I go.",
          zh: '我會立刻簽名。但在那之前，我只好繼續到哪都帶著外套了。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "The eternal struggle of the office worker. Alright, I think I need to go find a vending machine umbrella before those afternoon showers hit.",
          zh: '上班族的永恆掙扎。好了，我想我得去找一把自動販賣機的傘，在下午的陣雨來臨之前。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Ha! Good luck. Next time, check the weather app first thing in the morning.",
          zh: '哈！祝你好運。下次，一起床就先看天氣 App。',
        },
      ],
    },
  ],
  keyPhrases: [
    { en: 'rather be safe', zh: '寧可有備無患', example: "I'd rather be safe and bring an umbrella just in case." },
    { en: 'on end', zh: '連續地、一直', example: "It rained for two weeks on end during the rainy season." },
    { en: 'a luxury', zh: '一種難得的享受', example: "Having a clear blue sky in summer feels like a luxury here." },
    { en: 'bringing you down', zh: '讓心情低落', example: "Don't let the bad weather bring you down." },
    { en: 'stock up on', zh: '囤積、備足', example: "We always stock up on food before a typhoon." },
    { en: 'prone to', zh: '容易發生…的', example: "This area is prone to flooding during heavy rain." },
    { en: 'complacent', zh: '掉以輕心的', example: "Don't get complacent — always check the typhoon warnings." },
    { en: 'layer up', zh: '分層穿衣', example: "It's cold in the morning, so make sure you layer up." },
    { en: 'scorching', zh: '酷熱的', example: "The scorching summer heat makes outdoor activities exhausting." },
    { en: 'in the meantime', zh: '在此期間、同時', example: "The solution is coming, but in the meantime, let's stay prepared." },
  ],
}

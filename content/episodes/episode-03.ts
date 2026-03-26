import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_03: Episode = {
  weekNumber: 3,
  theme: 'Home & Living Space',
  title: 'Where I Live: Describing Your Home',
  phase: 'p1',
  parts: [
    {
      title: 'Part 1 — My Place',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Hey Mira, I was just thinking — we always talk about work and commuting, but I don't actually know much about where you live. What's your place like?",
          zh: '嘿 Mira，我剛在想——我們總是聊工作和通勤，但我其實不太了解你住的地方。你家是什麼樣子？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, I live in a two-bedroom apartment on the fourth floor of an older building. It's nothing fancy, but it's cozy and it feels like home.",
          zh: '噢，我住在一棟比較舊的大樓四樓，是個兩房的公寓。不算華麗，但很溫馨，有家的感覺。',
          vocab: [{ word: 'cozy', def: '溫馨的、舒適的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Two bedrooms — nice! Do you use the second one as a guest room?",
          zh: '兩間房——不錯！第二間你當客房用嗎？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Well, it's kind of a multipurpose room. I set it up as a small home office, but there's also a sofa bed in case someone stays over. It's a tight squeeze, but it works.",
          zh: '嗯，算是多功能房間。我把它布置成小的居家辦公室，但也放了張沙發床，有人借住的時候可以用。空間有點緊，但夠用。',
          vocab: [
            { word: 'multipurpose', def: '多功能的' },
            { word: 'a tight squeeze', def: '空間很擠' },
          ],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "I love that. Making the most of every square meter. What about your living room?",
          zh: '我喜歡那樣。把每一平方公尺都善加利用。那你的客廳呢？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "The living room is actually my favorite spot. It has a big window that faces east, so I get really nice morning light. I've put a few plants by the window and a bookshelf against the wall.",
          zh: '客廳其實是我最喜歡的地方。有一扇朝東的大窗戶，所以早晨的光線很好。我在窗邊放了幾盆植物，牆邊放了一個書架。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That sounds really peaceful. Natural light makes such a huge difference, doesn't it?",
          zh: '聽起來真的很寧靜。自然光真的差很多，對吧？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Absolutely. I actually picked this apartment mainly because of the natural light. The layout isn't perfect, but the light made me fall in love with it right away.",
          zh: '完全同意。其實我選這間公寓主要就是因為自然光。格局不算完美，但光線讓我一看就愛上了。',
          vocab: [{ word: 'layout', def: '格局、配置' }],
        },
      ],
    },
    {
      title: 'Part 2 — Decorating and Making It Yours',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "So when you first moved in, did you do a lot of decorating? Or did you kind of take it slow?",
          zh: '那你剛搬進去的時候，有大量布置嗎？還是慢慢來的？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Definitely took it slow. I didn't want to rush out and buy a bunch of stuff I'd end up not liking. I started with the basics — a bed, a desk, some kitchen essentials — and then added things gradually.",
          zh: '絕對是慢慢來的。我不想匆忙去買一堆最後不喜歡的東西。我先從基本的開始——一張床、一張書桌、一些廚房必需品——然後慢慢添加。',
          vocab: [{ word: 'gradually', def: '逐漸地' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's actually a really smart approach. I feel like a lot of people, myself included, just buy everything at once and then realize half of it doesn't match.",
          zh: '這方法其實很聰明。我覺得很多人，包括我自己，都是一次全部買齊，然後發現一半都不搭。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Exactly! And you know what, I've found that the best pieces in my apartment are things I stumbled upon randomly — like a vintage lamp I found at a weekend market, or some wall art a friend made for me.",
          zh: '就是啊！而且你知道嗎，我發現家裡最好的東西都是偶然發現的——像是我在週末市集找到的一盞復古檯燈，或是朋友幫我做的壁飾。',
          vocab: [{ word: 'stumbled upon', def: '偶然發現' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That gives it character. I think the best homes are the ones that tell a story, you know?",
          zh: '那讓家更有特色。我覺得最棒的家是那種會說故事的，你懂嗎？',
          vocab: [{ word: 'character', def: '特色、個性' }],
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Totally agree. I'd rather have a few meaningful things than a perfectly styled apartment that looks like a magazine photo.",
          zh: '完全同意。我寧願有幾件有意義的東西，也不要一間像雜誌照片一樣完美的公寓。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Same here. So, any decorating disasters along the way? I've had a few myself.",
          zh: '我也是。那布置的過程中有什麼災難嗎？我自己就有過幾次。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, for sure. I once painted an accent wall bright yellow. I thought it would be cheerful, but it ended up looking like a school cafeteria. I repainted it within a week.",
          zh: '噢，當然有。我曾經把一面主題牆漆成亮黃色。我以為會很有朝氣，結果看起來像學校餐廳。一個禮拜內我就重新漆了。',
          vocab: [{ word: 'accent wall', def: '主題牆、特色牆' }],
        },
      ],
    },
    {
      title: 'Part 3 — The Neighborhood',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "What about your neighborhood? Is it a nice area to live in?",
          zh: '那你的社區呢？是個好住的地方嗎？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Yeah, I really like it. It's a residential area, so it's pretty quiet, especially at night. There's a small park just down the street where I go for walks sometimes.",
          zh: '嗯，我真的很喜歡。那是住宅區，所以蠻安靜的，特別是晚上。街尾有個小公園，我有時候會去散步。',
          vocab: [{ word: 'residential area', def: '住宅區' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Is it convenient for daily stuff? Like grocery shopping, laundry, that kind of thing?",
          zh: '日常生活方便嗎？像是買菜、洗衣服之類的？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Pretty convenient, actually. There's a convenience store right around the corner, and a traditional market about a ten-minute walk away. I go there on weekends to get fresh produce.",
          zh: '其實蠻方便的。轉角就有一家便利商店，走大約十分鐘有個傳統市場。我週末會去那裡買新鮮蔬果。',
          vocab: [{ word: 'fresh produce', def: '新鮮農產品（蔬果）' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Oh nice, a traditional market. I love those — so much more lively than a supermarket.",
          zh: '噢不錯，傳統市場。我超喜歡的——比超市熱鬧多了。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Right? And the vendors actually recognize me now. There's this one lady who sells tofu, and she always gives me a little extra. It makes the whole experience feel more personal.",
          zh: '對吧？而且攤販們現在都認得我了。有一個賣豆腐的阿姨，她總是會多給我一點。讓整個購物體驗感覺更有人情味。',
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's what community is all about, isn't it? Those little connections with people around you.",
          zh: '這就是社區的意義，不是嗎？那些和周遭的人之間的小小連結。',
        },
      ],
    },
    {
      title: 'Part 4 — What Makes a Home',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "So here's a deeper question — when did your apartment stop feeling like just a place you sleep, and start feeling like a real home?",
          zh: '問一個比較深的問題——你的公寓是什麼時候從只是睡覺的地方，變成真正有家的感覺的？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Hmm, that's a great question. I think it was when I started cooking regularly. There's something about the smell of food in your own kitchen that just makes a place feel lived in.",
          zh: '嗯，好問題。我覺得是我開始固定做飯以後。在自己的廚房聞到食物的香味，就是會讓一個地方有被人住過的感覺。',
          vocab: [{ word: 'lived in', def: '有人居住過的、有生活感的' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's actually really beautiful. I never thought of it that way.",
          zh: '這說法真的很美。我從沒這樣想過。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "And honestly, having people over helped too. The first time I hosted a small dinner for friends, my apartment suddenly felt like mine. Like, this is my space, and I'm sharing it with people I care about.",
          zh: '而且說實話，邀請朋友來也有幫助。我第一次在家請朋友吃小型晚餐的時候，公寓突然就有了「這是我家」的感覺。就是，這是我的空間，我在和在乎的人分享它。',
          vocab: [{ word: 'hosted', def: '主辦、招待' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "I love that. It's not just about furniture and decoration — it's about the memories you create in a space.",
          zh: '我很喜歡這個想法。不只是家具和裝飾——而是你在一個空間裡創造的回憶。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Exactly. You could have the most expensive furniture in the world, but if a place doesn't have warmth, it's just a room.",
          zh: '沒錯。你可以擁有全世界最貴的家具，但如果一個地方沒有溫度，它就只是一個房間。',
          vocab: [{ word: 'warmth', def: '溫暖、溫馨感' }],
        },
      ],
    },
    {
      title: 'Part 5 — Dream Home and Advice',
      lines: [
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "If you could design your dream home, what would it look like?",
          zh: '如果你可以設計夢想中的家，它會是什麼樣子？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Oh, I've actually thought about this a lot. I'd love a place with a balcony — big enough to sit outside with a cup of coffee in the morning. And a proper kitchen with lots of counter space.",
          zh: '噢，這個我其實想過很多。我好想要有陽台的家——大到可以早上坐在外面喝杯咖啡。還有一個像樣的廚房，有很多料理台空間。',
          vocab: [{ word: 'counter space', def: '料理台空間' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "Morning coffee on a balcony — that sounds like the dream. Would you stay in the same neighborhood?",
          zh: '早晨在陽台上喝咖啡——聽起來就是夢想。你會留在同一個社區嗎？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Honestly, probably yes. I've really put down roots here. I know the shop owners, the neighbors wave at me — you know, it takes time to build that kind of familiarity.",
          zh: '老實說，大概會。我真的在這裡扎根了。我認識店家老闆，鄰居會跟我揮手——你知道的，要建立那種熟悉感是需要時間的。',
          vocab: [{ word: 'put down roots', def: '扎根、定居' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "That's so true. So for someone who's maybe moving into their first apartment, what's one piece of advice you'd give?",
          zh: '真的是這樣。那對於可能正要搬進第一間公寓的人，你會給什麼建議？',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Don't stress about making it perfect right away. Your home is going to evolve with you. Just focus on making it comfortable and filling it with things that make you happy. The rest will come naturally.",
          zh: '不要急著把它弄到完美。你的家會隨著你一起成長。只要專注在讓它舒適，放入讓你開心的東西就好。其他的自然會到位。',
          vocab: [{ word: 'evolve', def: '演變、成長' }],
        },
        {
          speaker: 'b', speakerName: 'Jamie',
          en: "I really like that — your home evolves with you. Thanks for sharing, Mira. I feel like I know you a little better now.",
          zh: '我很喜歡那句——你的家會隨著你一起成長。謝謝分享，Mira。我覺得現在更了解你了。',
        },
        {
          speaker: 'a', speakerName: 'Mira',
          en: "Anytime, Jamie. And you should come over sometime — I'll make you coffee by the big window.",
          zh: '隨時歡迎，Jamie。你改天應該來坐坐——我在大窗戶旁邊泡咖啡給你喝。',
        },
      ],
    },
  ],
  keyPhrases: [
    { en: 'a tight squeeze', zh: '空間很擠', example: "The kitchen is a tight squeeze, but we manage." },
    { en: 'stumbled upon', zh: '偶然發現', example: "I stumbled upon a great little cafe near my apartment." },
    { en: 'put down roots', zh: '扎根、定居', example: "After three years, I've really put down roots in this city." },
    { en: 'lived in', zh: '有生活感的', example: "I like homes that look lived in, not like a showroom." },
    { en: 'accent wall', zh: '主題牆', example: "We painted an accent wall in the bedroom to add some color." },
    { en: 'fresh produce', zh: '新鮮農產品', example: "I buy fresh produce at the traditional market every weekend." },
    { en: 'makes such a huge difference', zh: '差很多', example: "Good lighting makes such a huge difference in a small room." },
    { en: 'nothing fancy', zh: '不算華麗', example: "It's nothing fancy, but it's comfortable and I like it." },
    { en: 'evolve with you', zh: '隨你成長', example: "Your style will evolve with you over time." },
    { en: 'have people over', zh: '邀請朋友來家裡', example: "I love having people over for dinner on Fridays." },
  ],
}

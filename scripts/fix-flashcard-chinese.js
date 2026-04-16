/**
 * Fix short Chinese definitions in flashcards (< 5 chars → full explanatory descriptions)
 */
const fs = require('fs'), path = require('path');
const ROOT = process.cwd();

// Maps: id → better Chinese definition
const FIXES = {
  // flashcards-w09-w16.ts
  'w9-listen-05':  '喉嚨痛；喉嚨發炎或刺痛的不適感，常是生病的早期訊號',
  'w9-speak-02':   '不吃早餐；刻意或因太趕而跳過早晨第一餐的習慣',
  'w9-speak-05':   '食物份量；一次進食的分量大小，影響飲食是否均衡',
  'w10-listen-01': '每日行程；一天當中要完成的事情和時間安排的整體計畫',
  'w11-listen-02': '主動聯絡；主動開口或傳訊息去聯繫某人，而不是等對方先來',
  'w11-listen-03': '遠距友誼；兩個人不在同一個城市，卻仍然保持深厚情感的友誼',
  'w11-speak-02':  '保持聯絡；持續讓雙方不失去連結，就算不常見面也維持往來',
  'w11-speak-05':  '修補關係；在誤會或衝突之後，重新把感情或關係修回來',
  'w12-listen-01': '長大；從孩童到成人的成長過程，以及成長環境如何塑造一個人',
  'w12-listen-02': '嚴格管教；在充滿規矩和高標準要求的環境下長大的教養方式',
  'w12-listen-03': '手足競爭；兄弟姐妹之間為爭奪父母關注或資源而產生的競爭與緊張',
  'w12-listen-04': '家族團聚；久未見面的親戚聚集在一起，重新建立連結的場合',
  'w12-speak-03':  '高期望；對某人表現或成就抱有比一般更高的要求和期待',
  'w13-listen-05': '遠端團隊；成員不在同一個地點，透過網路協作的工作群組',
  'w13-listen-06': '會議議程；事先列出的會議討論順序和主要項目，讓會議更有效率',
  'w13-speak-01':  '職涯道路；一個人在職業發展上所走的方向和選擇的順序',
  'w13-speak-02':  '職場關係；在工作環境中與同事、主管或下屬之間的互動模式',
  'w14-listen-01': '社交能量；一個人在社交場合投入互動後，感到舒適或疲憊的程度',
  'w14-speak-01':  '設定界限；明確說明自己能接受什麼、不能接受什麼的個人界線',
  'w14-speak-02':  '社交電量；比喻參與社交活動後剩餘精力的多寡，耗盡需要獨處充電',
  'w15-listen-01': '性格類型；根據心理傾向和行為模式對人進行的分類方式',
  'w15-listen-02': '第一印象；第一次見到某人時，立刻形成的整體感覺和評價',
  'w15-listen-03': '社交電池；比喻與他人互動後會消耗、需要獨處來充電的心理能量',
  'w15-listen-04': '被…吸引；自然地朝向某個人或事物靠近，不需要刻意選擇',
  'w15-listen-05': '拖延；明知道該做，卻一再把事情往後推遲的習慣',
  'w15-listen-06': '同溫層；讓人只接觸到和自己觀點相似訊息的封閉環境',
  'w15-speak-03':  '眼神接觸；說話時與對方目光相互交會，表達專注和真誠',
  'w16-listen-01': '溝通風格；一個人慣用的說話方式、語氣和傳遞訊息的習慣',
  'w16-listen-03': '主動傾聽；專注地聽，並讓對方感覺自己真的被聽進去了',
  'w16-speak-01':  '整理思緒；在回答前先停下來，把散亂的想法整理清楚再開口',
  'w16-speak-03':  '直接回答；不拐彎抹角，明確回應問題核心的說話方式',

  // flashcards-w17-w24.ts
  'w19-listen-01': '職稱；在公司中代表一個人職位和角色的正式名稱',
  'w20-listen-01': '會議議程；事先確認的討論主題和流程，幫助會議更有效率進行',
  'w20-listen-06': '線上會議；透過視訊或音訊工具在網路上舉行，不需到場的會議',
  'w20-speak-03':  '核心重點；一段話或討論中最重要、最值得記住的那個部分',
  'w23-listen-01': '職涯抱負；對未來工作成就和職位高度的期待與內在渴望',
  'w23-listen-02': '定義成功；釐清對自己來說什麼才算是真正值得追求的成功',
  'w23-listen-05': '穩定性；長期保持不大起伏、可以預測和依靠的狀態',
  'w23-speak-02':  '職涯方向；一個人在工作領域中想往哪裡走的整體路線和選擇',
  'w23-speak-03':  '價值觀；一個人判斷什麼重要、什麼不重要的核心信念和標準',
  'w23-speak-05':  '表達意圖；透過行動或語言讓對方清楚看見你打算做什麼',

  // flashcards-w25-w32.ts
  'w25-listen-03': '羞恥螺旋；一個羞恥感不斷引發更多自責、越陷越深的惡性循環',
  'w25-listen-06': '變通方案；在無法直接解決問題時，繞過障礙達成目的的替代方式',
  'w25-speak-01':  '意志力；靠內在力量克服誘惑或堅持做困難事情的自我控制能力',
  'w25-speak-03':  '有意識地；帶著清楚的覺察和刻意的注意去做某件事',
  'w29-listen-01': '背景層；潛藏在表面之下、影響整體的底層因素或訊息',
  'w29-listen-05': '被競爭的；一個概念、資源或空間有多方在爭奪或持不同看法',
  'w29-speak-02':  '填補靜默；在對話的沉默時刻開口說話，避免尷尬或推動對話繼續',
  'w29-speak-04':  '承載歷史；一個字詞、地方或關係帶著過去的記憶和意義繼續存在',

  // flashcards-w33-w41.ts
  'w35-listen-01': '泛指手機、平板或電腦等日常用來接收訊息和聯絡的電子設備',
  'w35-listen-02': '幻震；明明沒有通知，卻感覺手機在震動的錯覺，因過度依賴手機而產生',
  'w35-listen-03': '孤立的；和其他事物分開、不相連，常形容感覺脫節或疏離的狀態',
  'w35-listen-04': '優化的；已被調整到最有效率或最適合某個目的的狀態',
  'w35-listen-05': '輸入；從外部進入大腦或系統的訊息、刺激和資訊量',
  'w35-listen-06': '承諾；對某件事或某個人做出的認真投入，不輕易放棄的態度',
  'w35-speak-01':  '低估；對某人的能力或某件事的難度，估計得比實際情況更低',
  'w35-speak-02':  '便利；讓事情更容易完成、省時省力的特性或條件',
  'w35-speak-03':  '通知；手機或電腦發出的提醒，告訴你有新訊息或需要注意的事',
  'w35-speak-05':  '自動化；讓某個流程不需要人工介入、自動重複執行',

  // flashcards-w42-w53.ts
  'w42-listen-05': '歸屬感；感覺自己真的是某個群體的一份子、被接受和認同的感受',
  'w42-speak-04':  '學習曲線；從初學者到熟練所需走過的過程，有時很陡峭需要付出很多',
  'w42-speak-05':  '技能缺口；目前具備的技能和實際工作或目標所需之間存在的差距',
  'w49-listen-02': '空閒時間；不需要工作或做正事，可以放鬆或什麼都不做的時段',
  'w49-listen-04': '創意瓶頸；一段想不出新點子、創作能量感覺被卡住的困難時期',
  'w49-listen-06': '環境節奏；周圍環境自然呈現的速度和步調，會在不知不覺中影響自己',
};

const fcDir = path.join(ROOT, 'content', 'flashcards');
const files = fs.readdirSync(fcDir).filter(f => f.endsWith('.ts')).sort();
let totalFixed = 0;

for (const file of files) {
  const fp = path.join(fcDir, file);
  let src = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Find all id+chinese pairs
  for (const [id, newZh] of Object.entries(FIXES)) {
    // Match: id: 'w9-listen-05', ... chinese: '喉嚨痛',
    // We need to replace the chinese field for this specific id
    // Use a regex that finds the object with this id
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Look for the line with this id and extract the current chinese value
    const idLineRe = new RegExp(`(id: '${escaped}'[^}]*?chinese: ')(.*?)(')`, 's');
    const match = src.match(idLineRe);
    if (match) {
      const oldZh = match[2];
      if (oldZh.length < 5) {
        src = src.replace(idLineRe, `$1${newZh}$3`);
        changed = true;
        totalFixed++;
        console.log(`  Fixed ${id}: "${oldZh}" → "${newZh}"`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fp, src);
    console.log(`Saved ${file}`);
  }
}

console.log(`\nTotal fixed: ${totalFixed}`);

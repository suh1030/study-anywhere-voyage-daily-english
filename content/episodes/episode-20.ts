import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_20: Episode = {
  weekNumber: 20,
  theme: 'Problem Solving',
  title: 'Figuring It Out: How We Tackle Problems',
  phase: 'p3',
  parts: [
    {
      title: 'What Makes a Good Problem Solver?',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'I\'ve always been curious about what separates great problem solvers from the rest.', zh: '我一直很好奇是什麼區別了偉大的問題解決者和其他人。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'I think it starts with curiosity. Great problem solvers ask more questions before they try to fix anything.', zh: '我認為這從好奇心開始。優秀的問題解決者在試圖解決任何事情之前會問更多問題。', vocab: [{ word: 'curiosity', def: 'a strong desire to understand or learn about something' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'That\'s so important. Jumping to solutions before understanding the real problem is a common mistake.', zh: '這非常重要。在理解真正問題之前跳到解決方案是一個常見的錯誤。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'There\'s even a term for it — "solution in search of a problem."', zh: '甚至有一個術語——「尋找問題的解決方案」。', vocab: [{ word: 'solution in search of a problem', def: 'applying a fix before truly understanding what\'s wrong' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'Patience is another big one. The best solution often isn\'t the first one you think of.', zh: '耐心是另一個重要因素，最好的解決方案通常不是你想到的第一個。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'I try to generate at least three options before deciding. It forces more creative thinking.', zh: '在決定之前，我試著生成至少三個選項，這迫使更有創意的思考。', vocab: [{ word: 'generate options', def: 'to create or think of multiple possible solutions' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'And a tolerance for uncertainty. Not every problem has a clean answer right away.', zh: '還有對不確定性的容忍，不是每個問題都有馬上的清晰答案。', vocab: [{ word: 'tolerance for uncertainty', def: 'being comfortable when things are not yet clear or certain' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'That\'s the hardest part for a lot of people. We want resolution immediately.', zh: '對很多人來說，這是最難的部分，我們想要立即解決。' },
      ]
    },
    {
      title: 'Defining the Problem Clearly',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'Before solving anything, you need to define what the problem actually is.', zh: '在解決任何事情之前，你需要定義問題實際上是什麼。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Albert Einstein supposedly said, "If I had one hour to save the world, I\'d spend fifty-five minutes defining the problem."', zh: '阿爾伯特·愛因斯坦據說說過，「如果我有一個小時拯救世界，我會花五十五分鐘定義問題。」' },
        { speaker: 'a', speakerName: 'Mira', en: 'That really captures it. Problem definition is where the real thinking happens.', zh: '這真的很準確。問題定義是真正思考發生的地方。', vocab: [{ word: 'problem definition', def: 'clearly stating what the problem is before attempting to solve it' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'One tool I use is the "five whys" technique. Keep asking why until you find the root cause.', zh: '我使用的一個工具是「五個為什麼」技術，繼續問為什麼，直到找到根本原因。', vocab: [{ word: 'five whys', def: 'asking "why?" five times to uncover the root cause of a problem' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'I love that. The first "why" almost never gets you to the real issue.', zh: '我喜歡那個，第一個「為什麼」幾乎從來不能讓你找到真正的問題。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Exactly. Sales are down — why? Because customers are leaving — why? Because support is slow — why?', zh: '正是。銷售下降——為什麼？因為客戶在離開——為什麼？因為支持很慢——為什麼？' },
        { speaker: 'a', speakerName: 'Mira', en: 'And suddenly you find the real problem was an understaffed team, not a product issue.', zh: '突然間你發現真正的問題是人手不足，而不是產品問題。', vocab: [{ word: 'understaffed', def: 'not having enough employees to handle the work' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Right. Without that digging, you\'d waste resources fixing the wrong thing.', zh: '是的，沒有那種深挖，你會把資源浪費在修復錯誤的事情上。' },
      ]
    },
    {
      title: 'Collaborative Problem Solving',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'Some problems are best solved alone. Others need a team.', zh: '有些問題最好獨自解決，其他問題需要一個團隊。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'How do you know which approach to use?', zh: '你怎麼知道使用哪種方法？', vocab: [{ word: 'approach', def: 'a way of dealing with or handling a situation' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'If the problem has multiple dimensions or affects different teams, collaboration helps.', zh: '如果問題有多個維度或影響不同的團隊，協作有幫助。', vocab: [{ word: 'collaboration', def: 'working together with others to achieve a shared goal' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Diverse perspectives often see things that one person alone would miss.', zh: '多樣化的觀點往往能看到一個人單獨會錯過的事情。', vocab: [{ word: 'diverse perspectives', def: 'different viewpoints or ways of seeing a problem' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'But group problem solving has risks too — groupthink, for example.', zh: '但群體問題解決也有風險——例如，群體思維。', vocab: [{ word: 'groupthink', def: 'when a group goes along with one idea without questioning it' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Where everyone agrees because they don\'t want to be the one who objects.', zh: '每個人都同意，因為他們不想成為反對的那個人。' },
        { speaker: 'a', speakerName: 'Mira', en: 'Assigning someone to play "devil\'s advocate" helps combat that.', zh: '指派某人扮演「魔鬼代言人」有助於對抗這一點。', vocab: [{ word: 'devil\'s advocate', def: 'someone who argues the opposing side to test ideas' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'It feels awkward, but a structured challenge always improves the final solution.', zh: '感覺很尷尬，但結構化的挑戰總是能改善最終解決方案。' },
      ]
    },
    {
      title: 'Learning From Failure',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'Not every solution works. What do you do when your first approach fails?', zh: '並非每個解決方案都有效，當你的第一個方法失敗時你怎麼做？' },
        { speaker: 'b', speakerName: 'Jamie', en: 'I try to treat it as data, not as failure. What did the attempt teach me?', zh: '我試著將其視為數據，而不是失敗，這次嘗試教了我什麼？', vocab: [{ word: 'treat it as data', def: 'using a failed attempt as information to improve your next try' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'That mindset is harder than it sounds. Especially if there was pressure riding on the outcome.', zh: '那種心態比聽起來更難，尤其是如果結果上有壓力。', vocab: [{ word: 'pressure riding on', def: 'a lot of importance or expectation attached to a result' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'For sure. But the teams that do post-mortems honestly improve the fastest.', zh: '肯定的，但那些誠實進行事後檢討的團隊進步最快。', vocab: [{ word: 'post-mortem', def: 'an analysis after a failure to understand what went wrong' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'A post-mortem is only useful if people feel safe enough to be honest.', zh: '事後檢討只有在人們感到足夠安全可以誠實時才有用。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Psychological safety again. It keeps coming up because it\'s foundational to everything.', zh: '又是心理安全，它一直出現是因為它是一切的基礎。', vocab: [{ word: 'psychological safety', def: 'the feeling that you can speak up without fear of punishment' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'If people are afraid to admit mistakes, the organization can\'t learn.', zh: '如果人們害怕承認錯誤，組織就無法學習。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'And the same problems keep happening over and over. That\'s genuinely costly.', zh: '同樣的問題一遍又一遍地發生，這確實是代價高昂的。' },
      ]
    },
    {
      title: 'Problem Solving in Daily Life',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'We often think of problem solving as a work thing, but it\'s a life skill.', zh: '我們經常把解決問題看作是工作的事，但它是一種生活技能。', vocab: [{ word: 'life skill', def: 'a practical ability that helps you navigate everyday situations' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Planning a trip, handling a conflict, making a big decision — it\'s all problem solving.', zh: '計劃旅行、處理衝突、做重大決定——這都是解決問題。' },
        { speaker: 'a', speakerName: 'Mira', en: 'And the better you get at it, the calmer you feel when things go wrong.', zh: '你做得越好，當事情出錯時你感覺越平靜。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Because you know you have a process. "I\'ve solved hard things before. I can do this."', zh: '因為你知道你有一個流程。「我以前解決過困難的事情，我可以做到這個。」' },
        { speaker: 'a', speakerName: 'Mira', en: 'That\'s confidence built from experience, not just positive thinking.', zh: '那是從經驗中建立的自信，而不僅僅是積極思考。', vocab: [{ word: 'confidence built from experience', def: 'self-assurance that comes from having successfully dealt with challenges' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Real confidence can\'t be faked. It grows through repeated challenges and recovery.', zh: '真正的自信不能被偽裝，它通過反復的挑戰和恢復成長。' },
        { speaker: 'a', speakerName: 'Mira', en: 'So every problem you face is actually building your capacity for the next one.', zh: '所以你面對的每個問題實際上都在建立你應對下一個問題的能力。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'That reframe makes even difficult days feel like they have a purpose.', zh: '那種重新框架讓即使是困難的日子也感覺有目的。' },
      ]
    }
  ],
  keyPhrases: [
    { en: 'root cause', zh: '根本原因', example: 'The five whys technique helps you find the root cause.' },
    { en: 'five whys', zh: '五個為什麼', example: 'Use five whys to dig deeper into any problem.' },
    { en: 'devil\'s advocate', zh: '魔鬼代言人', example: 'Someone needs to play devil\'s advocate so we test our assumptions.' },
    { en: 'groupthink', zh: '群體思維', example: 'Groupthink kills creativity in meetings.' },
    { en: 'post-mortem', zh: '事後檢討', example: 'The team held a post-mortem to understand what went wrong.' },
    { en: 'generate options', zh: '產生選項', example: 'Always generate at least three options before deciding.' },
    { en: 'psychological safety', zh: '心理安全感', example: 'Psychological safety encourages people to share mistakes openly.' },
    { en: 'treat it as data', zh: '把它當作數據', example: 'When an experiment fails, treat it as data and adjust.' },
    { en: 'tolerance for uncertainty', zh: '對不確定性的容忍', example: 'Good problem solvers have a high tolerance for uncertainty.' },
    { en: 'problem definition', zh: '問題定義', example: 'Spend time on problem definition before jumping to solutions.' },
  ]
}

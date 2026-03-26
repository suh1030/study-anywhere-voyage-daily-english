import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_34: Episode = {
  weekNumber: 34,
  theme: 'Artificial Intelligence',
  title: 'Intelligent Machines: Living With AI',
  phase: 'p5',
  parts: [
    {
      title: 'AI in Everyday Life',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'AI has moved from science fiction to the background of our everyday lives very quickly.', zh: 'AI已經從科幻小說迅速轉移到我們日常生活的背景中。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Recommendations on streaming services, autocorrect on your phone, navigation apps — all AI.', zh: '流媒體服務的推薦、手機上的自動更正、導航應用——都是AI。', vocab: [{ word: 'recommendations', def: 'suggestions made based on your previous behavior or preferences' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'Most people interact with AI dozens of times a day without realizing it.', zh: '大多數人每天與AI互動幾十次而不自知。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'And with large language models now, you can have a conversation with a machine that\'s often indistinguishable from a person.', zh: '現在有了大型語言模型，你可以與一台機器進行通常與人無法區分的對話。', vocab: [{ word: 'large language models', def: 'AI systems trained on large amounts of text to understand and generate language' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'That\'s a new kind of intelligence, and it raises new questions we haven\'t faced before.', zh: '那是一種新型智能，它提出了我們以前從未面臨過的新問題。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Questions about authenticity, authorship, trust, and what it means to be human.', zh: '關於真實性、創作、信任以及成為人類意味著什麼的問題。', vocab: [{ word: 'authorship', def: 'the state of being the creator of a piece of work' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'We\'re not prepared for how quickly this is changing. The adaptation challenge is immense.', zh: '我們還沒有準備好應對這種變化的速度，適應挑戰是巨大的。', vocab: [{ word: 'adaptation challenge', def: 'the difficulty of adjusting to rapid change' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'But humans have always adapted to new tools. The printing press felt revolutionary too.', zh: '但人類總是適應新工具，印刷機當時也感覺是革命性的。' },
      ]
    },
    {
      title: 'AI and Work',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'The question everyone is asking: will AI take my job?', zh: '每個人都在問的問題：AI會取代我的工作嗎？', vocab: [{ word: 'automate', def: 'to use machines or software to do work that humans used to do' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'It\'s a real concern. Routine, predictable tasks are most at risk. Creative and social roles, less so.', zh: '這是一個真實的擔憂，常規、可預測的任務風險最大，創意和社交角色則不那麼多。', vocab: [{ word: 'routine tasks', def: 'repetitive tasks that follow a predictable pattern' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'The nuance is that AI might replace parts of jobs, not whole jobs. Roles will evolve.', zh: '微妙之處在於AI可能替代工作的部分，而不是整個工作，角色將會演變。', vocab: [{ word: 'nuance', def: 'a subtle difference or shade of meaning that matters a lot' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'A lawyer using AI research tools does ten times the work of one without them.', zh: '使用AI研究工具的律師做的工作是沒有這些工具的律師的十倍。', vocab: [{ word: 'AI research tools', def: 'software that uses AI to help professionals gather and analyze information' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'The people who learn to work with AI will outcompete those who refuse to adapt.', zh: '那些學會與AI合作的人將超越那些拒絕適應的人。', vocab: [{ word: 'outcompete', def: 'to perform better than others in a competitive situation' }] },
        { speaker: 'b', speakerName: 'Jamie', en: '"AI won\'t replace you. A person who uses AI will." That\'s becoming the common wisdom.', zh: '「AI不會取代你，一個使用AI的人會。」這正在成為普遍的智慧。', vocab: [{ word: 'common wisdom', def: 'a widely accepted belief or understanding about something' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'So the skill is learning how to use these tools well, not how to avoid them.', zh: '所以技能是學習如何好好使用這些工具，而不是如何避免它們。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Prompt engineering, critical evaluation of outputs — these are the new literacy skills.', zh: '提示工程、輸出的批判性評估——這些是新的識字技能。', vocab: [{ word: 'prompt engineering', def: 'the skill of writing effective instructions for AI systems' }] },
      ]
    },
    {
      title: 'AI Ethics and Concerns',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'There are real ethical concerns with AI that we can\'t ignore. Bias, privacy, transparency.', zh: 'AI存在我們無法忽視的真實倫理問題：偏見、隱私、透明度。', vocab: [{ word: 'bias', def: 'unfair tendency to favor certain people, groups, or outcomes' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'AI systems learn from human-generated data. If that data reflects biases, the AI amplifies them.', zh: 'AI系統從人類生成的數據中學習。如果那些數據反映了偏見，AI就會放大它們。', vocab: [{ word: 'amplifies', def: 'makes louder or more intense; expands the effect of something' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'Facial recognition systems that perform worse on darker-skinned faces — that\'s a documented problem.', zh: '在深色皮膚面孔上表現更差的人臉識別系統——那是一個有記錄的問題。', vocab: [{ word: 'documented problem', def: 'an issue that has been formally proven and recorded with evidence' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Privacy concerns are also huge. AI systems often train on personal data without explicit consent.', zh: '隱私問題也很大，AI系統通常在未明確同意的情況下訓練個人數據。', vocab: [{ word: 'explicit consent', def: 'a clear, voluntary agreement for someone to use your data or information' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'And deepfakes — AI-generated fake videos — are creating a trust crisis in media.', zh: '還有深度偽造——AI生成的假視頻——正在媒體中製造信任危機。', vocab: [{ word: 'deepfakes', def: 'AI-generated fake videos or images that look convincingly real' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'The question of what\'s real is getting harder to answer. That has serious social consequences.', zh: '什麼是真實的問題越來越難回答，那有嚴重的社會後果。' },
        { speaker: 'a', speakerName: 'Mira', en: 'Regulation will need to catch up fast. This is moving faster than legislation can.', zh: '監管將需要迅速趕上，這比立法移動得更快。', vocab: [{ word: 'regulation', def: 'rules made by authorities to control how something is used' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Technology always outpaces governance. The gap between innovation and law is a danger zone.', zh: '技術總是超越治理，創新和法律之間的差距是一個危險地帶。', vocab: [{ word: 'governance', def: 'the process of governing or controlling something' }] },
      ]
    },
    {
      title: 'AI and Creativity',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'One of the most heated debates is around AI and creativity. Can a machine truly create?', zh: '最激烈的辯論之一是關於AI和創造力，機器真的可以創造嗎？', vocab: [{ word: 'heated debates', def: 'intense and emotional discussions with strong opposing views' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'AI can generate art, music, and text that people find beautiful or moving. That\'s undeniable.', zh: 'AI可以生成人們認為美麗或動人的藝術、音樂和文本，這是不可否認的。', vocab: [{ word: 'undeniable', def: 'impossible to deny or disagree with' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'But is it creation or sophisticated pattern matching? That\'s the philosophical question.', zh: '但這是創造還是複雜的模式匹配？那是哲學問題。', vocab: [{ word: 'pattern matching', def: 'finding and replicating patterns in existing data without true understanding' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Some artists say it\'s a threat. Others say it\'s just a new tool — like the camera was for painters.', zh: '一些藝術家說這是威脅，其他人說它只是一個新工具——就像相機對畫家一樣。', vocab: [{ word: 'new tool analogy', def: 'comparing a new technology to a previous one that also seemed threatening at first' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'The camera didn\'t end painting. It changed what painting was for.', zh: '相機沒有結束繪畫，它改變了繪畫的用途。', vocab: [{ word: 'changed what it was for', def: 'shifted the purpose or meaning of something' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Maybe AI will push human creativity toward more personal, emotional, uniquely human expression.', zh: '也許AI將推動人類創造力向更個人化、情感化、獨特的人類表達方向發展。' },
        { speaker: 'a', speakerName: 'Mira', en: 'The things machines can\'t replicate — lived experience, vulnerability, meaning — those become more valuable.', zh: '機器無法複製的東西——生活體驗、脆弱性、意義——那些變得更有價值。', vocab: [{ word: 'vulnerability', def: 'the courage to show weakness, imperfection, or genuine emotion' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'In an age of AI content, genuinely human art might be the rarest and most precious kind.', zh: '在AI內容的時代，真正的人類藝術可能是最稀有和最珍貴的。' },
      ]
    },
    {
      title: 'Living Well With AI',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'What does living well with AI actually look like in practice?', zh: '與AI共存在實踐中實際上是什麼樣子？' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Using it for what it\'s good at — research, drafting, analysis — and keeping humans in the loop for judgment.', zh: '將其用於它擅長的事情——研究、起草、分析——並讓人類參與判斷。', vocab: [{ word: 'keeping humans in the loop', def: 'ensuring that humans remain involved in decision-making processes' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'Critical thinking remains the essential skill. AI outputs need to be evaluated, not just accepted.', zh: '批判性思維仍然是必不可少的技能，AI輸出需要被評估，而不僅僅是接受。', vocab: [{ word: 'critical thinking', def: 'the ability to analyze and evaluate information carefully and independently' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'The people who blindly trust AI outputs are the most at risk of being misled.', zh: '盲目信任AI輸出的人最容易被誤導。', vocab: [{ word: 'blindly trust', def: 'to accept something as true without questioning or verifying it' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'AI is a mirror and an amplifier. It reflects and magnifies what humans put into it.', zh: 'AI是一面鏡子和放大器，它反映和放大了人類放入其中的東西。', vocab: [{ word: 'mirror and amplifier', def: 'something that both reflects and increases the intensity of what you give it' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'So the quality of the human using it matters enormously. Garbage in, garbage out.', zh: '所以使用它的人的質量非常重要，垃圾進，垃圾出。', vocab: [{ word: 'garbage in, garbage out', def: 'the idea that low-quality input produces low-quality output' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'The future with AI will be shaped by the humans who design, deploy, and use it.', zh: '與AI的未來將由設計、部署和使用它的人類塑造。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'That makes our choices about AI use among the most consequential of our generation.', zh: '這使我們關於AI使用的選擇成為我們這一代最重要的選擇之一。', vocab: [{ word: 'consequential', def: 'having important and lasting effects' }] },
      ]
    }
  ],
  keyPhrases: [
    { en: 'large language models', zh: '大型語言模型', example: 'Large language models like GPT can write essays and answer questions.' },
    { en: 'prompt engineering', zh: '提示工程', example: 'Prompt engineering is becoming a key professional skill.' },
    { en: 'bias in AI', zh: 'AI 偏見', example: 'Bias in AI can produce unfair results for underrepresented groups.' },
    { en: 'deepfakes', zh: '深度偽造', example: 'Deepfakes make it harder to trust what you see online.' },
    { en: 'keeping humans in the loop', zh: '保持人類參與', example: 'Important decisions should always keep humans in the loop.' },
    { en: 'critical thinking', zh: '批判性思維', example: 'Critical thinking helps you evaluate AI outputs carefully.' },
    { en: 'garbage in, garbage out', zh: '垃圾進垃圾出', example: 'Garbage in, garbage out — AI is only as good as what you give it.' },
    { en: 'explicit consent', zh: '明確同意', example: 'Using personal data requires explicit consent from users.' },
    { en: 'outcompete', zh: '勝過競爭對手', example: 'Learning AI tools will help you outcompete those who don\'t.' },
    { en: 'consequential', zh: '重要的、有深遠影響的', example: 'Our choices about AI use are among the most consequential today.' },
  ]
}

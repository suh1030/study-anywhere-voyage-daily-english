import { Episode } from '../../app/src/data/episode-sample'

export const EPISODE_18: Episode = {
  weekNumber: 18,
  theme: 'Meetings & Discussions',
  title: "Let's Meet: Navigating Work Meetings",
  phase: 'p3',
  parts: [
    {
      title: 'Why Meetings Matter',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'Meetings are one of those things everyone complains about, but they\'re hard to live without.', zh: '會議是每個人都抱怨的事情之一，但沒有它們又很難。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Exactly. Too many bad meetings and people start to wonder if anything is getting done.', zh: '正是。太多糟糕的會議，人們開始懷疑是否有任何事情在推進。' },
        { speaker: 'a', speakerName: 'Mira', en: 'What makes a meeting worth having, in your view?', zh: '在你看來，是什麼使一個會議值得召開？', vocab: [{ word: 'worth having', def: 'valuable or useful enough to justify the time spent' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'It needs a clear purpose. Are we making a decision, sharing updates, or brainstorming?', zh: '它需要一個明確的目的。我們是在做決定、分享更新，還是在頭腦風暴？', vocab: [{ word: 'brainstorming', def: 'sharing many ideas freely to solve a problem or generate options' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'If you don\'t know why you\'re meeting, you probably don\'t need to meet.', zh: '如果你不知道為什麼要開會，你可能根本不需要開會。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'That\'s a rule I wish more managers followed. "Could this be an email?" should be asked often.', zh: '這是我希望更多管理者遵循的規則。「這能用電子郵件代替嗎？」應該常常被問到。' },
        { speaker: 'a', speakerName: 'Mira', en: 'On the other hand, some things really do need face-to-face or real-time discussion.', zh: '另一方面，有些事情確實需要面對面或實時討論。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Sensitive topics, complex decisions, team dynamics — those usually need meetings.', zh: '敏感話題、複雜決策、團隊動態——這些通常需要開會。', vocab: [{ word: 'team dynamics', def: 'the ways people in a group interact and work together' }] },
      ]
    },
    {
      title: 'Before the Meeting',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'Good meetings start before the meeting. Preparation is everything.', zh: '好的會議在會議之前就開始了，準備就是一切。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Send out an agenda in advance. Let people know what will be discussed.', zh: '提前發出議程，讓人們知道會討論什麼。', vocab: [{ word: 'agenda', def: 'a list of topics to be discussed in a meeting' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'And if you need people to review materials beforehand, send those too.', zh: '如果你需要人們事先查閱材料，也請發送那些。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'I hate arriving at a meeting and being asked for opinions on something I\'ve never seen.', zh: '我討厭到達一個會議，被要求對我從未見過的事情發表意見。' },
        { speaker: 'a', speakerName: 'Mira', en: 'It wastes everyone\'s time and leads to shallow decisions.', zh: '這浪費每個人的時間，導致淺薄的決策。', vocab: [{ word: 'shallow decisions', def: 'decisions made without enough information or thought' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Agreed. Even five minutes of prep can make a huge difference to the quality of discussion.', zh: '同意。即使五分鐘的準備也可以對討論質量產生巨大影響。' },
        { speaker: 'a', speakerName: 'Mira', en: 'And know your role. Are you presenting, deciding, or just there to listen?', zh: '還要了解你的角色。你是在演示、決策，還是只是在那裡傾聽？' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Clarifying that upfront saves a lot of confusion during the meeting.', zh: '事先澄清這一點可以節省會議期間的很多混亂。' },
      ]
    },
    {
      title: 'Speaking Up in Meetings',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'A lot of people struggle to speak up in meetings, especially in large groups.', zh: '很多人在會議中很難開口，尤其是在大型群體中。', vocab: [{ word: 'speak up', def: 'to say something, especially when it takes courage' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'It\'s easy to feel like your comment isn\'t important enough to interrupt the flow.', zh: '很容易感覺你的評論不夠重要，不值得打斷討論的節奏。' },
        { speaker: 'a', speakerName: 'Mira', en: 'But if everyone thinks that, the meeting ends with only the loudest voices heard.', zh: '但如果每個人都這樣想，會議結束時只有最大聲的聲音被聽到。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'How do you break in without being rude? That\'s the tricky part.', zh: '如何在不失禮的情況下插話？那是棘手的部分。', vocab: [{ word: 'break in', def: 'to interrupt a conversation or discussion' }] },
        { speaker: 'a', speakerName: 'Mira', en: '"I\'d like to add something here" or "Can I jump in?" are polite ways to get the floor.', zh: '「我想在這裡補充一點」或「我可以插話嗎？」是禮貌地獲得發言權的方式。', vocab: [{ word: 'get the floor', def: 'to have the chance to speak in a group discussion' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Writing down your thought while someone else is talking helps too. Then you don\'t lose it.', zh: '在別人說話的時候把你的想法寫下來也有幫助，這樣你就不會忘記。' },
        { speaker: 'a', speakerName: 'Mira', en: 'And for quiet people, some meetings have a round-robin format — everyone must speak.', zh: '對於安靜的人，有些會議有輪流發言的形式——每個人都必須發言。', vocab: [{ word: 'round-robin', def: 'a format where everyone takes a turn to speak or contribute' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'That can feel forced, but it does surface ideas that would otherwise never be heard.', zh: '這可能感覺是被迫的，但它確實會浮現出否則永遠不會被聽到的想法。' },
      ]
    },
    {
      title: 'Running a Meeting Well',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'If you\'re the one running the meeting, there\'s a lot that can go wrong.', zh: '如果你是主持會議的人，有很多事情可能會出錯。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Starting late is the classic mistake. It signals that time doesn\'t matter.', zh: '遲到開始是典型的錯誤，它表明時間不重要。' },
        { speaker: 'a', speakerName: 'Mira', en: 'Or that you don\'t respect the people who did show up on time.', zh: '或者你不尊重那些準時出現的人。', vocab: [{ word: 'show up on time', def: 'to arrive at the agreed time' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Keeping things on track is hard. One topic always has a way of taking over the whole meeting.', zh: '保持事情在正軌上很難，一個話題總是有辦法佔據整個會議。', vocab: [{ word: 'on track', def: 'following the planned direction or schedule' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'A parking lot helps — noting off-topic ideas to revisit later without losing them.', zh: '一個「停車場」有幫助——記下偏離主題的想法，以便以後回顧而不丟失它們。', vocab: [{ word: 'parking lot', def: 'a space to note ideas that are off-topic for now but worth returning to' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'And always end with clear next steps. Who does what by when?', zh: '而且總是以明確的後續步驟結束。誰在什麼時候做什麼？' },
        { speaker: 'a', speakerName: 'Mira', en: 'Without action items, the meeting might as well not have happened.', zh: '沒有行動項目，這個會議可能就和沒有開一樣。', vocab: [{ word: 'action items', def: 'specific tasks assigned to people after a meeting' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Send a summary email afterwards. It keeps everyone accountable and aligned.', zh: '之後發一封摘要郵件，它讓每個人都負責任並保持一致。', vocab: [{ word: 'aligned', def: 'in agreement and working toward the same goal' }] },
      ]
    },
    {
      title: 'Virtual Meetings',
      lines: [
        { speaker: 'a', speakerName: 'Mira', en: 'So many meetings are online now. That changes the dynamic quite a bit.', zh: '現在很多會議都是在線的，這大大改變了動態。', vocab: [{ word: 'dynamic', def: 'the way people interact and communicate in a group' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Virtual meetings are harder to read. You miss body language and side conversations.', zh: '虛擬會議更難解讀，你錯過了肢體語言和側面對話。' },
        { speaker: 'a', speakerName: 'Mira', en: 'Camera on or off is always a debate. Do you have a preference?', zh: '相機開還是關總是一個爭論，你有偏好嗎？' },
        { speaker: 'b', speakerName: 'Jamie', en: 'Camera on, for me. It shows you\'re present and engaged, not just listening with one ear.', zh: '對我來說是相機開。它表明你在場且投入，而不只是半心半意地傾聽。', vocab: [{ word: 'engaged', def: 'actively paying attention and participating' }] },
        { speaker: 'a', speakerName: 'Mira', en: 'I agree for smaller meetings, but in a call with fifty people, cameras seem less necessary.', zh: '我同意在較小的會議中，但在一個有五十人的通話中，相機似乎不那麼必要。' },
        { speaker: 'b', speakerName: 'Jamie', en: 'True. Context matters. One rule can\'t fit every situation.', zh: '確實，背景很重要，一個規則不能適合每種情況。' },
        { speaker: 'a', speakerName: 'Mira', en: 'And making sure to mute yourself when not speaking — that\'s just basic courtesy.', zh: '確保在不說話時靜音——這只是基本禮貌。', vocab: [{ word: 'courtesy', def: 'polite behavior that shows respect for others' }] },
        { speaker: 'b', speakerName: 'Jamie', en: 'Background noise from an open mic has derailed more meetings than I can count.', zh: '來自開著麥克風的背景噪音破壞的會議比我能數的還要多。', vocab: [{ word: 'derailed', def: 'caused something to go off track or fail' }] },
      ]
    }
  ],
  keyPhrases: [
    { en: 'agenda', zh: '議程', example: 'Please review the agenda before the meeting starts.' },
    { en: 'brainstorming', zh: '腦力激盪', example: 'The first hour is for brainstorming — no bad ideas.' },
    { en: 'speak up', zh: '開口發言', example: 'Don\'t be afraid to speak up if you have a good idea.' },
    { en: 'get the floor', zh: '獲得發言權', example: 'She waited for a pause to get the floor.' },
    { en: 'action items', zh: '行動事項', example: 'We always end meetings with clear action items.' },
    { en: 'parking lot', zh: '暫存議題區', example: 'Let\'s put that in the parking lot and come back to it.' },
    { en: 'on track', zh: '在正軌上', example: 'The project is on track to finish by Friday.' },
    { en: 'aligned', zh: '步調一致', example: 'We need to make sure the whole team is aligned on the plan.' },
    { en: 'round-robin', zh: '輪流發言', example: 'We did a round-robin so everyone could share their thoughts.' },
    { en: 'derail', zh: '使偏離軌道', example: 'One side conversation derailed the whole discussion.' },
  ]
}

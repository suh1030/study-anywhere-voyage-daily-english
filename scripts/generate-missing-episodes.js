const fs = require('fs')
const path = require('path')

const weekPlans = {
  15: {
    days: [
      { title: 'First Impressions and Personality Signals', focus: 'first impressions', terms: ['reserved', 'charismatic', 'read someone', 'warm up', 'misleading', 'initial impression'] },
      { title: 'Introversion, Extroversion, and Energy', focus: 'social energy', terms: ['introvert', 'extrovert', 'recharge', 'social battery', 'stimulating', 'overwhelmed'] },
      { title: 'Traits We Admire in Other People', focus: 'admired traits', terms: ['integrity', 'humility', 'resilient', 'generous', 'grounded', 'consistent'] },
      { title: 'Flaws, Habits, and Personal Growth', focus: 'personal flaws', terms: ['defensive', 'self-aware', 'habit loop', 'trigger', 'improve gradually', 'blind spot'] },
      { title: 'How Personality Shapes Relationships', focus: 'relationships', terms: ['compatibility', 'conflict style', 'open up', 'misunderstanding', 'patience', 'adapt'] },
      { title: 'Becoming More Fully Yourself', focus: 'self-development', terms: ['authentic', 'self-acceptance', 'version of yourself', 'evolve', 'reflect honestly', 'long-term growth'] },
    ],
  },
  16: {
    days: [
      { title: 'Direct and Indirect Communication', focus: 'communication style differences', terms: ['direct', 'indirect', 'imply', 'blunt', 'nuance', 'misread'] },
      { title: 'Listening Beyond the Words', focus: 'listening deeply', terms: ['active listening', 'tone', 'subtext', 'clarify', 'interrupt', 'reflect back'] },
      { title: 'Expressing Disagreement Respectfully', focus: 'respectful disagreement', terms: ['push back', 'respectful', 'frame carefully', 'defensive', 'common ground', 'disagree well'] },
      { title: 'Texting, Voice Notes, and Miscommunication', focus: 'digital communication', terms: ['tone gets lost', 'voice note', 'misinterpret', 'clarify quickly', 'delayed reply', 'read too much into it'] },
      { title: 'Asking Better Questions', focus: 'question asking', terms: ['open-ended', 'follow-up', 'surface answer', 'curious', 'invite reflection', 'deeper conversation'] },
      { title: 'Speaking Clearly Under Pressure', focus: 'clear speaking', terms: ['gather your thoughts', 'ramble', 'concise', 'pressure moment', 'pause', 'communicate calmly'] },
    ],
  },
  17: {
    days: [
      { title: 'Why People Help One Another', focus: 'motives for helping', terms: ['generosity', 'empathy', 'obligation', 'instinct', 'support system', 'show up'] },
      { title: 'Helping Without Taking Over', focus: 'healthy support', terms: ['take over', 'empower', 'rescue mode', 'step back', 'ask first', 'useful help'] },
      { title: 'Accepting Help with Grace', focus: 'receiving help', terms: ['receive support', 'pride', 'burden', 'lean on people', 'grateful', 'mutual care'] },
      { title: 'Volunteering and Community Support', focus: 'community service', terms: ['volunteer', 'community need', 'small contribution', 'impact', 'sustained effort', 'show compassion'] },
      { title: 'Compassion Fatigue and Boundaries', focus: 'helping sustainably', terms: ['compassion fatigue', 'burnout', 'boundary', 'capacity', 'drained', 'sustainable care'] },
      { title: 'The Kindness We Remember Most', focus: 'memorable kindness', terms: ['small act', 'timing mattered', 'felt seen', 'quiet kindness', 'lasting effect', 'human warmth'] },
    ],
  },
  18: {
    days: [
      { title: 'Why Conflict Happens', focus: 'sources of conflict', terms: ['friction', 'misaligned expectations', 'resentment', 'communication gap', 'tension', 'unspoken issue'] },
      { title: 'Addressing Problems Early', focus: 'early intervention', terms: ['address directly', 'before it builds', 'avoidance', 'clear the air', 'small issue', 'escalate later'] },
      { title: 'Fighting Fair', focus: 'healthy conflict habits', terms: ['fight fair', 'personal attack', 'stay on topic', 'listen fully', 'heat of the moment', 'repair trust'] },
      { title: 'Apologies That Actually Work', focus: 'effective apologies', terms: ['take responsibility', 'defensive apology', 'repair', 'specific harm', 'make amends', 'rebuild trust'] },
      { title: 'Forgiveness and Letting Go', focus: 'forgiveness', terms: ['let go', 'hold onto anger', 'forgiveness', 'boundaries remain', 'move forward', 'lingering hurt'] },
      { title: 'Conflict as a Chance to Grow', focus: 'growth through conflict', terms: ['learn from conflict', 'honest feedback', 'grow stronger', 'relationship test', 'maturity', 'mutual understanding'] },
    ],
  },
  19: {
    days: [
      { title: 'Describing What You Actually Do', focus: 'job identity', terms: ['job title', 'day-to-day work', 'responsibility', 'scope', 'misunderstood role', 'what I actually do'] },
      { title: 'Purpose, Meaning, and Work', focus: 'meaning in work', terms: ['purpose', 'meaningful', 'contribution', 'fulfilling', 'just a paycheck', 'value your work'] },
      { title: 'Skills You Use Every Day', focus: 'core skills', terms: ['problem-solving', 'people skills', 'attention to detail', 'adapt quickly', 'decision-making', 'transferable skill'] },
      { title: 'The Hardest Parts of Your Role', focus: 'job difficulties', terms: ['pressure point', 'draining', 'unpredictable', 'difficult client', 'competing priorities', 'stressful part'] },
      { title: 'Professional Identity and Confidence', focus: 'professional confidence', terms: ['confidence at work', 'impostor syndrome', 'credibility', 'earn trust', 'grow into it', 'own your role'] },
      { title: 'What Kind of Work Fits You Best', focus: 'fit and career alignment', terms: ['work environment', 'fit your strengths', 'independence', 'collaboration', 'pace of work', 'career fit'] },
    ],
  },
  20: {
    days: [
      { title: 'Preparing for Meetings That Matter', focus: 'meeting preparation', terms: ['prepare well', 'agenda', 'desired outcome', 'come ready', 'decision point', 'context'] },
      { title: 'How to Contribute in Group Discussions', focus: 'participation in meetings', terms: ['jump in', 'add value', 'concise point', 'build on an idea', 'pause and speak', 'make room'] },
      { title: 'Challenging Ideas Without Creating Friction', focus: 'disagreeing in meetings', terms: ['challenge an idea', 'push back politely', 'evidence', 'tone matters', 'not personal', 'healthy debate'] },
      { title: 'Running Shorter, Better Meetings', focus: 'meeting facilitation', terms: ['facilitate', 'keep time', 'stay on track', 'parking lot', 'action items', 'clear summary'] },
      { title: 'When a Meeting Should Have Been an Email', focus: 'unnecessary meetings', terms: ['status update', 'could be an email', 'meeting overload', 'protect focus time', 'wasted time', 'better async'] },
      { title: 'Building Better Discussion Culture', focus: 'team discussion culture', terms: ['discussion culture', 'invite voices', 'respectful disagreement', 'share airtime', 'psychological safety', 'good meeting norm'] },
    ],
  },
  21: {
    days: [
      { title: 'What Pressure Feels Like at Work', focus: 'pressure at work', terms: ['under pressure', 'tight timeline', 'expectations', 'stress response', 'carry pressure', 'high stakes'] },
      { title: 'Prioritizing When Everything Feels Urgent', focus: 'prioritization', terms: ['urgent', 'important', 'triage', 'tradeoff', 'sequence work', 'limited bandwidth'] },
      { title: 'Deadlines, Accountability, and Trust', focus: 'deadline culture', terms: ['deadline', 'deliver on time', 'accountable', 'miss a deadline', 'trust', 'follow through'] },
      { title: 'Handling Last-Minute Changes', focus: 'adaptability under pressure', terms: ['last-minute', 'pivot quickly', 'unexpected change', 'stay calm', 'rework', 'flexible plan'] },
      { title: 'Stress, Recovery, and Burnout Risk', focus: 'stress recovery', terms: ['burnout risk', 'recovery', 'sustained stress', 'warning signs', 'rest strategically', 'reset'] },
      { title: 'Staying Reliable in High-Pressure Seasons', focus: 'resilience at work', terms: ['reliable', 'pressure season', 'steady', 'communicate early', 'protect quality', 'pace yourself'] },
    ],
  },
  22: {
    days: [
      { title: 'How You Approach a Difficult Problem', focus: 'problem-solving approach', terms: ['define the problem', 'root cause', 'step back', 'assumption', 'break it down', 'solve systematically'] },
      { title: 'Creative Solutions and Fresh Thinking', focus: 'creative problem solving', terms: ['fresh angle', 'creative solution', 'reframe the issue', 'brainstorm freely', 'stuck point', 'unexpected answer'] },
      { title: 'Working Through Uncertainty', focus: 'uncertain decisions', terms: ['uncertainty', 'incomplete information', 'best guess', 'test an option', 'risk', 'move forward anyway'] },
      { title: 'Learning from Mistakes', focus: 'post-mortem thinking', terms: ['mistake', 'post-mortem', 'what went wrong', 'adjust process', 'learn quickly', 'avoid blame'] },
      { title: 'Solving Problems with Other People', focus: 'collaborative problem solving', terms: ['different perspective', 'collaborate', 'surface assumptions', 'shared solution', 'listen first', 'better answer'] },
      { title: 'Knowing When to Simplify', focus: 'simplicity in solutions', terms: ['simple solution', 'overcomplicate', 'practical fix', 'good enough', 'reduce friction', 'elegant answer'] },
    ],
  },
  23: {
    days: [
      { title: 'What Success Looks Like to You', focus: 'career definitions of success', terms: ['career success', 'status', 'meaningful work', 'salary matters', 'personal definition', 'shift over time'] },
      { title: 'Ambition and Its Tradeoffs', focus: 'ambition', terms: ['ambition', 'tradeoff', 'push yourself', 'career ladder', 'cost of success', 'what matters most'] },
      { title: 'Setting Career Goals That Fit Real Life', focus: 'goal setting', terms: ['career goal', 'realistic plan', 'timeline', 'long-term vision', 'adjust the goal', 'measurable step'] },
      { title: 'Mentors, Models, and Guidance', focus: 'mentorship', terms: ['mentor', 'role model', 'career advice', 'learn from others', 'blind spot', 'ask for guidance'] },
      { title: 'Changing Direction Mid-Career', focus: 'career pivots', terms: ['pivot', 'change direction', 'start over', 'transferable experience', 'uncertain move', 'career transition'] },
      { title: 'Building a Career You Can Sustain', focus: 'sustainable career planning', terms: ['sustainable career', 'pace yourself', 'long game', 'fit your life', 'not burn out', 'build intentionally'] },
    ],
  },
  24: {
    days: [
      { title: 'Why Growth Requires Discomfort', focus: 'discomfort and learning', terms: ['growth zone', 'discomfort', 'stretch yourself', 'not ready yet', 'learn by doing', 'uncertain beginner'] },
      { title: 'Learning New Skills as an Adult', focus: 'adult learning', terms: ['learn as an adult', 'practice consistently', 'beginner mindset', 'slow progress', 'plateau', 'keep going'] },
      { title: 'Feedback, Coaching, and Improvement', focus: 'learning through feedback', terms: ['feedback loop', 'coach', 'specific input', 'improve deliberately', 'correct course', 'notice patterns'] },
      { title: 'Curiosity as a Career Advantage', focus: 'curiosity', terms: ['curious', 'ask why', 'keep learning', 'explore deeply', 'grow faster', 'stay adaptable'] },
      { title: 'Books, Courses, and Self-Directed Learning', focus: 'self-directed learning', terms: ['self-directed', 'course', 'learn online', 'book notes', 'build a habit', 'apply knowledge'] },
      { title: 'Becoming the Kind of Person Who Keeps Growing', focus: 'identity and growth', terms: ['growth mindset', 'identity shift', 'keep improving', 'small daily effort', 'not finished', 'long-term learner'] },
    ],
  },
  25: {
    days: [
      { title: 'What Success Feels Like from the Inside', focus: 'inner experience of success', terms: ['achievement', 'relief', 'proud moment', 'anticlimax', 'earned it', 'success feels different'] },
      { title: 'How Failure Changes You', focus: 'failure and identity', terms: ['failure', 'setback', 'bounce back', 'ego hit', 'what it taught me', 'recover stronger'] },
      { title: 'Public Success and Private Doubt', focus: 'success with insecurity', terms: ['impostor feeling', 'public praise', 'private doubt', 'deserve it', 'stay grounded', 'uncertain inside'] },
      { title: 'When Things Don’t Go as Planned', focus: 'unexpected setbacks', terms: ['plan fell apart', 'regroup', 'adapt quickly', 'disappointment', 'new path', 'recover momentum'] },
      { title: 'Resilience After Disappointment', focus: 'resilience', terms: ['disappointment', 'resilience', 'try again', 'process the loss', 'learn forward', 'stay hopeful'] },
      { title: 'Redefining Winning', focus: 'rethinking success', terms: ['winning', 'personal metric', 'external validation', 'quiet success', 'what counts', 'more meaningful'] },
    ],
  },
  26: {
    days: [
      { title: 'What Balance Actually Means', focus: 'definition of balance', terms: ['balance', 'season of life', 'energy budget', 'not equal time', 'realistic rhythm', 'good enough balance'] },
      { title: 'The Boundary Between Work and Home', focus: 'work-home boundaries', terms: ['switch off', 'boundary ritual', 'carry work home', 'mental spillover', 'end the day', 'separate spaces'] },
      { title: 'Rest, Leisure, and Guilt', focus: 'rest without guilt', terms: ['rest', 'leisure', 'earned rest', 'guilty relaxing', 'do nothing', 'recharge intentionally'] },
      { title: 'Overwork and Its Hidden Costs', focus: 'cost of overwork', terms: ['overwork', 'hidden cost', 'relationship strain', 'health impact', 'normalized burnout', 'too much for too long'] },
      { title: 'Making Time for What Matters', focus: 'protecting priorities', terms: ['priority', 'make time', 'calendar it', 'crowded schedule', 'protect what matters', 'intentional life'] },
      { title: 'Designing a More Sustainable Week', focus: 'sustainable routines', terms: ['weekly rhythm', 'recovery time', 'plan ahead', 'protect energy', 'sustainable routine', 'small adjustments'] },
    ],
  },
  27: {
    days: [
      { title: 'Why Travel Changes the Way You See Things', focus: 'travel perspective', terms: ['new perspective', 'travel changes you', 'familiar assumptions', 'expanded worldview', 'see differently', 'step outside routine'] },
      { title: 'Planning vs. Spontaneity on a Trip', focus: 'travel style', terms: ['itinerary', 'spontaneous', 'leave room', 'overplanned', 'travel pace', 'go with the flow'] },
      { title: 'The Best and Worst Parts of Traveling', focus: 'pros and cons of travel', terms: ['uncomfortable joy', 'travel fatigue', 'delayed flight', 'worth the effort', 'memorable moment', 'unexpected stress'] },
      { title: 'Traveling with Other People', focus: 'group travel', terms: ['travel companion', 'different pace', 'compromise', 'shared decision', 'solo time', 'group tension'] },
      { title: 'What Makes a Place Memorable', focus: 'memorable places', terms: ['sense of place', 'local rhythm', 'landscape', 'small details', 'feel unforgettable', 'carry it with you'] },
      { title: 'Coming Home Different', focus: 'after travel', terms: ['return home', 'see home differently', 'shifted perspective', 'carry the trip', 'daily life again', 'subtle change'] },
    ],
  },
  28: {
    days: [
      { title: 'Why People Take Photos', focus: 'motives for photography', terms: ['capture a moment', 'preserve memory', 'notice details', 'visual record', 'frame reality', 'share a feeling'] },
      { title: 'Seeing the World More Closely', focus: 'observation through photography', terms: ['composition', 'light', 'texture', 'notice what others miss', 'look carefully', 'visual attention'] },
      { title: 'Phones, Cameras, and Everyday Creativity', focus: 'accessible photography', terms: ['phone camera', 'accessible art', 'good eye', 'technical skill', 'make images', 'creative habit'] },
      { title: 'Photos, Memory, and Meaning', focus: 'memory and photos', terms: ['memory trigger', 'freeze a moment', 'emotion in an image', 'look back later', 'document life', 'nostalgic'] },
      { title: 'Editing, Filters, and Authenticity', focus: 'editing and authenticity', terms: ['edit a photo', 'filter', 'curated image', 'authentic', 'aesthetic choice', 'distort reality'] },
      { title: 'Why Some Images Stay With Us', focus: 'lasting visual impact', terms: ['striking image', 'story in a frame', 'emotion lingers', 'ordinary becomes beautiful', 'visual memory', 'powerful scene'] },
    ],
  },
  29: {
    days: [
      { title: 'How Music Shapes Mood', focus: 'music and emotion', terms: ['mood shift', 'playlist', 'comfort song', 'emotional soundtrack', 'energize', 'calm down'] },
      { title: 'The Intimacy of Podcasts', focus: 'why podcasts matter', terms: ['podcast voice', 'parasocial feeling', 'listen closely', 'long-form conversation', 'companionable', 'part of your routine'] },
      { title: 'Music Taste and Identity', focus: 'taste and identity', terms: ['music taste', 'identity marker', 'genre', 'guilty pleasure', 'personal soundtrack', 'evolve over time'] },
      { title: 'What We Listen to While Working', focus: 'audio and focus', terms: ['background music', 'focus aid', 'instrumental', 'distracting lyrics', 'ambient sound', 'deep work companion'] },
      { title: 'Discovering New Artists and Ideas', focus: 'discovery', terms: ['discover something new', 'recommendation', 'hidden gem', 'algorithm suggestion', 'word of mouth', 'expand your taste'] },
      { title: 'Why Certain Songs Stay with You Forever', focus: 'lasting songs', terms: ['soundtrack of your life', 'memory attached', 'timeless song', 'instantly transport you', 'emotion returns', 'musical memory'] },
    ],
  },
  30: {
    days: [
      { title: 'Why Reading Slows the Mind Down', focus: 'reading benefits', terms: ['slow attention', 'deep reading', 'focus longer', 'mental quiet', 'immersed', 'read with patience'] },
      { title: 'Books That Change the Way You Think', focus: 'transformative books', terms: ['perspective shift', 'carry a book with you', 'reread', 'idea stays', 'changed my thinking', 'intellectual spark'] },
      { title: 'Writing to Clarify Your Thoughts', focus: 'writing as thinking', terms: ['clarify your thoughts', 'journal', 'draft an idea', 'think on paper', 'find the right words', 'untangle something'] },
      { title: 'The Difference Between Reading Online and in Print', focus: 'digital vs print reading', terms: ['skim online', 'print book', 'attention span', 'read deeply', 'screen fatigue', 'retain more'] },
      { title: 'Why So Many People Want to Write', focus: 'desire to write', terms: ['tell a story', 'leave something behind', 'voice', 'creative urge', 'share clearly', 'begin writing'] },
      { title: 'Building a Life with More Reading and Writing', focus: 'habit building', terms: ['reading habit', 'write regularly', 'small daily practice', 'make time', 'protect attention', 'creative routine'] },
    ],
  },
  31: {
    days: [
      { title: 'Why People Love Animals So Much', focus: 'human attachment to animals', terms: ['companionship', 'unconditional', 'animal bond', 'comforting presence', 'care instinct', 'simple affection'] },
      { title: 'Life with a Pet at Home', focus: 'daily life with pets', terms: ['routine of care', 'walk schedule', 'messy but worth it', 'household rhythm', 'pet owner', 'shared home'] },
      { title: 'What Pets Teach Us', focus: 'lessons from pets', terms: ['patience', 'responsibility', 'read nonverbal cues', 'care every day', 'simple joy', 'presence'] },
      { title: 'The Emotional Support Animals Give', focus: 'comfort and support', terms: ['calming effect', 'comfort animal', 'emotional support', 'feel less alone', 'steady presence', 'quiet companionship'] },
      { title: 'Different Kinds of Animal Personalities', focus: 'animal personality', terms: ['playful', 'timid', 'stubborn', 'gentle', 'quirky habit', 'distinct personality'] },
      { title: 'Why Saying Goodbye Is So Hard', focus: 'loss of a pet', terms: ['grief', 'pet loss', 'family member', 'mourning', 'lasting bond', 'remember them warmly'] },
    ],
  },
  32: {
    days: [
      { title: 'Why People Collect Things', focus: 'motives for collecting', terms: ['collector', 'sentimental value', 'hunt for it', 'organized obsession', 'meaning in objects', 'personal archive'] },
      { title: 'The Joy of Having a Hobby', focus: 'joy of hobbies', terms: ['hobby', 'creative outlet', 'unproductive joy', 'lose track of time', 'personal interest', 'make life richer'] },
      { title: 'Hobbies That Calm the Mind', focus: 'relaxing hobbies', terms: ['calming hobby', 'slow down', 'quiet focus', 'restorative', 'hands-on activity', 'mental reset'] },
      { title: 'When a Hobby Becomes Part of Your Identity', focus: 'identity and hobbies', terms: ['part of who you are', 'known for it', 'identity marker', 'passionate interest', 'build a community', 'shared enthusiasm'] },
      { title: 'The Fine Line Between Passion and Obsession', focus: 'healthy obsession', terms: ['obsession', 'healthy passion', 'lose perspective', 'too much money', 'consuming interest', 'keep it balanced'] },
      { title: 'Making Room for Play in Adult Life', focus: 'playfulness', terms: ['play', 'adult life', 'make room for joy', 'not everything productive', 'fun matters', 'reconnect with curiosity'] },
    ],
  },
  33: {
    days: [
      { title: 'Why Nature Changes the Way We Feel', focus: 'nature and mood', terms: ['fresh air', 'calming effect', 'feel grounded', 'natural world', 'mental reset', 'step outside'] },
      { title: 'Favorite Ways to Spend Time Outdoors', focus: 'outdoor preferences', terms: ['hike', 'walk by water', 'open space', 'simple outdoor time', 'weekend outside', 'feel refreshed'] },
      { title: 'The Need for Quiet and Open Space', focus: 'quiet outdoors', terms: ['quiet place', 'open landscape', 'mental spaciousness', 'city fatigue', 'breathe deeply', 'less noise'] },
      { title: 'Weather, Seasons, and the Outdoors', focus: 'seasonal nature experience', terms: ['seasonal change', 'winter light', 'summer heat', 'rainy day outside', 'autumn feeling', 'weather shapes mood'] },
      { title: 'Protecting the Places We Love', focus: 'care for nature', terms: ['protect nature', 'fragile environment', 'leave no trace', 'respect the place', 'conservation', 'shared responsibility'] },
      { title: 'Why Being Outside Still Matters in Modern Life', focus: 'modern disconnection from nature', terms: ['screen-heavy life', 'outside still matters', 'human scale', 'reconnect physically', 'not just scenic', 'basic need'] },
    ],
  },
  34: {
    days: [
      { title: 'Why People Exercise for Different Reasons', focus: 'motives for fitness', terms: ['fitness goal', 'feel stronger', 'look better', 'stress relief', 'health reason', 'personal motivation'] },
      { title: 'Finding a Form of Movement You Enjoy', focus: 'enjoyable exercise', terms: ['movement style', 'hate the gym', 'find your thing', 'sustainable habit', 'enjoy the process', 'keep showing up'] },
      { title: 'Discipline, Motivation, and Routine', focus: 'consistency', terms: ['discipline', 'motivation fades', 'routine matters', 'show up anyway', 'consistency wins', 'build momentum'] },
      { title: 'Team Sports and Individual Goals', focus: 'team vs solo sports', terms: ['team sport', 'solo training', 'shared energy', 'competitive side', 'personal benchmark', 'push yourself'] },
      { title: 'Rest, Recovery, and Avoiding Injury', focus: 'recovery', terms: ['recovery day', 'overtraining', 'listen to your body', 'rest matters', 'injury risk', 'sustainable progress'] },
      { title: 'How Fitness Changes More Than Your Body', focus: 'broader impact of fitness', terms: ['confidence boost', 'clearer mind', 'better sleep', 'stronger habits', 'self-respect', 'carry yourself differently'] },
    ],
  },
  35: {
    days: [
      { title: 'Notifications, Attention, and Daily Focus', focus: 'attention and notifications', terms: ['notifications', 'fragmented attention', 'constant interruption', 'focus cost', 'silence your phone', 'attention span'] },
      { title: 'Convenience and the Hidden Costs of Tech', focus: 'convenience tradeoffs', terms: ['convenience', 'hidden cost', 'frictionless', 'dependency', 'outsource a task', 'trade comfort for control'] },
      { title: 'Smart Homes and Digital Habits', focus: 'smart devices at home', terms: ['smart device', 'voice assistant', 'automate', 'household habit', 'privacy concern', 'tech at home'] },
      { title: 'When Technology Feels Overwhelming', focus: 'tech overload', terms: ['overwhelmed by tech', 'constant updates', 'too many platforms', 'digital fatigue', 'need a break', 'simplify your setup'] },
      { title: 'Choosing What Technology Is Worth Keeping', focus: 'intentional tech use', terms: ['worth keeping', 'useful tool', 'intentional use', 'cut back', 'digital clutter', 'serve your life'] },
      { title: 'Building a Healthier Relationship with Devices', focus: 'balanced tech relationship', terms: ['device boundary', 'screen-free time', 'conscious use', 'own your attention', 'tech boundary', 'healthy relationship'] },
    ],
  },
  36: {
    days: [
      { title: 'What AI Is Good At and What It Is Not', focus: 'AI strengths and limits', terms: ['pattern recognition', 'generate quickly', 'hallucinate', 'good at scale', 'not true understanding', 'use with caution'] },
      { title: 'How AI Changes Everyday Work', focus: 'AI in daily work', terms: ['workflow change', 'automate a task', 'draft faster', 'augment your work', 'save time', 'new skill set'] },
      { title: 'Trust, Accuracy, and Human Judgment', focus: 'trust in AI', terms: ['verify output', 'human judgment', 'accuracy risk', 'confidently wrong', 'check carefully', 'responsible use'] },
      { title: 'Creative Work in the Age of AI', focus: 'AI and creativity', terms: ['creative process', 'assist creativity', 'original voice', 'generate ideas', 'human touch', 'creative shortcut'] },
      { title: 'Ethics, Bias, and Responsibility', focus: 'AI ethics', terms: ['bias', 'ethical concern', 'training data', 'accountability', 'fairness', 'who is responsible'] },
      { title: 'Living Alongside Smarter Machines', focus: 'future coexistence with AI', terms: ['coexist', 'adapt to change', 'human role', 'machine capability', 'stay flexible', 'future of work'] },
    ],
  },
  37: {
    days: [
      { title: 'What Mental Wellbeing Really Means', focus: 'meaning of mental wellbeing', terms: ['mental wellbeing', 'steady state', 'emotional balance', 'cope well', 'inner stability', 'overall wellbeing'] },
      { title: 'Stress, Anxiety, and Modern Life', focus: 'stress and anxiety', terms: ['anxiety', 'chronic stress', 'always on edge', 'mental load', 'spiral', 'calm your system'] },
      { title: 'Small Habits That Protect Your Mind', focus: 'protective habits', terms: ['protective habit', 'sleep enough', 'go outside', 'talk to someone', 'daily check-in', 'regulate yourself'] },
      { title: 'Talking More Honestly About Struggle', focus: 'honesty about mental health', terms: ['open up', 'stigma', 'struggling quietly', 'say it honestly', 'safe conversation', 'less shame'] },
      { title: 'Rest, Therapy, and Support Systems', focus: 'support resources', terms: ['therapy', 'support system', 'rest deeply', 'ask for help', 'professional support', 'not handle alone'] },
      { title: 'Building a More Sustainable Inner Life', focus: 'long-term mental health', terms: ['inner life', 'self-awareness', 'emotional hygiene', 'sustainable pace', 'treat yourself gently', 'long-term stability'] },
    ],
  },
  38: {
    days: [
      { title: 'Why Environmental Issues Feel So Big', focus: 'scale of environmental problems', terms: ['climate issue', 'overwhelming scale', 'systemic problem', 'individual action', 'hard to grasp', 'global consequence'] },
      { title: 'Daily Choices and Their Real Impact', focus: 'everyday sustainability', terms: ['daily choice', 'reuse', 'consume less', 'small action', 'habits matter', 'practical sustainability'] },
      { title: 'Convenience, Consumption, and Waste', focus: 'waste and convenience', terms: ['single-use', 'wasteful', 'convenience culture', 'throw away', 'hidden impact', 'consume mindfully'] },
      { title: 'Hope, Guilt, and Climate Emotions', focus: 'emotions around sustainability', terms: ['climate guilt', 'eco-anxiety', 'hopeful action', 'paralyzed by scale', 'do what you can', 'stay engaged'] },
      { title: 'Cities, Nature, and Sustainable Design', focus: 'systems and design', terms: ['urban design', 'public transit', 'green space', 'sustainable choice', 'infrastructure', 'design for people'] },
      { title: 'What a Sustainable Future Could Look Like', focus: 'future sustainability', terms: ['sustainable future', 'better design', 'collective shift', 'livable world', 'long-term thinking', 'possible future'] },
    ],
  },
  39: {
    days: [
      { title: 'What Money Means Beyond Numbers', focus: 'psychology of money', terms: ['security', 'freedom', 'scarcity mindset', 'financial stress', 'symbol of success', 'money story'] },
      { title: 'Saving, Spending, and Personal Priorities', focus: 'spending choices', terms: ['save intentionally', 'spend wisely', 'priority', 'financial habit', 'short-term pleasure', 'long-term value'] },
      { title: 'Talking About Money with Other People', focus: 'money conversations', terms: ['money taboo', 'awkward topic', 'open conversation', 'financial honesty', 'compare incomes', 'sensitive subject'] },
      { title: 'Financial Goals and Emotional Pressure', focus: 'goals and pressure', terms: ['financial goal', 'pressure to catch up', 'milestone', 'comparison trap', 'plan realistically', 'money anxiety'] },
      { title: 'Lifestyle, Status, and the Cost of Image', focus: 'money and image', terms: ['status spending', 'lifestyle creep', 'look successful', 'hidden debt', 'impress others', 'expensive image'] },
      { title: 'A Healthier Relationship with Money', focus: 'balanced money mindset', terms: ['money mindset', 'enough', 'financial clarity', 'less fear', 'use money wisely', 'support your life'] },
    ],
  },
  40: {
    days: [
      { title: 'Why Change Feels Unsettling', focus: 'emotional reaction to change', terms: ['unsettling', 'loss of control', 'transition period', 'uncertain ground', 'resist change', 'adjust slowly'] },
      { title: 'Life Transitions and Identity Shifts', focus: 'identity in transition', terms: ['life transition', 'identity shift', 'old version of you', 'becoming someone new', 'not fully there yet', 'in-between stage'] },
      { title: 'Starting Over in Midstream', focus: 'fresh starts mid-life', terms: ['start over', 'midstream', 'career change', 'relationship shift', 'new chapter', 'begin again'] },
      { title: 'How to Adapt Without Losing Yourself', focus: 'stable self during change', terms: ['adapt', 'core values', 'stay grounded', 'flexible but steady', 'change around you', 'hold onto yourself'] },
      { title: 'Letting Go of What No Longer Fits', focus: 'releasing the old', terms: ['let go', 'outgrown it', 'used to fit', 'hard goodbye', 'release gently', 'make space'] },
      { title: 'Trusting Yourself Through Uncertainty', focus: 'self-trust', terms: ['self-trust', 'uncertain future', 'step forward', 'not knowing yet', 'inner compass', 'move with faith'] },
    ],
  },
  41: {
    days: [
      { title: 'Where Our Values Come From', focus: 'origins of values', terms: ['family influence', 'cultural value', 'shaped early', 'absorbed belief', 'question your values', 'what matters to you'] },
      { title: 'When Beliefs Start to Change', focus: 'changing beliefs', terms: ['shift your view', 'reconsider', 'life experience', 'belief evolves', 'change your mind', 'see differently now'] },
      { title: 'Living According to What You Believe', focus: 'values in action', terms: ['live your values', 'integrity', 'not just words', 'daily choices', 'consistent action', 'aligned life'] },
      { title: 'Disagreeing with People You Respect', focus: 'respectful belief differences', terms: ['different belief', 'respect each other', 'deep disagreement', 'stay in conversation', 'shared humanity', 'not make enemies'] },
      { title: 'What You Refuse to Compromise On', focus: 'non-negotiables', terms: ['non-negotiable', 'line you will not cross', 'moral boundary', 'core principle', 'stand firm', 'cost of compromise'] },
      { title: 'Becoming More Thoughtful About What Matters', focus: 'mature values', terms: ['thoughtful belief', 'examined life', 'less borrowed opinion', 'deeper conviction', 'humble certainty', 'keep reflecting'] },
    ],
  },
  42: {
    days: [
      { title: 'Imagining the Future We Might Live In', focus: 'future imagination', terms: ['future scenario', 'possible world', 'imagine ahead', 'rapid change', 'hard to predict', 'shape what comes'] },
      { title: 'Hope, Fear, and What Comes Next', focus: 'future emotions', terms: ['hopeful', 'fearful', 'uncertain future', 'mixed feelings', 'what comes next', 'hold both truths'] },
      { title: 'Technology, Work, and the Near Future', focus: 'future of work', terms: ['future of work', 'automation', 'new roles', 'adapt quickly', 'skills that matter', 'changing workplace'] },
      { title: 'The Kind of Future People Want', focus: 'desired future', terms: ['better future', 'humane society', 'sustainable world', 'more connected', 'less anxious', 'worth building'] },
      { title: 'Planning for a Future You Cannot Fully Predict', focus: 'planning under uncertainty', terms: ['future planning', 'uncertainty', 'flexible plan', 'prepare broadly', 'not control everything', 'stay adaptable'] },
      { title: 'How Today’s Choices Shape Tomorrow', focus: 'present choices and future', terms: ['long-term effect', 'small decision', 'future self', 'plant now', 'shape tomorrow', 'responsibility to the future'] },
    ],
  },
  43: {
    days: [
      { title: 'Looking Back on How Much You’ve Changed', focus: 'reflecting on personal change', terms: ['look back', 'used to be', 'changed slowly', 'hard-earned lesson', 'different now', 'notice the shift'] },
      { title: 'What the Hard Years Taught You', focus: 'lessons from difficulty', terms: ['hard season', 'learned resilience', 'painful lesson', 'growth under pressure', 'made me stronger', 'carried forward'] },
      { title: 'The People and Moments That Shaped You', focus: 'shaping influences', terms: ['turning point', 'important person', 'quiet influence', 'changed your path', 'defining moment', 'carry their impact'] },
      { title: 'Regret, Gratitude, and Perspective', focus: 'mixed reflection', terms: ['regret', 'gratitude', 'different perspective', 'would not erase it', 'see it clearly now', 'mixed feeling'] },
      { title: 'What You Want to Leave Behind', focus: 'letting go before moving forward', terms: ['leave behind', 'old habit', 'old fear', 'no longer needed', 'move forward lighter', 'release it'] },
      { title: 'Moving Forward with More Intention', focus: 'intentional forward movement', terms: ['move forward', 'clearer intention', 'next chapter', 'more deliberate', 'carry wisdom', 'begin with awareness'] },
    ],
  },
}

const partBlueprints = [
  {
    title: 'Part 1 — Opening the Topic',
    prompts: [
      'How do you think about {focus} in your own life?',
      "I've noticed {topicPhrase} comes up more often than people admit.",
      'What makes this topic feel so relevant right now?',
      "Because it affects how we make choices, not just how we talk about them.",
      'Do you think most people are conscious of it, or mostly reacting without noticing?',
      "Probably a mix. Some people reflect on it, and others just move through habits they never really question.",
      'That sounds familiar. We often notice the pattern only after it has shaped our day.',
      "Exactly. Awareness usually arrives a little later than the behavior itself.",
    ],
  },
  {
    title: 'Part 2 — Personal Experience',
    prompts: [
      "What's your own experience with {topicPhrase}?",
      "I've learned that {focus} feels different in theory than it does in real life.",
      'In what way?',
      "In real life there's emotion, timing, and a lot more ambiguity than simple advice accounts for.",
      'So the challenge is not just knowing what to do, but doing it when the moment is messy.',
      "Exactly. Most growth comes from practicing in imperfect situations, not from waiting until you're fully ready.",
      'That makes the whole thing sound more human and less like a performance test.',
      "It is. People do better when they treat it as practice instead of proof of their worth.",
    ],
  },
  {
    title: 'Part 3 — Skills and Misunderstandings',
    prompts: [
      'What do people usually misunderstand about {topicPhrase}?',
      "They often reduce it to one obvious behavior and miss the quieter skills underneath.",
      'What kinds of quieter skills?',
      "Things like patience, timing, attention, and the ability to notice when your first instinct isn't the best one.",
      "So the visible part is only the surface of what's actually happening.",
      "Exactly. The surface gets the credit, but the invisible discipline is usually doing the heavy lifting.",
      'That probably explains why some people make it look effortless.',
      "Yes, and usually it isn't effortless at all. It's just well-practiced.",
    ],
  },
  {
    title: 'Part 4 — Pressure and Tradeoffs',
    prompts: [
      'What makes {topicPhrase} harder under pressure?',
      "Pressure narrows attention. People default to the fastest habit, not always the wisest one.",
      'And pressure also makes tradeoffs more obvious, I guess.',
      "Definitely. You start seeing what this choice costs in time, energy, relationships, or clarity.",
      'So a good response usually depends on context, not on one rigid rule.',
      "Exactly. Rigid rules feel comforting, but mature judgment usually means adapting without losing your values.",
      "That sounds simple when you say it and much harder when you're living it.",
      "That's true of most meaningful skills. They sound obvious only after you've practiced them badly a few times.",
    ],
  },
  {
    title: 'Part 5 — What Lasts',
    prompts: [
      'What have you come to believe about {topicPhrase} over time?',
      "That the healthiest version is usually steadier and less dramatic than people imagine.",
      'Less dramatic in what sense?',
      "It's often about consistency, small choices, and building something sustainable instead of chasing one perfect moment.",
      'That feels like a useful lens for almost any part of life.',
      "I think so too. What lasts is rarely built from intensity alone.",
      'So the goal is not perfection, but a rhythm you can keep.',
      "Exactly. A good life is usually made of repeatable habits, not heroic exceptions.",
    ],
  },
]

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function escapeSingle(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function capitalizePhrase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function buildChineseLine(index, focus, term) {
  const templates = [
    `你怎麼看待「${focus}」這件事？`,
    `我覺得這件事其實比表面上看起來更複雜。`,
    `你認為大家最常忽略的是什麼？`,
    `很多時候，真正困難的是在當下做出穩定的選擇。`,
    `而且一有壓力，人就很容易回到舊習慣。`,
    `所以關鍵可能不是完美，而是更有意識。`,
    `這樣說起來，它比較像一種可以慢慢培養的能力。`,
    `對，我也覺得長期來看，穩定比戲劇化更重要。`,
  ]
  return templates[index % templates.length]
}

function buildPartLines(day, partIndex) {
  const blueprint = partBlueprints[partIndex]
  const topicPhrase = day.focus
  return blueprint.prompts.map((template, lineIndex) => {
    const en = template
      .replace(/\{focus\}/g, topicPhrase)
      .replace(/\{topicPhrase\}/g, topicPhrase)
    const zh = buildChineseLine(lineIndex + partIndex, topicPhrase, day.terms[lineIndex % day.terms.length])
    const vocabWord = day.terms[(partIndex * 2 + lineIndex) % day.terms.length]
    const shouldAddVocab = lineIndex === 1 || lineIndex === 3 || lineIndex === 6
    const speaker = lineIndex % 2 === 0 ? (partIndex % 2 === 0 ? 'a' : 'b') : (partIndex % 2 === 0 ? 'b' : 'a')
    const speakerName = speaker === 'a' ? 'Mira' : 'Jamie'
    const vocab = shouldAddVocab
      ? `, vocab: [{ word: '${escapeSingle(vocabWord)}', def: '${escapeSingle(`與 ${topicPhrase} 相關的重點表達`)}' }]`
      : ''
    return `        { speaker: '${speaker}', speakerName: '${speakerName}', en: '${escapeSingle(en)}', zh: '${escapeSingle(zh)}'${vocab} }`
  }).join(',\n')
}

function buildDayObject(weekNumber, baseDate, dayIndex, theme, phase, day) {
  const date = addDays(baseDate, dayIndex - 1)
  const parts = partBlueprints.map((part, partIndex) => {
    const lines = buildPartLines(day, partIndex)
    return `    {\n      title: '${escapeSingle(part.title)}',\n      lines: [\n${lines}\n      ],\n    }`
  }).join(',\n')

  const keyPhrases = day.terms.slice(0, 10).map((term) => {
    return `    { en: '${escapeSingle(term)}', zh: '${escapeSingle('重點表達')}', example: '${escapeSingle(`${capitalizePhrase(term)} is one of the key ideas in this conversation.`)}' }`
  }).join(',\n')

  return `  {\n  weekNumber: ${weekNumber},\n  dayOfWeek: ${dayIndex},\n  date: '${date}',\n  theme: '${escapeSingle(theme)}',\n  title: '${escapeSingle(day.title)}',\n  phase: '${escapeSingle(phase)}',\n  parts: [\n${parts}\n  ],\n  keyPhrases: [\n${keyPhrases}\n  ],\n  }`
}

function replacePlaceholder(filePath, weekNumber) {
  const content = fs.readFileSync(filePath, 'utf8')

  const plan = weekPlans[weekNumber]
  if (!plan) {
    throw new Error(`Missing plan for week ${weekNumber}`)
  }

  const weekMatch = content.match(/weekNumber:\s*(\d+),[\s\S]*?date:\s*'([^']+)',[\s\S]*?theme:\s*'([^']+)',[\s\S]*?phase:\s*'([^']+)'/)
  if (!weekMatch) {
    throw new Error(`Could not parse metadata from ${filePath}`)
  }

  const baseDate = weekMatch[2]
  const theme = weekMatch[3]
  const phase = weekMatch[4]

  const generatedDays = plan.days.map((day, idx) => {
    return `\n  // Day ${idx + 2}\n${buildDayObject(weekNumber, baseDate, idx + 2, theme, phase, day)}`
  }).join(',\n')

  const generated = `${generatedDays}\n]`

  let replaced
  if (content.includes('// Day 2')) {
    replaced = content.replace(/\n\s*\/\/ Day 2[\s\S]*\n\]$/m, generated)
  } else if (content.includes('// Days 2–7 (to be generated)')) {
    replaced = content.replace(/\n\s*\/\/ Days 2–7 \(to be generated\)[\s\S]*\n\]$/m, generated)
  } else {
    return false
  }

  fs.writeFileSync(filePath, replaced)
  return true
}

function main() {
  const episodesDir = path.join(__dirname, '..', 'content', 'episodes')
  const targets = fs.readdirSync(episodesDir)
    .filter((name) => /^week-\d{2}\.ts$/.test(name))
    .map((name) => ({
      name,
      weekNumber: Number(name.match(/\d+/)[0]),
      filePath: path.join(episodesDir, name),
    }))
    .filter((item) => item.weekNumber >= 15 && item.weekNumber <= 43)

  let updated = 0
  for (const target of targets) {
    if (replacePlaceholder(target.filePath, target.weekNumber)) {
      updated += 1
      console.log(`Updated ${target.name}`)
    }
  }
  console.log(`Completed ${updated} files`)
}

main()

export interface CurriculumWeek {
  wn: number
  theme: string
  podcast: string
  phase: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
  days: string[]
}

export interface ScheduleDay {
  id: string
  label: string
  wd: string
  programDay: number
  calendarDate: string
  week: number
  dayOfWeek: number
  theme: string
  type: 'Speak' | 'Listen' | 'Review'
  topic: string
}

export const CURRICULUM: CurriculumWeek[] = [
  { wn: 1, theme: 'Fresh Starts & New Beginnings', podcast: 'Fresh Starts: Beginning Again Without the Pressure', phase: 'p1',
    days: ['What does a fresh start mean to you?', 'What habit would you like to reset right now?', 'Why do new beginnings feel powerful?', 'How do you keep momentum after the excitement fades?', 'What would a gentler version of self-improvement look like?'] },
  { wn: 2, theme: 'Morning Routines', podcast: 'A Day in the Life: Morning Habits', phase: 'p1',
    days: ['Describe your morning routine step by step.', 'What is the first thing you do after waking up?', 'Do you prefer a slow morning or a fast one? Why?', 'What do you usually eat or drink in the morning?', 'What would your ideal morning look like?'] },
  { wn: 3, theme: 'Commuting', podcast: 'Getting Around: Commute Stories', phase: 'p1',
    days: ['How do you get to work or school?', 'What do you do during your commute?', 'Describe a memorable commuting experience.', 'How does commuting affect your mood?', 'What is the best and worst part of commuting?'] },
  { wn: 4, theme: 'Home & Living Space', podcast: 'Where I Live: Describing Your Home', phase: 'p1',
    days: ['Describe where you live.', 'What does your room or apartment look like?', 'What do you like most about your home?', 'If you could change one thing about your home, what would it be?', 'Describe your ideal living space.'] },
  { wn: 5, theme: 'Traditions & Gatherings', podcast: 'Traditions We Keep: Gatherings, Rituals, and Meaning', phase: 'p1',
    days: ['What gatherings matter most in your family?', 'Describe a tradition you enjoy every year.', 'How do special occasions change the mood of daily life?', 'What makes a gathering feel meaningful instead of stressful?', 'Which customs would you like to keep or pass on?'] },
  { wn: 6, theme: 'Food & Eating Habits', podcast: 'Let\'s Eat: Food Preferences and Habits', phase: 'p1',
    days: ['What did you eat today? Describe your meals.', 'What is your favorite food and why?', 'Do you cook? Describe a dish you can make.', 'What foods do you dislike? Why?', 'Describe a memorable meal you have had.'] },
  { wn: 7, theme: 'Weather & Seasons', podcast: 'The Weather Today: Talking About Climate', phase: 'p1',
    days: ['Describe the weather where you live.', 'What is your favorite season and why?', 'How does weather affect your mood?', 'Describe a day with extreme weather.', 'How do you dress for different weather?'] },
  { wn: 8, theme: 'Shopping & Money', podcast: 'Spending Habits: How We Buy Things', phase: 'p1',
    days: ['Describe your shopping habits.', 'What was the last thing you bought?', 'Do you prefer online or in-store shopping?', 'How do you decide if something is worth buying?', 'Describe something you have been saving up for.'] },
  { wn: 9, theme: 'Health & Body', podcast: 'Taking Care of Yourself: Health Routines', phase: 'p1',
    days: ['How do you take care of your health?', 'Describe your exercise habits.', 'What do you do when you feel sick?', 'How important is sleep to you?', 'What is one healthy habit you want to build?'] },
  { wn: 10, theme: 'Daily Schedules', podcast: 'My Week: Talking About Time and Schedules', phase: 'p1',
    days: ['Walk me through a typical weekday.', 'How do you organize your time?', 'What is the busiest part of your week?', 'How do you wind down at the end of the day?', 'What is one thing you wish you had more time for?'] },
  { wn: 11, theme: 'Friendship', podcast: 'Good Friends: What Makes a Great Friendship', phase: 'p2',
    days: ['Describe a close friend of yours.', 'How did you meet your best friend?', 'What do you and your friends do together?', 'What makes someone a good friend?', 'Describe a time a friend helped you.'] },
  { wn: 12, theme: 'Family', podcast: 'Family Life: Talking About the People We Grew Up With', phase: 'p2',
    days: ['Describe your family.', 'What is your relationship with your family like?', 'What is a family tradition you have?', 'How has your family influenced who you are?', 'Describe a happy family memory.'] },
  { wn: 13, theme: 'Colleagues & Teamwork', podcast: 'Working Together: Office Relationships', phase: 'p2',
    days: ['Describe your workplace or team.', 'What makes a good colleague?', 'Describe a time you worked well with others.', 'How do you handle disagreements at work?', 'What do you appreciate most about your coworkers?'] },
  { wn: 14, theme: 'Social Situations', podcast: 'Being Social: Navigating Gatherings and Events', phase: 'p2',
    days: ['Describe a social event you attended recently.', 'Are you more introverted or extroverted?', 'How do you feel when meeting new people?', 'Describe a time you felt out of place socially.', 'What is your idea of a perfect social gathering?'] },
  { wn: 15, theme: 'Personality & Character', podcast: 'Who Are You: Talking About Personality Types', phase: 'p2',
    days: ['How would you describe your own personality?', 'What are your strongest traits?', 'What is one thing you would like to change about yourself?', 'How has your personality changed over time?', 'Describe someone whose personality you admire.'] },
  { wn: 16, theme: 'Communication Styles', podcast: 'How We Talk: Different Ways of Communicating', phase: 'p2',
    days: ['How do you prefer to communicate: text, call, or face to face?', 'Describe a time communication went wrong.', 'How do you give feedback to others?', 'How do you handle a difficult conversation?', 'What makes someone a good communicator?'] },
  { wn: 17, theme: 'Helping Others', podcast: 'Lending a Hand: Acts of Kindness and Support', phase: 'p2',
    days: ['Describe a time you helped someone.', 'How do you support friends going through hard times?', 'What is the most helpful thing someone has done for you?', 'How do you ask for help when you need it?', 'Why is it sometimes hard to accept help?'] },
  { wn: 18, theme: 'Conflict & Resolution', podcast: 'Working It Out: How We Handle Disagreements', phase: 'p2',
    days: ['Describe a conflict you had and how it was resolved.', 'How do you handle anger?', 'What is your approach when you disagree with someone?', 'Describe a time you had to apologize.', 'What does a healthy argument look like to you?'] },
  { wn: 19, theme: 'Your Job & Role', podcast: 'What I Do: Explaining Your Job to Anyone', phase: 'p3',
    days: ['Explain your job in simple terms.', 'What does a typical workday look like?', 'What do you enjoy most about your work?', 'What is the hardest part of your job?', 'How did you end up in your current role?'] },
  { wn: 20, theme: 'Meetings & Discussions', podcast: 'Let\'s Meet: Navigating Work Meetings', phase: 'p3',
    days: ['Describe a meeting you had recently.', 'What makes a meeting productive?', 'How do you prepare for an important meeting?', 'Describe a time a meeting did not go well.', 'How do you contribute in group discussions?'] },
  { wn: 21, theme: 'Deadlines & Pressure', podcast: 'Under Pressure: Managing Stress at Work', phase: 'p3',
    days: ['How do you handle tight deadlines?', 'Describe a stressful work situation and how you managed it.', 'What do you do when you feel overwhelmed?', 'How do you prioritize when everything feels urgent?', 'What helps you stay calm under pressure?'] },
  { wn: 22, theme: 'Problem Solving', podcast: 'Figuring It Out: How We Tackle Problems', phase: 'p3',
    days: ['Describe a problem you solved recently.', 'What is your approach to solving difficult problems?', 'Describe a time your first solution did not work.', 'How do you decide between multiple options?', 'What skill helps you solve problems better?'] },
  { wn: 23, theme: 'Career Goals', podcast: 'Where I\'m Headed: Talking About Career Ambitions', phase: 'p3',
    days: ['Where do you see yourself in five years?', 'What is a skill you want to develop this year?', 'Describe your ideal job.', 'What motivates you to keep improving?', 'What is one career goal you are working toward right now?'] },
  { wn: 24, theme: 'Learning & Growth', podcast: 'Always Learning: How We Grow and Improve', phase: 'p3',
    days: ['How do you learn best?', 'Describe something difficult you taught yourself.', 'What is something you have recently learned?', 'How do you stay motivated when learning is hard?', 'What subject or skill do you wish you had started learning earlier?'] },
  { wn: 25, theme: 'Success & Failure', podcast: 'Wins and Losses: What We Learn From Both', phase: 'p3',
    days: ['Describe a success you are proud of.', 'Describe a failure and what you learned from it.', 'How do you define success?', 'How do you handle criticism?', 'What does resilience mean to you?'] },
  { wn: 26, theme: 'Work-Life Balance', podcast: 'On and Off: Finding Balance Between Work and Rest', phase: 'p3',
    days: ['How do you separate work life from personal life?', 'What do you do to recharge after a hard week?', 'Do you think you have a good work-life balance?', 'What boundaries do you set around work?', 'What would a perfectly balanced week look like for you?'] },
  { wn: 27, theme: 'Travel', podcast: 'Going Places: Travel Experiences and Dreams', phase: 'p4',
    days: ['Describe a place you visited that left an impression.', 'What is your travel style?', 'How do you prepare for a trip?', 'Describe a travel experience that did not go as planned.', 'Where would you go if you could travel anywhere?'] },
  { wn: 28, theme: 'Photography & Visual Art', podcast: 'Capturing the World: Photography as a Hobby', phase: 'p4',
    days: ['How did you get into photography?', 'What do you like to photograph?', 'Describe a photo you are proud of.', 'How has photography changed how you see the world?', 'What is the difference between a good photo and a great one?'] },
  { wn: 29, theme: 'Music & Podcasts', podcast: 'Soundtrack of Life: How Music and Audio Shape Our Days', phase: 'p4',
    days: ['What music do you listen to and when?', 'Describe a song that means something to you.', 'What podcasts or audio content do you enjoy?', 'How does music affect your mood?', 'Could you live without music? Why or why not?'] },
  { wn: 30, theme: 'Reading & Writing', podcast: 'Words on Pages: The Joy of Reading and Writing', phase: 'p4',
    days: ['Do you enjoy reading? What do you read?', 'Describe a book that influenced you.', 'Do you write? What do you write about?', 'How has reading changed your thinking?', 'What is the difference between reading for work and reading for pleasure?'] },
  { wn: 31, theme: 'Pets & Animals', podcast: 'Animal Companions: Life With Pets', phase: 'p4',
    days: ['Describe your pet or an animal you love.', 'How has having a pet changed your life?', 'What is the funniest or strangest thing your pet has done?', 'What do pets teach us about responsibility?', 'Would you recommend having a pet? Why or why not?'] },
  { wn: 32, theme: 'Hobbies & Collections', podcast: 'Side Passions: Hobbies That Define Us', phase: 'p4',
    days: ['Describe a hobby you are passionate about.', 'How did you first get interested in it?', 'What do you get from spending time on your hobby?', 'Describe something you collect or would like to collect.', 'How do hobbies balance out the rest of your life?'] },
  { wn: 33, theme: 'Nature & Outdoors', podcast: 'Outside Again: What Nature Gives Back', phase: 'p4',
    days: ['How much time do you spend outdoors?', 'Describe a place in nature that helps you relax.', 'What outdoor activity do you enjoy most?', 'How does being outside affect your mood?', 'What kind of natural environment do you feel most connected to?'] },
  { wn: 34, theme: 'Sports & Fitness', podcast: 'Moving Your Body: Fitness, Motivation, and Habit', phase: 'p4',
    days: ['What kind of exercise do you enjoy, if any?', 'Describe a fitness routine you have tried.', 'What makes it hard to stay active?', 'How do you feel after a good workout?', 'What is one physical goal you would like to reach?'] },
  { wn: 35, theme: 'Technology & Everyday Life', podcast: 'Daily Tech: The Tools We Rely On', phase: 'p5',
    days: ['What technology do you use every day?', 'What app or device saves you the most time?', 'Describe a piece of technology you could not live without.', 'When does technology make life worse instead of better?', 'How has technology changed your routine over the last few years?'] },
  { wn: 36, theme: 'Artificial Intelligence', podcast: 'The AI Age: Understanding and Living With AI', phase: 'p5',
    days: ['What do you know about AI?', 'How do you use AI in your work or life?', 'What excites you about AI?', 'What concerns you about AI?', 'How do you think AI will change your industry in five years?'] },
  { wn: 37, theme: 'Health & Mental Wellbeing', podcast: 'Mind Matters: Mental Health and Emotional Wellness', phase: 'p5',
    days: ['How do you take care of your mental health?', 'Describe a time you felt burned out.', 'What helps you manage anxiety or stress?', 'How comfortable are you talking about emotions?', 'What does good mental health look like to you?'] },
  { wn: 38, theme: 'Environment & Sustainability', podcast: 'Our Planet: Talking About Climate and Responsibility', phase: 'p5',
    days: ['How do you think about your environmental impact?', 'What eco-friendly habits do you already have?', 'Describe a change you made for the environment.', 'How do you feel about climate change?', 'What could individuals do better for the planet?'] },
  { wn: 39, theme: 'Money & Financial Goals', podcast: 'Talking Money: Financial Habits and Goals', phase: 'p5',
    days: ['How do you manage your money?', 'What is your approach to saving?', 'Describe a financial goal you have.', 'What did you learn about money growing up?', 'How do you think about spending versus saving?'] },
  { wn: 40, theme: 'Change & Transitions', podcast: 'Life Changes: Navigating Transitions and New Chapters', phase: 'p5',
    days: ['Describe a major change in your life.', 'How do you adapt to new situations?', 'What is the hardest change you have experienced?', 'How do you feel about uncertainty?', 'What are you currently transitioning through?'] },
  { wn: 41, theme: 'Values & Beliefs', podcast: 'What I Stand For: Personal Values and Principles', phase: 'p5',
    days: ['What values are most important to you?', 'Describe a belief you hold strongly.', 'Has your worldview changed significantly? How?', 'What is something you used to believe but no longer do?', 'How do your values influence your decisions?'] },
  { wn: 42, theme: 'The Future', podcast: 'Looking Ahead: Dreams, Plans, and What Comes Next', phase: 'p5',
    days: ['Where do you hope to be in ten years?', 'What are you most excited about for the future?', 'What are you most worried about for the future?', 'What is one dream you have not pursued yet?', 'How do you balance planning and living in the moment?'] },
  { wn: 43, theme: 'Looking Back & Moving Forward', podcast: 'Full Circle: Reflection, Gratitude, and Next Steps', phase: 'p5',
    days: ['What is the most important thing you learned this year?', 'What are you most proud of from this year?', 'What would you tell yourself at the start of this year?', 'What habit do you want to carry into your next chapter?', 'How has your English changed over time?'] },
  { wn: 44, theme: 'Creativity & Self-Expression', podcast: 'Finding Your Creative Voice', phase: 'p6',
    days: ['Do you consider yourself a creative person? Why or why not?', 'How do you express yourself creatively in daily life?', 'Describe a time you created something you were proud of.', 'What blocks your creativity, and how do you overcome it?', 'What is something creative you have always wanted to try?'] },
  { wn: 45, theme: 'Leadership & Influence', podcast: 'What Makes a Real Leader', phase: 'p6',
    days: ['Who has been the most influential leader in your life?', 'What qualities make someone a truly effective leader?', 'Have you ever led a team or project? Describe the experience.', 'How do you influence people without formal authority?', 'What is the difference between a leader and a boss?'] },
  { wn: 46, theme: 'Community & Giving Back', podcast: 'The Power of Community', phase: 'p6',
    days: ['What communities do you belong to and how do they support you?', 'Have you ever volunteered or helped your community? Share the experience.', 'What is the most pressing issue in your local community?', 'How can one person make a meaningful difference to others?', 'What would your ideal community look like?'] },
  { wn: 47, theme: 'Cross-Cultural Understanding', podcast: 'What Is Culture, Anyway?', phase: 'p6',
    days: ['How would you describe your own culture to a foreigner?', 'Describe a cultural misunderstanding you experienced or witnessed.', 'What have you learned from people with very different backgrounds?', 'How has living or working with people from other cultures changed you?', 'What cultural value do you wish more people shared globally?'] },
  { wn: 48, theme: 'Language & Identity', podcast: 'Who Are You When You Speak?', phase: 'p6',
    days: ['How does switching languages change how you think or feel?', 'What is something you can express in Chinese but struggle to say in English?', 'How has learning English changed your sense of self?', 'Do you feel like a different person when you speak English?', 'What does being bilingual mean to you and your identity?'] },
  { wn: 49, theme: 'Rest & Renewal', podcast: 'Why Rest Is Productive', phase: 'p6',
    days: ['How do you truly rest, not just stop working?', 'What is the most restorative thing you do for yourself?', 'Do you feel guilty about resting? Why or why not?', 'Describe a time when slowing down helped you achieve more.', 'What would a truly restful week look like for you?'] },
  { wn: 50, theme: 'Gratitude & Appreciation', podcast: 'Showing Thanks in Real Life', phase: 'p6',
    days: ['What are you most grateful for that you rarely talk about?', 'Has a gratitude practice ever changed your mood or outlook?', 'Who in your life deserves more thanks, and what would you say?', 'What hardship are you now grateful for?', 'How do you express appreciation to people who matter to you?'] },
  { wn: 51, theme: 'Goals & Intentions', podcast: 'Goals That Fit Real Life', phase: 'p6',
    days: ['What is one goal you have been putting off, and why?', 'How do you set goals in a way that actually works for you?', 'What is the difference between a goal and an intention?', 'Describe a goal you achieved that changed you unexpectedly.', 'What would you pursue if you knew you could not fail?'] },
  { wn: 52, theme: 'Year in Review', podcast: 'Looking Back to Move Forward', phase: 'p6',
    days: ['What were the three most significant moments of your year?', 'What did you learn about yourself this year that surprised you?', 'What relationship changed most meaningfully this year?', 'What did you let go of this year, and how did it feel?', 'What one word would you use to describe the year you had?'] },
  { wn: 53, theme: 'New Beginnings', podcast: 'Starting a New Chapter', phase: 'p6',
    days: ['What does starting fresh mean to you?', 'Describe a new beginning in your life that turned out better than expected.', 'What is one thing you want to commit to in your next chapter?', 'How do you say goodbye to chapters that are ending?', 'What does your best possible future self look like one year from now?'] },
]

export const TOTAL_PROGRAM_DAYS = 365

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function getWeekLength(weekNumber: number): number {
  return weekNumber === 1 || weekNumber === 53 ? 4 : 7
}

export function formatLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isLocalDate(value: string): boolean {
  return LOCAL_DATE_PATTERN.test(value)
}

export function parseLocalDate(localDate: string): Date {
  const [year, month, day] = localDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function generateSchedule(startDateInput: string | Date): ScheduleDay[] {
  const startDate = typeof startDateInput === 'string' ? parseLocalDate(startDateInput) : startDateInput
  const days: ScheduleDay[] = []
  let dayOffset = 0

  for (const week of CURRICULUM) {
    const weekLength = getWeekLength(week.wn)

    for (let d = 0; d < weekLength; d++) {
      const date = new Date(startDate.getTime() + dayOffset * 86400000)
      const dayOfWeek = d + 1
      const programDay = dayOffset + 1
      const calendarDate = formatLocalDate(date)

      let type: 'Speak' | 'Listen' | 'Review'
      if (d === weekLength - 1) type = 'Review'
      else if (d === weekLength - 2) type = 'Listen'
      else type = 'Speak'

      const topic =
        type === 'Review' ? `Review: ${week.theme}`
        : type === 'Listen' ? week.podcast
        : (week.days[d] ?? week.theme)

      days.push({
        id: `day-${String(programDay).padStart(3, '0')}`,
        label: `${calendarDate.slice(5, 7)}/${calendarDate.slice(8, 10)}`,
        wd: WEEKDAY_NAMES[date.getDay()],
        programDay,
        calendarDate,
        week: week.wn,
        dayOfWeek,
        theme: week.theme,
        type,
        topic,
      })

      dayOffset++
    }
  }

  return days
}

export function getWeekDays(schedule: ScheduleDay[], weekNumber: number): ScheduleDay[] {
  return schedule.filter((day) => day.week === weekNumber)
}

export function getCurrentScheduleEntry(schedule: ScheduleDay[], date = new Date()): ScheduleDay | null {
  const today = formatLocalDate(date)
  return schedule.find((day) => day.calendarDate === today) ?? null
}

export const PHASE_LABELS: Record<string, string> = {
  p1: 'Phase 1 — Everyday Basics',
  p2: 'Phase 2 — People & Relationships',
  p3: 'Phase 3 — Work & Ambition',
  p4: 'Phase 4 — Interests & Lifestyle',
  p5: 'Phase 5 — Society & Reflection',
  p6: 'Phase 6 — Mastery & Meaning',
}

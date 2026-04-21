const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = process.cwd()
const EPISODES_DIR = path.join(ROOT, 'content', 'episodes')

const counters = Object.create(null)

function nextVariant(key, builders) {
  const index = counters[key] || 0
  counters[key] = index + 1
  return builders[index % builders.length]
}

function loadWeekFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const script = source
    .replace(/^import[^\n]*\n\n/, '')
    .replace(/export const WEEK_\d{2}: Episode\[\] = /, 'module.exports = ')
  const context = { module: { exports: null } }
  vm.runInNewContext(script, context, { filename: filePath })
  return context.module.exports || []
}

function saveWeekFile(filePath, episodes) {
  const week = path.basename(filePath).match(/\d+/)?.[0]
  const varName = `WEEK_${week}`
  const content = `import { Episode } from '../types'\n\nexport const ${varName}: Episode[] = ${JSON.stringify(episodes, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

function swapQuotedPrefix(key, current, patterns, builders) {
  for (const pattern of patterns) {
    const match = current.match(pattern)
    if (!match) continue
    const quote = match[1]
    const sentence = match[2]
    const tail = match[3] || ''
    const builder = nextVariant(key, builders)
    return builder(quote, sentence, tail)
  }
  return current
}

function splitEndingPunctuation(text) {
  const trimmed = text.trim()
  const match = trimmed.match(/^(.*?)([.!?])?$/)
  return {
    core: (match?.[1] || '').trim(),
    punctuation: match?.[2] || '',
  }
}

function chooseIndefiniteArticle(phrase) {
  const word = (phrase || '').trim().toLowerCase().split(/\s+/)[0] || ''
  if (!word) return 'a'
  if (/^(honest|hour|honor|heir)/.test(word)) return 'an'
  if (/^(user|use|useful|usual|uni([^nmd]|$)|euro|one|once|ubiq)/.test(word)) return 'a'
  if (/^[aeiou]/.test(word)) return 'an'
  return 'a'
}

function withIndefiniteArticle(phrase) {
  const { core, punctuation } = splitEndingPunctuation(phrase)
  if (!core) return phrase
  if (/^(a|an|the|this|that|these|those|my|your|our|their|its|some|more|less|another)\b/i.test(core)) {
    return `${core}${punctuation}`
  }
  const article = chooseIndefiniteArticle(core)
  return `${article} ${core}${punctuation}`
}

function rewriteQuestion(line) {
  const en = line.en

  let match = en.match(/^What English can I use if I want to (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `What sounds natural if I want to ${value}?`,
      (value) => `How would I say it if I wanted to ${value}?`,
      (value) => `If I wanted to ${value}, what would sound natural in English?`,
      (value) => `What is a natural way to say it if I want to ${value}?`,
      (value) => `How could I phrase it if I wanted to ${value}?`,
      (value) => `What would be a natural English way to ${value}?`,
    ]
    line.en = nextVariant('q-want', builders)(tail)
    return true
  }

  match = en.match(/^What English can I use when I want to (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `What sounds natural when I want to ${value}?`,
      (value) => `How would I say it when I want to ${value}?`,
      (value) => `If I want to ${value}, what would feel natural in English?`,
      (value) => `What is a natural way to say it when I want to ${value}?`,
      (value) => `How could I phrase it when I want to ${value}?`,
    ]
    line.en = nextVariant('q-when', builders)(tail)
    return true
  }

  match = en.match(/^What English can I use if I need to say, (["'])(.+)\1\?$/)
  if (match) {
    const quote = match[1]
    const sentence = match[2]
    const builders = [
      (q, value) => `How could I say, ${q}${value}${q}, in a natural way?`,
      (q, value) => `If I need to say, ${q}${value}${q}, what sounds natural?`,
      (q, value) => `What would be a natural way to say, ${q}${value}${q}?`,
      (q, value) => `How would you naturally say, ${q}${value}${q}?`,
      (q, value) => `If that is what I mean, how could I phrase ${q}${value}${q}?`,
    ]
    line.en = nextVariant('q-need-say', builders)(quote, sentence)
    return true
  }

  match = en.match(/^What can I say in English when (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `How would I say it in English when ${value}?`,
      (value) => `What would sound natural in English when ${value}?`,
      (value) => `If ${value}, how could I put it in English?`,
      (value) => `What is a natural English way to say it when ${value}?`,
      (value) => `How do people usually say it in English when ${value}?`,
      (value) => `What would I actually say in English when ${value}?`,
      (value) => `If that is the situation, how could I say it in English when ${value}?`,
      (value) => `How could I express it in English when ${value}?`,
    ]
    line.en = nextVariant('q-what-can-i-say-when', builders)(tail)
    return true
  }

  match = en.match(/^What can I say in English if I want to (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `How would I say it in English if I want to ${value}?`,
      (value) => `What would sound natural in English if I want to ${value}?`,
      (value) => `If I want to ${value}, how could I put it in English?`,
      (value) => `What is a natural English way to say it if I want to ${value}?`,
      (value) => `How do people usually say it if they want to ${value}?`,
      (value) => `What would I actually say in English if I want to ${value}?`,
      (value) => `If that is what I want to do, how could I say it in English?`,
      (value) => `How could I express it in English if I want to ${value}?`,
    ]
    line.en = nextVariant('q-what-can-i-say-if-want', builders)(tail)
    return true
  }

  match = en.match(/^What can I say in English if (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `How would I say it in English if ${value}?`,
      (value) => `What would sound natural in English if ${value}?`,
      (value) => `If ${value}, how could I put it in English?`,
      (value) => `What is a natural English way to say it if ${value}?`,
      (value) => `How could I express it in English if ${value}?`,
    ]
    line.en = nextVariant('q-what-can-i-say-if', builders)(tail)
    return true
  }

  match = en.match(/^Can you give me (.+)\?$/)
  if (match) {
    const tail = match[1]
    const builders = [
      (value) => `What would ${value} look like in practice?`,
      (value) => `Could you make that concrete with ${value}?`,
      (value) => `Can you make that more concrete with ${value}?`,
      (value) => `What would ${value} look like in real life?`,
      (value) => `Could you show me ${value} in a real situation?`,
      (value) => `Can you walk me through ${value} in practice?`,
    ]
    line.en = nextVariant('q-can-you-give-me', builders)(tail)
    return true
  }

  return false
}

function rewriteTeachingWrapper(line) {
  const original = line.en

  const thirdPassQuotedRewrite = swapQuotedPrefix(
    'teach-third-pass',
    original,
    [
      /^A more grounded version would be,\s*(["'])(.+)\1(.*)$/,
      /^Another way to put it is,\s*(["'])(.+)\1(.*)$/,
      /^A second option would be,\s*(["'])(.+)\1(.*)$/,
    ],
    [
      (q, sentence, tail) => `You could also say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A steadier way to put it is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `If you want a more grounded version, try ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `Another natural option is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A more everyday version would be ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You might also say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A clearer option here is ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `One more way to say it is ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `Another sentence that works is ${q}${sentence}${q}${tail}`,
    ]
  )
  if (thirdPassQuotedRewrite !== original) {
    line.en = thirdPassQuotedRewrite
    return true
  }

  const secondPassQuotedRewrite = swapQuotedPrefix(
    'teach-second-pass',
    original,
    [
      /^One natural way to put it is,\s*(["'])(.+)\1(.*)$/,
      /^A clear version would be,\s*(["'])(.+)\1(.*)$/,
      /^You could phrase it like this:\s*(["'])(.+)\1(.*)$/,
      /^A natural line here would be,\s*(["'])(.+)\1(.*)$/,
      /^You can put it this way:\s*(["'])(.+)\1(.*)$/,
    ],
    [
      (q, sentence, tail) => `You could say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A natural way to say it is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `One simple version is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You might put it like this: ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A good line here is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `If you want a clear sentence, try ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `I would probably say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `One option would be, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A more everyday version is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You can also go with ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A clean way to say it is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `One sentence that works well is ${q}${sentence}${q}${tail}`,
    ]
  )
  if (secondPassQuotedRewrite !== original) {
    line.en = secondPassQuotedRewrite
    return true
  }

  const canUseRewrite = original.match(/^When you want (.+), you can use, (["'])(.+)\2(.*)$/)
  if (canUseRewrite) {
    const qualifier = canUseRewrite[1]
    const quote = canUseRewrite[2]
    const sentence = canUseRewrite[3]
    const tail = canUseRewrite[4] || ''
    const builders = [
      (value, q, text, rest) => `When you want ${value}, you can use ${q}${text}${q}${rest}`,
      (value, q, text, rest) => `If you want ${value}, ${q}${text}${q}${rest} works well.`,
      (value, q, text, rest) => `${q}${text}${q}${rest} works well when you want ${value}.`,
      (value, q, text, rest) => `A natural line when you want ${value} is ${q}${text}${q}${rest}`,
    ]
    line.en = nextVariant('teach-can-use-variant', builders)(qualifier, quote, sentence, tail)
    return true
  }

  const simplerRewrite = original.match(/^If you want something simpler, (?:you could say|another option is|a natural line is|try), (["'])(.+)\1(.*)$/)
  if (simplerRewrite) {
    const quote = simplerRewrite[1]
    const sentence = simplerRewrite[2]
    const tail = simplerRewrite[3] || ''
    const builders = [
      (q, text, rest) => `For a simpler version, you could say, ${q}${text}${q}${rest}`,
      (q, text, rest) => `A plainer way to put it is, ${q}${text}${q}${rest}`,
      (q, text, rest) => `If you want to make it more everyday, try, ${q}${text}${q}${rest}`,
      (q, text, rest) => `A shorter version would be, ${q}${text}${q}${rest}`,
      (q, text, rest) => `If you want to keep it simple, ${q}${text}${q}${rest} works well.`,
      (q, text, rest) => `An easier everyday line would be, ${q}${text}${q}${rest}`,
    ]
    line.en = nextVariant('teach-simpler-variant', builders)(quote, sentence, tail)
    return true
  }

  const answerRewrite = swapQuotedPrefix(
    'teach-you-can-say',
    original,
    [
      /^(?:Exactly\. )?You can say(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^(?:Exactly\. )?You can also say(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^Then say(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^Try(?::|,)\s*(["'])(.+)\1(.*)$/,
    ],
    [
      (q, sentence, tail) => `You could say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `One natural way to put it is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A clear version would be, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You could phrase it like this: ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A natural line here would be, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You can put it this way: ${q}${sentence}${q}${tail}`,
    ]
  )
  if (answerRewrite !== original) {
    line.en = answerRewrite
    return true
  }

  const anotherRewrite = swapQuotedPrefix(
    'teach-another',
    original,
    [
      /^(?:Exactly\. )?Another useful one is(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^(?:Exactly\. )?Another one is(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^(?:Exactly\. )?A useful sentence is(?::|,)\s*(["'])(.+)\1(.*)$/,
      /^(?:Exactly\. )?A useful line is(?::|,)\s*(["'])(.+)\1(.*)$/,
    ],
    [
      (q, sentence, tail) => `You could also say, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `Another natural line is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A more grounded version would be, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `You can also try, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `Another way to put it is, ${q}${sentence}${q}${tail}`,
      (q, sentence, tail) => `A second option would be, ${q}${sentence}${q}${tail}`,
    ]
  )
  if (anotherRewrite !== original) {
    line.en = anotherRewrite
    return true
  }

  const andIfYouWant = original.match(/^(?:Exactly\. )?And if you want (.+?), (?:say|try|use)(?::|,)\s*(["'])(.+)\2(.*)$/)
  if (andIfYouWant) {
    const qualifier = andIfYouWant[1]
    const quote = andIfYouWant[2]
    const sentence = andIfYouWant[3]
    const tail = andIfYouWant[4] || ''
    const builders = [
      (value, q, text, rest) => `If you want ${value}, you could say, ${q}${text}${q}${rest}`,
      (value, q, text, rest) => `You could use ${q}${text}${q}${rest} if you want ${value}.`,
      (value, q, text, rest) => `${q}${text}${q}${rest} also works if you want ${value}.`,
      (value, q, text, rest) => `Another option, if you want ${value}, is ${q}${text}${q}${rest}`,
      (value, q, text, rest) => `If you want ${value}, try, ${q}${text}${q}${rest}`,
      (value, q, text, rest) => `When you want ${value}, you can use, ${q}${text}${q}${rest}`,
      (value, q, text, rest) => `A natural choice here, if you want ${value}, is ${q}${text}${q}${rest}`,
    ]
    line.en = nextVariant('teach-if-you-want', builders)(qualifier, quote, sentence, tail)
    return true
  }

  return false
}

function rewriteShortFeedback(line) {
  const en = line.en

  const exactRepairs = new Map([
    ['That comes across as a very better goal than fake harmony.', 'That sounds like a much better goal than fake harmony.'],
    ['That feels like a very relief to hear put into words.', 'That is a real relief to hear put into words.'],
    ['That feels like a very leader sentence.', 'That sounds like a real leader sentence.'],
  ])

  if (exactRepairs.has(en)) {
    line.en = exactRepairs.get(en)
    return true
  }

  let match = en.match(/^That comes across as (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That strikes me as ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That feels more like ${value}`,
    ]
    line.en = nextVariant('feedback-comes-across', builders)(rest)
    return true
  }

  match = en.match(/^That reads as (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That feels more like ${value}`,
      (value) => `That lands as ${value}`,
    ]
    line.en = nextVariant('feedback-reads-as', builders)(rest)
    return true
  }

  match = en.match(/^That strikes me as (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That feels more like ${value}`,
      (value) => `That lands as ${value}`,
    ]
    line.en = nextVariant('feedback-strikes-me-as', builders)(rest)
    return true
  }

  match = en.match(/^That lands like (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That feels more like ${value}`,
      (value) => `That lands as ${value}`,
    ]
    line.en = nextVariant('feedback-lands-like', builders)(rest)
    return true
  }

  match = en.match(/^That feels like a very (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That strikes me as ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That feels more like ${value}`,
    ]
    line.en = nextVariant('feedback-feels-like-very', builders)(rest)
    return true
  }

  match = en.match(/^That sounds like a very (.+)$/)
  if (match) {
    const rest = withIndefiniteArticle(match[1])
    const builders = [
      (value) => `That feels like ${value}`,
      (value) => `That comes through as ${value}`,
      (value) => `That sounds like ${value}`,
      (value) => `That feels more like ${value}`,
      (value) => `That lands as ${value}`,
    ]
    line.en = nextVariant('feedback-sounds-like-very', builders)(rest)
    return true
  }

  const exactFeedback = new Map([
    ['That sounds very clear.', [
      'That comes through very clearly.',
      'That lands in a very clear way.',
      'That sounds crisp and easy to follow.',
      'That feels very clean on the ear.',
    ]],
    ['That one is beautiful.', [
      'That line is beautiful.',
      'That lands beautifully.',
      'There is something beautiful about that one.',
      'That is a beautiful line.',
    ]],
    ['That one is very easy to use.', [
      'That one would be very easy to use in real life.',
      'That feels very usable right away.',
      'That one would slip easily into conversation.',
      'That sounds easy to carry into daily speech.',
    ]],
    ['I would agree with that.', [
      'I would go with that too.',
      'I think I would agree with that as well.',
      'That is probably where I would land too.',
      'I would lean the same way.',
    ]],
    ['I would put it that way too.', [
      'I would probably phrase it that way too.',
      'That is close to how I would put it as well.',
      'I think I would say it in almost the same way.',
      'That is how I would frame it too.',
    ]],
    ['That feels like a good place to pause.', [
      'That feels like a strong place to leave it for now.',
      'I think that is a good point to stop on for today.',
      'That feels like the right line to rest on for a bit.',
      'I want to leave that thought hanging there for a moment.',
    ]],
    ['That feels like the cleanest place to pause.', [
      'That feels like the cleanest point to stop on.',
      'I think that is the neatest place to pause for now.',
      'That feels like the most natural place to leave it.',
      'I would stop there while the point is still ringing.',
    ]],
    ['Let us stop on that thought.', [
      'Let us leave the conversation there for a minute.',
      'I want to stop with that thought still in the air.',
      'Let us let that point sit for a moment.',
      'We can leave it on that note for now.',
    ]],
    ['That is enough for today.', [
      'That feels like enough for today.',
      'I think we can leave it there for today.',
      'That is probably a good stopping point for today.',
      'We have probably reached a good pause for today.',
    ]],
    ['We can end there for now.', [
      'We can leave it there for now.',
      'I think that is where I would stop for now.',
      'That feels like the right place to end for the moment.',
      'Let us leave the conversation there for now.',
    ]],
    ['I would leave it right there.', [
      'I would probably leave it there.',
      'I think I would stop right there too.',
      'That is where I would leave it as well.',
      'I would let that point stand on its own.',
    ]],
    ['That is where I would pause.', [
      'That is probably where I would pause too.',
      'I think that is exactly where I would stop.',
      'That feels like the point where I would pause.',
      'I would pause right there and let that sit.',
    ]],
  ])

  if (exactFeedback.has(en)) {
    line.en = nextVariant(`feedback-exact:${en}`, exactFeedback.get(en))
    return true
  }

  if (line.speaker !== 'b') return false

  match = en.match(/^I like that because (.+)$/)
  if (match) {
    const rest = match[1]
    const builders = [
      (value) => `What I like about it is that ${value}`,
      (value) => `That works for me because ${value}`,
      (value) => `I like it because ${value}`,
      (value) => `What lands for me is that ${value}`,
      (value) => `The reason I like it is that ${value}`,
      (value) => `I respond to that because ${value}`,
    ]
    line.en = nextVariant('feedback-like-because', builders)(rest)
    return true
  }

  if (en.length <= 95) {
    match = en.match(/^That is such a (.+)$/)
    if (match) {
      const rest = match[1]
      const builders = [
        (value) => `That really is a ${value}`,
        (value) => `That is a really ${value}`,
        (value) => `That feels like ${withIndefiniteArticle(value)}`,
        (value) => `That is honestly a ${value}`,
        (value) => `That sounds like ${withIndefiniteArticle(value)}`,
        (value) => `That is a genuinely ${value}`,
      ]
      line.en = nextVariant('feedback-such-a', builders)(rest)
      return true
    }

    match = en.match(/^That is such an (.+)$/)
    if (match) {
      const rest = match[1]
      const builders = [
        (value) => `That really is an ${value}`,
        (value) => `That is an especially ${value}`,
        (value) => `That feels like an ${value}`,
        (value) => `That is honestly an ${value}`,
        (value) => `That comes across as an ${value}`,
        (value) => `That is a remarkably ${value}`,
      ]
      line.en = nextVariant('feedback-such-an', builders)(rest)
      return true
    }

    match = en.match(/^That is a very (.+)$/)
    if (match) {
      const rest = match[1]
      const builders = [
        (value) => `That feels like a particularly ${value}`,
        (value) => `That is a genuinely ${value}`,
        (value) => `That sounds like ${withIndefiniteArticle(value)}`,
        (value) => `That is an unusually ${value}`,
        (value) => `That feels especially ${value}`,
      ]
      line.en = nextVariant('feedback-a-very', builders)(rest)
      return true
    }
  }

  return false
}

function rewriteLine(line) {
  return rewriteQuestion(line) || rewriteTeachingWrapper(line) || rewriteShortFeedback(line)
}

function main() {
  const weekFiles = fs.readdirSync(EPISODES_DIR)
    .filter((name) => /^week-\d{2}\.ts$/.test(name))
    .sort()

  let changedLines = 0
  const dirtyFiles = []

  for (const fileName of weekFiles) {
    const filePath = path.join(EPISODES_DIR, fileName)
    const episodes = loadWeekFile(filePath)
    let fileChanged = false

    for (const episode of episodes) {
      for (const part of episode.parts || []) {
        for (const line of part.lines || []) {
          if (rewriteLine(line)) {
            changedLines += 1
            fileChanged = true
          }
        }
      }
    }

    if (fileChanged) {
      saveWeekFile(filePath, episodes)
      dirtyFiles.push(fileName)
    }
  }

  console.log(`Updated ${changedLines} lines across ${dirtyFiles.length} week files.`)
  if (dirtyFiles.length) {
    console.log(dirtyFiles.join('\n'))
  }
}

main()

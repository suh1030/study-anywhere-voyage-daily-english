/**
 * generate-audio.ts
 *
 * Generates TTS audio for all episode lines using OpenAI TTS API,
 * then uploads to Supabase Storage bucket "episode-audio".
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/generate-audio.ts
 *
 * File naming: tts/w{week}_d{day}_p{partIndex}_l{lineIndex}.mp3
 * Public URL:  {SUPABASE_URL}/storage/v1/object/public/episode-audio/tts/w{week}_d{day}_p{partIndex}_l{lineIndex}.mp3
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { ALL_EPISODES } from '../content/episodes/index'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ioosxzbdkscllgesmeqw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY')
  process.exit(1)
}
if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Speaker voice mapping — nova (female) for 'a', onyx (male) for 'b'
const VOICE: Record<string, 'nova' | 'onyx'> = {
  a: 'nova',
  b: 'onyx',
}

async function audioExists(path: string): Promise<boolean> {
  const { data } = await supabase.storage.from('episode-audio').list('tts', {
    search: path.replace('tts/', ''),
    limit: 1,
  })
  return (data?.length ?? 0) > 0
}

async function generateAndUpload(
  text: string,
  voice: 'nova' | 'onyx',
  storagePath: string
): Promise<void> {
  const response = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice,
    input: text,
    response_format: 'mp3',
  })

  const buffer = Buffer.from(await response.arrayBuffer())

  const { error } = await supabase.storage
    .from('episode-audio')
    .upload(storagePath, buffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    })

  if (error && error.message !== 'The resource already exists') {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  }
}

async function main() {
  console.log(`Processing ${ALL_EPISODES.length} episodes...`)

  let total = 0
  let skipped = 0
  let generated = 0
  let errors = 0

  for (const episode of ALL_EPISODES) {
    const { weekNumber: w, dayOfWeek: d, parts } = episode

    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi]

      for (let li = 0; li < part.lines.length; li++) {
        const line = part.lines[li]
        const text = line.en ?? line.english ?? ''
        if (!text.trim()) continue

        total++
        const fileName = `w${w}_d${d}_p${pi}_l${li}.mp3`
        const storagePath = `tts/${fileName}`
        const voice = VOICE[line.speaker] ?? 'nova'

        process.stdout.write(`[W${w}D${d} P${pi}L${li}] ${text.slice(0, 50)}... `)

        try {
          if (await audioExists(storagePath)) {
            console.log('SKIP')
            skipped++
            continue
          }

          await generateAndUpload(text, voice, storagePath)
          console.log(`OK (${voice})`)
          generated++

          // Rate limit: ~3 req/s to stay within OpenAI limits
          await new Promise((r) => setTimeout(r, 350))
        } catch (err) {
          console.log(`ERROR: ${(err as Error).message}`)
          errors++
        }
      }
    }
  }

  console.log('\n── Summary ──────────────────────────────')
  console.log(`Total lines : ${total}`)
  console.log(`Generated   : ${generated}`)
  console.log(`Skipped     : ${skipped}`)
  console.log(`Errors      : ${errors}`)
}

main()

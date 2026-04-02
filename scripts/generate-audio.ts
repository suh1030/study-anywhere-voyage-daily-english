/**
 * generate-audio.ts
 *
 * Generates TTS audio for all episode lines using OpenAI TTS API.
 * If SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY is available, uploads to Supabase Storage bucket
 * "episode-audio"; otherwise writes MP3s to a local output directory.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-audio.ts
 *   OPENAI_API_KEY=sk-... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/generate-audio.ts
 *
 * File naming: tts/w{week}_d{day}_p{partIndex}_l{lineIndex}.mp3
 * Public URL:  {SUPABASE_URL}/storage/v1/object/public/episode-audio/tts/w{week}_d{day}_p{partIndex}_l{lineIndex}.mp3
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { ALL_EPISODES } from '../content/episodes/index'
import fs from 'fs'
import path from 'path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ioosxzbdkscllgesmeqw.supabase.co'
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const LOCAL_OUTPUT_DIR = process.env.AUDIO_OUTPUT_DIR ?? 'tmp/generated-audio'

if (!OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const supabase = SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null
const shouldUpload = Boolean(supabase)

// Speaker name → voice mapping
// p1 (W1-10):  Mira=nova,    Jamie=onyx
// p2 (W11-18): Lily=shimmer, Tom=echo
// p3 (W19-26): Sara=nova,    Alex=onyx
// p4 (W27-34): Nina=shimmer, Marcus=echo
// p5 (W35-43): Jade=nova,    Ryan=onyx
// p6 (W44-53): Maya=shimmer, James=echo
const VOICE: Record<string, 'nova' | 'shimmer' | 'onyx' | 'echo'> = {
  Mira: 'nova',
  Sara: 'nova',
  Jade: 'nova',
  Lily: 'shimmer',
  Nina: 'shimmer',
  Maya: 'shimmer',
  Jamie: 'onyx',
  Alex: 'onyx',
  Ryan: 'onyx',
  Tom: 'echo',
  Marcus: 'echo',
  James: 'echo',
}

async function audioExists(path: string): Promise<boolean> {
  if (shouldUpload && supabase) {
    const { data } = await supabase.storage.from('episode-audio').list('tts', {
      search: path.replace('tts/', ''),
      limit: 1,
    })
    return (data?.length ?? 0) > 0
  }

  return fs.existsSync(path)
}

async function generateAndUpload(
  text: string,
  voice: 'nova' | 'shimmer' | 'onyx' | 'echo',
  storagePath: string
): Promise<void> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  })

  const buffer = Buffer.from(await response.arrayBuffer())

  if (shouldUpload && supabase) {
    const { error } = await supabase.storage
      .from('episode-audio')
      .upload(storagePath, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    if (error && error.message !== 'The resource already exists') {
      throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
    }
    return
  }

  fs.mkdirSync(path.dirname(storagePath), { recursive: true })
  fs.writeFileSync(storagePath, buffer)
}

async function main() {
  console.log(`Processing ${ALL_EPISODES.length} episodes...`)
  console.log(shouldUpload ? `Mode: upload to ${SUPABASE_URL}` : `Mode: local output -> ${LOCAL_OUTPUT_DIR}`)

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
        const outputPath = shouldUpload
          ? `tts/${fileName}`
          : path.join(LOCAL_OUTPUT_DIR, 'tts', fileName)
        const speakerName = line.speakerName ?? ''
        const voice = VOICE[speakerName] ?? (line.speaker === 'a' ? 'nova' : 'onyx')

        process.stdout.write(`[W${w}D${d} P${pi}L${li}] ${text.slice(0, 50)}... `)

        try {
          if (await audioExists(outputPath)) {
            console.log('SKIP')
            skipped++
            continue
          }

          await generateAndUpload(text, voice, outputPath)
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

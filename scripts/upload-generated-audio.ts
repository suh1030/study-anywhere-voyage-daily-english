import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ioosxzbdkscllgesmeqw.supabase.co'
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const AUDIO_ROOT = process.env.AUDIO_OUTPUT_DIR ?? 'tmp/generated-audio/tts'
const BUCKET = 'episode-audio'
const PREFIX = 'tts'
const FORCE_UPLOAD_OVERWRITE = process.env.FORCE_UPLOAD_OVERWRITE === 'true'

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function collectMp3Files(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMp3Files(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.mp3')) {
      files.push(fullPath)
    }
  }

  return files.sort()
}

async function ensureBucket() {
  const { data, error } = await supabase.storage.getBucket(BUCKET)
  if (!error && data) return

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '50MiB',
  })
  if (createError && !String(createError.message).includes('already exists')) {
    throw createError
  }
}

async function listExistingFiles() {
  const existing = new Set<string>()
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
      limit: 1000,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) throw error

    for (const item of data) {
      if (item.name?.endsWith('.mp3')) existing.add(item.name)
    }

    if (data.length < 1000) break
    offset += 1000
  }

  return existing
}

async function main() {
  if (!fs.existsSync(AUDIO_ROOT)) {
    console.error(`Audio directory not found: ${AUDIO_ROOT}`)
    process.exit(1)
  }

  await ensureBucket()

  const files = collectMp3Files(AUDIO_ROOT)
  const existing = FORCE_UPLOAD_OVERWRITE ? new Set() : await listExistingFiles()
  const pending = files.filter((filePath) => FORCE_UPLOAD_OVERWRITE || !existing.has(path.basename(filePath)))

  console.log(`Uploading ${pending.length} missing files from ${AUDIO_ROOT} to ${BUCKET}/${PREFIX}...`)

  let uploaded = 0
  let skipped = 0
  let errors = 0

  for (const filePath of files) {
    const fileName = path.basename(filePath)
    if (!FORCE_UPLOAD_OVERWRITE && existing.has(fileName)) {
      skipped++
      continue
    }
    const storagePath = `${PREFIX}/${fileName}`
    const buffer = fs.readFileSync(filePath)

    process.stdout.write(`${storagePath}... `)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'audio/mpeg',
        upsert: FORCE_UPLOAD_OVERWRITE,
      })

    if (error) {
      if (String(error.message).includes('already exists')) {
        console.log('SKIP')
        skipped++
      } else {
        console.log(`ERROR: ${error.message}`)
        errors++
      }
    } else {
      console.log('OK')
      uploaded++
    }
  }

  console.log('\n── Summary ──────────────────────────────')
  console.log(`Total files: ${files.length}`)
  console.log(`Uploaded   : ${uploaded}`)
  console.log(`Skipped    : ${skipped}`)
  console.log(`Errors     : ${errors}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

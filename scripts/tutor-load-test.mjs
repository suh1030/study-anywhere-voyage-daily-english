// Tutor 可用性與延遲測試。分開執行 normal / burst，避免兩種負載互相污染。

const URL = `${process.env.TUTOR_PROXY_URL ?? 'http://127.0.0.1:8787'}/tutor-chat`
const mode = process.env.LOAD_MODE ?? 'normal'
const count = Number(process.env.LOAD_COUNT ?? (mode === 'burst' ? 8 : 6))
const intervalMs = Number(process.env.LOAD_INTERVAL_MS ?? 2500)

const prompts = [
  'Please confirm whether this is correct: I enjoy reading after work.',
  'Correct this sentence briefly: She walk to school every day.',
  'How do I politely ask someone to repeat a sentence?',
  'Explain the difference between tired and tiring briefly.',
  'Give me one short question for practicing a job interview.',
  'Is this sentence correct: I have lived here for three years?',
  'Correct this sentence: Yesterday he buy a new book.',
  'How can I naturally say that I need more time?',
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(index) {
  const startedAt = Date.now()
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompts[index % prompts.length] }] }),
      signal: AbortSignal.timeout(30000),
    })
    const data = await response.json().catch(() => ({}))
    return {
      index,
      status: response.status,
      success: response.ok && typeof data.reply === 'string' && data.reply.trim().length > 0,
      error: data.error ?? null,
      latencyMs: Date.now() - startedAt,
    }
  } catch (error) {
    return { index, status: 0, success: false, error: error.name, latencyMs: Date.now() - startedAt }
  }
}

const results = []
if (mode === 'burst') {
  results.push(...await Promise.all(Array.from({ length: count }, (_, index) => request(index))))
} else {
  for (let index = 0; index < count; index += 1) {
    results.push(await request(index))
    if (index < count - 1) await sleep(intervalMs)
  }
}

const successfulLatencies = results.filter((result) => result.success).map((result) => result.latencyMs).sort((a, b) => a - b)
const percentile = (ratio) => successfulLatencies[Math.min(successfulLatencies.length - 1, Math.floor(successfulLatencies.length * ratio))] ?? 0
const successes = results.filter((result) => result.success).length

console.log(JSON.stringify({
  mode,
  requests: count,
  successes,
  failures: count - successes,
  successRate: `${((successes / count) * 100).toFixed(1)}%`,
  p50Ms: percentile(0.5),
  p95Ms: percentile(0.95),
  maxMs: successfulLatencies.at(-1) ?? 0,
  errors: results.filter((result) => !result.success).map((result) => result.error ?? `http_${result.status}`),
}, null, 2))

if (successes !== count) process.exitCode = 1

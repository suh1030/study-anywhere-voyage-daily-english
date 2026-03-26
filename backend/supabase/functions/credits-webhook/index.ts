import { jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

// IAP 產品 ID → 點數對應（需與 App Store Connect / Google Play 設定一致）
const CREDIT_PACKAGES: Record<string, number> = {
  sav_credits_100: 100,
  sav_credits_300: 300,
  sav_credits_600: 600,
}

async function verifyRevenueCatSignature(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!secret) return false

  const signature = req.headers.get('X-RevenueCat-Signature')
  if (!signature) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const expectedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedHex
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const body = await req.text()

    // ── 1. 驗證 RevenueCat 簽名（防止偽造 webhook） ──────────
    const isValid = await verifyRevenueCatSignature(req, body)
    if (!isValid) return jsonResponse({ error: 'invalid_signature' }, 401)

    const event = JSON.parse(body)
    const eventType: string = event.event?.type

    // ── 2. 只處理成功購買事件 ────────────────────────────────
    if (
      eventType !== 'INITIAL_PURCHASE' &&
      eventType !== 'NON_SUBSCRIPTION_PURCHASE'
    ) {
      // 其他事件（退款等）回傳 200 但不做任何處理
      return jsonResponse({ received: true })
    }

    const productId: string = event.event?.product_id
    const appUserId: string = event.event?.app_user_id // 對應 Supabase user.id

    if (!productId || !appUserId) {
      return jsonResponse({ error: 'missing_fields' }, 400)
    }

    const creditsToAdd = CREDIT_PACKAGES[productId]
    if (!creditsToAdd) {
      return jsonResponse({ error: 'unknown_product', productId }, 400)
    }

    // ── 3. 原子增加點數 ──────────────────────────────────────
    const supabaseAdmin = createAdminClient()
    const { data: newBalance, error } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: appUserId,
      p_amount: creditsToAdd,
      p_description: `購買 ${creditsToAdd} 點（${productId}）`,
    })

    if (error) {
      console.error('add_credits failed:', error)
      return jsonResponse({ error: 'db_error' }, 500)
    }

    return jsonResponse({ received: true, creditsAdded: creditsToAdd, newBalance })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

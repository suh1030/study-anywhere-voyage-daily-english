import { jsonResponse } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-client.ts'

// IAP 產品 ID → 點數對應（需與 App Store Connect / Google Play 設定一致）
const CREDIT_PACKAGES: Record<string, number> = {
  sav_credits_10: 10,
}

// 常數時間比較，避免時序側信道（安全複審 M-3）
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

function verifyRevenueCatAuth(req: Request): boolean {
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!secret) return false
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false
  return timingSafeEqual(authHeader, secret)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405)

  try {
    const body = await req.text()

    // ── 1. 驗證 RevenueCat 簽名（防止偽造 webhook） ──────────
    const isValid = verifyRevenueCatAuth(req)
    if (!isValid) return jsonResponse({ error: 'unauthorized' }, 401)

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
    // 冪等鍵：RevenueCat 事件唯一 id，退而求其次用交易 id。
    // 兩者皆無則拒絕，避免無去重依據而重複入帳。
    const eventId: string | undefined = event.event?.id ?? event.event?.transaction_id

    if (!productId || !appUserId) {
      return jsonResponse({ error: 'missing_fields' }, 400)
    }
    if (!eventId) {
      return jsonResponse({ error: 'missing_event_id' }, 400)
    }

    const creditsToAdd = CREDIT_PACKAGES[productId]
    if (!creditsToAdd) {
      return jsonResponse({ error: 'unknown_product', productId }, 400)
    }

    // ── 3. 冪等增加點數（同一事件只入帳一次）──────────────────
    const supabaseAdmin = createAdminClient()
    const { data: result, error } = await supabaseAdmin.rpc('add_credits_idempotent', {
      p_user_id: appUserId,
      p_amount: creditsToAdd,
      p_description: `購買 ${creditsToAdd} 點（${productId}）`,
      p_event_id: String(eventId),
    })

    if (error) {
      console.error('add_credits_idempotent failed:', error)
      return jsonResponse({ error: 'db_error' }, 500)
    }

    return jsonResponse({
      received: true,
      credited: result?.credited ?? false,
      newBalance: result?.balance,
    })
  } catch (_error) {
    return jsonResponse({ error: 'internal_error' }, 500)
  }
})

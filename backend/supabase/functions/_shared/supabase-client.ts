import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** 使用使用者 JWT，受 RLS 保護 */
export function createUserClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
}

/** 使用 Service Role Key，繞過 RLS，僅用於後端管理操作 */
export function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
}

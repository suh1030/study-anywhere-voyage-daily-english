-- ── 鎖定 SECURITY DEFINER 函式的執行權限 ──────────────────────────────
-- 修復重大漏洞：Postgres 預設將函式 EXECUTE 授予 PUBLIC，
-- 導致任何登入用戶可透過 PostgREST /rest/v1/rpc/add_credits
-- 直接給自己加點（繞過 IAP），或呼叫 deduct_credit 清空他人點數。
-- 這些函式只應由 Edge Functions（service_role）呼叫。

REVOKE EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_credit(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_credit(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_tutor_usage(UUID, DATE) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_credit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_credit(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_tutor_usage(UUID, DATE) TO service_role;

-- handle_new_user 是 trigger 函式，無法經 RPC 呼叫，但一併鎖上以絕後患
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

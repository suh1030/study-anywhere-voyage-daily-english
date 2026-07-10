#!/usr/bin/env bash
#
# deploy-backend.sh — Notch Up! Daily English 後端半自動部署
# ---------------------------------------------------------------------------
# 涵蓋 runbook 的 Step A–E：link → DB migration → secrets → Edge Functions → seed。
# 不涵蓋：手動一次性設定（Auth provider / SMTP / RevenueCat / ASC，見 §7）與 EAS build/submit。
#
# 搭配文件：docs/launch-experts/deploy-runbook.md
#
# 用法：
#   # 1) 先預覽每一步要跑什麼（不實際執行，強烈建議先跑這個）
#   ./scripts/deploy/deploy-backend.sh --dry-run
#
#   # 2) 只跑後端部署（migration + secrets + functions），略過破壞性 seed
#   ./scripts/deploy/deploy-backend.sh
#
#   # 3) 連 seed 一起跑（破壞性：會 truncate+insert 內容表，先備份！）
#   ./scripts/deploy/deploy-backend.sh --with-seed
#
# 秘密來源：預設從環境變數讀。可先 `source` 一個 gitignored 的 env 檔，例如：
#   set -a; source ./scripts/deploy/secrets.env; set +a
#   ./scripts/deploy/deploy-backend.sh
#
# 需要的環境變數（缺 REQUIRED 者腳本會停）：
#   ANTHROPIC_API_KEY           (required) feedback
#   REVENUECAT_WEBHOOK_SECRET   (required) credits-webhook，須與 RevenueCat 一致
#   OPENROUTER_API_KEY          (required) tutor-chat 主模型
#   GROQ_API_KEY                (optional) tutor-chat fallback
#   GROQ_MODEL                  (optional) 預設 llama-3.3-70b-versatile
#   OPENROUTER_FALLBACK_MODEL   (optional) 預設 openrouter/free
#
# 註：SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY 由 Supabase 平台自動注入，
#     不由本腳本設定（設定會被 CLI 以保留字拒絕）。
# ---------------------------------------------------------------------------

set -euo pipefail

# ── 設定 ─────────────────────────────────────────────────────────────────────
PROJECT_REF="ioosxzbdkscllgesmeqw"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

# repo 根目錄（本腳本位於 <repo>/scripts/deploy/）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SUPABASE_DIR="${REPO_ROOT}/backend/supabase"

# 9 支 Edge Functions（credits-webhook 為 --no-verify-jwt 特例，另外處理）
STANDARD_FUNCTIONS=(
  content-episode
  content-article
  content-questions
  content-flashcards
  feedback
  tutor-chat
  progress-sync
  delete-account
)
WEBHOOK_FUNCTION="credits-webhook"

# ── 旗標 ─────────────────────────────────────────────────────────────────────
DRY_RUN=false
WITH_SEED=false
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN=true ;;
    --with-seed) WITH_SEED=true ;;
    -h|--help)   grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "未知參數：$arg（用 --help 看說明）"; exit 2 ;;
  esac
done

# ── 小工具 ───────────────────────────────────────────────────────────────────
step() { echo ""; echo "▶ [$1] $2"; }
info() { echo "  · $1"; }
ok()   { echo "  ✓ $1"; }
warn() { echo "  ⚠ $1" >&2; }
die()  { echo "  ✗ $1" >&2; exit 1; }

# 執行或（dry-run 時）僅印出指令。秘密值不會被印出（呼叫端負責遮蔽）。
run() {
  if $DRY_RUN; then
    echo "  [dry-run] $*"
  else
    echo "  \$ $*"
    "$@"
  fi
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    die "缺少必要環境變數 ${name}（見腳本頂端說明；可 source 一個 gitignored 的 secrets.env）"
  fi
}

# ── 0. 前置檢查 ───────────────────────────────────────────────────────────────
step 0 "前置檢查"
command -v supabase >/dev/null 2>&1 || die "找不到 supabase CLI"
ok "supabase CLI: $(supabase --version 2>/dev/null | head -1)"
[[ -d "${SUPABASE_DIR}/functions" ]] || die "找不到 ${SUPABASE_DIR}/functions"
ok "repo 根目錄：${REPO_ROOT}"

if $DRY_RUN; then warn "DRY-RUN 模式：只會印出指令，不實際部署。"; fi
$WITH_SEED && warn "已帶 --with-seed：Step E 會執行破壞性 seed（truncate+insert）。請確認已備份。"

# 必要 secrets 先驗（dry-run 也驗，及早發現缺漏）
step "0b" "檢查必要 secrets 是否就緒"
require_env ANTHROPIC_API_KEY
require_env REVENUECAT_WEBHOOK_SECRET
require_env OPENROUTER_API_KEY
ok "必要 secrets 皆存在（GROQ_API_KEY 選填：${GROQ_API_KEY:+已設}${GROQ_API_KEY:-未設})"

# ── Step A. link ─────────────────────────────────────────────────────────────
step A "連結雲端專案 ${PROJECT_REF}"
run supabase link --project-ref "${PROJECT_REF}"
ok "已連結（驗證：supabase projects list 該 ref 應為 linked）"

# ── Step B. DB migration ─────────────────────────────────────────────────────
step B "套用 DB migration（修刷點漏洞 20260710000000）"
info "先列出 pending migration 供人工確認："
run supabase migration list --linked
warn "若 Remote 欄一支都沒有（新 Pro 專案、歷史空），db push 會嘗試套全部 migration。"
warn "此情況請先中止，改用 runbook §3 的 migration repair / db diff 流程。"
run supabase db push
ok "migration 已套用（驗證：以 anon key 直呼 add_credits 應回 401/403）"

# ── Step C. secrets ──────────────────────────────────────────────────────────
step C "設定 Edge Function secrets（先於 deploy）"
run supabase secrets set "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}"
run supabase secrets set "REVENUECAT_WEBHOOK_SECRET=${REVENUECAT_WEBHOOK_SECRET}"
run supabase secrets set "OPENROUTER_API_KEY=${OPENROUTER_API_KEY}"
if [[ -n "${GROQ_API_KEY:-}" ]]; then
  run supabase secrets set "GROQ_API_KEY=${GROQ_API_KEY}"
fi
[[ -n "${GROQ_MODEL:-}" ]] && run supabase secrets set "GROQ_MODEL=${GROQ_MODEL}"
[[ -n "${OPENROUTER_FALLBACK_MODEL:-}" ]] && run supabase secrets set "OPENROUTER_FALLBACK_MODEL=${OPENROUTER_FALLBACK_MODEL}"
ok "secrets 設定完成（驗證：supabase secrets list）"

# ── Step D. deploy Edge Functions ────────────────────────────────────────────
step D "部署 9 支 Edge Functions"
cd "${SUPABASE_DIR}"
for fn in "${STANDARD_FUNCTIONS[@]}"; do
  [[ -d "functions/${fn}" ]] || die "找不到 functions/${fn}"
  info "部署 ${fn}（保留 verify_jwt）"
  run supabase functions deploy "${fn}"
done
# 特例：credits-webhook 用自訂 secret 驗證，必須關 gateway JWT，否則 RevenueCat webhook 被擋、購買不入帳
info "部署 ${WEBHOOK_FUNCTION}（--no-verify-jwt：RevenueCat 帶自訂 secret，非 Supabase JWT）"
run supabase functions deploy "${WEBHOOK_FUNCTION}" --no-verify-jwt
cd "${REPO_ROOT}"
ok "9 支函式部署完成（驗證：supabase functions list 全 ACTIVE；delete-account 無 token 回 401 非 404）"

# ── Step E. seed（破壞性，預設略過）─────────────────────────────────────────
step E "Seed 內容到雲端"
if $WITH_SEED; then
  warn "破壞性操作：seed 會對內容表 truncate+insert。"
  info "請確認 scripts/.env 指向雲端 URL（${PROJECT_URL}），否則會灌到本機。"
  run npm --prefix "${REPO_ROOT}" run seed
  ok "seed 完成（驗證：各表筆數 episodes 365 / articles 365 / questions 365 / flashcards 583）"
else
  info "未帶 --with-seed，略過 seed。若內容已在雲端且正確即可略過；要重灌請加 --with-seed 並先備份。"
fi

# ── 收尾 ─────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════════════"
if $DRY_RUN; then
  echo "✅ DRY-RUN 完成：以上為將執行的指令。確認無誤後移除 --dry-run 實跑。"
else
  echo "✅ 後端部署（Step A–E）完成。"
fi
echo ""
echo "接下來（本腳本不涵蓋，見 runbook）："
echo "  §7  手動一次性設定：Auth Apple/Google provider、SMTP、RevenueCat webhook secret、ASC IAP"
echo "  §8  真機/沙盒端到端驗證（登入 / IAP 8 秒入帳 / AI 批改 / 刪帳號 / 漏洞已封）"
echo "  §9  cd app && eas build --platform ios --profile production"
echo "  §10 cd app && eas submit --platform ios --profile production --latest"
echo "════════════════════════════════════════════════════════════════════════"

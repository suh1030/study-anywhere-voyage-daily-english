# Pre-Launch Checklist — Notch Up: Daily English
> 建立日期：2026-03-27
> 每項必須親自測試確認，打勾才算完成

> 2026-04-29 current scope notice:
> For the current launch
> content scope and sign-off criteria, use
> [product-content-scope.md](./product-content-scope.md) and
> [launch-content-quality-signoff.md](./launch-content-quality-signoff.md).
> Current launch content is episodes, articles, questions, and flashcards.
> Speak articles are seeded, fetched, and counted as launch product content.

> 本文件是「App Store 上架操作 + 上線前檢查」的 SSOT。
> 內容品質最終狀態見 [launch-content-quality-signoff.md](./launch-content-quality-signoff.md)。
> 功能 QA 逐項測試見 [testflight-checklist.md](./testflight-checklist.md)。
> 歷史內容修復計畫（remediation-master / execution-guide）已歸檔於 [_archive/](./_archive/)。

---

## 🔴 P0 — 上架前必須完成（封鎖上架）

### 資料庫
- [x] 執行 `npm run seed`，將本地已驗證的全年內容同步到 Supabase（已同步 365 episodes / 365 articles / 365 questions / 583 flashcards）
- [ ] 打開 app，確認 Listen / Speak / Conversation / Review 四個 Tab 都能顯示內容（不是空白或 loading）
- [ ] **確認 questions 表 hint_zh 欄位無殘留英文**（Conversation 的「中文提示」按鈕內容，來自 DB questions.hint_zh，需逐筆確認）〔原 bug-fixes #16〕
- [ ] **確認 episodes 的 key_phrases 內容正確**（Listen 最下方 KEY PHRASES 區塊）〔原 bug-fixes #13〕

### 帳號與登入
- [ ] Email 登入：註冊 → 收信 → 確認 → 登入，完整流程可用
- [ ] Apple Sign In：iOS 裝置實測可登入（Supabase provider 需先設定完成）
- [ ] Google Sign In：iOS 裝置實測可登入
  - Google Cloud Project：Notch Up（notch-up）；Client ID 已填入 Supabase（2026-04-03）
  - 若尚未設定 Client Secret：Google Cloud Console → 憑證 → Web OAuth 用戶端，Redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`，填入 Supabase → Auth → Providers → Google〔原 bug-fixes〕
- [ ] 登出後再登入，資料（點數、進度）正確恢復

### IAP 與點數流程
- [ ] RevenueCat Offering `default` → Package `credits_10` 設定正確
- [ ] App 內點擊「BUY 10 CREDITS」，出現 Apple 付款視窗
- [ ] 完成購買後，點數餘額在 8 秒內增加 10（webhook 正常運作）
- [ ] 點數不足時，Conversation 回傳正確錯誤訊息（不是 crash）
- [ ] 免費 3 credits 用完後，app 正確引導用戶購買

### AI 批改
- [ ] Conversation 頁面提交回答，能收到 Claude 回饋
- [ ] 每日 5 次上限正確生效（第 6 次回傳「明天再來」訊息）
- [ ] 點數不足時不扣點，顯示「點數不足」而非靜默失敗

### Listen 模組
- [ ] W1D1 至少有音檔，點擊播放能正常播放 MP3
- [ ] 無音檔時 fallback 至系統 TTS，不 crash
- [ ] 播完一行自動跳下一行

### IAP — RevenueCat Webhook 設定（一次性）✅
> RevenueCat Dashboard → Project → Integrations → Webhooks → Add Endpoint
> - URL：`https://ioosxzbdkscllgesmeqw.supabase.co/functions/v1/credits-webhook`
> - 將產生的 Authorization Secret 填入 Supabase → Edge Functions → Secrets → `REVENUECAT_WEBHOOK_SECRET`
> - 已完成（2026-04-03）

### App Store 硬性需求
- [ ] Apple Sign In 功能完整可用（Apple 規定：有第三方登入必須提供 Apple Sign In）
  - ⚠️ **Simulator 無法測試**，必須用真實 iPhone 透過 TestFlight 測試，上線前必須確認
- [x] 隱私政策連結可開啟（Account tab → LEGAL，開啟 `https://sav-daily-english.netlify.app/privacy-policy.html`）
- [x] 條款連結可開啟（Account tab → LEGAL，開啟 `https://sav-daily-english.netlify.app/terms-of-service.html`）
- [x] **帳號刪除功能（Guideline 5.1.1(v)）**：Account tab → DELETE ACCOUNT，二次確認後
      呼叫 `delete-account` Edge Function 刪除 auth 用戶（連帶 CASCADE 清除所有資料）
      〔工程審查 2026-07-10 新增，見 engineering-review-2026-07-10.md〕

### 安全（2026-07-10 工程審查 + 專家團隊複審修復）
- [x] **鎖定 SECURITY DEFINER RPC 執行權限**：add_credits/deduct_credit/restore_credit/
      increment_tutor_usage 已 REVOKE FROM PUBLIC，僅 service_role 可執行
      （修復前任何登入用戶可繞過 IAP 無限加點；本機已實測封死）
      → 雲端需執行 `supabase db push` 套用 migration `20260710000000`
- [x] **credits-webhook 冪等性（H-1）**：新增 `20260710010000` migration
      （`provider_event_id UNIQUE` + `add_credits_idempotent`），webhook 以事件 id 去重，
      同一購買只入帳一次；secret 改常數時間比對
      → 雲端需 `supabase db push` 套用 `20260710010000` 並重部署 `credits-webhook`
- [x] **tutor-chat 額度前置扣點（H-2）**：用量改在呼叫任何 LLM 前原子扣，
      失敗/被擋下的請求仍計數，杜絕 AI 成本濫用 → 需重部署 `tutor-chat`
- [x] 移除 App.tsx 的 PREVIEW_MODE 登入繞過除錯碼
- [x] app/.env 預設改為雲端環境；eas.json build profile 補上固定 env；本機設定移至 .env.local
- [ ] 部署 `delete-account` Edge Function 到雲端（`supabase functions deploy delete-account`）
- [ ] 重新部署 `credits-webhook`（用 `--no-verify-jwt`）與 `tutor-chat`（含 H-1/H-2 修復）

### Build 設定（2026-07-10 Mobile Build 專家複審修復）
- [x] **移除殘留舊 prebuild**：`rm -rf app/ios app/android`（舊資料夾名 StudyAnywhereVoyage）
      → `.easignore` 改排除整個 `/ios`、`/android`，強制 EAS 由 app.json 跑 CNG
      （否則會用到舊 prebuild，改名/權限/安全修復全不進 build）
- [x] 補上 `expo-asset`（expo-audio 必要 peer dep，否則正式 build 可能在音檔流程 crash）
- [x] 移除 SDK 55 失效欄位 `newArchEnabled`；`expo install --fix` 對齊 13 個鎖定版
- [ ] **真機重測 New Architecture 相容性**：RevenueCat / SVG / 畫面轉場（app 實際以新架構出 build）

### 隱私標籤（2026-07-10 Privacy 專家複審，送審前必改）
- [ ] **App Store Connect / Google Play 隱私標籤補報「User Content」**：對話批改答案與
      家教聊天文字會送第三方 AI，現行標籤漏報且與隱私政策矛盾（Guideline 5.1.1 退件風險）。
      更正文字見 `docs/launch-experts/privacy-compliance.md`
- [ ] 隱私政策補「跨境傳輸」條文（台灣個資流向美國 AI 供應商；條文已備妥可貼）

---

## 🟡 P1 — 上架前強烈建議完成

### App Store Connect
- [ ] 截圖準備完成（iPhone 6.7" 至少 3 張，需含真實 UI 畫面）
- [x] App 隱私權 Nutrition Labels 填寫完成（2026-04-03）
- [x] 隱私政策 URL 填入 ASC（2026-04-03）
- [x] App 描述、關鍵字填寫完成（2026-04-03）
- [x] Apple 審查測試帳號建立（`a0925302127@gmail.com`，balance 已設 10 credits，2026-04-03）
- [x] 審查備註填寫（說明 IAP 測試方式、測試帳號，2026-04-03）
- [x] 年齡分級問卷填寫完成（4+，2026-04-03）
- [x] 新 build 已提交（build #5/7 已 submit 到 Apple，2026-04-03）

### 內容品質
- [x] 按接近 10 分鐘的長篇規格重新生成 **全部 365 集**（6 parts、每集 48 行）
- [x] 完成全年內容檔對齊與驗證：episodes / articles / questions / flashcards 已更新為 365 天版本，並驗證通過（角色階段、結構、主題對齊、內容檔覆蓋完整）
- [x] 完成產品內容全量稽核：365 天 schedule 與 episodes / articles / questions / flashcards 全數對齊，無缺日、缺週、缺欄位
- [x] 完成年齡分級安全稽核：118 個活躍內容檔未命中暴力、色情、毒品、酒精、自傷、仇恨、粗口、賭博、吸菸等高風險內容（2026-04-03）
- [x] 全年 365 集新版 podcast 音檔重新生成並上傳（`tts-1`；17,520 個 mp3，missingCount: 0，Supabase Storage `episode-audio/tts/` 已驗證，2026-04-03）
- [ ] 每個階段各抽 1 集實際播放音檔，確認人聲自然、角色聲音正確對應

### 用戶體驗
- [ ] 新用戶首次開啟：有引導說明，知道如何開始
- [ ] 今日無對應集數時（SCHEDULE 無匹配），顯示合理提示而非空白
- [ ] 網路中斷時，app 不 crash，顯示友善錯誤訊息
- [ ] 深色模式 / 淺色模式顯示正常

---

## 🟢 P2 — 上架後第一個月內完成


### 商業
- [ ] 建立一個基本的用戶回饋管道（email 或表單）
- [ ] Google Play 版本評估（$25 USD 一次性費用）
- [ ] **完成 Cloudflare R2 音檔遷移**（音檔已達 3.0GB / 17,520 個 MP3，已超過 Supabase Free 1GB；上線採 Supabase Pro + R2，決策見 [backend-hosting-decision.md](./backend-hosting-decision.md)）

### 監控
- [ ] 確認 Supabase 有開 Edge Function 錯誤通知
- [ ] 確認 RevenueCat Dashboard 能看到購買紀錄
- [ ] **Anthropic 餘額監控**：初期儲值 $5 USD（約 3,472 次 AI feedback），餘額歸零 API 即停、無自動扣款；有用戶後定期補值（建議 $20–50）〔原 bug-fixes〕

---

## 已知技術債（不封鎖上架，但需記錄）

| 項目 | 說明 |
|------|------|
| EAS Build 次數限制 | 確認 Expo 免費方案剩餘次數 |
| Apple Sign In Supabase 設定 | 需在 Supabase Auth → Providers → Apple 填入憑證 |

---

## 工程已完成的修正（2026-04-03）

| 修正項目 | 說明 |
|--------|------|
| ListenScreen `player.play()` async 錯誤處理 | 改為 `Promise.resolve().catch()` 以正確捕捉非同步播放錯誤，確保 TTS fallback 可觸發 |
| ListenScreen 自動跳行過早觸發 | 新增 `hasStartedPlayingRef` 防止音訊尚未開始播放就跳至下一行 |
| ConversationScreen 送出後鍵盤未收起 | 提交 AI 回饋請求時加入 `Keyboard.dismiss()` |
| ScheduleScreen 重設進度未同步後端 | 清除進度後立即呼叫 `syncProgress()` |

## 工程已完成的修正（2026-04-06）

| 修正項目 | 說明 |
|--------|------|
| 新增 Account tab | 獨立帳號管理頁（credits/購買/登出/LEGAL/版本號），取代舊 ProfileModal |
| 統一日期列 | TabNavigator 共用 dayLabelBar（W01·Day·日期），Listen/Conv/Speak 同位置同字體 |
| CR badge 整合日期列 | Conversation tab 的 credits 顯示移至 dayLabelBar 右側，與日期同行 |
| tab icon 對齊 | 每個 icon 加 14×14 固定容器，不同高度 SVG 垂直對齊一致 |
| tab bar 貼邊 | 移除 nav paddingHorizontal，SCHED / Account icon 貼齊螢幕邊緣 |
| Account tab 顏色 | active 狀態改為灰色（與 SCHED 區隔） |
| header 間距對稱 | Listen / Speak header paddingVertical 統一為 spacing.lg |
| 登入錯誤訊息 | 區分「帳號不存在」/ 「密碼錯誤」/ 「尚未驗證信箱」|
| rolling schedule | curriculum 以每位使用者的 `curriculumStartDate` 為起點動態生成日曆 |

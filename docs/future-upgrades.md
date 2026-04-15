# Future Upgrades — Notch Up!
> 不影響上線、但未來值得做的升級清單
> 建立日期：2026-04-04

---

## 🌐 品牌與基礎建設

- [ ] **購買 domain**
  - 建議：`notchup.app` 或 `notchup.io`（簡潔、有品牌感）
  - 備選：`study-anywhere-voyage.com`（母品牌）
  - 費用約 $12–20 USD/年
  - 用途：官網、email、未來行銷

- [ ] **換成品牌 email**
  - 現在：`notch-up@gmail.com`（暫用）
  - 升級：`hello@notchup.app` 或 `hi@notchup.app`
  - 選項：Google Workspace ($6 USD/月) 或 Zoho Mail（免費）
  - 需要先有 domain

- [ ] **建立品牌官網**
  - 最小版本：一頁式 landing page（簡介 + App Store 下載連結）
  - 現有：Netlify 上的隱私政策/條款頁面（可延伸）
  - 工具：Framer / Notion Sites / 手刻 HTML

- [ ] **設定自訂 SMTP 寄件地址**
  - 現在：Resend + `notch-up@gmail.com`
  - 升級：用自訂 domain 寄出（`noreply@notchup.app`）
  - 需要先有 domain

---

## 📧 Email 與用戶溝通

- [ ] **Email 歡迎信**
  - 新用戶註冊後自動寄出一封歡迎信
  - 說明如何開始使用、3 credits 怎麼用
  - 工具：Resend + Supabase Auth Webhook

- [ ] **建立用戶回饋管道**
  - 最簡單：在 app 內加「Send Feedback」按鈕，開啟 email
  - 進階：Google Form 或 Typeform 嵌入

---

## 📱 App 功能擴充

- [ ] **推播通知（Push Notifications）**
  - 每日提醒學習（可選）
  - 需要 `expo-notifications`

- [ ] **連續學習天數（Streak）**
  - 記錄每日完成，顯示連續幾天
  - 增加留存動機

- [ ] **離線播放**
  - 預先下載當日音檔
  - 無網路也能使用 Listen

- [ ] **進階 onboarding**
  - 新用戶第一次開啟 app，有引導流程
  - 目前只有 tips 彈窗

- [ ] **分享功能**
  - 學完一集可分享成就圖卡
  - 社群行銷用途

---

## 💰 商業擴展

- [ ] **Android 版本（Google Play）**
  - 費用：$25 USD 一次性
  - 需要 Google Play Console 帳號
  - 銀行/稅務資料需另外設定

- [ ] **訂閱制評估**
  - 目前是 credits 消耗制
  - 評估是否改成月訂閱（可能提高 LTV）

- [ ] **Apple Small Business Program 追蹤**
  - 已申請，等待 Apple 審核
  - 核准後抽成從 30% → 15%

---

## 🔊 音訊品質升級

- [ ] **遷移音檔至 Cloudflare R2**
  - 現在：存在 Supabase Storage（有容量/費用壓力）
  - R2 免費額度：10GB/月 + 1000 萬次 GET
  - 費用大幅降低，速度更穩定

- [ ] **升級 TTS 聲音**
  - 目前使用 OpenAI `tts-1`
  - 可評估 `tts-1-hd` 或 ElevenLabs（更自然）

---

## 📊 監控與數據

- [ ] **加入 Analytics**
  - 了解用戶在哪個步驟流失
  - 工具：PostHog（免費）或 Mixpanel

- [ ] **Crash 監控**
  - 工具：Sentry（免費額度夠用）
  - 出現 bug 自動通知

- [ ] **Supabase 用量監控**
  - 確認資料庫/Storage 用量不超出免費額度
  - 超過時評估升級方案

---

## 🎨 設計升級

- [ ] **App Icon 設計**（已在主要待辦，但這裡記錄方向）
  - 概念：深色底 + 金色刻度/缺口 + Notch Up 意象
  - 尺寸：1024x1024px，無圓角

- [ ] **Splash Screen 升級**
  - 目前是預設深色背景 + icon
  - 可加入品牌動畫

- [ ] **App Store 截圖美化**
  - 目前計劃用 Simulator 截圖
  - 升級：用 Figma 製作有背景、文字說明的精美版截圖

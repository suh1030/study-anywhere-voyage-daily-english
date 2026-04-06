# SAV 產品負責人 To-Do 清單

這份清單記錄需要你（Savelyn）親自完成的事項，不屬於工程開發範疇。

> 最後更新：2026-04-06

---

## 立即可做（不需要等開發）

- [x] **法律文件頁面上線**（Netlify，2026-03-26）
  - 隱私政策：`https://sav-daily-english.netlify.app/privacy-policy.html`
  - 使用條款：`https://sav-daily-english.netlify.app/terms-of-service.html`
  - 填入 App Store Connect 的 Privacy Policy URL 欄位

- [x] **Supabase Dashboard → Auth → Providers 設定**
  - [x] 開啟 Sign in with Apple：Client ID `com.savelyn.studyanywherevoyage` 已填入（2026-04-03）
  - [x] 開啟 Google Sign In：Client ID 已填入 Supabase（2026-04-03）
    - Google Cloud Project: Notch Up（notch-up）
    - Client ID: `773106577940-eujvlcd2732812aresudsv5n7l9ur6tq.apps.googleusercontent.com`

- [x] **Supabase Edge Functions → Secrets 設定**
  - `ANTHROPIC_API_KEY` — 已設定（2026-03-26）
  - `REVENUECAT_WEBHOOK_SECRET` — 等 RevenueCat 設定完後補上

- [x] **建立 RevenueCat 帳號**（2026-03-26）
  - [x] 帳號已建立：Project "Study Anywhere Voyage"
  - [x] Product `sav_credits_10` 已建立（狀態：Missing Metadata，待 App Store Connect IAP 設定完成後自動解決）
  - [x] Offering `default` 已建立，含 1 package
  - [x] iOS Public SDK Key 已填入 `app/.env`（`appl_XvsKEBrLeZaKJMQtrknEqrlaVvN`）
  - [x] **App Store Connect 建立 IAP 產品** `sav_credits_10`（Consumable，NT$60）已完成（2026-04-03）
    - Apple ID: `6761169888`，供應狀況已設定，本地化完成，截圖已上傳
  - [x] **Webhook 設定**：RevenueCat → Integrations → Webhooks → 加入 `https://ioosxzbdkscllgesmeqw.supabase.co/functions/v1/credits-webhook` → 將產生的 Secret 填入 Supabase Secrets `REVENUECAT_WEBHOOK_SECRET`（已完成，2026-04-03）

- [x] **建立 Anthropic 帳號並儲值**（2026-03-26）
  - API Key 已設定到 Supabase Secrets
  - 初期儲值 $5 USD

---

## EAS Build 準備

- [x] **`eas login` + `eas init`**（2026-03-26）
  - projectId：`70bf336b-2ec8-4170-bbb3-68d7c81b9879`
  - Distribution Certificate 已建立，有效至 2027-03-26
  - Provisioning Profile 已建立（XJHCJ3RV7J）

- [x] **`expo-av` → `expo-audio` 遷移**（2026-03-26）
  - 修正 SDK 55 build 錯誤（`EXEventEmitter.h not found`）
  - SpeakScreen 已改用 `useAudioRecorder` / `useAudioPlayer`

- [x] **`eas build --platform ios --profile production`**（build #5 完成，2026-04-03）
  - Commit: 0afec95（含 ListenScreen/ConversationScreen/ScheduleScreen 修正）

- [x] **`eas submit --platform ios --profile production`**（build #5/7 已提交，2026-04-03）

---

## App Icon 設計

- [ ] **設計 App Icon**（1024x1024px，無圓角，Apple 會自動套用）
  - 目前 app 顯示預設 Expo icon（藍色齒輪），上架前必須換掉
  - 建議工具：Figma / Canva
  - 設計概念參考：SAV 品牌色（深色底 + 金色 SAV 字樣）
  - 完成後放入 `app/assets/` 並更新 `app.json` 的 `icon` 欄位
  - 需要重新 build 才會生效

---

## App Store 上架材料

- [x] **隱私政策** — 已撰寫完成（`docs/legal/privacy-policy.html`）
- [x] **使用條款** — 已撰寫完成（`docs/legal/terms-of-service.html`）
- [x] **App Store 描述文案** — 已完成（`docs/app-store-copy.md`，含中英文）
- [x] **Privacy Nutrition Labels 填寫指南** — 已完成（`docs/privacy-nutrition-labels.md`）

- [ ] **準備 App Store 截圖**
  - 需要尺寸：iPhone 6.7"（必要）、iPhone 6.5"（建議）
  - 至少 5 張（建議：Schedule、Listen、Speak、Conversation、Review 各一張）
  - 用 iOS Simulator 截圖，或用 Figma/Canva 製作帶背景的精美版

- [x] **App Store Connect 建立 App 條目**（ascAppId: 6761168417，已填入 eas.json）
  - Bundle ID：`com.savelyn.studyanywherevoyage` ✓
  - 待確認：定價 NT$60、年齡分級 4+、隱私政策 URL 是否已在 ASC 填寫

- [x] **設定 Apple 審核用測試帳號**（已完成，2026-04-03）
  - 帳號：`a0925302127@gmail.com` / `asd0925302127`
  - Supabase credits.balance 已設為 10
  - App Store Connect → App Review Information → Demo Account 已填入

---

## 財務帳號設定（上架前必做）

- [x] **Apple Developer Program** — 已購買（savelyn.siao@gmail.com，2026-03-20）
- [ ] **Google Play Console** — $25 USD 一次性（play.google.com/console）
- [x] **Apple Small Business Program（15% 抽成）** — 已申請，等待 Apple 審核（2026-04-03）
- [x] **Apple Store Connect 銀行資訊 + 稅務資料** — 已完成（國泰世華，台灣稅務 + W-8BEN，2026-03-26）
- [ ] **Google Play 銀行資訊 + 稅務資料** — 在 Play Console → Setup → Payments profile

---

## 可選（音訊品質升級，不影響初版上架）

- [ ] **OpenAI TTS 音訊生成**
  - 預估費用：$5–10 USD 一次性
  - 用 `scripts/generate-audio.ts`（需另外建立）生成所有 Episode 台詞 mp3
  - 上傳至 Cloudflare R2

- [ ] **Cloudflare R2 bucket**
  - 免費額度每月 10GB / 1000 萬次 GET
  - 用於存放 TTS 音訊 CDN

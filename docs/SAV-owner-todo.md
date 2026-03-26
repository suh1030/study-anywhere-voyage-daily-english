# SAV 產品負責人 To-Do 清單

這份清單記錄需要你（Savelyn）親自完成的事項，不屬於工程開發範疇。

> 最後更新：2026-03-26

---

## 立即可做（不需要等開發）

- [ ] **GitHub Pages 開啟**
  - 進入 GitHub repo → Settings → Pages → Source → 選「GitHub Actions」
  - 完成後隱私政策網址：`https://suh1030.github.io/study-anywhere-voyage-daily-english/privacy-policy.html`
  - 這個網址要填入 App Store Connect

- [ ] **Supabase Dashboard → Auth → Providers 設定**
  - 開啟 Sign in with Apple：需要填入 Services ID + Team ID + Key ID + Private Key
    - 教學：dashboard → Authentication → Providers → Apple
  - 開啟 Google Sign In：需要填入 Google OAuth Client ID
    - 到 console.cloud.google.com 建立 OAuth 2.0 Client

- [ ] **Supabase Dashboard → Edge Functions → Secrets 設定**
  - `ANTHROPIC_API_KEY` — 從 console.anthropic.com 取得
  - `REVENUECAT_WEBHOOK_SECRET` — RevenueCat dashboard → Integrations → Webhooks

- [ ] **建立 RevenueCat 帳號**
  - 網址：revenuecat.com（免費方案）
  - 在 App Store Connect 建立 In-App Purchase 產品：`sav_credits_10`（Consumable，NT$60）
  - RevenueCat → 建立 Offering → 綁定剛建立的產品
  - 取得 iOS Public SDK Key → 填入 `app/.env` 的 `EXPO_PUBLIC_REVENUECAT_API_KEY`

- [ ] **建立 Anthropic 帳號並儲值**
  - 網址：console.anthropic.com
  - 建立 API Key → 填入 Supabase Edge Functions Secrets 的 `ANTHROPIC_API_KEY`
  - 初期儲值 $10 USD 觀察用量

---

## EAS Build 準備

- [ ] **`eas login` + `eas init`**
  - 在 terminal 執行：
    ```bash
    cd app
    eas login          # 輸入 Expo 帳號（可用 savelyn.siao@gmail.com 或新建）
    eas init           # 建立專案，自動填入 app.json 的 projectId
    ```

- [ ] **`eas build --platform ios --profile preview`**
  - 建立 TestFlight 測試包
  - 首次需要輸入 Apple ID 憑證

- [ ] **`eas submit --platform ios --profile production`**
  - 送出正式版
  - 需先填好 `eas.json` submit 區段的 `appleId`、`ascAppId`、`appleTeamId`

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

- [ ] **App Store Connect 建立 App 條目**
  - Bundle ID：`com.savelyn.studyanywherevoyage`
  - 定價：NT$60（iOS Price Tier 1）
  - 分類：Education / Reference
  - 年齡分級：4+
  - 填入隱私政策 URL

- [ ] **設定 Apple 審核用測試帳號**
  - 建立一個 email/password 帳號（可用 + 記法，如 `savelyn.siao+review@gmail.com`）
  - 在 Supabase Dashboard 手動為這個帳號加入 10 點 credits
  - 在 App Store Connect → App 審查資訊 → 填入帳號/密碼

---

## 財務帳號設定（上架前必做）

- [x] **Apple Developer Program** — 已購買（savelyn.siao@gmail.com，2026-03-20）
- [ ] **Google Play Console** — $25 USD 一次性（play.google.com/console）
- [ ] **Apple Small Business Program（15% 抽成）** — 免費申請（developer.apple.com/app-store/small-business-program）
- [ ] **Apple Store Connect 銀行資訊 + 稅務資料** — 在 App Store Connect → Agreements, Tax, and Banking
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

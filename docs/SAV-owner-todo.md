# SAV 產品負責人 To-Do 清單

這份清單記錄需要你（Savelyn）親自完成的事項，不屬於工程開發範疇。

---

## 上架前必做（不做就無法上架）

- [ ] **申請 Apple Developer Program**
  - 費用：$99 USD / 年
  - 網址：developer.apple.com/programs/enroll
  - 用途：才能使用 EAS Build 送審、TestFlight、App Store Connect

- [ ] **申請 Google Play Console**
  - 費用：$25 USD（一次性）
  - 網址：play.google.com/console
  - 用途：才能上架 Google Play

- [ ] **申請 Apple Small Business Program（15% 抽成）**
  - 費用：免費
  - 時機：Apple Developer Program 申請完成後即可申請
  - 網址：developer.apple.com/app-store/small-business-program
  - 效果：App Store 抽成從 30% 降至 15%，每筆 NT$60 多拿 ~NT$9

- [ ] **申請 Google Play 小型開發者方案（15% 抽成）**
  - 費用：免費
  - 時機：Google Play Console 建立後，在「付款設定」中確認
  - 效果：年收入 $1M USD 以下自動適用 15%

---

## 服務帳號建立

- [ ] **建立 Supabase 帳號**
  - 網址：supabase.com
  - 免費方案足夠 v1 使用

- [ ] **建立 Cloudflare 帳號**
  - 網址：cloudflare.com
  - 用途：R2 儲存 TTS 音訊檔（免費額度足夠）

- [ ] **建立 OpenAI 帳號並儲值**
  - 網址：platform.openai.com
  - 用途：預生成所有 TTS 音訊（預估 $5–10 USD 一次性費用）
  - 儲值 $10 USD 即可

- [ ] **建立 RevenueCat 帳號**
  - 網址：revenuecat.com
  - 免費方案支援月收入 < $2,500 USD

- [ ] **建立 Anthropic 帳號並儲值**
  - 網址：console.anthropic.com
  - 用途：AI 批改（後端呼叫 Claude API）
  - 按用量計費，初期儲值 $10 USD 觀察用量

---

## App Store 上架材料（開發後期準備）

- [ ] **準備 App Store 截圖**
  - 需要尺寸：iPhone 6.7"（必要）、iPhone 6.5"（建議）、iPad 12.9"（如支援）
  - 至少 3 張，每個分頁各一張效果最好

- [ ] **撰寫 App Store 描述文案**
  - 繁體中文（主要市場）
  - 英文（選填，但建議有）
  - 我可以幫你起草

- [ ] **準備隱私政策頁面網址**
  - Apple 上架強制要求
  - 我會幫你寫內容；你需要一個可公開訪問的網址來放它
  - 最簡單做法：GitHub Pages 或 Notion 公開頁面（免費）

- [ ] **填寫 App Store Connect Privacy Nutrition Labels**
  - 聲明 App 收集哪些用戶資料（帳號資料、麥克風使用等）
  - 我會在隱私政策完成後協助你對照填寫

- [ ] **設定 Apple 審核用測試帳號**
  - 一組已有點數的帳號，提供給 Apple 審核員測試 AI 批改功能
  - 在 App Store Connect 的「App 審查資訊」填入帳號密碼

---

## 財務與法律

- [ ] **確認付款收款方式**
  - Apple / Google 會匯款至你的銀行帳戶
  - 需要在 Apple Store Connect 和 Google Play Console 設定銀行資訊、稅務資料

- [ ] **確認是否需要統一編號 / 公司設立**
  - 個人名義上架可行，但收入需要申報
  - 如果規模成長，考慮設立公司（有限公司或行號）

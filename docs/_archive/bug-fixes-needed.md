# 待修改清單（工程師待辦）
> 測試過程中發現的問題


---

## 📝 你要確認（內容問題）

- [ ] **#12 Daily Pattern 標記**
  - Listen tab 內的 vocab 標記，目前只顯示不可點
  - 確認這是否是你要的設計，或需要做成可展開說明

- [ ] **#13 Key Phrases 內容**
  - Listen tab 最下方的 KEY PHRASES 區塊
  - 確認 episodes 資料中 key_phrases 欄位內容是否正確

- [ ] **#16 中文提示裡還有英文**
  - Conversation tab 的「中文提示」按鈕顯示的內容
  - 來自資料庫 questions 表的 hint_zh 欄位
  - 需要你去 Supabase Table Editor → questions → 逐筆確認並修改

---

## 📝 你要做（非工程）

- [ ] **Google OAuth Client Secret**
  - Google Cloud Console → 憑證 → 建立 Web 應用程式類型的 OAuth 用戶端 ID
  - Redirect URI：`https://ioosxzbdkscllgesmeqw.supabase.co/auth/v1/callback`
  - 建立後將 Client ID + Client Secret 填入 Supabase → Authentication → Providers → Google

- [ ] **Anthropic 餘額監控**
  - 目前儲值 $5 USD，可支撐約 3,472 次 AI feedback
  - 有用戶後記得定期查看並補儲值（建議到 $20–50 USD）
  - ⚠️ 餘額歸零 API 就停，沒有自動扣款

---

## ✅ 工程師已修完

| # | 項目 | 日期 |
|---|------|------|
| 1 | 移除 Expo Dev Tools 按鈕 | 2026-04-03 |
| 2 | 登入畫面品牌標題重設計（S/A/V 字母放大、加粗、金色） | 2026-04-03 |
| 3 | Google 登入按鈕加 Google icon | 2026-04-03 |
| 4 | 確認信寄件者：Custom SMTP via Resend，寄件者名稱 Notch Up | 2026-04-04 |
| 5 | 確認信 redirect：Site URL + Redirect URLs 設為 app scheme | 2026-04-04 |
| 6 | Tab bar 全部可見（移除 ScrollView，改 flex 佈局） | 2026-04-04 |
| 7 | Listen tips：標題→Listen、我知道了→Got it | 2026-04-03 |
| 8 | Listen 播放自動往下繼續（useAudioPlayerStatus + didJustFinish） | 2026-04-03 |
| 9 | Listen 按下一段無延遲（player.replace()） | 2026-04-03 |
| 10 | Listen 速度調整（player.setPlaybackRate） | 2026-04-03 |
| 11 | Listen 按中文不跳頂 + 跟著目前播放行 | 2026-04-04 |
| 14 | Conversation tips：標題→Conversation、我知道了→Got it | 2026-04-03 |
| 15 | Conversation 題目字體縮小（22→17） | 2026-04-03 |
| 17 | AI feedback edge function 重新 deploy | 2026-04-03 |
| 18 | 新用戶 3 credits 提示加入 Conversation tips | 2026-04-03 |
| 19 | Review tips：標題→Review、我知道了→Got it | 2026-04-04 |
| 20 | Speak tips：標題→Speak、我知道了→Got it | 2026-04-04 |
| 21 | Speak STOP 修正（manuallyStopped ref） | 2026-04-04 |
| 22 | Speak 停下後繼續從同段落開始 | 2026-04-05 |
| 23 | Listen 停下後繼續從同行開始 | 2026-04-05 |
| 24 | Tab 順序：Schedule→Listen→Conv→Speak→Review→Acct | 2026-04-05 |
| 25 | 移除 Logo，Tab 縮寫：SCHED/LISTEN/CONV/SPEAK/REVIEW + icon only | 2026-04-05 |
| 26 | 修正雙重 SafeAreaView 造成頂部空白 | 2026-04-05 |
| 27 | 開啟 app 預設頁面改為 Schedule | 2026-04-05 |
| 28 | 新增 Account tab（Credits、帳號管理、法律連結、版本號） | 2026-04-06 |
| 29 | Schedule 週全部完成後標題變灰 | 2026-04-06 |
| 30 | 課程改為滾動式 365 天（從每位使用者的 curriculumStartDate 起算） | 2026-04-05 |
| 31 | Conv 的 X CR 按鈕可點擊跳到 Account tab | 2026-04-06 |
| 32 | Google 登入按鈕字體改大 | 2026-04-06 |
| 33 | 登入錯誤訊息更友善（密碼錯/帳號不存在/未確認信） | 2026-04-06 |

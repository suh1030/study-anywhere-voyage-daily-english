# Pre-Launch Checklist — Notch Up: Daily English
> 建立日期：2026-03-27
> 每項必須親自測試確認，打勾才算完成

---

## 🔴 P0 — 上架前必須完成（封鎖上架）

### 資料庫
- [x] 執行 `npm run seed`，將本地已驗證的全年內容同步到 Supabase（已同步 365 episodes / 365 articles / 365 questions / 583 flashcards）
- [ ] 打開 app，確認 Listen / Speak / Conversation / Review 四個 Tab 都能顯示內容（不是空白或 loading）

### 帳號與登入
- [ ] Email 登入：註冊 → 收信 → 確認 → 登入，完整流程可用
- [ ] Apple Sign In：iOS 裝置實測可登入（Supabase provider 需先設定完成）
- [ ] Google Sign In：iOS 裝置實測可登入
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

### App Store 硬性需求
- [ ] Apple Sign In 功能完整可用（Apple 規定：有第三方登入必須提供 Apple Sign In）
- [ ] 隱私政策連結可開啟（設定頁 / App Store 頁面）
- [ ] 條款連結可開啟

---

## 🟡 P1 — 上架前強烈建議完成

### App Store Connect
- [ ] 截圖準備完成（iPhone 6.7" 至少 3 張，需含真實 UI 畫面）
- [ ] App 描述、關鍵字填寫完成（參考 `docs/app-store-copy.md`）
- [ ] Apple 審查測試帳號建立（email + 密碼帳號，餘額 10 credits）
- [ ] 審查備註填寫（說明 IAP 測試方式、測試帳號）
- [ ] 年齡分級問卷填寫完成
- [ ] 新 build 已提交（含所有 bug fixes：RevenueCat、ListenScreen、AuthStore）

### 內容品質
- [x] 按接近 10 分鐘的長篇規格重新生成 **全部 365 集**（6 parts、每集 48 行）
- [x] 完成全年內容檔對齊與驗證：episodes / articles / questions / flashcards 已更新為 365 天版本，並驗證通過（角色階段、結構、主題對齊、內容檔覆蓋完整）
- [x] 完成產品內容全量稽核：365 天 schedule 與 episodes / articles / questions / flashcards 全數對齊，無缺日、缺週、缺欄位
- [ ] 全年 365 集新版 podcast 音檔重新生成並上傳（正式採用 `tts-1`；舊短版音檔已清除，新版長篇音檔重跑中，依目前內容量估算約 NT$1,230）
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
- [ ] 確認 Supabase 用量，若接近 1 GB 評估遷移音檔至 Cloudflare R2

### 監控
- [ ] 確認 Supabase 有開 Edge Function 錯誤通知
- [ ] 確認 RevenueCat Dashboard 能看到購買紀錄

---

## 已知技術債（不封鎖上架，但需記錄）

| 項目 | 說明 |
|------|------|
| EAS Build 次數限制 | 確認 Expo 免費方案剩餘次數 |
| Apple Sign In Supabase 設定 | 需在 Supabase Auth → Providers → Apple 填入憑證 |

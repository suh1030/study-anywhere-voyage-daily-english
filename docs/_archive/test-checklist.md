# 上架前測試清單
> 用 TestFlight 或 Simulator 進行，每項親自確認後打勾

---

## 1. 帳號與登入

- [ ] Email 登入：在 app 內註冊新帳號 → 收確認信 → 點連結 → 登入成功
- [ ] Apple Sign In：點「Sign in with Apple」→ 跳出 Apple 授權視窗 → 登入成功
- [ ] Google Sign In：點「Sign in with Google」→ 跳出 Google 授權視窗 → 登入成功
- [ ] 登出後重新登入：點數和進度正確恢復

---

## 2. 四個 Tab 基本功能

- [ ] **Schedule Tab**：顯示今日課程，不是空白或 loading
- [ ] **Listen Tab**：顯示今日集數內容，不是空白或 loading
- [ ] **Speak Tab**：顯示今日文章，不是空白或 loading
- [ ] **Conversation Tab**：顯示今日問題，不是空白或 loading
- [ ] **Review Tab**：顯示單字卡，不是空白或 loading

---

## 3. Listen 模組

- [ ] 點擊播放按鈕，音檔開始播放
- [ ] 播放時 highlight 跟著跳行
- [ ] 播完一行自動跳到下一行
- [ ] 無音檔時系統 TTS 自動朗讀，不 crash

---

## 4. Speak 模組

- [ ] 點擊麥克風開始錄音
- [ ] 錄音結束後可播放回放
- [ ] 點擊段落可聽示範朗讀

---

## 5. Conversation 模組

- [ ] 輸入英文回答後按送出，鍵盤收起
- [ ] 約 5-15 秒後收到 AI 批改回饋
- [ ] 回饋內容包含文法說明和建議
- [ ] Credits 數量正確扣除（每次 -1）
- [ ] Credits 用完時顯示「點數不足」提示，不 crash

---

## 6. IAP 購買流程

- [ ] 點「BUY 10 CREDITS」，出現 Apple 付款視窗
- [ ] 完成購買後 8 秒內，Credits 餘額增加 10
- [ ] 沙盒測試帳號可正常完成購買流程

---

## 7. Review 模組

- [ ] 單字卡正確顯示英文和中文
- [ ] 點擊單字卡可翻面
- [ ] 標記「已掌握」後卡片正確更新

---

## 8. Profile / 設定

- [ ] 點擊隱私政策連結，正確開啟網頁
- [ ] 點擊使用條款連結，正確開啟網頁
- [ ] 登出功能正常

---

## 9. 邊界情況

- [ ] 飛航模式下開啟 app，不 crash（顯示友善錯誤）
- [ ] 深色模式下畫面顯示正常
- [ ] 淺色模式下畫面顯示正常

---

## 測試環境

- 裝置：iPhone 15 Pro（實機）
- 版本：TestFlight build #7
- 帳號：`a0925302127@gmail.com` / `asd0925302127`（已有 10 credits）

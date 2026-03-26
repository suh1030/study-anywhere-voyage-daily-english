# SAV Daily English — TestFlight 測試清單

> 在提交 App Store 審核之前，請用 TestFlight 完整跑過以下測試項目。
> 測試裝置建議：iPhone（真機），iOS 16+

---

## Auth 登入流程

- [ ] **Email 註冊**：輸入新 email + 密碼 → 收到確認信 → 點擊確認 → 能登入
- [ ] **Email 登入**：已確認帳號正常登入
- [ ] **錯誤處理**：輸入錯誤密碼 → 顯示錯誤訊息（不 crash）
- [ ] **Sign in with Apple**：點擊後跳出 Apple 授權 → 成功登入（iOS 真機必測）
- [ ] **Google Sign In**：點擊後跳出 Safari 授權頁 → 成功登入
- [ ] **登入後狀態**：進入主畫面，Schedule tab 顯示正確當週內容
- [ ] **登出**：Schedule 右上角 → PROFILE → SIGN OUT → 返回登入畫面

---

## Schedule

- [ ] 畫面載入不 crash，顯示本週課程
- [ ] 自動捲動至今日
- [ ] 點擊 Listen 行 → 跳轉 Listen tab
- [ ] 點擊 Speak 行 → 跳轉 Speak tab
- [ ] 點擊 Conversation 行 → 跳轉 Conversation tab
- [ ] 打勾某天 → 標記完成（勾選狀態正確顯示）
- [ ] 打勾後關閉 App 重開 → 進度仍在（本地快取）
- [ ] App 進入背景後重回前景 → 進度已同步至雲端
- [ ] Profile 右上角：顯示 credits 餘額或「PROFILE」文字
- [ ] Profile 彈窗：正確顯示 email 和 credits 數字

---

## Listen

- [ ] 載入今日 Episode，顯示標題和逐行腳本
- [ ] 點擊任一行 → TTS 朗讀該行（聽到聲音）
- [ ] PLAY 按鈕 → 從第一行開始播放
- [ ] `<` / `>` 按鈕 → 上一行 / 下一行
- [ ] Speed 切換（0.75 / 1.0 / 1.25）→ 即時改變朗讀速度
- [ ] 中文 ON/OFF → 切換顯示/隱藏中文翻譯
- [ ] KEY PHRASES 展開 → 顯示關鍵片語清單
- [ ] 離開 Listen tab → 聲音停止（不繼續播放）

---

## Speak

- [ ] 載入今日文章，顯示標題、段落
- [ ] 點擊任一段落 → TTS 朗讀該段（聽到聲音）
- [ ] PLAY 按鈕 → 從第一段開始
- [ ] 中文 ON/OFF → 顯示/隱藏中文翻譯
- [ ] RECORD 按鈕 → 提示麥克風權限（首次）→ 開始錄音（按鈕變 STOP REC）
- [ ] STOP REC → 停止錄音 → 出現 PLAYBACK 按鈕
- [ ] PLAYBACK → 播放剛才的錄音（聽到自己的聲音）
- [ ] 開始錄音後 TTS 自動停止（不同時播放）
- [ ] VOCABULARY 區塊正確顯示生詞和定義

---

## Conversation

- [ ] 載入今日題目，顯示英文問題和中文提示
- [ ] 顯示目前 credits 餘額
- [ ] 有 credits 時：輸入答案 → GET AI FEEDBACK → 顯示 AI 批改結果（繁體中文）
- [ ] 批改後 credits 減少 1（顯示更新後餘額）
- [ ] 無 credits 時：顯示 BUY CREDITS 按鈕 → 點擊後跳出 App Store 購買介面
- [ ] TRY AGAIN → 清空答案和批改結果，可重新作答
- [ ] 答案為空時提交 → 顯示提示訊息，不送出請求
- [ ] Show hint / Hide hint 正常切換

---

## Review

- [ ] 載入本週字卡網格（2 欄）
- [ ] 點擊字卡 → 翻面顯示中文 + 例句
- [ ] 長按字卡 → 標記為「已掌握」（透明度降低，顯示 MASTERED）
- [ ] 再次長按 → 取消掌握
- [ ] Filter 篩選：ALL / LISTEN / SPEAK / MASTERED / LEARNING 各自正確過濾
- [ ] 進度統計（X/Y mastered）正確計算

---

## 邊界情境

- [ ] **無網路情況**：先載入過的頁面 → 顯示快取資料（不 crash）
- [ ] **首次使用**：全新帳號登入 → 所有頁面正確顯示（沒有舊進度干擾）
- [ ] **今日無內容**（非課程日）：各 tab 顯示 "No episode/article/question for today." 而不是 crash
- [ ] **跨 tab 快速切換**：連續切換 5 次 → 不 crash，不記憶體爆炸
- [ ] **螢幕旋轉**（若允許）：不影響正常使用

---

## 送審前最終確認

- [ ] App icon 正確顯示（不是空白）
- [ ] Splash screen 正確顯示
- [ ] 沒有任何「測試」、「TODO」、「debug」等文字出現在 UI 上
- [ ] 所有 Alert/錯誤訊息都是正式用語（非開發用語）
- [ ] 測試帳號資料已準備好（email + 密碼 + credits ≥ 3）
- [ ] 隱私政策 URL 可正常訪問
- [ ] App Store 截圖已準備好

---

## 已知限制（v1.0 接受）

- 音訊播放使用裝置 TTS，非專業配音（v2 可升級為 OpenAI TTS）
- 學習進度採最後寫入勝出（last-write-wins），多裝置同步可能覆蓋
- Conversation 批改僅限文字，無法評估發音

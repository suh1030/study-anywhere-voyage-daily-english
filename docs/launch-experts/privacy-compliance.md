# Notch Up! — 資料隱私合規審查報告

> 審查人：Data Privacy Officer（上線團隊）
> 日期：2026-07-10
> 範圍：Apple / Google 隱私標籤一致性、隱私政策揭露完整性、台灣個資法 / GDPR / CCPA 缺口、口說/對話文字送 AI 之告知
> 依據來源（已實際核對程式碼與 schema，非僅讀文件）：
> - `docs/privacy-nutrition-labels.md`
> - `docs/legal/privacy-policy.html`、`docs/legal/terms-of-service.html`
> - `backend/supabase/migrations/20260320000000_initial_schema.sql`、`20260625000000_add_tutor_daily_usage.sql`
> - `backend/supabase/functions/feedback/index.ts`、`tutor-chat/index.ts`、`delete-account/index.ts`
> - `app/src/stores/creditsStore.ts`、`app/src/data/learning-context.ts`、`app/src/screens/tabs/AccountScreen.tsx`

**免責：本文件為隱私合規建議，非正式法律意見。涉及具拘束力的法律判斷或爭訟，請洽台灣個資法／跨境資料合格律師。**

---

## 0. 上線封鎖項摘要（先看這個）

| # | 項目 | 嚴重度 | 為何封鎖 |
|---|---|---|---|
| **B1** | Apple App Privacy 標籤**未申報 User Content（對話批改答案 + Polaris 對話文字）**，且文件用「暫時處理＝不需揭露」的錯誤理由自我豁免 | 🔴 上線封鎖 | 與 App 自己的隱私政策**自相矛盾**（政策承認文字送第三方 AI）。Apple 審查會交叉比對兩者，屬 Guideline 5.1.1 / App Privacy 不實申報的常見退件原因 |
| **B2** | Google Play Data Safety **同樣漏申報 User Content**，且「Shared＝No」與實際送出給 Anthropic/Groq/OpenRouter 不符 | 🔴 上線封鎖 | Data Safety 要求申報是否「分享」給第三方；送文字給外部 AI 供應商屬 sharing，需勾選 |
| **B3** | `docs/privacy-nutrition-labels.md` 第 60–70 行的「Voice Recordings / User-Submitted Text 不需揭露」說明本身是**錯誤填寫指引**，會導致團隊填出不實標籤 | 🔴 上線封鎖 | 需改寫指引本身，否則 B1/B2 會重複發生 |
| **B4** | 隱私政策**缺跨境傳輸告知**：營運者與使用者都在台灣，個資（含練習文字）實際流到美國 AI/雲端供應商，政策未明說「資料會傳輸至台灣境外」 | 🟠 上線前應修 | 台灣個資法最佳實務要求告知國際傳輸；若有任何歐盟使用者則為 GDPR Art. 13(1)(f) 硬性要求 |

已做得好、**不需**改的部分見第 5 節（避免過度修改）。

---

## 1. 實際資料收集 vs 標籤申報（核對結果）

### 1a. App 實際處理的個資（依 schema + 程式碼還原）

| 資料 | 來源 / 儲存 | 送往第三方？ |
|---|---|---|
| Email、User ID | `auth.users`（Supabase Auth） | Supabase；Apple/Google 登入回傳 |
| 顯示名稱 / full_name | `profiles.display_name`（OAuth meta） | Supabase |
| 學習進度（completed_days、mastered_cards） | `user_progress` | Supabase |
| 點數餘額與交易紀錄（含 description） | `credits`、`credit_transactions` | Supabase；購買經 RevenueCat |
| Polaris 每日用量計數 | `tutor_daily_usage` | Supabase |
| **對話批改文字（question + answer）** | **不入庫**；即時送出 | **Anthropic API（Claude Haiku）** |
| **Polaris 家教聊天文字（最多 20 則、每則 ≤2000 字）+ 學習脈絡** | **不入庫**；即時送出 | **Groq / OpenRouter** |
| 語音錄音 | **僅存裝置本機** | **不上傳**（已核對 `feedback`/`tutor-chat` 無任何 audio 處理，屬實）|
| 購買憑證 | Apple/Google → RevenueCat | RevenueCat |
| 技術紀錄（IP、request log） | 各供應商營運日誌 | Supabase/Anthropic/Groq/OpenRouter/RevenueCat |

### 1b. 標籤一致性判定

| 項目 | 標籤現況 | 實際 | 判定 |
|---|---|---|---|
| Email / User ID / Usage / Purchases | 已申報、Linked、非 Tracking | 相符 | ✅ 一致 |
| **User Content（練習/聊天文字）** | **未列入**，文件稱「不需揭露」 | 逐字送第三方 AI，供應商可能留存日誌 | 🔴 **不一致（B1/B2）** |
| Voice / Audio | 標「不收集，僅本機」 | 程式碼證實無上傳 | ✅ 一致（但每次送審前需重驗此假設）|
| Diagnostics / Crash | 標「不收集，無 SDK」 | `package.json` 無 Sentry/Firebase/analytics 等 | ✅ 可辯護（低風險）|
| Tracking = No（全項） | 無廣告/分析 SDK | 相符 | ✅ 一致 |

**核心問題（B1）**：文件第 66–68 行主張「送 AI 批改的文字是暫時處理、不儲存 → 不需揭露」。這是對 Apple 規則的誤解。Apple 的「暫時處理」豁免要求資料**不得離開裝置**（僅為完成請求且不留存）。本 App 的文字**離開裝置送到第三方 AI 供應商**，且供應商可能於日誌留存 → **不符暫時豁免，必須申報為 User Content**。Google Play 亦同（屬 sharing）。

---

## 2. 口說 / 對話文字送 AI 的告知（任務指定重點）

**結論：政策與條款層面「有」清楚告知；標籤層面「沒有」，且兩者互相矛盾——這正是最大風險。**

- ✅ 隱私政策 §1「AI Practice Submissions」明說文字會送到伺服器與 AI 供應商，並區分 Anthropic（對話批改）與 Groq/OpenRouter（Polaris）。
- ✅ 服務條款 §6、§7 明確授權處理與 AI 免責。
- ✅ 已釐清：Speak 模組錄音僅本機；送 AI 的「答案」是使用者**打字輸入的文字**，非語音轉錄（程式碼證實 `feedback` 只收 text）。政策 §3 表述與現行 build 一致。
- 🔴 **矛盾點**：隱私政策承認文字送第三方 AI，但 Apple/Google 標籤卻宣稱不收集任何 User Content。審查員會抓這個矛盾（B1/B2）。
- 🟡 **建議（非封鎖）**：在對話送出／首次進入 Polaris 時加一句 just-in-time 提示（例：「你的文字會傳送給 AI 服務商以產生回饋」）。政策已涵蓋則非強制，但能降低審查與客訴風險。

---

## 3. 隱私政策揭露完整性審查

| 檢查項 | 狀態 | 說明 |
|---|---|---|
| 第三方處理者揭露 | ✅ 完整 | Supabase、Anthropic、Groq、OpenRouter、RevenueCat、Apple/Google 六者全列，附政策連結。**這點做得好** |
| 資料保留 | ✅ 大致足夠 | 帳號存續期間保留；驗證後 30 天內刪除；AI 供應商依其政策留存 |
| 使用者權利（含帳號刪除） | ✅ 有 | 存取/更正/刪除/可攜；App 內有刪除鍵（`AccountScreen`）+ `delete-account` Edge Function（Apple 5.1.1(v) 已滿足）|
| 帳號刪除實際範圍 | ✅ 正確 | `delete-account` 刪 `auth.users`，其餘表皆 `ON DELETE CASCADE` 連動清除，與政策承諾相符 |
| 兒童隱私 | ✅ 有 | 13+；政策與條款一致 |
| **跨境傳輸** | 🟠 **缺（B4）** | 未明說個資傳輸至台灣境外（美國）。見第 4 節補充條文 |
| **GDPR 法律依據（Art. 6）** | 🟠 缺（若面向國際） | 政策未載明各處理之 lawful basis |
| **CCPA 專節** | 🟠 缺（若有加州使用者） | 未列 PI 類別、opt-out、非歧視、授權代理人 |

---

## 4. 合規缺口清單與**具體待補條文**

### 4a. 台灣《個人資料保護法》

台灣個資法第 8/9 條要求告知蒐集之目的、個資類別、利用期間/地區/對象/方式及當事人權利。現行政策大致涵蓋，但**跨境傳輸與個資法權利語言需補強**。

**待補條文一：跨境傳輸（同時滿足 PDPA 最佳實務與 GDPR）—— 建議新增為隱私政策 §5A**

> **International Data Transfers（國際資料傳輸）**
> Notch Up! is operated from Taiwan. To provide the App, your personal data — including account data, learning progress, and the text you submit for Conversation feedback or Polaris tutoring — is processed by service providers located **outside Taiwan, primarily in the United States** (Supabase, Anthropic, Groq, OpenRouter, RevenueCat). These transfers are necessary to perform the service you request. We rely on these providers' contractual and security commitments to protect your data during and after transfer. By using the AI features, you understand that the text you submit will be transmitted internationally for processing.
>
> 中文摘要：本 App 由台灣營運，為提供服務，您的個人資料（含帳號、學習進度，以及您送出批改／家教的文字）會傳輸至台灣境外（主要為美國）之服務供應商處理。使用 AI 功能即表示您了解相關文字將被國際傳輸以完成處理。

**待補條文二：個資法權利指引 —— 建議在隱私政策 §7 末補一段**

> If you are located in Taiwan, you may exercise the rights granted under the Personal Data Protection Act (個人資料保護法), including inquiry, review, duplication, supplementation/correction, and deletion, and you may request that we cease collection, processing, or use of your personal data. Contact us at savelyn.siao@gmail.com.

### 4b. GDPR（僅在 App 對歐盟開放下載時為硬性要求）

若上架僅限台灣區，可降為低優先；若全球上架，下列為缺口：

- **法律依據**：於政策各處理項目標注 lawful basis。建議：帳號/進度/購買 → Art. 6(1)(b) 契約履行；AI 功能 → Art. 6(1)(b) 契約履行（使用者主動請求）；防濫用之每日上限與安全日誌 → Art. 6(1)(f) 正當利益。
- **AI 供應商角色**：於 DPA 中確認 Anthropic/Groq/OpenRouter 為 processor 而非 controller，並確認其是否將輸入用於訓練（若用於訓練，法律依據與告知需相應調整；建議選用 zero-retention / no-training 方案）。
- **監理機關申訴權**：政策應告知歐盟使用者有向所在國資料保護機關申訴之權利。

**待補條文三（GDPR 用）—— §7 補一句**

> Where GDPR applies, our lawful bases are performance of a contract (Art. 6(1)(b)) for account, progress, purchase, and AI feedback features, and legitimate interests (Art. 6(1)(f)) for abuse prevention and security logging. You have the right to lodge a complaint with your local supervisory authority.

### 4c. CCPA / CPRA（僅在對加州使用者開放時）

- 現況「不販售、不用於廣告、不建立廣告輪廓」已符合 CCPA 對「不賣資料」的核心要求（正面）。
- 若有加州使用者，需補：所收集 PI 類別對照、Right to Know/Delete/Correct/Opt-out、非歧視條款、授權代理人提出請求之方式。App 已有刪除功能，落地不難。

---

## 5. 已達標、**請勿過度修改**的部分

為避免上線前無謂改動，以下確認合規、維持現狀即可：

1. 六家第三方處理者揭露**完整且附連結** —— 業界少見的到位，保留。
2. 帳號刪除（App 內按鈕 + Edge Function + CASCADE）**已滿足 Apple 5.1.1(v)**，且政策承諾與實作一致。
3. 語音錄音僅本機、不上傳 —— 程式碼證實，標籤申報正確。
4. 無廣告/分析/當機 SDK —— Tracking＝No 與 Diagnostics＝Not collected 可辯護。
5. Email/User ID/Usage/Purchases 四類標籤申報正確。

---

## 6. 修正動作清單（給工程/上架負責人）

**上線封鎖，送審前必做：**
- [ ] **B1** Apple App Privacy 新增 **Data Type: User Content → Other User Content**；Collected＝Yes、Linked＝Yes、Tracking＝No、Purpose＝App Functionality。（涵蓋對話批改答案 + Polaris 聊天文字）
- [ ] **B2** Google Play Data Safety 新增 **Messages / Other in-app messages（或 User content）**：Collected＝Yes、**Shared＝Yes**（送第三方 AI 供應商）、用途＝App functionality、可要求刪除＝Yes。
- [ ] **B3** 改寫 `docs/privacy-nutrition-labels.md` 第 60–70 行：刪除「不需揭露」的錯誤理由，改為「送第三方 AI 之文字＝User Content，必須申報」的正確指引，並更新第 78–88、95–102 行的填寫摘要表。

**上線前強烈建議：**
- [ ] **B4** 隱私政策加入「待補條文一：跨境傳輸」（§5A）並更新 Last Updated 日期。
- [ ] 加入待補條文二（個資法權利）。
- [ ] 若全球上架：加入待補條文三（GDPR 法律依據）+ CCPA 專節。
- [ ] 確認 Anthropic/Groq/OpenRouter 的資料留存與「是否用於模型訓練」設定，並在 §4 或 §6 補一句留存/訓練說明（建議明確選 no-training 方案）。

**低優先（可上線後跟進）：**
- [ ] Polaris 首次使用 / 對話送出時加 just-in-time「文字將傳送給 AI」提示。
- [ ] 每次送審前重新驗證「語音仍僅本機」假設未因新功能改變。

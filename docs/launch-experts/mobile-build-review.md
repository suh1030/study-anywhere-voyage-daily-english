# Mobile Build Review — Notch Up!（iOS App Store 上架技術審查）

> 審查日期：2026-07-10
> 範圍：**只審 `app/` 建置與上架技術面**（EAS 設定、app.json、SDK/RN 相容性、build→submit runbook）。
> 不含 backend/ 與 content/，亦不重複 [engineering-review-2026-07-10.md](../engineering-review-2026-07-10.md) 的功能/安全審查。
> 方法：純靜態審查 + `npx expo-doctor`（未跑 `eas build`，不消耗額度）。
> 環境事實：Expo SDK 55（node_modules expo 55.0.8）、RN 0.83.2、React 19.2.0、managed / CNG workflow。

---

## 判定

**目前狀態：尚不可直接 `eas build` 送審。有 2 個封鎖項、2 個高風險項須先處理。**

- 🔴 **B1**：本機殘留的 `ios/`（6/8 prebuild）會被 EAS 上傳並覆蓋 CNG，導致用「舊的原生專案」出 build，app.json 自 6/8 之後的所有變更（含改名 Notch Up!、權限字串）**不會生效**。
- 🔴 **B2**：缺少 `expo-audio` 的必要 peer dependency `expo-asset`，正式 build（非 Expo Go）可能在音檔/Listen 流程 **crash**。
- 🟠 **B3**：`newArchEnabled: false` 在 SDK 55 已非合法欄位、被忽略 → app 實際是以 **New Architecture** 出 build，與團隊認知相反，且 config schema 驗證失敗。
- 🟠 **B4**：14 個套件與 SDK 55 鎖定版本不符（含 RN 0.83.2 vs 0.83.6、expo 55.0.8 vs 55.0.27），未對齊有原生層相容風險。

修掉 B1/B2、處理 B3/B4 後即具備出 build 條件。其餘（憑證、submit 參數）設定正確。

---

## 1. EAS Build 設定審查（`eas.json`）

整體正確，可用於正式上架，僅 1 個由 `.easignore` 造成的封鎖交互作用（見 B1）。

| 項目 | 狀態 | 說明 |
|------|------|------|
| `production.distribution: store` | ✅ | 正確，出 App Store 用的 device build（無 simulator）。 |
| `production.channel: production` | ✅ | 對應 expo-updates channel，與 app.json `updates.url` 一致。 |
| `production.autoIncrement: true` | ✅ | 搭配 `appVersionSource: remote`，buildNumber 由 EAS 遠端遞增。 |
| `cli.appVersionSource: remote` | ✅ | 正確。**注意**：此模式下 app.json 的 `ios.buildNumber: "1"` 與 `android.versionCode: 1` 會被忽略，改由 EAS 遠端記錄；`version`（1.0.0）仍取自 app.json。首發無影響，只是別再手動改 buildNumber。 |
| 憑證管理 | ✅（remote，需首次互動） | eas.json 未寫 credentials 區塊 → EAS 遠端託管 distribution cert + provisioning profile。首次 `eas build` 會互動式產生/沿用。已購 Apple Developer（memory 有記錄）→ 可行。**前置**：App ID 需啟用「Sign in with Apple」capability（見 §2 entitlements）。 |
| `submit.production.ios` | ✅ | `appleId` / `ascAppId: 6761168417` / `appleTeamId: HCP29T4B9C` 齊全 → `eas submit` 可非互動執行。 |
| production `env`（Supabase/RevenueCat） | ✅ | 皆為公開金鑰（anon key、RevenueCat public SDK key），內嵌合理；已與 engineering-review C1 修復一致。EAS build 時 eas.json `env` 優先於 `.env` 檔，production 環境已被釘死為雲端。 |
| `submit.production.android.serviceAccountKeyPath` | ⚪ 資訊 | 指向不存在的 `./google-service-account.json`。**僅 Android submit 用**，本次 iOS 首發不影響；若之後上 Google Play 需補此檔（現為 P2）。 |
| `runtimeVersion` policy | ✅ | 見 §2。 |

**結論**：eas.json 本身無封鎖問題。真正的雷在 `.easignore`（B1）。

---

## 2. `app.json` 審查

| 欄位 | 值 | 判定 |
|------|-----|------|
| `ios.bundleIdentifier` | `com.savelyn.studyanywherevoyage` | ✅ 合法 reverse-DNS，須與 ASC 上 App（ascAppId 6761168417）綁定的 bundle id 完全一致 → 上線前用 ASC 對一次。 |
| `ios.buildNumber` | `"1"` | ⚪ 被 `appVersionSource: remote` 忽略（見 §1）。 |
| `version` | `1.0.0` | ✅ 首發合理；同時作為 `runtimeVersion`（policy appVersion）。 |
| `runtimeVersion.policy` | `appVersion` | ✅ runtimeVersion = "1.0.0"，OTA 更新僅套用相同 runtimeVersion。正確且穩定。 |
| `ios.infoPlist.NSMicrophoneUsageDescription` | 有（"Notch Up! needs microphone…"） | ✅ 文案正確、與 expo-audio 錄音用途相符。**但**殘留 `ios/` 內是舊字串「**SAV** needs microphone…」→ 見 B1，須讓 CNG 重生才會用到新字串。 |
| `ios.infoPlist.ITSAppUsesNonExemptEncryption` | `false` | ✅ 正確宣告（僅用 HTTPS 標準加密，屬豁免）→ 免除 ASC 每次上傳的出口合規問答。 |
| `ios.infoPlist.UIRequiresFullScreen` | `true` | ✅ 與 `supportsTablet: false`、portrait-only 一致。 |
| `ios.supportsTablet` | `false` | ✅ iPhone-only 首發，可接受（iPad 以相容模式跑）。 |
| `plugins` | secure-store / audio / apple-authentication / web-browser | ✅ 清單對 config plugin 而言完整（見下方逐項）。 |
| `scheme` | `com.savelyn.studyanywherevoyage` | ✅ 供 Google/Apple OAuth redirect（expo-auth-session）。 |
| `newArchEnabled` | `false` | 🟠 **B3：SDK 55 已移除此欄位**，schema 驗證報 `should NOT have additional property 'newArchEnabled'` → 被忽略、app 實際以 New Architecture 出 build。詳見 §3。 |
| `owner` / `extra.eas.projectId` | savelyn / 70bf336b… | ✅ 與 `updates.url` 一致。 |

### Plugins 完整性逐項
- `expo-apple-authentication` ✅ → 會注入 `com.apple.developer.applesignin` entitlement（殘留 ios entitlements 已含 `Default`，正確）。**因為有第三方登入，Apple 強制要求 Sign in with Apple** → 必須確保 EAS 憑證流程 / Apple Developer App ID 有啟用此 capability，否則 archive 會因 entitlement 不符被拒。
- `expo-audio` ✅（但缺 peer dep `expo-asset`，見 B2）。
- `expo-secure-store` ✅、`expo-web-browser` ✅。
- **無需額外 plugin 者**（確認不缺）：`expo-updates`（CNG 依 app.json `updates`/`runtimeVersion` 自動配置）、`react-native-purchases`（autolink，Expo 免 config plugin）、`expo-font`（用 `useFonts` hook，免 plugin）、`expo-auth-session` / `expo-crypto` / `expo-constants` / `expo-speech`。→ plugins 清單無遺漏。

**結論**：app.json 內容本身正確、送審合規欄位齊備；唯一問題是 `newArchEnabled`（B3）需移除。真正讓這些正確設定「生效」的前提是 B1 必須先解決。

---

## 3. Expo SDK 55 / RN 0.83 相容性與上架雷區

`npx expo-doctor`：**14/18 通過，4 項失敗**。逐項：

### 🔴 B2（封鎖 / 可能 crash）缺 `expo-asset` peer dependency
```
Missing peer dependency: expo-asset  (Required by: expo-audio)
Your app may crash outside of Expo Go without this dependency.
```
- expo-audio 需要 expo-asset 作為 native peer。Expo Go 內有內建所以本機看似正常，但 **正式 EAS build（standalone）沒有** → Listen/錄音相關流程可能 crash。
- 修復：`npx expo install expo-asset`（會裝 SDK 55 對應版本並加入 dependencies）。

### 🟠 B3（config 錯誤 + 認知落差）`newArchEnabled: false` 在 SDK 55 非法
```
✖ Check Expo config schema: should NOT have additional property 'newArchEnabled'.
```
- SDK 55 / RN 0.83 已將 New Architecture 定為預設且移除該開關 → 設 `false` **無效、被忽略**，app 實際跑 **New Arch**。
- 影響：(1) config schema 驗證失敗（不乾淨、部分工具會擋）；(2) 團隊若以為在 Old Arch 下測過，實際送審的是 New Arch build，需以此為準重測。
- 檢查現有原生依賴在 New Arch 下的相容性——好消息是版本都夠新、皆支援 New Arch：`react-native-screens ~4.23`、`react-native-safe-area-context ~5.6`、`react-native-svg 15.15`、`react-native-purchases ^9.14`。風險低，但 **務必在真機 build 上重跑一次 QA**（尤其 RevenueCat 付款、SVG icon、導覽轉場）。
- 修復：從 app.json 移除 `newArchEnabled` 這一行。

### 🟠 B4（強烈建議）14 個套件版本與 SDK 55 鎖定版不符
關鍵落差：`react-native 0.83.2 → 0.83.6`、`expo 55.0.8 → 55.0.27`、`expo-updates 55.0.15 → 55.0.25`、`expo-audio 55.0.9 → 55.0.15` 等（皆 patch 級）。
- 風險：EAS build 會用 SDK 55 的原生模板，JS 端套件若與原生層 patch 不對齊，可能出現難以定位的 runtime 問題（尤以 expo-updates、expo-audio 影響 OTA 與音檔）。
- 修復：`npx expo install --check`（互動確認後一次對齊到 SDK 55 期望版本），再重跑 expo-doctor 應 18/18。

### 🟢 非封鎖：`eas-cli` 不應列在專案 devDependencies
```
✖ EAS CLI should not be installed in your project.
```
- 建議移除 `devDependencies.eas-cli`，改用全域或 `npx eas-cli@latest`。不影響 build，但避免版本漂移。

### 其他上架雷區檢查（通過 / 資訊）
- ✅ `ITSAppUsesNonExemptEncryption: false` 已設 → 不會卡出口合規。
- ✅ Sign in with Apple entitlement 齊備（Apple 硬性要求）。
- ✅ 帳號刪除功能已在 engineering-review 補上（Guideline 5.1.1(v)）。
- ✅ production build env 已釘死雲端；`.env.local` / `.env.cloud.bak` 已在 `.easignore` → 不會把 localhost 帶進 build。
- ⚪ `assets/` 有多個未使用的 PNG（knife-gouge、tally-stick、gouge-* 等設計草稿）→ 徒增 bundle 體積，非封鎖，建議上線後清。

---

## 🔴 B1（最高優先，封鎖）殘留 `ios/` prebuild 會被 EAS 上傳並蓋掉 CNG

**這是最容易被忽略、但會直接讓「你以為修好的東西沒進 build」的陷阱。**

事實：
- 本機存在 `app/ios/`（6/8 的 prebuild 產物，含 `StudyAnywhereVoyage.xcodeproj`、`Podfile.lock`、`build-release/`），git **未追蹤**（`.gitignore` 有 `/ios`）。
- 但 `app/.easignore` **只排除 `ios/Pods/` 與 `ios/build/`，沒有排除整個 `ios/`**。
- **關鍵機制**：EAS build 打包上傳時，**一旦專案有 `.easignore` 就改用 `.easignore`、不再看 `.gitignore`**。於是被 `.gitignore` 忽略的 `ios/` 反而會被上傳。
- EAS 偵測到既有 `ios/` 原生專案後，會切成「bare」行為、**不再從 app.json 跑 CNG prebuild** → 用的是 6/8 的舊原生設定。

已證實的脫節（舊 `ios/Info.plist` vs 現行 app.json）：
- 舊：`NSMicrophoneUsageDescription = "SAV needs microphone access…"`；現行 app.json 已改為 `"Notch Up! needs microphone access…"`。
- 專案名仍是 `StudyAnywhereVoyage`，app 已改名 `Notch Up!`。
- app.json 於 7/1、7/10 修改（改名、權限、安全相關），全在 6/8 prebuild 之後 → 這些變更都不會進舊原生專案。

**修復（擇一，建議兩者都做）**：
1. 在 `.easignore` 加入整個原生資料夾，讓 EAS 永遠重生 CNG：
   ```
   /ios
   /android
   ```
   （放在檔案任意行；保留既有內容即可。加了這兩行後原本的 `ios/Pods/`、`ios/build/` 兩行可留可刪。）
2. 出 build 前刪掉本機殘留：`rm -rf app/ios app/android`（CNG 專案不需要 commit 原生資料夾；EAS 會在雲端重生）。

**驗收**：`eas build` log 開頭應出現「Running expo prebuild」/ CNG 生成步驟，且產出的 build 麥克風提示為「Notch Up!…」、app 名為 Notch Up!。若 log 直接進 `pod install` 而沒 prebuild，代表舊 `ios/` 仍被吃到，須回頭處理。

---

## 4. Runbook：從現在到送出 App Store

> 前置一次性：已購 Apple Developer、ASC App（ascAppId 6761168417）已建、bundle id 已綁定、EAS 專案已連結（projectId 已在 app.json）。以下在 `app/` 目錄執行。

### 階段 0 — 修封鎖項（必做，順序如下）
```bash
cd app

# B1：讓 EAS 重生原生層，別吃到舊 ios/
printf '\n/ios\n/android\n' >> .easignore
rm -rf ios android            # 清掉 6/8 殘留 prebuild

# B2：補 expo-audio 的必要 peer dep
npx expo install expo-asset

# B4：對齊 SDK 55 套件版本（互動確認）
npx expo install --check

# B3：移除非法欄位（手動編輯 app.json，刪掉 "newArchEnabled": false 這行）

# 移除專案內 eas-cli（可選，非封鎖）
npm remove eas-cli
```

### 階段 1 — 靜態驗證（不花額度）
```bash
npx expo-doctor            # 目標 18/18 通過
npx tsc --noEmit           # 型別檢查（可選）
eas whoami                 # 確認登入 savelyn 帳號
eas build:configure -p ios # 確認/初始化 iOS build 設定（若已設會略過）
```

### 階段 2 — 出正式 build（會用額度，先確認 Expo 方案剩餘次數）
```bash
eas build --platform ios --profile production
```
- 首次會互動式處理憑證：選「Let EAS manage credentials」→ 產生 distribution cert + provisioning profile；若 App ID 尚未開 Sign in with Apple capability，於此步同步啟用。
- 盯 build log 確認 **有跑 CNG prebuild**（B1 驗收點）。
- 完成後 EAS 產生 `.ipa`（remote 版號自動遞增）。

### 階段 3 — 真機 TestFlight 實測（模擬器測不到，engineering-review 已列必做）
- 先讓 build 進 TestFlight（`eas submit` 會送到 ASC，內部測試群組即可測），實跑：
  - Email / **Apple** / Google 三種登入
  - IAP 沙盒購買 `credits_10` → 8 秒內入帳（RevenueCat webhook 端到端）
  - **帳號刪除** DELETE ACCOUNT 全流程（需先部署 `delete-account` Edge Function、雲端套 migration `20260710000000`——屬 backend 團隊，非本報告範圍，但為送審前提）
- New Arch 重測重點（B3）：RevenueCat 付款 UI、react-native-svg icon、bottom-tabs 轉場、音檔播放。

### 階段 4 — 送審
```bash
eas submit --platform ios --profile production --latest
```
- `--latest` 送最近一次 production build；eas.json 已備妥 appleId / ascAppId / appleTeamId → 非互動完成上傳到 ASC。
- 進 ASC 後：確認 build 出現在版本內 → 綁 IAP 產品到此版本 → 填「審查備註/測試帳號」（memory：`a0925302127@gmail.com`）→ Submit for Review。

### 送審前最終 checklist（技術面）
- [ ] `.easignore` 已排除 `/ios` `/android`，本機殘留已刪
- [ ] `expo-asset` 已安裝，expo-doctor 18/18
- [ ] app.json 已移除 `newArchEnabled`
- [ ] 套件版本已 `expo install --check` 對齊
- [ ] build log 確認跑了 CNG prebuild、麥克風提示顯示「Notch Up!」
- [ ] 真機 TestFlight：登入 / IAP / 帳號刪除 三大項通過
- [ ] backend 前提已就緒（migration 已 push、delete-account 已部署）— 跨團隊確認

---

## 封鎖 vs 非封鎖 一覽

| # | 問題 | 封鎖？ | 修法 |
|---|------|--------|------|
| B1 | 殘留 `ios/` 會被 `.easignore` 放行上傳、蓋掉 CNG，app.json 變更不生效 | 🔴 封鎖 | `.easignore` 加 `/ios` `/android` + `rm -rf ios android` |
| B2 | 缺 `expo-asset`（expo-audio peer），standalone 可能 crash | 🔴 封鎖 | `npx expo install expo-asset` |
| B3 | `newArchEnabled: false` SDK 55 非法、被忽略 → 實為 New Arch，schema 驗證失敗 | 🟠 高 | 移除該欄位並在真機重測 |
| B4 | 14 套件版本與 SDK 55 不符（含 RN 0.83.2→.6、expo 55.0.8→.27） | 🟠 高 | `npx expo install --check` |
| — | `eas-cli` 列在 devDependencies | 🟢 低 | `npm remove eas-cli` |
| — | `google-service-account.json` 不存在 | ⚪ 資訊 | 僅 Android submit 需要，iOS 首發不影響 |
| — | app.json `buildNumber`/`versionCode` 被 remote 版號忽略 | ⚪ 資訊 | 無需動作，別再手改 |
| — | `assets/` 多個未使用 PNG | 🟢 低 | 上線後清理減 bundle |

---
**Mobile Build Reviewer**（app 建置與上架技術面）
**審查方式**：靜態審查 + expo-doctor，未執行 eas build
**送審前提**：B1/B2 必修、B3/B4 強烈建議；真機 TestFlight 三大項與 backend 部署為跨團隊前提

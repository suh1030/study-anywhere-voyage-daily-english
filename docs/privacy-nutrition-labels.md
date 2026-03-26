# SAV Daily English — Privacy Nutrition Labels

> Apple App Store Connect → App Privacy 填寫參考
> Google Play Data Safety 填寫參考

---

## Apple App Store — App Privacy

### Data Linked to You（與用戶身份綁定的資料）

#### Contact Info
| Data Type | Collected | Linked to You | Used for Tracking |
|-----------|-----------|---------------|-------------------|
| Email Address | ✅ Yes | ✅ Yes | ❌ No |

- **Purpose**: Account authentication, password recovery

#### Identifiers
| Data Type | Collected | Linked to You | Used for Tracking |
|-----------|-----------|---------------|-------------------|
| User ID | ✅ Yes | ✅ Yes | ❌ No |

- **Purpose**: App functionality (sync progress across sessions)

#### Usage Data
| Data Type | Collected | Linked to You | Used for Tracking |
|-----------|-----------|---------------|-------------------|
| App Interactions (learning progress, completed lessons) | ✅ Yes | ✅ Yes | ❌ No |

- **Purpose**: App functionality (sync learning progress)

#### Purchases
| Data Type | Collected | Linked to You | Used for Tracking |
|-----------|-----------|---------------|-------------------|
| Purchase History | ✅ Yes (via RevenueCat) | ✅ Yes | ❌ No |

- **Purpose**: App functionality (credits balance, purchase validation)

---

### Data NOT Collected

| Data Type | Status |
|-----------|--------|
| Precise Location | ❌ Not collected |
| Coarse Location | ❌ Not collected |
| Health & Fitness | ❌ Not collected |
| Financial Info | ❌ Not collected |
| Sensitive Info | ❌ Not collected |
| Contacts | ❌ Not collected |
| Browsing History | ❌ Not collected |
| Search History | ❌ Not collected |
| Crash Data | ❌ Not collected (no crash reporting SDK) |
| Performance Data | ❌ Not collected |
| Diagnostics | ❌ Not collected |

---

### Voice Recordings

Voice recordings made in the Speak module are stored **only on the device** and are **not transmitted** to any server. Therefore, they do **not** need to be disclosed as collected data.

---

### User-Submitted Text (Conversation answers)

Text submitted for AI feedback is processed transiently (Supabase Edge Function → Anthropic API) and **not stored** after the response is returned. This does **not** need to be disclosed as retained data.

---

## Summary for App Store Connect

Navigate to: **App Store Connect → Your App → App Privacy**

**Step 1: Do you collect data?** → Yes

**Step 2: Data types to select:**
- [x] Contact Info → Email Address
- [x] Identifiers → User ID
- [x] Usage Data → App Interactions
- [x] Purchases → Purchase History

**For each selected type:**
- Used for tracking? → **No**
- Linked to the user? → **Yes**
- Purpose → **App Functionality**

---

## Google Play — Data Safety

Navigate to: **Google Play Console → Your App → App content → Data safety**

### Data Collection and Sharing

| Category | Data type | Collected | Shared | Required | Encrypted in transit | User can request deletion |
|---|---|---|---|---|---|---|
| Personal info | Email address | ✅ | ❌ | Yes (for login) | ✅ | ✅ |
| App activity | App interactions | ✅ | ❌ | Yes (progress sync) | ✅ | ✅ |
| App info and performance | (none) | ❌ | — | — | — | — |
| Financial info | Purchase history | ✅ (via RevenueCat) | ❌ | Yes (credits) | ✅ | ✅ |

### Security Practices to Check

- [x] Data is encrypted in transit
- [x] You provide a way for users to request data deletion
- [ ] The app follows the Families Policy (not applicable — 13+ app)
- [ ] The app has been independently security reviewed (optional, skip for v1)

---

## Notes

- **No advertising**: We do not use any advertising SDKs. No "Used for Advertising" disclosure needed.
- **No analytics SDK**: We do not use Firebase Analytics, Mixpanel, etc. No analytics disclosure needed.
- **Microphone**: The app requests microphone permission for local recording only. Since recordings are not transmitted, this is classified as a device capability, not data collection.
- **Apple Sign In / Google Sign In**: Identity tokens are processed by Supabase Auth but are not stored directly. The resulting user identifier is what gets stored.

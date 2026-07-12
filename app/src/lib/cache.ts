import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_PREFIX = 'sav_cache:'

// 內容資料庫重新 seed（教材內容有實質修改）時，把這個版本字串往上調，
// 所有裝置上的舊快取會在下次啟動時自動清空，改抓 DB 的新內容。
const CONTENT_CACHE_VERSION = '2026-07-12'
// 注意：這個 key 刻意不含 CACHE_PREFIX 的冒號，避免被 clearContentCache 一起清掉。
const VERSION_KEY = 'sav_content_cache_version'

let versionCheck: Promise<void> | null = null
function ensureCacheVersion(): Promise<void> {
  if (!versionCheck) {
    versionCheck = (async () => {
      try {
        const stored = await AsyncStorage.getItem(VERSION_KEY)
        if (stored !== CONTENT_CACHE_VERSION) {
          await clearContentCache()
          await AsyncStorage.setItem(VERSION_KEY, CONTENT_CACHE_VERSION)
        }
      } catch {
        // ignore — 版本檢查失敗時寧可退回 cache-first 行為
      }
    })()
  }
  return versionCheck
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    await ensureCacheVersion()
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, value: T): Promise<void> {
  try {
    await ensureCacheVersion()
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

export async function clearContentCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX))
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys)
  } catch {
    // ignore
  }
}

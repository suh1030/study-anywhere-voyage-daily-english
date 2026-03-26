import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_PREFIX = 'sav_cache:'

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, value: T): Promise<void> {
  try {
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

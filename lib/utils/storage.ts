import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '../constants';

// Save a value (auto-serialized)
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (err) {
    console.warn(`Failed to set item for key: ${key}`, err);
  }
}

// Get a value (parsed automatically)
export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (err) {
    console.warn(`Failed to get item for key: ${key}`, err);
    return null;
  }
}

// Remove a specific item
export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`Failed to remove item for key: ${key}`, err);
  }
}

// Clear all keys (use with caution)
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.warn('Failed to clear AsyncStorage', err);
  }
}

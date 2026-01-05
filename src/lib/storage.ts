/**
 * Local Storage Helper
 *
 * Utilidad para gestionar datos en localStorage con tipo seguro
 */

const STORAGE_PREFIX = 'crm_';

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

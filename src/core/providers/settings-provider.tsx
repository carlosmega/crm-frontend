'use client'

/**
 * Settings Provider
 * Global context for user settings with LocalStorage persistence
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserSettings, SettingsStorage } from '@/core/config/settings-defaults'
import {
  DEFAULT_SETTINGS,
  SETTINGS_VERSION,
  SETTINGS_STORAGE_KEY,
} from '@/core/config/settings-defaults'

interface SettingsContextValue {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

/**
 * Load settings from LocalStorage
 */
function loadSettingsFromStorage(): UserSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_SETTINGS
    }

    const parsed: SettingsStorage = JSON.parse(stored)

    // Version migration (if needed in the future)
    if (parsed.version !== SETTINGS_VERSION) {
      console.warn('Settings version mismatch, using defaults')
      return DEFAULT_SETTINGS
    }

    return { ...DEFAULT_SETTINGS, ...parsed.settings }
  } catch (error) {
    console.error('Failed to load settings from storage', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to LocalStorage
 */
function saveSettingsToStorage(settings: UserSettings): void {
  if (typeof window === 'undefined') return

  try {
    const storage: SettingsStorage = {
      version: SETTINGS_VERSION,
      settings,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Failed to save settings to storage', error)
  }
}

/**
 * Settings Provider Component
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Detect client-side mount and load settings
  useEffect(() => {
    setMounted(true)
    const loaded = loadSettingsFromStorage()
    setSettings(loaded)
    setIsLoading(false)
  }, [])

  // Update settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((current) => {
      const updated = { ...current, ...updates }
      saveSettingsToStorage(updated)
      return updated
    })
  }, [])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettingsToStorage(DEFAULT_SETTINGS)
  }, [])

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook to access settings context
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

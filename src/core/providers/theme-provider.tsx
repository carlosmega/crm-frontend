'use client'

/**
 * Theme Provider
 * Manages theme (light/dark/system) and applies it to the document
 */

import React, { useEffect } from 'react'
import { useSettings } from './settings-provider'
import type { Theme } from '@/core/config/settings-defaults'

/**
 * Get system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Resolve theme to actual value (light or dark)
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Theme Provider Component
 * Listens to settings changes and applies theme to document
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()

  useEffect(() => {
    const resolvedTheme = resolveTheme(settings.theme)
    applyTheme(resolvedTheme)

    // Listen for system theme changes (only if theme is 'system')
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  return <>{children}</>
}

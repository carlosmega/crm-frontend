'use client'

/**
 * useTranslation Hook
 * Client-side translation hook that reads locale from settings
 *
 * ✅ OPTIMIZED: Implements global cache to prevent re-loading translations
 */

import { useSettings } from '@/core/providers/settings-provider'
import { translate } from '@/shared/utils/i18n'
import type { TranslationNamespace } from '@/core/config/i18n-config'
import { useCallback, useEffect, useState } from 'react'

// ✅ Global cache for translations (prevents re-loading on navigation)
const translationCache = new Map<string, Record<string, unknown>>()

interface TranslationFunction {
  (key: string, variables?: Record<string, string | number>): string
}

interface UseTranslationReturn {
  t: TranslationFunction
  locale: string
  isLoading: boolean
}

/**
 * Hook for accessing translations
 *
 * @example
 * const { t } = useTranslation('common')
 * t('buttons.save') // Returns "Guardar" or "Save"
 * t('validation.minLength', { min: 5 }) // Returns "Mínimo 5 caracteres"
 */
export function useTranslation(namespace: TranslationNamespace): UseTranslationReturn {
  const { settings, isLoading: settingsLoading } = useSettings()
  const [translations, setTranslations] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations when locale or namespace changes
  useEffect(() => {
    let mounted = true

    async function loadTranslations() {
      // Create cache key
      const locale = settings.locale.split('-')[0] // 'es-ES' -> 'es'
      const cacheKey = `${locale}:${namespace}`

      // ✅ Check cache first
      const cached = translationCache.get(cacheKey)
      if (cached) {
        if (mounted) {
          setTranslations(cached)
          setIsLoading(false)
        }
        return
      }

      // Load from file if not in cache
      setIsLoading(true)
      try {
        const data = await import(`../../../locales/${locale}/${namespace}.json`)
        const loadedData = data.default || data

        // ✅ Store in cache
        translationCache.set(cacheKey, loadedData)

        if (mounted) {
          setTranslations(loadedData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(`Failed to load translations for ${namespace}`, error)
        if (mounted) {
          setTranslations({})
          setIsLoading(false)
        }
      }
    }

    // Don't load translations until settings are ready
    if (!settingsLoading) {
      loadTranslations()
    }

    return () => {
      mounted = false
    }
  }, [settings.locale, namespace, settingsLoading])

  // Translation function
  const t: TranslationFunction = useCallback((key: string, variables?: Record<string, string | number>) => {
    // If translations are still loading, return empty string to avoid flickering
    if (isLoading) {
      return ''
    }

    // Get nested value from translations
    const keys = key.split('.')
    let value: unknown = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        // Fallback to key if not found
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Interpolate variables
    if (variables) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, varKey) => {
        return variables[varKey]?.toString() || ''
      })
    }

    return value
  }, [translations, isLoading])

  return {
    t,
    locale: settings.locale,
    isLoading,
  }
}

/**
 * i18n Utilities
 * Simple translation system without external dependencies
 */

import type { Locale } from '@/core/config/settings-defaults'
import type { TranslationNamespace } from '@/core/config/i18n-config'

// Translation cache
const translationsCache: Map<string, Record<string, unknown>> = new Map()

/**
 * Load translations for a specific locale and namespace
 */
async function loadTranslations(
  locale: Locale,
  namespace: TranslationNamespace
): Promise<Record<string, unknown>> {
  const cacheKey = `${locale}:${namespace}`

  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey)!
  }

  try {
    // Dynamic import of translation files
    const translations = await import(`../../../locales/${locale.split('-')[0]}/${namespace}.json`)
    translationsCache.set(cacheKey, translations.default || translations)
    return translations.default || translations
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}:${namespace}`, error)
    return {}
  }
}

/**
 * Get nested value from object using dot notation
 * Example: get(obj, 'user.name') returns obj.user.name
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Replace variables in translation string
 * Example: "Hello {{name}}" with {name: "John"} returns "Hello John"
 */
function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() || ''
  })
}

/**
 * Translation function
 */
export async function translate(
  locale: Locale,
  namespace: TranslationNamespace,
  key: string,
  variables?: Record<string, string | number>
): Promise<string> {
  const translations = await loadTranslations(locale, namespace)
  const value = getNestedValue(translations, key)

  if (typeof value === 'string') {
    return interpolate(value, variables)
  }

  // Fallback to key if translation not found
  return key
}

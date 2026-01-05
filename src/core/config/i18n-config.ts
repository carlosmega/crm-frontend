/**
 * i18n Configuration
 * Manages supported locales and translation namespaces
 */

import type { Locale } from './settings-defaults'

export const SUPPORTED_LOCALES: readonly Locale[] = ['en-US', 'es-ES'] as const

export const DEFAULT_LOCALE: Locale = 'es-ES'

/**
 * Translation namespaces
 * Each feature/module should have its own namespace
 */
export type TranslationNamespace =
  | 'common'      // Shared UI elements (buttons, errors, validation)
  | 'navigation'  // Sidebar, header, breadcrumbs
  | 'settings'    // Settings page
  | 'leads'       // Lead management
  | 'opportunities' // Opportunity management
  | 'quotes'      // Quote management
  | 'orders'      // Order management
  | 'invoices'    // Invoice management
  | 'accounts'    // Account management
  | 'contacts'    // Contact management
  | 'products'    // Product catalog
  | 'activities'  // Activity tracking
  | 'analytics'   // Dashboard & reports

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    'en-US': 'English',
    'es-ES': 'Español',
  }
  return names[locale]
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    'en-US': '🇺🇸',
    'es-ES': '🇪🇸',
  }
  return flags[locale]
}

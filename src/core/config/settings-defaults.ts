/**
 * Default Settings Configuration
 * Single Source of Truth for default user settings
 */

export type Theme = 'light' | 'dark' | 'system'
export type Locale = 'en-US' | 'es-ES'
export type DateFormatStyle = 'short' | 'medium' | 'long'
export type TimeFormat = '12h' | '24h'
export type Currency = 'EUR' | 'USD' | 'GBP'

export interface UserSettings {
  // Theme
  theme: Theme

  // Language
  locale: Locale

  // Regional Formats
  dateFormat: DateFormatStyle
  timeFormat: TimeFormat
  timezone: string  // IANA timezone (e.g., 'Europe/Madrid', 'America/New_York')
  currency: Currency
  numberFormat: 'es-ES' | 'en-US'

  // Notifications (UI preferences)
  notifications: {
    desktop: boolean
    email: boolean
    sound: boolean
  }

  // Display preferences
  sidebarCollapsed: boolean
  compactMode: boolean
}

export interface SettingsStorage {
  version: string
  settings: UserSettings
  lastUpdated: string
}

/**
 * Default settings for new users
 */
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  locale: 'es-ES',
  dateFormat: 'medium',
  timeFormat: '24h',
  timezone: 'Europe/Madrid',
  currency: 'EUR',
  numberFormat: 'es-ES',
  notifications: {
    desktop: true,
    email: true,
    sound: false,
  },
  sidebarCollapsed: false,
  compactMode: false,
}

/**
 * Settings storage version for migrations
 */
export const SETTINGS_VERSION = '1.0.0'

/**
 * LocalStorage key
 */
export const SETTINGS_STORAGE_KEY = 'crm-user-settings'

/**
 * Available timezones for the settings
 */
export const COMMON_TIMEZONES = [
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1/+2)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1/+2)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
  { value: 'America/Mexico_City', label: 'Mexico City (GMT-6/-5)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (GMT+8)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10/+11)' },
] as const

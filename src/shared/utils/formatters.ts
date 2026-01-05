/**
 * Shared formatters for consistent data display across the application
 *
 * ✅ PERFORMANCE OPTIMIZATION:
 * - Created once at module-level (not recreated on every render)
 * - Intl.NumberFormat/DateTimeFormat creation costs ~0.3-0.5ms each
 * - With 100+ items × multiple columns = saves 30-50ms per render
 *
 * Usage:
 * ```tsx
 * import { formatCurrency, formatDate, formatPercent } from '@/shared/utils/formatters'
 *
 * const price = formatCurrency(1500.50) // "1.501 €"
 * const date = formatDate('2025-11-04') // "4 nov 2025"
 * const percent = formatPercent(0.75) // "75%"
 * ```
 */

// Currency formatter (EUR - Spain locale)
const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
})

// Date formatter (Spanish format)
const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

// Date and time formatter
const DATETIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// Percent formatter
const PERCENT_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

// Number formatter (for quantities, etc.)
const NUMBER_FORMATTER = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/**
 * Format a number as currency (EUR)
 * @param value - Number to format
 * @returns Formatted currency string or '-' if value is null/undefined
 *
 * @example
 * formatCurrency(1500.50) // "1.501 €"
 * formatCurrency(null) // "-"
 */
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return '-'
  return CURRENCY_FORMATTER.format(value)
}

/**
 * Format a date string or Date object
 * @param value - Date string (ISO) or Date object
 * @returns Formatted date string or '-' if value is null/undefined
 *
 * @example
 * formatDate('2025-11-04') // "4 nov 2025"
 * formatDate(new Date()) // "4 nov 2025"
 * formatDate(null) // "-"
 */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (isNaN(date.getTime())) return '-'
  return DATE_FORMATTER.format(date)
}

/**
 * Format a date with time
 * @param value - Date string (ISO) or Date object
 * @returns Formatted datetime string or '-' if value is null/undefined
 *
 * @example
 * formatDateTime('2025-11-04T14:30:00') // "4 nov 2025, 14:30"
 * formatDateTime(null) // "-"
 */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (isNaN(date.getTime())) return '-'
  return DATETIME_FORMATTER.format(date)
}

/**
 * Format a number as percentage
 * @param value - Number between 0 and 1 (e.g., 0.75 for 75%)
 * @returns Formatted percentage string or '-' if value is null/undefined
 *
 * @example
 * formatPercent(0.75) // "75%"
 * formatPercent(0.5) // "50%"
 * formatPercent(null) // "-"
 */
export function formatPercent(value?: number | null): string {
  if (value === undefined || value === null) return '-'
  return PERCENT_FORMATTER.format(value)
}

/**
 * Format a plain number
 * @param value - Number to format
 * @returns Formatted number string or '-' if value is null/undefined
 *
 * @example
 * formatNumber(1500.50) // "1.500,50"
 * formatNumber(1000) // "1.000"
 * formatNumber(null) // "-"
 */
export function formatNumber(value?: number | null): string {
  if (value === undefined || value === null) return '-'
  return NUMBER_FORMATTER.format(value)
}

/**
 * Format phone number (basic formatting for Spanish numbers)
 * @param value - Phone number string
 * @returns Formatted phone or original value if invalid
 *
 * @example
 * formatPhone('612345678') // "612 34 56 78"
 * formatPhone('+34612345678') // "+34 612 34 56 78"
 */
export function formatPhone(value?: string | null): string {
  if (!value) return '-'

  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '')

  // Spanish mobile: 612345678 → 612 34 56 78
  if (cleaned.length === 9 && cleaned.startsWith('6')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`
  }

  // International: +34612345678 → +34 612 34 56 78
  if (cleaned.startsWith('+34') && cleaned.length === 12) {
    return `+34 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
  }

  // Return original if doesn't match patterns
  return value
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with '...' if needed
 *
 * @example
 * truncateText('Long text here', 10) // "Long text..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

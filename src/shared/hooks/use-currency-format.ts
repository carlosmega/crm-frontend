'use client'

/**
 * Currency Formatting Hook
 * Returns a currency formatter function that respects user settings
 *
 * Usage:
 * ```tsx
 * const formatCurrency = useCurrencyFormat()
 * return <span>{formatCurrency(1500.50)}</span> // "$1,501" or "1.501 €" based on settings
 * ```
 */

import { useCallback } from 'react'
import { useSettings } from '@/core/providers/settings-provider'
import { formatCurrencyWithCode } from '@/shared/utils/formatters'

/**
 * Hook to get a currency formatter that respects user settings
 * @returns Function to format currency values based on user's currency preference
 *
 * @example
 * function ProductPrice({ price }: { price: number }) {
 *   const formatCurrency = useCurrencyFormat()
 *   return <span>{formatCurrency(price)}</span>
 * }
 */
export function useCurrencyFormat(): (value?: number | null) => string {
  const { settings } = useSettings()

  return useCallback(
    (value?: number | null) => {
      return formatCurrencyWithCode(value, settings.currency, settings.numberFormat)
    },
    [settings.currency, settings.numberFormat]
  )
}

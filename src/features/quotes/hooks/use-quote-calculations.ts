import { useMemo } from 'react'
import type { QuoteDetail } from '../types'
import {
  calculateQuoteTotals,
  calculateLineExtendedAmount,
  calculateLineBaseAmount,
  calculateDiscountPercentage,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateAverageDiscountPercentage,
  calculateWeightedAveragePrice,
  formatCurrency,
  formatPercentage,
} from '../utils/quote-calculations'

/**
 * Hook for calculating quote totals in real-time
 *
 * Recalcula totales cada vez que cambian las Quote Lines
 */
export function useQuoteTotals(quoteLines: QuoteDetail[]) {
  return useMemo(() => {
    return calculateQuoteTotals(quoteLines)
  }, [quoteLines])
}

/**
 * Hook for calculating individual line totals
 */
export function useLineTotals(
  pricePerUnit: number,
  quantity: number,
  discount: number = 0,
  tax: number = 0
) {
  return useMemo(() => {
    const baseAmount = calculateLineBaseAmount(pricePerUnit, quantity)
    const extendedAmount = calculateLineExtendedAmount(
      pricePerUnit,
      quantity,
      discount,
      tax
    )
    const discountPercentage = calculateDiscountPercentage(
      baseAmount,
      discount
    )

    return {
      baseAmount,
      extendedAmount,
      discount,
      tax,
      discountPercentage,
    }
  }, [pricePerUnit, quantity, discount, tax])
}

/**
 * Hook for calculating individual line totals WITH IVA (Mexico)
 *
 * El IVA se calcula sobre el subtotal después del descuento:
 * IVA = (Base Amount - Discount) × 16%
 */
export function useLineTotalsWithIVA(
  pricePerUnit: number,
  quantity: number,
  discount: number = 0,
  applyIVA: boolean = true
) {
  return useMemo(() => {
    const baseAmount = calculateLineBaseAmount(pricePerUnit, quantity)
    const subtotalAfterDiscount = Math.max(0, baseAmount - discount)
    const ivaAmount = applyIVA ? calculateTaxAmount(subtotalAfterDiscount, 16) : 0
    const extendedAmount = subtotalAfterDiscount + ivaAmount
    const discountPercentage = calculateDiscountPercentage(baseAmount, discount)

    return {
      baseAmount,
      subtotalAfterDiscount,
      ivaAmount,
      extendedAmount,
      discount,
      discountPercentage,
      applyIVA,
    }
  }, [pricePerUnit, quantity, discount, applyIVA])
}

/**
 * Hook for calculating discount from percentage
 */
export function useDiscountFromPercentage(
  baseAmount: number,
  discountPercentage: number
) {
  return useMemo(() => {
    return calculateDiscountAmount(baseAmount, discountPercentage)
  }, [baseAmount, discountPercentage])
}

/**
 * Hook for calculating tax from percentage
 */
export function useTaxFromPercentage(
  baseAmount: number,
  taxPercentage: number
) {
  return useMemo(() => {
    return calculateTaxAmount(baseAmount, taxPercentage)
  }, [baseAmount, taxPercentage])
}

/**
 * Hook for quote statistics
 */
export function useQuoteStatistics(quoteLines: QuoteDetail[]) {
  return useMemo(() => {
    const totals = calculateQuoteTotals(quoteLines)
    const averageDiscountPercentage =
      calculateAverageDiscountPercentage(quoteLines)
    const weightedAveragePrice = calculateWeightedAveragePrice(quoteLines)

    return {
      ...totals,
      averageDiscountPercentage,
      weightedAveragePrice,
    }
  }, [quoteLines])
}

/**
 * Hook for formatted currency values
 */
export function useFormattedCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
) {
  return useMemo(() => {
    return formatCurrency(amount, currency, locale)
  }, [amount, currency, locale])
}

/**
 * Hook for formatted percentage
 */
export function useFormattedPercentage(value: number, decimals: number = 2) {
  return useMemo(() => {
    return formatPercentage(value, decimals)
  }, [value, decimals])
}

/**
 * Hook for quote line validation in real-time
 */
export function useLineValidation(
  quantity: number,
  pricePerUnit: number,
  discount: number = 0
) {
  return useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []

    if (quantity <= 0) {
      errors.push('Quantity must be greater than zero')
    }

    if (pricePerUnit < 0) {
      errors.push('Price cannot be negative')
    }

    if (pricePerUnit === 0) {
      warnings.push('Price is zero')
    }

    const baseAmount = calculateLineBaseAmount(pricePerUnit, quantity)
    if (discount > baseAmount) {
      errors.push('Discount cannot exceed base amount')
    }

    if (discount < 0) {
      errors.push('Discount cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }, [quantity, pricePerUnit, discount])
}

/**
 * Hook for dynamic discount calculation based on quantity
 *
 * Ejemplo: Volume discounts
 */
export function useVolumeDiscount(
  quantity: number,
  baseAmount: number,
  tiers: Array<{ minQuantity: number; discountPercentage: number }>
) {
  return useMemo(() => {
    // Find applicable tier (highest matching quantity)
    const applicableTier = tiers
      .filter((tier) => quantity >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0]

    if (!applicableTier) {
      return {
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: baseAmount,
      }
    }

    const discountAmount = calculateDiscountAmount(
      baseAmount,
      applicableTier.discountPercentage
    )

    return {
      discountPercentage: applicableTier.discountPercentage,
      discountAmount,
      finalAmount: baseAmount - discountAmount,
    }
  }, [quantity, baseAmount, tiers])
}

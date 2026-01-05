import type { QuoteDetail } from '@/core/contracts/entities/quote-detail'

/**
 * Quote Calculations Utilities
 *
 * Funciones para calcular totales y montos en Quotes y Quote Lines
 */

/**
 * Calculate line extended amount
 * ExtendedAmount = (PricePerUnit * Quantity) - Discount + Tax
 */
export function calculateLineExtendedAmount(
  pricePerUnit: number,
  quantity: number,
  discount: number = 0,
  tax: number = 0
): number {
  const baseAmount = pricePerUnit * quantity
  return baseAmount - discount + tax
}

/**
 * Calculate line base amount
 * BaseAmount = PricePerUnit * Quantity
 */
export function calculateLineBaseAmount(
  pricePerUnit: number,
  quantity: number
): number {
  return pricePerUnit * quantity
}

/**
 * Calculate discount percentage from amount
 */
export function calculateDiscountPercentage(
  baseAmount: number,
  discountAmount: number
): number {
  if (baseAmount === 0) return 0
  return (discountAmount / baseAmount) * 100
}

/**
 * Calculate discount amount from percentage
 */
export function calculateDiscountAmount(
  baseAmount: number,
  discountPercentage: number
): number {
  return (baseAmount * discountPercentage) / 100
}

/**
 * Calculate tax amount from percentage
 */
export function calculateTaxAmount(
  baseAmount: number,
  taxPercentage: number
): number {
  return (baseAmount * taxPercentage) / 100
}

/**
 * Calculate quote totals from quote lines
 */
export function calculateQuoteTotals(lines: QuoteDetail[]): {
  totallineitemamount: number
  totalbaseamount: number
  totaldiscountamount: number
  totaltax: number
  totalamount: number
  totalamountlessfreight: number
  lineCount: number
  totalQuantity: number
} {
  const totalbaseamount = lines.reduce(
    (sum, line) => sum + line.baseamount,
    0
  )

  const totallineitemamount = lines.reduce(
    (sum, line) => sum + line.extendedamount,
    0
  )

  const totaldiscountamount = lines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )

  const totaltax = lines.reduce((sum, line) => sum + (line.tax || 0), 0)

  const totalamount = totallineitemamount
  const totalamountlessfreight = totalamount // Sin freight por ahora

  const lineCount = lines.length
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0)

  return {
    totallineitemamount,
    totalbaseamount,
    totaldiscountamount,
    totaltax,
    totalamount,
    totalamountlessfreight,
    lineCount,
    totalQuantity,
  }
}

/**
 * Calculate average discount percentage for quote
 */
export function calculateAverageDiscountPercentage(
  lines: QuoteDetail[]
): number {
  if (lines.length === 0) return 0

  const totalBase = lines.reduce((sum, line) => sum + line.baseamount, 0)
  const totalDiscount = lines.reduce(
    (sum, line) => sum + (line.manualdiscountamount || 0),
    0
  )

  if (totalBase === 0) return 0

  return (totalDiscount / totalBase) * 100
}

/**
 * Calculate profit margin
 * Margin = ((Price - Cost) / Price) * 100
 *
 * Nota: Requiere agregar 'cost' field a QuoteDetail para usar esto
 */
export function calculateProfitMargin(price: number, cost: number): number {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}

/**
 * Calculate profit amount
 */
export function calculateProfitAmount(price: number, cost: number): number {
  return price - cost
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | undefined,
  decimals: number = 2
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%'
  }
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate days until expiration
 */
export function calculateDaysUntilExpiration(
  effectiveTo: string | undefined
): number | null {
  if (!effectiveTo) return null

  const expirationDate = new Date(effectiveTo)
  const today = new Date()
  const diffTime = expirationDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if quote is expired
 */
export function isQuoteExpired(effectiveTo: string | undefined): boolean {
  if (!effectiveTo) return false

  const expirationDate = new Date(effectiveTo)
  const today = new Date()

  return expirationDate < today
}

/**
 * Calculate quote validity period in days
 */
export function calculateValidityPeriod(
  effectiveFrom: string | undefined,
  effectiveTo: string | undefined
): number | null {
  if (!effectiveFrom || !effectiveTo) return null

  const fromDate = new Date(effectiveFrom)
  const toDate = new Date(effectiveTo)
  const diffTime = toDate.getTime() - fromDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Round to 2 decimal places
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calculate weighted average unit price
 */
export function calculateWeightedAveragePrice(
  lines: QuoteDetail[]
): number {
  if (lines.length === 0) return 0

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0)
  if (totalQuantity === 0) return 0

  const weightedSum = lines.reduce(
    (sum, line) => sum + line.priceperunit * line.quantity,
    0
  )

  return weightedSum / totalQuantity
}

/**
 * Calculate total with freight and additional charges
 */
export function calculateGrandTotal(
  lineItemsTotal: number,
  freightAmount: number = 0,
  additionalCharges: number = 0
): number {
  return lineItemsTotal + freightAmount + additionalCharges
}

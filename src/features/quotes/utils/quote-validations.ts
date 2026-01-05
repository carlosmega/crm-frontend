import type { Quote } from '@/core/contracts/entities/quote'
import type { QuoteDetail } from '@/core/contracts/entities/quote-detail'
import { QuoteStateCode, QuoteStatusCode } from '@/core/contracts/enums'

/**
 * Quote Validations Utilities
 *
 * Validaciones de reglas de negocio para Quotes
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Validate if quote can be edited
 *
 * Regla: Solo Draft quotes pueden ser editados
 */
export function canEditQuote(quote: Quote): ValidationResult {
  const errors: string[] = []

  if (quote.statecode !== QuoteStateCode.Draft) {
    errors.push('Quote must be in Draft state to edit')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate if quote can be activated
 *
 * Reglas:
 * - Debe estar en Draft
 * - Debe tener al menos 1 Quote Line
 * - Debe tener effectivefrom y effectiveto
 * - effectiveto debe ser mayor que effectivefrom
 */
export function canActivateQuote(
  quote: Quote,
  quoteLines: QuoteDetail[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validar estado
  if (quote.statecode !== QuoteStateCode.Draft) {
    errors.push('Quote must be in Draft state to activate')
  }

  // Validar Quote Lines
  if (quoteLines.length === 0) {
    errors.push('Quote must have at least one Quote Line to activate')
  }

  if (quote.totalamount <= 0) {
    errors.push('Quote total amount must be greater than zero')
  }

  // Validar fechas
  if (!quote.effectivefrom) {
    errors.push('Quote must have an Effective From date')
  }

  if (!quote.effectiveto) {
    errors.push('Quote must have an Effective To date')
  }

  if (quote.effectivefrom && quote.effectiveto) {
    const fromDate = new Date(quote.effectivefrom)
    const toDate = new Date(quote.effectiveto)

    if (toDate <= fromDate) {
      errors.push('Effective To date must be after Effective From date')
    }

    // Warning si ya expiró
    const today = new Date()
    if (toDate < today) {
      warnings.push('Quote expiration date is in the past')
    }
  }

  // Validar customer
  if (!quote.customerid) {
    errors.push('Quote must have a customer assigned')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate if quote can be won
 *
 * Reglas:
 * - Debe estar en Active
 * - Debe tener al menos 1 Quote Line
 */
export function canWinQuote(
  quote: Quote,
  quoteLines: QuoteDetail[]
): ValidationResult {
  const errors: string[] = []

  if (quote.statecode !== QuoteStateCode.Active) {
    errors.push('Quote must be Active to win')
  }

  if (quoteLines.length === 0) {
    errors.push('Quote must have at least one Quote Line')
  }

  if (quote.totalamount <= 0) {
    errors.push('Quote total amount must be greater than zero')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate if quote can be lost/closed
 *
 * Reglas:
 * - Debe estar en Active o Draft
 */
export function canLoseQuote(quote: Quote): ValidationResult {
  const errors: string[] = []

  if (
    quote.statecode !== QuoteStateCode.Active &&
    quote.statecode !== QuoteStateCode.Draft
  ) {
    errors.push('Quote must be Active or Draft to lose')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate if quote can be canceled
 *
 * Reglas:
 * - No puede estar Won
 */
export function canCancelQuote(quote: Quote): ValidationResult {
  const errors: string[] = []

  if (quote.statecode === QuoteStateCode.Won) {
    errors.push('Cannot cancel a Won quote')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate if quote can be deleted
 *
 * Reglas:
 * - Solo Draft quotes pueden eliminarse
 */
export function canDeleteQuote(quote: Quote): ValidationResult {
  const errors: string[] = []

  if (quote.statecode !== QuoteStateCode.Draft) {
    errors.push('Only Draft quotes can be deleted')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate if quote can be revised (reopened)
 *
 * Reglas:
 * - No puede estar Won
 * - Puede estar Active o Closed
 */
export function canReviseQuote(quote: Quote): ValidationResult {
  const errors: string[] = []

  if (quote.statecode === QuoteStateCode.Won) {
    errors.push('Cannot revise a Won quote')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate quote line item
 *
 * Reglas:
 * - Quantity debe ser > 0
 * - PricePerUnit debe ser >= 0
 * - Discount no puede ser mayor que baseamount
 */
export function validateQuoteLine(line: Partial<QuoteDetail>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!line.productid) {
    errors.push('Product is required')
  }

  if (!line.quantity || line.quantity <= 0) {
    errors.push('Quantity must be greater than zero')
  }

  if (line.priceperunit === undefined || line.priceperunit < 0) {
    errors.push('Price per unit must be zero or greater')
  }

  if (line.priceperunit === 0) {
    warnings.push('Price per unit is zero')
  }

  // Validar discount
  if (line.manualdiscountamount && line.quantity && line.priceperunit) {
    const baseAmount = line.quantity * line.priceperunit
    if (line.manualdiscountamount > baseAmount) {
      errors.push('Discount amount cannot exceed base amount')
    }

    if (line.manualdiscountamount < 0) {
      errors.push('Discount amount cannot be negative')
    }
  }

  // Validar tax
  if (line.tax !== undefined && line.tax < 0) {
    errors.push('Tax amount cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate quote date range
 */
export function validateQuoteDateRange(
  effectiveFrom: string | undefined,
  effectiveTo: string | undefined
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!effectiveFrom || !effectiveTo) {
    return { isValid: true, errors: [] } // Opcional
  }

  const fromDate = new Date(effectiveFrom)
  const toDate = new Date(effectiveTo)
  const today = new Date()

  if (toDate <= fromDate) {
    errors.push('Effective To date must be after Effective From date')
  }

  if (fromDate < today) {
    warnings.push('Effective From date is in the past')
  }

  if (toDate < today) {
    warnings.push('Effective To date is in the past')
  }

  // Validar rango razonable (no más de 1 año)
  const diffTime = toDate.getTime() - fromDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  if (diffDays > 365) {
    warnings.push('Quote validity period is longer than 1 year')
  }

  if (diffDays < 7) {
    warnings.push('Quote validity period is very short (less than 7 days)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate quote before creation
 */
export function validateQuoteCreation(data: {
  name?: string
  customerid?: string
  effectivefrom?: string
  effectiveto?: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Quote name is required')
  }

  if (!data.customerid) {
    errors.push('Customer is required')
  }

  // Validar fechas si están presentes
  if (data.effectivefrom && data.effectiveto) {
    const dateValidation = validateQuoteDateRange(
      data.effectivefrom,
      data.effectiveto
    )
    errors.push(...dateValidation.errors)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if quote is expired
 */
export function isQuoteExpired(quote: Quote): boolean {
  if (!quote.effectiveto) return false

  const expirationDate = new Date(quote.effectiveto)
  const today = new Date()

  return expirationDate < today
}

/**
 * Check if quote is about to expire (within N days)
 */
export function isQuoteExpiringSoon(
  quote: Quote,
  daysThreshold: number = 7
): boolean {
  if (!quote.effectiveto) return false

  const expirationDate = new Date(quote.effectiveto)
  const today = new Date()
  const thresholdDate = new Date(today)
  thresholdDate.setDate(today.getDate() + daysThreshold)

  return (
    expirationDate > today && expirationDate <= thresholdDate
  )
}

/**
 * Get quote validation status for UI
 */
export function getQuoteValidationStatus(
  quote: Quote,
  quoteLines: QuoteDetail[]
): {
  canEdit: boolean
  canActivate: boolean
  canWin: boolean
  canLose: boolean
  canDelete: boolean
  canRevise: boolean
  isExpired: boolean
  isExpiringSoon: boolean
  errors: string[]
  warnings: string[]
} {
  const editValidation = canEditQuote(quote)
  const activateValidation = canActivateQuote(quote, quoteLines)
  const winValidation = canWinQuote(quote, quoteLines)
  const loseValidation = canLoseQuote(quote)
  const deleteValidation = canDeleteQuote(quote)
  const reviseValidation = canReviseQuote(quote)

  const allErrors = [
    ...editValidation.errors,
    ...activateValidation.errors,
    ...winValidation.errors,
    ...loseValidation.errors,
    ...deleteValidation.errors,
    ...reviseValidation.errors,
  ]

  const allWarnings = [
    ...(activateValidation.warnings || []),
  ]

  return {
    canEdit: editValidation.isValid,
    canActivate: activateValidation.isValid,
    canWin: winValidation.isValid,
    canLose: loseValidation.isValid,
    canDelete: deleteValidation.isValid,
    canRevise: reviseValidation.isValid,
    isExpired: isQuoteExpired(quote),
    isExpiringSoon: isQuoteExpiringSoon(quote),
    errors: [...new Set(allErrors)], // Remove duplicates
    warnings: [...new Set(allWarnings)],
  }
}

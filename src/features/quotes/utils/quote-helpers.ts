import type { Quote } from '@/core/contracts/entities/quote'
import { QuoteStateCode, QuoteStatusCode } from '@/core/contracts/enums'

/**
 * Quote Helper Utilities
 *
 * Funciones auxiliares para trabajar con Quotes
 */

/**
 * Get quote state label
 */
export function getQuoteStateLabel(statecode: QuoteStateCode): string {
  const labels: Record<QuoteStateCode, string> = {
    [QuoteStateCode.Draft]: 'Draft',
    [QuoteStateCode.Active]: 'Active',
    [QuoteStateCode.Won]: 'Won',
    [QuoteStateCode.Closed]: 'Closed',
  }

  return labels[statecode] || 'Unknown'
}

/**
 * Get quote status label
 */
export function getQuoteStatusLabel(statuscode: QuoteStatusCode): string {
  const labels: Record<QuoteStatusCode, string> = {
    [QuoteStatusCode.In_Progress]: 'In Progress',
    [QuoteStatusCode.In_Review]: 'In Review',
    [QuoteStatusCode.Open]: 'Open',
    [QuoteStatusCode.Won]: 'Won',
    [QuoteStatusCode.Lost]: 'Lost',
    [QuoteStatusCode.Canceled]: 'Canceled',
    [QuoteStatusCode.Revised]: 'Revised',
  }

  return labels[statuscode] || 'Unknown'
}

/**
 * Get quote state color (for badges)
 */
export function getQuoteStateColor(
  statecode: QuoteStateCode
): 'default' | 'secondary' | 'outline' | 'destructive' {
  const colors: Record<
    QuoteStateCode,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    [QuoteStateCode.Draft]: 'secondary',
    [QuoteStateCode.Active]: 'default',
    [QuoteStateCode.Won]: 'outline',
    [QuoteStateCode.Closed]: 'destructive',
  }

  return colors[statecode] || 'default'
}

/**
 * Get quote status color (for badges)
 */
export function getQuoteStatusColor(
  statuscode: QuoteStatusCode
): 'default' | 'secondary' | 'outline' | 'destructive' {
  const colors: Record<
    QuoteStatusCode,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    [QuoteStatusCode.In_Progress]: 'secondary',
    [QuoteStatusCode.In_Review]: 'default',
    [QuoteStatusCode.Open]: 'default',
    [QuoteStatusCode.Won]: 'outline',
    [QuoteStatusCode.Lost]: 'destructive',
    [QuoteStatusCode.Canceled]: 'destructive',
    [QuoteStatusCode.Revised]: 'secondary',
  }

  return colors[statuscode] || 'default'
}

/**
 * Check if quote is editable
 */
export function isQuoteEditable(quote: Quote): boolean {
  return quote.statecode === QuoteStateCode.Draft
}

/**
 * Check if quote is closed (Won/Lost/Canceled)
 */
export function isQuoteClosed(quote: Quote): boolean {
  return (
    quote.statecode === QuoteStateCode.Won ||
    quote.statecode === QuoteStateCode.Closed
  )
}

/**
 * Check if quote is won
 */
export function isQuoteWon(quote: Quote): boolean {
  return quote.statecode === QuoteStateCode.Won
}

/**
 * Check if quote is active
 */
export function isQuoteActive(quote: Quote): boolean {
  return quote.statecode === QuoteStateCode.Active
}

/**
 * Check if quote is draft
 */
export function isQuoteDraft(quote: Quote): boolean {
  return quote.statecode === QuoteStateCode.Draft
}

/**
 * Generate quote display number
 *
 * Ejemplo: "QU-20241030-001"
 */
export function generateQuoteNumber(quoteCount: number): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const paddedCount = String(quoteCount).padStart(3, '0')

  return `QU-${dateStr}-${paddedCount}`
}

/**
 * Format quote validity period
 *
 * Ejemplo: "Oct 1, 2024 - Oct 31, 2024"
 */
export function formatQuoteValidityPeriod(
  effectiveFrom: string | undefined,
  effectiveTo: string | undefined,
  locale: string = 'en-US'
): string {
  if (!effectiveFrom || !effectiveTo) {
    return 'Not specified'
  }

  const fromDate = new Date(effectiveFrom)
  const toDate = new Date(effectiveTo)

  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`
}

/**
 * Get days until quote expiration
 */
export function getDaysUntilExpiration(
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
 * Get expiration status message
 */
export function getExpirationStatusMessage(
  effectiveTo: string | undefined
): string | null {
  const days = getDaysUntilExpiration(effectiveTo)

  if (days === null) return null

  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
  }

  if (days === 0) {
    return 'Expires today'
  }

  if (days === 1) {
    return 'Expires tomorrow'
  }

  if (days <= 7) {
    return `Expires in ${days} days`
  }

  return `Valid for ${days} days`
}

/**
 * Sort quotes by date (newest first)
 */
export function sortQuotesByDate(
  quotes: Quote[],
  field: 'createdon' | 'modifiedon' | 'closedon' = 'createdon',
  order: 'asc' | 'desc' = 'desc'
): Quote[] {
  return [...quotes].sort((a, b) => {
    const dateA = new Date(a[field] || 0).getTime()
    const dateB = new Date(b[field] || 0).getTime()

    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

/**
 * Sort quotes by amount
 */
export function sortQuotesByAmount(
  quotes: Quote[],
  order: 'asc' | 'desc' = 'desc'
): Quote[] {
  return [...quotes].sort((a, b) => {
    return order === 'desc'
      ? b.totalamount - a.totalamount
      : a.totalamount - b.totalamount
  })
}

/**
 * Filter quotes by state
 */
export function filterQuotesByState(
  quotes: Quote[],
  states: QuoteStateCode[]
): Quote[] {
  return quotes.filter((quote) => states.includes(quote.statecode))
}

/**
 * Filter quotes by search query
 */
export function filterQuotesByQuery(
  quotes: Quote[],
  query: string
): Quote[] {
  const lowerQuery = query.toLowerCase()

  return quotes.filter(
    (quote) =>
      quote.name?.toLowerCase().includes(lowerQuery) ||
      quote.quotenumber?.toLowerCase().includes(lowerQuery) ||
      quote.description?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Group quotes by state
 */
export function groupQuotesByState(quotes: Quote[]): Record<string, Quote[]> {
  return quotes.reduce(
    (groups, quote) => {
      const stateLabel = getQuoteStateLabel(quote.statecode)

      if (!groups[stateLabel]) {
        groups[stateLabel] = []
      }

      groups[stateLabel].push(quote)

      return groups
    },
    {} as Record<string, Quote[]>
  )
}

/**
 * Get quote summary statistics
 */
export function getQuoteStatistics(quotes: Quote[]): {
  total: number
  draft: number
  active: number
  won: number
  closed: number
  totalValue: number
  wonValue: number
  averageValue: number
  winRate: number
} {
  const draft = quotes.filter((q) => q.statecode === QuoteStateCode.Draft)
  const active = quotes.filter((q) => q.statecode === QuoteStateCode.Active)
  const won = quotes.filter((q) => q.statecode === QuoteStateCode.Won)
  const closed = quotes.filter((q) => q.statecode === QuoteStateCode.Closed)

  const totalValue = quotes.reduce((sum, q) => sum + q.totalamount, 0)
  const wonValue = won.reduce((sum, q) => sum + q.totalamount, 0)
  const averageValue = totalValue / (quotes.length || 1)

  const totalClosed = won.length + closed.length
  const winRate = totalClosed > 0 ? (won.length / totalClosed) * 100 : 0

  return {
    total: quotes.length,
    draft: draft.length,
    active: active.length,
    won: won.length,
    closed: closed.length,
    totalValue,
    wonValue,
    averageValue,
    winRate,
  }
}

/**
 * Create quote name from opportunity
 */
export function createQuoteNameFromOpportunity(
  opportunityName: string,
  count: number = 1
): string {
  if (count === 1) {
    return `${opportunityName} - Quote`
  }

  return `${opportunityName} - Quote ${count}`
}

/**
 * Get next quote line number
 */
export function getNextLineNumber(existingLineNumbers: number[]): number {
  if (existingLineNumbers.length === 0) return 1

  return Math.max(...existingLineNumbers) + 1
}

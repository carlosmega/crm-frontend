import type { InvoiceDetail } from '@/core/contracts/entities/invoice-detail'

/**
 * Calculate extended amount for an invoice line
 */
export function calculateExtendedAmount(
  quantity: number,
  pricePerUnit: number,
  manualDiscount: number = 0,
  volumeDiscount: number = 0,
  tax: number = 0
): number {
  const baseAmount = quantity * pricePerUnit
  const totalDiscount = manualDiscount + volumeDiscount
  const amountAfterDiscount = baseAmount - totalDiscount
  return amountAfterDiscount + tax
}

/**
 * Calculate base amount (quantity × price)
 */
export function calculateBaseAmount(
  quantity: number,
  pricePerUnit: number
): number {
  return quantity * pricePerUnit
}

/**
 * Calculate total discount for a line
 */
export function calculateTotalDiscount(
  manualDiscount: number = 0,
  volumeDiscount: number = 0
): number {
  return manualDiscount + volumeDiscount
}

/**
 * Calculate invoice totals from lines
 */
export function calculateInvoiceTotals(lines: InvoiceDetail[]): {
  totalLineItems: number
  totalDiscount: number
  totalTax: number
  grandTotal: number
} {
  const totalLineItems = lines.reduce(
    (sum, line) => sum + (line.baseamount || 0),
    0
  )

  const totalDiscount = lines.reduce(
    (sum, line) =>
      sum + (line.manualdiscountamount || 0) + (line.volumediscountamount || 0),
    0
  )

  const totalTax = lines.reduce((sum, line) => sum + (line.tax || 0), 0)

  const grandTotal = lines.reduce((sum, line) => sum + line.extendedamount, 0)

  return {
    totalLineItems,
    totalDiscount,
    totalTax,
    grandTotal,
  }
}

/**
 * Calculate subtotal (before tax and discounts)
 */
export function calculateSubtotal(lines: InvoiceDetail[]): number {
  return lines.reduce((sum, line) => sum + (line.baseamount || 0), 0)
}

/**
 * Calculate tax amount for a line based on percentage
 */
export function calculateTaxAmount(
  baseAmount: number,
  taxPercentage: number
): number {
  return (baseAmount * taxPercentage) / 100
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  baseAmount: number,
  discountAmount: number
): number {
  if (baseAmount === 0) return 0
  return (discountAmount / baseAmount) * 100
}

/**
 * Calculate line item profit margin
 */
export function calculateProfitMargin(
  sellingPrice: number,
  cost: number
): number {
  if (sellingPrice === 0) return 0
  return ((sellingPrice - cost) / sellingPrice) * 100
}

/**
 * Validate invoice line amounts
 */
export function validateInvoiceLineAmounts(line: {
  quantity: number
  priceperunit: number
  manualdiscountamount?: number
  volumediscountamount?: number
  tax?: number
}): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (line.quantity <= 0) {
    errors.push('Quantity must be greater than 0')
  }

  if (line.priceperunit < 0) {
    errors.push('Price per unit cannot be negative')
  }

  const baseAmount = line.quantity * line.priceperunit
  const totalDiscount =
    (line.manualdiscountamount || 0) + (line.volumediscountamount || 0)

  if (totalDiscount > baseAmount) {
    errors.push('Total discount cannot exceed base amount')
  }

  if (line.manualdiscountamount && line.manualdiscountamount < 0) {
    errors.push('Manual discount cannot be negative')
  }

  if (line.volumediscountamount && line.volumediscountamount < 0) {
    errors.push('Volume discount cannot be negative')
  }

  if (line.tax && line.tax < 0) {
    errors.push('Tax cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Calculate payment allocation across multiple invoices
 * (For future partial payment scenarios)
 */
export function allocatePayment(
  paymentAmount: number,
  invoiceBalances: { invoiceId: string; balance: number }[]
): { invoiceId: string; amountAllocated: number }[] {
  const allocations: { invoiceId: string; amountAllocated: number }[] = []
  let remainingPayment = paymentAmount

  // Allocate payment in order of invoices
  for (const invoice of invoiceBalances) {
    if (remainingPayment <= 0) break

    const amountToAllocate = Math.min(remainingPayment, invoice.balance)
    allocations.push({
      invoiceId: invoice.invoiceId,
      amountAllocated: amountToAllocate,
    })

    remainingPayment -= amountToAllocate
  }

  return allocations
}

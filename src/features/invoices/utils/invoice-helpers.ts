import type { Invoice } from '@/core/contracts/entities/invoice'
import { InvoiceStateCode } from '@/core/contracts/enums'

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.statecode !== InvoiceStateCode.Active) {
    return false
  }

  const today = new Date().toISOString().split('T')[0]
  return invoice.duedate < today
}

/**
 * Get days until due date (negative if overdue)
 */
export function getDaysUntilDue(invoice: Invoice): number {
  const today = new Date()
  const dueDate = new Date(invoice.duedate)
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if invoice is partially paid
 */
export function isPartiallyPaid(invoice: Invoice): boolean {
  return (
    invoice.statecode === InvoiceStateCode.Active &&
    (invoice.totalpaid || 0) > 0 &&
    (invoice.totalbalance || invoice.totalamount) > 0
  )
}

/**
 * Get payment completion percentage
 */
export function getPaymentProgress(invoice: Invoice): number {
  if (invoice.totalamount === 0) return 0
  const paid = invoice.totalpaid || 0
  return Math.round((paid / invoice.totalamount) * 100)
}

/**
 * Check if invoice can be edited
 */
export function canEditInvoice(invoice: Invoice): boolean {
  return invoice.statecode === InvoiceStateCode.Active
}

/**
 * Check if invoice can be canceled
 */
export function canCancelInvoice(invoice: Invoice): boolean {
  return (
    invoice.statecode === InvoiceStateCode.Active ||
    invoice.statecode === InvoiceStateCode.Closed
  )
}

/**
 * Check if invoice can be marked as paid
 */
export function canMarkAsPaid(invoice: Invoice): boolean {
  return (
    (invoice.statecode === InvoiceStateCode.Active ||
      invoice.statecode === InvoiceStateCode.Closed) &&
    (invoice.totalbalance || invoice.totalamount) > 0
  )
}

/**
 * Get remaining balance
 */
export function getRemainingBalance(invoice: Invoice): number {
  return invoice.totalbalance ?? invoice.totalamount - (invoice.totalpaid || 0)
}

/**
 * Format invoice number for display
 */
export function formatInvoiceNumber(invoice: Invoice): string {
  return invoice.invoicenumber || `#${invoice.invoiceid.slice(-6).toUpperCase()}`
}

/**
 * Get invoice status badge color based on state and due date
 */
export function getInvoiceStatusColor(invoice: Invoice): {
  text: string
  bg: string
  label: string
} {
  // Overdue
  if (isInvoiceOverdue(invoice)) {
    return {
      text: 'text-red-700',
      bg: 'bg-red-100',
      label: 'Overdue',
    }
  }

  // Partially paid
  if (isPartiallyPaid(invoice)) {
    return {
      text: 'text-blue-700',
      bg: 'bg-blue-100',
      label: 'Partially Paid',
    }
  }

  // State-based colors
  switch (invoice.statecode) {
    case InvoiceStateCode.Active:
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-100',
        label: 'Active',
      }
    case InvoiceStateCode.Paid:
      return {
        text: 'text-green-700',
        bg: 'bg-green-100',
        label: 'Paid',
      }
    case InvoiceStateCode.Canceled:
      return {
        text: 'text-gray-700',
        bg: 'bg-gray-100',
        label: 'Canceled',
      }
    case InvoiceStateCode.Closed:
      return {
        text: 'text-gray-700',
        bg: 'bg-gray-100',
        label: 'Closed',
      }
    default:
      return {
        text: 'text-gray-700',
        bg: 'bg-gray-100',
        label: 'Unknown',
      }
  }
}

/**
 * Sort invoices by due date (overdue first, then by date)
 */
export function sortInvoicesByDueDate(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((a, b) => {
    const aOverdue = isInvoiceOverdue(a)
    const bOverdue = isInvoiceOverdue(b)

    // Overdue invoices first
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    // Then by due date
    return a.duedate.localeCompare(b.duedate)
  })
}

/**
 * Filter invoices by search query (name, invoice number, customer)
 */
export function filterInvoicesByQuery(
  invoices: Invoice[],
  query: string
): Invoice[] {
  if (!query.trim()) return invoices

  const lowerQuery = query.toLowerCase()

  return invoices.filter((invoice) => {
    return (
      invoice.name.toLowerCase().includes(lowerQuery) ||
      invoice.invoicenumber?.toLowerCase().includes(lowerQuery) ||
      invoice.invoiceid.toLowerCase().includes(lowerQuery)
    )
  })
}

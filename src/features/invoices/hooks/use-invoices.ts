import { useQuery } from '@tanstack/react-query'
import { invoiceService } from '../api/invoice-service'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { InvoiceStateCode } from '@/core/contracts/enums'

/**
 * Hook: Get all invoices
 */
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getAll(),
  })
}

/**
 * Hook: Get invoice by ID
 */
export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceService.getById(id!),
    enabled: !!id,
  })
}

/**
 * Hook: Get invoices by state
 */
export function useInvoicesByState(statecode: InvoiceStateCode) {
  return useQuery({
    queryKey: ['invoices', 'state', statecode],
    queryFn: () => invoiceService.getByState(statecode),
  })
}

/**
 * Hook: Get invoices by order
 */
export function useInvoicesByOrder(orderId: string | null) {
  return useQuery({
    queryKey: ['invoices', 'order', orderId],
    queryFn: () => invoiceService.getByOrder(orderId!),
    enabled: !!orderId,
  })
}

/**
 * Hook: Get invoices by opportunity
 */
export function useInvoicesByOpportunity(opportunityId: string | null) {
  return useQuery({
    queryKey: ['invoices', 'opportunity', opportunityId],
    queryFn: () => invoiceService.getByOpportunity(opportunityId!),
    enabled: !!opportunityId,
  })
}

/**
 * Hook: Get invoices by customer
 */
export function useInvoicesByCustomer(customerId: string | null) {
  return useQuery({
    queryKey: ['invoices', 'customer', customerId],
    queryFn: () => invoiceService.getByCustomer(customerId!),
    enabled: !!customerId,
  })
}

/**
 * Hook: Get overdue invoices
 */
export function useOverdueInvoices() {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: () => invoiceService.getOverdue(),
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook: Get invoice statistics
 */
export function useInvoiceStatistics() {
  return useQuery({
    queryKey: ['invoices', 'statistics'],
    queryFn: () => invoiceService.getStatistics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

/**
 * Hook: Get active invoices (helper)
 */
export function useActiveInvoices() {
  return useInvoicesByState(InvoiceStateCode.Active)
}

/**
 * Hook: Get paid invoices (helper)
 */
export function usePaidInvoices() {
  return useInvoicesByState(InvoiceStateCode.Paid)
}

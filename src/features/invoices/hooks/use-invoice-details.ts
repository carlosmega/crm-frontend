import { useQuery } from '@tanstack/react-query'
import { invoiceDetailService } from '../api/invoice-detail-service'
import type { InvoiceDetail } from '@/core/contracts/entities/invoice-detail'

/**
 * Hook: Get invoice lines by invoice ID
 */
export function useInvoiceDetails(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-details', invoiceId],
    queryFn: () => invoiceDetailService.getByInvoice(invoiceId!),
    enabled: !!invoiceId,
  })
}

/**
 * Hook: Get invoice line by ID
 */
export function useInvoiceDetail(id: string | null) {
  return useQuery({
    queryKey: ['invoice-details', 'detail', id],
    queryFn: () => invoiceDetailService.getById(id!),
    enabled: !!id,
  })
}

/**
 * Hook: Get invoice statistics
 */
export function useInvoiceDetailStatistics(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-details', 'statistics', invoiceId],
    queryFn: () => invoiceDetailService.getStatistics(invoiceId!),
    enabled: !!invoiceId,
  })
}

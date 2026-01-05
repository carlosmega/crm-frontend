import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceService } from '../api/invoice-service'
import { invoiceDetailService } from '../api/invoice-detail-service'
import type {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  MarkInvoicePaidDto,
} from '@/core/contracts/entities/invoice'
import type {
  CreateInvoiceDetailDto,
  UpdateInvoiceDetailDto,
} from '@/core/contracts/entities/invoice-detail'
import type { Order } from '@/core/contracts/entities/order'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'

/**
 * Hook: Create invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoiceService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

/**
 * Hook: Create invoice from order mutation
 * 🔥 CRÍTICO: Flujo Order → Invoice con líneas
 */
export function useCreateInvoiceFromOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      // Backend/Mock service fetch order data and create invoice automatically
      const invoice = await invoiceService.createFromOrder(orderId)
      return invoice
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({
        queryKey: ['invoices', invoice.invoiceid],
      })
      queryClient.invalidateQueries({
        queryKey: ['invoice-details', invoice.invoiceid],
      })
      if (invoice.salesorderid) {
        queryClient.invalidateQueries({
          queryKey: ['invoices', 'order', invoice.salesorderid],
        })
      }
    },
  })
}

/**
 * Hook: Update invoice mutation
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInvoiceDto }) =>
      invoiceService.update(id, dto),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      if (invoice) {
        queryClient.invalidateQueries({
          queryKey: ['invoices', invoice.invoiceid],
        })
      }
    },
  })
}

/**
 * Hook: Mark invoice as paid mutation
 */
export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentdate }: { id: string; paymentdate?: string }) =>
      invoiceService.markAsPaid(id, paymentdate),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'statistics'] })
      if (invoice) {
        queryClient.invalidateQueries({
          queryKey: ['invoices', invoice.invoiceid],
        })
      }
    },
  })
}

/**
 * Hook: Cancel invoice mutation
 */
export function useCancelInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      invoiceService.cancel(id, reason),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      if (invoice) {
        queryClient.invalidateQueries({
          queryKey: ['invoices', invoice.invoiceid],
        })
      }
    },
  })
}

/**
 * Hook: Delete invoice mutation
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

// ========================================
// INVOICE DETAIL MUTATIONS
// ========================================

/**
 * Hook: Create invoice line mutation
 */
export function useCreateInvoiceDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateInvoiceDetailDto) => invoiceDetailService.create(dto),
    onSuccess: (detail) => {
      queryClient.invalidateQueries({
        queryKey: ['invoice-details', detail.invoiceid],
      })
      queryClient.invalidateQueries({
        queryKey: ['invoices', detail.invoiceid],
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

/**
 * Hook: Update invoice line mutation
 */
export function useUpdateInvoiceDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInvoiceDetailDto }) =>
      invoiceDetailService.update(id, dto),
    onSuccess: (detail) => {
      if (detail) {
        queryClient.invalidateQueries({
          queryKey: ['invoice-details', detail.invoiceid],
        })
        queryClient.invalidateQueries({
          queryKey: ['invoices', detail.invoiceid],
        })
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
      }
    },
  })
}

/**
 * Hook: Delete invoice line mutation
 */
export function useDeleteInvoiceDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId: string }) =>
      invoiceDetailService.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['invoice-details', variables.invoiceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['invoices', variables.invoiceId],
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

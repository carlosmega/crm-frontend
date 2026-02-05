import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteDetailService } from '../api/quote-detail-service'
import { quoteKeys } from './use-quotes'
import type {
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
  QuoteDetail,
} from '../types'
import { toast } from 'sonner'

/**
 * Query keys for quote details
 */
export const quoteDetailKeys = {
  all: ['quote-details'] as const,
  byQuote: (quoteId: string) => [...quoteDetailKeys.all, quoteId] as const,
  detail: (id: string) => [...quoteDetailKeys.all, 'detail', id] as const,
  statistics: (quoteId: string) =>
    [...quoteDetailKeys.all, 'statistics', quoteId] as const,
}

/**
 * Helper: Invalidate quote and line caches after a product mutation.
 *
 * Only 2 invalidations needed — the backend (Django) handles
 * version snapshots and total recalculations internally.
 */
function invalidateQuoteAndLines(
  queryClient: ReturnType<typeof useQueryClient>,
  quoteId: string
) {
  // Re-fetch quote (totals changed on backend)
  queryClient.invalidateQueries({
    queryKey: quoteKeys.detail(quoteId),
  })

  // Re-fetch line items list
  queryClient.invalidateQueries({
    queryKey: quoteDetailKeys.byQuote(quoteId),
  })
}

/**
 * Get quote details by quote ID
 * staleTime 1 minuto (quote lines cambian poco)
 */
export function useQuoteDetails(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.byQuote(quoteId || ''),
    queryFn: () => quoteDetailService.getByQuote(quoteId!),
    enabled: !!quoteId,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  })
}

/**
 * Get quote detail by ID
 * staleTime 1 minuto
 */
export function useQuoteDetail(id: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.detail(id || ''),
    queryFn: () => quoteDetailService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  })
}

/**
 * Get quote detail statistics
 * staleTime 2 minutos
 */
export function useQuoteDetailStatistics(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.statistics(quoteId || ''),
    queryFn: () => quoteDetailService.getStatistics(quoteId!),
    enabled: !!quoteId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create quote detail mutation
 *
 * POST → Backend saves product, recalculates totals, creates version snapshot.
 * Frontend only invalidates quote + lines (2 GETs).
 */
export function useCreateQuoteDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteDetailDto) =>
      quoteDetailService.create(data),
    onSuccess: (newDetail) => {
      invalidateQuoteAndLines(queryClient, newDetail.quoteid)
      toast.success('Product added to quote')
    },
    onError: (error: Error) => {
      toast.error('Failed to add product', {
        description: error.message,
      })
    },
  })
}

/**
 * Update quote detail mutation
 *
 * PATCH → Backend updates product, recalculates totals, creates version snapshot.
 * Frontend only invalidates quote + lines (2 GETs).
 */
export function useUpdateQuoteDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateQuoteDetailDto
    }) => quoteDetailService.update(id, data),
    onSuccess: (updatedDetail) => {
      if (!updatedDetail) return
      invalidateQuoteAndLines(queryClient, updatedDetail.quoteid)
      toast.success('Product updated')
    },
    onError: (error: Error) => {
      toast.error('Failed to update product', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete quote detail mutation
 *
 * DELETE → Backend removes product, recalculates totals, creates version snapshot.
 * Frontend only invalidates quote + lines (2 GETs).
 */
export function useDeleteQuoteDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, quoteId }: { id: string; quoteId: string }) => {
      await quoteDetailService.delete(id)
      return { quoteId }
    },
    onSuccess: ({ quoteId }) => {
      invalidateQuoteAndLines(queryClient, quoteId)
      toast.success('Product removed from quote')
    },
    onError: (error: Error) => {
      toast.error('Failed to remove product', {
        description: error.message,
      })
    },
  })
}

/**
 * Bulk create quote details mutation
 *
 * Multiple POSTs → Backend handles each product + snapshot.
 * Frontend invalidates once after all products are created.
 */
export function useBulkCreateQuoteDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteDetailDto[]) =>
      quoteDetailService.bulkCreate(data),
    onSuccess: (newDetails) => {
      if (newDetails.length === 0) return
      invalidateQuoteAndLines(queryClient, newDetails[0].quoteid)
      toast.success(`${newDetails.length} products added to quote`)
    },
    onError: (error: Error) => {
      toast.error('Failed to add products', {
        description: error.message,
      })
    },
  })
}

/**
 * Reorder quote details mutation
 */
export function useReorderQuoteDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quoteId,
      detailIds,
    }: {
      quoteId: string
      detailIds: string[]
    }) => quoteDetailService.reorder(quoteId, detailIds),
    onSuccess: (_, { quoteId }) => {
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.byQuote(quoteId),
      })
      toast.success('Product order updated')
    },
    onError: (error: Error) => {
      toast.error('Failed to reorder products', {
        description: error.message,
      })
    },
  })
}

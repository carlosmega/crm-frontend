import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteDetailService } from '../api/quote-detail-service'
import { quoteKeys } from './use-quotes'
import type {
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
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
 * Get quote details by quote ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto (quote lines cambian poco)
 */
export function useQuoteDetails(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.byQuote(quoteId || ''),
    queryFn: () => quoteDetailService.getByQuote(quoteId!),
    enabled: !!quoteId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos en cache
  })
}

/**
 * Get quote detail by ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto
 */
export function useQuoteDetail(id: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.detail(id || ''),
    queryFn: () => quoteDetailService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos en cache
  })
}

/**
 * Get quote detail statistics
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos (estadísticas cambian lentamente)
 */
export function useQuoteDetailStatistics(quoteId: string | undefined) {
  return useQuery({
    queryKey: quoteDetailKeys.statistics(quoteId || ''),
    queryFn: () => quoteDetailService.getStatistics(quoteId!),
    enabled: !!quoteId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  })
}

/**
 * Create quote detail mutation
 */
export function useCreateQuoteDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteDetailDto) =>
      quoteDetailService.create(data),
    onSuccess: (newDetail) => {
      // Invalidate quote details for this quote
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.byQuote(newDetail.quoteid),
      })

      // Invalidate quote (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(newDetail.quoteid),
      })

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.statistics(newDetail.quoteid),
      })

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

      // Invalidate quote details for this quote
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.byQuote(updatedDetail.quoteid),
      })

      // Invalidate quote (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(updatedDetail.quoteid),
      })

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.statistics(updatedDetail.quoteid),
      })

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
 */
export function useDeleteQuoteDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, quoteId }: { id: string; quoteId: string }) =>
      quoteDetailService.delete(id),
    onSuccess: (_, { quoteId }) => {
      // Invalidate quote details for this quote
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.byQuote(quoteId),
      })

      // Invalidate quote (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(quoteId),
      })

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.statistics(quoteId),
      })

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
 */
export function useBulkCreateQuoteDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteDetailDto[]) =>
      quoteDetailService.bulkCreate(data),
    onSuccess: (newDetails) => {
      if (newDetails.length === 0) return

      const quoteId = newDetails[0].quoteid

      // Invalidate quote details for this quote
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.byQuote(quoteId),
      })

      // Invalidate quote (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(quoteId),
      })

      // Invalidate statistics
      queryClient.invalidateQueries({
        queryKey: quoteDetailKeys.statistics(quoteId),
      })

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
      // Invalidate quote details for this quote
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

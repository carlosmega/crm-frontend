import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteDetailService } from '../api/quote-detail-service'
import { quoteService } from '../api/quote-service'
import { quoteVersionService } from '../api/quote-version-service'
import { quoteKeys } from './use-quotes'
import { quoteVersionKeys } from './use-quote-versions'
import { QuoteVersionChangeType } from '@/core/contracts'
import type {
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
  Quote,
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
 * Helper: Create version snapshot for product changes
 */
async function createProductVersionSnapshot(
  quoteId: string,
  changetype: QuoteVersionChangeType,
  productDescription: string,
  changedfields?: string[]
) {
  try {
    // Get current quote and lines
    const quote = await quoteService.getById(quoteId)
    if (!quote) return

    const quoteLines = await quoteDetailService.getByQuote(quoteId)

    // Create version snapshot
    await quoteVersionService.createSnapshot(quote, quoteLines, changetype, {
      changedescription: getProductChangeDescription(changetype, productDescription),
      changedfields,
      createdby: 'current-user',
    })
  } catch (error) {
    console.warn('[Versioning] Failed to create product snapshot:', error)
  }
}

/**
 * Get description for product changes
 */
function getProductChangeDescription(
  changetype: QuoteVersionChangeType,
  productDescription: string
): string {
  switch (changetype) {
    case QuoteVersionChangeType.ProductAdded:
      return `Added product: ${productDescription}`
    case QuoteVersionChangeType.ProductUpdated:
      return `Updated product: ${productDescription}`
    case QuoteVersionChangeType.ProductRemoved:
      return `Removed product: ${productDescription}`
    default:
      return 'Product changed'
  }
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
    onSuccess: async (newDetail) => {
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

      // Create version snapshot
      await createProductVersionSnapshot(
        newDetail.quoteid,
        QuoteVersionChangeType.ProductAdded,
        newDetail.productdescription,
        ['products', 'totalamount']
      )

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(newDetail.quoteid),
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
    onSuccess: async (updatedDetail) => {
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

      // Determine changed fields
      const changedfields = ['quantity', 'priceperunit', 'manualdiscountamount', 'tax', 'totalamount']

      // Create version snapshot
      await createProductVersionSnapshot(
        updatedDetail.quoteid,
        QuoteVersionChangeType.ProductUpdated,
        updatedDetail.productdescription,
        changedfields
      )

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(updatedDetail.quoteid),
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
    mutationFn: async ({ id, quoteId }: { id: string; quoteId: string }) => {
      // Get product info before deleting (for version history)
      const detail = await quoteDetailService.getById(id)
      await quoteDetailService.delete(id)
      return { quoteId, productDescription: detail?.productdescription || 'Unknown product' }
    },
    onSuccess: async ({ quoteId, productDescription }) => {
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

      // Create version snapshot
      await createProductVersionSnapshot(
        quoteId,
        QuoteVersionChangeType.ProductRemoved,
        productDescription,
        ['products', 'totalamount']
      )

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(quoteId),
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
    onSuccess: async (newDetails) => {
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

      // Create version snapshot
      await createProductVersionSnapshot(
        quoteId,
        QuoteVersionChangeType.ProductAdded,
        `${newDetails.length} products`,
        ['products', 'totalamount']
      )

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(quoteId),
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

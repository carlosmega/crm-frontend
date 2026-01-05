import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteDetailService } from '../api/quote-detail-service'
import { quoteKeys } from './use-quotes'
import type { UpdateQuoteDetailDto, QuoteDetail } from '../types'
import { toast } from 'sonner'

/**
 * Bulk delete Quote Lines mutation
 */
export function useBulkDeleteQuoteLines(quoteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lineIds: string[]) => {
      // Delete all lines sequentially (or in parallel)
      const promises = lineIds.map((lineId) =>
        quoteDetailService.delete(lineId)
      )
      await Promise.all(promises)
      return lineIds
    },
    onSuccess: (deletedIds) => {
      // Invalidate quote detail (which includes quote lines)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(quoteId),
      })

      // Invalidate lists (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.lists(),
      })

      toast.success('Quote lines deleted', {
        description: `${deletedIds.length} ${deletedIds.length === 1 ? 'line' : 'lines'} removed successfully.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete quote lines', {
        description: error.message,
      })
    },
  })
}

/**
 * Bulk update Quote Lines mutation
 *
 * Aplica discount en batch a múltiples líneas
 */
export function useBulkUpdateQuoteLines(quoteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      updates,
    }: {
      updates: Array<{ lineId: string; data: UpdateQuoteDetailDto }>
    }) => {
      // Update all lines
      const promises = updates.map(({ lineId, data }) =>
        quoteDetailService.update(lineId, data)
      )
      const results = await Promise.all(promises)
      return results
    },
    onSuccess: (updatedLines) => {
      // Invalidate quote detail (which includes quote lines)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(quoteId),
      })

      // Invalidate lists (totals changed)
      queryClient.invalidateQueries({
        queryKey: quoteKeys.lists(),
      })

      toast.success('Quote lines updated', {
        description: `${updatedLines.length} ${updatedLines.length === 1 ? 'line' : 'lines'} updated successfully.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update quote lines', {
        description: error.message,
      })
    },
  })
}

/**
 * Apply bulk discount to Quote Lines
 *
 * Helper que calcula el discount por línea y llama a useBulkUpdateQuoteLines
 */
export function useApplyBulkDiscount(quoteId: string) {
  const bulkUpdate = useBulkUpdateQuoteLines(quoteId)

  return {
    ...bulkUpdate,
    applyDiscount: (
      selectedLines: QuoteDetail[],
      discountType: 'percentage' | 'amount',
      value: number
    ) => {
      const updates = selectedLines.map((line) => {
        const baseAmount = line.quantity * line.priceperunit
        let discountAmount = 0

        if (discountType === 'percentage') {
          discountAmount = baseAmount * (value / 100)
        } else {
          discountAmount = value
        }

        // Ensure discount doesn't exceed base amount
        discountAmount = Math.min(discountAmount, baseAmount)

        return {
          lineId: line.quotedetailid,
          data: {
            manualdiscountamount: discountAmount,
          },
        }
      })

      return bulkUpdate.mutate({ updates })
    },
  }
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteService } from '../api/quote-service'
import { quoteKeys } from './use-quotes'
import type {
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto,
  CloseQuoteDto,
} from '../types'
import { toast } from 'sonner'

/**
 * Create quote mutation
 */
export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteDto) => quoteService.create(data),
    onSuccess: (newQuote) => {
      // Invalidate quotes list
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // If linked to opportunity, invalidate opportunity quotes
      if (newQuote.opportunityid) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byOpportunity(newQuote.opportunityid),
        })
      }

      toast.success('Quote created successfully', {
        description: `Quote "${newQuote.name}" has been created.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Update quote mutation
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateQuoteDto
    }) => quoteService.update(id, data),
    onSuccess: (updatedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(updatedQuote.quoteid),
      })

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      toast.success('Quote updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete quote mutation
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.delete(id),
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: quoteKeys.detail(id) })

      toast.success('Quote deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Activate quote mutation
 *
 * Cambia de Draft → Active
 */
export function useActivateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: ActivateQuoteDto
    }) => quoteService.activate(id, data),
    onSuccess: (activatedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(activatedQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      toast.success('Quote activated successfully', {
        description: `Quote "${activatedQuote.name}" is now Active.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to activate quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Win quote mutation
 *
 * Cambia a Won y cierra Opportunity vinculada automáticamente
 */
export function useWinQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: CloseQuoteDto
    }) => quoteService.win(id, data),
    onSuccess: async (wonQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(wonQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      // ✅ NEW: Update linked Opportunity if exists
      if (wonQuote.opportunityid) {
        try {
          const { opportunityService } = await import('@/features/opportunities/api/opportunity-service')
          const { toastHelpers } = await import('@/shared/utils/toast-helpers')

          await opportunityService.closeAsWon(wonQuote.opportunityid, {
            actualrevenue: wonQuote.totalamount,
            actualclosedate: new Date().toISOString()
          })

          // Invalidate opportunity queries
          queryClient.invalidateQueries({ queryKey: ['opportunities'] })

          toastHelpers.success('Quote and Opportunity updated!',
            `Quote won and linked Opportunity has been closed successfully.`
          )
        } catch (error) {
          // ⚠️ Permissive: log warning but don't fail the whole operation
          console.error('[WARN] Failed to update linked Opportunity:', error)
          const { toastHelpers } = await import('@/shared/utils/toast-helpers')
          toastHelpers.warning('Quote won, but Opportunity update failed',
            'You may need to close the Opportunity manually.'
          )
        }
      } else {
        // Quote without linked Opportunity
        const { toastHelpers } = await import('@/shared/utils/toast-helpers')
        toastHelpers.success('Quote won!',
          `Quote "${wonQuote.name}" has been marked as Won.`
        )
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to win quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Lose quote mutation
 */
export function useLoseQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: CloseQuoteDto
    }) => quoteService.lose(id, data),
    onSuccess: (lostQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(lostQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      toast.success('Quote closed as Lost')
    },
    onError: (error: Error) => {
      toast.error('Failed to close quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Cancel quote mutation
 */
export function useCancelQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      quoteService.cancel(id, reason),
    onSuccess: (canceledQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(canceledQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      toast.success('Quote canceled')
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Revise quote mutation (reopen)
 */
export function useReviseQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.revise(id),
    onSuccess: (revisedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(revisedQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      toast.success('Quote reopened for revision', {
        description: `Quote "${revisedQuote.name}" is now in Draft state.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to revise quote', {
        description: error.message,
      })
    },
  })
}

/**
 * Clone quote mutation
 *
 * Crea una copia del Quote con todas sus líneas de producto
 * El nuevo Quote se crea en estado Draft
 */
export function useCloneQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.clone(id),
    onSuccess: (clonedQuote) => {
      // Invalidate lists (new quote added)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // If linked to opportunity, invalidate opportunity quotes
      if (clonedQuote.opportunityid) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byOpportunity(clonedQuote.opportunityid),
        })
      }

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      toast.success('Quote cloned successfully', {
        description: `"${clonedQuote.name}" has been created as a draft. You can now edit and activate it.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to clone quote', {
        description: error.message,
      })
    },
  })
}

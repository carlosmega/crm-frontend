import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteService } from '../api/quote-service'
import { quoteDetailService } from '../api/quote-detail-service'
import { quoteVersionService } from '../api/quote-version-service'
import { quoteKeys } from './use-quotes'
import { quoteDetailKeys } from './use-quote-details'
import { quoteVersionKeys } from './use-quote-versions'
import { QuoteVersionChangeType } from '@/core/contracts'
import type {
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto,
  CloseQuoteDto,
  Quote,
} from '../types'
import { toast } from 'sonner'

/**
 * Helper: Create version snapshot after quote operation
 */
async function createVersionSnapshot(
  quote: Quote,
  changetype: QuoteVersionChangeType,
  options?: {
    changedescription?: string
    changedfields?: string[]
    changereason?: string
    createdby?: string
  }
) {
  try {
    // Get current quote lines
    const quoteLines = await quoteDetailService.getByQuote(quote.quoteid)

    // Create version snapshot
    await quoteVersionService.createSnapshot(quote, quoteLines, changetype, {
      ...options,
      createdby: options?.createdby || 'anonymous',
    })
  } catch (error) {
    // Don't fail the main operation if versioning fails
    console.warn('[Versioning] Failed to create snapshot:', error)
  }
}

/**
 * Create quote mutation
 */
export function useCreateQuote() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: (data: CreateQuoteDto) => quoteService.create(data),
    onSuccess: async (newQuote) => {
      // Invalidate quotes list
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // If linked to opportunity, invalidate opportunity quotes
      if (newQuote.opportunityid) {
        queryClient.invalidateQueries({
          queryKey: quoteKeys.byOpportunity(newQuote.opportunityid),
        })
      }

      // Create version snapshot
      await createVersionSnapshot(newQuote, QuoteVersionChangeType.Created, {
        changedescription: 'Quote created',
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(newQuote.quoteid),
      })

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateQuoteDto
    }) => quoteService.update(id, data),
    onSuccess: async (updatedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(updatedQuote.quoteid),
      })

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Determine changed fields
      const changedfields = Object.keys(updatedQuote).filter(
        key => !['quoteid', 'createdon', 'modifiedon', 'quotenumber'].includes(key)
      )

      // Create version snapshot
      await createVersionSnapshot(updatedQuote, QuoteVersionChangeType.Updated, {
        changedescription: 'Quote information updated',
        changedfields,
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(updatedQuote.quoteid),
      })

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
    onSuccess: async (_, id) => {
      // Delete version history too
      await quoteVersionService.deleteByQuote(id)

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: ActivateQuoteDto
    }) => quoteService.activate(id, data),
    onSuccess: async (activatedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(activatedQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      // Create version snapshot
      await createVersionSnapshot(activatedQuote, QuoteVersionChangeType.Activated, {
        changedescription: 'Quote activated and sent to customer',
        changedfields: ['statecode', 'statuscode'],
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(activatedQuote.quoteid),
      })

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
  const { data: session } = useSession()

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

      // Create version snapshot
      await createVersionSnapshot(wonQuote, QuoteVersionChangeType.Won, {
        changedescription: 'Quote won - Customer accepted',
        changedfields: ['statecode', 'statuscode'],
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(wonQuote.quoteid),
      })

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: CloseQuoteDto
    }) => quoteService.lose(id, data),
    onSuccess: async (lostQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(lostQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() })

      // Create version snapshot
      await createVersionSnapshot(lostQuote, QuoteVersionChangeType.Lost, {
        changedescription: 'Quote lost - Customer declined',
        changedfields: ['statecode', 'statuscode'],
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(lostQuote.quoteid),
      })

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      quoteService.cancel(id, reason),
    onSuccess: async (canceledQuote, { reason }) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(canceledQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Create version snapshot
      await createVersionSnapshot(canceledQuote, QuoteVersionChangeType.Canceled, {
        changedescription: 'Quote canceled',
        changedfields: ['statecode', 'statuscode'],
        changereason: reason,
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(canceledQuote.quoteid),
      })

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: (id: string) => quoteService.revise(id),
    onSuccess: async (revisedQuote) => {
      // Invalidate specific quote
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(revisedQuote.quoteid),
      })

      // Invalidate lists (state changed)
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })

      // Create version snapshot
      await createVersionSnapshot(revisedQuote, QuoteVersionChangeType.Revised, {
        changedescription: 'Quote reopened for revision',
        changedfields: ['statecode', 'statuscode'],
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(revisedQuote.quoteid),
      })

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
  const { data: session } = useSession()

  return useMutation({
    mutationFn: (id: string) => quoteService.clone(id),
    onSuccess: async (clonedQuote) => {
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

      // Create version snapshot for the new cloned quote
      await createVersionSnapshot(clonedQuote, QuoteVersionChangeType.Created, {
        changedescription: 'Quote created from clone',
        createdby: session?.user?.id,
      })

      // Invalidate version queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(clonedQuote.quoteid),
      })

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

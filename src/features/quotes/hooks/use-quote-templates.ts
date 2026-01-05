import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteTemplateService } from '../api/quote-template-service'
import type {
  QuoteTemplate,
  CreateQuoteTemplateDto,
  UpdateQuoteTemplateDto,
} from '@/core/contracts'
import { toast } from 'sonner'

/**
 * Query Keys for Quote Templates
 */
export const quoteTemplateKeys = {
  all: ['quote-templates'] as const,
  lists: () => [...quoteTemplateKeys.all, 'list'] as const,
  shared: () => [...quoteTemplateKeys.all, 'shared'] as const,
  byOwner: (ownerId: string) =>
    [...quoteTemplateKeys.all, 'owner', ownerId] as const,
  detail: (id: string) => [...quoteTemplateKeys.all, id] as const,
}

/**
 * Get all quote templates
 */
export function useQuoteTemplates() {
  return useQuery({
    queryKey: quoteTemplateKeys.lists(),
    queryFn: () => quoteTemplateService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos (templates cambian poco)
  })
}

/**
 * Get shared templates only
 */
export function useSharedQuoteTemplates() {
  return useQuery({
    queryKey: quoteTemplateKeys.shared(),
    queryFn: () => quoteTemplateService.getShared(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get template by ID
 */
export function useQuoteTemplate(id: string) {
  return useQuery({
    queryKey: quoteTemplateKeys.detail(id),
    queryFn: () => quoteTemplateService.getById(id),
    enabled: !!id,
  })
}

/**
 * Create quote template mutation
 */
export function useCreateQuoteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteTemplateDto) =>
      quoteTemplateService.create(data),
    onSuccess: (newTemplate) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.shared() })

      toast.success('Template created successfully', {
        description: `"${newTemplate.name}" is now available for use.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create template', {
        description: error.message,
      })
    },
  })
}

/**
 * Update quote template mutation
 */
export function useUpdateQuoteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateQuoteTemplateDto
    }) => quoteTemplateService.update(id, data),
    onSuccess: (updatedTemplate) => {
      if (!updatedTemplate) return

      // Invalidate specific template
      queryClient.invalidateQueries({
        queryKey: quoteTemplateKeys.detail(updatedTemplate.quotetemplateid),
      })

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.lists() })

      toast.success('Template updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update template', {
        description: error.message,
      })
    },
  })
}

/**
 * Delete quote template mutation
 */
export function useDeleteQuoteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteTemplateService.delete(id),
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.shared() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: quoteTemplateKeys.detail(id) })

      toast.success('Template deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete template', {
        description: error.message,
      })
    },
  })
}

/**
 * Save Quote as Template mutation
 */
export function useSaveQuoteAsTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quote,
      quoteLines,
      templateData,
    }: {
      quote: any
      quoteLines: any[]
      templateData: {
        name: string
        description?: string
        category?: any
        isshared?: boolean
      }
    }) =>
      quoteTemplateService.createFromQuote(quote, quoteLines, templateData),
    onSuccess: (newTemplate) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quoteTemplateKeys.shared() })

      toast.success('Quote saved as template', {
        description: `"${newTemplate.name}" is now available for reuse.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to save as template', {
        description: error.message,
      })
    },
  })
}

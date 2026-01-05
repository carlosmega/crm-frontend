/**
 * Quote Version Hooks
 *
 * React Query hooks para manejar el historial de versiones de Quotes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteVersionService } from '../api/quote-version-service'
import type {
  QuoteVersion,
  QuoteVersionQueryParams,
  QuoteVersionComparison,
  QuoteVersionChangeType,
  Quote,
  QuoteDetail,
} from '@/core/contracts'
import { toast } from 'sonner'

/**
 * Query keys for quote versions
 */
export const quoteVersionKeys = {
  all: ['quote-versions'] as const,
  byQuote: (quoteid: string) => ['quote-versions', 'quote', quoteid] as const,
  detail: (versionid: string) => ['quote-versions', 'detail', versionid] as const,
  comparison: (fromId: string, toId: string) =>
    ['quote-versions', 'comparison', fromId, toId] as const,
  latest: (quoteid: string) => ['quote-versions', 'latest', quoteid] as const,
  count: (quoteid: string) => ['quote-versions', 'count', quoteid] as const,
}

/**
 * Get all versions for a quote
 */
export function useQuoteVersions(params: QuoteVersionQueryParams) {
  return useQuery({
    queryKey: quoteVersionKeys.byQuote(params.quoteid),
    queryFn: () => quoteVersionService.getVersionsByQuote(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get a specific version by ID
 */
export function useQuoteVersion(versionid: string) {
  return useQuery({
    queryKey: quoteVersionKeys.detail(versionid),
    queryFn: () => quoteVersionService.getById(versionid),
    enabled: !!versionid,
    staleTime: 1000 * 60 * 10, // 10 minutes (versions are immutable)
  })
}

/**
 * Get latest version for a quote
 */
export function useLatestQuoteVersion(quoteid: string) {
  return useQuery({
    queryKey: quoteVersionKeys.latest(quoteid),
    queryFn: () => quoteVersionService.getLatestVersion(quoteid),
    enabled: !!quoteid,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Get version count for a quote
 */
export function useQuoteVersionCount(quoteid: string) {
  return useQuery({
    queryKey: quoteVersionKeys.count(quoteid),
    queryFn: () => quoteVersionService.getVersionCount(quoteid),
    enabled: !!quoteid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Compare two versions
 */
export function useCompareVersions(fromVersionId: string, toVersionId: string) {
  return useQuery({
    queryKey: quoteVersionKeys.comparison(fromVersionId, toVersionId),
    queryFn: () => quoteVersionService.compareVersions(fromVersionId, toVersionId),
    enabled: !!fromVersionId && !!toVersionId,
    staleTime: 1000 * 60 * 10, // 10 minutes (comparisons don't change)
  })
}

/**
 * Create a version snapshot
 */
export function useCreateVersionSnapshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      quote,
      quoteLines,
      changetype,
      options,
    }: {
      quote: Quote
      quoteLines: QuoteDetail[]
      changetype: QuoteVersionChangeType
      options?: {
        changedescription?: string
        changedfields?: string[]
        changereason?: string
        createdby?: string
      }
    }) => {
      return quoteVersionService.createSnapshot(quote, quoteLines, changetype, options)
    },
    onSuccess: (newVersion) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.byQuote(newVersion.quoteid),
      })
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.latest(newVersion.quoteid),
      })
      queryClient.invalidateQueries({
        queryKey: quoteVersionKeys.count(newVersion.quoteid),
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create version snapshot', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to automatically create versions on Quote changes
 *
 * Use this in Quote mutation hooks to automatically track changes
 */
export function useAutoVersioning(quoteid: string) {
  const createSnapshot = useCreateVersionSnapshot()

  const trackChange = async (
    quote: Quote,
    quoteLines: QuoteDetail[],
    changetype: QuoteVersionChangeType,
    options?: {
      changedescription?: string
      changedfields?: string[]
      changereason?: string
    }
  ) => {
    try {
      await createSnapshot.mutateAsync({
        quote,
        quoteLines,
        changetype,
        options,
      })
    } catch (error) {
      console.error('Failed to create version:', error)
      // Don't throw - versioning should not block the main operation
    }
  }

  return {
    trackChange,
    isTracking: createSnapshot.isPending,
  }
}

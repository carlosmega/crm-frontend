'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitorsService } from '../api/competitors-service'
import type {
  CreateCompetitorDto,
  UpdateCompetitorDto,
} from '@/core/contracts'

/**
 * Query key factory for competitors
 */
export const competitorKeys = {
  all: ['competitors'] as const,
  lists: () => [...competitorKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...competitorKeys.lists(), params] as const,
  details: () => [...competitorKeys.all, 'detail'] as const,
  detail: (id: string) => [...competitorKeys.details(), id] as const,
  opportunities: (competitorId: string) =>
    [...competitorKeys.all, 'opportunities', competitorId] as const,
  byOpportunity: (opportunityId: string) =>
    [...competitorKeys.all, 'by-opportunity', opportunityId] as const,
}

/**
 * List competitors with optional filters
 */
export function useCompetitors(params?: {
  statecode?: number
  search?: string
}) {
  return useQuery({
    queryKey: competitorKeys.list(params ?? {}),
    queryFn: () => competitorsService.list(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single competitor by ID
 */
export function useCompetitor(id: string) {
  return useQuery({
    queryKey: competitorKeys.detail(id),
    queryFn: () => competitorsService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get all opportunities linked to a competitor
 */
export function useCompetitorOpportunities(competitorId: string) {
  return useQuery({
    queryKey: competitorKeys.opportunities(competitorId),
    queryFn: () => competitorsService.getOpportunities(competitorId),
    enabled: !!competitorId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get all competitors linked to an opportunity
 */
export function useCompetitorsByOpportunity(opportunityId: string) {
  return useQuery({
    queryKey: competitorKeys.byOpportunity(opportunityId),
    queryFn: () => competitorsService.getByOpportunity(opportunityId),
    enabled: !!opportunityId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new competitor
 */
export function useCreateCompetitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompetitorDto) => competitorsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitorKeys.all })
    },
  })
}

/**
 * Update an existing competitor
 */
export function useUpdateCompetitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompetitorDto }) =>
      competitorsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitorKeys.all })
    },
  })
}

/**
 * Delete a competitor
 */
export function useDeleteCompetitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => competitorsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitorKeys.all })
    },
  })
}

/**
 * Link a competitor to an opportunity
 */
export function useLinkCompetitorOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      competitorId,
      opportunityId,
    }: {
      competitorId: string
      opportunityId: string
    }) => competitorsService.linkOpportunity(competitorId, opportunityId),
    onSuccess: (_, { competitorId, opportunityId }) => {
      queryClient.invalidateQueries({
        queryKey: competitorKeys.opportunities(competitorId),
      })
      queryClient.invalidateQueries({
        queryKey: competitorKeys.byOpportunity(opportunityId),
      })
    },
  })
}

/**
 * Unlink a competitor from an opportunity
 */
export function useUnlinkCompetitorOpportunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      competitorId,
      opportunityId,
    }: {
      competitorId: string
      opportunityId: string
    }) => competitorsService.unlinkOpportunity(competitorId, opportunityId),
    onSuccess: (_, { competitorId, opportunityId }) => {
      queryClient.invalidateQueries({
        queryKey: competitorKeys.opportunities(competitorId),
      })
      queryClient.invalidateQueries({
        queryKey: competitorKeys.byOpportunity(opportunityId),
      })
    },
  })
}

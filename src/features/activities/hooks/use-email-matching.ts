import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../api/activity-service'
import type { LinkEmailDto } from '@/core/contracts/entities/email'

/**
 * Hook: Get unlinked emails (emails without a regarding object)
 */
export function useUnlinkedEmails() {
  return useQuery({
    queryKey: ['activities', 'emails', 'unlinked'],
    queryFn: () => activityService.getUnlinkedEmails(),
    refetchInterval: 60000,
  })
}

/**
 * Hook: Get unlinked email count (for badge display)
 */
export function useUnlinkedEmailCount() {
  return useQuery({
    queryKey: ['activities', 'emails', 'unlinked', 'count'],
    queryFn: () => activityService.getUnlinkedEmailCount(),
    refetchInterval: 30000,
  })
}

/**
 * Hook: Get match suggestions for an email activity
 */
export function useMatchSuggestions(activityId: string | null) {
  return useQuery({
    queryKey: ['activities', 'emails', 'match-suggestions', activityId],
    queryFn: () => activityService.getMatchSuggestions(activityId!),
    enabled: !!activityId,
  })
}

/**
 * Hook: Link email mutation
 */
export function useLinkEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, dto }: { activityId: string; dto: LinkEmailDto }) =>
      activityService.linkEmail(activityId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'emails', 'unlinked'] })
    },
  })
}

/**
 * Hook: Unlink email mutation
 */
export function useUnlinkEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      activityService.unlinkEmail(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'emails', 'unlinked'] })
    },
  })
}

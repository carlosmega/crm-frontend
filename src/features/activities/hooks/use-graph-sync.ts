/**
 * Microsoft Graph Sync Hooks
 *
 * React Query hooks for Office 365 email sync:
 * - useGraphConnectionStatus — query connection state (refetch 60s)
 * - useGraphConnect — mutation to start OAuth flow
 * - useGraphSync — mutation to trigger email sync
 * - useGraphDisconnect — mutation to disconnect account
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../api/activity-service'

/**
 * Query hook for Microsoft Graph connection status.
 * Auto-refetches every 60 seconds.
 */
export function useGraphConnectionStatus() {
  return useQuery({
    queryKey: ['graph', 'status'],
    queryFn: () => activityService.getGraphConnectionStatus(),
    refetchInterval: 60000,
  })
}

/**
 * Mutation hook to initiate Microsoft OAuth2 connection.
 * On success, redirects the browser to Microsoft login.
 */
export function useGraphConnect() {
  return useMutation({
    mutationFn: () => activityService.getGraphConnectUrl(),
    onSuccess: (data) => {
      window.location.href = data.authorization_url
    },
  })
}

/**
 * Mutation hook to trigger on-demand email sync from Graph API.
 * Invalidates activities and unlinked email queries on success.
 */
export function useGraphSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activityService.syncGraphEmails(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'emails', 'unlinked'] })
      queryClient.invalidateQueries({ queryKey: ['graph', 'status'] })
    },
  })
}

/**
 * Mutation hook to disconnect Microsoft account.
 * Invalidates graph status query on success.
 */
export function useGraphDisconnect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => activityService.disconnectGraph(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph', 'status'] })
    },
  })
}

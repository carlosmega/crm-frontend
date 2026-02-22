'use client'

import { useQuery } from '@tanstack/react-query'
import { notificationService } from '../api/notification-service'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useNotifications(filters?: {
  is_read?: boolean
  typecode?: string
  search?: string
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: notificationKeys.list(filters ?? {}),
    queryFn: () => notificationService.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    notifications: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}

export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  })

  return data ?? 0
}

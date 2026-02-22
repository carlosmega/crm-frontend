'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationService } from '../api/notification-service'
import { notificationKeys } from './use-notifications'

export function useNotificationMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
  }

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      invalidateAll()
    },
    onError: () => {
      toast.error('Failed to mark as read')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      invalidateAll()
      toast.success('All notifications marked as read')
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })

  const deleteNotificationsMutation = useMutation({
    mutationFn: (ids: string[]) => notificationService.deleteNotifications(ids),
    onSuccess: (_data, ids) => {
      invalidateAll()
      toast.success(`${ids.length} notification${ids.length === 1 ? '' : 's'} deleted`)
    },
    onError: () => {
      toast.error('Failed to delete notifications')
    },
  })

  const archiveNotificationsMutation = useMutation({
    mutationFn: (ids: string[]) => notificationService.archiveNotifications(ids),
    onSuccess: (_data, ids) => {
      invalidateAll()
      toast.success(`${ids.length} notification${ids.length === 1 ? '' : 's'} archived`)
    },
    onError: () => {
      toast.error('Failed to archive notifications')
    },
  })

  return {
    markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotifications: (ids: string[]) => deleteNotificationsMutation.mutateAsync(ids),
    archiveNotifications: (ids: string[]) => archiveNotificationsMutation.mutateAsync(ids),
  }
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../api/activity-service'
import type {
  CreateActivityDto,
  UpdateActivityDto,
  CompleteActivityDto,
} from '@/core/contracts/entities/activity'

/**
 * Hook: Create activity mutation
 */
export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateActivityDto) => activityService.create(dto),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity.regardingobjectid) {
        queryClient.invalidateQueries({
          queryKey: ['activities', 'regarding', activity.regardingobjectid],
        })
      }
      if (activity.ownerid) {
        queryClient.invalidateQueries({
          queryKey: ['activities', 'owner', activity.ownerid],
        })
      }
    },
  })
}

/**
 * Hook: Update activity mutation
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateActivityDto }) =>
      activityService.update(id, dto),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity) {
        queryClient.invalidateQueries({
          queryKey: ['activities', activity.activityid],
        })
        if (activity.regardingobjectid) {
          queryClient.invalidateQueries({
            queryKey: ['activities', 'regarding', activity.regardingobjectid],
          })
        }
      }
    },
  })
}

/**
 * Hook: Complete activity mutation
 */
export function useCompleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CompleteActivityDto }) =>
      activityService.complete(id, dto),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activities', 'statistics'] })
      if (activity) {
        queryClient.invalidateQueries({
          queryKey: ['activities', activity.activityid],
        })
        if (activity.regardingobjectid) {
          queryClient.invalidateQueries({
            queryKey: ['activities', 'regarding', activity.regardingobjectid],
          })
        }
      }
    },
  })
}

/**
 * Hook: Cancel activity mutation
 */
export function useCancelActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activityService.cancel(id),
    onSuccess: (activity) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (activity) {
        queryClient.invalidateQueries({
          queryKey: ['activities', activity.activityid],
        })
        if (activity.regardingobjectid) {
          queryClient.invalidateQueries({
            queryKey: ['activities', 'regarding', activity.regardingobjectid],
          })
        }
      }
    },
  })
}

/**
 * Hook: Delete activity mutation
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

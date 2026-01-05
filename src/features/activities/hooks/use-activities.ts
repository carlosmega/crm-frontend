import { useQuery } from '@tanstack/react-query'
import { activityService } from '../api/activity-service'
import { ActivityStateCode, ActivityTypeCode } from '@/core/contracts/enums'

/**
 * Hook: Get all activities
 */
export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll(),
  })
}

/**
 * Hook: Get activity by ID
 */
export function useActivity(id: string | null) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activityService.getById(id!),
    enabled: !!id,
  })
}

/**
 * Hook: Get activities by type
 */
export function useActivitiesByType(typecode: ActivityTypeCode) {
  return useQuery({
    queryKey: ['activities', 'type', typecode],
    queryFn: () => activityService.getByType(typecode),
  })
}

/**
 * Hook: Get activities by state
 */
export function useActivitiesByState(statecode: ActivityStateCode) {
  return useQuery({
    queryKey: ['activities', 'state', statecode],
    queryFn: () => activityService.getByState(statecode),
  })
}

/**
 * Hook: Get activities by regarding object (Timeline)
 * 🔥 CRÍTICO: Este es el hook principal para mostrar el Timeline
 */
export function useActivitiesByRegarding(
  regardingId: string | null,
  regardingType?: string
) {
  return useQuery({
    queryKey: ['activities', 'regarding', regardingId, regardingType],
    queryFn: () => activityService.getByRegarding(regardingId!, regardingType),
    enabled: !!regardingId,
  })
}

/**
 * Hook: Get activities by owner
 */
export function useActivitiesByOwner(ownerId: string | null) {
  return useQuery({
    queryKey: ['activities', 'owner', ownerId],
    queryFn: () => activityService.getByOwner(ownerId!),
    enabled: !!ownerId,
  })
}

/**
 * Hook: Get upcoming activities
 */
export function useUpcomingActivities(ownerId?: string) {
  return useQuery({
    queryKey: ['activities', 'upcoming', ownerId],
    queryFn: () => activityService.getUpcoming(ownerId),
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook: Get overdue activities
 */
export function useOverdueActivities(ownerId?: string) {
  return useQuery({
    queryKey: ['activities', 'overdue', ownerId],
    queryFn: () => activityService.getOverdue(ownerId),
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook: Get activity statistics
 */
export function useActivityStatistics(ownerId?: string) {
  return useQuery({
    queryKey: ['activities', 'statistics', ownerId],
    queryFn: () => activityService.getStatistics(ownerId),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

/**
 * Hook: Get open activities (helper)
 */
export function useOpenActivities() {
  return useActivitiesByState(ActivityStateCode.Open)
}

/**
 * Hook: Get completed activities (helper)
 */
export function useCompletedActivities() {
  return useActivitiesByState(ActivityStateCode.Completed)
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsService } from '../api/goals-service'
import type {
  CreateGoalDto,
  UpdateGoalDto,
  CreateGoalMetricDto,
} from '@/core/contracts'

/**
 * Query key factory for goals
 */
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...goalKeys.lists(), params] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  metrics: () => [...goalKeys.all, 'metrics'] as const,
  team: (params: Record<string, unknown>) =>
    [...goalKeys.all, 'team', params] as const,
}

/**
 * List goals with optional filters
 */
export function useGoals(params?: {
  statecode?: number
  fiscalyear?: number
  fiscalperiod?: number
  goalownerid?: string
  search?: string
}) {
  return useQuery({
    queryKey: goalKeys.list(params ?? {}),
    queryFn: () => goalsService.list(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single goal by ID
 */
export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalsService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get team goals with optional fiscal period filters
 */
export function useTeamGoals(params?: {
  fiscalyear?: number
  fiscalperiod?: number
}) {
  return useQuery({
    queryKey: goalKeys.team(params ?? {}),
    queryFn: () => goalsService.getTeamGoals(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * List all goal metrics
 */
export function useGoalMetrics() {
  return useQuery({
    queryKey: goalKeys.metrics(),
    queryFn: () => goalsService.listMetrics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Create a new goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalDto) => goalsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

/**
 * Update an existing goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalDto }) =>
      goalsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

/**
 * Delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

/**
 * Trigger a rollup calculation for a goal
 */
export function useRollupGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalsService.rollup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

/**
 * Close a goal
 */
export function useCloseGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalsService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}

/**
 * Create a new goal metric
 */
export function useCreateGoalMetric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGoalMetricDto) => goalsService.createMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.metrics() })
    },
  })
}

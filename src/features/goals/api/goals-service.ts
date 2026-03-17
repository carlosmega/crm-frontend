/**
 * Goals Service
 *
 * API service for managing sales goals, metrics, and rollups.
 * Endpoints: /api/goals/
 */

import apiClient from '@/core/api/client'
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalMetric,
  CreateGoalMetricDto,
} from '@/core/contracts'

const BASE = '/goals'

export const goalsService = {
  /**
   * List goals with optional filters
   */
  list: async (params?: {
    statecode?: number
    fiscalyear?: number
    fiscalperiod?: number
    goalownerid?: string
    search?: string
  }) => {
    const response = await apiClient.get<Goal[]>(BASE, { params })
    return response.data
  },

  /**
   * Get a single goal by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Goal>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new goal
   */
  create: async (data: CreateGoalDto) => {
    const response = await apiClient.post<Goal>(BASE, data)
    return response.data
  },

  /**
   * Update an existing goal
   */
  update: async (id: string, data: UpdateGoalDto) => {
    const response = await apiClient.patch<Goal>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete a goal
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * Trigger a rollup calculation for a goal
   */
  rollup: async (id: string) => {
    const response = await apiClient.post<Goal>(`${BASE}/${id}/rollup`)
    return response.data
  },

  /**
   * Close a goal
   */
  close: async (id: string) => {
    const response = await apiClient.post<Goal>(`${BASE}/${id}/close`)
    return response.data
  },

  /**
   * List all goal metrics
   */
  listMetrics: async () => {
    const response = await apiClient.get<GoalMetric[]>(`${BASE}/metrics`)
    return response.data
  },

  /**
   * Create a new goal metric
   */
  createMetric: async (data: CreateGoalMetricDto) => {
    const response = await apiClient.post<GoalMetric>(`${BASE}/metrics`, data)
    return response.data
  },

  /**
   * Get team goals with optional fiscal period filters
   */
  getTeamGoals: async (params?: { fiscalyear?: number; fiscalperiod?: number }) => {
    const response = await apiClient.get<Goal[]>(`${BASE}/team`, { params })
    return response.data
  },
}

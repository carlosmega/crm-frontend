/**
 * Competitors Service
 *
 * API service for managing competitors and their opportunity relationships.
 * Endpoints: /api/competitors/
 */

import apiClient from '@/core/api/client'
import type {
  Competitor,
  CreateCompetitorDto,
  UpdateCompetitorDto,
} from '@/core/contracts'
import type { Opportunity } from '@/core/contracts'

const BASE = '/competitors'

export const competitorsService = {
  /**
   * List competitors with optional filters
   */
  list: async (params?: { statecode?: number; search?: string }) => {
    const response = await apiClient.get<Competitor[]>(BASE, { params })
    return response.data
  },

  /**
   * Get a single competitor by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Competitor>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new competitor
   */
  create: async (data: CreateCompetitorDto) => {
    const response = await apiClient.post<Competitor>(BASE, data)
    return response.data
  },

  /**
   * Update an existing competitor
   */
  update: async (id: string, data: UpdateCompetitorDto) => {
    const response = await apiClient.patch<Competitor>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete a competitor
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * Link a competitor to an opportunity
   */
  linkOpportunity: async (competitorId: string, opportunityId: string) => {
    await apiClient.post(`${BASE}/${competitorId}/opportunities/${opportunityId}`)
  },

  /**
   * Unlink a competitor from an opportunity
   */
  unlinkOpportunity: async (competitorId: string, opportunityId: string) => {
    await apiClient.delete(`${BASE}/${competitorId}/opportunities/${opportunityId}`)
  },

  /**
   * Get all opportunities linked to a competitor
   */
  getOpportunities: async (competitorId: string) => {
    const response = await apiClient.get<Opportunity[]>(
      `${BASE}/${competitorId}/opportunities`
    )
    return response.data
  },

  /**
   * Get all competitors linked to an opportunity
   */
  getByOpportunity: async (opportunityId: string) => {
    const response = await apiClient.get<Competitor[]>(
      `${BASE}/by-opportunity/${opportunityId}`
    )
    return response.data
  },
}

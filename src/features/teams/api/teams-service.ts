/**
 * Teams Service
 *
 * API service for managing teams and team membership.
 * Endpoints: /api/teams/
 */

import apiClient from '@/core/api/client'
import type {
  Team,
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
} from '@/core/contracts'
import type { SystemUser } from '@/core/contracts'

const BASE = '/teams'

export const teamsService = {
  /**
   * List teams with optional filters
   */
  list: async (params?: { teamtype?: number; search?: string }) => {
    const response = await apiClient.get<Team[]>(BASE, { params })
    return response.data
  },

  /**
   * Get a single team by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Team>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new team
   */
  create: async (data: CreateTeamDto) => {
    const response = await apiClient.post<Team>(BASE, data)
    return response.data
  },

  /**
   * Update an existing team
   */
  update: async (id: string, data: UpdateTeamDto) => {
    const response = await apiClient.patch<Team>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete a team
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * List members of a team
   */
  listMembers: async (teamId: string) => {
    const response = await apiClient.get<SystemUser[]>(`${BASE}/${teamId}/members`)
    return response.data
  },

  /**
   * Add a member to a team
   */
  addMember: async (teamId: string, data: AddTeamMemberDto) => {
    await apiClient.post(`${BASE}/${teamId}/members`, data)
  },

  /**
   * Remove a member from a team
   */
  removeMember: async (teamId: string, userId: string) => {
    await apiClient.delete(`${BASE}/${teamId}/members/${userId}`)
  },

  /**
   * Get teams for a specific user
   */
  getByUser: async (userId: string) => {
    const response = await apiClient.get<Team[]>(`${BASE}/by-user/${userId}`)
    return response.data
  },
}

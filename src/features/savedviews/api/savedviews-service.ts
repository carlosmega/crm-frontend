/**
 * Saved Views Service
 *
 * API service for managing saved/custom views (filters, columns, sort orders).
 * Endpoints: /api/savedviews/
 */

import apiClient from '@/core/api/client'
import type {
  SavedView,
  CreateSavedViewDto,
  UpdateSavedViewDto,
  ShareViewDto,
} from '@/core/contracts'

const BASE = '/savedviews'

export const savedviewsService = {
  /**
   * List saved views for an entity type, optionally filtered by view type
   */
  list: async (entitytype: string, viewtype?: number) => {
    const response = await apiClient.get<SavedView[]>(BASE, {
      params: { entitytype, viewtype },
    })
    return response.data
  },

  /**
   * Get a single saved view by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<SavedView>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new saved view
   */
  create: async (data: CreateSavedViewDto) => {
    const response = await apiClient.post<SavedView>(BASE, data)
    return response.data
  },

  /**
   * Update an existing saved view
   */
  update: async (id: string, data: UpdateSavedViewDto) => {
    const response = await apiClient.patch<SavedView>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete a saved view
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * Get the default view for an entity type
   */
  getDefault: async (entitytype: string) => {
    const response = await apiClient.get<SavedView>(
      `${BASE}/default/${entitytype}`
    )
    return response.data
  },

  /**
   * Set a view as the default for its entity type
   */
  setDefault: async (id: string) => {
    await apiClient.post(`${BASE}/${id}/set-default`)
  },

  /**
   * Pin a view for quick access
   */
  pin: async (id: string) => {
    await apiClient.post(`${BASE}/${id}/pin`)
  },

  /**
   * Unpin a view
   */
  unpin: async (id: string) => {
    await apiClient.post(`${BASE}/${id}/unpin`)
  },

  /**
   * Share a view with other users or teams
   */
  share: async (id: string, data: ShareViewDto) => {
    await apiClient.post(`${BASE}/${id}/share`, data)
  },
}

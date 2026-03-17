/**
 * Annotations Service
 *
 * API service for managing annotations (notes/attachments) on CDS entities.
 * Endpoints: /api/annotations/
 */

import apiClient from '@/core/api/client'
import type { Annotation, CreateAnnotationDto, UpdateAnnotationDto } from '@/core/contracts'

const BASE = '/annotations'

export const annotationsService = {
  /**
   * List annotations with optional filters
   */
  list: async (params?: { objectid?: string; objecttypecode?: string; search?: string }) => {
    const response = await apiClient.get<Annotation[]>(BASE, { params })
    return response.data
  },

  /**
   * Get a single annotation by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Annotation>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new annotation
   */
  create: async (data: CreateAnnotationDto) => {
    const response = await apiClient.post<Annotation>(BASE, data)
    return response.data
  },

  /**
   * Update an existing annotation
   */
  update: async (id: string, data: UpdateAnnotationDto) => {
    const response = await apiClient.patch<Annotation>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete an annotation
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * List annotations for a specific entity (by type and ID)
   */
  listByEntity: async (objecttypecode: string, objectid: string) => {
    const response = await apiClient.get<Annotation[]>(
      `${BASE}/entity/${objecttypecode}/${objectid}`
    )
    return response.data
  },
}

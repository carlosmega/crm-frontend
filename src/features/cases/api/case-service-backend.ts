import type {
  Case,
  CreateCaseDto,
  UpdateCaseDto,
  ResolveCaseDto,
  CancelCaseDto,
} from '@/core/contracts'
import { CaseStateCode } from '@/core/contracts'
import apiClient from '@/core/api/client'

/**
 * Case Service (Backend API)
 *
 * Calls Django REST API for case management.
 * Mirror of caseServiceMock for production use.
 */
export const caseServiceBackend = {
  /**
   * Get all cases
   */
  async getAll(params?: { search?: string }): Promise<Case[]> {
    const response = await apiClient.get<Case[]>('/api/cases/', { params })
    return response.data
  },

  /**
   * Get cases filtered by state
   */
  async getByState(statecode: CaseStateCode): Promise<Case[]> {
    const response = await apiClient.get<Case[]>('/api/cases/', {
      params: { statecode },
    })
    return response.data
  },

  /**
   * Get case by ID
   */
  async getById(id: string): Promise<Case | null> {
    try {
      const response = await apiClient.get<Case>(`/api/cases/${id}/`)
      return response.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return null
      }
      throw error
    }
  },

  /**
   * Create new case
   */
  async create(dto: CreateCaseDto): Promise<Case> {
    const response = await apiClient.post<Case>('/api/cases/', dto)
    return response.data
  },

  /**
   * Update existing case
   */
  async update(id: string, dto: UpdateCaseDto): Promise<Case | null> {
    try {
      const response = await apiClient.patch<Case>(`/api/cases/${id}/`, dto)
      return response.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return null
      }
      throw error
    }
  },

  /**
   * Delete case
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/cases/${id}/`)
      return true
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return false
      }
      throw error
    }
  },

  /**
   * Resolve a case
   */
  async resolve(id: string, dto: ResolveCaseDto): Promise<Case | null> {
    try {
      const response = await apiClient.post<Case>(
        `/api/cases/${id}/resolve/`,
        dto
      )
      return response.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return null
      }
      throw error
    }
  },

  /**
   * Cancel a case
   */
  async cancel(id: string, dto?: CancelCaseDto): Promise<Case | null> {
    try {
      const response = await apiClient.post<Case>(
        `/api/cases/${id}/cancel/`,
        dto || {}
      )
      return response.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return null
      }
      throw error
    }
  },

  /**
   * Reopen a resolved or cancelled case
   */
  async reopen(id: string): Promise<Case | null> {
    try {
      const response = await apiClient.post<Case>(`/api/cases/${id}/reopen/`)
      return response.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) return null
      }
      throw error
    }
  },

  /**
   * Search cases by text
   */
  async search(query: string): Promise<Case[]> {
    const response = await apiClient.get<Case[]>('/api/cases/', {
      params: { search: query },
    })
    return response.data
  },
}

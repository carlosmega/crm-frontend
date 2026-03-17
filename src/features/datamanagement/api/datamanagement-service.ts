/**
 * Data Management Service
 *
 * API service for data import/export operations (CSV, Excel).
 * Endpoints: /api/datamanagement/
 */

import apiClient from '@/core/api/client'
import type {
  ImportJob,
  CreateImportJobDto,
  ExportJob,
  CreateExportJobDto,
  FieldMappingPreview,
} from '@/core/contracts'

const BASE = '/datamanagement'

export const datamanagementService = {
  /**
   * List all import jobs
   */
  listImports: async () => {
    const response = await apiClient.get<ImportJob[]>(`${BASE}/imports`)
    return response.data
  },

  /**
   * Create a new import job
   */
  createImport: async (data: CreateImportJobDto) => {
    const response = await apiClient.post<ImportJob>(`${BASE}/imports`, data)
    return response.data
  },

  /**
   * Get an import job by ID
   */
  getImport: async (id: string) => {
    const response = await apiClient.get<ImportJob>(`${BASE}/imports/${id}`)
    return response.data
  },

  /**
   * Preview field mapping for an import
   */
  previewMapping: async (data: { entitytype: string; data: string }) => {
    const response = await apiClient.post<FieldMappingPreview>(
      `${BASE}/imports/preview-mapping`,
      data
    )
    return response.data
  },

  /**
   * List all export jobs
   */
  listExports: async () => {
    const response = await apiClient.get<ExportJob[]>(`${BASE}/exports`)
    return response.data
  },

  /**
   * Create a new export job
   */
  createExport: async (data: CreateExportJobDto) => {
    const response = await apiClient.post<ExportJob>(`${BASE}/exports`, data)
    return response.data
  },

  /**
   * Get an export job by ID
   */
  getExport: async (id: string) => {
    const response = await apiClient.get<ExportJob>(`${BASE}/exports/${id}`)
    return response.data
  },

  /**
   * Download the result of a completed export job
   */
  downloadExport: async (id: string) => {
    const response = await apiClient.get<Blob>(`${BASE}/exports/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}

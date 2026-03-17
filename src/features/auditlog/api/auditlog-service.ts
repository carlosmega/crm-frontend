/**
 * Audit Log Service
 *
 * API service for querying audit logs, entity change history, and field-level tracking.
 * Endpoints: /api/auditlog/
 */

import apiClient from '@/core/api/client'
import type { AuditLogEntry } from '@/core/contracts'

const BASE = '/auditlog'

export const auditlogService = {
  /**
   * List recent audit log entries with optional filters
   */
  listRecent: async (params?: {
    objecttypecode?: string
    userid?: string
    action?: string
    date_from?: string
    date_to?: string
  }) => {
    const response = await apiClient.get<AuditLogEntry[]>(BASE, { params })
    return response.data
  },

  /**
   * Get audit log entries for a specific entity
   */
  getByEntity: async (objecttypecode: string, objectid: string) => {
    const response = await apiClient.get<AuditLogEntry[]>(
      `${BASE}/entity/${objecttypecode}/${objectid}`
    )
    return response.data
  },

  /**
   * Get audit log entries for a specific user
   */
  getByUser: async (userid: string) => {
    const response = await apiClient.get<AuditLogEntry[]>(
      `${BASE}/user/${userid}`
    )
    return response.data
  },

  /**
   * Get field-level change history for a specific entity field
   */
  getFieldHistory: async (objecttypecode: string, objectid: string, fieldname: string) => {
    const response = await apiClient.get<AuditLogEntry[]>(
      `${BASE}/entity/${objecttypecode}/${objectid}/field/${fieldname}`
    )
    return response.data
  },
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { auditlogService } from '../api/auditlog-service'

/**
 * Query key factory for audit logs
 */
export const auditLogKeys = {
  all: ['auditlog'] as const,
  recent: (params: Record<string, unknown>) =>
    [...auditLogKeys.all, 'recent', params] as const,
  byEntity: (objecttypecode: string, objectid: string) =>
    [...auditLogKeys.all, 'entity', objecttypecode, objectid] as const,
  byUser: (userid: string) =>
    [...auditLogKeys.all, 'user', userid] as const,
  fieldHistory: (objecttypecode: string, objectid: string, fieldname: string) =>
    [...auditLogKeys.all, 'field', objecttypecode, objectid, fieldname] as const,
}

/**
 * List recent audit log entries with optional filters
 */
export function useAuditLogRecent(params?: {
  objecttypecode?: string
  userid?: string
  action?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: auditLogKeys.recent(params ?? {}),
    queryFn: () => auditlogService.listRecent(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get audit log entries for a specific entity
 */
export function useAuditLogByEntity(
  objecttypecode: string,
  objectid: string
) {
  return useQuery({
    queryKey: auditLogKeys.byEntity(objecttypecode, objectid),
    queryFn: () => auditlogService.getByEntity(objecttypecode, objectid),
    enabled: !!objecttypecode && !!objectid,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get audit log entries for a specific user
 */
export function useAuditLogByUser(userid: string) {
  return useQuery({
    queryKey: auditLogKeys.byUser(userid),
    queryFn: () => auditlogService.getByUser(userid),
    enabled: !!userid,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get field-level change history for a specific entity field
 */
export function useAuditLogFieldHistory(
  objecttypecode: string,
  objectid: string,
  fieldname: string
) {
  return useQuery({
    queryKey: auditLogKeys.fieldHistory(objecttypecode, objectid, fieldname),
    queryFn: () =>
      auditlogService.getFieldHistory(objecttypecode, objectid, fieldname),
    enabled: !!objecttypecode && !!objectid && !!fieldname,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

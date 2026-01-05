/**
 * useAuditLogs Hook
 * Client-side hook for querying audit logs
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { AuditLog } from '@/core/contracts/entities'
import { PermissionEntity } from '@/core/contracts/security'
import { getRecordAuditTrail } from '@/core/services/audit-log-service'

/**
 * Hook to get audit trail for specific record
 */
export function useRecordAuditTrail(entity: PermissionEntity, recordid: string, limit = 50) {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-trail', entity, recordid],
    queryFn: () => getRecordAuditTrail(entity, recordid, limit),
    enabled: !!recordid,
  })
}

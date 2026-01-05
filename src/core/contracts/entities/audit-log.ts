/**
 * AuditLog Entity (Dynamics 365 CDS)
 * Tracks all CRUD operations in the CRM
 * Based on Microsoft Dynamics 365 audit entity
 */

import { PermissionEntity } from '../security'

/**
 * Audit Action Types
 */
export enum AuditAction {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Read = 'read',
  Share = 'share',
  Assign = 'assign',
  Activate = 'activate',
  Deactivate = 'deactivate',
  Qualify = 'qualify',
  Close = 'close',
  Win = 'win',
  Lose = 'lose',
  Cancel = 'cancel',
}

/**
 * Changed field in audit log
 */
export interface AuditFieldChange {
  fieldName: string
  oldValue: string | number | boolean | null
  newValue: string | number | boolean | null
}

/**
 * AuditLog Entity
 * Tracks all changes to CRM entities
 */
export interface AuditLog {
  // Identity
  auditid: string // Primary key (GUID)

  // Action Info
  action: AuditAction // Type of action
  entity: PermissionEntity // Entity type
  recordid: string // ID of the affected record
  recordname?: string // Display name of record (for readability)

  // User Info
  userid: string // Who performed the action
  username: string // User's full name (denormalized for performance)
  userrole: string // User's role at time of action

  // Change Details
  changes?: AuditFieldChange[] // Fields that changed (for Update actions)
  oldvalues?: Record<string, any> // Full snapshot before (for critical entities)
  newvalues?: Record<string, any> // Full snapshot after

  // Context
  ipaddress?: string // User's IP address
  useragent?: string // Browser/client info
  sessionid?: string // Session identifier

  // Metadata
  timestamp: Date // When the action occurred
  message?: string // Optional human-readable message
}

/**
 * Create AuditLog DTO
 */
export interface CreateAuditLogDto {
  action: AuditAction
  entity: PermissionEntity
  recordid: string
  recordname?: string
  userid: string
  username: string
  userrole: string
  changes?: AuditFieldChange[]
  oldvalues?: Record<string, any>
  newvalues?: Record<string, any>
  ipaddress?: string
  useragent?: string
  sessionid?: string
  message?: string
}

/**
 * Audit Query Filters
 */
export interface AuditLogQueryParams {
  entity?: PermissionEntity // Filter by entity type
  recordid?: string // Filter by specific record
  userid?: string // Filter by user
  action?: AuditAction // Filter by action type
  startDate?: Date // Filter by date range
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Audit Statistics
 */
export interface AuditStats {
  totalActions: number
  actionsByType: Record<AuditAction, number>
  actionsByEntity: Record<PermissionEntity, number>
  actionsByUser: Record<string, number>
  recentActions: AuditLog[]
}

/**
 * Helper: Get audit action display name
 */
export function getAuditActionDisplayName(action: AuditAction): string {
  const actionNames: Record<AuditAction, string> = {
    [AuditAction.Create]: 'Created',
    [AuditAction.Update]: 'Updated',
    [AuditAction.Delete]: 'Deleted',
    [AuditAction.Read]: 'Viewed',
    [AuditAction.Share]: 'Shared',
    [AuditAction.Assign]: 'Assigned',
    [AuditAction.Activate]: 'Activated',
    [AuditAction.Deactivate]: 'Deactivated',
    [AuditAction.Qualify]: 'Qualified',
    [AuditAction.Close]: 'Closed',
    [AuditAction.Win]: 'Won',
    [AuditAction.Lose]: 'Lost',
    [AuditAction.Cancel]: 'Canceled',
  }
  return actionNames[action]
}

/**
 * Helper: Format field change for display
 */
export function formatFieldChange(change: AuditFieldChange): string {
  const { fieldName, oldValue, newValue } = change
  const oldDisplay = oldValue === null ? '(empty)' : String(oldValue)
  const newDisplay = newValue === null ? '(empty)' : String(newValue)
  return `${fieldName}: ${oldDisplay} → ${newDisplay}`
}

/**
 * Helper: Check if action is sensitive (requires higher permissions to view)
 */
export function isSensitiveAuditAction(action: AuditAction): boolean {
  return [
    AuditAction.Delete,
    AuditAction.Share,
    AuditAction.Assign,
  ].includes(action)
}

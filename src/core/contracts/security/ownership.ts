/**
 * Record Ownership System
 * Manages ownerid field and transfer workflow
 * Based on Microsoft Dynamics 365 ownership model
 */

import { PermissionEntity } from './permissions'

/**
 * Ownership Transfer DTO
 */
export interface TransferOwnershipDto {
  entityType: PermissionEntity
  recordid: string
  fromUserid: string
  toUserid: string
  reason?: string
  transferActivities?: boolean // Transfer related activities too
}

/**
 * Ownership Transfer Result
 */
export interface OwnershipTransferResult {
  success: boolean
  recordid: string
  oldOwnerid: string
  newOwnerid: string
  transferredAt: Date
  transferredActivitiesCount?: number
  message: string
}

/**
 * Record with ownership
 */
export interface OwnedRecord {
  ownerid: string
  [key: string]: any
}

/**
 * Helper: Check if user owns record
 */
export function isRecordOwner(record: OwnedRecord, userid: string): boolean {
  return record.ownerid === userid
}

/**
 * Helper: Check if user can transfer ownership
 * (Owner or Manager can transfer)
 */
export function canTransferOwnership(
  record: OwnedRecord,
  userid: string,
  isManager: boolean
): boolean {
  return isRecordOwner(record, userid) || isManager
}

/**
 * Helper: Filter records by owner
 */
export function filterOwnedRecords<T extends OwnedRecord>(
  records: T[],
  userid: string
): T[] {
  return records.filter((record) => record.ownerid === userid)
}

/**
 * Helper: Filter records by team (requires team membership data)
 */
export function filterTeamRecords<T extends OwnedRecord>(
  records: T[],
  teamMemberIds: string[]
): T[] {
  return records.filter((record) => teamMemberIds.includes(record.ownerid))
}

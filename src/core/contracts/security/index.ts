/**
 * Security Module - Central Export Point
 * RBAC, Permissions, Audit Logging, Ownership
 */

// Permissions
export type { PermissionRule } from './permissions'
export {
  Permission,
  PermissionEntity,
  AccessLevel,
  ROLE_PERMISSIONS,
  hasPermission,
  getAccessLevel,
  getRolePermissions,
  canAccessRecord,
} from './permissions'

// Ownership
export type {
  TransferOwnershipDto,
  OwnershipTransferResult,
  OwnedRecord,
} from './ownership'
export {
  isRecordOwner,
  canTransferOwnership,
  filterOwnedRecords,
  filterTeamRecords,
} from './ownership'

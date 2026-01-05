/**
 * usePermissions Hook
 * Client-side hook for checking user permissions
 */

'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@/core/contracts/entities'
import {
  Permission,
  PermissionEntity,
  AccessLevel,
  hasPermission as checkPermission,
  getAccessLevel as getLevel,
  canAccessRecord as checkRecordAccess,
} from '@/core/contracts/security'

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined
  const userId = session?.user?.id

  /**
   * Check if current user has permission
   */
  const hasPermission = (entity: PermissionEntity, operation: Permission): boolean => {
    if (!userRole) return false
    return checkPermission(userRole, entity, operation)
  }

  /**
   * Get access level for entity + operation
   */
  const getAccessLevel = (entity: PermissionEntity, operation: Permission): AccessLevel => {
    if (!userRole) return AccessLevel.None
    return getLevel(userRole, entity, operation)
  }

  /**
   * Check if user can access specific record
   */
  const canAccessRecord = (
    entity: PermissionEntity,
    operation: Permission,
    recordOwnerId?: string
  ): boolean => {
    if (!userRole || !userId) return false
    return checkRecordAccess(userRole, userId, entity, operation, recordOwnerId)
  }

  /**
   * Check if user is admin
   */
  const isAdmin = userRole === UserRole.SystemAdministrator

  /**
   * Check if user is manager
   */
  const isManager =
    userRole === UserRole.SystemAdministrator || userRole === UserRole.SalesManager

  /**
   * Check if user can create entity
   */
  const canCreate = (entity: PermissionEntity) => hasPermission(entity, Permission.Create)

  /**
   * Check if user can read entity
   */
  const canRead = (entity: PermissionEntity) => hasPermission(entity, Permission.Read)

  /**
   * Check if user can update entity
   */
  const canUpdate = (entity: PermissionEntity) => hasPermission(entity, Permission.Update)

  /**
   * Check if user can delete entity
   */
  const canDelete = (entity: PermissionEntity) => hasPermission(entity, Permission.Delete)

  /**
   * Check if user can export entity
   */
  const canExport = (entity: PermissionEntity) => hasPermission(entity, Permission.Export)

  /**
   * Check if user can share entity
   */
  const canShare = (entity: PermissionEntity) => hasPermission(entity, Permission.Share)

  return {
    userRole,
    userId,
    isAdmin,
    isManager,
    hasPermission,
    getAccessLevel,
    canAccessRecord,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canShare,
  }
}

/**
 * Hook to check if user has specific role
 */
export function useUserRole() {
  const { data: session } = useSession()
  return session?.user?.role as UserRole | undefined
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  const role = useUserRole()
  return role === UserRole.SystemAdministrator
}

/**
 * Hook to check if user is manager
 */
export function useIsManager() {
  const role = useUserRole()
  return role === UserRole.SystemAdministrator || role === UserRole.SalesManager
}

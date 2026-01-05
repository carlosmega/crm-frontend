/**
 * RBAC Permissions System
 * Defines granular permissions for CRM entities
 * Based on Microsoft Dynamics 365 security model
 */

import { UserRole } from '../entities/system-user'

/**
 * Permission operations (CRUD + Share)
 */
export enum Permission {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Share = 'share',
  Export = 'export',
}

/**
 * CRM Entities that support permissions
 */
export enum PermissionEntity {
  Lead = 'lead',
  Opportunity = 'opportunity',
  Account = 'account',
  Contact = 'contact',
  Quote = 'quote',
  QuoteDetail = 'quote-detail',
  Order = 'order',
  OrderDetail = 'order-detail',
  Invoice = 'invoice',
  InvoiceDetail = 'invoice-detail',
  Product = 'product',
  Activity = 'activity',
  SystemUser = 'system-user',
  AuditLog = 'audit-log',
}

/**
 * Access Level for permissions
 * Based on Dynamics 365 access levels
 */
export enum AccessLevel {
  None = 'none',           // No access
  User = 'user',           // Own records only
  Team = 'team',           // Team records (via manager)
  BusinessUnit = 'bu',     // Business unit records
  Organization = 'org',    // All records
}

/**
 * Permission definition
 */
export interface PermissionRule {
  entity: PermissionEntity
  operation: Permission
  accessLevel: AccessLevel
}

/**
 * Role permissions matrix
 * Defines what each role can do on each entity
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionRule[]> = {
  // ===== SYSTEM ADMINISTRATOR =====
  [UserRole.SystemAdministrator]: [
    // Full access to everything
    { entity: PermissionEntity.Lead, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Lead, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Lead, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Lead, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Opportunity, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Opportunity, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Opportunity, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Opportunity, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Opportunity, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Opportunity, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Account, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Account, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Account, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Account, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Account, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Contact, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Quote, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Quote, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Quote, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Quote, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Quote, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Quote, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Order, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Invoice, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Product, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Activity, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Activity, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Activity, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Activity, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Activity, operation: Permission.Share, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Activity, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.SystemUser, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.SystemUser, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.SystemUser, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.SystemUser, operation: Permission.Delete, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.AuditLog, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.AuditLog, operation: Permission.Export, accessLevel: AccessLevel.Organization },
  ],

  // ===== SALES MANAGER =====
  [UserRole.SalesManager]: [
    // Team-level access to sales entities
    { entity: PermissionEntity.Lead, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Opportunity, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Opportunity, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Opportunity, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Opportunity, operation: Permission.Delete, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Opportunity, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Opportunity, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Account, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Account, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Account, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Account, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Account, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Contact, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Quote, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Quote, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Quote, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Quote, operation: Permission.Delete, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Quote, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Quote, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Order, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Order, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Order, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Order, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Order, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Order, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Invoice, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Invoice, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Invoice, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Invoice, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Invoice, operation: Permission.Share, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Invoice, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Product, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Product, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Activity, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Activity, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Activity, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Activity, operation: Permission.Delete, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.SystemUser, operation: Permission.Read, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.AuditLog, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.AuditLog, operation: Permission.Export, accessLevel: AccessLevel.Team },
  ],

  // ===== SALES REPRESENTATIVE =====
  [UserRole.SalesRepresentative]: [
    // User-level access (own records only)
    { entity: PermissionEntity.Lead, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Lead, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Lead, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Opportunity, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Opportunity, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Opportunity, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Opportunity, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Opportunity, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Account, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Account, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Account, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Contact, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Quote, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Quote, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Quote, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Quote, operation: Permission.Delete, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Quote, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Order, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Order, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Order, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Order, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Invoice, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Invoice, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Invoice, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Invoice, operation: Permission.Export, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Product, operation: Permission.Read, accessLevel: AccessLevel.Organization },

    { entity: PermissionEntity.Activity, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Activity, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Activity, operation: Permission.Update, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Activity, operation: Permission.Delete, accessLevel: AccessLevel.User },
  ],

  // ===== CUSTOMER SERVICE REP =====
  [UserRole.CustomerServiceRep]: [
    // Limited to service-related entities
    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Contact, operation: Permission.Update, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Order, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Order, operation: Permission.Update, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Invoice, operation: Permission.Read, accessLevel: AccessLevel.User },

    { entity: PermissionEntity.Activity, operation: Permission.Create, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Activity, operation: Permission.Read, accessLevel: AccessLevel.User },
    { entity: PermissionEntity.Activity, operation: Permission.Update, accessLevel: AccessLevel.User },
  ],

  // ===== MARKETING PROFESSIONAL =====
  [UserRole.MarketingProfessional]: [
    // Focus on leads and campaigns
    { entity: PermissionEntity.Lead, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Account, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Contact, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Contact, operation: Permission.Export, accessLevel: AccessLevel.Team },

    { entity: PermissionEntity.Activity, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Activity, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Activity, operation: Permission.Update, accessLevel: AccessLevel.Team },
  ],
}

/**
 * Check if user has permission for operation on entity
 */
export function hasPermission(
  userRole: UserRole,
  entity: PermissionEntity,
  operation: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.some(
    (p) => p.entity === entity && p.operation === operation && p.accessLevel !== AccessLevel.None
  )
}

/**
 * Get access level for user on entity + operation
 */
export function getAccessLevel(
  userRole: UserRole,
  entity: PermissionEntity,
  operation: Permission
): AccessLevel {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  const permission = permissions.find((p) => p.entity === entity && p.operation === operation)
  return permission?.accessLevel || AccessLevel.None
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): PermissionRule[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if user can access record based on ownership
 */
export function canAccessRecord(
  userRole: UserRole,
  userId: string,
  entity: PermissionEntity,
  operation: Permission,
  recordOwnerId?: string
): boolean {
  const accessLevel = getAccessLevel(userRole, entity, operation)

  switch (accessLevel) {
    case AccessLevel.None:
      return false

    case AccessLevel.User:
      // Can only access own records
      return recordOwnerId === userId

    case AccessLevel.Team:
      // TODO: Implement team membership check
      // For now, allow if user or team member
      return true

    case AccessLevel.BusinessUnit:
      // TODO: Implement business unit check
      return true

    case AccessLevel.Organization:
      // Full access
      return true

    default:
      return false
  }
}

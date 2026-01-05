/**
 * SystemUser Entity (Dynamics 365 CDS)
 * Represents a user in the CRM system
 * Based on Microsoft Dynamics 365 systemuser entity
 */

/**
 * User roles in the CRM system
 * Based on Dynamics 365 security roles
 */
export enum UserRole {
  SystemAdministrator = 'system-administrator',
  SalesManager = 'sales-manager',
  SalesRepresentative = 'sales-representative',
  CustomerServiceRep = 'customer-service-rep',
  MarketingProfessional = 'marketing-professional',
}

/**
 * User status codes
 */
export enum UserStatus {
  Enabled = 0,
  Disabled = 1,
}

/**
 * SystemUser Entity
 * Represents a CRM user with authentication and role information
 */
export interface SystemUser {
  // Identity
  systemuserid: string           // Primary key (GUID)

  // Personal Information
  firstname: string               // First name
  lastname: string                // Last name
  fullname: string                // Computed: firstname + lastname

  // Contact Information
  internalemailaddress: string    // Primary email (login username)
  mobilephone?: string            // Mobile phone

  // Authentication
  password: string                // Hashed password (bcrypt)

  // Role & Permissions
  role: UserRole                  // Primary role

  // Status
  isdisabled: boolean             // Is user disabled?

  // Organization
  businessunitid?: string         // Business unit (for multi-tenant)

  // Metadata
  domainname?: string             // AD domain name (for Azure AD integration)
  azureactivedirectoryobjectid?: string  // Azure AD Object ID

  // Audit fields (CDS standard)
  createdon: Date                 // Creation date
  modifiedon: Date                // Last modified date
  statecode: number               // State code (Active/Inactive)
  statuscode: number              // Status code (detailed status)
}

/**
 * Create SystemUser DTO (for registration/creation)
 */
export interface CreateSystemUserDto {
  firstname: string
  lastname: string
  internalemailaddress: string
  password: string
  role: UserRole
  mobilephone?: string
  businessunitid?: string
}

/**
 * Update SystemUser DTO
 */
export interface UpdateSystemUserDto {
  firstname?: string
  lastname?: string
  mobilephone?: string
  role?: UserRole
  isdisabled?: boolean
}

/**
 * SystemUser Summary (safe for client-side)
 * Excludes sensitive fields like password
 */
export interface SystemUserSummary {
  systemuserid: string
  fullname: string
  firstname: string
  lastname: string
  internalemailaddress: string
  role: UserRole
  isdisabled: boolean
  createdon: Date
  modifiedon: Date
}

/**
 * User session data (stored in JWT/session)
 */
export interface UserSession {
  id: string                      // systemuserid
  email: string                   // internalemailaddress
  name: string                    // fullname
  role: UserRole
  avatar?: string                 // Avatar URL (if available)
}

/**
 * Helper: Get role display name
 */
export function getUserRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SystemAdministrator]: 'System Administrator',
    [UserRole.SalesManager]: 'Sales Manager',
    [UserRole.SalesRepresentative]: 'Sales Representative',
    [UserRole.CustomerServiceRep]: 'Customer Service Rep',
    [UserRole.MarketingProfessional]: 'Marketing Professional',
  }
  return roleNames[role]
}

/**
 * Helper: Check if user has admin privileges
 */
export function isAdminUser(role: UserRole): boolean {
  return role === UserRole.SystemAdministrator
}

/**
 * Helper: Check if user has manager privileges
 */
export function isManagerUser(role: UserRole): boolean {
  return role === UserRole.SystemAdministrator || role === UserRole.SalesManager
}

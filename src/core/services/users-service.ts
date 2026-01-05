/**
 * Users Service (Mock Implementation)
 * Mock service for user authentication and management
 * Uses in-memory storage for server-side and LocalStorage for client-side
 *
 * MIGRATION NOTE: When Django backend is ready, replace this with real API calls
 */

import * as bcrypt from 'bcryptjs'
import type {
  SystemUser,
  CreateSystemUserDto,
  UpdateSystemUserDto,
  SystemUserSummary,
} from '@/core/contracts/entities'
import { UserRole, UserStatus } from '@/core/contracts/entities'

// For SystemUser, we use simple generic state codes
enum EntityState {
  Active = 0,
  Inactive = 1,
}

enum EntityStatus {
  Active = 1,
  Inactive = 2,
}

const STORAGE_KEY = 'crm-users'
const SALT_ROUNDS = 10

// In-memory storage for server-side (fallback when localStorage is not available)
let serverUsers: SystemUser[] | null = null

/**
 * Get default users
 */
function getDefaultUsers(): SystemUser[] {
  return [
    {
      systemuserid: 'user-admin-001',
      firstname: 'Admin',
      lastname: 'Usuario',
      fullname: 'Admin Usuario',
      internalemailaddress: 'admin@crm.com',
      password: bcrypt.hashSync('admin123', SALT_ROUNDS),
      role: UserRole.SystemAdministrator,
      isdisabled: false,
      createdon: new Date(),
      modifiedon: new Date(),
      statecode: EntityState.Active,
      statuscode: EntityStatus.Active,
    },
    {
      systemuserid: 'user-manager-001',
      firstname: 'Manager',
      lastname: 'Ventas',
      fullname: 'Manager Ventas',
      internalemailaddress: 'manager@crm.com',
      password: bcrypt.hashSync('manager123', SALT_ROUNDS),
      role: UserRole.SalesManager,
      isdisabled: false,
      createdon: new Date(),
      modifiedon: new Date(),
      statecode: EntityState.Active,
      statuscode: EntityStatus.Active,
    },
    {
      systemuserid: 'user-sales-001',
      firstname: 'Vendedor',
      lastname: 'Demo',
      fullname: 'Vendedor Demo',
      internalemailaddress: 'sales@crm.com',
      password: bcrypt.hashSync('sales123', SALT_ROUNDS),
      role: UserRole.SalesRepresentative,
      isdisabled: false,
      createdon: new Date(),
      modifiedon: new Date(),
      statecode: EntityState.Active,
      statuscode: EntityStatus.Active,
    },
  ]
}

/**
 * Initialize default users if storage is empty
 */
function initializeDefaultUsers(): void {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server-side: use in-memory storage
    if (serverUsers === null) {
      serverUsers = getDefaultUsers()
    }
  } else {
    // Client-side: use localStorage
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getDefaultUsers()))
    }
  }
}

/**
 * Get all users from storage
 */
function getAllUsersFromStorage(): SystemUser[] {
  initializeDefaultUsers()

  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server-side: return in-memory users
    return serverUsers || []
  } else {
    // Client-side: return from localStorage
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse users from storage', error)
      return []
    }
  }
}

/**
 * Save users to storage
 */
function saveUsersToStorage(users: SystemUser[]): void {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server-side: save to in-memory storage
    serverUsers = users
  } else {
    // Client-side: save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }
}

/**
 * Authenticate user by email and password
 * Returns user summary if credentials are valid, null otherwise
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<SystemUserSummary | null> {
  const users = getAllUsersFromStorage()

  const user = users.find(
    (u) => u.internalemailaddress.toLowerCase() === email.toLowerCase()
  )

  if (!user) return null
  if (user.isdisabled) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return toUserSummary(user)
}

/**
 * Convert SystemUser to SystemUserSummary (safe for client-side)
 */
function toUserSummary(user: SystemUser): SystemUserSummary {
  return {
    systemuserid: user.systemuserid,
    fullname: user.fullname,
    firstname: user.firstname,
    lastname: user.lastname,
    internalemailaddress: user.internalemailaddress,
    role: user.role,
    isdisabled: user.isdisabled,
    createdon: user.createdon,
    modifiedon: user.modifiedon,
  }
}

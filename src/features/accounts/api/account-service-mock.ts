import type { Account, CreateAccountDto, UpdateAccountDto } from '@/core/contracts'
import { AccountStateCode } from '@/core/contracts'
import { storage } from '@/lib/storage'
import { mockAccounts } from '../data/mock-accounts'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

const STORAGE_KEY = 'accounts'

/**
 * Account Service (Mock API)
 *
 * Simula llamadas a backend usando localStorage para persistencia
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

// Initialize storage with mock data if not exists
function initializeAccounts(): Account[] {
  const stored = storage.get<Account[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, mockAccounts)
    return mockAccounts
  }
  return stored
}

export const accountServiceMock = {
  /**
   * Get all accounts
   */
  async getAll(): Promise<Account[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return initializeAccounts()
  },

  /**
   * Get account by ID
   */
  async getById(id: string): Promise<Account | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const accounts = initializeAccounts()
    console.log('[AccountService] getById:', id, 'Total accounts:', accounts.length)
    console.log('[AccountService] Available account IDs:', accounts.map(a => a.accountid))
    const found = accounts.find(account => account.accountid === id) || null
    console.log('[AccountService] Found:', found ? found.name : 'NOT FOUND')
    return found
  },

  /**
   * Get accounts by name (for lookup)
   */
  async searchByName(name: string): Promise<Account[]> {
    await mockDelay(MOCK_DELAYS.SEARCH)
    const accounts = initializeAccounts()
    const lowerQuery = name.toLowerCase()
    return accounts.filter(account =>
      account.name.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Create new account
   */
  async create(dto: CreateAccountDto): Promise<Account> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const accounts = initializeAccounts()
    const now = new Date().toISOString()

    // Autogenerar accountnumber si no se proporciona
    const accountnumber = dto.accountnumber || `ACC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const newAccount: Account = {
      accountid: crypto.randomUUID(),
      statecode: AccountStateCode.Active,
      name: dto.name,
      accountnumber: accountnumber,
      emailaddress1: dto.emailaddress1,
      telephone1: dto.telephone1,
      websiteurl: dto.websiteurl,
      address1_line1: dto.address1_line1,
      address1_city: dto.address1_city,
      address1_stateorprovince: dto.address1_stateorprovince,
      address1_postalcode: dto.address1_postalcode,
      address1_country: dto.address1_country,
      industrycode: dto.industrycode,
      revenue: dto.revenue,
      numberofemployees: dto.numberofemployees,
      parentaccountid: dto.parentaccountid,
      ownerid: dto.ownerid,
      createdon: now,
      modifiedon: now,
    }

    const updatedAccounts = [...accounts, newAccount]
    storage.set(STORAGE_KEY, updatedAccounts)

    return newAccount
  },

  /**
   * Update existing account
   */
  async update(id: string, dto: UpdateAccountDto): Promise<Account | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const accounts = initializeAccounts()
    const index = accounts.findIndex(account => account.accountid === id)

    if (index === -1) return null

    const updatedAccount: Account = {
      ...accounts[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    const updatedAccounts = [
      ...accounts.slice(0, index),
      updatedAccount,
      ...accounts.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedAccounts)

    return updatedAccount
  },

  /**
   * Delete account
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.READ)

    const accounts = initializeAccounts()
    const filteredAccounts = accounts.filter(account => account.accountid !== id)

    if (filteredAccounts.length === accounts.length) {
      return false // Account not found
    }

    storage.set(STORAGE_KEY, filteredAccounts)
    return true
  },

  /**
   * Activate account
   */
  async activate(id: string): Promise<Account | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const accounts = initializeAccounts()
    const index = accounts.findIndex(account => account.accountid === id)

    if (index === -1) return null

    const activatedAccount: Account = {
      ...accounts[index],
      statecode: AccountStateCode.Active,
      modifiedon: new Date().toISOString(),
    }

    const updatedAccounts = [
      ...accounts.slice(0, index),
      activatedAccount,
      ...accounts.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedAccounts)

    return activatedAccount
  },

  /**
   * Deactivate account
   */
  async deactivate(id: string): Promise<Account | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const accounts = initializeAccounts()
    const index = accounts.findIndex(account => account.accountid === id)

    if (index === -1) return null

    const deactivatedAccount: Account = {
      ...accounts[index],
      statecode: AccountStateCode.Inactive,
      modifiedon: new Date().toISOString(),
    }

    const updatedAccounts = [
      ...accounts.slice(0, index),
      deactivatedAccount,
      ...accounts.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedAccounts)

    return deactivatedAccount
  },
}

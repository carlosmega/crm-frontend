import type {
  Case,
  CreateCaseDto,
  UpdateCaseDto,
  ResolveCaseDto,
  CancelCaseDto,
} from '@/core/contracts'
import {
  CaseStateCode,
  CaseStatusCode,
  getDefaultCaseStatusCode,
} from '@/core/contracts'
import { MOCK_CASES } from '../data/mock-cases'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

const STORAGE_KEY = 'cases'

/**
 * Case Service (Mock API)
 *
 * Simulates backend API calls using localStorage for persistence.
 * Provides full CRUD operations plus resolve/cancel workflows.
 */

// Initialize storage with mock data if empty
function initializeCases(): Case[] {
  const stored = storage.get<Case[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, MOCK_CASES)
    return MOCK_CASES
  }
  return stored
}

// Generate ticket number
function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const cases = initializeCases()
  const maxNumber = cases.reduce((max, c) => {
    const match = c.ticketnumber?.match(/CAS-\d+-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 0)
  return `CAS-${year}-${String(maxNumber + 1).padStart(4, '0')}`
}

export const caseServiceMock = {
  /**
   * Get all cases
   */
  async getAll(params?: { search?: string }): Promise<Case[]> {
    await mockDelay(MOCK_DELAYS.READ)
    let cases = initializeCases()

    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      cases = cases.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.ticketnumber?.toLowerCase().includes(searchLower) ||
          c.customername?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      )
    }

    return cases
  },

  /**
   * Get cases filtered by state
   */
  async getByState(statecode: CaseStateCode): Promise<Case[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const cases = initializeCases()
    return cases.filter((c) => c.statecode === statecode)
  },

  /**
   * Get case by ID
   */
  async getById(id: string): Promise<Case | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const cases = initializeCases()
    return cases.find((c) => c.incidentid === id) || null
  },

  /**
   * Create new case
   */
  async create(dto: CreateCaseDto): Promise<Case> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const now = new Date().toISOString()

    const newCase: Case = {
      incidentid: crypto.randomUUID(),
      statecode: CaseStateCode.Active,
      statuscode: CaseStatusCode.InProgress,
      title: dto.title,
      description: dto.description,
      ticketnumber: generateTicketNumber(),
      casetypecode: dto.casetypecode,
      prioritycode: dto.prioritycode,
      caseorigincode: dto.caseorigincode,
      customerid: dto.customerid,
      customerid_type: dto.customerid_type,
      primarycontactid: dto.primarycontactid,
      productid: dto.productid,
      ownerid: dto.ownerid,
      firstresponsesent: false,
      createdon: now,
      modifiedon: now,
    }

    const updatedCases = [...cases, newCase]
    storage.set(STORAGE_KEY, updatedCases)

    return newCase
  },

  /**
   * Update existing case
   */
  async update(id: string, dto: UpdateCaseDto): Promise<Case | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const index = cases.findIndex((c) => c.incidentid === id)

    if (index === -1) return null

    const updatedCase: Case = {
      ...cases[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    const updatedCases = [
      ...cases.slice(0, index),
      updatedCase,
      ...cases.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedCases)

    return updatedCase
  },

  /**
   * Delete case
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const filteredCases = cases.filter((c) => c.incidentid !== id)

    if (filteredCases.length === cases.length) {
      return false // Case not found
    }

    storage.set(STORAGE_KEY, filteredCases)
    return true
  },

  /**
   * Resolve a case
   */
  async resolve(id: string, dto: ResolveCaseDto): Promise<Case | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const index = cases.findIndex((c) => c.incidentid === id)

    if (index === -1) return null

    const caseItem = cases[index]
    if (caseItem.statecode !== CaseStateCode.Active) {
      throw new Error('Only active cases can be resolved')
    }

    const now = new Date().toISOString()
    const resolvedCase: Case = {
      ...caseItem,
      statecode: CaseStateCode.Resolved,
      statuscode: CaseStatusCode.ProblemSolved,
      resolutiontype: dto.resolutiontype,
      resolutionsummary: dto.resolutionsummary,
      resolvedon: now,
      modifiedon: now,
    }

    const updatedCases = [
      ...cases.slice(0, index),
      resolvedCase,
      ...cases.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedCases)

    return resolvedCase
  },

  /**
   * Cancel a case
   */
  async cancel(id: string, dto?: CancelCaseDto): Promise<Case | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const index = cases.findIndex((c) => c.incidentid === id)

    if (index === -1) return null

    const caseItem = cases[index]
    if (caseItem.statecode !== CaseStateCode.Active) {
      throw new Error('Only active cases can be cancelled')
    }

    const cancelledCase: Case = {
      ...caseItem,
      statecode: CaseStateCode.Cancelled,
      statuscode: CaseStatusCode.Cancelled,
      modifiedon: new Date().toISOString(),
    }

    const updatedCases = [
      ...cases.slice(0, index),
      cancelledCase,
      ...cases.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedCases)

    return cancelledCase
  },

  /**
   * Reopen a resolved or cancelled case
   */
  async reopen(id: string): Promise<Case | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const cases = initializeCases()
    const index = cases.findIndex((c) => c.incidentid === id)

    if (index === -1) return null

    const caseItem = cases[index]
    if (caseItem.statecode === CaseStateCode.Active) {
      throw new Error('Case is already active')
    }

    const reopenedCase: Case = {
      ...caseItem,
      statecode: CaseStateCode.Active,
      statuscode: CaseStatusCode.InProgress,
      resolvedon: undefined,
      resolutiontype: undefined,
      resolutionsummary: undefined,
      modifiedon: new Date().toISOString(),
    }

    const updatedCases = [
      ...cases.slice(0, index),
      reopenedCase,
      ...cases.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedCases)

    return reopenedCase
  },

  /**
   * Search cases by text
   */
  async search(query: string): Promise<Case[]> {
    await mockDelay(MOCK_DELAYS.SEARCH)

    const cases = initializeCases()
    const lowerQuery = query.toLowerCase()

    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.ticketnumber?.toLowerCase().includes(lowerQuery) ||
        c.customername?.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery)
    )
  },
}

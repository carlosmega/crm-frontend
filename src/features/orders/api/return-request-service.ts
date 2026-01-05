import type {
  ReturnRequest,
  CreateReturnRequestDto,
  UpdateReturnRequestDto,
  ApproveReturnRequestDto,
  CompleteReturnRequestDto,
  ReturnRequestStateCode,
} from '@/core/contracts/entities/return-request'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

/**
 * Return Request Service
 *
 * Servicio para gestión de Return Requests (RMA - Return Material Authorization)
 * Mock implementation con localStorage
 */

const STORAGE_KEY = 'crm_return_requests'

// Helper: Get all return requests from storage
function getAllReturnRequests(): ReturnRequest[] {
  const stored = storage.get<ReturnRequest[]>(STORAGE_KEY)
  return stored || []
}

// Helper: Save return requests to storage
function saveReturnRequests(requests: ReturnRequest[]): void {
  storage.set(STORAGE_KEY, requests)
}

// Helper: Generate RMA number
function generateRMANumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `RMA-${year}${month}${day}-${random}`
}

export const returnRequestService = {
  /**
   * Get all return requests
   */
  async getAll(): Promise<ReturnRequest[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return getAllReturnRequests()
  },

  /**
   * Get return request by ID
   */
  async getById(id: string): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const requests = getAllReturnRequests()
    return requests.find((r) => r.returnrequestid === id) || null
  },

  /**
   * Get return requests by order
   */
  async getByOrder(orderId: string): Promise<ReturnRequest[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const requests = getAllReturnRequests()
    return requests.filter((r) => r.salesorderid === orderId)
  },

  /**
   * Get return requests by state
   */
  async getByState(statecode: ReturnRequestStateCode): Promise<ReturnRequest[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const requests = getAllReturnRequests()
    return requests.filter((r) => r.statecode === statecode)
  },

  /**
   * Create return request
   */
  async create(dto: CreateReturnRequestDto): Promise<ReturnRequest> {
    await mockDelay(MOCK_DELAYS.WRITE)

    // Calculate refund amount (totalamount - restocking fee if applicable)
    const restockingFee = 0 // TODO: Calculate based on business rules
    const refundAmount = dto.totalamount - restockingFee

    const newRequest: ReturnRequest = {
      returnrequestid: `return-${Date.now()}`,
      rmanumber: generateRMANumber(),
      statecode: 0, // Pending
      name: dto.name,
      salesorderid: dto.salesorderid,
      invoiceid: dto.invoiceid,
      customerid: dto.customerid,
      customeridtype: dto.customeridtype,
      ownerid: dto.ownerid,
      returnreason: dto.returnreason,
      returnreasondetails: dto.returnreasondetails,
      returntypecode: dto.returntypecode,
      totalamount: dto.totalamount,
      restockingfee: restockingFee,
      refundamount: refundAmount,
      requestdate: new Date().toISOString().split('T')[0],
      customernotes: dto.customernotes,
      internalnotes: dto.internalnotes,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    const requests = getAllReturnRequests()
    requests.push(newRequest)
    saveReturnRequests(requests)

    return newRequest
  },

  /**
   * Update return request
   */
  async update(
    id: string,
    dto: UpdateReturnRequestDto
  ): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    requests[index] = {
      ...requests[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Approve return request
   */
  async approve(
    id: string,
    dto: ApproveReturnRequestDto
  ): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    const request = requests[index]

    // Validación: Solo Pending requests pueden aprobarse
    if (request.statecode !== 0) {
      throw new Error('Only pending return requests can be approved')
    }

    requests[index] = {
      ...request,
      statecode: 1, // Approved
      approvaldate: dto.approvaldate,
      expectedreturndate: dto.expectedreturndate,
      internalnotes: dto.internalnotes || request.internalnotes,
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Reject return request
   */
  async reject(id: string, reason?: string): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    const request = requests[index]

    requests[index] = {
      ...request,
      statecode: 4, // Rejected
      internalnotes: reason
        ? `${request.internalnotes || ''}\n\nRejection reason: ${reason}`.trim()
        : request.internalnotes,
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Mark as received
   */
  async markAsReceived(id: string): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    const request = requests[index]

    // Validación: Solo Approved requests pueden marcarse como recibidas
    if (request.statecode !== 1) {
      throw new Error('Only approved return requests can be marked as received')
    }

    requests[index] = {
      ...request,
      statecode: 2, // Received
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Complete return request (process refund)
   */
  async complete(
    id: string,
    dto: CompleteReturnRequestDto
  ): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    const request = requests[index]

    // Validación: Solo Received requests pueden completarse
    if (request.statecode !== 2) {
      throw new Error('Only received return requests can be completed')
    }

    requests[index] = {
      ...request,
      statecode: 3, // Completed
      completiondate: dto.completiondate,
      refundamount: dto.refundamount,
      internalnotes: dto.internalnotes || request.internalnotes,
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Cancel return request
   */
  async cancel(id: string, reason?: string): Promise<ReturnRequest | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const index = requests.findIndex((r) => r.returnrequestid === id)

    if (index === -1) {
      return null
    }

    const request = requests[index]

    requests[index] = {
      ...request,
      statecode: 5, // Canceled
      internalnotes: reason
        ? `${request.internalnotes || ''}\n\nCancellation reason: ${reason}`.trim()
        : request.internalnotes,
      modifiedon: new Date().toISOString(),
    }

    saveReturnRequests(requests)
    return requests[index]
  },

  /**
   * Delete return request
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const requests = getAllReturnRequests()
    const filtered = requests.filter((r) => r.returnrequestid !== id)

    if (filtered.length === requests.length) {
      return false // Not found
    }

    saveReturnRequests(filtered)
    return true
  },

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number
    pending: number
    approved: number
    received: number
    completed: number
    rejected: number
    canceled: number
    totalRefundAmount: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const requests = getAllReturnRequests()

    const pending = requests.filter((r) => r.statecode === 0)
    const approved = requests.filter((r) => r.statecode === 1)
    const received = requests.filter((r) => r.statecode === 2)
    const completed = requests.filter((r) => r.statecode === 3)
    const rejected = requests.filter((r) => r.statecode === 4)
    const canceled = requests.filter((r) => r.statecode === 5)

    const totalRefundAmount = completed.reduce(
      (sum, r) => sum + (r.refundamount || 0),
      0
    )

    return {
      total: requests.length,
      pending: pending.length,
      approved: approved.length,
      received: received.length,
      completed: completed.length,
      rejected: rejected.length,
      canceled: canceled.length,
      totalRefundAmount,
    }
  },
}

/**
 * Queues Service
 *
 * API service for managing queues and queue items.
 * Endpoints: /api/queues/
 */

import apiClient from '@/core/api/client'
import type {
  Queue,
  CreateQueueDto,
  UpdateQueueDto,
  QueueItem,
  AddToQueueDto,
} from '@/core/contracts'

const BASE = '/queues'

export const queuesService = {
  /**
   * List queues with optional filters
   */
  list: async (params?: { statecode?: number; search?: string }) => {
    const response = await apiClient.get<Queue[]>(BASE, { params })
    return response.data
  },

  /**
   * Get a single queue by ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Queue>(`${BASE}/${id}`)
    return response.data
  },

  /**
   * Create a new queue
   */
  create: async (data: CreateQueueDto) => {
    const response = await apiClient.post<Queue>(BASE, data)
    return response.data
  },

  /**
   * Update an existing queue
   */
  update: async (id: string, data: UpdateQueueDto) => {
    const response = await apiClient.patch<Queue>(`${BASE}/${id}`, data)
    return response.data
  },

  /**
   * Delete a queue
   */
  delete: async (id: string) => {
    await apiClient.delete(`${BASE}/${id}`)
  },

  /**
   * List items in a queue
   */
  listItems: async (queueId: string, params?: { statecode?: number }) => {
    const response = await apiClient.get<QueueItem[]>(
      `${BASE}/${queueId}/items`,
      { params }
    )
    return response.data
  },

  /**
   * Add an item to a queue
   */
  addItem: async (queueId: string, data: AddToQueueDto) => {
    const response = await apiClient.post<QueueItem>(
      `${BASE}/${queueId}/items`,
      data
    )
    return response.data
  },

  /**
   * Remove an item from a queue
   */
  removeItem: async (queueId: string, itemId: string) => {
    await apiClient.delete(`${BASE}/${queueId}/items/${itemId}`)
  },

  /**
   * Pick (assign to self) a queue item
   */
  pickItem: async (queueId: string, itemId: string) => {
    const response = await apiClient.post<QueueItem>(
      `${BASE}/${queueId}/items/${itemId}/pick`
    )
    return response.data
  },

  /**
   * Release a previously picked queue item
   */
  releaseItem: async (queueId: string, itemId: string) => {
    const response = await apiClient.post<QueueItem>(
      `${BASE}/${queueId}/items/${itemId}/release`
    )
    return response.data
  },
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queuesService } from '../api/queues-service'
import type {
  CreateQueueDto,
  UpdateQueueDto,
  AddToQueueDto,
} from '@/core/contracts'

/**
 * Query key factory for queues
 */
export const queueKeys = {
  all: ['queues'] as const,
  lists: () => [...queueKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...queueKeys.lists(), params] as const,
  details: () => [...queueKeys.all, 'detail'] as const,
  detail: (id: string) => [...queueKeys.details(), id] as const,
  items: (queueId: string, params?: Record<string, unknown>) =>
    [...queueKeys.all, 'items', queueId, params ?? {}] as const,
}

/**
 * List queues with optional filters
 */
export function useQueues(params?: { statecode?: number; search?: string }) {
  return useQuery({
    queryKey: queueKeys.list(params ?? {}),
    queryFn: () => queuesService.list(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single queue by ID
 */
export function useQueue(id: string) {
  return useQuery({
    queryKey: queueKeys.detail(id),
    queryFn: () => queuesService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * List items in a queue
 */
export function useQueueItems(
  queueId: string,
  params?: { statecode?: number }
) {
  return useQuery({
    queryKey: queueKeys.items(queueId, params as Record<string, unknown>),
    queryFn: () => queuesService.listItems(queueId, params),
    enabled: !!queueId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new queue
 */
export function useCreateQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQueueDto) => queuesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
    },
  })
}

/**
 * Update an existing queue
 */
export function useUpdateQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQueueDto }) =>
      queuesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
    },
  })
}

/**
 * Delete a queue
 */
export function useDeleteQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => queuesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
    },
  })
}

/**
 * Add an item to a queue
 */
export function useAddToQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      queueId,
      data,
    }: {
      queueId: string
      data: AddToQueueDto
    }) => queuesService.addItem(queueId, data),
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.items(queueId) })
    },
  })
}

/**
 * Remove an item from a queue
 */
export function useRemoveFromQueue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      queueId,
      itemId,
    }: {
      queueId: string
      itemId: string
    }) => queuesService.removeItem(queueId, itemId),
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.items(queueId) })
    },
  })
}

/**
 * Pick (assign to self) a queue item
 */
export function usePickQueueItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      queueId,
      itemId,
    }: {
      queueId: string
      itemId: string
    }) => queuesService.pickItem(queueId, itemId),
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.items(queueId) })
    },
  })
}

/**
 * Release a previously picked queue item
 */
export function useReleaseQueueItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      queueId,
      itemId,
    }: {
      queueId: string
      itemId: string
    }) => queuesService.releaseItem(queueId, itemId),
    onSuccess: (_, { queueId }) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.items(queueId) })
    },
  })
}

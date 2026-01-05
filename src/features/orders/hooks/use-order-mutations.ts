import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../api/order-service'
import type { CreateOrderDto, UpdateOrderDto, FulfillOrderDto } from '../types'
import { orderKeys } from './use-orders'
import { toast } from 'sonner'

/**
 * Create order mutation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success('Order created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`)
    },
  })
}

/**
 * Update order mutation
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      orderService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      toast.success('Order updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`)
    },
  })
}

/**
 * Submit order mutation
 */
export function useSubmitOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => orderService.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      toast.success('Order submitted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit order: ${error.message}`)
    },
  })
}

/**
 * Fulfill order mutation
 */
export function useFulfillOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FulfillOrderDto }) =>
      orderService.fulfill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      toast.success('Order fulfilled successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to fulfill order: ${error.message}`)
    },
  })
}

/**
 * Cancel order mutation
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      toast.success('Order canceled successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel order: ${error.message}`)
    },
  })
}

/**
 * Delete order mutation
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success('Order deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete order: ${error.message}`)
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderDetailService } from '../api/order-detail-service'
import type { CreateOrderDetailDto, UpdateOrderDetailDto } from '@/core/contracts/entities/order-detail'
import { orderKeys } from './use-orders'

/**
 * Query keys for order details
 */
export const orderDetailKeys = {
  all: ['order-details'] as const,
  lists: () => [...orderDetailKeys.all, 'list'] as const,
  list: (orderId: string) => [...orderDetailKeys.lists(), orderId] as const,
  details: () => [...orderDetailKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderDetailKeys.details(), id] as const,
  statistics: (orderId: string) => [...orderDetailKeys.all, 'statistics', orderId] as const,
}

/**
 * Get order details by order ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto
 */
export function useOrderDetails(orderId: string | undefined) {
  return useQuery({
    queryKey: orderDetailKeys.list(orderId || ''),
    queryFn: () => orderDetailService.getByOrder(orderId!),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos en cache
  })
}

/**
 * Get order detail by ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto
 */
export function useOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: orderDetailKeys.detail(id || ''),
    queryFn: () => orderDetailService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
  })
}

/**
 * Get order line statistics
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrderDetailStatistics(orderId: string | undefined) {
  return useQuery({
    queryKey: orderDetailKeys.statistics(orderId || ''),
    queryFn: () => orderDetailService.getStatistics(orderId!),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create order detail mutation
 */
export function useCreateOrderDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateOrderDetailDto) => orderDetailService.create(dto),
    onSuccess: (data) => {
      // Invalidate order details list for this order
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.list(data.salesorderid)
      })
      // Invalidate order statistics
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.statistics(data.salesorderid)
      })
      // Invalidate parent order (totals changed)
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(data.salesorderid)
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists()
      })
    },
  })
}

/**
 * Update order detail mutation
 */
export function useUpdateOrderDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderDetailDto }) =>
      orderDetailService.update(id, dto),
    onSuccess: (data) => {
      if (!data) return

      // Invalidate this specific detail
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.detail(data.salesorderdetailid)
      })
      // Invalidate order details list
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.list(data.salesorderid)
      })
      // Invalidate order statistics
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.statistics(data.salesorderid)
      })
      // Invalidate parent order (totals changed)
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(data.salesorderid)
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists()
      })
    },
  })
}

/**
 * Delete order detail mutation
 */
export function useDeleteOrderDetail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) =>
      orderDetailService.delete(id),
    onSuccess: (_, variables) => {
      // Invalidate order details list
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.list(variables.orderId)
      })
      // Invalidate order statistics
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.statistics(variables.orderId)
      })
      // Invalidate parent order (totals changed)
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId)
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists()
      })
    },
  })
}

/**
 * Bulk create order details mutation
 */
export function useBulkCreateOrderDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ dtos, orderId }: { dtos: CreateOrderDetailDto[]; orderId: string }) =>
      orderDetailService.bulkCreate(dtos),
    onSuccess: (_, variables) => {
      // Invalidate order details list
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.list(variables.orderId)
      })
      // Invalidate order statistics
      queryClient.invalidateQueries({
        queryKey: orderDetailKeys.statistics(variables.orderId)
      })
      // Invalidate parent order
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId)
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists()
      })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../api/order-service'
import { OrderStateCode } from '../types'
import type { FulfillOrderDto, CreateOrderDto, UpdateOrderDto } from '@/core/contracts/entities/order'

/**
 * Query keys for orders
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byQuote: (quoteId: string) =>
    [...orderKeys.all, 'quote', quoteId] as const,
  byOpportunity: (opportunityId: string) =>
    [...orderKeys.all, 'opportunity', opportunityId] as const,
  byCustomer: (customerId: string) =>
    [...orderKeys.all, 'customer', customerId] as const,
  statistics: () => [...orderKeys.all, 'statistics'] as const,
}

/**
 * Get all orders
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  })
}

/**
 * Get orders by state
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrdersByState(statecode: OrderStateCode) {
  return useQuery({
    queryKey: orderKeys.list({ statecode }),
    queryFn: () => orderService.getByState(statecode),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get orders by quote
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrdersByQuote(quoteId: string) {
  return useQuery({
    queryKey: orderKeys.byQuote(quoteId),
    queryFn: () => orderService.getByQuote(quoteId),
    enabled: !!quoteId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get orders by opportunity
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrdersByOpportunity(opportunityId: string) {
  return useQuery({
    queryKey: orderKeys.byOpportunity(opportunityId),
    queryFn: () => orderService.getByOpportunity(opportunityId),
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get orders by customer
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useOrdersByCustomer(customerId: string) {
  return useQuery({
    queryKey: orderKeys.byCustomer(customerId),
    queryFn: () => orderService.getByCustomer(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get order by ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto
 */
export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id || ''),
    queryFn: () => orderService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos en cache
  })
}

/**
 * Get order statistics
 * ✅ OPTIMIZACIÓN: staleTime 5 minutos
 */
export function useOrderStatistics() {
  return useQuery({
    queryKey: orderKeys.statistics(),
    queryFn: () => orderService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  })
}

/**
 * Create order mutation
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
    },
  })
}

/**
 * Update order mutation
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderDto }) =>
      orderService.update(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
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
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
    },
  })
}

/**
 * Fulfill order mutation
 */
export function useFulfillOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FulfillOrderDto }) =>
      orderService.fulfill(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
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
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
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
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
    },
  })
}

/**
 * Create order from quote mutation
 *
 * Used in Quote-to-Cash flow to generate Order from Won Quote
 */
export function useCreateOrderFromQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quote: Parameters<typeof orderService.createFromQuote>[0]) =>
      orderService.createFromQuote(quote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.statistics() })
    },
  })
}

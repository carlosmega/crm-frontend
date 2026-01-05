import { useQuery } from '@tanstack/react-query'
import { quoteService } from '../api/quote-service'
import type { Quote } from '../types'
import { QuoteStateCode } from '@/core/contracts/enums'

/**
 * Query keys for quotes
 */
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
  byOpportunity: (opportunityId: string) =>
    [...quoteKeys.all, 'opportunity', opportunityId] as const,
  byCustomer: (customerId: string) =>
    [...quoteKeys.all, 'customer', customerId] as const,
  statistics: () => [...quoteKeys.all, 'statistics'] as const,
}

/**
 * Get all quotes
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos (data cambia poco frecuentemente)
 */
export function useQuotes() {
  return useQuery({
    queryKey: quoteKeys.lists(),
    queryFn: () => quoteService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
  })
}

/**
 * Get quotes by state
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useQuotesByState(statecode: QuoteStateCode) {
  return useQuery({
    queryKey: quoteKeys.list({ statecode }),
    queryFn: () => quoteService.getByState(statecode),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get quotes by opportunity
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useQuotesByOpportunity(opportunityId: string) {
  return useQuery({
    queryKey: quoteKeys.byOpportunity(opportunityId),
    queryFn: () => quoteService.getByOpportunity(opportunityId),
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get quotes by customer
 * ✅ OPTIMIZACIÓN: staleTime 2 minutos
 */
export function useQuotesByCustomer(customerId: string) {
  return useQuery({
    queryKey: quoteKeys.byCustomer(customerId),
    queryFn: () => quoteService.getByCustomer(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get quote by ID
 * ✅ OPTIMIZACIÓN: staleTime 1 minuto (puede cambiar más frecuentemente)
 */
export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: quoteKeys.detail(id || ''),
    queryFn: () => quoteService.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos en cache
  })
}

/**
 * Search quotes
 * ✅ OPTIMIZACIÓN: staleTime 30 segundos (búsquedas son más dinámicas)
 */
export function useQuoteSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...quoteKeys.lists(), 'search', query],
    queryFn: () => quoteService.search(query),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos en cache
  })
}

/**
 * Get quote statistics
 * ✅ OPTIMIZACIÓN: staleTime 5 minutos (estadísticas cambian lentamente)
 */
export function useQuoteStatistics() {
  return useQuery({
    queryKey: quoteKeys.statistics(),
    queryFn: () => quoteService.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
  })
}

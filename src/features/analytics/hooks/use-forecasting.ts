"use client"

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { opportunityService } from '@/features/opportunities/api/opportunity-service'
import {
  calculateMonthlyForecast,
  calculateQuarterlyForecast,
  calculateForecastByOwner,
  calculateForecastAccuracy,
  type ForecastPeriod,
  type ForecastingPeriodType,
} from '../utils/forecasting-calculations'

/**
 * Hook: useForecasting
 *
 * Fetches opportunities and calculates forecasting data
 */
export function useForecasting(
  periodType: ForecastingPeriodType = 'monthly',
  periods: number = 6
) {
  const { data: opportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities', 'all'],
    queryFn: () => opportunityService.getAll(),
  })

  const forecast = useMemo<ForecastPeriod[]>(() => {
    if (!opportunities) return []

    if (periodType === 'monthly') {
      return calculateMonthlyForecast(opportunities, periods)
    } else {
      return calculateQuarterlyForecast(opportunities, Math.min(periods, 8))
    }
  }, [opportunities, periodType, periods])

  const accuracy = useMemo(() => {
    if (!forecast || forecast.length === 0) return null
    return calculateForecastAccuracy(forecast)
  }, [forecast])

  return {
    forecast,
    accuracy,
    loading: isLoading,
    error,
  }
}

/**
 * Hook: useForecastingByOwner
 *
 * Calculates forecasting filtered by owner
 */
export function useForecastingByOwner(
  ownerId: string | null,
  periodType: ForecastingPeriodType = 'monthly',
  periods: number = 6
) {
  const { data: allOpportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => opportunityService.getAll(),
  })

  // Filter opportunities by owner
  const opportunities = useMemo(() => {
    if (!allOpportunities || !ownerId) return []
    return allOpportunities.filter(opp => opp.ownerid === ownerId)
  }, [allOpportunities, ownerId])

  const forecast = useMemo<ForecastPeriod[]>(() => {
    if (!opportunities || !ownerId) return []
    return calculateForecastByOwner(opportunities, ownerId, periodType, periods)
  }, [opportunities, ownerId, periodType, periods])

  const accuracy = useMemo(() => {
    if (!forecast || forecast.length === 0) return null
    return calculateForecastAccuracy(forecast)
  }, [forecast])

  return {
    forecast,
    accuracy,
    loading: isLoading,
    error,
  }
}

/**
 * Hook: useForecastingControls
 *
 * Manages forecasting UI controls (period type, filter, etc.)
 */
export function useForecastingControls() {
  const [periodType, setPeriodType] = useState<ForecastingPeriodType>('monthly')
  const [periods, setPeriods] = useState(6)
  const [ownerId, setOwnerId] = useState<string | null>(null)

  const { forecast, accuracy, loading, error } = ownerId
    ? useForecastingByOwner(ownerId, periodType, periods)
    : useForecasting(periodType, periods)

  return {
    forecast,
    accuracy,
    loading,
    error,
    periodType,
    setPeriodType,
    periods,
    setPeriods,
    ownerId,
    setOwnerId,
  }
}

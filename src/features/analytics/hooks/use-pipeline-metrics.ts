"use client"

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { opportunityService } from '@/features/opportunities/api/opportunity-service'
import {
  calculatePipelineMetrics,
  calculatePipelineByStage,
  calculatePipelineTrend,
  calculateConversionRates,
  type PipelineMetrics,
  type PipelineByStage,
  type PipelineTrendDataPoint,
} from '../utils/pipeline-calculations'

/**
 * Hook: usePipelineMetrics
 *
 * Fetches all opportunities and calculates comprehensive pipeline metrics
 */
export function usePipelineMetrics() {
  const { data: opportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities', 'all'],
    queryFn: () => opportunityService.getAll(),
  })

  const metrics = useMemo<PipelineMetrics | null>(() => {
    if (!opportunities) return null
    return calculatePipelineMetrics(opportunities)
  }, [opportunities])

  const pipelineByStage = useMemo<PipelineByStage[]>(() => {
    if (!opportunities) return []
    return calculatePipelineByStage(opportunities)
  }, [opportunities])

  const pipelineTrend = useMemo<PipelineTrendDataPoint[]>(() => {
    if (!opportunities) return []
    return calculatePipelineTrend(opportunities, 6)
  }, [opportunities])

  const conversionRates = useMemo(() => {
    if (!opportunities) return null
    return calculateConversionRates(opportunities)
  }, [opportunities])

  return {
    metrics,
    pipelineByStage,
    pipelineTrend,
    conversionRates,
    loading: isLoading,
    error,
  }
}

/**
 * Hook: usePipelineMetricsByOwner
 *
 * Calculates pipeline metrics filtered by owner
 */
export function usePipelineMetricsByOwner(ownerId: string | null) {
  const { data: allOpportunities, isLoading, error } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => opportunityService.getAll(),
  })

  // Filter opportunities by owner
  const opportunities = useMemo(() => {
    if (!allOpportunities || !ownerId) return []
    return allOpportunities.filter(opp => opp.ownerid === ownerId)
  }, [allOpportunities, ownerId])

  const metrics = useMemo<PipelineMetrics | null>(() => {
    if (!opportunities || opportunities.length === 0) return null
    return calculatePipelineMetrics(opportunities)
  }, [opportunities])

  const pipelineByStage = useMemo<PipelineByStage[]>(() => {
    if (!opportunities || opportunities.length === 0) return []
    return calculatePipelineByStage(opportunities)
  }, [opportunities])

  return {
    metrics,
    pipelineByStage,
    loading: isLoading,
    error,
  }
}

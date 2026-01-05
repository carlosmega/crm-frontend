import type { Opportunity } from '@/core/contracts/entities'
import { OpportunityStateCode, SalesStageCode } from '@/core/contracts/enums'

/**
 * Pipeline Calculation Utilities
 *
 * Funciones para calcular métricas del pipeline de ventas
 */

export interface PipelineMetrics {
  totalPipelineValue: number
  weightedPipelineValue: number
  winRate: number
  averageDealSize: number
  averageSalesCycleDays: number
  openOpportunities: number
  wonOpportunities: number
  lostOpportunities: number
}

export interface PipelineByStage {
  stage: SalesStageCode
  stageName: string
  count: number
  totalValue: number
  weightedValue: number
  probability: number
}

export interface PipelineTrendDataPoint {
  month: string
  totalValue: number
  weightedValue: number
  count: number
}

/**
 * Calculate comprehensive pipeline metrics
 */
export function calculatePipelineMetrics(opportunities: Opportunity[]): PipelineMetrics {
  const openOpps = opportunities.filter(opp => opp.statecode === OpportunityStateCode.Open)
  const wonOpps = opportunities.filter(opp => opp.statecode === OpportunityStateCode.Won)
  const lostOpps = opportunities.filter(opp => opp.statecode === OpportunityStateCode.Lost)

  // Total Pipeline Value (sum of all open opportunities)
  const totalPipelineValue = openOpps.reduce((sum, opp) => sum + opp.estimatedvalue, 0)

  // Weighted Pipeline Value (sum of estimatedvalue * closeprobability)
  const weightedPipelineValue = openOpps.reduce(
    (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
    0
  )

  // Win Rate: Won / (Won + Lost) * 100
  const totalClosed = wonOpps.length + lostOpps.length
  const winRate = totalClosed > 0 ? (wonOpps.length / totalClosed) * 100 : 0

  // Average Deal Size (all opportunities)
  const allOppsWithValue = opportunities.filter(opp => opp.estimatedvalue > 0)
  const averageDealSize = allOppsWithValue.length > 0
    ? allOppsWithValue.reduce((sum, opp) => sum + opp.estimatedvalue, 0) / allOppsWithValue.length
    : 0

  // Average Sales Cycle (Won opportunities only)
  const wonOppsWithDates = wonOpps.filter(opp => opp.actualclosedate)
  const totalDays = wonOppsWithDates.reduce((sum, opp) => {
    const created = new Date(opp.createdon).getTime()
    const closed = new Date(opp.actualclosedate!).getTime()
    const days = Math.ceil((closed - created) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  const averageSalesCycleDays = wonOppsWithDates.length > 0
    ? Math.round(totalDays / wonOppsWithDates.length)
    : 0

  return {
    totalPipelineValue,
    weightedPipelineValue,
    winRate,
    averageDealSize,
    averageSalesCycleDays,
    openOpportunities: openOpps.length,
    wonOpportunities: wonOpps.length,
    lostOpportunities: lostOpps.length,
  }
}

/**
 * Calculate pipeline value by sales stage
 */
export function calculatePipelineByStage(opportunities: Opportunity[]): PipelineByStage[] {
  const openOpps = opportunities.filter(opp => opp.statecode === OpportunityStateCode.Open)

  const stages: { code: SalesStageCode; name: string; probability: number }[] = [
    { code: SalesStageCode.Qualify, name: 'Qualify', probability: 25 },
    { code: SalesStageCode.Develop, name: 'Develop', probability: 50 },
    { code: SalesStageCode.Propose, name: 'Propose', probability: 75 },
    { code: SalesStageCode.Close, name: 'Close', probability: 100 },
  ]

  return stages.map(stage => {
    const stageOpps = openOpps.filter(opp => opp.salesstage === stage.code)
    const totalValue = stageOpps.reduce((sum, opp) => sum + opp.estimatedvalue, 0)
    const weightedValue = stageOpps.reduce(
      (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
      0
    )

    return {
      stage: stage.code,
      stageName: stage.name,
      count: stageOpps.length,
      totalValue,
      weightedValue,
      probability: stage.probability,
    }
  })
}

/**
 * Calculate pipeline trend over last N months
 */
export function calculatePipelineTrend(
  opportunities: Opportunity[],
  months: number = 6
): PipelineTrendDataPoint[] {
  const now = new Date()
  const result: PipelineTrendDataPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = monthDate.toISOString()
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString()

    // Filter opportunities created in this month or earlier and still open/won in this month
    const monthOpps = opportunities.filter(opp => {
      const createdDate = opp.createdon
      const isCreatedBeforeOrDuringMonth = createdDate <= monthEnd

      // Include if open or won during this month
      if (opp.statecode === OpportunityStateCode.Open) {
        return isCreatedBeforeOrDuringMonth
      }
      if (opp.statecode === OpportunityStateCode.Won && opp.actualclosedate) {
        return isCreatedBeforeOrDuringMonth && opp.actualclosedate >= monthStart
      }
      if (opp.statecode === OpportunityStateCode.Lost && opp.actualclosedate) {
        return false // Don't count lost opps
      }
      return false
    })

    const totalValue = monthOpps.reduce((sum, opp) => sum + opp.estimatedvalue, 0)
    const weightedValue = monthOpps.reduce(
      (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
      0
    )

    result.push({
      month: monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      totalValue,
      weightedValue,
      count: monthOpps.length,
    })
  }

  return result
}

/**
 * Calculate conversion rates between stages
 */
export function calculateConversionRates(opportunities: Opportunity[]): {
  qualifyToDevelop: number
  developToPropose: number
  proposeToClose: number
  closeToWon: number
} {
  const allOpps = opportunities

  const qualifyOpps = allOpps.filter(
    opp => opp.salesstage >= SalesStageCode.Qualify
  ).length
  const developOpps = allOpps.filter(
    opp => opp.salesstage >= SalesStageCode.Develop
  ).length
  const proposeOpps = allOpps.filter(
    opp => opp.salesstage >= SalesStageCode.Propose
  ).length
  const closeOpps = allOpps.filter(
    opp => opp.salesstage >= SalesStageCode.Close
  ).length
  const wonOpps = allOpps.filter(
    opp => opp.statecode === OpportunityStateCode.Won
  ).length

  return {
    qualifyToDevelop: qualifyOpps > 0 ? (developOpps / qualifyOpps) * 100 : 0,
    developToPropose: developOpps > 0 ? (proposeOpps / developOpps) * 100 : 0,
    proposeToClose: proposeOpps > 0 ? (closeOpps / proposeOpps) * 100 : 0,
    closeToWon: closeOpps > 0 ? (wonOpps / closeOpps) * 100 : 0,
  }
}

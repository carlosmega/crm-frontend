import type { Opportunity } from '@/core/contracts/entities'
import { OpportunityStateCode } from '@/core/contracts/enums'

/**
 * Forecasting Calculation Utilities
 *
 * Funciones para calcular proyecciones de ventas (forecasting)
 */

export interface ForecastPeriod {
  period: string
  periodStart: Date
  periodEnd: Date
  bestCase: number
  likely: number
  worstCase: number
  actual: number
  opportunityCount: number
}

export type ForecastingPeriodType = 'monthly' | 'quarterly'

/**
 * Calculate forecast for a specific period
 */
function calculatePeriodForecast(
  opportunities: Opportunity[],
  periodStart: Date,
  periodEnd: Date
): Omit<ForecastPeriod, 'period' | 'periodStart' | 'periodEnd'> {
  // Filter opportunities that close within this period
  const periodOpps = opportunities.filter(opp => {
    const closeDate = new Date(opp.estimatedclosedate)
    return closeDate >= periodStart && closeDate <= periodEnd
  })

  const openOpps = periodOpps.filter(opp => opp.statecode === OpportunityStateCode.Open)

  // Best Case: Sum of opportunities with closeprobability >= 75%
  const bestCase = openOpps
    .filter(opp => opp.closeprobability >= 75)
    .reduce((sum, opp) => sum + opp.estimatedvalue, 0)

  // Likely: Weighted pipeline (sum of estimatedvalue * closeprobability)
  const likely = openOpps.reduce(
    (sum, opp) => sum + (opp.estimatedvalue * opp.closeprobability) / 100,
    0
  )

  // Worst Case: Only opportunities with closeprobability = 100%
  const worstCase = openOpps
    .filter(opp => opp.closeprobability === 100)
    .reduce((sum, opp) => sum + opp.estimatedvalue, 0)

  // Actual: Sum of Won opportunities that actually closed in this period
  const actual = periodOpps
    .filter(opp =>
      opp.statecode === OpportunityStateCode.Won &&
      opp.actualclosedate &&
      new Date(opp.actualclosedate) >= periodStart &&
      new Date(opp.actualclosedate) <= periodEnd
    )
    .reduce((sum, opp) => sum + (opp.actualvalue || opp.estimatedvalue), 0)

  return {
    bestCase,
    likely,
    worstCase,
    actual,
    opportunityCount: periodOpps.length,
  }
}

/**
 * Generate monthly forecast for next N months
 */
export function calculateMonthlyForecast(
  opportunities: Opportunity[],
  months: number = 6
): ForecastPeriod[] {
  const result: ForecastPeriod[] = []
  const now = new Date()

  for (let i = 0; i < months; i++) {
    const periodStart = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0, 23, 59, 59)

    const forecast = calculatePeriodForecast(opportunities, periodStart, periodEnd)

    result.push({
      period: periodStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      periodStart,
      periodEnd,
      ...forecast,
    })
  }

  return result
}

/**
 * Generate quarterly forecast for next N quarters
 */
export function calculateQuarterlyForecast(
  opportunities: Opportunity[],
  quarters: number = 4
): ForecastPeriod[] {
  const result: ForecastPeriod[] = []
  const now = new Date()
  const currentQuarter = Math.floor(now.getMonth() / 3)
  const currentYear = now.getFullYear()

  for (let i = 0; i < quarters; i++) {
    const quarterIndex = (currentQuarter + i) % 4
    const yearOffset = Math.floor((currentQuarter + i) / 4)
    const year = currentYear + yearOffset

    const periodStart = new Date(year, quarterIndex * 3, 1)
    const periodEnd = new Date(year, quarterIndex * 3 + 3, 0, 23, 59, 59)

    const forecast = calculatePeriodForecast(opportunities, periodStart, periodEnd)

    result.push({
      period: `Q${quarterIndex + 1} ${year}`,
      periodStart,
      periodEnd,
      ...forecast,
    })
  }

  return result
}

/**
 * Calculate forecast filtered by owner
 */
export function calculateForecastByOwner(
  opportunities: Opportunity[],
  ownerId: string,
  periodType: ForecastingPeriodType = 'monthly',
  periods: number = 6
): ForecastPeriod[] {
  const ownerOpps = opportunities.filter(opp => opp.ownerid === ownerId)

  if (periodType === 'monthly') {
    return calculateMonthlyForecast(ownerOpps, periods)
  } else {
    return calculateQuarterlyForecast(ownerOpps, Math.min(periods, 8))
  }
}

/**
 * Calculate forecast accuracy (compare forecast vs actual)
 */
export function calculateForecastAccuracy(forecasts: ForecastPeriod[]): {
  likelyAccuracy: number
  bestCaseAccuracy: number
  worstCaseAccuracy: number
} {
  const periodsWithActual = forecasts.filter(f => f.actual > 0)

  if (periodsWithActual.length === 0) {
    return {
      likelyAccuracy: 0,
      bestCaseAccuracy: 0,
      worstCaseAccuracy: 0,
    }
  }

  const likelyDiff = periodsWithActual.reduce((sum, f) => {
    const diff = Math.abs(f.likely - f.actual) / f.actual
    return sum + diff
  }, 0)

  const bestCaseDiff = periodsWithActual.reduce((sum, f) => {
    const diff = Math.abs(f.bestCase - f.actual) / f.actual
    return sum + diff
  }, 0)

  const worstCaseDiff = periodsWithActual.reduce((sum, f) => {
    const diff = Math.abs(f.worstCase - f.actual) / f.actual
    return sum + diff
  }, 0)

  return {
    likelyAccuracy: Math.max(0, 100 - (likelyDiff / periodsWithActual.length) * 100),
    bestCaseAccuracy: Math.max(0, 100 - (bestCaseDiff / periodsWithActual.length) * 100),
    worstCaseAccuracy: Math.max(0, 100 - (worstCaseDiff / periodsWithActual.length) * 100),
  }
}

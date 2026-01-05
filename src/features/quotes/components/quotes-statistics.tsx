'use client'

import { useQuoteStatistics } from '../hooks/use-quotes'
import { MetricCard } from '@/shared/components/metric-card'
import { FileText, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../utils/quote-calculations'

/**
 * Quotes Statistics Cards
 *
 * Client Component que muestra estadísticas de quotes
 */
export function QuotesStatistics() {
  const { data: statistics } = useQuoteStatistics()

  if (!statistics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Quotes"
        value={statistics.total}
        description={`${statistics.draft} draft, ${statistics.active} active`}
        icon={FileText}
      />

      <MetricCard
        title="Won Quotes"
        value={statistics.won}
        description={`${statistics.lost} lost`}
        icon={TrendingUp}
      />

      <MetricCard
        title="Won Value"
        value={formatCurrency(statistics.wonValue)}
        description={`Avg: ${formatCurrency(statistics.averageValue)}`}
        icon={DollarSign}
      />

      <MetricCard
        title="Win Rate"
        value={formatPercentage(statistics.winRate, 1)}
        description={`${statistics.won} won / ${statistics.won + statistics.lost} closed`}
        icon={Percent}
      />
    </div>
  )
}

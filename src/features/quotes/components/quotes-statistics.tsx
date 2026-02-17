'use client'

import { useQuoteStatistics } from '../hooks/use-quotes'
import { MetricCard } from '@/shared/components/metric-card'
import { FileText, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../utils/quote-calculations'
import { useTranslation } from '@/shared/hooks/use-translation'

/**
 * Quotes Statistics Cards
 *
 * Client Component que muestra estadísticas de quotes
 */
export function QuotesStatistics() {
  const { data: statistics } = useQuoteStatistics()
  const { t } = useTranslation('quotes')

  if (!statistics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title={t('statistics.totalQuotes')}
        value={statistics.total}
        description={t('statistics.draftActive', { draft: statistics.draft, active: statistics.active })}
        icon={FileText}
      />

      <MetricCard
        title={t('statistics.wonQuotes')}
        value={statistics.won}
        description={t('statistics.lost', { count: statistics.lost })}
        icon={TrendingUp}
      />

      <MetricCard
        title={t('statistics.wonValue')}
        value={formatCurrency(statistics.wonValue)}
        description={t('statistics.avg', { amount: formatCurrency(statistics.averageValue) })}
        icon={DollarSign}
      />

      <MetricCard
        title={t('statistics.winRate')}
        value={formatPercentage(statistics.winRate, 1)}
        description={t('statistics.wonClosed', { won: statistics.won, closed: statistics.won + statistics.lost })}
        icon={Percent}
      />
    </div>
  )
}

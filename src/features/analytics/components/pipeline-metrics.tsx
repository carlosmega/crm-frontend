"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/shared/components/metric-card'
import { usePipelineMetrics } from '../hooks/use-pipeline-metrics'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * PipelineMetrics Component
 *
 * Displays key pipeline metrics in card format
 */
export function PipelineMetrics() {
  const { metrics, loading } = usePipelineMetrics()
  const formatCurrency = useCurrencyFormat()

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pb-4">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No metrics available
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      <MetricCard
        title="Total Pipeline"
        value={formatCurrency(metrics.totalPipelineValue)}
        description={`${metrics.openOpportunities} open ${metrics.openOpportunities === 1 ? 'opportunity' : 'opportunities'}`}
        icon={DollarSign}
        iconClassName="text-blue-600"
        iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
      />

      <MetricCard
        title="Weighted Pipeline"
        value={formatCurrency(metrics.weightedPipelineValue)}
        description="Based on close probability"
        icon={TrendingUp}
        iconClassName="text-purple-600"
        iconBgClassName="bg-purple-100 dark:bg-purple-900/30"
      />

      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        description={`${metrics.wonOpportunities} won / ${metrics.wonOpportunities + metrics.lostOpportunities} closed`}
        icon={Target}
        iconClassName="text-orange-600"
        iconBgClassName="bg-orange-100 dark:bg-orange-900/30"
      />

      <MetricCard
        title="Avg Deal Size"
        value={formatCurrency(metrics.averageDealSize)}
        description="Across all opportunities"
        icon={BarChart3}
        iconClassName="text-slate-600"
        iconBgClassName="bg-slate-100"
      />

      <MetricCard
        title="Avg Sales Cycle"
        value={`${metrics.averageSalesCycleDays} days`}
        description="From creation to close"
        icon={Clock}
        iconClassName="text-blue-600"
        iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
      />

      <MetricCard
        title="Open Opportunities"
        value={metrics.openOpportunities}
        description="Currently in pipeline"
        icon={Briefcase}
        iconClassName="text-slate-600"
        iconBgClassName="bg-slate-100"
      />

      <MetricCard
        title="Won Opportunities"
        value={metrics.wonOpportunities}
        description="Successfully closed"
        icon={CheckCircle2}
        iconClassName="text-green-600"
        iconBgClassName="bg-green-100 dark:bg-green-900/30"
      />

      <MetricCard
        title="Lost Opportunities"
        value={metrics.lostOpportunities}
        description="Closed as lost"
        icon={XCircle}
        iconClassName="text-red-600"
        iconBgClassName="bg-red-100 dark:bg-red-900/30"
      />
    </div>
  )
}

"use client"

import dynamic from 'next/dynamic'
import { PipelineMetrics } from '@/features/analytics/components/pipeline-metrics'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/shared/hooks/use-translation'

const PipelineChart = dynamic(
  () => import('@/features/analytics/components/pipeline-chart').then(m => ({ default: m.PipelineChart })),
  { loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />, ssr: false }
)

const PipelineTrendChart = dynamic(
  () => import('@/features/analytics/components/pipeline-trend-chart').then(m => ({ default: m.PipelineTrendChart })),
  { loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />, ssr: false }
)

const ForecastingGrid = dynamic(
  () => import('@/features/analytics/components/forecasting-grid').then(m => ({ default: m.ForecastingGrid })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />, ssr: false }
)

/**
 * DashboardClient Component
 *
 * Client-side dashboard with pipeline metrics and charts
 * Follows consistent CRM layout pattern with gray background and white cards
 */
export function DashboardClient() {
  const { t } = useTranslation('dashboard')

  return (
    <>
      {/* Page Header - Consistent with leads page */}
      <div className="px-4 pt-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Pipeline Metrics Cards - 4-column grid on desktop */}
      <div className="px-4 pb-6">
        <PipelineMetrics />
      </div>

      {/* Charts Section - Side by side on desktop, stacked on mobile */}
      <div className="px-4 pb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <PipelineChart />
          <PipelineTrendChart />
        </div>
      </div>

      {/* Forecasting Grid - Full width */}
      <div className="px-4 pb-6">
        <ForecastingGrid />
      </div>
    </>
  )
}

"use client"

import { PipelineMetrics, PipelineChart, PipelineTrendChart, ForecastingGrid } from '@/features/analytics/components'

/**
 * DashboardClient Component
 *
 * Client-side dashboard with pipeline metrics and charts
 * Follows consistent CRM layout pattern with gray background and white cards
 */
export function DashboardClient() {
  return (
    <>
      {/* Page Header - Consistent with leads page */}
      <div className="px-4 pt-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time overview of your sales pipeline and key metrics
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

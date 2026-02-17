'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/shared/components/metric-card'
import { useQuotes } from '../hooks/use-quotes'
import { QuoteStateCode, QuoteStatusCode } from '@/core/contracts/enums'
import { formatCurrency } from '../utils/quote-calculations'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Calendar,
  Award,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteMetrics {
  // Counts
  totalQuotes: number
  draftQuotes: number
  activeQuotes: number
  wonQuotes: number
  lostQuotes: number
  closedQuotes: number

  // Values
  totalQuoteValue: number
  avgQuoteValue: number
  wonQuoteValue: number
  lostQuoteValue: number
  activeQuoteValue: number

  // Rates
  conversionRate: number // Won / (Won + Lost)
  winRate: number // Won / Total
  lossRate: number // Lost / Total

  // Time metrics
  avgTimeToClose: number // days (mock for now)
  avgTimeToWin: number // days
  avgTimeToLose: number // days

  // Product metrics
  avgProductsPerQuote: number
  topProducts: Array<{ productName: string; count: number; revenue: number }>

  // Trends (vs previous period - simplified)
  quotesGrowth: number
  revenueGrowth: number
}

/**
 * Calculate comprehensive quote analytics
 */
function calculateQuoteMetrics(quotes: any[]): QuoteMetrics {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Current period (last 30 days)
  const currentQuotes = quotes.filter(
    (q) => new Date(q.createdon) >= thirtyDaysAgo
  )

  // Previous period (30-60 days ago)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const previousQuotes = quotes.filter(
    (q) =>
      new Date(q.createdon) >= sixtyDaysAgo &&
      new Date(q.createdon) < thirtyDaysAgo
  )

  // Counts
  const totalQuotes = quotes.length
  const draftQuotes = quotes.filter((q) => q.statecode === QuoteStateCode.Draft).length
  const activeQuotes = quotes.filter((q) => q.statecode === QuoteStateCode.Active).length
  const wonQuotes = quotes.filter((q) => q.statecode === QuoteStateCode.Won).length
  const lostQuotes = quotes.filter((q) => q.statecode === QuoteStateCode.Closed && q.statuscode === QuoteStatusCode.Lost).length
  const closedQuotes = quotes.filter((q) => q.statecode === QuoteStateCode.Closed).length

  // Values
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const wonQuoteValue = quotes
    .filter((q) => q.statecode === QuoteStateCode.Won)
    .reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const lostQuoteValue = quotes
    .filter((q) => q.statecode === QuoteStateCode.Closed && q.statuscode === QuoteStatusCode.Lost)
    .reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const activeQuoteValue = quotes
    .filter((q) => q.statecode === QuoteStateCode.Active)
    .reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const avgQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0

  // Rates
  const closedCount = wonQuotes + lostQuotes
  const conversionRate = closedCount > 0 ? (wonQuotes / closedCount) * 100 : 0
  const winRate = totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0
  const lossRate = totalQuotes > 0 ? (lostQuotes / totalQuotes) * 100 : 0

  // Time metrics (mock - would need actual close dates)
  const avgTimeToClose = 15 // days (mock)
  const avgTimeToWin = 12 // days (mock)
  const avgTimeToLose = 20 // days (mock)

  // Product metrics (mock - would need quote line items)
  const avgProductsPerQuote = 3.5 // mock
  const topProducts = [
    { productName: 'Premium Service Package', count: 25, revenue: 125000 },
    { productName: 'Enterprise License', count: 18, revenue: 95000 },
    { productName: 'Consulting Hours', count: 32, revenue: 72000 },
  ]

  // Trends
  const quotesGrowth =
    previousQuotes.length > 0
      ? ((currentQuotes.length - previousQuotes.length) / previousQuotes.length) * 100
      : 0

  const currentRevenue = currentQuotes.reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const previousRevenue = previousQuotes.reduce((sum, q) => sum + (q.totalamount || 0), 0)
  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0

  return {
    totalQuotes,
    draftQuotes,
    activeQuotes,
    wonQuotes,
    lostQuotes,
    closedQuotes,
    totalQuoteValue,
    avgQuoteValue,
    wonQuoteValue,
    lostQuoteValue,
    activeQuoteValue,
    conversionRate,
    winRate,
    lossRate,
    avgTimeToClose,
    avgTimeToWin,
    avgTimeToLose,
    avgProductsPerQuote,
    topProducts,
    quotesGrowth,
    revenueGrowth,
  }
}

/**
 * Loading skeleton for dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1.5">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent className="pb-4">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-3 w-[80px] mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * Quote Analytics Dashboard
 *
 * Comprehensive analytics for Quote Management:
 * - Key metrics: conversion rate, avg quote value, time to close
 * - State breakdown: Draft, Active, Won, Lost
 * - Revenue analysis: total, won, lost, pipeline
 * - Trends: vs previous period
 * - Top products
 */
export function QuoteAnalyticsDashboard() {
  const { data: quotes, isLoading } = useQuotes()
  const { t } = useTranslation('quotes')

  const metrics = useMemo(() => {
    if (!quotes) return null
    return calculateQuoteMetrics(quotes)
  }, [quotes])

  if (isLoading || !metrics) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h2>
        <p className="text-muted-foreground">
          {t('analytics.description')}
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        <MetricCard
          title={t('analytics.totalQuotes')}
          value={metrics.totalQuotes}
          icon={FileText}
          iconClassName="text-blue-600"
          iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
          trend={metrics.quotesGrowth}
          trendLabel={t('analytics.vsLast30Days')}
        />
        <MetricCard
          title={t('analytics.conversionRate')}
          value={metrics.conversionRate.toFixed(1)}
          valueSuffix="%"
          description={t('analytics.wonDivTotal')}
          icon={Percent}
          iconClassName="text-purple-600"
          iconBgClassName="bg-purple-100 dark:bg-purple-900/30"
        />
        <MetricCard
          title={t('analytics.avgQuoteValue')}
          value={formatCurrency(metrics.avgQuoteValue)}
          icon={DollarSign}
          iconClassName="text-green-600"
          iconBgClassName="bg-green-100 dark:bg-green-900/30"
        />
        <MetricCard
          title={t('analytics.totalRevenueWon')}
          value={formatCurrency(metrics.wonQuoteValue)}
          icon={Award}
          iconClassName="text-orange-600"
          iconBgClassName="bg-orange-100 dark:bg-orange-900/30"
          trend={metrics.revenueGrowth}
          trendLabel={t('analytics.vsLast30Days')}
        />
      </div>

      {/* Quote States */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('analytics.pipeline.title')}</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
          <MetricCard
            title={t('analytics.pipeline.draft')}
            value={metrics.draftQuotes}
            description={t('analytics.pipeline.draftDesc')}
            icon={Clock}
            iconClassName="text-slate-600"
            iconBgClassName="bg-slate-100"
          />
          <MetricCard
            title={t('analytics.pipeline.active')}
            value={metrics.activeQuotes}
            description={formatCurrency(metrics.activeQuoteValue)}
            icon={FileText}
            iconClassName="text-blue-600"
            iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
          />
          <MetricCard
            title={t('analytics.pipeline.won')}
            value={metrics.wonQuotes}
            description={formatCurrency(metrics.wonQuoteValue)}
            icon={CheckCircle2}
            iconClassName="text-green-600"
            iconBgClassName="bg-green-100 dark:bg-green-900/30"
          />
          <MetricCard
            title={t('analytics.pipeline.lost')}
            value={metrics.lostQuotes}
            description={formatCurrency(metrics.lostQuoteValue)}
            icon={XCircle}
            iconClassName="text-red-600"
            iconBgClassName="bg-red-100 dark:bg-red-900/30"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('analytics.performance.title')}</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
          <MetricCard
            title={t('analytics.performance.winRate')}
            value={metrics.winRate.toFixed(1)}
            valueSuffix="%"
            description={t('analytics.performance.winRateDesc')}
            icon={TrendingUp}
            iconClassName="text-green-600"
            iconBgClassName="bg-green-100 dark:bg-green-900/30"
          />
          <MetricCard
            title={t('analytics.performance.lossRate')}
            value={metrics.lossRate.toFixed(1)}
            valueSuffix="%"
            description={t('analytics.performance.lossRateDesc')}
            icon={TrendingDown}
            iconClassName="text-red-600"
            iconBgClassName="bg-red-100 dark:bg-red-900/30"
          />
          <MetricCard
            title={t('analytics.performance.avgTimeToClose')}
            value={metrics.avgTimeToClose}
            valueSuffix=" days"
            description={t('analytics.performance.avgTimeToCloseDesc')}
            icon={Calendar}
            iconClassName="text-blue-600"
            iconBgClassName="bg-blue-100 dark:bg-blue-900/30"
          />
          <MetricCard
            title={t('analytics.performance.avgProductsPerQuote')}
            value={metrics.avgProductsPerQuote.toFixed(1)}
            description={t('analytics.performance.avgProductsPerQuoteDesc')}
            icon={FileText}
            iconClassName="text-purple-600"
            iconBgClassName="bg-purple-100 dark:bg-purple-900/30"
          />
        </div>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.topProducts.title')}</CardTitle>
          <CardDescription>{t('analytics.topProducts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{product.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.count} {t('analytics.topProducts.quotes')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                  <div className="text-xs text-muted-foreground">{t('analytics.topProducts.totalRevenue')}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{t('analytics.summary.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">{t('analytics.summary.totalQuoteValue')}</div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalQuoteValue)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('analytics.summary.wonRevenue')}</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.wonQuoteValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('analytics.summary.pipelineValue')}</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.activeQuoteValue)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { MetricCard } from '@/shared/components/metric-card'
import { DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../utils/invoice-calculations'
import { useTranslation } from '@/shared/hooks/use-translation'

interface InvoiceStatsCardsProps {
  statistics: {
    total: number
    active: number
    paid: number
    overdue: number
    canceled: number
    totalRevenue: number
    totalOutstanding: number
    averageInvoiceValue: number
  }
}

export function InvoiceStatsCards({ statistics }: InvoiceStatsCardsProps) {
  const { t } = useTranslation('invoices')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title={t('stats.totalRevenue')}
        value={formatCurrency(statistics.totalRevenue)}
        description={t('stats.paidInvoices', { count: statistics.paid })}
        icon={DollarSign}
        iconClassName="text-green-600"
      />

      <MetricCard
        title={t('stats.outstanding')}
        value={formatCurrency(statistics.totalOutstanding)}
        description={t('stats.activeInvoices', { count: statistics.active })}
        icon={FileText}
        iconClassName="text-yellow-600"
      />

      <MetricCard
        title={t('stats.overdue')}
        value={statistics.overdue}
        description={t('stats.requireAttention')}
        icon={AlertCircle}
        iconClassName="text-red-600"
        valueClassName="text-red-600"
      />

      <MetricCard
        title={t('stats.avgInvoice')}
        value={formatCurrency(statistics.averageInvoiceValue)}
        description={t('stats.perInvoice')}
        icon={CheckCircle}
        iconClassName="text-blue-600"
      />
    </div>
  )
}

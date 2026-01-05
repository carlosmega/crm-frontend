'use client'

import { MetricCard } from '@/shared/components/metric-card'
import { DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../utils/invoice-calculations'

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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(statistics.totalRevenue)}
        description={`${statistics.paid} paid invoices`}
        icon={DollarSign}
        iconClassName="text-green-600"
      />

      <MetricCard
        title="Outstanding"
        value={formatCurrency(statistics.totalOutstanding)}
        description={`${statistics.active} active invoices`}
        icon={FileText}
        iconClassName="text-yellow-600"
      />

      <MetricCard
        title="Overdue"
        value={statistics.overdue}
        description="Require attention"
        icon={AlertCircle}
        iconClassName="text-red-600"
        valueClassName="text-red-600"
      />

      <MetricCard
        title="Avg Invoice"
        value={formatCurrency(statistics.averageInvoiceValue)}
        description="Per invoice"
        icon={CheckCircle}
        iconClassName="text-blue-600"
      />
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/shared/components/metric-card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/shared/utils/formatters'
import { Calendar, AlertCircle, Clock, DollarSign } from 'lucide-react'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { InvoiceStateCode } from '@/core/contracts/enums'

/**
 * Invoice Aging Report
 *
 * Categoriza facturas unpaid por días vencidos:
 * - Current (0-30 days)
 * - 30 days (31-60)
 * - 60 days (61-90)
 * - 90+ days overdue
 */

interface AgingBucket {
  label: string
  days: string
  invoices: Invoice[]
  totalAmount: number
  count: number
  color: 'default' | 'secondary' | 'destructive' | 'outline'
}

interface InvoiceAgingReportProps {
  invoices: Invoice[]
}

function calculateDaysOverdue(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function InvoiceAgingReport({ invoices }: InvoiceAgingReportProps) {
  const agingBuckets = useMemo(() => {
    // Filtrar solo invoices Active (unpaid) con due date
    const unpaidInvoices = invoices.filter(
      (inv) =>
        inv.statecode === InvoiceStateCode.Active &&
        inv.duedate !== undefined
    )

    const buckets: AgingBucket[] = [
      {
        label: 'Current',
        days: '0-30 days',
        invoices: [],
        totalAmount: 0,
        count: 0,
        color: 'default',
      },
      {
        label: '31-60 Days',
        days: '31-60 days overdue',
        invoices: [],
        totalAmount: 0,
        count: 0,
        color: 'secondary',
      },
      {
        label: '61-90 Days',
        days: '61-90 days overdue',
        invoices: [],
        totalAmount: 0,
        count: 0,
        color: 'destructive',
      },
      {
        label: '90+ Days',
        days: 'Over 90 days overdue',
        invoices: [],
        totalAmount: 0,
        count: 0,
        color: 'destructive',
      },
    ]

    unpaidInvoices.forEach((invoice) => {
      const daysOverdue = calculateDaysOverdue(invoice.duedate)
      const balance = invoice.totalbalance ?? invoice.totalamount

      let bucketIndex: number
      if (daysOverdue <= 30) {
        bucketIndex = 0 // Current
      } else if (daysOverdue <= 60) {
        bucketIndex = 1 // 31-60
      } else if (daysOverdue <= 90) {
        bucketIndex = 2 // 61-90
      } else {
        bucketIndex = 3 // 90+
      }

      buckets[bucketIndex].invoices.push(invoice)
      buckets[bucketIndex].totalAmount += balance
      buckets[bucketIndex].count += 1
    })

    return buckets
  }, [invoices])

  const totalOutstanding = useMemo(
    () => agingBuckets.reduce((sum, bucket) => sum + bucket.totalAmount, 0),
    [agingBuckets]
  )

  const totalInvoices = useMemo(
    () => agingBuckets.reduce((sum, bucket) => sum + bucket.count, 0),
    [agingBuckets]
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {agingBuckets.map((bucket, index) => {
          const icon = index === 0 ? Calendar : index >= 2 ? AlertCircle : Clock
          const iconClassName = index === 0
            ? 'text-blue-600'
            : index === 1
              ? 'text-yellow-600'
              : index === 2
                ? 'text-orange-600'
                : 'text-red-600'
          const iconBgClassName = index === 0
            ? 'bg-blue-100'
            : index === 1
              ? 'bg-yellow-100'
              : index === 2
                ? 'bg-orange-100'
                : 'bg-red-100'

          return (
            <MetricCard
              key={index}
              title={bucket.label}
              value={formatCurrency(bucket.totalAmount)}
              description={`${bucket.count} ${bucket.count === 1 ? 'invoice' : 'invoices'} · ${bucket.days}`}
              icon={icon}
              iconClassName={iconClassName}
              iconBgClassName={iconBgClassName}
            />
          )
        })}
      </div>

      {/* Aging Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Aging Details</CardTitle>
          <CardDescription>
            Breakdown of all unpaid invoices by aging bucket ({totalInvoices} invoices,{' '}
            {formatCurrency(totalOutstanding)} total outstanding)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalInvoices === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No unpaid invoices found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Aging Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingBuckets.map((bucket) =>
                    bucket.invoices.map((invoice) => {
                      const daysOverdue = calculateDaysOverdue(invoice.duedate)
                      const balance = invoice.totalbalance ?? invoice.totalamount

                      return (
                        <TableRow key={invoice.invoiceid}>
                          <TableCell className="font-medium">
                            {invoice.invoicenumber}
                          </TableCell>
                          <TableCell>{invoice.customerid}</TableCell>
                          <TableCell>{invoice.duedate}</TableCell>
                          <TableCell>
                            <span
                              className={
                                daysOverdue > 60
                                  ? 'text-destructive font-semibold'
                                  : daysOverdue > 30
                                    ? 'text-orange-600 font-medium'
                                    : 'text-muted-foreground'
                              }
                            >
                              {daysOverdue > 0 ? `${daysOverdue} days` : 'Not due'}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(balance)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={bucket.color}>{bucket.label}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aging Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Distribution</CardTitle>
          <CardDescription>Visual breakdown of outstanding amounts by aging period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agingBuckets.map((bucket, index) => {
              const percentage =
                totalOutstanding > 0 ? (bucket.totalAmount / totalOutstanding) * 100 : 0

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={bucket.color}>{bucket.label}</Badge>
                      <span className="text-muted-foreground">{bucket.days}</span>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(bucket.totalAmount)} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        index === 0
                          ? 'bg-blue-500'
                          : index === 1
                            ? 'bg-yellow-500'
                            : index === 2
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

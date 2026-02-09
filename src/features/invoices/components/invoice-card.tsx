'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Eye, Calendar, DollarSign } from 'lucide-react'
import {
  formatInvoiceNumber,
  getInvoiceStatusColor,
  getPaymentProgress,
  getDaysUntilDue,
  isInvoiceOverdue,
} from '../utils'
import { formatCurrency } from '../utils/invoice-calculations'

interface InvoiceCardProps {
  invoice: Invoice
}

export const InvoiceCard = memo(function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { status, paymentProgress, daysUntilDue, overdue } = useMemo(() => ({
    status: getInvoiceStatusColor(invoice),
    paymentProgress: getPaymentProgress(invoice),
    daysUntilDue: getDaysUntilDue(invoice),
    overdue: isInvoiceOverdue(invoice),
  }), [invoice])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link
                href={`/invoices/${invoice.invoiceid}`}
                className="hover:underline"
              >
                {formatInvoiceNumber(invoice)}
              </Link>
            </CardTitle>
            <p className="text-sm text-gray-500 line-clamp-1">{invoice.name}</p>
          </div>
          <Badge className={`${status.text} ${status.bg}`}>{status.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold">
              {formatCurrency(invoice.totalamount)}
            </span>
          </div>

          {invoice.totalpaid > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Paid</span>
                <span className="text-green-600">
                  {formatCurrency(invoice.totalpaid)}
                </span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Balance</span>
            <span className="font-semibold">
              {formatCurrency(invoice.totalbalance ?? invoice.totalamount)}
            </span>
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Due:</span>
          <span className={overdue ? 'text-red-600 font-medium' : ''}>
            {new Date(invoice.duedate).toLocaleDateString()}
          </span>
          {!overdue && daysUntilDue > 0 && (
            <span className="text-gray-400">({daysUntilDue}d)</span>
          )}
          {overdue && (
            <Badge className="text-red-700 bg-red-100 ml-auto">Overdue</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/invoices/${invoice.invoiceid}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

'use client'

import type { Invoice } from '@/core/contracts/entities/invoice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  formatInvoiceNumber,
  getInvoiceStatusColor,
  getDaysUntilDue,
  isInvoiceOverdue,
} from '../utils'
import { formatCurrency } from '../utils/invoice-calculations'

interface InvoiceDetailCardProps {
  invoice: Invoice
}

export function InvoiceDetailCard({ invoice }: InvoiceDetailCardProps) {
  const status = getInvoiceStatusColor(invoice)
  const daysUntilDue = getDaysUntilDue(invoice)
  const overdue = isInvoiceOverdue(invoice)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{formatInvoiceNumber(invoice)}</CardTitle>
            <p className="text-sm text-gray-500">{invoice.name}</p>
          </div>
          <Badge className={`${status.text} ${status.bg}`}>{status.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Invoice Date</p>
            <p className="font-medium">
              {new Date(invoice.createdon).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
              {new Date(invoice.duedate).toLocaleDateString()}
              {!overdue && daysUntilDue > 0 && (
                <span className="text-sm text-gray-400 ml-2">
                  ({daysUntilDue}d)
                </span>
              )}
              {overdue && (
                <span className="text-sm text-red-600 ml-2">(Overdue)</span>
              )}
            </p>
          </div>
        </div>

        {/* Amounts */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(invoice.totalamountlessfreight || invoice.totalamount)}
            </span>
          </div>

          {invoice.discountamount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">
                -{formatCurrency(invoice.discountamount)}
              </span>
            </div>
          )}

          {invoice.totaltax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{formatCurrency(invoice.totaltax)}</span>
            </div>
          )}

          {invoice.freightamount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Freight</span>
              <span>{formatCurrency(invoice.freightamount)}</span>
            </div>
          )}

          <div className="flex justify-between border-t pt-3">
            <span className="font-semibold">Total Amount</span>
            <span className="text-xl font-bold">
              {formatCurrency(invoice.totalamount)}
            </span>
          </div>

          {invoice.totalpaid > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-green-600">
                  {formatCurrency(invoice.totalpaid)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Balance Due</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(invoice.totalbalance ?? invoice.totalamount)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        {invoice.description && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-sm whitespace-pre-wrap">{invoice.description}</p>
          </div>
        )}

        {/* Billing Address */}
        {invoice.billto_line1 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Billing Address</p>
            <div className="text-sm space-y-1">
              {invoice.billto_name && <p className="font-medium">{invoice.billto_name}</p>}
              <p>{invoice.billto_line1}</p>
              {invoice.billto_line2 && <p>{invoice.billto_line2}</p>}
              <p>
                {invoice.billto_city}
                {invoice.billto_stateorprovince && `, ${invoice.billto_stateorprovince}`}{' '}
                {invoice.billto_postalcode}
              </p>
              {invoice.billto_country && <p>{invoice.billto_country}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

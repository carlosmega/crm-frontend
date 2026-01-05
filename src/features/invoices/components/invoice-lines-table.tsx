'use client'

import type { InvoiceDetail } from '@/core/contracts/entities/invoice-detail'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculateInvoiceTotals } from '../utils/invoice-calculations'

interface InvoiceLinesTableProps {
  lines: InvoiceDetail[]
}

export function InvoiceLinesTable({ lines }: InvoiceLinesTableProps) {
  const totals = calculateInvoiceTotals(lines)

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-gray-500">No line items</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Unit Price</TableHead>
            <TableHead className="text-center">Discount</TableHead>
            <TableHead className="text-center">Tax</TableHead>
            <TableHead className="text-center">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => {
            const totalDiscount =
              (line.manualdiscountamount || 0) + (line.volumediscountamount || 0)

            return (
              <TableRow key={line.invoicedetailid}>
                <TableCell className="font-medium">
                  {line.lineitemnumber || '-'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{line.productdescription}</p>
                    {line.isproductoverridden && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center tabular-nums">{line.quantity}</TableCell>
                <TableCell className="text-center tabular-nums">
                  {formatCurrency(line.priceperunit)}
                </TableCell>
                <TableCell className="text-center">
                  {totalDiscount > 0 ? (
                    <span className="text-green-600 tabular-nums">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {line.tax > 0 ? formatCurrency(line.tax) : '-'}
                </TableCell>
                <TableCell className="text-center font-semibold tabular-nums">
                  {formatCurrency(line.extendedamount)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {formatCurrency(totals.totalLineItems)}
            </TableCell>
          </TableRow>
          {totals.totalDiscount > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                Total Discount
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600 tabular-nums">
                -{formatCurrency(totals.totalDiscount)}
              </TableCell>
            </TableRow>
          )}
          {totals.totalTax > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                Total Tax
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatCurrency(totals.totalTax)}
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={6} className="text-right font-bold text-lg">
              Grand Total
            </TableCell>
            <TableCell className="text-right font-bold text-lg tabular-nums">
              {formatCurrency(totals.grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

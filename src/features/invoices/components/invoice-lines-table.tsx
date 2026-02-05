'use client'

import type { InvoiceDetail } from '@/core/contracts/entities/invoice-detail'
import { useSortableData, type SortableColumn } from '@/shared/hooks/use-sortable-data'
import { SortableColumnHeader } from '@/shared/components/sortable-column-header'
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

// Sort column definitions
const SORT_COLUMNS: SortableColumn<InvoiceDetail>[] = [
  { id: 'product', accessor: (row) => row.productdescription || '' },
  { id: 'quantity', accessor: (row) => row.quantity },
  { id: 'priceperunit', accessor: (row) => row.priceperunit },
  { id: 'discount', accessor: (row) => (row.manualdiscountamount || 0) + (row.volumediscountamount || 0) },
  { id: 'tax', accessor: (row) => row.tax || 0 },
  { id: 'amount', accessor: (row) => row.extendedamount },
]

interface InvoiceLinesTableProps {
  lines: InvoiceDetail[]
}

export function InvoiceLinesTable({ lines }: InvoiceLinesTableProps) {
  const totals = calculateInvoiceTotals(lines)
  const { sortedData, sortConfig, handleSort } = useSortableData(lines, SORT_COLUMNS)

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
            <TableHead>
              <SortableColumnHeader columnId="product" label="Product" sortConfig={sortConfig} onSort={handleSort} />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="quantity" label="Qty" sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="priceperunit" label="Unit Price" sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="discount" label="Discount" sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="tax" label="Tax" sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="amount" label="Amount" sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((line) => {
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

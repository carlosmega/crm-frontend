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
import { useTranslation } from '@/shared/hooks/use-translation'

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
  const { t } = useTranslation('invoices')
  const totals = calculateInvoiceTotals(lines)
  const { sortedData, sortConfig, handleSort } = useSortableData(lines, SORT_COLUMNS)

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-gray-500">{t('linesTable.noLineItems')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t('linesTable.hash')}</TableHead>
            <TableHead>
              <SortableColumnHeader columnId="product" label={t('linesTable.product')} sortConfig={sortConfig} onSort={handleSort} />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="quantity" label={t('linesTable.qty')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="priceperunit" label={t('linesTable.unitPrice')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="discount" label={t('linesTable.discount')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="tax" label={t('linesTable.tax')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader columnId="amount" label={t('linesTable.amount')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
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
                        {t('linesTable.custom')}
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
              {t('linesTable.subtotal')}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {formatCurrency(totals.totalLineItems)}
            </TableCell>
          </TableRow>
          {totals.totalDiscount > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                {t('linesTable.totalDiscount')}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600 tabular-nums">
                -{formatCurrency(totals.totalDiscount)}
              </TableCell>
            </TableRow>
          )}
          {totals.totalTax > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-right font-medium">
                {t('linesTable.totalTax')}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatCurrency(totals.totalTax)}
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={6} className="text-right font-bold text-lg">
              {t('linesTable.grandTotal')}
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

'use client'

import { memo, useCallback, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SortableColumnHeader } from '@/shared/components/sortable-column-header'
import { useSortableData, type SortableColumn } from '@/shared/hooks/use-sortable-data'
import type { QuoteDetail } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { Trash2, Edit } from 'lucide-react'

interface QuoteLineItemsTableProps {
  quoteLines: QuoteDetail[]
  canEdit?: boolean
  onEdit?: (line: QuoteDetail) => void
  onDelete?: (lineId: string) => void
}

// Sort column definitions (static, no re-creation)
const SORT_COLUMNS: SortableColumn<QuoteDetail>[] = [
  { id: 'product', accessor: (row) => row.productdescription },
  { id: 'quantity', accessor: (row) => row.quantity },
  { id: 'priceperunit', accessor: (row) => row.priceperunit },
  { id: 'baseamount', accessor: (row) => row.baseamount },
  { id: 'discount', accessor: (row) => row.manualdiscountamount },
  { id: 'tax', accessor: (row) => row.tax },
  { id: 'extendedamount', accessor: (row) => row.extendedamount },
]

// Memoized row component
const QuoteLineRow = memo(function QuoteLineRow({
  line,
  canEdit,
  onEdit,
  onDelete,
}: {
  line: QuoteDetail
  canEdit: boolean
  onEdit?: (line: QuoteDetail) => void
  onDelete?: (lineId: string) => void
}) {
  const handleEdit = useCallback(() => {
    onEdit?.(line)
  }, [line, onEdit])

  const handleDelete = useCallback(() => {
    onDelete?.(line.quotedetailid)
  }, [line.quotedetailid, onDelete])

  return (
    <TableRow>
      <TableCell className="font-medium">
        {line.lineitemnumber}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{line.productdescription}</div>
          {line.productid && (
            <div className="text-xs text-muted-foreground">
              ID: {line.productid}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center tabular-nums">{line.quantity}</TableCell>
      <TableCell className="text-center tabular-nums">
        {formatCurrency(line.priceperunit)}
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {formatCurrency(line.baseamount)}
      </TableCell>
      <TableCell className="text-center">
        {line.manualdiscountamount > 0 ? (
          <span className="text-green-600 tabular-nums">
            -{formatCurrency(line.manualdiscountamount)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        {line.tax > 0 ? (
          <span className="tabular-nums">{formatCurrency(line.tax)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-center font-semibold tabular-nums">
        {formatCurrency(line.extendedamount)}
      </TableCell>
      {canEdit && (
        <TableCell>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  )
})

/**
 * Quote Line Items Table
 *
 * Tabla de productos en el quote con columnas ordenables.
 * Usa useSortableData (hook ligero) en vez del DataTable completo
 * para evitar importar la infraestructura de filtrado (~15-25KB).
 */
export const QuoteLineItemsTable = memo(function QuoteLineItemsTable({
  quoteLines,
  canEdit = false,
  onEdit,
  onDelete,
}: QuoteLineItemsTableProps) {
  const { sortedData, sortConfig, handleSort } = useSortableData(
    quoteLines,
    SORT_COLUMNS
  )

  if (quoteLines.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          No products added to this quote yet
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground mt-2">
            Click &quot;Add Product&quot; to add items to this quote
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>
              <SortableColumnHeader
                columnId="product"
                label="Product"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableColumnHeader
                columnId="quantity"
                label="Qty"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <SortableColumnHeader
                columnId="priceperunit"
                label="Price/Unit"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <SortableColumnHeader
                columnId="baseamount"
                label="Base Amt"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            <TableHead className="text-center w-[120px]">
              <SortableColumnHeader
                columnId="discount"
                label="Discount"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            <TableHead className="text-center w-[100px]">
              <SortableColumnHeader
                columnId="tax"
                label="Tax"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            <TableHead className="text-center w-[140px]">
              <SortableColumnHeader
                columnId="extendedamount"
                label="Extended"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="justify-center"
              />
            </TableHead>
            {canEdit && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((line) => (
            <QuoteLineRow
              key={line.quotedetailid}
              line={line}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

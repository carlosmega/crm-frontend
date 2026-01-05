'use client'

import { memo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { QuoteDetail } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { Trash2, Edit } from 'lucide-react'

interface QuoteLineItemsTableProps {
  quoteLines: QuoteDetail[]
  canEdit?: boolean
  onEdit?: (line: QuoteDetail) => void
  onDelete?: (lineId: string) => void
}

// ✅ OPTIMIZACIÓN: Memoizar row component individual
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
 * Quote Line Items Table (Optimizado)
 *
 * Tabla de productos en el quote
 * ✅ Memoizado con React.memo
 * ✅ Rows individuales memoizados
 * ✅ Callbacks optimizados
 */
export const QuoteLineItemsTable = memo(function QuoteLineItemsTable({
  quoteLines,
  canEdit = false,
  onEdit,
  onDelete,
}: QuoteLineItemsTableProps) {
  if (quoteLines.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          No products added to this quote yet
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground mt-2">
            Click "Add Product" to add items to this quote
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
            <TableHead>Product</TableHead>
            <TableHead className="text-center w-[100px]">Quantity</TableHead>
            <TableHead className="text-center w-[120px]">Price/Unit</TableHead>
            <TableHead className="text-center w-[120px]">Base Amount</TableHead>
            <TableHead className="text-center w-[120px]">Discount</TableHead>
            <TableHead className="text-center w-[100px]">Tax</TableHead>
            <TableHead className="text-center w-[140px]">
              Extended Amount
            </TableHead>
            {canEdit && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quoteLines.map((line) => (
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

'use client'

import { memo, useState, useCallback, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { QuoteDetail, UpdateQuoteDetailDto } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { useLineTotals } from '../hooks/use-quote-calculations'
import { Trash2, Check, X, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BulkActionsToolbar } from './bulk-actions-toolbar'
import { BulkDiscountDialog } from './bulk-discount-dialog'
import { useBulkDeleteQuoteLines, useApplyBulkDiscount } from '../hooks/use-quote-line-bulk-mutations'

interface QuoteLineItemsTableEditableProps {
  quoteLines: QuoteDetail[]
  quoteId: string
  onUpdate?: (lineId: string, data: UpdateQuoteDetailDto) => void
  onDelete?: (lineId: string) => void
  isUpdating?: boolean
}

// ✅ INLINE EDITING: Row component con modo edición
const EditableQuoteLineRow = memo(function EditableQuoteLineRow({
  line,
  onUpdate,
  onDelete,
  isUpdating,
  isSelected,
  onToggleSelect,
}: {
  line: QuoteDetail
  onUpdate?: (lineId: string, data: UpdateQuoteDetailDto) => void
  onDelete?: (lineId: string) => void
  isUpdating?: boolean
  isSelected: boolean
  onToggleSelect: (lineId: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuantity, setEditedQuantity] = useState(line.quantity)
  const [editedPrice, setEditedPrice] = useState(line.priceperunit)
  const [editedDiscount, setEditedDiscount] = useState(line.manualdiscountamount || 0)
  const [editedTax, setEditedTax] = useState(line.tax || 0)

  // Calculate live totals while editing
  const { baseAmount, extendedAmount, discountPercentage } = useLineTotals(
    isEditing ? editedPrice : line.priceperunit,
    isEditing ? editedQuantity : line.quantity,
    isEditing ? editedDiscount : (line.manualdiscountamount || 0),
    isEditing ? editedTax : (line.tax || 0)
  )

  // Reset edited values when switching to edit mode
  useEffect(() => {
    if (isEditing) {
      setEditedQuantity(line.quantity)
      setEditedPrice(line.priceperunit)
      setEditedDiscount(line.manualdiscountamount || 0)
      setEditedTax(line.tax || 0)
    }
  }, [isEditing, line])

  const handleSave = useCallback(() => {
    if (!onUpdate) return

    // Validations
    if (editedQuantity < 1) {
      alert('Quantity must be at least 1')
      return
    }

    if (editedPrice < 0) {
      alert('Price cannot be negative')
      return
    }

    if (editedDiscount < 0) {
      alert('Discount cannot be negative')
      return
    }

    if (editedDiscount > baseAmount) {
      alert('Discount cannot exceed base amount')
      return
    }

    // Submit update
    onUpdate(line.quotedetailid, {
      quantity: editedQuantity,
      priceperunit: editedPrice,
      manualdiscountamount: editedDiscount,
      tax: editedTax,
    })

    setIsEditing(false)
  }, [line.quotedetailid, editedQuantity, editedPrice, editedDiscount, editedTax, baseAmount, onUpdate])

  const handleCancel = useCallback(() => {
    setEditedQuantity(line.quantity)
    setEditedPrice(line.priceperunit)
    setEditedDiscount(line.manualdiscountamount || 0)
    setEditedTax(line.tax || 0)
    setIsEditing(false)
  }, [line])

  const handleDelete = useCallback(() => {
    if (confirm(`Remove "${line.productdescription}" from quote?`)) {
      onDelete?.(line.quotedetailid)
    }
  }, [line, onDelete])

  return (
    <TableRow className={cn(isEditing && 'bg-muted/50', isSelected && 'bg-blue-50 dark:bg-blue-950/20')}>
      {/* Checkbox */}
      <TableCell className="w-[40px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(line.quotedetailid)}
          aria-label={`Select ${line.productdescription}`}
        />
      </TableCell>

      {/* Line Number */}
      <TableCell className="font-medium">
        {line.lineitemnumber}
      </TableCell>

      {/* Product Description (Read-only) */}
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

      {/* Quantity (Editable) */}
      <TableCell className="text-center">
        {isEditing ? (
          <Input
            type="number"
            min="1"
            step="1"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(parseInt(e.target.value) || 1)}
            className="w-20 text-center tabular-nums"
            autoFocus
          />
        ) : (
          <span className="tabular-nums">{line.quantity}</span>
        )}
      </TableCell>

      {/* Price per Unit (Editable) */}
      <TableCell className="text-center">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedPrice}
            onChange={(e) => setEditedPrice(parseFloat(e.target.value) || 0)}
            className="w-28 text-center tabular-nums"
          />
        ) : (
          <span className="tabular-nums">{formatCurrency(line.priceperunit)}</span>
        )}
      </TableCell>

      {/* Base Amount (Calculated) */}
      <TableCell className="text-center tabular-nums">
        {formatCurrency(baseAmount)}
      </TableCell>

      {/* Discount (Editable) */}
      <TableCell className="text-center">
        {isEditing ? (
          <div className="flex flex-col items-center gap-1">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editedDiscount}
              onChange={(e) => setEditedDiscount(parseFloat(e.target.value) || 0)}
              className="w-24 text-center tabular-nums"
            />
            {discountPercentage > 0 && (
              <span className="text-xs text-muted-foreground">
                {discountPercentage.toFixed(1)}%
              </span>
            )}
          </div>
        ) : line.manualdiscountamount > 0 ? (
          <div className="flex flex-col items-center">
            <span className="text-green-600 tabular-nums">
              -{formatCurrency(line.manualdiscountamount)}
            </span>
            {discountPercentage > 0 && (
              <span className="text-xs text-muted-foreground">
                {discountPercentage.toFixed(1)}%
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Tax (Editable) */}
      <TableCell className="text-center">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedTax}
            onChange={(e) => setEditedTax(parseFloat(e.target.value) || 0)}
            className="w-20 text-center tabular-nums"
          />
        ) : line.tax > 0 ? (
          <span className="tabular-nums">{formatCurrency(line.tax)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Extended Amount (Calculated) */}
      <TableCell className="text-center font-semibold tabular-nums">
        {formatCurrency(extendedAmount)}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex gap-1 justify-end">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSave}
                disabled={isUpdating}
                title="Save changes"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCancel}
                disabled={isUpdating}
                title="Cancel"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsEditing(true)}
                title="Edit line"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                title="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
})

/**
 * Quote Line Items Table - Inline Editable
 *
 * Tabla de productos con edición inline (sin dialog)
 * Features:
 * - Edición directa en la tabla (quantity, price, discount, tax)
 * - Cálculos en tiempo real mientras edita
 * - Validación inline
 * - Botones Save/Cancel por row
 * - Bulk Actions: Delete multiple, Apply discount en batch
 */
export const QuoteLineItemsTableEditable = memo(function QuoteLineItemsTableEditable({
  quoteLines,
  quoteId,
  onUpdate,
  onDelete,
  isUpdating = false,
}: QuoteLineItemsTableEditableProps) {
  // Selection state
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set())
  const [showBulkDiscountDialog, setShowBulkDiscountDialog] = useState(false)

  // Bulk mutations
  const bulkDelete = useBulkDeleteQuoteLines(quoteId)
  const bulkDiscount = useApplyBulkDiscount(quoteId)

  // Toggle single line selection
  const handleToggleSelect = useCallback((lineId: string) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev)
      if (next.has(lineId)) {
        next.delete(lineId)
      } else {
        next.add(lineId)
      }
      return next
    })
  }, [])

  // Toggle all selection
  const handleToggleSelectAll = useCallback(() => {
    if (selectedLineIds.size === quoteLines.length) {
      setSelectedLineIds(new Set())
    } else {
      setSelectedLineIds(new Set(quoteLines.map((line) => line.quotedetailid)))
    }
  }, [quoteLines, selectedLineIds.size])

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedLineIds(new Set())
  }, [])

  // Bulk delete
  const handleBulkDelete = useCallback(() => {
    const count = selectedLineIds.size
    if (!confirm(`Are you sure you want to delete ${count} selected ${count === 1 ? 'line' : 'lines'}?`)) {
      return
    }

    bulkDelete.mutate(Array.from(selectedLineIds), {
      onSuccess: () => {
        setSelectedLineIds(new Set())
      },
    })
  }, [selectedLineIds, bulkDelete])

  // Bulk discount
  const handleApplyBulkDiscount = useCallback(
    (discountType: 'percentage' | 'amount', value: number) => {
      const selectedLines = quoteLines.filter((line) =>
        selectedLineIds.has(line.quotedetailid)
      )

      bulkDiscount.applyDiscount(selectedLines, discountType, value)
      setSelectedLineIds(new Set())
    },
    [quoteLines, selectedLineIds, bulkDiscount]
  )

  // Get selected lines for dialog
  const selectedLines = quoteLines.filter((line) =>
    selectedLineIds.has(line.quotedetailid)
  )

  const isAllSelected = quoteLines.length > 0 && selectedLineIds.size === quoteLines.length
  const isIndeterminate = selectedLineIds.size > 0 && selectedLineIds.size < quoteLines.length

  if (quoteLines.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          No products added to this quote yet
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Click "Add Product" to add items to this quote
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedLineIds.size}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkDiscount={() => setShowBulkDiscountDialog(true)}
        />

        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="text-center w-[100px]">Quantity</TableHead>
                <TableHead className="text-center w-[130px]">Price/Unit</TableHead>
                <TableHead className="text-center w-[120px]">Base Amount</TableHead>
                <TableHead className="text-center w-[130px]">Discount</TableHead>
                <TableHead className="text-center w-[100px]">Tax</TableHead>
                <TableHead className="text-center w-[140px]">
                  Extended Amount
                </TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteLines.map((line) => (
                <EditableQuoteLineRow
                  key={line.quotedetailid}
                  line={line}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isUpdating={isUpdating}
                  isSelected={selectedLineIds.has(line.quotedetailid)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bulk Discount Dialog */}
      <BulkDiscountDialog
        open={showBulkDiscountDialog}
        onOpenChange={setShowBulkDiscountDialog}
        selectedLines={selectedLines}
        onApply={handleApplyBulkDiscount}
      />
    </>
  )
})

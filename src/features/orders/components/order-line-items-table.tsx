'use client'

import { useState } from 'react'
import type { OrderDetail } from '@/core/contracts/entities/order-detail'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import { useDeleteOrderDetail } from '../hooks/use-order-details'
import { useSortableData, type SortableColumn } from '@/shared/hooks/use-sortable-data'
import { SortableColumnHeader } from '@/shared/components/sortable-column-header'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Package, Edit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/hooks/use-translation'

// Sort column definitions
const SORT_COLUMNS: SortableColumn<OrderDetail>[] = [
  { id: 'product', accessor: (row) => row.productdescription || '' },
  { id: 'quantity', accessor: (row) => row.quantity },
  { id: 'priceperunit', accessor: (row) => row.priceperunit },
  { id: 'discount', accessor: (row) => (row.manualdiscountamount || 0) + (row.volumediscountamount || 0) },
  { id: 'tax', accessor: (row) => row.tax || 0 },
  { id: 'amount', accessor: (row) => row.extendedamount },
]

interface OrderLineItemsTableProps {
  orderId: string
  items: OrderDetail[]
  canEdit?: boolean
  loading?: boolean
  onEditItem?: (item: OrderDetail) => void
}

/**
 * Order Line Items Table Component
 *
 * Displays order line items (OrderDetail) with:
 * - Product details
 * - Quantities (ordered, shipped, backordered, cancelled)
 * - Pricing (unit price, discounts, tax, extended amount)
 * - Edit/Delete actions (if canEdit = true)
 */
export function OrderLineItemsTable({
  orderId,
  items,
  canEdit = false,
  loading = false,
  onEditItem,
}: OrderLineItemsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<OrderDetail | null>(null)

  const { t } = useTranslation('orders')
  const deleteMutation = useDeleteOrderDetail()
  const { sortedData, sortConfig, handleSort } = useSortableData(items, SORT_COLUMNS)

  const handleDeleteClick = (item: OrderDetail) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      await deleteMutation.mutateAsync({
        id: itemToDelete.salesorderdetailid,
        orderId,
      })

      toast.success(t('lineItems.deleteSuccess'))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error('Error deleting order line:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete order line item'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{t('lineItems.noLineItems')}</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          {canEdit
            ? t('lineItems.addPrompt')
            : t('lineItems.noLineItemsAlt')}
        </p>
      </div>
    )
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.baseamount || 0), 0)
  const totalDiscount = items.reduce(
    (sum, item) =>
      sum + (item.manualdiscountamount || 0) + (item.volumediscountamount || 0),
    0
  )
  const totalTax = items.reduce((sum, item) => sum + (item.tax || 0), 0)
  const total = items.reduce((sum, item) => sum + item.extendedamount, 0)

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>
                <SortableColumnHeader columnId="product" label={t('lineItems.product')} sortConfig={sortConfig} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-center">
                <SortableColumnHeader columnId="quantity" label={t('lineItems.qty')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
              </TableHead>
              <TableHead className="text-center">
                <SortableColumnHeader columnId="priceperunit" label={t('lineItems.unitPrice')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
              </TableHead>
              <TableHead className="text-center">
                <SortableColumnHeader columnId="discount" label={t('lineItems.discount')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
              </TableHead>
              <TableHead className="text-center">
                <SortableColumnHeader columnId="tax" label={t('lineItems.tax')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
              </TableHead>
              <TableHead className="text-center">
                <SortableColumnHeader columnId="amount" label={t('lineItems.amount')} sortConfig={sortConfig} onSort={handleSort} className="justify-center" />
              </TableHead>
              {canEdit && <TableHead className="w-[100px]">{t('lineItems.actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.salesorderdetailid}>
                {/* Line Number */}
                <TableCell className="font-medium text-muted-foreground">
                  {item.lineitemnumber || '-'}
                </TableCell>

                {/* Product */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.productdescription || 'Product'}
                    </span>
                    {item.productid && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.productid.substring(0, 12)}...
                      </span>
                    )}
                    {/* Quantity Status Badges */}
                    <div className="flex gap-1 mt-1">
                      {(item.quantityshipped || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {t('lineItems.shipped')} {item.quantityshipped}
                        </Badge>
                      )}
                      {(item.quantitybackordered || 0) > 0 && (
                        <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950/30">
                          {t('lineItems.backorder')} {item.quantitybackordered}
                        </Badge>
                      )}
                      {(item.quantitycancelled || 0) > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950/30">
                          {t('lineItems.cancelled')} {item.quantitycancelled}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Quantity */}
                <TableCell className="text-center font-medium tabular-nums">
                  {item.quantity}
                </TableCell>

                {/* Unit Price */}
                <TableCell className="text-center tabular-nums">
                  {formatCurrency(item.priceperunit)}
                </TableCell>

                {/* Discount */}
                <TableCell className="text-center">
                  {item.manualdiscountamount || item.volumediscountamount ? (
                    <span className="text-red-600 tabular-nums">
                      -
                      {formatCurrency(
                        (item.manualdiscountamount || 0) +
                          (item.volumediscountamount || 0)
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Tax */}
                <TableCell className="text-center tabular-nums">
                  {item.tax ? formatCurrency(item.tax) : '-'}
                </TableCell>

                {/* Extended Amount */}
                <TableCell className="text-center font-semibold tabular-nums">
                  {formatCurrency(item.extendedamount)}
                </TableCell>

                {/* Actions */}
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-1">
                      {onEditItem && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEditItem(item)}
                          title={t('lineItems.editLine')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteClick(item)}
                        title={t('lineItems.deleteLine')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals Summary */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2 border rounded-lg p-4 bg-muted/30">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('lineItems.subtotal')}</span>
            <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('lineItems.totalDiscount')}</span>
              <span className="font-medium text-red-600 tabular-nums">
                -{formatCurrency(totalDiscount)}
              </span>
            </div>
          )}

          {totalTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('lineItems.totalTax')}</span>
              <span className="font-medium tabular-nums">{formatCurrency(totalTax)}</span>
            </div>
          )}

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold">{t('lineItems.total')}</span>
              <span className="text-xl font-bold tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('lineItems.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lineItems.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('lineItems.delete.deleting')}
                </>
              ) : (
                t('lineItems.delete.deleteButton')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

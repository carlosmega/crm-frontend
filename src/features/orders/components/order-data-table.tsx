"use client"

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Order } from '@/core/contracts/entities/order'
import { OrderStateCode } from '@/core/contracts/enums'
import {
  DataTableWithToolbar,
  DataTableColumn,
  BulkAction,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from './order-status-badge'
import { Eye, Package, FileText, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'

// ✅ OPTIMIZACIÓN: Date formatter creado una sola vez (module-level)
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

interface OrderDataTableProps {
  orders: Order[]
  selectedOrders?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  filters?: ActiveFilters
  onFiltersChange?: (filters: ActiveFilters) => void
  loading?: boolean
  bulkActions?: BulkAction[]
}

/**
 * Order data table component using DataTable
 *
 * Displays orders with:
 * - Row selection for bulk actions
 * - Column sorting (name, number, amount, date)
 * - Column filtering (text, select, multiselect, number, date)
 * - Rich cell rendering with badges and links
 * - Quick action buttons
 */
export function OrderDataTable({
  orders,
  selectedOrders = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  loading = false,
  bulkActions = []
}: OrderDataTableProps) {
  // ✅ OPTIMIZACIÓN: Helpers memoizados con useCallback
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }, [])

  const getCustomerName = useCallback((order: Order) => {
    // TODO: Fetch actual customer name from Account/Contact
    if (!order.customerid) return 'No Customer'
    return `Customer ${order.customerid.substring(0, 8)}`
  }, [])

  // ✅ OPTIMIZACIÓN: Columns definition memoizada
  const columns: DataTableColumn<Order>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Order Name',
      accessorFn: (order) => order.name,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith', 'endsWith'],
        placeholder: 'Search order names...',
      },
      cell: (order) => (
        <div className="flex flex-col">
          <Link
            href={`/orders/${order.salesorderid}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {order.name}
          </Link>
          {order.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {order.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'ordernumber',
      header: 'Order #',
      accessorFn: (order) => order.ordernumber || '-',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith'],
        placeholder: 'Search order numbers...',
      },
      cell: (order) => (
        <span className="font-mono text-sm">
          {order.ordernumber || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (order) => getCustomerName(order),
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: 'Search customers...',
      },
      cell: (order) => (
        <div className="flex flex-col">
          <span className="text-sm">{getCustomerName(order)}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {order.customeridtype}
          </span>
        </div>
      ),
    },
    {
      id: 'state',
      header: 'Status',
      accessorFn: (order) => order.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'Active', value: OrderStateCode.Active, icon: FileText },
          { label: 'Submitted', value: OrderStateCode.Submitted, icon: Truck },
          { label: 'Fulfilled', value: OrderStateCode.Fulfilled, icon: CheckCircle2 },
          { label: 'Invoiced', value: OrderStateCode.Invoiced, icon: CheckCircle2 },
          { label: 'Canceled', value: OrderStateCode.Canceled, icon: XCircle },
        ],
      },
      cell: (order) => <OrderStatusBadge statecode={order.statecode} />,
    },
    {
      id: 'totalamount',
      header: 'Total Amount',
      accessorFn: (order) => order.totalamount || 0,
      sortable: true,
      filterable: true,
      filter: {
        type: 'number',
        operators: ['equals', 'greaterThan', 'lessThan', 'between'],
        placeholder: 'Enter amount...',
        min: 0,
      },
      className: 'text-center',
      headerClassName: 'text-center',
      cell: (order) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(order.totalamount)}
        </span>
      ),
    },
    {
      id: 'requestdeliveryby',
      header: 'Delivery Date',
      accessorFn: (order) => order.requestdeliveryby ? new Date(order.requestdeliveryby) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (order) => {
        const isPast = order.requestdeliveryby && new Date(order.requestdeliveryby) < new Date()
        const isFulfilled = order.statecode === OrderStateCode.Fulfilled || order.statecode === OrderStateCode.Invoiced
        return (
          <div className="flex flex-col">
            <span className={`text-sm ${isPast && !isFulfilled ? 'text-destructive' : ''}`}>
              {formatDate(order.requestdeliveryby)}
            </span>
            {isPast && !isFulfilled && (
              <span className="text-xs text-destructive">Overdue</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdon',
      header: 'Created',
      accessorFn: (order) => order.createdon ? new Date(order.createdon) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (order) => (
        <span className="text-sm">
          {formatDate(order.createdon)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (order) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title="View details">
            <Link href={`/orders/${order.salesorderid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {order.statecode === OrderStateCode.Submitted && (
            <Button asChild variant="ghost" size="icon-sm" title="Fulfill order">
              <Link href={`/orders/${order.salesorderid}/fulfill`}>
                <Package className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ], [formatDate, getCustomerName]) // Memoize with stable dependencies

  // Empty state
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <svg
          className="size-6 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-lg font-semibold text-foreground mb-1">No orders found</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        No orders match your current filters. Try adjusting your search criteria.
      </p>
    </div>
  )

  return (
    <DataTableWithToolbar
      data={orders}
      columns={columns}
      getRowId={(order) => order.salesorderid}
      enableRowSelection={!!onSelectionChange}
      selectedRows={selectedOrders}
      onSelectionChange={onSelectionChange}
      enableFiltering={!!onFiltersChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={loading}
      loadingRows={8}
      emptyState={emptyState}
      defaultSort={{
        columnId: 'createdon',
        direction: 'desc',
      }}
      bulkActions={bulkActions}
    />
  )
}

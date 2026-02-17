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
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCustomerNames } from '@/shared/hooks/use-customer-names'

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
  const { t } = useTranslation('orders')
  const { getCustomerName: fetchCustomerName } = useCustomerNames()

  // ✅ OPTIMIZACIÓN: Helpers memoizados con useCallback
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }, [])

  const getCustomerName = useCallback((order: Order) => {
    if (!order.customerid) return t('dataTable.noCustomer')
    return fetchCustomerName(order.customerid, order.customeridtype)
  }, [t, fetchCustomerName])

  // ✅ OPTIMIZACIÓN: Columns definition memoizada
  const columns: DataTableColumn<Order>[] = useMemo(() => [
    {
      id: 'name',
      header: t('dataTable.orderName'),
      accessorFn: (order) => order.name,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith', 'endsWith'],
        placeholder: t('dataTable.searchOrderNames'),
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
      header: t('dataTable.orderNumber'),
      accessorFn: (order) => order.ordernumber || '-',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith'],
        placeholder: t('dataTable.searchOrderNumbers'),
      },
      cell: (order) => (
        <span className="font-mono text-sm">
          {order.ordernumber || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      id: 'customer',
      header: t('dataTable.customer'),
      accessorFn: (order) => getCustomerName(order),
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: t('dataTable.searchCustomers'),
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
      header: t('dataTable.status'),
      accessorFn: (order) => order.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: t('status.active'), value: OrderStateCode.Active, icon: FileText },
          { label: t('status.submitted'), value: OrderStateCode.Submitted, icon: Truck },
          { label: t('status.fulfilled'), value: OrderStateCode.Fulfilled, icon: CheckCircle2 },
          { label: t('status.invoiced'), value: OrderStateCode.Invoiced, icon: CheckCircle2 },
          { label: t('status.canceled'), value: OrderStateCode.Canceled, icon: XCircle },
        ],
      },
      cell: (order) => <OrderStatusBadge statecode={order.statecode} />,
    },
    {
      id: 'totalamount',
      header: t('dataTable.totalAmount'),
      accessorFn: (order) => order.totalamount || 0,
      sortable: true,
      filterable: true,
      filter: {
        type: 'number',
        operators: ['equals', 'greaterThan', 'lessThan', 'between'],
        placeholder: t('dataTable.enterAmount'),
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
      header: t('dataTable.deliveryDate'),
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
              <span className="text-xs text-destructive">{t('dataTable.overdue')}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdon',
      header: t('dataTable.created'),
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
      header: t('dataTable.actions'),
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (order) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title={t('dataTable.viewDetails')}>
            <Link href={`/orders/${order.salesorderid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {order.statecode === OrderStateCode.Submitted && (
            <Button asChild variant="ghost" size="icon-sm" title={t('dataTable.fulfillOrder')}>
              <Link href={`/orders/${order.salesorderid}/fulfill`}>
                <Package className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ], [t, formatDate, getCustomerName]) // Memoize with stable dependencies

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
      <p className="text-lg font-semibold text-foreground mb-1">{t('dataTable.noOrdersFound')}</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t('dataTable.noOrdersDescription')}
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

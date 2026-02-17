'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { InvoiceStateCode } from '@/core/contracts/enums'
import { useTranslation } from '@/shared/hooks/use-translation'
import {
  DataTableWithToolbar,
  DataTableColumn,
  BulkAction,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, FileText, DollarSign, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import {
  formatInvoiceNumber,
  getInvoiceStatusColor,
} from '../utils'
import { EmptyState } from '@/shared/components/empty-state'

interface InvoiceListProps {
  invoices: Invoice[]
  selectedInvoices?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  filters?: ActiveFilters
  onFiltersChange?: (filters: ActiveFilters) => void
  loading?: boolean
  bulkActions?: BulkAction[]
}

/**
 * Invoice list table component using DataTable
 *
 * Displays invoices with:
 * - Row selection for bulk actions
 * - Column sorting
 * - Column filtering
 * - Rich cell rendering with badges and links
 */
export function InvoiceList({
  invoices,
  selectedInvoices = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  loading = false,
  bulkActions = []
}: InvoiceListProps) {
  const { t: tInv } = useTranslation('invoices')
  const { t: tCommon } = useTranslation('common')

  // ✅ PERFORMANCE: Memoize columns to prevent recreation on every render
  const columns: DataTableColumn<Invoice>[] = useMemo(() => [
    {
      id: 'invoicenumber',
      header: tInv('columns.invoiceNumber'),
      accessorFn: (invoice) => invoice.invoicenumber || invoice.invoiceid,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: tInv('filters.searchInvoiceNumber'),
      },
      cell: (invoice) => (
        <div className="flex flex-col">
          <Link
            href={`/invoices/${invoice.invoiceid}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
                     >
            {formatInvoiceNumber(invoice)}
          </Link>
          {invoice.salesorderid && (
            <span className="text-xs text-muted-foreground font-mono">
              {tInv('labels.orderPrefix')} {invoice.salesorderid.substring(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'name',
      header: tInv('columns.name'),
      accessorFn: (invoice) => invoice.name,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith'],
        placeholder: tInv('filters.searchName'),
      },
      cell: (invoice) => (
        <div className="max-w-xs truncate">{invoice.name}</div>
      ),
    },
    {
      id: 'status',
      header: tInv('columns.status'),
      accessorFn: (invoice) => invoice.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: tInv('status.active'), value: InvoiceStateCode.Active },
          { label: tInv('status.paid'), value: InvoiceStateCode.Paid },
          { label: tInv('status.canceled'), value: InvoiceStateCode.Canceled },
        ],
      },
      cell: (invoice) => {
        const status = getInvoiceStatusColor(invoice)
        return (
          <Badge className={`${status.text} ${status.bg}`}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      id: 'duedate',
      header: tInv('columns.dueDate'),
      accessorFn: (invoice) => invoice.duedate || '',
      sortable: true,
      filterable: true,
      filter: {
        type: 'date',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (invoice) => {
        const dueDate = new Date(invoice.duedate)
        const today = new Date()
        const isOverdue = invoice.statecode === InvoiceStateCode.Active && dueDate < today

        return (
          <div className="flex items-center gap-2">
            {isOverdue && (
              <AlertCircle className="size-4 text-destructive" />
            )}
            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
              {formatDate(invoice.duedate)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'totalamount',
      header: tInv('columns.amount'),
      accessorFn: (invoice) => invoice.totalamount,
      sortable: true,
      filterable: true,
      filter: {
        type: 'number',
        operators: ['equals', 'greaterThan', 'lessThan', 'between'],
        placeholder: tInv('filters.enterAmount'),
        min: 0,
      },
      className: 'text-center',
      headerClassName: 'text-center',
      cell: (invoice) => (
        <div className="flex items-center justify-center gap-1">
          <DollarSign className="size-3 text-muted-foreground" />
          <span className="font-medium tabular-nums">{formatCurrency(invoice.totalamount)}</span>
        </div>
      ),
    },
    {
      id: 'balance',
      header: 'Balance',
      accessorFn: (invoice) => invoice.totalbalance ?? invoice.totalamount,
      sortable: true,
      filterable: true,
      filter: {
        type: 'number',
        operators: ['equals', 'greaterThan', 'lessThan', 'between'],
        placeholder: 'Enter balance...',
        min: 0,
      },
      className: 'text-center',
      headerClassName: 'text-center',
      cell: (invoice) => {
        const balance = invoice.totalbalance ?? invoice.totalamount
        const isPaid = balance === 0
        const isPartiallyPaid = balance > 0 && balance < invoice.totalamount

        return (
          <div className="flex items-center justify-center gap-2">
            <span
              className={
                isPaid
                  ? 'text-green-600 font-medium tabular-nums'
                  : isPartiallyPaid
                  ? 'text-orange-600 font-medium tabular-nums'
                  : 'font-medium tabular-nums'
              }
            >
              {formatCurrency(balance)}
            </span>
            {isPartiallyPaid && (
              <Badge variant="outline" className="text-xs text-orange-600">
                Partial
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdon',
      header: 'Created',
      accessorFn: (invoice) => invoice.createdon ? new Date(invoice.createdon) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (invoice) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(invoice.createdon)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (invoice) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title="View details">
            <Link href={`/invoices/${invoice.invoiceid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" title="Edit invoice">
            <Link href={`/invoices/${invoice.invoiceid}/edit`}>
              <Edit className="size-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ], [tInv, tCommon])

  const emptyState = (
    <EmptyState
      icon={FileText}
      title="No invoices found"
      description="No invoices match your current filters. Try adjusting your search criteria."
    />
  )

  return (
    <DataTableWithToolbar
      data={invoices}
      columns={columns}
      getRowId={(invoice) => invoice.invoiceid}
      enableRowSelection={!!onSelectionChange}
      selectedRows={selectedInvoices}
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

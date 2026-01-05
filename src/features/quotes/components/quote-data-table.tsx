"use client"

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Quote } from '@/core/contracts'
import {
  QuoteStateCode,
  QuoteStatusCode,
} from '@/core/contracts'
import {
  DataTableWithToolbar,
  DataTableColumn,
  BulkAction,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { Button } from '@/components/ui/button'
import { QuoteStatusBadge } from './quote-status-badge'
import { Eye, Edit, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '../utils/quote-calculations'

// ✅ OPTIMIZACIÓN: Date formatter creado una sola vez (module-level)
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

interface QuoteDataTableProps {
  quotes: Quote[]
  selectedQuotes?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  filters?: ActiveFilters
  onFiltersChange?: (filters: ActiveFilters) => void
  loading?: boolean
  bulkActions?: BulkAction[]
}

/**
 * Quote data table component using DataTable
 *
 * Displays quotes with:
 * - Row selection for bulk actions
 * - Column sorting (name, number, amount, date)
 * - Column filtering (text, select, multiselect, number, date)
 * - Rich cell rendering with badges and links
 * - Quick action buttons
 *
 * @example
 * ```tsx
 * <QuoteDataTable
 *   quotes={quotes}
 *   selectedQuotes={selected}
 *   onSelectionChange={setSelected}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * ```
 */
export function QuoteDataTable({
  quotes,
  selectedQuotes = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  loading = false,
  bulkActions = []
}: QuoteDataTableProps) {
  // ✅ OPTIMIZACIÓN: Helpers memoizados con useCallback
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }, [])

  const getCustomerName = useCallback((quote: Quote) => {
    // TODO: Fetch actual customer name from Account/Contact
    if (!quote.customerid) return 'No Customer'
    return `Customer ${quote.customerid.substring(0, 8)}`
  }, [])

  // ✅ OPTIMIZACIÓN: Columns definition memoizada
  const columns: DataTableColumn<Quote>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Quote Name',
      accessorFn: (quote) => quote.name,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith', 'endsWith'],
        placeholder: 'Search quote names...',
      },
      cell: (quote) => (
        <div className="flex flex-col">
          <Link
            href={`/quotes/${quote.quoteid}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {quote.name}
          </Link>
          {quote.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {quote.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'quotenumber',
      header: 'Quote #',
      accessorFn: (quote) => quote.quotenumber || '-',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith'],
        placeholder: 'Search quote numbers...',
      },
      cell: (quote) => (
        <span className="font-mono text-sm">
          {quote.quotenumber || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (quote) => getCustomerName(quote),
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: 'Search customers...',
      },
      cell: (quote) => (
        <div className="flex flex-col">
          <span className="text-sm">{getCustomerName(quote)}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {quote.customeridtype}
          </span>
        </div>
      ),
    },
    {
      id: 'state',
      header: 'State',
      accessorFn: (quote) => quote.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'Draft', value: QuoteStateCode.Draft, icon: FileText },
          { label: 'Active', value: QuoteStateCode.Active, icon: CheckCircle2 },
          { label: 'Won', value: QuoteStateCode.Won, icon: CheckCircle2 },
          { label: 'Closed', value: QuoteStateCode.Closed, icon: XCircle },
        ],
      },
      cell: (quote) => {
        const stateLabels = {
          [QuoteStateCode.Draft]: 'Draft',
          [QuoteStateCode.Active]: 'Active',
          [QuoteStateCode.Won]: 'Won',
          [QuoteStateCode.Closed]: 'Closed',
        }
        const stateColors = {
          [QuoteStateCode.Draft]: 'secondary',
          [QuoteStateCode.Active]: 'default',
          [QuoteStateCode.Won]: 'success',
          [QuoteStateCode.Closed]: 'destructive',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            quote.statecode === QuoteStateCode.Draft ? 'bg-secondary text-secondary-foreground' :
            quote.statecode === QuoteStateCode.Active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
            quote.statecode === QuoteStateCode.Won ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {stateLabels[quote.statecode]}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (quote) => quote.statuscode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'In Progress', value: QuoteStatusCode.In_Progress },
          { label: 'In Review', value: QuoteStatusCode.In_Review },
          { label: 'Open', value: QuoteStatusCode.Open },
          { label: 'Won', value: QuoteStatusCode.Won },
          { label: 'Lost', value: QuoteStatusCode.Lost },
          { label: 'Canceled', value: QuoteStatusCode.Canceled },
          { label: 'Revised', value: QuoteStatusCode.Revised },
        ],
      },
      cell: (quote) => <QuoteStatusBadge statuscode={quote.statuscode} />,
    },
    {
      id: 'totalamount',
      header: 'Total Amount',
      accessorFn: (quote) => quote.totalamount || 0,
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
      cell: (quote) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(quote.totalamount)}
        </span>
      ),
    },
    {
      id: 'effectiveto',
      header: 'Valid Until',
      accessorFn: (quote) => quote.effectiveto ? new Date(quote.effectiveto) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (quote) => {
        const isExpired = quote.effectiveto && new Date(quote.effectiveto) < new Date()
        return (
          <div className="flex flex-col">
            <span className={`text-sm ${isExpired ? 'text-destructive' : ''}`}>
              {formatDate(quote.effectiveto)}
            </span>
            {isExpired && (
              <span className="text-xs text-destructive">Expired</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdon',
      header: 'Created',
      accessorFn: (quote) => quote.createdon ? new Date(quote.createdon) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (quote) => (
        <span className="text-sm">
          {formatDate(quote.createdon)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (quote) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title="View details">
            <Link href={`/quotes/${quote.quoteid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {quote.statecode === QuoteStateCode.Draft && (
            <Button asChild variant="ghost" size="icon-sm" title="Edit quote">
              <Link href={`/quotes/${quote.quoteid}/edit`}>
                <Edit className="size-4" />
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
      <p className="text-lg font-semibold text-foreground mb-1">No quotes found</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        No quotes match your current filters. Try adjusting your search criteria or create a new quote to get started.
      </p>
    </div>
  )

  return (
    <DataTableWithToolbar
      data={quotes}
      columns={columns}
      getRowId={(quote) => quote.quoteid}
      enableRowSelection={!!onSelectionChange}
      selectedRows={selectedQuotes}
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

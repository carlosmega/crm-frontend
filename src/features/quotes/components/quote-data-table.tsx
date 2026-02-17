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
import { useTranslation } from '@/shared/hooks/use-translation'
import { useCustomerNames } from '@/shared/hooks/use-customer-names'

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
  const { t } = useTranslation('quotes')
  const { getCustomerName: fetchCustomerName } = useCustomerNames()

  // ✅ OPTIMIZACIÓN: Helpers memoizados con useCallback
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }, [])

  const getCustomerName = useCallback((quote: Quote) => {
    if (!quote.customerid) return t('dataTable.noCustomer') || 'No Customer'
    return fetchCustomerName(quote.customerid, quote.customeridtype)
  }, [t, fetchCustomerName])

  // ✅ OPTIMIZACIÓN: Columns definition memoizada
  const columns: DataTableColumn<Quote>[] = useMemo(() => [
    {
      id: 'name',
      header: t('dataTable.quoteName'),
      accessorFn: (quote) => quote.name,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith', 'endsWith'],
        placeholder: t('dataTable.searchQuoteNames'),
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
      header: t('dataTable.quoteNumber'),
      accessorFn: (quote) => quote.quotenumber || '-',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith'],
        placeholder: t('dataTable.searchQuoteNumbers'),
      },
      cell: (quote) => (
        <span className="font-mono text-sm">
          {quote.quotenumber || <span className="text-muted-foreground">-</span>}
        </span>
      ),
    },
    {
      id: 'customer',
      header: t('dataTable.customer'),
      accessorFn: (quote) => getCustomerName(quote),
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: t('dataTable.searchCustomers'),
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
      header: t('dataTable.state'),
      accessorFn: (quote) => quote.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: t('dataTable.stateDraft'), value: QuoteStateCode.Draft, icon: FileText },
          { label: t('dataTable.stateActive'), value: QuoteStateCode.Active, icon: CheckCircle2 },
          { label: t('dataTable.stateWon'), value: QuoteStateCode.Won, icon: CheckCircle2 },
          { label: t('dataTable.stateClosed'), value: QuoteStateCode.Closed, icon: XCircle },
        ],
      },
      cell: (quote) => {
        const stateLabels: Record<number, string> = {
          [QuoteStateCode.Draft]: t('dataTable.stateDraft'),
          [QuoteStateCode.Active]: t('dataTable.stateActive'),
          [QuoteStateCode.Won]: t('dataTable.stateWon'),
          [QuoteStateCode.Closed]: t('dataTable.stateClosed'),
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
      header: t('dataTable.status'),
      accessorFn: (quote) => quote.statuscode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: t('dataTable.statusInProgress'), value: QuoteStatusCode.In_Progress },
          { label: t('dataTable.statusInReview'), value: QuoteStatusCode.In_Review },
          { label: t('dataTable.statusOpen'), value: QuoteStatusCode.Open },
          { label: t('dataTable.statusWon'), value: QuoteStatusCode.Won },
          { label: t('dataTable.statusLost'), value: QuoteStatusCode.Lost },
          { label: t('dataTable.statusCanceled'), value: QuoteStatusCode.Canceled },
          { label: t('dataTable.statusRevised'), value: QuoteStatusCode.Revised },
        ],
      },
      cell: (quote) => <QuoteStatusBadge statuscode={quote.statuscode} />,
    },
    {
      id: 'totalamount',
      header: t('dataTable.totalAmount'),
      accessorFn: (quote) => quote.totalamount || 0,
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
      cell: (quote) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(quote.totalamount)}
        </span>
      ),
    },
    {
      id: 'effectiveto',
      header: t('dataTable.validUntil'),
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
              <span className="text-xs text-destructive">{t('dataTable.expired') || 'Expired'}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'createdon',
      header: t('dataTable.created'),
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
      header: t('dataTable.actions'),
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (quote) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title={t('dataTable.viewDetails')}>
            <Link href={`/quotes/${quote.quoteid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {quote.statecode === QuoteStateCode.Draft && (
            <Button asChild variant="ghost" size="icon-sm" title={t('dataTable.editQuote')}>
              <Link href={`/quotes/${quote.quoteid}/edit`}>
                <Edit className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ], [formatDate, getCustomerName, t]) // Memoize with stable dependencies

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
      <p className="text-lg font-semibold text-foreground mb-1">{t('dataTable.noQuotesFound')}</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t('dataTable.noQuotesDescription')}
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

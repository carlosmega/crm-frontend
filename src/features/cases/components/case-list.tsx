"use client"

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { Case } from '@/core/contracts'
import {
  CaseStateCode,
  CasePriorityCode,
  CaseOriginCode,
  CaseTypeCode,
} from '@/core/contracts'
import {
  DataTableWithToolbar,
  DataTableColumn,
  BulkAction,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { Button } from '@/components/ui/button'
import { CaseStatusBadge } from './case-status-badge'
import { CasePriorityBadge } from './case-priority-badge'
import { CaseOriginBadge } from './case-origin-badge'
import { CaseTypeBadge } from './case-type-badge'
import {
  Eye,
  Edit,
  Building2,
  User,
  Headphones,
  Filter,
  AlertTriangle,
  Minus,
  ArrowDown,
  Phone,
  Mail,
  Globe,
  HelpCircle,
  FileText,
} from 'lucide-react'
import { EmptyState } from '@/shared/components/empty-state'

// Formatters created once at module level
const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

interface CaseListProps {
  cases: Case[]
  selectedCases?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  filters?: ActiveFilters
  onFiltersChange?: (filters: ActiveFilters) => void
  loading?: boolean
  bulkActions?: BulkAction[]
  hasLoadedData?: boolean
}

/**
 * Case list table component using DataTable
 *
 * Displays cases with:
 * - Row selection for bulk actions
 * - Column sorting and filtering
 * - Rich cell rendering with badges
 * - Quick action buttons
 */
export function CaseList({
  cases,
  selectedCases = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  loading = false,
  bulkActions = [],
  hasLoadedData = true,
}: CaseListProps) {
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-'
    return DATE_FORMATTER.format(new Date(dateString))
  }, [])

  const columns: DataTableColumn<Case>[] = useMemo(
    () => [
      {
        id: 'ticketnumber',
        header: 'Ticket #',
        accessorFn: (c) => c.ticketnumber || '-',
        sortable: true,
        filterable: true,
        filter: {
          type: 'text',
          operators: ['contains', 'equals', 'startsWith'],
          placeholder: 'Search ticket...',
        },
        cell: (c) => (
          <Link
            href={`/cases/${c.incidentid}`}
            className="font-mono text-sm font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
            prefetch={true}
          >
            {c.ticketnumber || '-'}
          </Link>
        ),
      },
      {
        id: 'title',
        header: 'Title',
        accessorFn: (c) => c.title,
        sortable: true,
        filterable: true,
        filter: {
          type: 'text',
          operators: ['contains', 'equals', 'startsWith'],
          placeholder: 'Search title...',
        },
        cell: (c) => (
          <div className="flex flex-col max-w-[300px]">
            <Link
              href={`/cases/${c.incidentid}`}
              className="font-medium hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
              prefetch={true}
            >
              {c.title}
            </Link>
            {c.description && (
              <span className="text-xs text-muted-foreground truncate">
                {c.description}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        accessorFn: (c) => c.customername || '-',
        sortable: true,
        filterable: true,
        filter: {
          type: 'text',
          operators: ['contains', 'equals'],
          placeholder: 'Search customer...',
        },
        cell: (c) => (
          <div className="flex items-center gap-2">
            {c.customerid_type === 'account' ? (
              <Building2 className="size-4 text-muted-foreground" />
            ) : (
              <User className="size-4 text-muted-foreground" />
            )}
            <span>{c.customername || '-'}</span>
          </div>
        ),
      },
      {
        id: 'priority',
        header: 'Priority',
        accessorFn: (c) => c.prioritycode,
        sortable: true,
        filterable: true,
        filter: {
          type: 'multiselect',
          options: [
            { label: 'High', value: CasePriorityCode.High, icon: AlertTriangle },
            { label: 'Normal', value: CasePriorityCode.Normal, icon: Minus },
            { label: 'Low', value: CasePriorityCode.Low, icon: ArrowDown },
          ],
        },
        cell: (c) => <CasePriorityBadge priority={c.prioritycode} />,
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (c) => c.statecode,
        sortable: true,
        filterable: true,
        filter: {
          type: 'multiselect',
          options: [
            { label: 'Active', value: CaseStateCode.Active },
            { label: 'Resolved', value: CaseStateCode.Resolved },
            { label: 'Cancelled', value: CaseStateCode.Cancelled },
          ],
        },
        cell: (c) => (
          <CaseStatusBadge statecode={c.statecode} statuscode={c.statuscode} />
        ),
      },
      {
        id: 'origin',
        header: 'Origin',
        accessorFn: (c) => c.caseorigincode,
        sortable: true,
        filterable: true,
        filter: {
          type: 'multiselect',
          options: [
            { label: 'Phone', value: CaseOriginCode.Phone, icon: Phone },
            { label: 'Email', value: CaseOriginCode.Email, icon: Mail },
            { label: 'Web', value: CaseOriginCode.Web, icon: Globe },
          ],
        },
        cell: (c) => <CaseOriginBadge origin={c.caseorigincode} />,
      },
      {
        id: 'type',
        header: 'Type',
        accessorFn: (c) => c.casetypecode,
        sortable: true,
        filterable: true,
        filter: {
          type: 'multiselect',
          options: [
            { label: 'Question', value: CaseTypeCode.Question, icon: HelpCircle },
            { label: 'Problem', value: CaseTypeCode.Problem, icon: AlertTriangle },
            { label: 'Request', value: CaseTypeCode.Request, icon: FileText },
          ],
        },
        cell: (c) => <CaseTypeBadge type={c.casetypecode} />,
      },
      {
        id: 'createdon',
        header: 'Created',
        accessorFn: (c) => (c.createdon ? new Date(c.createdon) : null),
        sortable: true,
        filterable: true,
        filter: {
          type: 'daterange',
          operators: ['equals', 'before', 'after', 'between'],
        },
        cell: (c) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(c.createdon)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        headerClassName: 'text-right',
        cell: (c) => (
          <div
            className="flex justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button asChild variant="ghost" size="icon-sm" title="View details">
              <Link href={`/cases/${c.incidentid}`} prefetch={true}>
                <Eye className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" title="Edit case">
              <Link href={`/cases/${c.incidentid}/edit`} prefetch={true}>
                <Edit className="size-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [formatDate]
  )

  const hasActiveFilters = filters && Object.keys(filters).length > 0

  const emptyState = useMemo(() => {
    if (!hasLoadedData || (cases.length === 0 && !hasActiveFilters)) {
      return (
        <EmptyState
          icon={Headphones}
          title="No cases yet"
          description="Start providing excellent customer support by creating your first case. Cases help you track and resolve customer issues efficiently."
          action={{
            href: '/cases/new',
            label: 'Create Your First Case',
            icon: Headphones,
          }}
          badge="Getting Started"
          suggestions={[
            'Create cases from incoming phone calls or emails',
            'Track issue resolution progress with status updates',
            'Link cases to customers for complete history',
            'Set priorities to ensure urgent issues are addressed first',
          ]}
          helpText="Pro tip: Categorizing cases by type and origin helps identify common issues and improve your products."
          size="large"
        />
      )
    }

    return (
      <EmptyState
        icon={Filter}
        title="No cases match your filters"
        description="Try adjusting your search criteria or filters to find what you're looking for."
        action={{
          href: '/cases/new',
          label: 'Create New Case',
          icon: Headphones,
        }}
        secondaryAction={{
          label: 'Clear All Filters',
          onClick: () => onFiltersChange?.({}),
          icon: Filter,
        }}
        suggestions={[
          'Broaden your search by removing some filters',
          'Check for typos in your search query',
          'Try searching by ticket number or customer name',
        ]}
        size="default"
      />
    )
  }, [hasLoadedData, cases.length, hasActiveFilters, onFiltersChange])

  return (
    <DataTableWithToolbar
      data={cases}
      columns={columns}
      getRowId={(c) => c.incidentid}
      enableRowSelection={!!onSelectionChange}
      selectedRows={selectedCases}
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

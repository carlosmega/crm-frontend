'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useInvoices } from '@/features/invoices/hooks/use-invoices'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { InvoiceCard } from '@/features/invoices/components/invoice-card'
import { InvoiceList } from '@/features/invoices/components/invoice-list'
import { InvoiceStateCode } from '@/core/contracts/enums'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, BarChart3, Download, Trash2, Loader2, WifiOff } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import {
  BulkAction,
  DataTableFilterSummary,
  type ActiveFilters,
} from '@/shared/components/data-table'

/**
 * Invoices Client Component
 *
 * Client-side interactivity for Invoices page:
 * - View toggle (table/cards)
 * - Search and filters
 * - Selection state
 */
export function InvoicesClient() {
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar invoices desde el hook (con cookies del navegador)
  const { data: invoices = [], isLoading, error } = useInvoices()

  // Debounce search query
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Filter invoices by search query and state
  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    // Filter by state
    if (filter !== 'all') {
      filtered = filtered.filter((i) => i.statecode === Number(filter))
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((i) =>
        `${i.name} ${i.invoicenumber} ${i.invoiceid}`
          .toLowerCase()
          .includes(lowerQuery)
      )
    }

    return filtered
  }, [invoices, filter, debouncedSearchQuery])

  // Bulk actions
  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: async (selectedIds: string[]) => {
        const selectedData = filteredInvoices.filter((inv) => selectedIds.includes(inv.invoiceid))
        const csv = [
          ['Invoice Number', 'Name', 'Amount', 'Balance', 'Due Date', 'Status'].join(','),
          ...selectedData.map((inv) =>
            [
              inv.invoicenumber || '',
              `"${inv.name || ''}"`,
              inv.totalamount || 0,
              inv.totalbalance ?? inv.totalamount,
              inv.duedate || '',
              inv.statecode,
            ].join(',')
          ),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      },
    },
  ], [filteredInvoices])

  // ✅ Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-1" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  INVOICES
                </p>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  Error
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <NotificationMenu />
              <UserMenu variant="icon" />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <PageHeader
            breadcrumbs={[
              { label: 'Sales', href: '/dashboard' },
              { label: 'Invoices' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Invoices"
            message={error instanceof Error ? error.message : 'Unable to connect to the server. Please check your network connection and try again.'}
            icon={WifiOff}
            onRetry={() => window.location.reload()}
            retryLabel="Retry"
            variant="full"
          />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                INVOICES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Invoices
              </h1>
            </div>
          </div>
          {/* RIGHT: Notifications + User */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Invoices' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
              <p className="text-muted-foreground">
                Manage invoices and payments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-muted-foreground">
                Invoices are generated from fulfilled orders
              </div>
              <Button variant="outline" asChild>
                <Link href="/invoices/aging">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Aging Report
                </Link>
              </Button>
              <Button asChild>
                <Link href="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices by name, number, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilter(value)
                  setSelectedInvoices([])
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value={InvoiceStateCode.Active.toString()}>Active</SelectItem>
                  <SelectItem value={InvoiceStateCode.Paid.toString()}>Paid</SelectItem>
                  <SelectItem value={InvoiceStateCode.Canceled.toString()}>Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <InvoiceList
            invoices={filteredInvoices}
            selectedInvoices={selectedInvoices}
            onSelectionChange={setSelectedInvoices}
            loading={false}
            bulkActions={bulkActions}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
          />
        </div>
      </div>
    </>
  )
}

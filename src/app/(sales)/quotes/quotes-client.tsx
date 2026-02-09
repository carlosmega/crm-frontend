'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuotes } from '@/features/quotes/hooks/use-quotes'
import { useDeleteQuote } from '@/features/quotes/hooks/use-quote-mutations'
import { QuoteCard } from '@/features/quotes/components/quote-card'
import { QuoteDataTable } from '@/features/quotes/components/quote-data-table'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, BarChart3, Layout, Download, Trash2, Loader2, WifiOff, MoreVertical } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import { QuoteStateCode } from '@/core/contracts/enums'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import type { Quote } from '@/core/contracts/entities'
import { BulkAction, type ActiveFilters } from '@/shared/components/data-table'

export function QuotesClient() {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar quotes desde el hook (con cookies del navegador)
  const { data: quotes = [], isLoading, error } = useQuotes()

  const { mutate: deleteQuote } = useDeleteQuote()

  // Debounce search query
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Filter quotes by search query
  const filteredQuotes = useMemo(() => {
    let result = quotes

    // Filter by state
    if (filter !== 'all') {
      const stateCode = Number(filter) as QuoteStateCode
      result = result.filter((q) => q.statecode === stateCode)
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase()
      result = result.filter((q) =>
        `${q.name} ${q.quotenumber} ${q.description || ''}`
          .toLowerCase()
          .includes(lowerQuery)
      )
    }

    return result
  }, [quotes, filter, debouncedSearchQuery])

  // Handle single quote deletion
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      deleteQuote(id)
    }
  }, [deleteQuote])

  // Handle filter change (client-side filtering)
  const handleFilterChange = (value: string) => {
    setFilter(value)
    setSelectedQuotes([])
  }

  // Bulk actions
  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: async (selectedIds: string[]) => {
        const selectedIdSet = new Set(selectedIds)
        const selectedData = filteredQuotes.filter((q) => selectedIdSet.has(q.quoteid))
        const csv = [
          ['Quote Number', 'Name', 'Customer', 'Amount', 'Valid Until', 'State'].join(','),
          ...selectedData.map((q) =>
            [
              q.quotenumber || '',
              `"${q.name || ''}"`,
              q.customerid || '',
              q.totalamount || 0,
              q.effectiveto || '',
              q.statecode,
            ].join(',')
          ),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'outline',
      destructive: true,
      confirmMessage: 'Are you sure you want to delete the selected quotes? This action cannot be undone.',
      onClick: async (selectedIds: string[]) => {
        try {
          await Promise.all(selectedIds.map(id => deleteQuote(id)))
          setSelectedQuotes([])
        } catch (error) {
          console.error('Failed to delete quotes:', error)
        }
      },
    },
  ], [filteredQuotes, deleteQuote])

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
                  QUOTES
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
              { label: 'Quotes' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Quotes"
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
          {/* LEFT: Hamburger Menu + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                QUOTES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Quotes
              </h1>
            </div>
          </div>

          {/* RIGHT: Notifications + User + Actions Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/quotes/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Quote
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/quotes/templates" className="flex items-center cursor-pointer">
                    <Layout className="mr-2 h-4 w-4" />
                    Templates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/quotes/analytics" className="flex items-center cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Quotes' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Quotes</h2>
              <p className="text-muted-foreground">
                Manage your sales quotations and proposals
              </p>
            </div>
            <div className="hidden md:flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/quotes/templates">
                  <Layout className="mr-2 h-4 w-4" />
                  Templates
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/quotes/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/quotes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Quote
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
                  placeholder="Search quotes by name, number, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quotes</SelectItem>
                  <SelectItem value={QuoteStateCode.Draft.toString()}>Draft</SelectItem>
                  <SelectItem value={QuoteStateCode.Active.toString()}>Active</SelectItem>
                  <SelectItem value={QuoteStateCode.Won.toString()}>Won</SelectItem>
                  <SelectItem value={QuoteStateCode.Closed.toString()}>Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <QuoteDataTable
            quotes={filteredQuotes}
            selectedQuotes={selectedQuotes}
            onSelectionChange={setSelectedQuotes}
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

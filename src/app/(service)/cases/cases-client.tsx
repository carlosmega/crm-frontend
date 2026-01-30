"use client"

import { useState, useMemo, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCases } from '@/features/cases/hooks/use-cases'
import { useCaseMutations } from '@/features/cases/hooks/use-case-mutations'
import { CaseList } from '@/features/cases/components/case-list'
import {
  BulkAction,
  DataTableFilterSummary,
  type ActiveFilters,
} from '@/shared/components/data-table'
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
import {
  Plus,
  Search,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  WifiOff,
  MoreVertical,
  Headphones,
} from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import type { Case } from '@/core/contracts'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

export function CasesClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  const { cases, loading, error, refetch } = useCases()
  const [isPending, startTransition] = useTransition()
  const { deleteCase } = useCaseMutations()

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  const filteredCases = useMemo(() => {
    if (!debouncedSearchQuery) return cases

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.ticketnumber?.toLowerCase().includes(lowerQuery) ||
        c.customername?.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery)
    )
  }, [cases, debouncedSearchQuery])

  const getCaseColumns = () => [
    { id: 'ticketnumber', header: 'Ticket #', filter: { type: 'text' as const } },
    { id: 'title', header: 'Title', filter: { type: 'text' as const } },
    { id: 'customer', header: 'Customer', filter: { type: 'text' as const } },
    { id: 'priority', header: 'Priority', filter: { type: 'multiselect' as const } },
    { id: 'status', header: 'Status', filter: { type: 'multiselect' as const } },
    { id: 'origin', header: 'Origin', filter: { type: 'multiselect' as const } },
    { id: 'createdon', header: 'Created', filter: { type: 'daterange' as const } },
  ]

  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm('Are you sure you want to delete this case?')) {
        try {
          await deleteCase(id)
          router.refresh()
        } catch (error) {
          console.error('Failed to delete case:', error)
        }
      }
    },
    [deleteCase, router]
  )

  const bulkActions: BulkAction[] = useMemo(
    () => [
      {
        id: 'export-selected',
        label: 'Export',
        icon: Download,
        variant: 'outline',
        onClick: async (selectedIds: string[]) => {
          const selectedData = cases.filter((c) =>
            selectedIds.includes(c.incidentid)
          )
          const csv = [
            ['Ticket #', 'Title', 'Customer', 'Priority', 'Status'].join(','),
            ...selectedData.map((c) =>
              [
                c.ticketnumber || '',
                c.title,
                c.customername || '',
                c.prioritycode,
                c.statecode,
              ].join(',')
            ),
          ].join('\n')

          const blob = new Blob([csv], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `cases-export-${new Date().toISOString()}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
        },
      },
      {
        id: 'delete-selected',
        label: 'Delete',
        icon: Trash2,
        variant: 'outline',
        destructive: true,
        confirmMessage:
          'Are you sure you want to delete the selected cases? This action cannot be undone.',
        onClick: async (selectedIds: string[]) => {
          try {
            await Promise.all(selectedIds.map((id) => deleteCase(id)))
            setSelectedCases([])
            router.refresh()
          } catch (error) {
            console.error('Failed to delete cases:', error)
          }
        },
      },
    ],
    [deleteCase, cases, router]
  )

  const handleFilterChange = useCallback(
    (value: string) => {
      startTransition(() => {
        router.push(`/cases?status=${value}`)
      })
    },
    [router]
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    const isNetworkError =
      error.toLowerCase().includes('network') ||
      error.toLowerCase().includes('fetch')
    const isAuthError =
      error.toLowerCase().includes('auth') ||
      error.toLowerCase().includes('unauthorized')
    const isServerError =
      error.toLowerCase().includes('500') ||
      error.toLowerCase().includes('server')

    let errorTitle = 'Failed to Load Cases'
    let errorMessage = error
    let errorIcon = AlertCircle
    let errorCode = 'ERR_UNKNOWN'

    if (isNetworkError) {
      errorTitle = 'Connection Problem'
      errorMessage =
        'Unable to connect to the server. Please check your network connection and try again.'
      errorIcon = WifiOff
      errorCode = 'ERR_NETWORK'
    } else if (isAuthError) {
      errorTitle = 'Authentication Required'
      errorMessage =
        'Your session may have expired. Please log in again to continue accessing your cases.'
      errorCode = 'ERR_AUTH'
    } else if (isServerError) {
      errorTitle = 'Server Error'
      errorMessage =
        'The server encountered an error while processing your request. Our team has been notified.'
      errorCode = 'ERR_SERVER'
    }

    return (
      <>
        <header className="md:hidden sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-1" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  CASES
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

        <div className="hidden md:block">
          <PageHeader
            breadcrumbs={[
              { label: 'Service', href: '/dashboard' },
              { label: 'Cases' },
            ]}
          />
        </div>

        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title={errorTitle}
            message={errorMessage}
            icon={errorIcon}
            onRetry={refetch}
            retryLabel="Try Again"
            variant="full"
            errorCode={errorCode}
            showHelpActions={!isNetworkError}
            secondaryAction={{
              label: 'Go to Dashboard',
              href: '/dashboard',
            }}
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
                CASES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Cases
              </h1>
            </div>
          </div>

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
                  <Link
                    href="/cases/new"
                    className="flex items-center cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Case
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
            { label: 'Service', href: '/dashboard' },
            { label: 'Cases' },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Cases</h2>
              <p className="text-muted-foreground">
                Track and resolve customer support requests
              </p>
            </div>
            <Button
              asChild
              className="hidden md:flex bg-purple-600 hover:bg-purple-700"
            >
              <Link href="/cases/new">
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search cases by title, ticket # or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                defaultValue="all"
                onValueChange={handleFilterChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Resolved</SelectItem>
                  <SelectItem value="2">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={getCaseColumns()}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pb-4">
          <CaseList
            cases={filteredCases}
            selectedCases={selectedCases}
            onSelectionChange={setSelectedCases}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
            hasLoadedData={cases.length > 0}
          />
        </div>
      </div>
    </>
  )
}

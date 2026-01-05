"use client"

import { useState, useMemo, useCallback, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useLeadMutations } from '@/features/leads/hooks/use-lead-mutations'
import { LeadList } from '@/features/leads/components/lead-list'
import {
  BulkAction,
  DataTableFilterSummary,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Plus, Search, Trash2, Download, UserPlus, Loader2, AlertCircle, WifiOff, MoreVertical } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import type { Lead } from '@/core/contracts'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useRouter } from 'next/navigation'

export function LeadsClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar leads desde el hook (con cookies del navegador)
  const { leads, loading, error, refetch } = useLeads()

  // ✅ OPTIMIZACIÓN: useTransition para navegación no-bloqueante
  // Permite que la UI permanezca responsive durante cambios de filtro
  const [isPending, startTransition] = useTransition()

  const { deleteLead } = useLeadMutations()

  // Debounce search query to prevent filtering on every keystroke
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Filter leads by search query (client-side filtering)
  const filteredLeads = useMemo(() => {
    if (!debouncedSearchQuery) return leads

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return leads.filter((lead) =>
      `${lead.firstname} ${lead.lastname} ${lead.companyname} ${lead.emailaddress1}`
        .toLowerCase()
        .includes(lowerQuery)
    )
  }, [leads, debouncedSearchQuery])

  // Get column definitions for filter summary
  const getLeadColumns = () => [
    { id: 'name', header: 'Name', filter: { type: 'text' as const } },
    { id: 'company', header: 'Company', filter: { type: 'text' as const } },
    { id: 'source', header: 'Source', filter: { type: 'multiselect' as const } },
    { id: 'quality', header: 'Quality', filter: { type: 'multiselect' as const } },
    { id: 'status', header: 'Status', filter: { type: 'multiselect' as const } },
    { id: 'value', header: 'Est. Value', filter: { type: 'number' as const } },
    { id: 'closeDate', header: 'Est. Close', filter: { type: 'daterange' as const } },
  ]

  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id)
        router.refresh() // Refresh server data
      } catch (error) {
        console.error('Failed to delete lead:', error)
      }
    }
  }, [deleteLead, router])

  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'export-selected',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: async (selectedIds: string[]) => {
        const selectedData = leads.filter(lead =>
          selectedIds.includes(lead.leadid)
        )
        const csv = [
          ['Name', 'Company', 'Email', 'Phone'].join(','),
          ...selectedData.map(lead =>
            [
              `${lead.firstname} ${lead.lastname}`,
              lead.companyname || '',
              lead.emailaddress1 || '',
              lead.telephone1 || '',
            ].join(',')
          ),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-export-${new Date().toISOString()}.csv`
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
      confirmMessage: 'Are you sure you want to delete the selected leads? This action cannot be undone.',
      onClick: async (selectedIds: string[]) => {
        try {
          await Promise.all(selectedIds.map(id => deleteLead(id)))
          setSelectedLeads([])
          router.refresh()
        } catch (error) {
          console.error('Failed to delete leads:', error)
        }
      },
    },
  ], [deleteLead, leads, router])

  const handleFilterChange = useCallback((value: string) => {
    // ✅ OPTIMIZACIÓN: Wrap navigation en startTransition
    // UI no se bloquea durante la navegación
    startTransition(() => {
      router.push(`/leads?status=${value}`)
    })
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    // Determine error type and customize message
    const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')
    const isAuthError = error.toLowerCase().includes('auth') || error.toLowerCase().includes('unauthorized')
    const isServerError = error.toLowerCase().includes('500') || error.toLowerCase().includes('server')

    let errorTitle = 'Failed to Load Leads'
    let errorMessage = error
    let errorIcon = AlertCircle
    let errorCode = 'ERR_UNKNOWN'

    if (isNetworkError) {
      errorTitle = 'Connection Problem'
      errorMessage = 'Unable to connect to the server. Please check your network connection and try again.'
      errorIcon = WifiOff
      errorCode = 'ERR_NETWORK'
    } else if (isAuthError) {
      errorTitle = 'Authentication Required'
      errorMessage = 'Your session may have expired. Please log in again to continue accessing your leads.'
      errorCode = 'ERR_AUTH'
    } else if (isServerError) {
      errorTitle = 'Server Error'
      errorMessage = 'The server encountered an error while processing your request. Our team has been notified.'
      errorCode = 'ERR_SERVER'
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
                  LEADS
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
              { label: 'Leads' }
            ]}
          />
        </div>

        {/* Error state content */}
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
              href: '/dashboard'
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
          {/* LEFT: Hamburger Menu + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                LEADS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Leads
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
                  <Link href="/leads/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Lead
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
            { label: 'Leads' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">{/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
              <p className="text-muted-foreground">
                Manage your potential customers and opportunities
              </p>
            </div>
            <Button asChild className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Link href="/leads/new">
                <Plus className="mr-2 h-4 w-4" />
                New Lead
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, company or email..."
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
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="0">Open</SelectItem>
                  <SelectItem value="1">Qualified</SelectItem>
                  <SelectItem value="2">Disqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary inside search card */}
            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={getLeadColumns()}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <LeadList
            leads={filteredLeads}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
            hasLoadedData={leads.length > 0}
          />
        </div>
      </div>
    </>
  )
}

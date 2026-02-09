"use client"

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOpportunities } from '@/features/opportunities/hooks/use-opportunities'
import { useOpportunityMutations } from '@/features/opportunities/hooks/use-opportunity-mutations'
import { OpportunityList } from '@/features/opportunities/components/opportunity-list'
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
import { Plus, Search, List, Download, Trash2, UserPlus, Kanban as KanbanIcon, Loader2, AlertCircle, WifiOff, MoreVertical } from 'lucide-react'
import { OpportunityStateCode } from '@/core/contracts'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import type { Opportunity } from '@/core/contracts/entities'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/shared/components/error-state'

// ✅ PERFORMANCE: Dynamic import para OpportunityKanban (solo carga cuando view === 'kanban')
const OpportunityKanban = dynamic(
  () => import('@/features/opportunities/components').then(mod => ({ default: mod.OpportunityKanban })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[calc(100vh-200px)] w-full rounded-lg" />,
  }
)

export function OpportunitiesClient() {
  const router = useRouter()
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar opportunities desde el hook (con cookies del navegador)
  const { opportunities, loading, error, refetch } = useOpportunities()

  // Mock customer names (TODO: fetch real customer names from Account/Contact services)
  const customerNames = useMemo(() => {
    const names: Record<string, string> = {}
    opportunities.forEach((opp) => {
      // Verificar que customerid exista antes de usarlo
      if (opp.customerid) {
        names[opp.customerid] = opp.customeridtype === 'account'
          ? `Account ${opp.customerid.substring(0, 8)}`
          : `Contact ${opp.customerid.substring(0, 8)}`
      }
    })
    return names
  }, [opportunities])

  const { deleteOpportunity } = useOpportunityMutations()

  // Debounce search query to prevent filtering on every keystroke
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Filter opportunities by search query
  // Memoized to prevent recalculation on every render
  const filteredOpportunities = useMemo(() => {
    if (!debouncedSearchQuery) return opportunities

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return opportunities.filter((opp) =>
      `${opp.name} ${opp.customerid} ${opp.description}`
        .toLowerCase()
        .includes(lowerQuery)
    )
  }, [opportunities, debouncedSearchQuery])

  // Get column definitions for filter summary
  const getOpportunityColumns = () => [
    { id: 'name', header: 'Name', filter: { type: 'text' as const } },
    { id: 'customer', header: 'Customer', filter: { type: 'text' as const } },
    { id: 'stage', header: 'Sales Stage', filter: { type: 'multiselect' as const } },
    { id: 'probability', header: 'Probability', filter: { type: 'number' as const } },
    { id: 'estimatedValue', header: 'Est. Value', filter: { type: 'number' as const } },
    { id: 'closeDate', header: 'Est. Close', filter: { type: 'daterange' as const } },
    { id: 'status', header: 'Status', filter: { type: 'multiselect' as const } },
  ]

  // Handle clear individual filter
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  // Handle single opportunity deletion (from card view)
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity(id)
        router.refresh()
      } catch (error) {
        console.error('Error deleting opportunity:', error)
      }
    }
  }, [deleteOpportunity, router])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map((id) => deleteOpportunity(id)))
      setSelectedOpportunities([])
      router.refresh()
    } catch (error) {
      console.error('Error deleting opportunities:', error)
      toast.error('Failed to delete some opportunities. Please try again.')
    }
  }, [deleteOpportunity, router])

  // Handle bulk export
  const handleBulkExport = useCallback(async (selectedIds: string[]) => {
    const selectedOpportunitiesData = opportunities.filter((opp) =>
      selectedIds.includes(opp.opportunityid)
    )

    // Convert to CSV
    const headers = ['Name', 'Customer', 'Sales Stage', 'Probability', 'Est. Value', 'Est. Close', 'Status']
    const csvContent = [
      headers.join(','),
      ...selectedOpportunitiesData.map((opp) =>
        [
          `"${opp.name}"`,
          `"${opp.customerid}"`,
          opp.salesstage,
          opp.closeprobability,
          opp.estimatedvalue || 0,
          opp.estimatedclosedate,
          opp.statecode,
        ].join(',')
      ),
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `opportunities-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [opportunities])

  // Handle bulk assign
  const handleBulkAssign = useCallback(async (selectedIds: string[]) => {
    toast.info(`Assign ${selectedIds.length} opportunities to a user (feature not yet implemented)`)
  }, [])

  // Define bulk actions
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: handleBulkExport,
      variant: 'outline',
    },
    {
      id: 'assign',
      label: 'Assign',
      icon: UserPlus,
      onClick: handleBulkAssign,
      variant: 'outline',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: handleBulkDelete,
      variant: 'outline',
      destructive: true,
      confirmMessage: 'Are you sure you want to delete the selected opportunities? This action cannot be undone.',
    },
  ], [handleBulkExport, handleBulkAssign, handleBulkDelete])

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value)
    setSelectedOpportunities([])
    setColumnFilters({})

    // Navigate to update server state
    const params = new URLSearchParams()
    if (value !== 'all') {
      params.set('state', value)
    }
    const queryString = params.toString()
    router.push(`/opportunities${queryString ? `?${queryString}` : ''}`)
  }

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
    return (
      <>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-1" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  OPPORTUNITIES
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
              { label: 'Opportunities' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Opportunities"
            message={error || 'Unable to connect to the server. Please check your network connection and try again.'}
            icon={WifiOff}
            onRetry={refetch}
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
                OPPORTUNITIES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Opportunities
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
                  <Link href="/opportunities/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Opportunity
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
            { label: 'Opportunities' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Opportunities</h2>
              <p className="text-muted-foreground">
                Manage your sales pipeline and track opportunities
              </p>
            </div>
            <Button asChild className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Link href="/opportunities/new">
                <Plus className="mr-2 h-4 w-4" />
                New Opportunity
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
                placeholder="Search opportunities by name, customer, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Opportunities</SelectItem>
                <SelectItem value={OpportunityStateCode.Open.toString()}>Open</SelectItem>
                <SelectItem value={OpportunityStateCode.Won.toString()}>Won</SelectItem>
                <SelectItem value={OpportunityStateCode.Lost.toString()}>Lost</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {/* View toggle buttons */}
              <Button
                variant={view === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('table')}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'kanban' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('kanban')}
                title="Kanban view"
              >
                <KanbanIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Summary inside search card */}
          {view === 'table' && Object.keys(columnFilters).length > 0 && (
            <DataTableFilterSummary
              filters={columnFilters}
              columns={getOpportunityColumns()}
              onRemoveFilter={handleRemoveFilter}
              onClearAllFilters={handleClearAllFilters}
            />
          )}
          </div>
        </div>

        {/* Content Container */}
        <div className="px-4 pb-4">
          {view === 'table' ? (
            <OpportunityList
              opportunities={filteredOpportunities}
              selectedOpportunities={selectedOpportunities}
              onSelectionChange={setSelectedOpportunities}
              filters={columnFilters}
              onFiltersChange={setColumnFilters}
              loading={false}
              bulkActions={bulkActions}
              hasLoadedData={opportunities.length > 0}
            />
          ) : (
            <OpportunityKanban
              opportunities={filteredOpportunities}
              customerNames={customerNames}
              onRefetch={() => router.refresh()}
            />
          )}
        </div>
      </div>
    </>
  )
}

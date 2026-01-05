"use client"

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Account } from '@/core/contracts'
import { AccountStateCode } from '@/core/contracts'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useAccounts } from '@/features/accounts/hooks/use-accounts'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountList } from '@/features/accounts/components/account-list'
import {
  DataTableWithToolbar,
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
import { Plus, Search, Trash2, Download, UserPlus, Loader2, AlertCircle, WifiOff, MoreVertical } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'

export function AccountsClient() {
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar accounts desde el hook (con cookies del navegador)
  const { accounts, loading, error, refetch } = useAccounts()
  const { deleteAccount } = useAccountMutations()

  // ✅ Performance: Debounce search query to prevent filtering on every keystroke
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // ✅ Optimized: Filter by status
  const statusFilteredAccounts = useMemo(() => {
    if (filter === 'all') return accounts
    return accounts.filter(account => account.statecode === Number(filter))
  }, [accounts, filter])

  // ✅ Optimized: Filter by search query
  const filteredAccounts = useMemo(() => {
    if (!debouncedSearchQuery) return statusFilteredAccounts

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return statusFilteredAccounts.filter((account) =>
      `${account.name} ${account.emailaddress1} ${account.telephone1}`
        .toLowerCase()
        .includes(lowerQuery)
    )
  }, [statusFilteredAccounts, debouncedSearchQuery])

  // ✅ Optimized: Column definitions
  const accountColumns = useMemo(() => [
    { id: 'name', header: 'Account Name', filter: { type: 'text' as const } },
    { id: 'industry', header: 'Industry', filter: { type: 'multiselect' as const } },
    { id: 'category', header: 'Category', filter: { type: 'multiselect' as const } },
    { id: 'revenue', header: 'Revenue', filter: { type: 'number' as const } },
    { id: 'employees', header: 'Employees', filter: { type: 'number' as const } },
  ], [])

  // ✅ Optimized with useCallback
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  // ✅ Optimized with useCallback
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  // ✅ Optimized with useCallback
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id)
        // Refetch to update list
        refetch()
      } catch (error) {
        console.error('Error deleting account:', error)
      }
    }
  }, [deleteAccount, refetch])

  // ✅ Optimized with useCallback
  const handleBulkDelete = useCallback(async (selectedIds: string[]) => {
    try {
      await Promise.all(selectedIds.map((id) => deleteAccount(id)))

      // Refetch to update list and clear selection
      refetch()
      setSelectedAccounts([])
    } catch (error) {
      console.error('Error deleting accounts:', error)
      alert('Failed to delete some accounts. Please try again.')
    }
  }, [deleteAccount, refetch])

  // ✅ Optimized with useCallback
  const handleBulkExport = useCallback(async (selectedIds: string[]) => {
    const selectedAccountsData = accounts.filter((account) => selectedIds.includes(account.accountid))

    const headers = ['Account Name', 'Email', 'Phone', 'Industry', 'Revenue', 'Employees']
    const csvContent = [
      headers.join(','),
      ...selectedAccountsData.map((account) =>
        [
          `"${account.name || ''}"`,
          `"${account.emailaddress1 || ''}"`,
          `"${account.telephone1 || ''}"`,
          account.industrycode || '',
          account.revenue || 0,
          account.numberofemployees || 0,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `accounts-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [accounts])

  // ✅ Optimized with useCallback
  const handleBulkAssign = useCallback(async (selectedIds: string[]) => {
    alert(`Assign ${selectedIds.length} accounts to a user (feature not yet implemented)`)
  }, [])

  // ✅ Optimized: Define bulk actions
  const bulkActions = useMemo<BulkAction[]>(() => [
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
      confirmMessage: 'Are you sure you want to delete the selected accounts? This action cannot be undone.',
    },
  ], [handleBulkExport, handleBulkAssign, handleBulkDelete])

  // ✅ Manejo de estados de carga y error
  if (loading) {
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
                  ACCOUNTS
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
              { label: 'Accounts' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Accounts"
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
                ACCOUNTS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Accounts
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
                  <Link href="/accounts/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Account
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
            { label: 'Accounts' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">{/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
              <p className="text-muted-foreground">
                Manage your business accounts and organizations
              </p>
            </div>
            <Button asChild className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Link href="/accounts/new">
                <Plus className="mr-2 h-4 w-4" />
                New Account
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
                  placeholder="Search accounts by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilter(value)
                  setSelectedAccounts([])
                  setColumnFilters({})
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value={AccountStateCode.Active.toString()}>Active</SelectItem>
                  <SelectItem value={AccountStateCode.Inactive.toString()}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary inside search card */}
            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={accountColumns}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <AccountList
            accounts={filteredAccounts}
            selectedAccounts={selectedAccounts}
            onSelectionChange={setSelectedAccounts}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
            hasLoadedData={accounts.length > 0}
          />
        </div>
      </div>
    </>
  )
}

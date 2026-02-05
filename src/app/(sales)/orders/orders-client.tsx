'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useOrders } from '@/features/orders/hooks/use-orders'
import type { Order } from '@/core/contracts/entities/order'
import { OrderCard } from '@/features/orders/components/order-card'
import { OrderDataTable } from '@/features/orders/components/order-data-table'
import { OrderStateCode } from '@/core/contracts/enums'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { BulkAction, type ActiveFilters } from '@/shared/components/data-table'
import { Download, Loader2, WifiOff, Search } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
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
import { MoreVertical } from 'lucide-react'

/**
 * Orders Client Component
 *
 * Client-side interactivity for Orders page:
 * - View toggle (table/cards)
 * - Search and filters
 * - Selection state
 */
export function OrdersClient() {
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  // ✅ Cargar orders desde el hook (con cookies del navegador)
  const { data: orders = [], isLoading, error } = useOrders()

  // Debounce search query
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // Filter orders by search query and state
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filter by state
    if (filter !== 'all') {
      filtered = filtered.filter((o) => o.statecode === Number(filter))
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((o) =>
        `${o.name} ${o.ordernumber} ${o.description || ''}`
          .toLowerCase()
          .includes(lowerQuery)
      )
    }

    return filtered
  }, [orders, filter, debouncedSearchQuery])

  // Bulk actions
  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      variant: 'outline',
      onClick: async (selectedIds: string[]) => {
        const selectedData = filteredOrders.filter((o) => selectedIds.includes(o.salesorderid))
        const csv = [
          ['Order Number', 'Name', 'Customer', 'Amount', 'Delivery Date', 'Status'].join(','),
          ...selectedData.map((o) =>
            [
              o.ordernumber || '',
              `"${o.name || ''}"`,
              o.customerid || '',
              o.totalamount || 0,
              o.requestdeliveryby || '',
              o.statecode,
            ].join(',')
          ),
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      },
    },
  ], [filteredOrders])

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
                  ORDERS
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
              { label: 'Orders' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Orders"
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
                ORDERS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Orders
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
            { label: 'Orders' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
              <p className="text-muted-foreground">
                Manage sales orders and fulfillment
              </p>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Orders are typically generated from won quotes
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
                  placeholder="Search orders by name, number, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value) => {
                  setFilter(value)
                  setSelectedOrders([])
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value={OrderStateCode.Active.toString()}>Active</SelectItem>
                  <SelectItem value={OrderStateCode.Submitted.toString()}>Submitted</SelectItem>
                  <SelectItem value={OrderStateCode.Fulfilled.toString()}>Fulfilled</SelectItem>
                  <SelectItem value={OrderStateCode.Invoiced.toString()}>Invoiced</SelectItem>
                  <SelectItem value={OrderStateCode.Canceled.toString()}>Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <OrderDataTable
            orders={filteredOrders}
            selectedOrders={selectedOrders}
            onSelectionChange={setSelectedOrders}
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

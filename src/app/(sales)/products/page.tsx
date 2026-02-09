"use client"

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useProducts } from '@/features/products/hooks/use-products'
import { useProductMutations } from '@/features/products/hooks/use-product-mutations'
import { ProductList } from '@/features/products/components/product-list'
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
  Download,
  Trash2,
  Loader2,
  WifiOff,
  MoreVertical,
} from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

export default function ProductsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  const filterActive =
    filter === 'all' ? undefined : filter === 'active' ? true : false

  const { products, loading, error, refetch } = useProducts(filterActive)
  const { deleteProduct, bulkDelete } = useProductMutations()

  // ✅ Performance: Debounce search query
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // ✅ Optimized: Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchQuery) return products

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return products.filter((product) =>
      `${product.name} ${product.productnumber} ${product.description}`
        .toLowerCase()
        .includes(lowerQuery)
    )
  }, [products, debouncedSearchQuery])

  // ✅ Optimized: Column definitions
  const productColumns = useMemo(() => [
    { id: 'name', header: 'Product Name', filter: { type: 'text' as const } },
    { id: 'price', header: 'Price', filter: { type: 'number' as const } },
    { id: 'cost', header: 'Cost', filter: { type: 'number' as const } },
    { id: 'margin', header: 'Margin', filter: { type: 'number' as const } },
    { id: 'inventory', header: 'Inventory', filter: { type: 'number' as const } },
    { id: 'status', header: 'Status', filter: { type: 'multiselect' as const } },
  ], [])

  // ✅ Optimized with useCallback
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => {
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
  const handleBulkDelete = useCallback(
    async (selectedIds: string[]) => {
      try {
        await bulkDelete(selectedIds)
        setSelectedProducts([])
        refetch()
      } catch (error) {
        console.error('Error deleting products:', error)
        toast.error('Failed to delete some products. Please try again.')
      }
    },
    [bulkDelete, refetch]
  )

  // ✅ Optimized with useCallback
  const handleBulkExport = useCallback(
    async (selectedIds: string[]) => {
      const selectedProductsData = products.filter((product) =>
        selectedIds.includes(product.productid)
      )

      const headers = [
        'Name',
        'SKU',
        'Description',
        'Price',
        'Cost',
        'Quantity',
        'Status',
      ]
      const csvContent = [
        headers.join(','),
        ...selectedProductsData.map((product) =>
          [
            `"${product.name}"`,
            `"${product.productnumber || ''}"`,
            `"${product.description || ''}"`,
            product.price || 0,
            product.standardcost || 0,
            product.quantityonhand || 0,
            product.statecode === 0 ? 'Active' : 'Inactive',
          ].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `products-export-${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [products]
  )

  // ✅ Optimized: Define bulk actions
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        id: 'export',
        label: 'Export',
        icon: Download,
        onClick: handleBulkExport,
        variant: 'outline',
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        onClick: handleBulkDelete,
        variant: 'outline',
        destructive: true,
        confirmMessage:
          'Are you sure you want to delete the selected products? This action cannot be undone.',
      },
    ],
    [handleBulkExport, handleBulkDelete]
  )

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
                  PRODUCTS
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
              { label: 'Products' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Products"
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
                PRODUCTS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Products
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
                  <Link href="/products/new" className="flex items-center cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Product
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
            { label: 'Products' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Products</h2>
              <p className="text-muted-foreground">
                Manage your product catalog and inventory
              </p>
            </div>
            <Button asChild className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Link href="/products/new">
                <Plus className="mr-2 h-4 w-4" />
                New Product
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
                  placeholder="Search products by name, SKU, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filter}
                onValueChange={(value: any) => {
                  setFilter(value)
                  setSelectedProducts([])
                  setColumnFilters({})
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="active">Active Products</SelectItem>
                  <SelectItem value="inactive">Inactive Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary inside search card */}
            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={productColumns}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <ProductList
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
          />
        </div>
      </div>
    </>
  )
}

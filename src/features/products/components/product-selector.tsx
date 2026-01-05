"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Product } from '../types'
import { useProducts, useProductSearch } from '../hooks/use-products'
import { Search, Package, Check, Loader2 } from 'lucide-react'

interface ProductSelectorProps {
  onSelect: (product: Product) => void
  selectedProductIds?: string[]
  trigger?: React.ReactNode
  disabled?: boolean
}

/**
 * Product Selector Component
 *
 * CRITICAL COMPONENT: Used in Quote Lines Editor, Order Lines, Invoice Lines
 *
 * Features:
 * - Search products by name or SKU
 * - Shows price, cost, and inventory
 * - Modal dialog interface
 * - Filters out already selected products
 */
export function ProductSelector({
  onSelect,
  selectedProductIds = [],
  trigger,
  disabled = false,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { products: allProducts, loading: loadingAll } = useProducts(true) // Only active products
  const { results: searchResults, loading: loadingSearch, search } = useProductSearch()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery)
    }
  }, [debouncedQuery])

  // Filter products
  const displayProducts = searchQuery.trim()
    ? searchResults.filter((p) => !selectedProductIds.includes(p.productid))
    : allProducts.filter((p) => !selectedProductIds.includes(p.productid))

  const isLoading = searchQuery.trim() ? loadingSearch : loadingAll

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleSelectProduct = (product: Product) => {
    onSelect(product)
    setOpen(false)
    setSearchQuery('') // Reset search
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" disabled={disabled}>
            <Package className="size-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Search and select products to add to the line items
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <Separator />

        {/* Product List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading products...</span>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Package className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term' : 'Create a new product to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayProducts.map((product) => (
                <ProductSelectorItem
                  key={product.productid}
                  product={product}
                  onSelect={handleSelectProduct}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} available
          </span>
          {selectedProductIds.length > 0 && (
            <span>{selectedProductIds.length} already selected</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Individual Product Item in Selector
 */
interface ProductSelectorItemProps {
  product: Product
  onSelect: (product: Product) => void
  formatCurrency: (value?: number) => string
}

function ProductSelectorItem({ product, onSelect, formatCurrency }: ProductSelectorItemProps) {
  const hasInventory = product.quantityonhand !== undefined
  const isLowStock = hasInventory && product.quantityonhand! < 10 && product.quantityonhand! > 0
  const isOutOfStock = hasInventory && product.quantityonhand! === 0

  return (
    <Button
      variant="ghost"
      className="w-full h-auto p-4 justify-start text-left hover:bg-accent"
      onClick={() => onSelect(product)}
    >
      <div className="flex-1 min-w-0 space-y-2">
        {/* Product Name & SKU */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{product.name}</p>
            {product.productnumber && (
              <p className="text-xs text-muted-foreground font-mono">
                SKU: {product.productnumber}
              </p>
            )}
          </div>
          <Check className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Price, Cost, Inventory */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
          </div>

          {/* Cost */}
          {product.standardcost !== undefined && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Cost</span>
              <span className="text-sm">{formatCurrency(product.standardcost)}</span>
            </div>
          )}

          {/* Margin */}
          {product.price && product.standardcost && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Margin</span>
              <span className="text-sm font-medium text-green-600">
                {(((product.price - product.standardcost) / product.price) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Inventory */}
          {hasInventory && (
            <div className="flex items-center gap-1">
              <Package className="size-3 text-muted-foreground" />
              <span className="text-sm">{product.quantityonhand}</span>
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs ml-1">
                  Out of Stock
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="outline" className="text-xs text-orange-600 ml-1">
                  Low Stock
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Button>
  )
}

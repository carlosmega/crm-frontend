'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/features/products/hooks/use-products'
import type { Product } from '@/core/contracts/entities/product'
import { formatCurrency } from '../utils/quote-calculations'
import { Search, Package, CheckCircle } from 'lucide-react'

interface ProductSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: Product) => void
}

/**
 * Product Selector Dialog
 *
 * Diálogo para buscar y seleccionar productos del catálogo
 */
export function ProductSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: ProductSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { products = [], loading: isLoading } = useProducts()

  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return product.statecode === 0 // Only active
    const query = searchQuery.toLowerCase()
    return (
      product.statecode === 0 &&
      (product.name.toLowerCase().includes(query) ||
        product.productnumber?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query))
    )
  })

  const handleSelect = (product: Product) => {
    onSelect(product)
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Search and select a product from the catalog to add to this quote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading products...
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.productid}
                      onClick={() => handleSelect(product)}
                      className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{product.name}</h4>
                              {product.productnumber && (
                                <p className="text-sm text-muted-foreground">
                                  {product.productnumber}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-lg">
                                {formatCurrency(product.price)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                per unit
                              </p>
                            </div>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          {product.quantityonhand !== undefined && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Stock: {product.quantityonhand} units
                            </p>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery
                    ? 'No products found matching your search'
                    : 'No active products available'}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} product
              {filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

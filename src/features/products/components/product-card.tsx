"use client"

import { memo } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '../types'
import { ProductPriceBadge } from './product-price-badge'
import { Eye, Edit, Trash2, Package, DollarSign, TrendingUp } from 'lucide-react'
import { useCurrencyFormat } from '@/shared/hooks/use-currency-format'

interface ProductCardProps {
  product: Product
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

/**
 * Memoized ProductCard component
 * Performance:
 * - Only re-renders if product or callbacks change
 * - Uses user's currency preference from settings
 */
export const ProductCard = memo(function ProductCard({
  product,
  onDelete,
  onEdit,
}: ProductCardProps) {
  const formatCurrency = useCurrencyFormat()
  const isActive = product.statecode === 0
  const hasInventory = product.quantityonhand !== undefined
  const isLowStock =
    hasInventory && product.quantityonhand! < 10 && product.quantityonhand! > 0
  const isOutOfStock = hasInventory && product.quantityonhand! === 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              <Link
                href={`/products/${product.productid}`}
                className="hover:underline"
              >
                {product.name}
              </Link>
            </CardTitle>
            {product.productnumber && (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                SKU: {product.productnumber}
              </p>
            )}
            {product.description && (
              <CardDescription className="line-clamp-2 mt-2">
                {product.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
          </div>
          {product.standardcost && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="text-sm">{formatCurrency(product.standardcost)}</p>
            </div>
          )}
        </div>

        {/* Profit Margin */}
        {product.price && product.standardcost && (
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-sm font-semibold text-green-600">
                {(
                  ((product.price - product.standardcost) / product.price) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>
        )}

        {/* Inventory */}
        {hasInventory && (
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Inventory</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {product.quantityonhand} units
                </p>
                {isOutOfStock && (
                  <Badge variant="destructive" className="text-xs">
                    Out of Stock
                  </Badge>
                )}
                {isLowStock && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/products/${product.productid}`}>
              <Eye className="size-4 mr-1" />
              View
            </Link>
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product.productid)}
            >
              <Edit className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(product.productid)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

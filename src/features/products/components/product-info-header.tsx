"use client"

import type { Product } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductInfoHeaderProps {
  product: Product
  className?: string
}

/**
 * ProductInfoHeader
 *
 * Header component similar to Dynamics 365 que muestra información clave del producto:
 * - Nombre
 * - Tipo (Producto)
 * - Estado (Active/Inactive)
 * - Número de producto (SKU)
 * - Precio
 * - Propietario
 */
export function ProductInfoHeader({ product, className }: ProductInfoHeaderProps) {
  // Determine state badge variant and label
  const getStateBadge = () => {
    const stateCode = Number(product.statecode)

    switch (stateCode) {
      case 0: // Active
        return { variant: 'default' as const, label: 'Active', color: 'bg-green-500' }
      case 1: // Inactive
        return { variant: 'secondary' as const, label: 'Inactive', color: 'bg-gray-500' }
      default:
        return { variant: 'secondary' as const, label: 'Unknown', color: 'bg-gray-500' }
    }
  }

  const stateBadge = getStateBadge()

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  return (
    <div className={cn("border-b py-4", className)}>
      <div className="space-y-3">
        {/* Row 1: Name, Type Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">
            {product.name}
          </h1>
          <Badge variant="secondary" className="text-xs font-normal">
            Producto
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            Product
          </Badge>
        </div>

        {/* Row 2: Product Number, Price, State */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {/* Product Number */}
          {product.productnumber && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span className="font-medium">SKU:</span>
              <span>{product.productnumber}</span>
            </div>
          )}

          {/* Price */}
          {product.price && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium">Precio:</span>
              <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
            </div>
          )}

          {/* State Badge */}
          <Badge
            variant={stateBadge.variant}
            className={cn("text-xs", stateBadge.color, "text-white")}
          >
            {stateBadge.label}
          </Badge>
        </div>

        {/* Row 3: Owner */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium">Propietario:</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {product.createdby?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{product.createdby || 'Unassigned'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

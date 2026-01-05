import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductPriceBadgeProps {
  price?: number
  className?: string
  showLabel?: boolean
}

export function ProductPriceBadge({
  price,
  className,
  showLabel = false,
}: ProductPriceBadgeProps) {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  if (price === undefined || price === null) {
    return (
      <Badge variant="outline" className={cn('font-mono', className)}>
        Price not set
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className={cn('font-mono font-semibold', className)}
    >
      {showLabel && <span className="mr-1">Price:</span>}
      {formatCurrency(price)}
    </Badge>
  )
}

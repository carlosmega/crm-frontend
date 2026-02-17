'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from './order-status-badge'
import type { Order } from '@/core/contracts/entities/order'
import { OrderStateCode } from '@/core/contracts/enums'
import { formatCurrency } from '@/features/quotes/utils/quote-calculations'
import {
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  Package,
  Truck,
} from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OrderCardProps {
  order: Order
}

/**
 * Order Card Component (Optimizado)
 *
 * Tarjeta individual para mostrar resumen de Order
 * ✅ Memoizado con React.memo para evitar re-renders innecesarios en listas
 */
export const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  const { t } = useTranslation('orders')
  const canFulfill = order.statecode === OrderStateCode.Submitted
  const isCanceled = order.statecode === OrderStateCode.Canceled

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/orders/${order.salesorderid}`}
              className="text-lg font-semibold hover:text-primary hover:underline"
            >
              {order.name}
            </Link>
            {order.ordernumber && (
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {order.ordernumber}
              </p>
            )}
          </div>

          <OrderStatusBadge statecode={order.statecode} />
        </div>

        {order.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {order.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Total Amount */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">{t('card.totalAmount')}</span>
          </div>
          <span className="text-lg font-bold">
            {formatCurrency(order.totalamount)}
          </span>
        </div>

        {/* Delivery Date */}
        {order.requestdeliveryby && (
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-muted-foreground">
                {t('card.deliveryBy')} {new Date(order.requestdeliveryby).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Fulfillment Date */}
        {order.datefulfilled && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('card.fulfilled')} {new Date(order.datefulfilled).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{t('card.created')} {new Date(order.createdon).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/orders/${order.salesorderid}`}>
              {t('card.viewDetails')}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {canFulfill && (
            <Button asChild size="sm" className="flex-1">
              <Link href={`/orders/${order.salesorderid}/fulfill`}>
                <Package className="mr-2 h-4 w-4" />
                {t('card.fulfill')}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

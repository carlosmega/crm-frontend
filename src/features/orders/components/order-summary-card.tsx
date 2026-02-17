'use client'

import type { Order } from '@/core/contracts/entities/order'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Percent, Package } from 'lucide-react'
import { formatCurrency } from '@/features/invoices/utils/invoice-calculations'
import { getPriorityLabel, getPaymentTermsLabel } from '@/core/contracts/enums'
import { useTranslation } from '@/shared/hooks/use-translation'

interface OrderSummaryCardProps {
  order: Order
  linesCount?: number
}

export function OrderSummaryCard({ order, linesCount = 0 }: OrderSummaryCardProps) {
  const { t } = useTranslation('orders')
  const subtotal = order.totalamountlessfreight || order.totalamount
  const hasDiscount = (order.discountamount || 0) > 0
  const hasTax = (order.totaltax || 0) > 0
  const hasFreight = (order.freightamount || 0) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('summaryCard.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Amount - Highlighted */}
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('summaryCard.totalAmount')}</span>
          </div>
          <span className="text-2xl font-bold">
            {formatCurrency(order.totalamount)}
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('summaryCard.subtotal')}</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {hasDiscount && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {t('summaryCard.discount')}
                {order.discountpercentage > 0 && (
                  <span className="text-xs">
                    ({order.discountpercentage.toFixed(1)}%)
                  </span>
                )}
              </span>
              <span className="font-medium text-green-600">
                -{formatCurrency(order.discountamount)}
              </span>
            </div>
          )}

          {hasTax && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summaryCard.tax')}</span>
              <span className="font-medium">{formatCurrency(order.totaltax)}</span>
            </div>
          )}

          {hasFreight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summaryCard.freight')}</span>
              <span className="font-medium">
                {formatCurrency(order.freightamount)}
              </span>
            </div>
          )}
        </div>

        {/* Line Items Count */}
        {linesCount > 0 && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('summaryCard.lineItems', { count: linesCount, item: linesCount !== 1 ? t('summaryCard.lineItems_plural') : t('summaryCard.lineItem') })}
            </span>
          </div>
        )}

        {/* Priority */}
        {order.prioritycode !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">{t('summaryCard.priority')}</span>
            <Badge variant={order.prioritycode === 2 ? 'destructive' : 'outline'}>
              {getPriorityLabel(order.prioritycode)}
            </Badge>
          </div>
        )}

        {/* Payment Terms */}
        {order.paymenttermscode !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('summaryCard.paymentTerms')}</span>
            <span className="text-sm font-medium">
              {getPaymentTermsLabel(order.paymenttermscode)}
            </span>
          </div>
        )}

        {/* Profit Margin (if cost data available) */}
        {order.totalamount > 0 && subtotal > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t('summaryCard.orderValue')}</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(order.totalamount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

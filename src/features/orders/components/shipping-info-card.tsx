'use client'

import type { Order } from '@/core/contracts/entities/order'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, MapPin, Calendar, Package } from 'lucide-react'
import {
  getShippingMethodLabel,
  getFreightTermsLabel,
  getFreightPaidBy,
} from '@/core/contracts/enums'

interface ShippingInfoCardProps {
  order: Order
}

export function ShippingInfoCard({ order }: ShippingInfoCardProps) {
  const hasShippingAddress =
    order.shipto_line1 || order.shipto_city || order.shipto_name
  const hasShippingMethod = order.shippingmethodcode !== undefined
  const hasFreightTerms = order.freighttermscode !== undefined

  if (!hasShippingAddress && !hasShippingMethod && !hasFreightTerms) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shipping Address */}
        {hasShippingAddress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Delivery Address</span>
            </div>
            <div className="pl-6 space-y-1 text-sm">
              {order.shipto_name && (
                <p className="font-medium">{order.shipto_name}</p>
              )}
              {order.shipto_line1 && <p>{order.shipto_line1}</p>}
              {order.shipto_line2 && <p>{order.shipto_line2}</p>}
              {(order.shipto_city ||
                order.shipto_stateorprovince ||
                order.shipto_postalcode) && (
                <p>
                  {order.shipto_city && `${order.shipto_city}, `}
                  {order.shipto_stateorprovince &&
                    `${order.shipto_stateorprovince} `}
                  {order.shipto_postalcode}
                </p>
              )}
              {order.shipto_country && <p>{order.shipto_country}</p>}
            </div>
          </div>
        )}

        {/* Shipping Method */}
        {hasShippingMethod && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Shipping Method</span>
            </div>
            <div className="pl-6">
              <Badge variant="outline">
                {getShippingMethodLabel(order.shippingmethodcode!)}
              </Badge>
            </div>
          </div>
        )}

        {/* Freight Terms */}
        {hasFreightTerms && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Freight Terms</span>
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p className="font-medium">
                {getFreightTermsLabel(order.freighttermscode!)}
              </p>
              <p className="text-muted-foreground text-xs">
                Paid by: {getFreightPaidBy(order.freighttermscode!)}
              </p>
            </div>
          </div>
        )}

        {/* Freight Amount */}
        {order.freightamount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Freight Charge</span>
              <span className="font-semibold">
                ${order.freightamount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Requested Delivery Date */}
        {order.requestdeliveryby && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Requested Delivery</span>
            </div>
            <div className="pl-6">
              <p className="text-sm">
                {new Date(order.requestdeliveryby).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Date Fulfilled */}
        {order.datefulfilled && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Order Fulfilled
                </p>
                <p className="text-xs text-green-700">
                  {new Date(order.datefulfilled).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

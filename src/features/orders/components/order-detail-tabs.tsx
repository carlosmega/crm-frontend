"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { Order } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderLineItemsTable } from '@/features/orders/components/order-line-items-table'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/shared/utils/formatters'
import {
  FileText,
  Package,
  Truck,
  Link2,
  History,
  Building2,
  User,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react'

export type OrderTabId = 'general' | 'products' | 'shipping' | 'related' | 'activities'

interface OrderDetailTabsProps {
  order: Order
  orderLines?: any[]
}

/**
 * OrderDetailTabs
 *
 * Tabbed view for Order details.
 *
 * Tabs:
 * - General: Order overview with key information
 * - Products: Order lines table
 * - Shipping: Shipping and delivery information
 * - Related: Related records (opportunity, quote, invoices)
 * - Activities: Activity timeline and history
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Organized content without sidebar spacing issues
 */
export function OrderDetailTabs({ order, orderLines = [] }: OrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<OrderTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('order-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Format helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="products"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Package className="w-4 h-4 mr-2" />
          Products ({orderLines.length})
        </TabsTrigger>

        <TabsTrigger
          value="shipping"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Truck className="w-4 h-4 mr-2" />
          Shipping
        </TabsTrigger>

        <TabsTrigger
          value="related"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Related
        </TabsTrigger>

        <TabsTrigger
          value="activities"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          Activities
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* GENERAL TAB */}
      <TabsContent value="general" className="mt-0 space-y-4">
        {/* Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {order.customeridtype === 'account' ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Customer Type</p>
                <p className="font-medium capitalize">{order.customeridtype}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="font-mono text-sm">{order.customerid}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.discountamount && order.discountamount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(order.discountamount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(order.totaltax || 0)}</span>
              </div>
              {order.freightamount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Freight</span>
                  <span className="font-medium">{formatCurrency(order.freightamount)}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(order.totalamount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dates Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{formatDate(order.datefulfilled)}</p>
            </div>
            {order.requestdeliveryby && (
              <div>
                <p className="text-sm text-muted-foreground">Requested Delivery</p>
                <p className="font-medium">{formatDate(order.requestdeliveryby)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(order.createdon)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Modified</p>
              <p className="font-medium">{formatDate(order.modifiedon)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        {order.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.description}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* PRODUCTS TAB */}
      <TabsContent value="products" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Lines ({orderLines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderLines.length > 0 ? (
              <OrderLineItemsTable
                orderId=""
                items={orderLines}
                canEdit={false}
                loading={false}
                onEditItem={() => {}}
              />
            ) : (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products in this order</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* SHIPPING TAB */}
      <TabsContent value="shipping" className="mt-0 space-y-4">
        {/* Shipping Address Card */}
        {(order.shipto_line1 || order.shipto_city) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {order.shipto_name && <div className="font-medium mb-1">{order.shipto_name}</div>}
                  {order.shipto_line1 && <div>{order.shipto_line1}</div>}
                  {order.shipto_line2 && <div>{order.shipto_line2}</div>}
                  <div>
                    {order.shipto_city}
                    {order.shipto_stateorprovince && `, ${order.shipto_stateorprovince}`}
                    {order.shipto_postalcode && ` ${order.shipto_postalcode}`}
                  </div>
                  {order.shipto_country && <div>{order.shipto_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Address Card */}
        {(order.billto_line1 || order.billto_city) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  {order.billto_name && <div className="font-medium mb-1">{order.billto_name}</div>}
                  {order.billto_line1 && <div>{order.billto_line1}</div>}
                  {order.billto_line2 && <div>{order.billto_line2}</div>}
                  <div>
                    {order.billto_city}
                    {order.billto_stateorprovince && `, ${order.billto_stateorprovince}`}
                    {order.billto_postalcode && ` ${order.billto_postalcode}`}
                  </div>
                  {order.billto_country && <div>{order.billto_country}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.freighttermscode !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Freight Terms</p>
                <p className="font-medium">
                  {order.freighttermscode === 1 ? 'FOB' : 'No Charge'}
                </p>
              </div>
            )}
            {order.requestdeliveryby && (
              <div>
                <p className="text-sm text-muted-foreground">Requested Delivery By</p>
                <p className="font-medium">{formatDate(order.requestdeliveryby)}</p>
              </div>
            )}
            {order.shippingmethodcode !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Shipping Method</p>
                <p className="font-medium">
                  {order.shippingmethodcode === 1 ? 'Airborne' :
                   order.shippingmethodcode === 2 ? 'DHL' :
                   order.shippingmethodcode === 3 ? 'FedEx' :
                   order.shippingmethodcode === 4 ? 'UPS' :
                   order.shippingmethodcode === 5 ? 'Postal Mail' :
                   order.shippingmethodcode === 6 ? 'Full Load' :
                   order.shippingmethodcode === 7 ? 'Will Call' : 'Default Value'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {!order.shipto_line1 && !order.shipto_city && !order.billto_line1 && !order.billto_city && (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shipping information available</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* RELATED TAB */}
      <TabsContent value="related" className="mt-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Related Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.quoteid && (
              <div>
                <p className="text-sm text-muted-foreground">Quote</p>
                <Link
                  href={`/quotes/${order.quoteid}`}
                  className="text-sm hover:underline text-primary font-medium"
                >
                  View Original Quote
                </Link>
              </div>
            )}
            {order.opportunityid && (
              <div>
                <p className="text-sm text-muted-foreground">Opportunity</p>
                <Link
                  href={`/opportunities/${order.opportunityid}`}
                  className="text-sm hover:underline text-primary font-medium"
                >
                  View Opportunity
                </Link>
              </div>
            )}
            {!order.quoteid && !order.opportunityid && (
              <p className="text-sm text-muted-foreground">No related records available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ACTIVITIES TAB */}
      <TabsContent value="activities" className="mt-0">
        <ActivityTimeline
          regardingId={order.salesorderid}
          regardingType="order"
          regardingName={order.name}
        />
      </TabsContent>
    </Tabs>
  )
}

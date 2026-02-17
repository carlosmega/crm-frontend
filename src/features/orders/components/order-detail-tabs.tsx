"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Order } from '@/core/contracts'
import { OrderStateCode } from '@/core/contracts/enums'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useContact } from '@/features/contacts/hooks/use-contacts'
import { useUpdateOrder } from '@/features/orders/hooks/use-orders'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { OrderLineItemsTable } from '@/features/orders/components/order-line-items-table'
import { PaymentInfoCard } from '@/features/orders/components/payment-info-card'
import { ActivityTimeline } from '@/features/activities/components'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/shared/utils/formatters'
import { useTranslation } from '@/shared/hooks/use-translation'
import { toast } from 'sonner'
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
  Mail,
  Phone,
  Globe,
  Briefcase,
  ExternalLink,
  Pencil,
  Plus,
  Copy,
} from 'lucide-react'

// Dynamic import for edit dialog
const EditShippingDialog = dynamic(
  () => import('./edit-shipping-dialog').then(mod => ({ default: mod.EditShippingDialog })),
  { ssr: false }
)

import type { ShippingDialogSection } from './edit-shipping-dialog'

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
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<OrderTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)
  const [shippingDialogSection, setShippingDialogSection] = useState<ShippingDialogSection | null>(null)

  // Mutation for updating order
  const updateMutation = useUpdateOrder()

  // Fetch customer data (Account or Contact)
  const isAccountCustomer = order.customeridtype === 'account'
  const { account, loading: accountLoading } = useAccount(isAccountCustomer ? order.customerid : '')
  const { contact, loading: contactLoading } = useContact(!isAccountCustomer ? order.customerid : '')

  // Can edit shipping only in Active state
  const canEditShipping = order.statecode === OrderStateCode.Active

  // Check if shipping info exists
  const hasShippingAddress = order.shipto_line1 || order.shipto_city
  const hasBillingAddress = order.billto_line1 || order.billto_city
  const hasShippingDetails = order.freighttermscode !== undefined ||
                             order.requestdeliveryby ||
                             order.shippingmethodcode !== undefined

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

  // Copy shipping address to billing address
  const handleCopyShippingToBilling = async () => {
    if (!hasShippingAddress) {
      toast.error(t('detail.noShippingAddressToCopy'))
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: order.salesorderid,
        dto: {
          billto_name: order.shipto_name,
          billto_line1: order.shipto_line1,
          billto_line2: order.shipto_line2,
          billto_city: order.shipto_city,
          billto_stateorprovince: order.shipto_stateorprovince,
          billto_postalcode: order.shipto_postalcode,
          billto_country: order.shipto_country,
        },
      })

      toast.success(t('detail.billingAddressCopied'))
    } catch (error) {
      console.error('Error copying shipping to billing:', error)
      toast.error(t('detail.errorCopyingAddress'))
    }
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
          {t('tabs.general')}
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
          {t('tabs.productsCount', { count: orderLines.length })}
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
          {t('tabs.shipping')}
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
          {t('tabs.related')}
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
          {t('tabs.activities')}
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
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isAccountCustomer ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  Customer Information
                </span>
                <Badge variant="outline" className="capitalize font-normal">
                  {order.customeridtype}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isAccountCustomer ? accountLoading : contactLoading) ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : isAccountCustomer && account ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">{account.name}</p>
                      {account.industrycode !== undefined && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {String(account.industrycode).replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/accounts/${account.accountid}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="View Account"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm">
                    {account.emailaddress1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.emailaddress1}</span>
                      </div>
                    )}
                    {account.telephone1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.telephone1}</span>
                      </div>
                    )}
                    {account.websiteurl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span>{account.websiteurl}</span>
                      </div>
                    )}
                    {(account.address1_city || account.address1_country) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {[account.address1_city, account.address1_stateorprovince, account.address1_country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/accounts/${account.accountid}`}
                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      View Account Details
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : !isAccountCustomer && contact ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-base">
                        {contact.fullname || `${contact.firstname} ${contact.lastname}`}
                      </p>
                      {contact.jobtitle && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{contact.jobtitle}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/contacts/${contact.contactid}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="View Contact"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm">
                    {contact.emailaddress1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{contact.emailaddress1}</span>
                      </div>
                    )}
                    {(contact.telephone1 || contact.mobilephone) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{contact.mobilephone || contact.telephone1}</span>
                      </div>
                    )}
                    {(contact.address1_city || contact.address1_country) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {[contact.address1_city, contact.address1_stateorprovince, contact.address1_country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/contacts/${contact.contactid}`}
                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      View Contact Details
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>Customer data not available</p>
                  <p className="font-mono text-xs mt-1">{order.customerid}</p>
                </div>
              )}
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
        {hasShippingAddress ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
                {canEditShipping && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingDialogSection('shipping-address')}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Shipping Address
                  </Button>
                )}
              </div>
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No shipping address</p>
                {canEditShipping && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingDialogSection('shipping-address')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shipping Address
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Address Card */}
        {hasBillingAddress ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </CardTitle>
                {canEditShipping && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingDialogSection('billing-address')}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Billing Address
                  </Button>
                )}
              </div>
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
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </CardTitle>
                {canEditShipping && hasShippingAddress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyShippingToBilling}
                    disabled={updateMutation.isPending}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Same as Shipping
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No billing address</p>
                {canEditShipping && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingDialogSection('billing-address')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Billing Address
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Details
              </CardTitle>
              {canEditShipping && hasShippingDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShippingDialogSection('shipping-details')}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Shipping Details
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasShippingDetails ? (
              <div className="space-y-3">
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
                {order.freighttermscode !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Freight Terms</p>
                    <p className="font-medium">
                      {order.freighttermscode === 1 ? 'FOB' : 'No Charge'}
                    </p>
                  </div>
                )}
                {order.freightamount !== undefined && order.freightamount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Freight Amount</p>
                    <p className="font-medium">{formatCurrency(order.freightamount)}</p>
                  </div>
                )}
                {order.requestdeliveryby && (
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Delivery By</p>
                    <p className="font-medium">{formatDate(order.requestdeliveryby)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Truck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No shipping details configured</p>
                {canEditShipping && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShippingDialogSection('shipping-details')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shipping Details
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info Card */}
        <PaymentInfoCard order={order} />

        {/* Edit Shipping Dialog */}
        <EditShippingDialog
          order={order}
          open={shippingDialogSection !== null}
          onOpenChange={(open) => { if (!open) setShippingDialogSection(null) }}
          section={shippingDialogSection || 'all'}
        />
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

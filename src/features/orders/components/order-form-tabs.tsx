'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import type { Order } from '@/core/contracts/entities/order'
import type { UpdateOrderDto } from '@/core/contracts/entities/order'
import {
  PriorityCode,
  getPriorityLabel,
  PaymentTermsCode,
  getPaymentTermsLabel,
  ShippingMethodCode,
  getShippingMethodLabel,
  FreightTermsCode,
  getFreightTermsLabel,
} from '@/core/contracts/enums'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FileText, Truck, CreditCard, MapPin } from 'lucide-react'

export type OrderFormTabId = 'general' | 'shipping' | 'payment'

interface OrderFormTabsProps {
  order: Order
  onSubmit: (data: UpdateOrderDto) => void
  onCancel: () => void
  isSubmitting?: boolean
}

/**
 * OrderFormTabs
 *
 * Tabbed form for editing an order.
 * Uses a SINGLE form instance to preserve state across tab changes.
 *
 * Tabs:
 * - General: name, description, priority, delivery date
 * - Shipping: shipping/billing addresses, shipping method, freight terms
 * - Payment: payment terms
 */
export function OrderFormTabs({ order, onSubmit, onCancel, isSubmitting }: OrderFormTabsProps) {
  const [activeTab, setActiveTab] = useState<OrderFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateOrderDto>({
    defaultValues: {
      name: order.name,
      description: order.description || '',
      prioritycode: order.prioritycode,
      requestdeliveryby: order.requestdeliveryby?.split('T')[0] || '',
      // Shipping
      shipto_name: order.shipto_name || '',
      shipto_line1: order.shipto_line1 || '',
      shipto_line2: order.shipto_line2 || '',
      shipto_city: order.shipto_city || '',
      shipto_stateorprovince: order.shipto_stateorprovince || '',
      shipto_postalcode: order.shipto_postalcode || '',
      shipto_country: order.shipto_country || '',
      shippingmethodcode: order.shippingmethodcode,
      freighttermscode: order.freighttermscode,
      // Billing
      billto_name: order.billto_name || '',
      billto_line1: order.billto_line1 || '',
      billto_line2: order.billto_line2 || '',
      billto_city: order.billto_city || '',
      billto_stateorprovince: order.billto_stateorprovince || '',
      billto_postalcode: order.billto_postalcode || '',
      billto_country: order.billto_country || '',
      // Payment
      paymenttermscode: order.paymenttermscode,
    },
  })

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('order-form-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const handleFormSubmit = (data: UpdateOrderDto) => {
    // Convert delivery date to ISO if present
    const dto: UpdateOrderDto = {
      ...data,
      requestdeliveryby: data.requestdeliveryby
        ? new Date(data.requestdeliveryby as string).toISOString()
        : undefined,
    }
    onSubmit(dto)
  }

  const copyShippingToBilling = () => {
    setValue('billto_name', watch('shipto_name'))
    setValue('billto_line1', watch('shipto_line1'))
    setValue('billto_line2', watch('shipto_line2'))
    setValue('billto_city', watch('shipto_city'))
    setValue('billto_stateorprovince', watch('shipto_stateorprovince'))
    setValue('billto_postalcode', watch('shipto_postalcode'))
    setValue('billto_country', watch('shipto_country'))
  }

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          onClick={() => setActiveTab('general')}
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
          data-state={activeTab === 'general' ? 'active' : 'inactive'}
        >
          <FileText className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>

        <TabsTrigger
          value="shipping"
          onClick={() => setActiveTab('shipping')}
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
          data-state={activeTab === 'shipping' ? 'active' : 'inactive'}
        >
          <Truck className="w-4 h-4 mr-2" />
          Shipping
        </TabsTrigger>

        <TabsTrigger
          value="payment"
          onClick={() => setActiveTab('payment')}
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
          data-state={activeTab === 'payment' ? 'active' : 'inactive'}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Payment
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Single form with all sections - visibility controlled by activeTab */}
      <form id="order-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* GENERAL SECTION */}
        <div className={cn(activeTab !== 'general' && 'hidden')}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Order Name *</Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Order name is required',
                    minLength: {
                      value: 3,
                      message: 'Order name must be at least 3 characters',
                    },
                  })}
                  placeholder="e.g., Enterprise License Order - Acme Corp"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of this order..."
                  rows={3}
                />
              </div>

              {/* Priority & Delivery Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={watch('prioritycode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('prioritycode', parseInt(value) as PriorityCode)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PriorityCode)
                        .filter((v) => typeof v === 'number')
                        .map((code) => (
                          <SelectItem key={code} value={code.toString()}>
                            {getPriorityLabel(code as PriorityCode)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Requested Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="requestdeliveryby">Requested Delivery Date</Label>
                  <Input
                    id="requestdeliveryby"
                    type="date"
                    {...register('requestdeliveryby')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SHIPPING SECTION */}
        <div className={cn(activeTab !== 'shipping' && 'hidden')}>
          {/* Shipping Address */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="shipto_name">Recipient Name</Label>
                  <Input
                    id="shipto_name"
                    {...register('shipto_name')}
                    placeholder="Company or person name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="shipto_line1">Address Line 1</Label>
                  <Input
                    id="shipto_line1"
                    {...register('shipto_line1')}
                    placeholder="Street address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="shipto_line2">Address Line 2</Label>
                  <Input
                    id="shipto_line2"
                    {...register('shipto_line2')}
                    placeholder="Apt, suite, unit, etc. (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="shipto_city">City</Label>
                  <Input
                    id="shipto_city"
                    {...register('shipto_city')}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="shipto_stateorprovince">State/Province</Label>
                  <Input
                    id="shipto_stateorprovince"
                    {...register('shipto_stateorprovince')}
                    placeholder="State or province"
                  />
                </div>
                <div>
                  <Label htmlFor="shipto_postalcode">Postal Code</Label>
                  <Input
                    id="shipto_postalcode"
                    {...register('shipto_postalcode')}
                    placeholder="ZIP / Postal code"
                  />
                </div>
                <div>
                  <Label htmlFor="shipto_country">Country</Label>
                  <Input
                    id="shipto_country"
                    {...register('shipto_country')}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Billing Address
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyShippingToBilling}
                >
                  Same as shipping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="billto_name">Billing Name</Label>
                  <Input
                    id="billto_name"
                    {...register('billto_name')}
                    placeholder="Company or person name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="billto_line1">Address Line 1</Label>
                  <Input
                    id="billto_line1"
                    {...register('billto_line1')}
                    placeholder="Street address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="billto_line2">Address Line 2</Label>
                  <Input
                    id="billto_line2"
                    {...register('billto_line2')}
                    placeholder="Apt, suite, unit, etc. (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="billto_city">City</Label>
                  <Input
                    id="billto_city"
                    {...register('billto_city')}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="billto_stateorprovince">State/Province</Label>
                  <Input
                    id="billto_stateorprovince"
                    {...register('billto_stateorprovince')}
                    placeholder="State or province"
                  />
                </div>
                <div>
                  <Label htmlFor="billto_postalcode">Postal Code</Label>
                  <Input
                    id="billto_postalcode"
                    {...register('billto_postalcode')}
                    placeholder="ZIP / Postal code"
                  />
                </div>
                <div>
                  <Label htmlFor="billto_country">Country</Label>
                  <Input
                    id="billto_country"
                    {...register('billto_country')}
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Shipping Method</Label>
                  <Select
                    value={watch('shippingmethodcode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('shippingmethodcode', value ? parseInt(value) as ShippingMethodCode : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ShippingMethodCode)
                        .filter((v) => typeof v === 'number')
                        .map((code) => (
                          <SelectItem key={code} value={code.toString()}>
                            {getShippingMethodLabel(code as ShippingMethodCode)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Freight Terms</Label>
                  <Select
                    value={watch('freighttermscode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('freighttermscode', value ? parseInt(value) as FreightTermsCode : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FreightTermsCode)
                        .filter((v) => typeof v === 'number')
                        .map((code) => (
                          <SelectItem key={code} value={code.toString()}>
                            {getFreightTermsLabel(code as FreightTermsCode)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PAYMENT SECTION */}
        <div className={cn(activeTab !== 'payment' && 'hidden')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label>Payment Terms</Label>
                <Select
                  value={watch('paymenttermscode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('paymenttermscode', value ? parseInt(value) as PaymentTermsCode : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentTermsCode)
                      .filter((v) => typeof v === 'number')
                      .map((code) => (
                        <SelectItem key={code} value={code.toString()}>
                          {getPaymentTermsLabel(code as PaymentTermsCode)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Defines when payment is expected for this order
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Tabs>
  )
}

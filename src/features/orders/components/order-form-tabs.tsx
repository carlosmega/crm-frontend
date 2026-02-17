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
  PaymentMethodCode,
  getPaymentMethodLabel,
  getPaymentMethodDescription,
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
import { FileText, Truck, CreditCard, MapPin, DollarSign } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'
import { UseCustomerAddressDialog } from './use-customer-address-dialog'
import type { CustomerAddress } from '../hooks/use-customer-addresses'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AddressFormFields } from '@/shared/components/form/address-form-fields'
import { Form } from '@/components/ui/form'

export type OrderFormTabId = 'general' | 'shipping' | 'payment'

interface OrderFormTabsProps {
  order: Order
  onSubmit: (data: UpdateOrderDto) => void
  onCancel: () => void
  isSubmitting?: boolean
}

/**
 * Determina quién paga el flete basado en el FreightTermsCode
 */
const getFreightPayer = (freightTerms?: FreightTermsCode): 'buyer' | 'seller' | 'none' => {
  if (!freightTerms) return 'none'

  switch (freightTerms) {
    case FreightTermsCode.FOB: // Free On Board - Buyer pays
      return 'buyer'
    case FreightTermsCode.NoCharge: // No charge
      return 'none'
    case FreightTermsCode.CIF: // Cost, Insurance, Freight - Seller pays
    case FreightTermsCode.Prepaid: // Prepaid by seller
      return 'seller'
    default:
      return 'none'
  }
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
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<OrderFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)
  const [useAddressDialogOpen, setUseAddressDialogOpen] = useState(false)

  const form = useForm<UpdateOrderDto>({
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
      freightamount: order.freightamount,
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
      paymentmethodcode: order.paymentmethodcode,
    },
  })

  const { register, handleSubmit, setValue, watch, formState } = form

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

  const handleAddressSelected = (address: CustomerAddress) => {
    setValue('shipto_name', address.name || '')
    setValue('shipto_line1', address.line1 || '')
    setValue('shipto_line2', address.line2 || '')
    setValue('shipto_city', address.city || '')
    setValue('shipto_stateorprovince', address.stateOrProvince || '')
    setValue('shipto_postalcode', address.postalCode || '')
    setValue('shipto_country', address.country || '')
    toast.success(t('editShipping.addressApplied'))
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
          {t('formTabs.general')}
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
          {t('formTabs.shipping')}
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
          {t('formTabs.payment')}
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Form {...form}>
      <Tabs value={activeTab} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Single form with all sections - visibility controlled by activeTab */}
      <form id="order-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* GENERAL SECTION */}
        <div className={cn(activeTab !== 'general' && 'hidden')}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{t('form.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.orderName')} *</Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: t('form.orderNameRequired'),
                    minLength: {
                      value: 3,
                      message: t('form.orderNameMinLength'),
                    },
                  })}
                  placeholder={t('form.orderNamePlaceholder')}
                />
                {formState.errors.name && (
                  <p className="text-sm text-destructive">{formState.errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('form.description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              {/* Priority & Delivery Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>{t('form.priority')}</Label>
                  <Select
                    value={watch('prioritycode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('prioritycode', parseInt(value) as PriorityCode)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectPriority')} />
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
                  <Label htmlFor="requestdeliveryby">{t('form.requestedDeliveryDate')}</Label>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {t('formTabs.shippingAddress')}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseAddressDialogOpen(true)}
                >
                  {t('formTabs.useCustomerAddress')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recipient Name - Not part of AddressFormFields */}
                <div>
                  <Label htmlFor="shipto_name">{tc('address.recipientName')}</Label>
                  <Input
                    id="shipto_name"
                    {...register('shipto_name')}
                    placeholder={tc('placeholders.companyOrPerson')}
                  />
                </div>

                {/* Address Fields with Postal Code Autocomplete */}
                <AddressFormFields
                  form={form}
                  fieldNames={{
                    line1: 'shipto_line1',
                    line2: 'shipto_line2',
                    city: 'shipto_city',
                    stateOrProvince: 'shipto_stateorprovince',
                    postalCode: 'shipto_postalcode',
                    country: 'shipto_country',
                  }}
                  enablePostalCodeLookup
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {t('formTabs.billingAddress')}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyShippingToBilling}
                >
                  {t('formTabs.sameAsShipping')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Billing Name - Not part of AddressFormFields */}
                <div>
                  <Label htmlFor="billto_name">{tc('address.billingName')}</Label>
                  <Input
                    id="billto_name"
                    {...register('billto_name')}
                    placeholder={tc('placeholders.companyOrPerson')}
                  />
                </div>

                {/* Address Fields with Postal Code Autocomplete */}
                <AddressFormFields
                  form={form}
                  fieldNames={{
                    line1: 'billto_line1',
                    line2: 'billto_line2',
                    city: 'billto_city',
                    stateOrProvince: 'billto_stateorprovince',
                    postalCode: 'billto_postalcode',
                    country: 'billto_country',
                  }}
                  enablePostalCodeLookup
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                {t('formTabs.shippingDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{t('formTabs.shippingMethod')}</Label>
                  <Select
                    value={watch('shippingmethodcode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('shippingmethodcode', value ? parseInt(value) as ShippingMethodCode : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formTabs.selectMethod')} />
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
                  <Label>{t('formTabs.freightTerms')}</Label>
                  <Select
                    value={watch('freighttermscode')?.toString() || ''}
                    onValueChange={(value) =>
                      setValue('freighttermscode', value ? parseInt(value) as FreightTermsCode : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formTabs.selectTerms')} />
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
                  {watch('freighttermscode') && (() => {
                    const payer = getFreightPayer(watch('freighttermscode') as FreightTermsCode)
                    return (
                      <div className="mt-2">
                        {payer === 'buyer' && (
                          <Badge variant="outline" className="font-normal text-blue-600 border-blue-300">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {t('detail.buyerPays')}
                          </Badge>
                        )}
                        {payer === 'seller' && (
                          <Badge variant="outline" className="font-normal text-green-600 border-green-300">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {t('detail.sellerPays')}
                          </Badge>
                        )}
                        {payer === 'none' && (
                          <Badge variant="outline" className="font-normal text-gray-600 border-gray-300">
                            {t('detail.noCharge')}
                          </Badge>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="mt-4 max-w-md">
                <Label>{t('formTabs.freightAmountOptional')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-6"
                    {...register('freightamount', {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('formTabs.freightAmountHint')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PAYMENT SECTION */}
        <div className={cn(activeTab !== 'payment' && 'hidden')}>
          {/* Payment Terms Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {t('formTabs.paymentTerms')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label>{t('formTabs.paymentTerms')}</Label>
                <Select
                  value={watch('paymenttermscode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('paymenttermscode', value ? parseInt(value) as PaymentTermsCode : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('formTabs.selectPaymentTerms')} />
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
                  {t('formTabs.paymentTermsHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {t('formTabs.paymentMethodCard')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <Label>{t('formTabs.paymentMethod')}</Label>
                <Select
                  value={watch('paymentmethodcode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('paymentmethodcode', value ? parseInt(value) as PaymentMethodCode : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('formTabs.selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethodCode)
                      .filter((v) => typeof v === 'number')
                      .map((code) => (
                        <SelectItem key={code} value={code.toString()}>
                          {getPaymentMethodLabel(code as PaymentMethodCode)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {watch('paymentmethodcode') && (
                  <p className="text-xs text-muted-foreground">
                    ℹ️ {getPaymentMethodDescription(watch('paymentmethodcode') as PaymentMethodCode)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('formTabs.paymentMethodHint')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Use Customer Address Dialog */}
      <UseCustomerAddressDialog
        customerId={order.customerid}
        customerType={order.customeridtype}
        open={useAddressDialogOpen}
        onOpenChange={setUseAddressDialogOpen}
        onAddressSelected={handleAddressSelected}
      />
      </Tabs>
    </Form>
  )
}

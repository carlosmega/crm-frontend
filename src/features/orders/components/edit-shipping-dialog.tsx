'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateOrder } from '../hooks/use-orders'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, MapPin, Truck, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/hooks/use-translation'
import type { Order } from '@/core/contracts/entities/order'
import { UseCustomerAddressDialog } from './use-customer-address-dialog'
import type { CustomerAddress } from '../hooks/use-customer-addresses'
import { Badge } from '@/components/ui/badge'
import { FreightTermsCode } from '@/core/contracts/enums'
import { AddressFormFields } from '@/shared/components/form/address-form-fields'
import { Form } from '@/components/ui/form'
import { cn } from '@/lib/utils'

interface ShippingFormData {
  // Shipping Address
  shipto_name?: string
  shipto_line1?: string
  shipto_line2?: string
  shipto_city?: string
  shipto_stateorprovince?: string
  shipto_postalcode?: string
  shipto_country?: string
  // Billing Address
  billto_name?: string
  billto_line1?: string
  billto_line2?: string
  billto_city?: string
  billto_stateorprovince?: string
  billto_postalcode?: string
  billto_country?: string
  // Shipping Details
  shippingmethodcode?: number
  freighttermscode?: number
  freightamount?: number
  requestdeliveryby?: string
}

export type ShippingDialogSection = 'all' | 'shipping-address' | 'billing-address' | 'shipping-details'

interface EditShippingDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: ShippingDialogSection
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
 * Edit Shipping Dialog
 *
 * Dialog para editar información de shipping y billing de un pedido
 */
export function EditShippingDialog({
  order,
  open,
  onOpenChange,
  section = 'all',
}: EditShippingDialogProps) {
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')
  const updateMutation = useUpdateOrder()

  const [useAddressDialogOpen, setUseAddressDialogOpen] = useState(false)

  const form = useForm<ShippingFormData>({
    defaultValues: {
      shipto_name: order.shipto_name || '',
      shipto_line1: order.shipto_line1 || '',
      shipto_line2: order.shipto_line2 || '',
      shipto_city: order.shipto_city || '',
      shipto_stateorprovince: order.shipto_stateorprovince || '',
      shipto_postalcode: order.shipto_postalcode || '',
      shipto_country: order.shipto_country || '',
      billto_name: order.billto_name || '',
      billto_line1: order.billto_line1 || '',
      billto_line2: order.billto_line2 || '',
      billto_city: order.billto_city || '',
      billto_stateorprovince: order.billto_stateorprovince || '',
      billto_postalcode: order.billto_postalcode || '',
      billto_country: order.billto_country || '',
      shippingmethodcode: order.shippingmethodcode,
      freighttermscode: order.freighttermscode,
      freightamount: order.freightamount,
      requestdeliveryby: order.requestdeliveryby?.split('T')[0] || '',
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = form

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        shipto_name: order.shipto_name || '',
        shipto_line1: order.shipto_line1 || '',
        shipto_line2: order.shipto_line2 || '',
        shipto_city: order.shipto_city || '',
        shipto_stateorprovince: order.shipto_stateorprovince || '',
        shipto_postalcode: order.shipto_postalcode || '',
        shipto_country: order.shipto_country || '',
        billto_name: order.billto_name || '',
        billto_line1: order.billto_line1 || '',
        billto_line2: order.billto_line2 || '',
        billto_city: order.billto_city || '',
        billto_stateorprovince: order.billto_stateorprovince || '',
        billto_postalcode: order.billto_postalcode || '',
        billto_country: order.billto_country || '',
        shippingmethodcode: order.shippingmethodcode,
        freighttermscode: order.freighttermscode,
        freightamount: order.freightamount,
        requestdeliveryby: order.requestdeliveryby?.split('T')[0] || '',
      })
    }
  }, [open, order, reset])

  const onSubmit = async (data: ShippingFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: order.salesorderid,
        dto: {
          ...data,
          requestdeliveryby: data.requestdeliveryby
            ? new Date(data.requestdeliveryby).toISOString()
            : undefined,
        },
      })

      toast.success(t('editShipping.successToast'))
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating shipping:', error)
      toast.error(t('editShipping.errorToast'))
    }
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

  const showShippingAddress = section === 'all' || section === 'shipping-address'
  const showBillingAddress = section === 'all' || section === 'billing-address'
  const showShippingDetails = section === 'all' || section === 'shipping-details'

  const dialogTitle = section === 'shipping-address'
    ? t('editShipping.shippingAddress')
    : section === 'billing-address'
    ? t('editShipping.billingAddress')
    : section === 'shipping-details'
    ? t('editShipping.shippingDetails')
    : t('editShipping.title')

  const dialogIcon = section === 'shipping-address' || section === 'billing-address'
    ? <MapPin className="h-5 w-5" />
    : <Truck className="h-5 w-5" />

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(section !== 'all' ? 'max-w-lg' : 'max-w-2xl', 'max-h-[90vh] overflow-y-auto')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialogIcon}
            {dialogTitle}
          </DialogTitle>
          {section === 'all' && (
            <DialogDescription>
              {t('editShipping.description')}
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shipping Address */}
          {showShippingAddress && (
          <div className="space-y-4">
            {section === 'all' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{t('editShipping.shippingAddress')}</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseAddressDialogOpen(true)}
              >
                {t('formTabs.useCustomerAddress')}
              </Button>
            </div>
            )}
            {section === 'shipping-address' && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseAddressDialogOpen(true)}
                >
                  {t('formTabs.useCustomerAddress')}
                </Button>
              </div>
            )}
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
          </div>
          )}

          {/* Billing Address */}
          {showBillingAddress && (
          <div className="space-y-4">
            {section === 'all' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{t('editShipping.billingAddress')}</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyShippingToBilling}
              >
                {t('editShipping.sameAsShipping')}
              </Button>
            </div>
            )}
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
          </div>
          )}

          {/* Shipping Details */}
          {showShippingDetails && (
          <div className="space-y-4">
            {section === 'all' && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{t('editShipping.shippingDetails')}</h3>
            </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="shippingmethodcode">{t('editShipping.shippingMethod')}</Label>
                <Select
                  value={watch('shippingmethodcode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('shippingmethodcode', value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('editShipping.selectMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Airborne</SelectItem>
                    <SelectItem value="2">DHL</SelectItem>
                    <SelectItem value="3">FedEx</SelectItem>
                    <SelectItem value="4">UPS</SelectItem>
                    <SelectItem value="5">Postal Mail</SelectItem>
                    <SelectItem value="6">Full Load</SelectItem>
                    <SelectItem value="7">Will Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="freighttermscode">{t('editShipping.freightTerms')}</Label>
                <Select
                  value={watch('freighttermscode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('freighttermscode', value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('editShipping.selectTerms')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">FOB</SelectItem>
                    <SelectItem value="2">No Charge</SelectItem>
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
              <div>
                <Label htmlFor="requestdeliveryby">{t('editShipping.requestedDeliveryDate')}</Label>
                <Input
                  id="requestdeliveryby"
                  type="date"
                  {...register('requestdeliveryby')}
                />
              </div>
            </div>
            <div className="max-w-md">
              <Label htmlFor="freightamount">{t('editShipping.freightAmount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="freightamount"
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
                {t('editShipping.freightAmountHint')}
              </p>
            </div>
          </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {tc('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('editShipping.saving')}
                </>
              ) : (
                t('editShipping.saveChanges')
              )}
            </Button>
          </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Use Customer Address Dialog */}
      <UseCustomerAddressDialog
        customerId={order.customerid}
        customerType={order.customeridtype}
        open={useAddressDialogOpen}
        onOpenChange={setUseAddressDialogOpen}
        onAddressSelected={handleAddressSelected}
      />
    </Dialog>
  )
}

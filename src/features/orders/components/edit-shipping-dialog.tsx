'use client'

import { useEffect } from 'react'
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
import { Loader2, MapPin, Truck } from 'lucide-react'
import { toast } from 'sonner'
import type { Order } from '@/core/contracts/entities/order'

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
  requestdeliveryby?: string
}

interface EditShippingDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
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
}: EditShippingDialogProps) {
  const updateMutation = useUpdateOrder()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<ShippingFormData>({
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
      requestdeliveryby: order.requestdeliveryby?.split('T')[0] || '',
    },
  })

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

      toast.success('Shipping information updated')
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating shipping:', error)
      toast.error('Failed to update shipping information')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Edit Shipping Information
          </DialogTitle>
          <DialogDescription>
            Update shipping address, billing address, and delivery details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Shipping Address</h3>
            </div>
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
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Billing Address</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyShippingToBilling}
              >
                Same as shipping
              </Button>
            </div>
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
          </div>

          {/* Shipping Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Shipping Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="shippingmethodcode">Shipping Method</Label>
                <Select
                  value={watch('shippingmethodcode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('shippingmethodcode', value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
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
                <Label htmlFor="freighttermscode">Freight Terms</Label>
                <Select
                  value={watch('freighttermscode')?.toString() || ''}
                  onValueChange={(value) =>
                    setValue('freighttermscode', value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">FOB</SelectItem>
                    <SelectItem value="2">No Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestdeliveryby">Requested Delivery Date</Label>
                <Input
                  id="requestdeliveryby"
                  type="date"
                  {...register('requestdeliveryby')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

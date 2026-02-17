'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useCustomerAddresses, type CustomerAddress } from '../hooks/use-customer-addresses'
import { useTranslation } from '@/shared/hooks/use-translation'

interface UseCustomerAddressDialogProps {
  customerId: string
  customerType: 'account' | 'contact'
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddressSelected: (address: CustomerAddress) => void
}

/**
 * Use Customer Address Dialog
 *
 * Dialog para seleccionar una dirección del customer (Account o Contact)
 * y auto-fill los campos de shipping address en el formulario de pedido
 */
export function UseCustomerAddressDialog({
  customerId,
  customerType,
  open,
  onOpenChange,
  onAddressSelected,
}: UseCustomerAddressDialogProps) {
  const { t } = useTranslation('orders')
  const { t: tc } = useTranslation('common')

  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  const { addresses, loading, error, hasAddresses } = useCustomerAddresses({
    customerId,
    customerType,
    enabled: open,
  })

  const handleConfirm = () => {
    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
    if (selectedAddress) {
      onAddressSelected(selectedAddress)
      onOpenChange(false)
      setSelectedAddressId('')
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedAddressId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('useCustomerAddressDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('useCustomerAddressDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                {t('useCustomerAddressDialog.loading')}
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-2 py-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error.message}</p>
              </CardContent>
            </Card>
          )}

          {/* No Addresses State */}
          {!loading && !error && !hasAddresses && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('useCustomerAddressDialog.noAddresses')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address Selection */}
          {!loading && !error && hasAddresses && (
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <div className="flex-1">
                          <Label
                            htmlFor={address.id}
                            className="cursor-pointer font-medium text-base"
                          >
                            {address.type === 'primary'
                              ? t('useCustomerAddressDialog.primaryAddress')
                              : t('useCustomerAddressDialog.secondaryAddress')}
                          </Label>
                          {address.name && (
                            <p className="text-sm font-medium mt-1">{address.name}</p>
                          )}
                          <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
                            {address.line1 && <p>{address.line1}</p>}
                            {address.line2 && <p>{address.line2}</p>}
                            {(address.city || address.stateOrProvince || address.postalCode) && (
                              <p>
                                {[address.city, address.stateOrProvince, address.postalCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                            {address.country && <p>{address.country}</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {tc('buttons.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAddressId || loading}
          >
            {t('useCustomerAddressDialog.selectAddress')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PaymentMethodCode,
  getPaymentMethodLabel,
  getPaymentMethodDescription,
} from '@/core/contracts/enums'
import { CreditCard, Banknote, Building2, Wallet } from 'lucide-react'

/**
 * Payment Method Selector Component
 *
 * Selector reutilizable para métodos de pago
 * Usado en Orders e Invoices
 */

interface PaymentMethodSelectorProps {
  value?: PaymentMethodCode
  onValueChange: (value: PaymentMethodCode) => void
  disabled?: boolean
  required?: boolean
  label?: string
  showDescription?: boolean
}

const PAYMENT_METHODS = [
  { code: PaymentMethodCode.CreditCard, icon: CreditCard },
  { code: PaymentMethodCode.DebitCard, icon: CreditCard },
  { code: PaymentMethodCode.BankTransfer, icon: Building2 },
  { code: PaymentMethodCode.Check, icon: Banknote },
  { code: PaymentMethodCode.Cash, icon: Wallet },
  { code: PaymentMethodCode.PayPal, icon: Wallet },
  { code: PaymentMethodCode.WireTransfer, icon: Building2 },
  { code: PaymentMethodCode.ACH, icon: Building2 },
  { code: PaymentMethodCode.Other, icon: Wallet },
]

export function PaymentMethodSelector({
  value,
  onValueChange,
  disabled = false,
  required = false,
  label = 'Payment Method',
  showDescription = true,
}: PaymentMethodSelectorProps) {
  const selectedMethod = PAYMENT_METHODS.find((m) => m.code === value)

  return (
    <div className="space-y-2">
      <Label htmlFor="payment-method">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value?.toString()}
        onValueChange={(val) => onValueChange(Number(val) as PaymentMethodCode)}
        disabled={disabled}
      >
        <SelectTrigger id="payment-method">
          <SelectValue placeholder="Select payment method">
            {selectedMethod && (
              <div className="flex items-center gap-2">
                <selectedMethod.icon className="h-4 w-4" />
                <span>{getPaymentMethodLabel(selectedMethod.code)}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon
            return (
              <SelectItem key={method.code} value={method.code.toString()}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div>{getPaymentMethodLabel(method.code)}</div>
                    {showDescription && (
                      <div className="text-xs text-muted-foreground">
                        {getPaymentMethodDescription(method.code)}
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {showDescription && value && (
        <p className="text-sm text-muted-foreground">
          {getPaymentMethodDescription(value)}
        </p>
      )}
    </div>
  )
}

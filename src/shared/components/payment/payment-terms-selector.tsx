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
  PaymentTermsCode,
  getPaymentTermsLabel,
  getPaymentTermsDays,
} from '@/core/contracts/enums'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * Payment Terms Selector Component
 *
 * Selector reutilizable para términos de pago
 * Usado en Orders e Invoices
 */

interface PaymentTermsSelectorProps {
  value?: PaymentTermsCode
  onValueChange: (value: PaymentTermsCode) => void
  disabled?: boolean
  required?: boolean
  label?: string
  showDueDate?: boolean
  orderDate?: string // Para calcular due date
}

const PAYMENT_TERMS = [
  PaymentTermsCode.Net30,
  PaymentTermsCode.Net45,
  PaymentTermsCode.Net60,
  PaymentTermsCode.Net90,
  PaymentTermsCode.Discount2Percent10Net30,
  PaymentTermsCode.DueOnReceipt,
  PaymentTermsCode.COD,
  PaymentTermsCode.Prepaid,
]

function calculateDueDate(orderDate: string, termsCode: PaymentTermsCode): string {
  const days = getPaymentTermsDays(termsCode)
  const date = new Date(orderDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export function PaymentTermsSelector({
  value,
  onValueChange,
  disabled = false,
  required = false,
  label = 'Payment Terms',
  showDueDate = true,
  orderDate = new Date().toISOString().split('T')[0],
}: PaymentTermsSelectorProps) {
  const dueDate = value ? calculateDueDate(orderDate, value) : null

  return (
    <div className="space-y-2">
      <Label htmlFor="payment-terms">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value?.toString()}
        onValueChange={(val) => onValueChange(Number(val) as PaymentTermsCode)}
        disabled={disabled}
      >
        <SelectTrigger id="payment-terms">
          <SelectValue placeholder="Select payment terms">
            {value && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{getPaymentTermsLabel(value)}</span>
                {getPaymentTermsDays(value) > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {getPaymentTermsDays(value)} days
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_TERMS.map((terms) => {
            const days = getPaymentTermsDays(terms)
            return (
              <SelectItem key={terms} value={terms.toString()}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span>{getPaymentTermsLabel(terms)}</span>
                  {days > 0 ? (
                    <Badge variant="outline">{days} days</Badge>
                  ) : (
                    <Badge variant="secondary">Immediate</Badge>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {showDueDate && dueDate && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Due date: <span className="font-medium">{dueDate}</span>
        </p>
      )}
    </div>
  )
}

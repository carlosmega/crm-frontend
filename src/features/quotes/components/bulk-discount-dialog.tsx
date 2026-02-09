'use client'

import { useState } from 'react'
import { toast } from 'sonner'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { QuoteDetail } from '../types'
import { formatCurrency } from '../utils/quote-calculations'

interface BulkDiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLines: QuoteDetail[]
  onApply: (discountType: 'percentage' | 'amount', value: number) => void
}

/**
 * Bulk Discount Dialog
 *
 * Permite aplicar descuento a múltiples Quote Lines
 * - Por porcentaje (ej: 10% a todas)
 * - Por monto fijo (ej: $50 a todas)
 */
export function BulkDiscountDialog({
  open,
  onOpenChange,
  selectedLines,
  onApply,
}: BulkDiscountDialogProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(0)

  // Calcular preview de impacto
  const totalBaseAmount = selectedLines.reduce((sum, line) => {
    return sum + (line.quantity * line.priceperunit)
  }, 0)

  const currentTotalDiscount = selectedLines.reduce((sum, line) => {
    return sum + (line.manualdiscountamount || 0)
  }, 0)

  let newTotalDiscount = 0
  if (discountType === 'percentage') {
    newTotalDiscount = totalBaseAmount * (discountValue / 100)
  } else {
    newTotalDiscount = discountValue * selectedLines.length
  }

  const handleApply = () => {
    if (discountValue <= 0) {
      toast.warning('Discount must be greater than 0')
      return
    }

    if (discountType === 'percentage' && discountValue > 100) {
      toast.warning('Percentage cannot exceed 100%')
      return
    }

    onApply(discountType, discountValue)
    onOpenChange(false)
    setDiscountValue(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Bulk Discount</DialogTitle>
          <DialogDescription>
            Apply discount to {selectedLines.length} selected {selectedLines.length === 1 ? 'item' : 'items'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Discount Type Selection */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value) => setDiscountType(value as 'percentage' | 'amount')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="font-normal cursor-pointer">
                  Percentage (applies % to each line's base amount)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="amount" id="amount" />
                <Label htmlFor="amount" className="font-normal cursor-pointer">
                  Fixed Amount (applies same $ to each line)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value Input */}
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </Label>
            <div className="relative">
              <Input
                id="discount-value"
                type="number"
                min="0"
                max={discountType === 'percentage' ? 100 : undefined}
                step={discountType === 'percentage' ? 1 : 0.01}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="pr-8"
                placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 50.00'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {discountType === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="text-sm font-medium">Preview</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Base Amount:</span>
                <span className="font-medium">{formatCurrency(totalBaseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Discount:</span>
                <span className="text-destructive">-{formatCurrency(currentTotalDiscount)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-muted-foreground">New Discount:</span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(newTotalDiscount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difference:</span>
                <span className={newTotalDiscount > currentTotalDiscount ? 'text-orange-600' : 'text-green-600'}>
                  {newTotalDiscount > currentTotalDiscount ? '+' : ''}
                  {formatCurrency(newTotalDiscount - currentTotalDiscount)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          {discountType === 'amount' && (
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded p-2">
              <strong>Note:</strong> Fixed amount will be applied to each line individually.
              Total discount = ${discountValue.toFixed(2)} × {selectedLines.length} = {formatCurrency(discountValue * selectedLines.length)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={discountValue <= 0}>
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

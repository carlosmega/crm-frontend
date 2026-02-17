'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useActivateQuote } from '../hooks/use-quote-mutations'
import type { Quote, ActivateQuoteDto } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteActivateDialogProps {
  quote: Quote
  quoteLineCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Quote Activate Dialog
 *
 * Diálogo para activar quote (Draft → Active)
 * Valida que tenga líneas de productos
 */
export function QuoteActivateDialog({
  quote,
  quoteLineCount,
  open,
  onOpenChange,
  onSuccess,
}: QuoteActivateDialogProps) {
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')
  const { mutate: activateQuote, isPending } = useActivateQuote()
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ActivateQuoteDto>({
    defaultValues: {
      effectivefrom: quote.effectivefrom,
      effectiveto: quote.effectiveto,
    },
  })

  const handleActivate = (data: ActivateQuoteDto) => {
    // Validation - separate errors (blocking) from warnings (permissive)
    const errors: string[] = []
    const warnings: string[] = []

    // PERMISSIVE: Quote lines and total amount are warnings, not errors
    if (quoteLineCount === 0) {
      warnings.push(t('dialog.activate.noProductLines'))
    }

    if (quote.totalamount <= 0) {
      warnings.push(t('dialog.activate.zeroAmount'))
    }

    // BLOCKING: Date validations remain as errors
    if (!data.effectivefrom) {
      errors.push(t('dialog.activate.effectiveFromRequired'))
    }

    if (!data.effectiveto) {
      errors.push(t('dialog.activate.effectiveToRequired'))
    }

    if (data.effectivefrom && data.effectiveto) {
      const fromDate = new Date(data.effectivefrom)
      const toDate = new Date(data.effectiveto)

      if (toDate <= fromDate) {
        errors.push(t('dialog.activate.effectiveToAfter'))
      }
    }

    setValidationWarnings(warnings)

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])

    activateQuote(
      { id: quote.quoteid, data },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  const handleCancel = () => {
    reset()
    setValidationErrors([])
    setValidationWarnings([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.activate.title')}</DialogTitle>
          <DialogDescription>
            {t('dialog.activate.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleActivate)}>
          <div className="space-y-4 py-4">
            {/* Quote Summary */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.activate.quoteName')}</span>
                  <span className="font-medium">{quote.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.activate.productLines')}</span>
                  <span className="font-medium">{quoteLineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.activate.totalAmount')}</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(quote.totalamount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-destructive mb-2">
                      {t('dialog.activate.cannotActivate')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Warnings (Permissive) */}
            {validationWarnings.length > 0 && (
              <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-yellow-700 mb-2">
                      {t('dialog.activate.warningTitle')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-yellow-600 mt-2">
                      {t('dialog.activate.warningHint')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Period */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="effectivefrom">{t('dialog.activate.effectiveFrom')}</Label>
                <Controller
                  name="effectivefrom"
                  control={control}
                  rules={{ required: t('dialog.activate.effectiveFromRequired') }}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      placeholder="Select start date"
                    />
                  )}
                />
                {errors.effectivefrom && (
                  <p className="text-sm text-destructive">
                    {errors.effectivefrom.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveto">{t('dialog.activate.effectiveTo')}</Label>
                <Controller
                  name="effectiveto"
                  control={control}
                  rules={{ required: t('dialog.activate.effectiveToRequired') }}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      placeholder="Select end date"
                    />
                  )}
                />
                {errors.effectiveto && (
                  <p className="text-sm text-destructive">
                    {errors.effectiveto.message}
                  </p>
                )}
              </div>
            </div>

            {/* Success Preview */}
            {validationErrors.length === 0 && quoteLineCount > 0 && (
              <div className="rounded-lg border border-primary bg-primary/10 p-4">
                <div className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-primary mb-1">
                      {t('dialog.activate.readyToActivate')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('dialog.activate.readyDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              {tc('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending || validationErrors.length > 0}
            >
              {isPending ? t('dialog.activate.activating') : t('dialog.activate.activateButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

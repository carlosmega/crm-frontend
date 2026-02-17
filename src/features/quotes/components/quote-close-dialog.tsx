'use client'

import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useWinQuote, useLoseQuote } from '../hooks/use-quote-mutations'
import type { Quote, CloseQuoteDto } from '../types'
import { formatCurrency } from '../utils/quote-calculations'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteCloseDialogProps {
  quote: Quote
  action: 'win' | 'lose'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Quote Close Dialog
 *
 * Diálogo para Win o Lose quote
 */
export function QuoteCloseDialog({
  quote,
  action,
  open,
  onOpenChange,
  onSuccess,
}: QuoteCloseDialogProps) {
  const { mutate: winQuote, isPending: isWinning } = useWinQuote()
  const { mutate: loseQuote, isPending: isLosing } = useLoseQuote()
  const { t } = useTranslation('quotes')
  const { t: tc } = useTranslation('common')

  const isPending = isWinning || isLosing

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CloseQuoteDto>()

  const handleClose = (data: CloseQuoteDto) => {
    if (action === 'win') {
      winQuote(
        { id: quote.quoteid, data },
        {
          onSuccess: () => {
            reset()
            onOpenChange(false)
            onSuccess?.()
          },
        }
      )
    } else {
      loseQuote(
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
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  const isWin = action === 'win'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isWin ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                {t('dialog.close.winTitle')}
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-destructive" />
                {t('dialog.close.loseTitle')}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isWin
              ? quote.opportunityid
                ? t('dialog.close.winDescriptionWithOpp')
                : t('dialog.close.winDescription')
              : t('dialog.close.loseDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleClose)}>
          <div className="space-y-4 py-4">
            {/* Quote Summary */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.close.quoteName')}</span>
                  <span className="font-medium">{quote.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.close.quoteNumber')}</span>
                  <span className="font-medium">{quote.quotenumber || tc('notApplicable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dialog.close.totalAmount')}</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(quote.totalamount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Win Message */}
            {isWin && (
              <div className="rounded-lg border border-green-600 bg-green-50 dark:bg-green-950 p-4">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>{t('dialog.close.congratulations')}</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-green-900 dark:text-green-100 mt-2 space-y-1">
                  <li>{t('dialog.close.markAsWon')}</li>
                  <li>{t('dialog.close.updateOpportunity')}</li>
                  <li>{t('dialog.close.createOrder', { amount: formatCurrency(quote.totalamount) })}</li>
                  <li>{t('dialog.close.copyLines')}</li>
                </ul>
              </div>
            )}

            {/* Closing Notes */}
            <div className="space-y-2">
              <Label htmlFor="closingnotes">
                {isWin ? t('dialog.close.closingNotes') : t('dialog.close.reasonForLosing')}
              </Label>
              <Textarea
                id="closingnotes"
                {...register('closingnotes', {
                  required: !isWin ? 'Please provide a reason for losing this quote' : false,
                })}
                placeholder={
                  isWin
                    ? t('dialog.close.winNotesPlaceholder')
                    : t('dialog.close.losePlaceholder')
                }
                rows={4}
              />
            </div>
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
              disabled={isPending}
              variant={isWin ? 'default' : 'destructive'}
            >
              {isPending
                ? isWin
                  ? t('dialog.close.winning')
                  : t('dialog.close.closing')
                : isWin
                ? t('dialog.close.winButton')
                : t('dialog.close.loseButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

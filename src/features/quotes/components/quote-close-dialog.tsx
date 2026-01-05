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
                Win Quote
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-destructive" />
                Lose Quote
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isWin
              ? quote.opportunityid
                ? 'Mark this quote as won. The linked Opportunity will be automatically closed as Won. You can then create an Order from the quote detail page.'
                : 'Mark this quote as won. You can then create an Order from the quote detail page.'
              : 'Mark this quote as lost. You can optionally provide a reason for losing this quote.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleClose)}>
          <div className="space-y-4 py-4">
            {/* Quote Summary */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote Name:</span>
                  <span className="font-medium">{quote.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote Number:</span>
                  <span className="font-medium">{quote.quotenumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
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
                  <strong>Congratulations!</strong> Winning this quote will:
                </p>
                <ul className="list-disc list-inside text-sm text-green-900 dark:text-green-100 mt-2 space-y-1">
                  <li>Mark the quote as Won</li>
                  <li>Update the linked Opportunity to Won (if exists)</li>
                  <li>Automatically create an Order for {formatCurrency(quote.totalamount)}</li>
                  <li>Copy all quote lines to the new order</li>
                </ul>
              </div>
            )}

            {/* Closing Notes */}
            <div className="space-y-2">
              <Label htmlFor="closingnotes">
                {isWin ? 'Closing Notes (Optional)' : 'Reason for Losing *'}
              </Label>
              <Textarea
                id="closingnotes"
                {...register('closingnotes', {
                  required: !isWin ? 'Please provide a reason for losing this quote' : false,
                })}
                placeholder={
                  isWin
                    ? 'Add any notes about winning this quote...'
                    : 'Why was this quote lost? (e.g., price too high, went with competitor, timing not right...)'
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant={isWin ? 'default' : 'destructive'}
            >
              {isPending
                ? isWin
                  ? 'Winning...'
                  : 'Closing...'
                : isWin
                ? 'Win Quote'
                : 'Lose Quote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

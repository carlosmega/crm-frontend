'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useMarkInvoiceAsPaid } from '../hooks'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { canMarkAsPaid, getRemainingBalance } from '../utils'
import { formatCurrency } from '../utils/invoice-calculations'
import { useTranslation } from '@/shared/hooks/use-translation'

interface MarkInvoicePaidButtonProps {
  invoice: Invoice
}

export function MarkInvoicePaidButton({ invoice }: MarkInvoicePaidButtonProps) {
  const { t } = useTranslation('invoices')
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(
    getRemainingBalance(invoice).toString()
  )

  const markAsPaidMutation = useMarkInvoiceAsPaid()

  const canMark = canMarkAsPaid(invoice)
  const remainingBalance = getRemainingBalance(invoice)

  if (!canMark) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountPaid = parseFloat(amount)

    if (isNaN(amountPaid) || amountPaid <= 0) {
      toast({
        title: t('markPaid.invalidAmount'),
        description: t('markPaid.invalidAmountDesc'),
        variant: 'destructive',
      })
      return
    }

    if (amountPaid > remainingBalance) {
      toast({
        title: t('markPaid.amountTooHigh'),
        description: t('markPaid.amountTooHighDesc'),
        variant: 'destructive',
      })
      return
    }

    try {
      // Backend/Mock service handles payment logic and balance calculation
      await markAsPaidMutation.mutateAsync({
        id: invoice.invoiceid,
        paymentdate: new Date().toISOString().split('T')[0],
      })

      toast({
        title: t('markPaid.successToast'),
        description: t('markPaid.successDescription'),
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: t('markPaid.errorTitle'),
        description:
          error instanceof Error ? error.message : t('markPaid.errorToast'),
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <CheckCircle className="h-4 w-4 mr-2" />
        {t('markPaid.button')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('markPaid.dialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('markPaid.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('markPaid.paymentAmount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('markPaid.placeholder')}
                  required
                />
                <p className="text-sm text-gray-500">
                  {t('markPaid.remainingBalance', { amount: formatCurrency(remainingBalance) })}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={markAsPaidMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={markAsPaidMutation.isPending}>
                {markAsPaidMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {t('markPaid.recordPayment')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { XCircle, Loader2 } from 'lucide-react'
import { useCancelInvoice } from '../hooks'
import type { Invoice } from '@/core/contracts/entities/invoice'
import { canCancelInvoice } from '../utils'
import { useTranslation } from '@/shared/hooks/use-translation'

interface CancelInvoiceButtonProps {
  invoice: Invoice
}

export function CancelInvoiceButton({ invoice }: CancelInvoiceButtonProps) {
  const { t } = useTranslation('invoices')
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')

  const cancelMutation = useCancelInvoice()

  const canCancel = canCancelInvoice(invoice)

  if (!canCancel) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast({
        title: t('cancelButton.reasonRequired'),
        description: t('cancelButton.reasonError'),
        variant: 'destructive',
      })
      return
    }

    try {
      await cancelMutation.mutateAsync({
        id: invoice.invoiceid,
        reason: reason.trim(),
      })

      toast({
        title: t('cancelButton.successToast'),
        description: t('cancelButton.successDescription'),
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: t('cancelButton.errorTitle'),
        description:
          error instanceof Error ? error.message : t('cancelButton.errorToast'),
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        <XCircle className="h-4 w-4 mr-2" />
        {t('cancelButton.button')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('cancelButton.dialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('cancelButton.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t('cancelButton.reasonLabel')}</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('cancelButton.reasonPlaceholder')}
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={cancelMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {t('cancelButton.button')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

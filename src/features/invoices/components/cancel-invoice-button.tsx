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

interface CancelInvoiceButtonProps {
  invoice: Invoice
}

export function CancelInvoiceButton({ invoice }: CancelInvoiceButtonProps) {
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
        title: 'Reason required',
        description: 'Please provide a reason for canceling the invoice',
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
        title: 'Invoice canceled',
        description: 'The invoice has been successfully canceled',
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to cancel invoice',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        <XCircle className="h-4 w-4 mr-2" />
        Cancel Invoice
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cancel Invoice</DialogTitle>
              <DialogDescription>
                This action will cancel the invoice. Please provide a reason.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Cancellation Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for canceling this invoice..."
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
                Cancel Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
